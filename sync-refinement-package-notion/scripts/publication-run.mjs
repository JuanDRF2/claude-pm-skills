#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const command = args.shift();
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const flag = (name) => args.includes(name);
const fail = (message, details = {}) => {
  console.error(JSON.stringify({ ok: false, message, ...details }, null, 2));
  process.exit(1);
};
const sha = (body) => crypto.createHash("sha256").update(body).digest("hex");
const readJson = (file, label) => {
  if (!file || !fs.existsSync(file)) fail(`${label} not found`, { path: file });
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { fail(`${label} is not valid JSON`, { path: file, error: error.message }); }
};
const writeJson = (file, body) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(body, null, 2)}\n`);
};

const allowedStates = new Set([
  "pending",
  "written",
  "verified-exact",
  "verified-semantic",
  "verified-three-way",
  "failed-unchanged",
  "failed-unknown",
  "blocked",
]);
const terminalSuccess = new Set(["verified-exact", "verified-semantic", "verified-three-way"]);
const transitions = {
  pending: new Set(["written", "verified-exact", "failed-unchanged", "failed-unknown", "blocked"]),
  written: new Set(["verified-exact", "verified-semantic", "verified-three-way", "failed-unknown", "blocked"]),
  "failed-unchanged": new Set(["written", "blocked"]),
  "failed-unknown": new Set(["written", "verified-exact", "verified-semantic", "verified-three-way", "blocked"]),
  blocked: new Set(["pending", "written"]),
};

const runPath = value("--run") ? path.resolve(value("--run")) : null;
if (!command || !["init", "metric", "record", "status", "continue", "close"].includes(command)) {
  fail("Usage: publication-run.mjs <init|metric|record|status|continue|close> --run <file> [options]");
}
if (!runPath) fail("--run is required");

if (command === "init") {
  const dossierPath = value("--dossier");
  const dossier = readJson(dossierPath && path.resolve(dossierPath), "Publication dossier");
  const dossierBody = fs.readFileSync(path.resolve(dossierPath));
  const pages = [
    ...(dossier.technical_pages || []).map((item) => ({ ...item, page_type: "technical", operation: "write" })),
    ...(dossier.editorial_pages || []).map((item) => ({ ...item, page_type: "editorial", operation: "write" })),
    ...(dossier.verification_pages || []).map((item) => ({
      ...item,
      operation: "verification-only",
      unit_id: item.identity,
      presentation_id: item.identity,
    })),
  ];
  const duplicates = pages.map((item) => item.notion_page_id)
    .filter((id, index, all) => all.indexOf(id) !== index);
  if (duplicates.length) fail("Dossier contains duplicate remote pages", { duplicates });
  const freshnessPages = Number(
    dossier.expected_totals?.freshness_pages ||
    (dossier.freshness_receipts || []).reduce((total, item) => total + Number(item.expected_page_count || 0), 0) ||
    pages.length,
  );
  const now = new Date().toISOString();
  const writablePages = pages.filter((item) => item.operation === "write").length;
  const run = {
    schema_version: 1,
    operation: "notion-publication-run",
    dossier_path: path.resolve(dossierPath),
    dossier_sha256: sha(dossierBody),
    authorization_digest: value("--authorization-digest") || sha(dossierBody),
    status: pages.length ? "pending" : "complete",
    created_at: now,
    updated_at: now,
    freshness_pages_expected: freshnessPages,
    operation_budget: {
      metadata_checks: Number(value("--metadata-check-budget") || 1),
      metadata_pages_checked: Number(value("--metadata-page-budget") || freshnessPages),
      content_reads: Number(value("--content-read-budget") || pages.length),
      writes: Number(value("--write-budget") || writablePages),
      retries: Number(value("--retry-budget") || writablePages),
    },
    metrics: {
      metadata_checks: 0,
      metadata_pages_checked: 0,
      content_reads: 0,
      writes: 0,
      retries: 0,
    },
    budget_overruns: [],
    pages: pages.map((item) => ({
      project: item.project,
      page_type: item.page_type,
      identity: item.unit_id || item.presentation_id,
      notion_page_id: item.notion_page_id,
      target_sha256: item.target_sha256,
      strategy: item.strategy,
      operation: item.operation,
      state: "pending",
      attempts: 0,
      evidence: [],
    })),
  };
  writeJson(runPath, run);
  console.log(JSON.stringify({ ok: true, run: runPath, pages: run.pages.length, dossier_sha256: run.dossier_sha256 }, null, 2));
  process.exit(0);
}

const run = readJson(runPath, "Publication run");
if (run.closed_at && !["status", "close"].includes(command)) {
  fail("Publication run is closed and immutable", { run: runPath, closed_at: run.closed_at });
}
const summarize = () => {
  const projects = {};
  for (const page of run.pages || []) {
    projects[page.project] ||= { total: 0, verified: 0, pending: 0, failed: 0, blocked: 0 };
    const item = projects[page.project];
    item.total += 1;
    if (terminalSuccess.has(page.state)) item.verified += 1;
    else if (page.state === "blocked") item.blocked += 1;
    else if (page.state.startsWith("failed")) item.failed += 1;
    else item.pending += 1;
  }
  return projects;
};

const validateBudgets = (allowOverrun = false) => {
  const exceeded = Object.entries(run.operation_budget || {})
    .filter(([metric, budget]) => Number(run.metrics?.[metric] || 0) > Number(budget))
    .map(([metric, budget]) => ({ metric, used: run.metrics[metric], budget }));
  if (exceeded.length && !allowOverrun) fail("Operation budget exceeded", { exceeded });
  return exceeded;
};

if (command === "metric") {
  const metric = value("--metric");
  const count = Number(value("--count"));
  if (!metric || !["metadata_checks", "metadata_pages_checked", "content_reads"].includes(metric)) {
    fail("--metric must be metadata_checks, metadata_pages_checked or content_reads");
  }
  if (!Number.isInteger(count) || count <= 0) fail("--count must be a positive integer");
  run.metrics[metric] += count;
  run.updated_at = new Date().toISOString();
  const exceeded = validateBudgets(flag("--allow-budget-overrun"));
  if (exceeded.length) {
    const reason = value("--reason");
    if (!reason) fail("--reason is required when accepting a budget overrun", { exceeded });
    run.budget_overruns.push({ at: run.updated_at, reason, exceeded });
  }
  writeJson(runPath, run);
  console.log(JSON.stringify({ ok: true, metric, count, metrics: run.metrics, operation_budget: run.operation_budget }, null, 2));
  process.exit(0);
}

if (command === "record") {
  const pageId = value("--page-id");
  const nextState = value("--state");
  if (!pageId || !allowedStates.has(nextState)) fail("--page-id and a valid --state are required");
  const page = (run.pages || []).find((item) => item.notion_page_id === pageId);
  if (!page) fail("Page is outside the authorized run", { notion_page_id: pageId });
  if (terminalSuccess.has(page.state) && page.state !== nextState) {
    fail("A verified page cannot be reopened silently", { page: pageId, state: page.state });
  }
  const allowed = transitions[page.state];
  if (page.state !== nextState && (!allowed || !allowed.has(nextState))) {
    fail("Invalid page-state transition", { page: pageId, from: page.state, to: nextState });
  }
  if (page.operation === "verification-only" && nextState === "written") {
    fail("A verification-only page cannot be written", { page: pageId });
  }
  if (page.state === "pending" && terminalSuccess.has(nextState)) {
    if (page.operation !== "verification-only" || nextState !== "verified-exact") {
      fail("Only a verification-only page may move directly from pending to verified-exact", { page: pageId });
    }
  }
  if (value("--metric")) fail("Use the metric command for non-write operation metrics");
  if (nextState === "written") {
    if (page.attempts > 0) run.metrics.retries += 1;
    page.attempts += 1;
    run.metrics.writes += 1;
  }
  page.state = nextState;
  page.evidence.push({
    at: new Date().toISOString(),
    state: nextState,
    path: value("--evidence") || null,
    sha256: value("--evidence-sha256") || null,
    reason: value("--reason") || null,
  });
  const incomplete = run.pages.filter((item) => !terminalSuccess.has(item.state));
  run.status = incomplete.length ? (incomplete.some((item) => item.state === "blocked") ? "blocked" : "in-progress") : "verified";
  run.updated_at = new Date().toISOString();
  const exceeded = validateBudgets(flag("--allow-budget-overrun"));
  if (exceeded.length) {
    const reason = value("--reason");
    if (!reason) fail("--reason is required when accepting a budget overrun", { exceeded });
    run.budget_overruns.push({ at: run.updated_at, reason, exceeded });
  }
  writeJson(runPath, run);
  console.log(JSON.stringify({ ok: true, status: run.status, page: pageId, state: nextState, projects: summarize() }, null, 2));
  process.exit(0);
}

if (command === "continue") {
  const dossier = readJson(run.dossier_path, "Publication dossier");
  const currentDigest = sha(fs.readFileSync(run.dossier_path));
  if (currentDigest !== run.dossier_sha256) fail("Original dossier changed; authorization is invalid", { expected: run.dossier_sha256, current: currentDigest });
  const remainingIds = new Set(run.pages.filter((item) => !terminalSuccess.has(item.state)).map((item) => item.notion_page_id));
  const continuation = {
    schema_version: 1,
    intended_action: "notion_publication_continuation",
    parent_dossier_sha256: run.dossier_sha256,
    authorization_digest: run.authorization_digest,
    technical_pages: (dossier.technical_pages || []).filter((item) => remainingIds.has(item.notion_page_id)),
    editorial_pages: (dossier.editorial_pages || []).filter((item) => remainingIds.has(item.notion_page_id)),
    verification_pages: (dossier.verification_pages || []).filter((item) => remainingIds.has(item.notion_page_id)),
    verified_pages: run.pages.filter((item) => terminalSuccess.has(item.state)).map((item) => ({
      project: item.project,
      notion_page_id: item.notion_page_id,
      state: item.state,
      evidence: item.evidence.at(-1) || null,
    })),
    excluded_units: dossier.excluded_units || [],
    controls: dossier.controls,
  };
  const out = value("--out");
  if (!out) fail("--out is required for continue");
  writeJson(path.resolve(out), continuation);
  console.log(JSON.stringify({ ok: true, out: path.resolve(out), remaining_pages: remainingIds.size, verified_pages: continuation.verified_pages.length }, null, 2));
  process.exit(0);
}

if (command === "close") {
  const out = value("--out");
  if (!out) fail("--out is required for close");
  const incomplete = run.pages.filter((item) => !terminalSuccess.has(item.state));
  if (incomplete.length || run.status !== "verified") {
    fail("Publication run cannot close before every page is verified", {
      status: run.status,
      incomplete: incomplete.map((item) => ({ notion_page_id: item.notion_page_id, state: item.state })),
    });
  }
  const projectNames = [...new Set(run.pages.map((item) => item.project))];
  let projectSnapshots = null;
  const snapshotsArg = value("--project-snapshots");
  if (snapshotsArg) projectSnapshots = readJson(path.resolve(snapshotsArg), "Project snapshots");
  else if (projectNames.length === 1 && /^[a-f0-9]{64}$/u.test(value("--final-snapshot") || "")) {
    projectSnapshots = { [projectNames[0]]: value("--final-snapshot") };
  } else {
    fail("Use --project-snapshots, or --final-snapshot for a single-project run");
  }
  const invalidSnapshots = projectNames.filter((project) => !/^[a-f0-9]{64}$/u.test(projectSnapshots?.[project] || ""));
  if (invalidSnapshots.length) fail("Every project requires a final snapshot", { projects: invalidSnapshots });
  if (run.metrics.metadata_checks !== 1) {
    fail("A verified run must record exactly one final metadata check", { recorded: run.metrics.metadata_checks });
  }
  if (run.metrics.metadata_pages_checked !== run.freshness_pages_expected) {
    fail("Metadata coverage does not match the authorized freshness inventory", {
      expected: run.freshness_pages_expected,
      recorded: run.metrics.metadata_pages_checked,
    });
  }
  if (run.metrics.content_reads < run.pages.length) {
    fail("Full readback metrics are incomplete", { expected_at_least: run.pages.length, recorded: run.metrics.content_reads });
  }
  const attempts = run.pages.reduce((total, item) => total + item.attempts, 0);
  const writablePages = run.pages.filter((item) => item.operation !== "verification-only").length;
  if (run.metrics.writes !== attempts || run.metrics.writes < writablePages) {
    fail("Write metrics do not match page attempts", { attempts, writes: run.metrics.writes });
  }
  const missingEvidence = run.pages.filter((item) => {
    const evidence = item.evidence.at(-1);
    return !evidence?.path || !/^[a-f0-9]{64}$/u.test(evidence.sha256 || "");
  }).map((item) => item.notion_page_id);
  if (missingEvidence.length) fail("Every verified page requires hashed evidence", { pages: missingEvidence });
  const finalOverruns = validateBudgets(true);
  const acknowledgedMetrics = new Set(
    (run.budget_overruns || []).flatMap((item) => (item.exceeded || []).map((entry) => entry.metric)),
  );
  const unacknowledged = finalOverruns.filter((item) => !acknowledgedMetrics.has(item.metric));
  if (unacknowledged.length) fail("Operation budget overrun is missing an explicit reason", { exceeded: unacknowledged });
  const now = run.closed_at || new Date().toISOString();
  run.closed_at = now;
  run.final_snapshots = projectSnapshots;
  run.immutable = true;
  run.updated_at = now;
  writeJson(runPath, run);
  const root = path.resolve(value("--root") || process.cwd());
  const projects = summarize();
  const receipt = {
    schema_version: 2,
    operation: "notion-publication-run-receipt",
    status: "verified",
    run_path: path.relative(root, runPath),
    run_sha256: sha(fs.readFileSync(runPath)),
    dossier_path: path.relative(root, run.dossier_path),
    dossier_sha256: run.dossier_sha256,
    authorization_digest: run.authorization_digest,
    final_snapshots: projectSnapshots,
    started_at: run.created_at,
    completed_at: now,
    duration_ms: Math.max(0, Date.parse(now) - Date.parse(run.created_at)),
    freshness_pages_expected: run.freshness_pages_expected,
    pages_total: run.pages.length,
    pages_verified: run.pages.length,
    pages_written: writablePages,
    pages_verification_only: run.pages.length - writablePages,
    projects,
    metrics: run.metrics,
    operation_budget: run.operation_budget,
    budget_overruns: run.budget_overruns || [],
    pages: run.pages.map((item) => ({
      project: item.project,
      notion_page_id: item.notion_page_id,
      identity: item.identity,
      state: item.state,
      attempts: item.attempts,
      operation: item.operation || "write",
      evidence: item.evidence.at(-1),
    })),
  };
  writeJson(path.resolve(out), receipt);
  console.log(JSON.stringify({ ok: true, out: path.resolve(out), ...receipt }, null, 2));
  process.exit(0);
}

console.log(JSON.stringify({
  ok: true,
  status: run.status,
  dossier_sha256: run.dossier_sha256,
  projects: summarize(),
  metrics: run.metrics,
  operation_budget: run.operation_budget,
  remaining_pages: run.pages.filter((item) => !terminalSuccess.has(item.state)).map((item) => ({
    project: item.project,
    notion_page_id: item.notion_page_id,
    identity: item.identity,
    state: item.state,
  })),
}, null, 2));
