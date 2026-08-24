#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scripts = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), "audit-receipts-"));
const sha = (body) => crypto.createHash("sha256").update(body).digest("hex");
const write = (relative, body) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  return file;
};
const writeJson = (relative, body) => write(relative, `${JSON.stringify(body, null, 2)}\n`);
const run = (script, ...args) => spawnSync(process.execPath, [path.join(scripts, script), ...args], {
  cwd: root, encoding: "utf8",
});

try {
  const snapshot = "a".repeat(64);
  const payload = write("audit.md", "## Audit\n\nVerified.\n");
  const readback = write("audit-readback.md", "## Audit\n\nVerified.\n");
  const parity = writeJson("parity.json", { ok: true, project: "demo", presentations_expected: 1, presentations_verified: 1 });
  const pageEvidence = writeJson("page-evidence.json", { ok: true, pages: 2 });
  const judgeBody = `# Judge\n\n- Veredicto: PASS\n- Acción evaluada: Paridad Notion\n- Etapa de acción: Post-publication\n- Alcance de acción: technical=1; editorial=1\n- Snapshot revisado SHA-256: ${snapshot}\n`;
  const judge = write("judge.md", judgeBody);
  const dossier = {
    schema_version: 1,
    intended_action: "notion_audit_entries",
    audit_entries: [{
      project: "demo", parent_page_id: "parent", title: "2026-08-13 · publish verificada",
      payload_path: path.relative(root, payload), payload_sha256: sha(fs.readFileSync(payload)),
      final_snapshot: snapshot,
      judge_report_path: path.relative(root, judge), judge_report_sha256: sha(fs.readFileSync(judge)),
      parity_receipts: [{ path: path.relative(root, parity), sha256: sha(fs.readFileSync(parity)) }],
      status: "complete", entry_page_id: "entry", readback_path: path.relative(root, readback),
      readback_sha256: sha(fs.readFileSync(readback)), created_at: "2026-08-13T00:00:00Z",
      duplicate_check_at: "2026-08-13T00:01:00Z", duplicate_count: 0,
    }],
    expected_totals: { audit_entries: 1 },
  };
  writeJson("audit-dossier.json", dossier);
  const validDossier = run("validate-audit-dossier.mjs", "audit-dossier.json", "--root", root);
  assert.equal(validDossier.status, 0, validDossier.stderr);

  const runMetrics = { metadata_checks: 1, metadata_pages_checked: 2, content_reads: 2, writes: 2, retries: 0 };
  const runBudget = { metadata_checks: 1, metadata_pages_checked: 2, content_reads: 2, writes: 2, retries: 2 };
  const runReceipt = {
    schema_version: 2,
    operation: "notion-publication-run-receipt",
    status: "verified",
    run_path: "publication-run.json",
    run_sha256: "b".repeat(64),
    dossier_path: "publication-dossier.json",
    dossier_sha256: "c".repeat(64),
    authorization_digest: "c".repeat(64),
    final_snapshots: { demo: snapshot },
    started_at: "2026-08-13T00:00:00Z",
    completed_at: "2026-08-13T00:01:00Z",
    duration_ms: 60000,
    freshness_pages_expected: 2,
    pages_total: 2,
    pages_verified: 2,
    projects: { demo: { total: 2, verified: 2, pending: 0, failed: 0, blocked: 0 } },
    metrics: runMetrics,
    operation_budget: runBudget,
    budget_overruns: [],
    pages: ["page-1", "page-2"].map((notionPageId) => ({
      project: "demo", notion_page_id: notionPageId, identity: notionPageId,
      state: "verified-exact", attempts: 1,
      evidence: { path: "page-evidence.json", sha256: sha(fs.readFileSync(pageEvidence)) },
    })),
  };
  const runReceiptPath = writeJson("publication-run-receipt.json", runReceipt);
  const finalReceipt = {
    schema_version: 3, project: "demo", audit_status: "complete", final_snapshot: snapshot,
    dossier_sha256: runReceipt.dossier_sha256,
    readback: { pages_expected: 2, pages_verified: 2, mismatches: 0 },
    editorial_verification_required: false,
    post_publication_judge: { report: "judge.md", sha256: sha(fs.readFileSync(judge)), stage: "Post-publication", reviewed_snapshot: snapshot },
    presentation_verification: { receipt: "parity.json", sha256: sha(fs.readFileSync(parity)), expected: 1, verified: 1 },
    audit_entry_receipt: { path: "audit-entry.json", duplicate_count: 0 }, entry_page_id: "entry",
    publication_run: {
      receipt: "publication-run-receipt.json",
      sha256: sha(fs.readFileSync(runReceiptPath)),
      status: "verified",
      pages_total: 2,
      pages_verified: 2,
      metrics: runMetrics,
      operation_budget: runBudget,
      budget_overruns: [],
      started_at: runReceipt.started_at,
      completed_at: runReceipt.completed_at,
      duration_ms: runReceipt.duration_ms,
    },
  };
  writeJson("audit-entry.json", { ok: true });
  writeJson("final-receipt.json", finalReceipt);
  const validReceipt = run("validate-final-receipt.mjs", "final-receipt.json", "--root", root);
  assert.equal(validReceipt.status, 0, validReceipt.stderr);

  finalReceipt.publication_run.metrics.metadata_checks = 2;
  writeJson("bad-final-receipt.json", finalReceipt);
  const badMetrics = run("validate-final-receipt.mjs", "bad-final-receipt.json", "--root", root);
  assert.notEqual(badMetrics.status, 0);

  dossier.audit_entries[0].duplicate_count = 1;
  writeJson("bad-dossier.json", dossier);
  const duplicate = run("validate-audit-dossier.mjs", "bad-dossier.json", "--root", root);
  assert.notEqual(duplicate.status, 0);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log("OK: audit dossier, execution evidence and final receipt validation passed (4 checks)");
