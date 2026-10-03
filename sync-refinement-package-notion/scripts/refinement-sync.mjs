#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  buildPatchPlan,
  normalizeBuffer,
  sha256,
  verifyMarkdownReadback,
  verifyThreeWayPatch,
} from "./markdown-transport.mjs";

// Commands may exit immediately after printing large manifests. Synchronously drain the
// complete buffer because one write to a pipe may stop at its platform buffer size.
const writeAll = (fd, value) => {
  const buffer = Buffer.from(value);
  const retrySignal = new Int32Array(new SharedArrayBuffer(4));
  let offset = 0;
  while (offset < buffer.length) {
    try {
      offset += fs.writeSync(fd, buffer, offset, buffer.length - offset);
    } catch (error) {
      if (error?.code !== "EAGAIN") throw error;
      Atomics.wait(retrySignal, 0, 0, 1);
    }
  }
};
console.log = (...values) => writeAll(process.stdout.fd, `${values.join(" ")}\n`);
console.error = (...values) => writeAll(process.stderr.fd, `${values.join(" ")}\n`);

const cwd = process.cwd();
const argv = process.argv.slice(2);
const command = argv.shift();
const project = argv.shift();
const flag = (name) => argv.includes(name);
const value = (name) => {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
};
const fail = (message, details = {}) => {
  console.error(JSON.stringify({ ok: false, message, ...details }, null, 2));
  process.exit(1);
};

if (!command || !project) {
  fail("Usage: refinement-sync <discover|register|migrate-checkout-root|status|start|publish|reconcile|recover|baseline|audit> <project> [options]");
}

const registryPath = path.resolve(
  cwd,
  value("--registry") || "artifacts/_local/notion-sync/projects.json",
);
const portableRelative = (candidate, label) => {
  const absolute = path.resolve(cwd, candidate);
  const relative = path.relative(cwd, absolute);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    fail(`${label} must be inside the current workspace`, { path: candidate });
  }
  return relative;
};
const canonicalCheckoutRoot = (projectName, packageKind = "project") =>
  ["shared-contract", "shared-standard"].includes(packageKind)
    ? `artifacts/_shared/${projectName}`
    : `artifacts/${projectName}`;
const normalizeWorkspacePath = (candidate) =>
  path.relative(cwd, path.resolve(cwd, candidate)).split(path.sep).join("/");
const isOperationalLocalRoot = (candidate) =>
  normalizeWorkspacePath(candidate) === "artifacts/_local" ||
  normalizeWorkspacePath(candidate).startsWith("artifacts/_local/");
