#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { buildPatchPlan, sha256, verifyMarkdownReadback } from "./markdown-transport.mjs";

const fail = (message) => {
  process.stderr.write(`ERROR: ${message}\n`);
  process.exit(1);
};

const args = process.argv.slice(2);
const command = args.shift();
const flags = {};
for (let index = 0; index < args.length; index += 1) {
  const key = args[index];
  if (!key.startsWith("--") || index + 1 >= args.length) fail(`Invalid argument: ${key}`);
  flags[key.slice(2)] = args[index + 1];
  index += 1;
}

const required = (...names) => {
  for (const name of names) if (!flags[name]) fail(`Missing --${name}`);
};

const readJson = (file) => JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
const readText = (root, relative) => {
  const base = path.resolve(root);
  const target = path.resolve(base, relative);
  if (target !== base && !target.startsWith(`${base}${path.sep}`)) fail(`Unsafe path: ${relative}`);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) fail(`Missing file: ${target}`);
  return fs.readFileSync(target, "utf8");
};
const stable = (value) => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
};
const digest = (value) => crypto.createHash("sha256").update(stable(value)).digest("hex");
const writeJson = (file, value) => {
  const target = path.resolve(file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, target);
};
const itemsOf = (manifest) => [
  ...(manifest.units || []).map((item) => ({ ...item, kind: "technical" })),
  ...(manifest.presentations || []).map((item) => ({ ...item, kind: "editorial" })),
];
const remotePath = (item) => item.remote_path || item.local_path || fail(`No remote path for ${item.id}`);
const targetPath = (item, entry = {}) => entry.target_path || item.local_path || null;
const indexItems = (manifest) => {
  const index = new Map();
  for (const item of itemsOf(manifest)) {
    if (!item.id || !item.notion_page_id) fail("Every manifest item requires id and notion_page_id");
    if (index.has(item.id)) fail(`Duplicate manifest id: ${item.id}`);
    index.set(item.id, item);
  }
  return index;
};
const baselineEntries = (baseline) => new Map((baseline.entries || []).map((entry) => [entry.id, entry]));

const capture = () => {
  required("manifest", "local-dir", "remote-dir", "out");
  const manifest = readJson(flags.manifest);
  const entries = [];
  for (const item of itemsOf(manifest)) {
    const file = remotePath(item);
    const remote = readText(flags["remote-dir"], file);
    const source = targetPath(item);
    const local = source ? readText(flags["local-dir"], source) : remote;
    const verification = verifyMarkdownReadback(local, remote, { manifest, unitId: item.id });
    if (!verification.ok) fail(`Initial baseline is not aligned for ${item.id}`);
    entries.push({
      id: item.id,
      kind: item.kind,
      notion_page_id: item.notion_page_id,
      path: file,
      source_path: source,
      source_sha256: sha256(local),
      remote_sha256: sha256(remote),
      base_content: remote,
      equivalence_mode: verification.mode,
    });
  }
  const body = {
    schema_version: 1,
    model: "native-pages-fast-v1",
    project: manifest.project,
    manifest_sha256: digest(manifest),
    verification_scope: "global",
    entries,
  };
  writeJson(flags.out, { ...body, baseline_sha256: digest(body) });
  process.stdout.write(`${JSON.stringify({ ok: true, entries: entries.length, scope: "global" })}\n`);
};

const plan = () => {
  required("manifest", "baseline", "local-dir", "impact", "out");
  const manifest = readJson(flags.manifest);
  const baseline = readJson(flags.baseline);
  const impact = readJson(flags.impact);
  if (baseline.model !== "native-pages-fast-v1" || baseline.manifest_sha256 !== digest(manifest)) {
    fail("Baseline does not match the current manifest");
  }
  const items = indexItems(manifest);
  const bases = baselineEntries(baseline);
  const selectedInput = [...(impact.units || []), ...(impact.presentations || [])];
  const excludedInput = impact.excluded_units || [];
  const declared = new Map();
  for (const entry of [...selectedInput, ...excludedInput]) {
    if (!entry.id || !entry.classification || !entry.reason) fail("Impact entries require id, classification and reason");
    if (declared.has(entry.id)) fail(`Impact id declared more than once: ${entry.id}`);
    if (!items.has(entry.id)) fail(`Unknown impact id: ${entry.id}`);
    declared.set(entry.id, entry);
  }
  const changed = [];
  for (const [id, item] of items) {
    const base = bases.get(id);
    if (!base) fail(`Baseline missing id: ${id}`);
    const source = targetPath(item);
    if (!source) continue;
    const target = readText(flags["local-dir"], source);
    if (sha256(target) !== base.source_sha256) changed.push(id);
  }
  const omitted = changed.filter((id) => !declared.has(id));
  if (omitted.length) fail(`Changed ids omitted from impact plan: ${omitted.join(", ")}`);
  const selected = selectedInput.map((entry) => {
    const item = items.get(entry.id);
    const source = targetPath(item, entry);
    if (!source) fail(`Selected presentation requires target_path: ${entry.id}`);
    const target = readText(flags["local-dir"], source);
    return {
      ...entry,
      kind: item.kind,
      notion_page_id: item.notion_page_id,
      path: remotePath(item),
      target_path: source,
      target_sha256: sha256(target),
      changed: changed.includes(entry.id),
    };
  });
  const body = {
    schema_version: 1,
    model: "native-pages-fast-v1",
    project: manifest.project,
    baseline_sha256: baseline.baseline_sha256,
    changed_ids: changed,
    selected,
    excluded: excludedInput,
  };
  writeJson(flags.out, { ...body, plan_sha256: digest(body) });
  process.stdout.write(`${JSON.stringify({ ok: true, changed: changed.length, selected: selected.length, excluded: excludedInput.length })}\n`);
};

