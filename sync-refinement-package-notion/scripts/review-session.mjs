#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const argv = process.argv.slice(2);
const command = argv.shift();
const project = argv.shift();
const value = (name) => {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
};
const writeAll = (fd, payload) => {
  const buffer = Buffer.from(payload);
  const signal = new Int32Array(new SharedArrayBuffer(4));
  let offset = 0;
  while (offset < buffer.length) {
    try {
      offset += fs.writeSync(fd, buffer, offset, buffer.length - offset);
    } catch (error) {
      if (error?.code !== "EAGAIN") throw error;
      Atomics.wait(signal, 0, 0, 1);
    }
  }
};
const emit = (payload, code = 0) => {
  writeAll(code ? process.stderr.fd : process.stdout.fd, `${JSON.stringify(payload, null, 2)}\n`);
  process.exit(code);
};
const fail = (message, details = {}) => emit({ ok: false, message, ...details }, 1);
if (!command || !project) {
  fail("Usage: review-session <capture|status|check|migrate-evidence|assemble-readback> <project> [options]");
}

const normalize = (body) => {
  const text = body.toString("utf8").replace(/\r\n?/g, "\n");
  return Buffer.from(`${text.replace(/\n*$/g, "")}\n`);
};
const sha = (body) => crypto.createHash("sha256").update(normalize(body)).digest("hex");
const readJson = (file, label) => {
  if (!file || !fs.existsSync(file)) fail(`${label} not found`, { path: file || null });
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON`, { path: file, error: error.message });
  }
};
const safeRel = (candidate) => {
  const normalized = path.normalize(candidate);
  if (path.isAbsolute(normalized) || normalized.startsWith("..")) {
    fail("Unsafe manifest path", { path: candidate });
  }
  return normalized;
};
const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");

const registryPath = path.resolve(
  cwd,
  value("--registry") || "artifacts/_local/notion-sync/projects.json",
);
const registry = readJson(registryPath, "Project registry");
const entry = registry.projects?.[project];
if (!entry) fail("Project is not registered", { project });
const manifestPath = path.resolve(cwd, entry.manifest_file);
const manifest = readJson(manifestPath, "Project manifest");
const stateRoot = path.resolve(cwd, manifest.state_root || entry.state_root);
const activeFile = path.join(stateRoot, "review-session.json");
const items = [
  ...(manifest.units || []).map((item) => ({ ...item, surface: "unit" })),
  ...(manifest.presentations || []).map((item) => ({ ...item, surface: "presentation" })),
].map((item) => ({
  id: item.id,
  surface: item.surface,
  role: item.role,
  notion_page_id: item.notion_page_id,
  relative_path: safeRel(item.remote_path || item.local_path),
}));
const duplicate = (values) => values.find((item, index) => values.indexOf(item) !== index);
const duplicateId = duplicate(items.map((item) => item.id));
const duplicatePage = duplicate(items.map((item) => item.notion_page_id));
if (duplicateId || duplicatePage || items.some((item) => !item.notion_page_id)) {
  fail("Manifest identities are incomplete or duplicated", {
    duplicate_id: duplicateId || null,
    duplicate_page_id: duplicatePage || null,
  });
}

const evidenceMap = (file, required) => {
  if (!file) {
    if (required) fail("--freshness-evidence is required");
    return { read_at: null, pages: new Map(), complete: false, sha256: null };
  }
  const evidencePath = path.resolve(cwd, file);
  const evidence = readJson(evidencePath, "Freshness evidence");
  if (!evidence.read_at || !Array.isArray(evidence.pages)) {
    fail("Freshness evidence requires read_at and pages[]", { path: file });
  }
  const pages = new Map();
  for (const page of evidence.pages) {
    const revision = page.revision || page.last_edited_time;
    if (!page.notion_page_id || !revision || pages.has(page.notion_page_id)) {
      fail("Freshness evidence contains an invalid or duplicate page", { page });
    }
    pages.set(page.notion_page_id, revision);
  }
  const missing = items
    .filter((item) => !pages.has(item.notion_page_id))
    .map((item) => item.id);
  return {
    read_at: evidence.read_at,
    pages,
    complete: missing.length === 0,
    missing,
    sha256: crypto.createHash("sha256").update(fs.readFileSync(evidencePath)).digest("hex"),
  };
};
const manifestSha256 = crypto.createHash("sha256").update(fs.readFileSync(manifestPath)).digest("hex");
const checkReceipt = (session, evidence) => ({
  session_file: path.relative(cwd, activeFile),
  remote_snapshot: session.remote_snapshot,
  manifest_file: path.relative(cwd, manifestPath),
  manifest_sha256: manifestSha256,
  manifest_page_count: items.length,
  checked_pages: evidence.pages.size,
  freshness_evidence_sha256: evidence.sha256,
  checked_at: evidence.read_at,
});
const loadSession = () => {
  const session = readJson(activeFile, "Active review session");
  const remoteRoot = path.resolve(cwd, session.remote_dir);
  if (!fs.existsSync(remoteRoot)) fail("Review-session cache is missing", { remote_dir: remoteRoot });
  const damaged = session.entries.filter((item) => {
    const file = path.join(remoteRoot, item.relative_path);
    return !fs.existsSync(file) || sha(fs.readFileSync(file)) !== item.sha256;
  }).map((item) => item.id);
  const identity = crypto
    .createHash("sha256")
    .update(JSON.stringify(items.map(({ id, notion_page_id, relative_path }) => ({ id, notion_page_id, relative_path }))))
    .digest("hex");
  return {
    session,
    remoteRoot,
    damaged,
    manifestChanged: session.manifest_identity !== identity,
  };
};
const snapshot = (entries) => crypto
  .createHash("sha256")
  .update(JSON.stringify(entries.map(({ id, notion_page_id, sha256 }) => ({ id, notion_page_id, sha256 }))))
  .digest("hex");
const createSession = (sourceRoot, evidence, operation) => {
  const sessionRoot = path.join(stateRoot, "review-sessions", stamp());
  const remoteRoot = path.join(sessionRoot, "remote");
  const entries = items.map((item) => {
    const source = path.join(sourceRoot, item.relative_path);
    if (!fs.existsSync(source)) fail("Remote snapshot is incomplete", { id: item.id, path: source });
    const body = normalize(fs.readFileSync(source));
    const target = path.join(remoteRoot, item.relative_path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, body);
    return {
      ...item,
      sha256: sha(body),
      revision: evidence.pages.get(item.notion_page_id) || null,
    };
  });
  const session = {
    schema_version: 1,
    project,
    operation,
    captured_at: new Date().toISOString(),
    evidence_read_at: evidence.read_at,
    freshness_mode: evidence.complete ? "page-revision" : "content-only",
    remote_snapshot: snapshot(entries),
    remote_dir: path.relative(cwd, remoteRoot),
    manifest_file: path.relative(cwd, manifestPath),
    manifest_identity: crypto
      .createHash("sha256")
      .update(JSON.stringify(items.map(({ id, notion_page_id, relative_path }) => ({ id, notion_page_id, relative_path }))))
      .digest("hex"),
    entries,
  };
  fs.mkdirSync(stateRoot, { recursive: true });
  fs.writeFileSync(activeFile, `${JSON.stringify(session, null, 2)}\n`);
  return session;
};

if (command === "capture") {
  const remoteDir = value("--remote-dir");
  if (!remoteDir) fail("--remote-dir is required");
  const evidence = evidenceMap(value("--freshness-evidence"), false);
  const session = createSession(path.resolve(cwd, remoteDir), evidence, "capture");
  emit({
    ok: true,
    operation: "review-session-capture",
    project,
    session_file: path.relative(cwd, activeFile),
    remote_dir: session.remote_dir,
    remote_snapshot: session.remote_snapshot,
    freshness_mode: session.freshness_mode,
    units: session.entries.length,
  });
}

if (command === "status") {
  const { session, damaged, manifestChanged } = loadSession();
  emit({
    ok: damaged.length === 0 && !manifestChanged,
    operation: "review-session-status",
    project,
    session_file: path.relative(cwd, activeFile),
    remote_dir: session.remote_dir,
    remote_snapshot: session.remote_snapshot,
    freshness_mode: session.freshness_mode,
    captured_at: session.captured_at,
    cache_damaged: damaged,
    manifest_changed: manifestChanged,
  }, damaged.length || manifestChanged ? 2 : 0);
}

if (command === "check") {
  const { session, remoteRoot, damaged, manifestChanged } = loadSession();
  if (damaged.length || manifestChanged) {
    emit({
      ok: false,
      operation: "review-session-check",
      project,
      full_refresh_required: true,
      cache_damaged: damaged,
      manifest_changed: manifestChanged,
    }, 2);
  }
  if (session.freshness_mode !== "page-revision") {
    emit({
      ok: false,
      operation: "review-session-check",
      project,
      full_refresh_required: true,
      reason: "The captured snapshot has no complete per-page revision evidence",
    }, 2);
  }
  const evidence = evidenceMap(value("--freshness-evidence"), true);
  if (!evidence.complete) {
    emit({
      ok: false,
      operation: "review-session-check",
      project,
      full_refresh_required: true,
      missing_evidence: evidence.missing,
    }, 2);
  }
  const prior = new Map(session.entries.map((item) => [item.notion_page_id, item.revision]));
  const changed = items.filter(
    (item) => prior.get(item.notion_page_id) !== evidence.pages.get(item.notion_page_id),
  );
  if (!changed.length) {
    emit({
      ok: true,
      operation: "review-session-check",
      project,
      current: true,
      changed: [],
      resolved_remote_dir: session.remote_dir,
      ...checkReceipt(session, evidence),
    });
  }
  const changedDir = value("--changed-dir");
  if (!changedDir) {
    emit({
      ok: false,
      operation: "review-session-check",
      project,
      current: false,
      changed: changed.map((item) => item.id),
      required_content: changed.map((item) => item.id),
      ...checkReceipt(session, evidence),
    }, 2);
  }
  const refreshRoot = path.join(stateRoot, "review-session-refresh", stamp());
  fs.cpSync(remoteRoot, refreshRoot, { recursive: true });
  const sourceRoot = path.resolve(cwd, changedDir);
  for (const item of changed) {
    const source = path.join(sourceRoot, item.relative_path);
    if (!fs.existsSync(source)) fail("Changed-page download is incomplete", { id: item.id, path: source });
    const target = path.join(refreshRoot, item.relative_path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
  const refreshed = createSession(refreshRoot, evidence, "check-refresh");
  fs.rmSync(refreshRoot, { recursive: true, force: true });
  emit({
    ok: true,
    operation: "review-session-check",
    project,
    current: false,
    changed: changed.map((item) => item.id),
    resolved_remote_dir: refreshed.remote_dir,
    ...checkReceipt(refreshed, evidence),
  });
}

if (command === "migrate-evidence") {
  const { session, damaged, manifestChanged } = loadSession();
  if (damaged.length || manifestChanged) {
    emit({
      ok: false,
      operation: "review-session-migrate-evidence",
      project,
      full_refresh_required: true,
      cache_damaged: damaged,
      manifest_changed: manifestChanged,
    }, 2);
  }
  const evidence = evidenceMap(value("--freshness-evidence"), true);
  if (!evidence.complete) {
    emit({ ok: false, full_refresh_required: true, missing_evidence: evidence.missing }, 2);
  }
  const capturedAt = Date.parse(session.captured_at);
  const unsafe = [];
  const migrated = [];
  for (const entry of session.entries) {
    const next = evidence.pages.get(entry.notion_page_id);
    const prior = entry.revision;
    if (prior === next) continue;
    const priorMinute = String(prior || "").slice(0, 16);
    const nextMinute = String(next || "").slice(0, 16);
    const nextAt = Date.parse(next);
    if (!prior || priorMinute !== nextMinute || !Number.isFinite(nextAt) || nextAt > capturedAt) {
      unsafe.push({ id: entry.id, prior_revision: prior, current_revision: next });
      continue;
    }
    entry.revision = next;
    migrated.push(entry.id);
  }
  if (unsafe.length) {
    emit({
      ok: false,
      operation: "review-session-migrate-evidence",
      project,
      full_refresh_required: false,
      changed_content_required: unsafe.map((item) => item.id),
      unsafe,
    }, 2);
  }
  session.schema_version = 2;
  session.evidence_read_at = evidence.read_at;
  session.evidence_precision_migrated_at = new Date().toISOString();
  session.evidence_precision_migrated_pages = migrated;
  fs.writeFileSync(activeFile, `${JSON.stringify(session, null, 2)}\n`);
  emit({
    ok: true,
    operation: "review-session-migrate-evidence",
    project,
    migrated_pages: migrated,
    content_downloads: 0,
    session_file: path.relative(cwd, activeFile),
    ...checkReceipt(session, evidence),
  });
}

if (command === "assemble-readback") {
  const { session, remoteRoot, damaged, manifestChanged } = loadSession();
  if (damaged.length || manifestChanged) {
    emit({
      ok: false,
      operation: "review-session-assemble-readback",
      project,
      full_refresh_required: true,
      cache_damaged: damaged,
      manifest_changed: manifestChanged,
    }, 2);
  }
  if (session.freshness_mode !== "page-revision") {
    fail("Localized readback requires a session with complete page-revision evidence");
  }
  const evidence = evidenceMap(value("--freshness-evidence"), true);
  if (!evidence.complete) {
    emit({ ok: false, full_refresh_required: true, missing_evidence: evidence.missing }, 2);
  }
  const outbox = value("--outbox");
  const readbackDir = value("--readback-dir");
  if (!outbox || !readbackDir) fail("--outbox and --readback-dir are required");
  const writeSet = readJson(path.resolve(cwd, outbox, "write-set.json"), "Outbox write set");
  const expected = new Set((writeSet.units || []).map((item) => item.id));
  const expectedFile = value("--expected-changes");
  if (expectedFile) {
    const extra = readJson(path.resolve(cwd, expectedFile), "Expected-change plan");
    for (const id of extra.ids || []) expected.add(id);
  }
  const known = new Map(items.map((item) => [item.id, item]));
  const unknown = [...expected].filter((id) => !known.has(id));
  if (unknown.length) fail("Expected-change plan contains unknown IDs", { unknown });
  const prior = new Map(session.entries.map((item) => [item.notion_page_id, item.revision]));
  const observedChanged = items.filter(
    (item) => prior.get(item.notion_page_id) !== evidence.pages.get(item.notion_page_id),
  );
  const unexpected = observedChanged.filter((item) => !expected.has(item.id)).map((item) => item.id);
  if (unexpected.length) {
    emit({
      ok: false,
      operation: "review-session-assemble-readback",
      project,
      concurrent_change_detected: true,
      unexpected_changes: unexpected,
      full_refresh_required: true,
    }, 2);
  }
  const assembledRoot = path.join(stateRoot, "assembled-readbacks", stamp());
  fs.cpSync(remoteRoot, assembledRoot, { recursive: true });
  const sourceRoot = path.resolve(cwd, readbackDir);
  for (const id of expected) {
    const item = known.get(id);
    const source = path.join(sourceRoot, item.relative_path);
    if (!fs.existsSync(source)) fail("Localized readback is incomplete", { id, path: source });
    const target = path.join(assembledRoot, item.relative_path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
  emit({
    ok: true,
    operation: "review-session-assemble-readback",
    project,
    expected_changes: [...expected],
    observed_changes: observedChanged.map((item) => item.id),
    preserved: items.filter((item) => !expected.has(item.id)).map((item) => item.id),
    resolved_remote_dir: path.relative(cwd, assembledRoot),
    next_action: "Run refinement-sync publish --verify with resolved_remote_dir, then capture it as the next review session",
  });
}

fail("Unsupported review-session command", { command });