const isCanonicalCheckoutRoot = (candidate, packageKind = "project") => {
  const relative = normalizeWorkspacePath(candidate);
  if (!relative.startsWith("artifacts/") || isOperationalLocalRoot(relative)) return false;
  return ["shared-contract", "shared-standard"].includes(packageKind)
    ? relative.startsWith("artifacts/_shared/")
    : !relative.startsWith("artifacts/_shared/");
};
const readJson = (file, label) => {
  if (!file || !fs.existsSync(file)) fail(`${label} not found`, { path: file || null });
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON`, { path: file, error: error.message });
  }
};
const duplicateValues = (values) => {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of values) {
    if (seen.has(item)) duplicates.add(item);
    seen.add(item);
  }
  return [...duplicates];
};

if (command === "discover") {
  const treeArg = value("--tree");
  if (!treeArg) fail("--tree is required for discover");
  const sourceRepository = value("--source-repository");
  const sourceBranch = value("--source-branch");
  const sourceCommit = value("--source-commit");
  const sourceValues = [sourceRepository, sourceBranch, sourceCommit];
  if (sourceValues.some(Boolean) && !sourceValues.every((item) => typeof item === "string" && item.trim())) {
    fail("--source-repository, --source-branch and --source-commit must be provided together");
  }
  const tree = readJson(path.resolve(cwd, treeArg), "Page tree");
  const pages = Array.isArray(tree.pages) ? tree.pages : [];
  const errors = [];
  if (!pages.length) errors.push("page tree contains no pages");
  if (typeof tree.read_at !== "string" || !tree.read_at.trim()) {
    errors.push("page tree must include read_at");
  }
  for (const page of pages) {
    for (const field of ["id", "title"]) {
      if (typeof page[field] !== "string" || !page[field].trim()) {
        errors.push(`page is missing ${field}: ${page.id || "<unknown>"}`);
      }
    }
    if (
      page.parent_id !== undefined &&
      page.parent_id !== null &&
      (typeof page.parent_id !== "string" || !page.parent_id.trim())
    ) {
      errors.push(`page has invalid parent_id: ${page.id || "<unknown>"}`);
    }
  }
  const duplicateIds = duplicateValues(pages.map((page) => page.id).filter(Boolean));
  if (duplicateIds.length) errors.push(`duplicate page id: ${duplicateIds.join(", ")}`);
  if (errors.length) fail("Page tree validation failed", { errors });

  const byId = new Map(pages.map((page) => [page.id, page]));
  const rootId = tree.root_id;
  if (typeof rootId !== "string" || !byId.has(rootId)) {
    fail("tree.root_id missing or not present in pages");
  }
  const root = byId.get(rootId);
  const parentId = tree.parent_id || root.parent_id;
  if (typeof parentId !== "string" || !parentId.trim()) {
    fail("cannot resolve the parent page of the project root");
  }
  for (const page of pages) {
    if (page.id !== rootId && !byId.has(page.parent_id)) {
      errors.push(`parent page is missing from tree for ${page.id}`);
    }
    const visited = new Set();
    let cursor = page;
    while (cursor && byId.has(cursor.parent_id)) {
      if (visited.has(cursor.id)) {
        errors.push(`page tree contains a cycle at ${cursor.id}`);
        break;
      }
      visited.add(cursor.id);
      cursor = byId.get(cursor.parent_id);
    }
  }
  if (errors.length) fail("Page tree validation failed", { errors });

  const childrenOf = (id) => pages.filter((page) => page.parent_id === id);
  const fold = (text) =>
    String(text || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim()
      .replace(/^[^\p{Letter}\p{Number}]+/u, "");
  const uniqueChild = (parent, aliases, label, required = true) => {
    const matches = childrenOf(parent).filter((page) => aliases.includes(fold(page.title)));
    if (matches.length > 1) fail(`multiple ${label} pages found`, { pages: matches });
    if (!matches.length && required) fail(`${label} page not found`, { parent });
    return matches[0] || null;
  };
  const internal = uniqueChild(
    rootId,
    ["subpaginas internas del proyecto"],
    "internal container",
    false,
  );
  const contentParent = internal?.id || rootId;
  const packagePage = uniqueChild(contentParent, ["paquete markdown"], "Paquete Markdown");
  const auditPage = uniqueChild(
    contentParent,
    ["historial de sincronizacion"],
    "Historial de sincronización",
  );

  const units = [];
  const unclassifiedPages = [];
  const stripMarkdown = (title) => title.trim().replace(/\.md$/i, "");
  const classifyUnknown = (page, reason) =>
    unclassifiedPages.push({
      id: page.id,
      title: page.title,
      parent_id: page.parent_id,
      reason,
    });
  const packageChildren = childrenOf(packagePage.id);
  for (const child of packageChildren) {
    const folder = fold(child.title);
    if (["jira", "handoffs"].includes(folder)) {
      for (const leaf of childrenOf(child.id)) {
        const stem = stripMarkdown(leaf.title);
        if (!stem || childrenOf(leaf.id).length) {
          classifyUnknown(leaf, "derived page must be a named leaf");
          continue;
        }
        units.push({
          id: `${folder}::${stem}`,
          role: "derived",
          notion_page_id: leaf.id,
          local_path: `${folder}/${stem}.md`,
        });
      }
      continue;
    }
    const stem = stripMarkdown(child.title);
    if (/^\d{2}-/.test(stem) && !childrenOf(child.id).length) {
      units.push({
        id: stem,
        role: "canonical",
        notion_page_id: child.id,
        local_path: `${stem}.md`,
      });
    } else {
      classifyUnknown(child, "page under Paquete Markdown did not match a canonical file or supported folder");
    }
  }

  const compactId = (id) => id.replace(/-/g, "");
  const presentation = (page, kind) => ({
    id: `${kind}:${compactId(page.id)}`,
    role: "presentation",
    kind,
    title: page.title,
    notion_page_id: compactId(page.id),
    remote_path: `_presentation/${kind}/${compactId(page.id)}.md`,
    drift_policy: "review",
  });
  const presentations = [presentation(root, "cover")];
  for (const page of childrenOf(contentParent)) {
    if ([packagePage.id, auditPage.id].includes(page.id)) continue;
    if (fold(page.title).startsWith("contrato compartido")) {
      classifyUnknown(page, "shared contract requires its own manifest");
      continue;
    }
    presentations.push(
      presentation(page, /^us-[a-z0-9]+-\d+/i.test(stripMarkdown(page.title).replace(/^[^A-Za-z0-9]+/, ""))
        ? "story"
        : "auxiliary"),
    );
  }

  for (const [label, values] of [
    ["unit id", units.map((item) => item.id)],
    ["unit page", units.map((item) => compactId(item.notion_page_id))],
    ["unit path", units.map((item) => item.local_path)],
    ["presentation path", presentations.map((item) => item.remote_path)],
  ]) {
    const duplicates = duplicateValues(values);
    if (duplicates.length) errors.push(`duplicate ${label}: ${duplicates.join(", ")}`);
  }
  if (errors.length) fail("Discovery classification failed", { errors });

  const manifest = {
    schema_version: 1,
    project,
    package_kind: tree.package_kind || "project",
    ...(sourceValues.every(Boolean)
      ? {
          source_model: "github-main-v1",
          source_repository: sourceRepository,
          source_branch: sourceBranch,
          source_commit: sourceCommit,
        }
      : {}),
    notion_parent_page_id: parentId,
    notion_root_page_id: rootId,
    ...(internal ? { notion_internal_container_page_id: internal.id } : {}),
    notion_package_page_id: packagePage.id,
    audit_log_page_id: auditPage.id,
    audit_policy: "verified-events-only",
    audit_entry_mode: "append-only-child-pages",
    transport_encoding: "notion-inner-markdown-lf-v1",
    state_root: tree.state_root || `artifacts/_local/notion-sync/${project}`,
    checkout_root:
      tree.checkout_root || canonicalCheckoutRoot(project, tree.package_kind || "project"),
    discovery: {
      read_at: tree.read_at,
      unclassified_pages: unclassifiedPages,
    },
    units,
    presentations,
  };
  const hierarchy = {
    captured_from: "notion-readback",
    read_at: tree.read_at,
    notion_root_page_id: rootId,
    notion_root_parent_page_id: parentId,
    ...(internal
      ? {
          notion_internal_container_page_id: internal.id,
          notion_internal_container_parent_page_id: rootId,
        }
      : {}),
    notion_package_page_id: packagePage.id,
    notion_package_parent_page_id: contentParent,
    audit_log_page_id: auditPage.id,
    audit_log_parent_page_id: contentParent,
  };
  const result = {
    ok: true,
    operation: flag("--apply") ? "discover-apply" : "discover-preview",
    project,
    hierarchy_mode: internal ? "internal-container" : "direct-root",
    canonical: units.filter((item) => item.role === "canonical").length,
    derived: units.filter((item) => item.role === "derived").length,
    presentations: presentations.length,
    classification_complete: unclassifiedPages.length === 0,
    unclassified_pages: unclassifiedPages,
    candidate_manifest: flag("--apply") ? undefined : manifest,
    hierarchy_evidence: flag("--apply") ? undefined : hierarchy,
  };
  if (!flag("--apply")) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }
  const outArg = value("--out");
  if (!outArg) fail("--out is required with discover --apply");
  const outDir = path.resolve(cwd, outArg);
  const manifestOut = path.join(outDir, "candidate-manifest.json");
  const hierarchyOut = path.join(outDir, "hierarchy-evidence.json");
  if (!flag("--force") && (fs.existsSync(manifestOut) || fs.existsSync(hierarchyOut))) {
    fail("Discovery output already exists; use --force to replace it", {
      manifest_file: manifestOut,
      hierarchy_evidence_file: hierarchyOut,
    });
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(manifestOut, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(hierarchyOut, `${JSON.stringify(hierarchy, null, 2)}\n`);
  console.log(
    JSON.stringify(
      { ...result, manifest_file: manifestOut, hierarchy_evidence_file: hierarchyOut },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (command === "register") {
  const candidateArg = value("--manifest");
  const hierarchyArg = value("--hierarchy-evidence");
  if (!candidateArg || !hierarchyArg) {
    fail("--manifest and --hierarchy-evidence are required for register");
  }
  const candidatePath = path.resolve(cwd, candidateArg);
  const hierarchyPath = path.resolve(cwd, hierarchyArg);
  const candidate = readJson(candidatePath, "Manifest candidate");
  const hierarchy = readJson(hierarchyPath, "Hierarchy evidence");
  const errors = [];
  const unresolvedDiscovery = candidate.discovery?.unclassified_pages;
  if (Array.isArray(unresolvedDiscovery) && unresolvedDiscovery.length) {
    errors.push(
      `manifest contains ${unresolvedDiscovery.length} unclassified discovery page(s)`,
    );
  }
  const required = [
    "notion_parent_page_id",
    "notion_root_page_id",
    "notion_package_page_id",
    "audit_log_page_id",
    "state_root",
    "checkout_root",
  ];
  if (candidate.project !== project) errors.push("manifest project must match the command project");
  for (const field of required) {
    if (typeof candidate[field] !== "string" || !candidate[field].trim()) {
      errors.push(`missing manifest field: ${field}`);
    }
  }
  const sourceFields = ["source_repository", "source_branch", "source_commit"];
  const presentSourceFields = sourceFields.filter(
    (field) => typeof candidate[field] === "string" && candidate[field].trim(),
  );
  if (candidate.source_model !== undefined && candidate.source_model !== "github-main-v1") {
    errors.push(`unsupported source_model: ${candidate.source_model}`);
  }
  if (candidate.source_model === "github-main-v1" || presentSourceFields.length > 0) {
    if (candidate.source_model !== "github-main-v1") {
      errors.push("source_model must be github-main-v1 when GitHub source fields are present");
    }
    for (const field of sourceFields) {
      if (typeof candidate[field] !== "string" || !candidate[field].trim()) {
        errors.push(`missing manifest field: ${field}`);
      }
    }
  }
  if (candidate.checkout_root && !isCanonicalCheckoutRoot(candidate.checkout_root, candidate.package_kind || "project")) {
    errors.push("checkout_root must be a canonical artifacts project path outside artifacts/_local");
  }
  const internalContainer = candidate.notion_internal_container_page_id;
  if (
    internalContainer !== undefined &&
    (typeof internalContainer !== "string" || !internalContainer.trim())
  ) {
    errors.push("notion_internal_container_page_id must be a non-empty string when present");
  }
  if (!Array.isArray(candidate.units) || candidate.units.length === 0) {
    errors.push("manifest must contain at least one unit");
  }
  const units = Array.isArray(candidate.units) ? candidate.units : [];
  for (const unit of units) {
    for (const field of ["id", "role", "notion_page_id", "local_path"]) {
      if (typeof unit[field] !== "string" || !unit[field].trim()) {
        errors.push(`unit is missing ${field}: ${unit.id || "<unknown>"}`);
      }
    }
    if (unit.role && !["canonical", "derived"].includes(unit.role)) {
      errors.push(`unsupported unit role: ${unit.role}`);
    }
    if (unit.local_path) portableRelative(unit.local_path, `unit ${unit.id} local_path`);
  }
  for (const [label, values] of [
    ["unit id", units.map((item) => item.id)],
    ["unit page", units.map((item) => item.notion_page_id)],
    ["unit path", units.map((item) => item.local_path)],
  ]) {
    const duplicates = duplicateValues(values.filter(Boolean));
    if (duplicates.length) errors.push(`duplicate ${label}: ${duplicates.join(", ")}`);
  }
  const presentations = Array.isArray(candidate.presentations) ? candidate.presentations : [];
  for (const presentation of presentations) {
    if (presentation.role !== "presentation") {
      errors.push(`presentation ${presentation.id || "<unknown>"} must use role presentation`);
    }
    for (const field of ["id", "notion_page_id", "remote_path"]) {
      if (typeof presentation[field] !== "string" || !presentation[field].trim()) {
        errors.push(`presentation is missing ${field}: ${presentation.id || "<unknown>"}`);
      }
    }
  }
  const contentParentPageId = internalContainer || candidate.notion_root_page_id;
  const expectedHierarchy = {
    notion_root_page_id: candidate.notion_root_page_id,
    notion_root_parent_page_id: candidate.notion_parent_page_id,
    notion_package_page_id: candidate.notion_package_page_id,
    notion_package_parent_page_id: contentParentPageId,
    audit_log_page_id: candidate.audit_log_page_id,
    audit_log_parent_page_id: contentParentPageId,
  };
  if (internalContainer) {
    expectedHierarchy.notion_internal_container_page_id = internalContainer;
    expectedHierarchy.notion_internal_container_parent_page_id =
      candidate.notion_root_page_id;
  }
  for (const [field, expected] of Object.entries(expectedHierarchy)) {
    if (hierarchy[field] !== expected) {
      errors.push(`hierarchy evidence mismatch for ${field}`);
    }
  }
  const reservedPages = new Set([
    candidate.notion_parent_page_id,
    candidate.notion_root_page_id,
    internalContainer,
    candidate.notion_package_page_id,
    candidate.audit_log_page_id,
  ].filter(Boolean));
  for (const pageId of units.map((item) => item.notion_page_id)) {
    if (reservedPages.has(pageId)) errors.push(`content page reuses a reserved page id: ${pageId}`);
  }
  const comparablePageId = (pageId) => String(pageId || "").replace(/-/g, "").toLowerCase();
  for (const presentation of presentations) {
    const pageId = presentation.notion_page_id;
    const isRootCover =
      presentation.kind === "cover" &&
      comparablePageId(pageId) === comparablePageId(candidate.notion_root_page_id);
    if (reservedPages.has(pageId) && !isRootCover) {
      errors.push(`content page reuses a reserved page id: ${pageId}`);
    }
  }
  if (errors.length) fail("Registration validation failed", { errors });

  const registry = fs.existsSync(registryPath)
    ? readJson(registryPath, "Project registry")
    : { schema_version: 1, projects: {} };
  registry.projects ||= {};
  const manifestFile = portableRelative(candidatePath, "Manifest candidate");
  const identity = {
    manifest_file: manifestFile,
    state_root: candidate.state_root,
    checkout_root: candidate.checkout_root,
    notion_parent_page_id: candidate.notion_parent_page_id,
    notion_root_page_id: candidate.notion_root_page_id,
    ...(internalContainer
      ? { notion_internal_container_page_id: internalContainer }
      : {}),
    notion_package_page_id: candidate.notion_package_page_id,
    audit_log_page_id: candidate.audit_log_page_id,
    ...(candidate.source_model === "github-main-v1"
      ? {
          source_model: candidate.source_model,
          source_repository: candidate.source_repository,
          source_branch: candidate.source_branch,
          source_commit: candidate.source_commit,
        }
      : {}),
  };
  const existing = registry.projects[project];
  const identityConflicts = existing
    ? Object.entries(identity)
        .filter(([field, expected]) =>
          existing[field] !== undefined && existing[field] !== expected)
        .map(([field]) => field)
    : [];
  if (identityConflicts.length) {
    fail("Project is already registered with different identity", {
      conflicts: identityConflicts,
      existing,
      proposed: identity,
    });
  }
  const proposed = existing ? { ...existing, ...identity } : identity;
  const result = {
    ok: true,
    operation: flag("--apply") ? "register-apply" : "register-preview",
    project,
    registry: registryPath,
    entry: proposed,
    units: units.length,
    presentations: presentations.length,
    hierarchy_verified: true,
    hierarchy_mode: internalContainer ? "internal-container" : "direct-root",
  };
  if (flag("--preview")) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }
  if (flag("--apply")) {
    registry.projects[project] = proposed;
    fs.mkdirSync(path.dirname(registryPath), { recursive: true });
    fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }
  fail("Use register --preview or --apply");
}

if (!fs.existsSync(registryPath)) fail("Project registry not found", { registryPath });
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const entry = registry.projects?.[project];
if (!entry) fail("Project is not registered", { project });
const manifestPath = path.resolve(cwd, entry.manifest_file);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const stateRoot = path.resolve(cwd, manifest.state_root || entry.state_root);
const checkoutRoot = path.resolve(cwd, manifest.checkout_root || entry.checkout_root);
const remoteDir = value("--remote-dir") ? path.resolve(cwd, value("--remote-dir")) : null;

const normalize = normalizeBuffer;
const sha = sha256;
const fileSha256 = (file) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const requirePlanText = (item, field, errors, label) => {
  if (typeof item?.[field] !== "string" || !item[field].trim()) {
    errors.push(`${label} must include ${field}`);
  }
};
const validatePlanEntries = ({ entries, label, allowedClassifications, knownIds, errors }) => {
  if (!Array.isArray(entries)) {
    errors.push(`${label} must be an array`);
    return [];
  }
  const ids = [];
  for (const item of entries) {
    requirePlanText(item, "id", errors, label);
    requirePlanText(item, "classification", errors, `${label} ${item?.id || "<unknown>"}`);
    requirePlanText(item, "reason", errors, `${label} ${item?.id || "<unknown>"}`);
    if (item?.id) ids.push(item.id);
    if (item?.id && !knownIds.has(item.id)) errors.push(`${label} contains unknown id: ${item.id}`);
    if (item?.classification && !allowedClassifications.includes(item.classification)) {
      errors.push(`${label} has unsupported classification for ${item.id}: ${item.classification}`);
    }
  }
  const duplicates = duplicateValues(ids);
  if (duplicates.length) errors.push(`${label} contains duplicate ids: ${duplicates.join(", ")}`);
  return ids;
};
const verifyReadback = (expected, actual, options = {}) =>
  verifyMarkdownReadback(expected, actual, { manifest, ...options });
const read = (file) => (fs.existsSync(file) ? fs.readFileSync(file) : null);
const write = (file, body) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
};
const safeRel = (candidate) => {
  const normalized = path.normalize(candidate);
  if (path.isAbsolute(normalized) || normalized.startsWith("..")) {
    fail("Unsafe manifest path", { path: candidate });
  }
  return normalized;
};
const unitPath = (root, unit) =>
  path.join(root, safeRel(unit.remote_path || unit.local_path));
const baseFile = path.join(stateRoot, "base.json");
const base = fs.existsSync(baseFile)
  ? JSON.parse(fs.readFileSync(baseFile, "utf8"))
  : { units: [] };
const baseMap = new Map((base.units || []).map((unit) => [unit.id, unit.sha256]));
const baseSourceMap = new Map(
  (base.units || []).map((unit) => [unit.id, unit.source_sha256 || null]),
);
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");

const actualCheckoutRootRelative = normalizeWorkspacePath(checkoutRoot);
const configuredCanonicalRoot = manifest.canonical_checkout_root || entry.canonical_checkout_root;
const expectedCheckoutRootRelative = configuredCanonicalRoot
  ? normalizeWorkspacePath(configuredCanonicalRoot)
  : isCanonicalCheckoutRoot(actualCheckoutRootRelative, manifest.package_kind || "project")
    ? actualCheckoutRootRelative
    : canonicalCheckoutRoot(project, manifest.package_kind || "project");

if (command === "migrate-checkout-root") {
  const targetRelative = value("--target")
    ? portableRelative(value("--target"), "Migration target")
    : expectedCheckoutRootRelative;
  if (!isCanonicalCheckoutRoot(targetRelative, manifest.package_kind || "project")) {
    fail("Migration target must be a canonical artifacts project path outside artifacts/_local", {
      received: targetRelative,
      package_kind: manifest.package_kind || "project",
    });
  }
  if (configuredCanonicalRoot && normalizeWorkspacePath(targetRelative) !== expectedCheckoutRootRelative) {
    fail("Migration target differs from the configured canonical root", {
      expected: expectedCheckoutRootRelative,
      received: targetRelative,
    });
  }
  if (!isOperationalLocalRoot(actualCheckoutRootRelative)) {
    fail("Registered checkout_root is not a legacy operational root", {
      checkout_root: actualCheckoutRootRelative,
      expected: expectedCheckoutRootRelative,
    });
  }
  const targetRoot = path.resolve(cwd, targetRelative);
  const migrationRows = manifest.units.map((unit) => {
    const legacyBody = read(unitPath(checkoutRoot, unit));
    const targetBody = read(unitPath(targetRoot, unit));
    const baseSha = baseMap.get(unit.id) || unit.sha256 || null;
    const sourceSha = baseSourceMap.get(unit.id) || unit.source_sha256 || baseSha;
    const legacySha = legacyBody ? sha(legacyBody) : null;
    const targetSha = targetBody ? sha(targetBody) : null;
    let state;
    if (!targetBody) state = "target_missing";
    else if (!legacyBody && sourceSha && targetSha === sourceSha) state = "target_only";
    else if (!legacyBody && !sourceSha) state = "target_only_unverified";
    else if (!legacyBody) state = "target_only_changed";
    else if (legacySha === targetSha) state = "aligned";
    else if (baseSha && sourceSha && legacySha === baseSha && targetSha === sourceSha) {
      state = "aligned_dual_representation";
    }
    else if (baseSha && legacySha === baseSha && targetSha !== baseSha) state = "target_changed";
    else if (baseSha && targetSha === baseSha && legacySha !== baseSha) state = "legacy_only_change";
    else state = "diverged";
    return {
      id: unit.id,
      local_path: unit.local_path,
      base_sha256: baseSha,
      base_source_sha256: sourceSha,
      legacy_sha256: legacySha,
      target_sha256: targetSha,
      state,
      blocking: [
        "target_missing",
        "target_only_unverified",
        "target_only_changed",
        "legacy_only_change",
        "diverged",
      ].includes(state),
    };
  });
  const blockers = migrationRows.filter((row) => row.blocking);
  const result = {
    ok: blockers.length === 0,
    operation: flag("--apply")
      ? "migrate-checkout-root-apply"
      : "migrate-checkout-root-preview",
    project,
    legacy_checkout_root: actualCheckoutRootRelative,
    canonical_checkout_root: normalizeWorkspacePath(targetRelative),
    rows: migrationRows,
    blockers,
    notion_write: false,
  };
  if (flag("--preview")) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(blockers.length ? 2 : 0);
  }
  if (flag("--apply")) {
    if (blockers.length) fail("Checkout-root migration requires reconciliation", result);
    if (!flag("--ack-canonical-root") || !value("--reason")) {
      fail("--ack-canonical-root and --reason are required");
    }
    const backupRoot = path.join(stateRoot, "checkout-root-migrations", stamp());
    write(path.join(backupRoot, "manifest.json"), Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
    write(path.join(backupRoot, "projects.json"), Buffer.from(`${JSON.stringify(registry, null, 2)}\n`));
    manifest.checkout_root = normalizeWorkspacePath(targetRelative);
    manifest.canonical_checkout_root = normalizeWorkspacePath(targetRelative);
    manifest.checkout_root_migrated_at = new Date().toISOString();
    manifest.checkout_root_migration_reason = value("--reason");
    registry.projects[project] = {
      ...entry,
      checkout_root: normalizeWorkspacePath(targetRelative),
      canonical_checkout_root: normalizeWorkspacePath(targetRelative),
    };
    write(manifestPath, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
    write(registryPath, Buffer.from(`${JSON.stringify(registry, null, 2)}\n`));
    console.log(JSON.stringify({ ...result, ok: true, backup: backupRoot }, null, 2));
    process.exit(0);
  }
  fail("Use migrate-checkout-root --preview or --apply");
}

if (
  !isCanonicalCheckoutRoot(actualCheckoutRootRelative, manifest.package_kind || "project") ||
  actualCheckoutRootRelative !== expectedCheckoutRootRelative
) {
  fail("Registered checkout_root is not the canonical project package", {
    checkout_root: actualCheckoutRootRelative,
    expected_checkout_root: expectedCheckoutRootRelative,
    next_action: `refinement-sync migrate-checkout-root ${project} --preview`,
  });
}

function recommendWriteStrategy(remote, local) {
  if (!remote || !local) return null;
  const before = normalize(remote).toString("utf8");
  const after = normalize(local).toString("utf8");
  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) {
    prefix += 1;
  }
  let suffix = 0;
  while (
    suffix < before.length - prefix &&
    suffix < after.length - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix += 1;
  }
  const changedBytes = Math.max(before.length - prefix - suffix, after.length - prefix - suffix);
  const changeRatio = after.length ? changedBytes / after.length : 1;
  const largePage = after.length >= 100_000;
  const localized = changeRatio <= 0.2;
  const candidate = largePage || localized ? buildPatchPlan(remote, local) : null;
  const writeMode = candidate?.strategy === "patch" ? "patch" : "replace";
  return {
    recommended_write_mode: writeMode,
    final_bytes: Buffer.byteLength(after),
    estimated_changed_bytes: Buffer.byteLength(after.slice(prefix, after.length - suffix)),
    estimated_change_ratio: Number(changeRatio.toFixed(4)),
    reason: candidate?.reason || (largePage ? "large-page" : localized ? "localized-delta" : "broad-delta"),
    patch_plan: writeMode === "patch" ? candidate : null,
    fallback_write_mode: writeMode === "patch" ? "replace" : null,
    verification: "full-unit-readback-required",
  };
}

function hydrateWriteStrategy(row) {
  const unit = manifest.units.find((item) => item.id === row.id);
  if (!unit) return row;
  const remote = read(unitPath(remoteDir, unit));
  const local = read(unitPath(checkoutRoot, unit));
  const strategy = recommendWriteStrategy(remote, local);
  return strategy ? { ...row, ...strategy } : row;
}

function inspect() {
  if (!remoteDir) fail("--remote-dir is required");
  const rows = manifest.units.map((unit) => {
    const local = read(unitPath(checkoutRoot, unit));
    const remote = read(unitPath(remoteDir, unit));
    const baseSha = baseMap.get(unit.id) || unit.sha256;
    const baseSourceSha =
      baseSourceMap.get(unit.id) || unit.source_sha256 || baseSha;
    const localSha = local && sha(local);
    const remoteSha = remote && sha(remote);
    // The editable Markdown and Notion's native readback are two representations
    // of the same unit. During legacy migrations some canonical files may already
    // contain the transport representation, so either verified baseline is safe.
    const localChanged =
      !!localSha && localSha !== baseSourceSha && localSha !== baseSha;
    const remoteChanged = !!remoteSha && remoteSha !== baseSha;
    let state = "unchanged";
    if (!local) state = "local_missing";
    else if (!remote) state = "remote_missing";
    else if (localChanged && remoteChanged) {
      state = localSha === remoteSha ? "same_change" : "conflict";
    } else if (localChanged) state = "local_changed";
    else if (remoteChanged) state = "remote_changed";
    const strategy = state === "local_changed" ? recommendWriteStrategy(remote, local) : null;
    return {
      id: unit.id,
      role: unit.role,
      local_path: unit.local_path,
      base_sha256: baseSha,
      base_source_sha256: baseSourceSha,
      local_sha256: localSha || null,
      remote_sha256: remoteSha || null,
      state,
      ...(strategy || {}),
    };
  });
  const presentations = (manifest.presentations || []).map((presentation) => {
    const remote = read(unitPath(remoteDir, presentation));
    const remoteSha = remote && sha(remote);
    const baseSha = presentation.base_sha256 || null;
    return {
      id: presentation.id,
      role: "presentation",
      remote_path: presentation.remote_path,
      base_sha256: baseSha,
      remote_sha256: remoteSha || null,
      state: !remote
        ? "remote_missing"
        : !baseSha
          ? "unbaselined"
          : remoteSha === baseSha
            ? "unchanged"
            : "presentation_drift",
      drift_policy: presentation.drift_policy || "review",
    };
  });
  return {
    rows,
    presentations,
    conflicts: rows.filter((row) => ["conflict", "remote_missing"].includes(row.state)),
    presentation_drift: presentations.filter((item) => item.state !== "unchanged"),
  };
}

function loadWritePlan(report) {
  const planArg = value("--write-plan");
  const allLocalChanges = flag("--all-local-changes");
  if (planArg && allLocalChanges) {
    fail("--write-plan and --all-local-changes are mutually exclusive");
  }
  const changed = report.rows.filter((item) => item.state === "local_changed");
  if (!planArg) {
    if (!allLocalChanges) {
      fail("Publish scope approval is required", {
        next_action: "Provide --write-plan <plan.json> or explicitly use --all-local-changes",
        detected_local_changes: changed,
      });
    }
    return {
      mode: "all-local-changes",
      file: null,
      sha256: null,
      units: changed,
      excluded: [],
    };
  }

  const planRelative = portableRelative(planArg, "Write plan");
  const planPath = path.resolve(cwd, planRelative);
  const plan = readJson(planPath, "Write plan");
  const errors = [];
  if (plan.schema_version !== 1) errors.push("write plan schema_version must be 1");
  if (plan.project !== project) errors.push(`write plan project must be ${project}`);
  if (plan.base_snapshot !== manifest.snapshot) {
    errors.push("write plan base_snapshot does not match the current manifest snapshot");
  }
  const changedById = new Map(changed.map((item) => [item.id, item]));
  const knownIds = new Set(manifest.units.map((item) => item.id));
  const selectedIds = validatePlanEntries({
    entries: plan.units,
    label: "write plan units",
    allowedClassifications: ["approved_scope", "required_derivative"],
    knownIds,
    errors,
  });
  const excludedIds = validatePlanEntries({
    entries: plan.excluded_units,
    label: "write plan excluded_units",
    allowedClassifications: ["historical_out_of_scope", "deferred", "rejected"],
    knownIds,
    errors,
  });
  const overlap = selectedIds.filter((id) => excludedIds.includes(id));
  if (overlap.length) errors.push(`write plan ids cannot be selected and excluded: ${overlap.join(", ")}`);
  const classifiedIds = new Set([...selectedIds, ...excludedIds]);
  const unclassified = changed.filter((item) => !classifiedIds.has(item.id)).map((item) => item.id);
  if (unclassified.length) {
    errors.push(`write plan leaves local changes unclassified: ${unclassified.join(", ")}`);
  }
  const staleIds = [...classifiedIds].filter((id) => !changedById.has(id));
  if (staleIds.length) errors.push(`write plan includes units that are not local_changed: ${staleIds.join(", ")}`);

  const validateHashes = (entries, label) => {
    for (const item of entries || []) {
      const current = changedById.get(item.id);
      if (!current) continue;
      if (item.local_sha256 !== current.local_sha256) {
        errors.push(`${label} local_sha256 is stale for ${item.id}`);
      }
      if (item.remote_sha256 !== current.remote_sha256) {
        errors.push(`${label} remote_sha256 is stale for ${item.id}`);
      }
    }
  };
  validateHashes(plan.units, "write plan units");
  validateHashes(plan.excluded_units, "write plan excluded_units");
  if (errors.length) {
    fail("Write plan validation failed", {
      errors,
      plan: planPath,
      detected_local_changes: changed.map((item) => item.id),
    });
  }

  const selectedById = new Map(plan.units.map((item) => [item.id, item]));
  const excludedById = new Map(plan.excluded_units.map((item) => [item.id, item]));
  return {
    mode: "approved-plan",
    file: planRelative,
    sha256: fileSha256(planPath),
    units: changed
      .filter((item) => selectedById.has(item.id))
      .map((item) => ({
        ...item,
        scope_classification: selectedById.get(item.id).classification,
        scope_reason: selectedById.get(item.id).reason,
      })),
    excluded: changed
      .filter((item) => excludedById.has(item.id))
      .map((item) => ({
        ...item,
        scope_classification: excludedById.get(item.id).classification,
        scope_reason: excludedById.get(item.id).reason,
      })),
  };
}

function loadPresentationPlan(report) {
  const planArg = value("--presentation-plan");
  const candidates = report.presentations.filter((item) =>
    ["presentation_drift", "unbaselined"].includes(item.state),
  );
  if (!candidates.length && !planArg) {
    return { file: null, sha256: null, selected: [], excluded: [] };
  }
  if (!planArg) {
    fail("Presentation baseline plan is required", {
      next_action: "Classify every candidate and provide --presentation-plan <plan.json>",
      presentation_candidates: candidates,
    });
  }

  const planRelative = portableRelative(planArg, "Presentation plan");
  const planPath = path.resolve(cwd, planRelative);
  const plan = readJson(planPath, "Presentation plan");
  const errors = [];
  if (plan.schema_version !== 1) errors.push("presentation plan schema_version must be 1");
  if (plan.project !== project) errors.push(`presentation plan project must be ${project}`);
  if (plan.base_snapshot !== manifest.snapshot) {
    errors.push("presentation plan base_snapshot does not match the current manifest snapshot");
  }
  const candidateById = new Map(candidates.map((item) => [item.id, item]));
  const knownIds = new Set(candidates.map((item) => item.id));
  const selectedIds = validatePlanEntries({
    entries: plan.presentations,
    label: "presentation plan presentations",
    allowedClassifications: ["equivalent"],
    knownIds,
    errors,
  });
  const excludedIds = validatePlanEntries({
    entries: plan.excluded_presentations,
    label: "presentation plan excluded_presentations",
    allowedClassifications: ["real_difference", "blocked", "deferred"],
    knownIds,
    errors,
  });
  const overlap = selectedIds.filter((id) => excludedIds.includes(id));
  if (overlap.length) {
    errors.push(`presentation ids cannot be selected and excluded: ${overlap.join(", ")}`);
  }
  const classifiedIds = new Set([...selectedIds, ...excludedIds]);
  const unclassified = candidates.filter((item) => !classifiedIds.has(item.id)).map((item) => item.id);
  if (unclassified.length) {
    errors.push(`presentation plan leaves candidates unclassified: ${unclassified.join(", ")}`);
  }

  const validateHashes = (entries, label) => {
    for (const item of entries || []) {
      const current = candidateById.get(item.id);
      if (!current) continue;
      if (item.remote_sha256 !== current.remote_sha256) {
        errors.push(`${label} remote_sha256 is stale for ${item.id}`);
      }
      if (!Object.prototype.hasOwnProperty.call(item, "base_sha256")) {
        errors.push(`${label} must include base_sha256 for ${item.id}`);
      } else if (item.base_sha256 !== current.base_sha256) {
        errors.push(`${label} base_sha256 is stale for ${item.id}`);
      }
    }
  };
  validateHashes(plan.presentations, "presentation plan presentations");
  validateHashes(plan.excluded_presentations, "presentation plan excluded_presentations");
  if (errors.length) {
    fail("Presentation plan validation failed", {
      errors,
      plan: planPath,
      presentation_candidates: candidates.map((item) => item.id),
    });
  }

  const selectedById = new Map(plan.presentations.map((item) => [item.id, item]));
  const excludedById = new Map(plan.excluded_presentations.map((item) => [item.id, item]));
  return {
    file: planRelative,
    sha256: fileSha256(planPath),
    selected: candidates
      .filter((item) => selectedById.has(item.id))
      .map((item) => ({ ...item, ...selectedById.get(item.id) })),
    excluded: candidates
      .filter((item) => excludedById.has(item.id))
      .map((item) => ({ ...item, ...excludedById.get(item.id) })),
  };
}

function snapshot(units) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(units.map(({ id, role, sha256 }) => ({ id, role, sha256 }))))
    .digest("hex");
}

function updateBase(sourceRoot, options = {}) {
  const preserveSourceIds = options.preserveSourceIds || new Set();
  const units = manifest.units.map((unit) => {
    const body = read(unitPath(sourceRoot, unit));
    if (!body) fail("Missing verified unit", { id: unit.id });
    const local = read(unitPath(checkoutRoot, unit));
    if (!local) fail("Missing canonical source unit", { id: unit.id });
    const priorSourceSha =
      baseSourceMap.get(unit.id) || unit.source_sha256 || baseMap.get(unit.id) || unit.sha256;
    return {
      ...unit,
      source_sha256: preserveSourceIds.has(unit.id) ? priorSourceSha : sha(local),
      sha256: sha(body),
      bytes: normalize(body).length,
    };
  });
  const nextSnapshot = snapshot(units);
  write(
    baseFile,
    Buffer.from(
      `${JSON.stringify({ schema_version: 1, project, snapshot: nextSnapshot, units }, null, 2)}\n`,
    ),
  );
  manifest.snapshot = nextSnapshot;
  manifest.units = units;
  manifest.transport_encoding = "notion-inner-markdown-lf-v1";
  write(manifestPath, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
  return nextSnapshot;
}

function updateTransportBaseline(sourceRoot, reason) {
  const units = manifest.units.map((unit) => {
    const remote = read(unitPath(sourceRoot, unit));
    const local = read(unitPath(checkoutRoot, unit));
    if (!remote) fail("Missing remote transport unit", { id: unit.id });
    if (!local) fail("Missing canonical source unit", { id: unit.id });
    const priorTransportSha = baseMap.get(unit.id) || unit.sha256 || null;
    const priorSourceSha =
      baseSourceMap.get(unit.id) || unit.source_sha256 || priorTransportSha;
    const localSha = sha(local);
    // Repair checkouts that were previously overwritten with a verified Notion
    // readback, but never absorb a genuine local edit into the source baseline.
    const nextSourceSha =
      priorTransportSha && localSha === priorTransportSha
        ? localSha
        : priorSourceSha;
    const normalized = normalize(remote);
    write(unitPath(path.join(stateRoot, "base"), unit), normalized);
    write(unitPath(path.join(stateRoot, "remote-readback"), unit), normalized);
    return {
      ...unit,
      source_sha256: nextSourceSha,
      sha256: sha(remote),
      bytes: normalized.length,
    };
  });
  const nextSnapshot = snapshot(units);
  write(
    baseFile,
    Buffer.from(
      `${JSON.stringify({ schema_version: 1, project, snapshot: nextSnapshot, units }, null, 2)}\n`,
    ),
  );
  manifest.snapshot = nextSnapshot;
  manifest.units = units;
  manifest.transport_baseline_at = new Date().toISOString();
  manifest.transport_baseline_reason = reason;
  manifest.transport_encoding = "notion-inner-markdown-lf-v1";
  write(manifestPath, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
  return nextSnapshot;
}

function auditIdentity() {
  if (!manifest.audit_log_page_id) return null;
  const audit = {
    change_author: value("--change-author"),
    publishing_actor: value("--publishing-actor"),
    authorized_by: value("--authorized-by"),
    provider: value("--provider"),
    reason: value("--reason"),
    decision: value("--decision") || "No additional decision recorded",
  };
  const missing = Object.entries(audit)
    .filter(([key, item]) => key !== "decision" && !item)
    .map(([key]) => key);
  if (missing.length) fail("Audit identity is required", { missing });
  return audit;
}

function prepareAuditEvent(operation, writeSet, finalSnapshot, outbox, readbackVerification) {
  if (!manifest.audit_log_page_id) return null;
  if (!writeSet.audit) fail("Verified operation is missing audit identity");
  const eventId = stamp();
  const eventDir = path.join(stateRoot, "audit-outbox");
  const eventPath = path.join(eventDir, `${eventId}.json`);
  const markdownPath = path.join(eventDir, `${eventId}.md`);
  const affected = (writeSet.units || []).map((item) => ({
    id: item.id,
    local_path: item.local_path,
  }));
  const expectedEditorialStories = [...new Set(
    affected
      .filter((item) => /^jira\/.+\.md$/i.test(item.local_path))
      .map((item) => path.basename(item.local_path, ".md")),
  )];
  const storyAggregateChanged = affected.some((item) => item.local_path === "05-user-stories.md");
  const editorialVerificationRequired = expectedEditorialStories.length > 0 || storyAggregateChanged;
  const title = `${new Date().toISOString().slice(0, 10)} · ${operation} verificada`;
  const event = {
    schema_version: 2,
    event_id: eventId,
    project,
    audit_status: "pending_post_publication_verification",
    audit_log_page_id: manifest.audit_log_page_id,
    operation,
    ...writeSet.audit,
    base_snapshot: writeSet.base_snapshot || null,
    final_snapshot: finalSnapshot,
    affected_pages: affected,
    editorial_verification_required: editorialVerificationRequired,
    expected_editorial_stories: expectedEditorialStories,
    editorial_scope_unresolved: storyAggregateChanged && expectedEditorialStories.length === 0,
    presentation_verification_required: true,
    post_publication_judge_required: true,
    readback: {
      pages_expected: affected.length,
      pages_verified: affected.length,
      mismatches: 0,
      verification: readbackVerification,
    },
    outbox: path.relative(cwd, outbox),
    audit_entry: {
      parent_page_id: manifest.audit_log_page_id,
      title,
      payload_path: path.relative(cwd, markdownPath),
    },
  };
  write(eventPath, Buffer.from(`${JSON.stringify(event, null, 2)}\n`));
  const markdown = `## Responsables

- **Autor del cambio:** ${event.change_author}.
- **Actor de publicación:** ${event.publishing_actor}.
- **Autorizado por:** ${event.authorized_by}.
- **IA/conector:** ${event.provider}.

## Operación

- **Tipo:** ${operation}.
- **Motivo:** ${event.reason}.
- **Decisión:** ${event.decision}.
- **Snapshot base:** \`${event.base_snapshot}\`.
- **Snapshot final:** \`${event.final_snapshot}\`.

## Páginas afectadas

${affected.map((item) => `- ${item.local_path}`).join("\n") || "- Ninguna"}

## Verificación

- Páginas esperadas: ${affected.length}.
- Páginas verificadas: ${affected.length}.
- Diferencias: 0.
- Paridad editorial requerida: ${editorialVerificationRequired ? "Sí" : "No"}.
- Historias editoriales esperadas: ${expectedEditorialStories.join(", ") || "Ninguna"}.
`;
  write(markdownPath, Buffer.from(markdown));
  return {
    event: eventPath,
    markdown: markdownPath,
    parent_page_id: manifest.audit_log_page_id,
    title,
  };
}