const preflight = () => {
  required("manifest", "baseline", "local-dir", "remote-dir", "plan", "out");
  const manifest = readJson(flags.manifest);
  const baseline = readJson(flags.baseline);
  const localPlan = readJson(flags.plan);
  if (baseline.manifest_sha256 !== digest(manifest) || localPlan.baseline_sha256 !== baseline.baseline_sha256) {
    fail("Plan, baseline and manifest do not describe the same snapshot");
  }
  const items = indexItems(manifest);
  const bases = baselineEntries(baseline);
  const writes = [];
  const verificationPages = [];
  const conflicts = [];
  for (const selected of localPlan.selected || []) {
    const item = items.get(selected.id);
    const base = bases.get(selected.id);
    const target = readText(flags["local-dir"], selected.target_path);
    if (sha256(target) !== selected.target_sha256) fail(`Local target changed after plan: ${selected.id}`);
    const remote = readText(flags["remote-dir"], selected.path);
    const options = { manifest, unitId: selected.id };
    const againstTarget = verifyMarkdownReadback(target, remote, options);
    const againstBase = verifyMarkdownReadback(base.base_content, remote, options);
    const common = {
      id: selected.id,
      kind: item.kind,
      notion_page_id: item.notion_page_id,
      path: selected.path,
      target_path: selected.target_path,
      remote_sha256: sha256(remote),
      target_sha256: sha256(target),
    };
    if (againstTarget.ok) {
      verificationPages.push({ ...common, equivalence_mode: againstTarget.mode });
    } else if (againstBase.ok) {
      writes.push({ ...common, strategy: buildPatchPlan(remote, target) });
    } else {
      conflicts.push({ ...common, reason: "remote-changed-from-baseline" });
    }
  }
  const body = {
    schema_version: 1,
    operation: "native-pages-fast-preflight",
    current: conflicts.length === 0,
    model: "native-pages-fast-v1",
    project: manifest.project,
    baseline_sha256: baseline.baseline_sha256,
    plan_sha256: localPlan.plan_sha256,
    verification_scope: "localized",
    checked_pages: writes.length + verificationPages.length + conflicts.length,
    writes,
    verification_pages: verificationPages,
    conflicts,
    excluded: localPlan.excluded || [],
  };
  const dossier = { ...body, dossier_sha256: digest(body), ok: conflicts.length === 0 };
  writeJson(flags.out, dossier);
  process.stdout.write(`${JSON.stringify({ ok: dossier.ok, writes: writes.length, verification_only: verificationPages.length, conflicts: conflicts.length, scope: "localized" })}\n`);
  if (!dossier.ok) process.exitCode = 2;
};

const verify = () => {
  required("manifest", "baseline", "local-dir", "readback-dir", "dossier", "out", "updated-baseline");
  const manifest = readJson(flags.manifest);
  const baseline = readJson(flags.baseline);
  const dossier = readJson(flags.dossier);
  if (baseline.manifest_sha256 !== digest(manifest) || dossier.baseline_sha256 !== baseline.baseline_sha256) {
    fail("Dossier, baseline and manifest do not describe the same snapshot");
  }
  if (!dossier.ok || (dossier.conflicts || []).length) fail("Cannot verify a blocked dossier");
  const items = indexItems(manifest);
  const bases = baselineEntries(baseline);
  const results = [];
  for (const entry of [...(dossier.writes || []), ...(dossier.verification_pages || [])]) {
    const item = items.get(entry.id);
    const target = readText(flags["local-dir"], entry.target_path);
    if (sha256(target) !== entry.target_sha256) fail(`Local target changed after authorization: ${entry.id}`);
    const actual = readText(flags["readback-dir"], entry.path);
    const check = verifyMarkdownReadback(target, actual, { manifest, unitId: entry.id });
    results.push({ id: entry.id, ok: check.ok, mode: check.mode, readback_sha256: sha256(actual) });
    if (check.ok) {
      const base = bases.get(entry.id);
      base.source_sha256 = sha256(target);
      base.remote_sha256 = sha256(actual);
      base.base_content = actual;
      base.equivalence_mode = check.mode;
    }
  }
  const failures = results.filter((result) => !result.ok);
  const nextBody = {
    ...baseline,
    verification_scope: "localized",
    previous_baseline_sha256: baseline.baseline_sha256,
    entries: [...bases.values()],
  };
  delete nextBody.baseline_sha256;
  const next = { ...nextBody, baseline_sha256: digest(nextBody) };
  const receiptBody = {
    schema_version: 1,
    model: "native-pages-fast-v1",
    project: manifest.project,
    dossier_sha256: dossier.dossier_sha256,
    verification_scope: "localized",
    results,
    preserved_count: items.size - results.length,
    ok: failures.length === 0,
  };
  writeJson(flags.out, { ...receiptBody, receipt_sha256: digest(receiptBody) });
  if (!failures.length) writeJson(flags["updated-baseline"], next);
  process.stdout.write(`${JSON.stringify({ ok: failures.length === 0, verified: results.length - failures.length, failed: failures.length, preserved: items.size - results.length, scope: "localized" })}\n`);
  if (failures.length) process.exitCode = 2;
};

if (command === "capture") capture();
else if (command === "plan") plan();
else if (command === "preflight") preflight();
else if (command === "verify") verify();
else fail("Expected command: capture | plan | preflight | verify");
