#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

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
  fail("Usage: refinement-sync <discover|register|status|start|publish|reconcile|recover|baseline|audit> <project> [options]");
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
      tree.checkout_root || `artifacts/_local/notion-checkouts/${project}`,
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

const normalize = (buffer) => {
  const text = buffer.toString("utf8").replace(/\r\n?/g, "\n");
  return Buffer.from(`${text.replace(/\n*$/g, "")}\n`);
};
const sha = (buffer) =>
  crypto.createHash("sha256").update(normalize(buffer)).digest("hex");
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
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");

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
  return {
    recommended_write_mode: largePage || localized ? "patch" : "replace",
    final_bytes: Buffer.byteLength(after),
    estimated_changed_bytes: Buffer.byteLength(after.slice(prefix, after.length - suffix)),
    estimated_change_ratio: Number(changeRatio.toFixed(4)),
    reason: largePage ? "large-page" : localized ? "localized-delta" : "broad-delta",
    verification: "full-unit-readback-required",
  };
}

function inspect() {
  if (!remoteDir) fail("--remote-dir is required");
  const rows = manifest.units.map((unit) => {
    const local = read(unitPath(checkoutRoot, unit));
    const remote = read(unitPath(remoteDir, unit));
    const baseSha = baseMap.get(unit.id) || unit.sha256;
    const localSha = local && sha(local);
    const remoteSha = remote && sha(remote);
    const localChanged = !!localSha && localSha !== baseSha;
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

function snapshot(units) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(units.map(({ id, role, sha256 }) => ({ id, role, sha256 }))))
    .digest("hex");
}

function updateBase(sourceRoot) {
  const units = manifest.units.map((unit) => {
    const body = read(unitPath(sourceRoot, unit));
    if (!body) fail("Missing verified unit", { id: unit.id });
    return { ...unit, sha256: sha(body), bytes: normalize(body).length };
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

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name.replaceAll(path.sep, "/"));
    const body = entry.body;
    const crc = crc32(body);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(body.length, 22);
    local.writeUInt16LE(name.length, 26);
    localParts.push(local, name, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(body.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + body.length;
  }
  const centralBody = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBody.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, centralBody, end]);
}

function exportCheckout() {
  const exportStamp = stamp();
  const exportRoot = path.join(stateRoot, "exports");
  const entries = manifest.units.map((unit) => {
    const body = read(unitPath(checkoutRoot, unit));
    if (!body) fail("Cannot export missing checkout unit", { id: unit.id });
    return { id: unit.id, role: unit.role, name: safeRel(unit.local_path), body: normalize(body) };
  });
  const zipPath = path.join(exportRoot, `${project}-${exportStamp}.zip`);
  const exportManifestPath = path.join(
    exportRoot,
    `${project}-${exportStamp}.manifest.json`,
  );
  write(zipPath, createZip(entries));
  write(
    exportManifestPath,
    Buffer.from(
      `${JSON.stringify(
        {
          schema_version: 1,
          project,
          snapshot: manifest.snapshot,
          transport_encoding: "notion-inner-markdown-lf-v1",
          zip_sha256: crypto.createHash("sha256").update(read(zipPath)).digest("hex"),
          files: entries.map((item) => ({
            id: item.id,
            role: item.role,
            path: item.name,
            bytes: item.body.length,
            sha256: sha(item.body),
          })),
        },
        null,
        2,
      )}\n`,
    ),
  );
  return { zip: zipPath, manifest: exportManifestPath };
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

function prepareAuditEvent(operation, writeSet, finalSnapshot, outbox) {
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
  const event = {
    schema_version: 1,
    event_id: eventId,
    project,
    audit_status: editorialVerificationRequired
      ? "pending_editorial_verification"
      : "pending_notion_entry",
    audit_log_page_id: manifest.audit_log_page_id,
    operation,
    ...writeSet.audit,
    base_snapshot: writeSet.base_snapshot || null,
    final_snapshot: finalSnapshot,
    affected_pages: affected,
    editorial_verification_required: editorialVerificationRequired,
    expected_editorial_stories: expectedEditorialStories,
    editorial_scope_unresolved: storyAggregateChanged && expectedEditorialStories.length === 0,
    readback: {
      pages_expected: affected.length,
      pages_verified: affected.length,
      mismatches: 0,
    },
    outbox: path.relative(cwd, outbox),
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
    title: `${new Date().toISOString().slice(0, 10)} · ${operation} verificada`,
  };
}

function verifyOutbox(operation) {
  if (!remoteDir) fail("--remote-dir is required");
  const outboxArg = value("--outbox");
  if (!outboxArg) fail("--outbox is required for --verify");
  const outbox = path.resolve(cwd, outboxArg);
  const mismatches = [];
  for (const unit of manifest.units) {
    const expected = read(unitPath(outbox, unit));
    if (!expected) continue;
    const actual = read(unitPath(remoteDir, unit));
    if (!actual || sha(expected) !== sha(actual)) mismatches.push(unit.id);
  }
  if (mismatches.length) fail("Readback mismatch", { mismatches });
  for (const unit of manifest.units) {
    const body = read(unitPath(remoteDir, unit));
    if (!body) fail("Readback is incomplete", { id: unit.id });
    const normalized = normalize(body);
    write(unitPath(checkoutRoot, unit), normalized);
    write(unitPath(path.join(stateRoot, "base"), unit), normalized);
    write(unitPath(path.join(stateRoot, "remote-readback"), unit), normalized);
  }
  const finalSnapshot = updateBase(remoteDir);
  const writeSetPath = path.join(outbox, "write-set.json");
  const writeSet = fs.existsSync(writeSetPath)
    ? JSON.parse(fs.readFileSync(writeSetPath, "utf8"))
    : {};
  const exported = exportCheckout();
  const auditEvent = prepareAuditEvent(
    operation,
    writeSet,
    finalSnapshot,
    outbox,
  );
  return { outbox, finalSnapshot, exported, auditEvent };
}

if (command === "audit") {
  if (!flag("--complete")) fail("Use audit --complete");
  const eventArg = value("--event");
  const entryPageId = value("--entry-page-id");
  if (!eventArg || !entryPageId) fail("--event and --entry-page-id are required");
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
    const judgeReportArg = value("--judge-report");
    if (!judgeReportArg) fail("--judge-report is required after editorial verification");
    const judgeReportPath = path.resolve(cwd, judgeReportArg);
    if (!fs.existsSync(judgeReportPath)) fail("Post-publication Judge report is missing", { path: judgeReportPath });
    const judgeReport = fs.readFileSync(judgeReportPath, "utf8");
    const verdictMatch = judgeReport.match(
      /(?:Verdict|Veredicto)\s*:\s*(PASS WITH OBSERVATIONS|PASS CON OBSERVACIONES|PASS|FAIL)\b/i,
    );
    const snapshotMatch = judgeReport.match(
      /(?:Reviewed snapshot SHA-256|Snapshot revisado SHA-256)\s*:\s*`?([a-f0-9]{64})`?/i,
    );
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
    if (!verdict || (!allowedVerdicts.has(verdict) && !validOverride) || !actionMatch) {
      fail("Post-publication Judge did not authorize Notion editorial completion", { verdict });
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
      reviewed_snapshot: snapshotMatch[1].toLowerCase(),
      human_override: validOverride ? overrideText : null,
    };
  }
  event.audit_status = "complete";
  event.entry_page_id = entryPageId;
  event.completed_at = new Date().toISOString();
  const receipt = path.join(stateRoot, "receipts", `${event.event_id}.json`);
  write(receipt, Buffer.from(`${JSON.stringify(event, null, 2)}\n`));
  console.log(
    JSON.stringify(
      { ok: true, operation: "audit-complete", project, entry_page_id: entryPageId, receipt },
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
  const candidates = report.presentations.filter((item) =>
    ["presentation_drift", "unbaselined"].includes(item.state),
  );
  const blockers = report.presentations.filter((item) => item.state === "remote_missing");
  if (flag("--preview")) {
    console.log(
      JSON.stringify(
        { ok: blockers.length === 0, operation: "baseline-preview", project, candidates, blockers },
        null,
        2,
      ),
    );
    process.exit(blockers.length ? 2 : 0);
  }
  if (flag("--apply")) {
    if (!flag("--ack-presentation-drift") || !value("--reason")) {
      fail("--ack-presentation-drift and --reason are required");
    }
    if (blockers.length) fail("Cannot baseline missing presentations", { blockers });
    for (const presentation of manifest.presentations || []) {
      const body = read(unitPath(remoteDir, presentation));
      presentation.base_sha256 = sha(body);
    }
    manifest.presentation_baseline_at = new Date().toISOString();
    manifest.presentation_baseline_reason = value("--reason");
    manifest.transport_encoding = "notion-inner-markdown-lf-v1";
    write(manifestPath, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
    console.log(
      JSON.stringify(
        {
          ok: true,
          operation: "baseline-apply",
          project,
          updated: (manifest.presentations || []).map((item) => ({
            id: item.id,
            base_sha256: item.base_sha256,
          })),
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
  const blockers = report.rows.filter((item) =>
    ["conflict", "local_changed", "remote_missing"].includes(item.state),
  );
  if (blockers.length) {
    fail("Start requires reconcile; local work or conflict detected", {
      blockers,
      presentation_drift: report.presentation_drift,
    });
  }
  for (const unit of manifest.units) {
    const body = normalize(read(unitPath(remoteDir, unit)));
    write(unitPath(checkoutRoot, unit), body);
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
          export: verified.exported,
          audit_event: verified.auditEvent,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  const report = inspect();
  const changed = report.rows.filter((item) => item.state === "local_changed");
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
            units: changed,
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
          export: verified.exported,
          audit_event: verified.auditEvent,
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