function verifyOutbox(operation) {
  if (!remoteDir) fail("--remote-dir is required");
  const outboxArg = value("--outbox");
  if (!outboxArg) fail("--outbox is required for --verify");
  const outbox = path.resolve(cwd, outboxArg);
  const writeSetPath = path.join(outbox, "write-set.json");
  if (!fs.existsSync(writeSetPath)) fail("Verified outbox is missing write-set.json", { outbox });
  const writeSet = JSON.parse(fs.readFileSync(writeSetPath, "utf8"));
  const backupRoot = writeSet.backup ? path.resolve(cwd, writeSet.backup) : null;
  const writeRows = new Map((writeSet.units || []).map((item) => [item.id, item]));
  const expectedIds = new Set((writeSet.units || []).map((item) => item.id));
  const excludedSourceIds = new Set((writeSet.excluded_units || []).map((item) => item.id));
  const manifestIds = new Set(manifest.units.map((unit) => unit.id));
  const unknownIds = [...expectedIds].filter((id) => !manifestIds.has(id));
  const unknownExcludedIds = [...excludedSourceIds].filter((id) => !manifestIds.has(id));
  const overlappingIds = [...expectedIds].filter((id) => excludedSourceIds.has(id));
  if (unknownIds.length || unknownExcludedIds.length || overlappingIds.length) {
    fail("Verified outbox contains an invalid scope", {
      unknown_units: unknownIds,
      unknown_excluded_units: unknownExcludedIds,
      overlapping_units: overlappingIds,
    });
  }
  const mismatches = [];
  const readbackVerification = [];
  for (const unit of manifest.units) {
    const actual = read(unitPath(remoteDir, unit));
    let verification;
    if (expectedIds.has(unit.id)) {
      const expected = read(unitPath(outbox, unit));
      const row = writeRows.get(unit.id);
      const prior = backupRoot ? read(unitPath(backupRoot, unit)) : null;
      verification = expected
        ? row?.recommended_write_mode === "patch" && prior
          ? verifyThreeWayPatch({
            base: prior,
            target: expected,
            actual,
            options: { manifest, unitId: unit.id },
          })
          : verifyReadback(expected, actual, { unitId: unit.id })
        : { ok: false, mode: "missing-outbox-unit" };
    } else {
      const baseSha = baseMap.get(unit.id) || unit.sha256 || null;
      verification = !actual
        ? { ok: false, mode: "missing" }
        : !baseSha
          ? { ok: false, mode: "unverified-preserved-unit" }
          : sha(actual) === baseSha
            ? { ok: true, mode: "preserved" }
            : { ok: false, mode: "unexpected-preserved-change" };
    }
    readbackVerification.push({
      id: unit.id,
      mode: verification.mode,
      equivalence_mode: verification.equivalence_mode || null,
      unexpected_functional_change: verification.unexpected_functional_change ?? false,
    });
    if (!verification.ok) mismatches.push(unit.id);
  }
  if (mismatches.length) {
    fail("Readback mismatch", { mismatches, verification: readbackVerification });
  }
  for (const unit of manifest.units) {
    const body = read(unitPath(remoteDir, unit));
    if (!body) fail("Readback is incomplete", { id: unit.id });
    const normalized = normalize(body);
    write(unitPath(path.join(stateRoot, "base"), unit), normalized);
    write(unitPath(path.join(stateRoot, "remote-readback"), unit), normalized);
  }
  const finalSnapshot = updateBase(remoteDir, { preserveSourceIds: excludedSourceIds });
  const auditEvent = prepareAuditEvent(
    operation,
    writeSet,
    finalSnapshot,
    outbox,
    readbackVerification,
  );
  return { outbox, finalSnapshot, auditEvent, readbackVerification };
}

if (command === "audit") {
  if (!flag("--complete")) fail("Use audit --complete");
  const eventArg = value("--event");
  const entryReceiptArg = value("--entry-receipt");
  if (!eventArg || !entryReceiptArg) fail("--event and --entry-receipt are required");
  const eventPath = path.resolve(cwd, eventArg);
  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  const markdownPath = eventPath.replace(/\.json$/i, ".md");
  if (!fs.existsSync(markdownPath)) fail("Audit Markdown is required", { path: markdownPath });
  const auditMarkdown = fs.readFileSync(markdownPath, "utf8");
  const requiredAuditSections = ["## Responsables", "## Operación", "## Páginas afectadas", "## Verificación"];
  const missingAuditSections = requiredAuditSections.filter((section) => !auditMarkdown.includes(section));
  if (missingAuditSections.length || /^\s*\{/u.test(auditMarkdown)) {
    fail("Audit Markdown failed preflight", { path: markdownPath, missing: missingAuditSections });
  }
  const entryReceiptPath = path.resolve(cwd, entryReceiptArg);
  const entryReceipt = readJson(entryReceiptPath, "Audit entry readback receipt");
  const expectedEntry = event.audit_entry || {};
  const expectedPayloadSha = crypto.createHash("sha256").update(fs.readFileSync(markdownPath)).digest("hex");
  const readbackPath = entryReceipt.readback_path
    ? path.resolve(cwd, entryReceipt.readback_path)
    : null;
  const entryReceiptErrors = [];
  if (entryReceipt.parent_page_id !== expectedEntry.parent_page_id) entryReceiptErrors.push("parent_page_id mismatch");
  if (entryReceipt.title !== expectedEntry.title) entryReceiptErrors.push("title mismatch");
  if (entryReceipt.payload_sha256 !== expectedPayloadSha) entryReceiptErrors.push("payload_sha256 mismatch");
  if (!entryReceipt.entry_page_id) entryReceiptErrors.push("entry_page_id missing");
  if (entryReceipt.duplicate_count !== 0) entryReceiptErrors.push("duplicate_count must be 0");
  if (!entryReceipt.checked_at) entryReceiptErrors.push("checked_at missing");
  if (!readbackPath || !fs.existsSync(readbackPath)) entryReceiptErrors.push("readback_path missing");
  else {
    const actualReadbackSha = crypto.createHash("sha256").update(fs.readFileSync(readbackPath)).digest("hex");
    if (entryReceipt.readback_sha256 !== actualReadbackSha) entryReceiptErrors.push("readback_sha256 mismatch");
    if (!verifyReadback(fs.readFileSync(markdownPath), fs.readFileSync(readbackPath)).ok) {
      entryReceiptErrors.push("audit readback is not equivalent to payload");
    }
  }
  if (entryReceiptErrors.length) fail("Audit entry readback receipt failed", { errors: entryReceiptErrors });
  event.audit_entry_receipt = {
    path: path.relative(cwd, entryReceiptPath),
    sha256: crypto.createHash("sha256").update(fs.readFileSync(entryReceiptPath)).digest("hex"),
    entry_page_id: entryReceipt.entry_page_id,
    readback_sha256: entryReceipt.readback_sha256,
    duplicate_count: entryReceipt.duplicate_count,
    checked_at: entryReceipt.checked_at,
  };
  const presentationReceiptArg = value("--presentation-receipt");
  if (!presentationReceiptArg) fail("--presentation-receipt is required");
  const presentationReceiptPath = path.resolve(cwd, presentationReceiptArg);
  const presentationReceipt = readJson(presentationReceiptPath, "Presentation parity receipt");
  if (
    presentationReceipt.ok !== true ||
    presentationReceipt.project !== project ||
    presentationReceipt.final_snapshot !== event.final_snapshot ||
    presentationReceipt.presentations_expected !== presentationReceipt.presentations_verified
  ) {
    fail("Presentation parity receipt failed", { path: presentationReceiptPath });
  }
  event.presentation_verification = {
    receipt: path.relative(cwd, presentationReceiptPath),
    sha256: crypto.createHash("sha256").update(fs.readFileSync(presentationReceiptPath)).digest("hex"),
    checked_at: presentationReceipt.checked_at || null,
    expected: presentationReceipt.presentations_expected,
    verified: presentationReceipt.presentations_verified,
    by_type: presentationReceipt.by_type || {},
  };
  if (event.editorial_verification_required) {
    if (event.editorial_scope_unresolved) {
      fail("Editorial scope is unresolved; regenerate affected jira views before audit completion");
    }
    const editorialReceiptArg = value("--editorial-receipt");
    if (!editorialReceiptArg) fail("--editorial-receipt is required");
    const editorialReceiptPath = path.resolve(cwd, editorialReceiptArg);
    const editorialReceipt = readJson(editorialReceiptPath, "Editorial parity receipt");
    if (editorialReceipt.ok !== true || editorialReceipt.project !== project) {
      fail("Editorial parity receipt failed", { path: editorialReceiptPath });
    }
    const verifiedStories = new Set(
      (editorialReceipt.stories || []).filter((item) => item.ok === true).map((item) => item.story_id),
    );
    const missingStories = (event.expected_editorial_stories || []).filter(
      (storyId) => !verifiedStories.has(storyId),
    );
    if (missingStories.length) {
      fail("Editorial parity receipt is incomplete", { missing_stories: missingStories });
    }
    event.editorial_verification = {
      receipt: path.relative(cwd, editorialReceiptPath),
      sha256: crypto.createHash("sha256").update(fs.readFileSync(editorialReceiptPath)).digest("hex"),
      checked_at: editorialReceipt.checked_at || null,
      stories_verified: [...verifiedStories],
    };
  }
  const judgeReportArg = value("--judge-report");
  if (!judgeReportArg) fail("--judge-report is required for every audit completion");
  const judgeReportPath = path.resolve(cwd, judgeReportArg);
  if (!fs.existsSync(judgeReportPath)) fail("Post-publication Judge report is missing", { path: judgeReportPath });
  const judgeReport = fs.readFileSync(judgeReportPath, "utf8");
  const verdictMatch = judgeReport.match(
    /(?:Verdict|Veredicto)\s*:\s*(PASS WITH OBSERVATIONS|PASS CON OBSERVACIONES|PASS|FAIL)\b/i,
  );
  const snapshotMatch = judgeReport.match(
    /(?:Reviewed snapshot SHA-256|Snapshot revisado SHA-256)\s*:\s*`?([a-f0-9]{64})`?/i,
  );
  const stageMatch = judgeReport.match(/(?:Action stage|Etapa de acci[oó]n)\s*:\s*([^\n]+)/i);
  const actionMatch = judgeReport.match(
    /(?:Intended action|Acci[oó]n evaluada)\s*:[^\n]*(?:Notion|paridad|publication|publicaci[oó]n)/i,
  );
  const allowedVerdicts = new Set(["PASS", "PASS WITH OBSERVATIONS", "PASS CON OBSERVACIONES"]);
  const verdict = verdictMatch?.[1]?.toUpperCase() || null;
  const overrideMatch = judgeReport.match(/(?:Human override|Excepci[oó]n humana)\s*:\s*([^\n]+)/i);
  const overrideText = overrideMatch?.[1]?.trim() || "";
  const validOverride = flag("--accept-judge-override")
    && verdict === "FAIL"
    && !/^(?:None|Ninguna)$/i.test(overrideText)
    && /(?:Notion|publicaci[oó]n)/i.test(overrideText)
    && /(?:Finding|Hallazgo)/i.test(overrideText)
    && /(?:Owner|Responsable)/i.test(overrideText)
    && /(?:Reason|Raz[oó]n|Motivo)/i.test(overrideText)
    && /\b\d{4}-\d{2}-\d{2}\b/.test(overrideText);
  if (!verdict || (!allowedVerdicts.has(verdict) && !validOverride) || !actionMatch || stageMatch?.[1]?.trim() !== "Post-publication") {
    fail("Post-publication Judge did not authorize audit completion", { verdict, stage: stageMatch?.[1] || null });
  }
  if (!snapshotMatch || snapshotMatch[1].toLowerCase() !== event.final_snapshot) {
    fail("Post-publication Judge reviewed a different snapshot", {
      expected: event.final_snapshot,
      reviewed: snapshotMatch?.[1] || null,
    });
  }
  event.post_publication_judge = {
    report: path.relative(cwd, judgeReportPath),
    sha256: crypto.createHash("sha256").update(judgeReport).digest("hex"),
    verdict,
    stage: "Post-publication",
    reviewed_snapshot: snapshotMatch[1].toLowerCase(),
    human_override: validOverride ? overrideText : null,
  };
  const publicationRunArg = value("--publication-run-receipt");
  if (!publicationRunArg) fail("--publication-run-receipt is required for audit completion");
  const publicationRunPath = path.resolve(cwd, publicationRunArg);
  const publicationRun = readJson(publicationRunPath, "Publication run receipt");
  const projectRun = publicationRun.projects?.[project];
  const runErrors = [];
  if (
    publicationRun.schema_version !== 2 ||
    publicationRun.operation !== "notion-publication-run-receipt" ||
    publicationRun.status !== "verified"
  ) runErrors.push("receipt must be a verified schema-2 publication run");
  if (!projectRun || projectRun.verified !== projectRun.total || projectRun.pending || projectRun.failed || projectRun.blocked) {
    runErrors.push("project pages are not fully verified");
  }
  if (publicationRun.final_snapshots?.[project] !== event.final_snapshot) runErrors.push("final snapshot mismatch");
  if (publicationRun.metrics?.metadata_checks !== 1) runErrors.push("exactly one final metadata check is required");
  if (publicationRun.metrics?.metadata_pages_checked !== publicationRun.freshness_pages_expected) {
    runErrors.push("metadata coverage is incomplete");
  }
  if (publicationRun.metrics?.content_reads < publicationRun.pages_total) runErrors.push("content readback metrics are incomplete");
  if (publicationRun.metrics?.writes < publicationRun.pages_total) runErrors.push("write metrics are incomplete");
  const acknowledgedMetrics = new Set(
    (publicationRun.budget_overruns || []).flatMap((item) => (item.exceeded || []).map((entry) => entry.metric)),
  );
  for (const [metric, budget] of Object.entries(publicationRun.operation_budget || {})) {
    if (
      Number(publicationRun.metrics?.[metric] || 0) > Number(budget) &&
      !acknowledgedMetrics.has(metric)
    ) runErrors.push(`unexplained operation budget overrun: ${metric}`);
  }
  if (runErrors.length) fail("Publication run receipt failed", { errors: runErrors });
  event.schema_version = 3;
  event.dossier_sha256 = publicationRun.dossier_sha256;
  event.technical_readback = event.readback;
  event.readback = {
    pages_expected: projectRun.total,
    pages_verified: projectRun.verified,
    mismatches: 0,
  };
  event.publication_run = {
    receipt: path.relative(cwd, publicationRunPath),
    sha256: crypto.createHash("sha256").update(fs.readFileSync(publicationRunPath)).digest("hex"),
    status: publicationRun.status,
    pages_total: projectRun.total,
    pages_verified: projectRun.verified,
    metrics: publicationRun.metrics,
    operation_budget: publicationRun.operation_budget,
    budget_overruns: publicationRun.budget_overruns || [],
    started_at: publicationRun.started_at,
    completed_at: publicationRun.completed_at,
    duration_ms: publicationRun.duration_ms,
  };
  event.audit_status = "complete";
  event.entry_page_id = entryReceipt.entry_page_id;
  event.completed_at = new Date().toISOString();
  const receipt = path.join(stateRoot, "receipts", `${event.event_id}.json`);
  write(receipt, Buffer.from(`${JSON.stringify(event, null, 2)}\n`));
  console.log(
    JSON.stringify(
      { ok: true, operation: "audit-complete", project, entry_page_id: entryReceipt.entry_page_id, receipt },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (command === "status" || command === "reconcile") {
  const report = inspect();
  console.log(JSON.stringify({ ok: report.conflicts.length === 0, operation: command, project, ...report }, null, 2));
  process.exit(report.conflicts.length ? 2 : 0);
}

if (command === "baseline") {
  const report = inspect();
  const transportOnly = flag("--transport-only");
  const presentationOnly = flag("--presentation-only");
  if (transportOnly && presentationOnly) {
    fail("--transport-only and --presentation-only are mutually exclusive");
  }
  const applyTransport = !presentationOnly;
  const applyPresentations = !transportOnly;
  const presentationCandidates = report.presentations.filter((item) =>
    ["presentation_drift", "unbaselined"].includes(item.state),
  );
  if (transportOnly && value("--presentation-plan")) {
    fail("--presentation-plan cannot be used with --transport-only");
  }
  const presentationPlan = applyPresentations
    ? loadPresentationPlan(report)
    : { file: null, sha256: null, selected: [], excluded: [] };
  const transportCandidates = report.rows.filter(
    (item) => item.remote_sha256 && item.remote_sha256 !== item.base_sha256,
  );
  const blockers = [
    ...(applyTransport ? report.rows.filter((item) => item.state === "remote_missing") : []),
    ...(applyPresentations
      ? report.presentations.filter((item) => item.state === "remote_missing")
      : []),
  ];
  if (flag("--preview")) {
    console.log(
      JSON.stringify(
        {
          ok: blockers.length === 0,
          operation: "baseline-preview",
          project,
          scope: transportOnly ? "transport" : presentationOnly ? "presentation" : "all",
          transport_candidates: transportCandidates,
          presentation_candidates: presentationCandidates,
          presentation_plan: presentationPlan.file
            ? { file: presentationPlan.file, sha256: presentationPlan.sha256 }
            : null,
          selected_presentations: presentationPlan.selected,
          excluded_presentations: presentationPlan.excluded,
          blockers,
        },
        null,
        2,
      ),
    );
    process.exit(blockers.length ? 2 : 0);
  }
  if (flag("--apply")) {
    if (!value("--reason")) fail("--reason is required");
    if (applyPresentations && presentationPlan.selected.length && !flag("--ack-presentation-drift")) {
      fail("--ack-presentation-drift is required");
    }
    if (applyTransport && transportCandidates.length && !flag("--ack-transport-drift")) {
      fail("--ack-transport-drift is required");
    }
    if (blockers.length) fail("Cannot baseline missing remote content", { blockers });
    const nextSnapshot = applyTransport
      ? updateTransportBaseline(remoteDir, value("--reason"))
      : manifest.snapshot;
    if (applyPresentations) {
      const selectedIds = new Set(presentationPlan.selected.map((item) => item.id));
      for (const presentation of manifest.presentations || []) {
        if (!selectedIds.has(presentation.id)) continue;
        const body = read(unitPath(remoteDir, presentation));
        presentation.base_sha256 = sha(body);
      }
      const baselineAt = new Date().toISOString();
      if (presentationPlan.excluded.length) {
        manifest.presentation_baseline_partial_at = baselineAt;
      } else {
        manifest.presentation_baseline_at = baselineAt;
      }
      manifest.presentation_baseline_reason = value("--reason");
      manifest.presentation_baseline_plan_sha256 = presentationPlan.sha256;
    }
    manifest.transport_encoding = "notion-inner-markdown-lf-v1";
    write(manifestPath, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
    console.log(
      JSON.stringify(
        {
          ok: true,
          operation: "baseline-apply",
          project,
          scope: transportOnly ? "transport" : presentationOnly ? "presentation" : "all",
          snapshot: nextSnapshot,
          updated_transport_units: applyTransport ? transportCandidates.map((item) => item.id) : [],
          presentation_plan_sha256: presentationPlan.sha256,
          updated_presentations: applyPresentations
            ? presentationPlan.selected.map((item) => {
              const presentation = manifest.presentations.find((candidate) => candidate.id === item.id);
              return { id: item.id, base_sha256: presentation.base_sha256 };
            })
            : [],
          excluded_presentations: presentationPlan.excluded,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  fail("Use baseline --preview or --apply");
}

if (command === "start") {
  const report = inspect();
  const sourceReconciliation = report.rows.filter(
    (item) =>
      item.state === "remote_changed" &&
      item.base_source_sha256 &&
      item.base_source_sha256 !== item.base_sha256,
  );
  if (sourceReconciliation.length) {
    fail("Start requires source reconciliation for dual representations", {
      blockers: sourceReconciliation,
      next_action: "Classify transport drift or reconcile the remote change into the canonical source",
    });
  }
  const blockers = report.rows.filter((item) =>
    ["conflict", "local_changed", "remote_missing"].includes(item.state),
  );
  if (blockers.length) {
    fail("Start requires reconcile; local work or conflict detected", {
      blockers,
      presentation_drift: report.presentation_drift,
    });
  }
  const rowsById = new Map(report.rows.map((item) => [item.id, item]));
  for (const unit of manifest.units) {
    const body = normalize(read(unitPath(remoteDir, unit)));
    if (rowsById.get(unit.id)?.state === "remote_changed") {
      write(unitPath(checkoutRoot, unit), body);
    }
    write(unitPath(path.join(stateRoot, "base"), unit), body);
    write(unitPath(path.join(stateRoot, "remote-readback"), unit), body);
  }
  const nextSnapshot = updateBase(remoteDir);
  console.log(
    JSON.stringify(
      {
        ok: true,
        operation: "start",
        project,
        snapshot: nextSnapshot,
        presentation_drift: report.presentation_drift,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (command === "publish") {
  if (flag("--verify")) {
    const verified = verifyOutbox("publish");
    console.log(
      JSON.stringify(
        {
          ok: true,
          operation: "publish-verify",
          project,
          snapshot: verified.finalSnapshot,
          audit_event: verified.auditEvent,
          readback_verification: verified.readbackVerification,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  const report = inspect();
  const detectedLocalChanges = report.rows.filter((item) => item.state === "local_changed");
  const writeScope = loadWritePlan(report);
  const changed = writeScope.units.map(hydrateWriteStrategy);
  const blockers = report.rows.filter((item) =>
    ["conflict", "remote_changed", "remote_missing", "local_missing"].includes(item.state),
  );
  const presentationBlockers = flag("--ack-presentation-drift")
    ? []
    : report.presentation_drift;
  if (flag("--preview")) {
    console.log(
      JSON.stringify(
        {
          ok: blockers.length === 0 && presentationBlockers.length === 0,
          operation: "publish-preview",
          project,
          write_set: changed,
          excluded_local_changes: writeScope.excluded,
          detected_local_changes: detectedLocalChanges,
          write_scope: {
            mode: writeScope.mode,
            plan: writeScope.file,
            sha256: writeScope.sha256,
          },
          blockers,
          presentation_blockers: presentationBlockers,
          presentation_drift: report.presentation_drift,
        },
        null,
        2,
      ),
    );
    process.exit(blockers.length || presentationBlockers.length ? 2 : 0);
  }
  if (flag("--apply")) {
    if (blockers.length || presentationBlockers.length) {
      fail("Publish blocked", {
        blockers,
        presentation_blockers: presentationBlockers,
        presentation_drift: report.presentation_drift,
      });
    }
    const audit = auditIdentity();
    const operationStamp = stamp();
    const backup = path.join(stateRoot, "backups", operationStamp);
    const outbox = path.join(stateRoot, "outbox", operationStamp);
    for (const row of changed) {
      const unit = manifest.units.find((item) => item.id === row.id);
      write(unitPath(backup, unit), normalize(read(unitPath(remoteDir, unit))));
      write(unitPath(outbox, unit), normalize(read(unitPath(checkoutRoot, unit))));
    }
    write(
      path.join(outbox, "write-set.json"),
      Buffer.from(
        `${JSON.stringify(
          {
            project,
            operation: "publish",
            created_at: new Date().toISOString(),
            base_snapshot: manifest.snapshot,
            backup: path.relative(cwd, backup),
            units: changed,
            excluded_units: writeScope.excluded,
            detected_local_changes: detectedLocalChanges.map((item) => item.id),
            write_scope: {
              mode: writeScope.mode,
              plan: writeScope.file,
              sha256: writeScope.sha256,
            },
            audit,
          },
          null,
          2,
        )}\n`,
      ),
    );
    console.log(
      JSON.stringify(
        {
          ok: true,
          operation: "publish-apply",
          project,
          backup,
          outbox,
          write_set: changed,
          excluded_local_changes: writeScope.excluded,
          detected_local_changes: detectedLocalChanges,
          write_scope: {
            mode: writeScope.mode,
            plan: writeScope.file,
            sha256: writeScope.sha256,
          },
          presentation_drift: report.presentation_drift,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  fail("Use publish --preview, --apply or --verify");
}

if (command === "recover") {
  if (flag("--verify")) {
    const verified = verifyOutbox("recover");
    console.log(
      JSON.stringify(
        {
          ok: true,
          operation: "recover-verify",
          project,
          snapshot: verified.finalSnapshot,
          audit_event: verified.auditEvent,
          readback_verification: verified.readbackVerification,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  const backupArg = value("--backup");
  if (!backupArg) fail("--backup is required");
  const backup = path.resolve(cwd, backupArg);
  const units = manifest.units.filter((unit) => fs.existsSync(unitPath(backup, unit)));
  if (flag("--preview")) {
    console.log(
      JSON.stringify(
        { ok: true, operation: "recover-preview", project, backup, units: units.map((item) => item.id) },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  if (flag("--apply")) {
    const audit = auditIdentity();
    const outbox = path.join(stateRoot, "recovery-outbox", stamp());
    for (const unit of units) {
      write(unitPath(outbox, unit), normalize(read(unitPath(backup, unit))));
    }
    write(
      path.join(outbox, "write-set.json"),
      Buffer.from(
        `${JSON.stringify(
          {
            project,
            operation: "recover",
            created_at: new Date().toISOString(),
            base_snapshot: manifest.snapshot,
            units,
            audit,
          },
          null,
          2,
        )}\n`,
      ),
    );
    console.log(
      JSON.stringify(
        { ok: true, operation: "recover-apply", project, outbox, units: units.map((item) => item.id) },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  fail("Use recover --preview, --apply or --verify");
}

fail("Unknown operation", { command });
