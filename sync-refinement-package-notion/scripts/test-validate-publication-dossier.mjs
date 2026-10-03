#!/usr/bin/env node

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "validate-publication-dossier.mjs");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "publication-dossier-test-"));
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");

function write(relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
  return target;
}

function run() {
  return spawnSync(process.execPath, [script, path.join(root, "publication-dossier.json"), "--root", root], {
    encoding: "utf8",
  });
}

const technical = "# Canonical target\n";
const editorial = "# Editorial target\n\nComplete behavior.\n";
const unchanged = "# Already current\n";
const judge = `# Refinement Judge — Demo

- Veredicto: PASS CON OBSERVACIONES
- Acción evaluada: Publicar una página técnica y una editorial en Notion
- Etapa de acción: Publication
- Alcance de acción: technical=1; editorial=1
- Snapshot revisado SHA-256: ${"a".repeat(64)}

## Hallazgos

### JUDGE-DEMO-001 — Riesgo controlado

- Severidad: Observation
- Estado: Open
- Bloquea acción: No
`;
const manifest = `${JSON.stringify({
  schema_version: 1,
  project: "demo",
  units: [
    { id: "05-user-stories", notion_page_id: "technical-page", local_path: "05-user-stories.md" },
    { id: "jira::US-OLD-01", notion_page_id: "excluded-page", local_path: "jira/US-OLD-01.md" },
    { id: "04-release-slices", notion_page_id: "verification-page", local_path: "04-release-slices.md" },
  ],
  presentations: [
    { id: "story:US-DEMO-01", notion_page_id: "editorial-page", remote_path: "_presentation/story.md" },
  ],
}, null, 2)}\n`;
const freshnessReceipt = `${JSON.stringify({
  ok: true,
  operation: "review-session-check",
  project: "demo",
  current: true,
  changed: [],
  session_file: "artifacts/_local/notion-sync/demo/review-session.json",
  remote_snapshot: "f".repeat(64),
  manifest_file: "artifacts/demo/manifest.json",
  manifest_sha256: sha(manifest),
  manifest_page_count: 4,
  checked_pages: 4,
  freshness_evidence_sha256: "1".repeat(64),
  checked_at: "2026-08-13T18:00:00.000Z",
}, null, 2)}\n`;

write("artifacts/demo/05-user-stories.md", technical);
write("artifacts/demo/04-release-slices.md", unchanged);
write("artifacts/_local/notion-publication-previews/run/demo/story.md", editorial);
write("artifacts/demo/11-refinement-judge-report.md", judge);
write("artifacts/demo/manifest.json", manifest);
write("artifacts/_local/notion-publication-previews/run/demo/freshness-receipt.json", freshnessReceipt);

const dossier = {
  schema_version: 3,
  intended_action: "notion_localized_publication",
  authorization_status: "pending",
  technical_pages: [{
    project: "demo",
    unit_id: "05-user-stories",
    notion_page_id: "technical-page",
    strategy: "patch",
    patch_plan: {
      strategy: "patch",
      anchor_occurrences: 1,
      old_fragment_sha256: "8".repeat(64),
      new_fragment_sha256: "9".repeat(64),
      target_sha256: sha(technical),
    },
    source_path: "artifacts/demo/05-user-stories.md",
    remote_sha256: "b".repeat(64),
    target_sha256: sha(technical),
  }],
  editorial_pages: [{
    project: "demo",
    presentation_id: "story:US-DEMO-01",
    notion_page_id: "editorial-page",
    classification: "update-complete",
    strategy: "replace",
    payload_path: "artifacts/_local/notion-publication-previews/run/demo/story.md",
    remote_sha256: "c".repeat(64),
    target_sha256: sha(editorial),
    source_ids: ["US-DEMO-01", "AC-DEMO-01-01"],
    reason: "Restore complete story parity",
  }],
  verification_pages: [{
    project: "demo",
    page_type: "technical",
    identity: "04-release-slices",
    notion_page_id: "verification-page",
    payload_path: "artifacts/demo/04-release-slices.md",
    remote_sha256: sha(unchanged),
    target_sha256: sha(unchanged),
    reason: "Remote already matches the approved payload",
  }],
  excluded_units: [{
    project: "demo",
    unit_id: "jira::US-OLD-01",
    classification: "historical_out_of_scope",
    local_sha256: "d".repeat(64),
    remote_sha256: "e".repeat(64),
  }],
  judge_reports: [{
    project: "demo",
    report_path: "artifacts/demo/11-refinement-judge-report.md",
    report_sha256: sha(judge),
    technical_count: 1,
    editorial_count: 1,
  }],
  freshness_receipts: [{
    project: "demo",
    receipt_path: "artifacts/_local/notion-publication-previews/run/demo/freshness-receipt.json",
    receipt_sha256: sha(freshnessReceipt),
    expected_page_count: 4,
  }],
  audit_entries: [{
    project: "demo",
    parent_page_id: "audit-parent",
    trigger: "verified_readback",
    payload_source: "verified_receipt",
  }],
  controls: {
    freshness_before_write: true,
    full_readback_written_pages: true,
    backup_before_write: true,
    rollback_from_backup: true,
  },
  expected_totals: {
    technical_pages: 1,
    editorial_pages: 1,
    verification_pages: 1,
    excluded_units: 1,
    freshness_pages: 4,
    audit_entries: 1,
  },
};

write("publication-dossier.json", `${JSON.stringify(dossier, null, 2)}\n`);
const valid = run();
assert.equal(valid.status, 0, valid.stderr);
assert.match(valid.stdout, /DOSSIER_SHA256: [0-9a-f]{64}/);

dossier.verification_pages[0].remote_sha256 = "0".repeat(64);
write("publication-dossier.json", `${JSON.stringify(dossier, null, 2)}\n`);
const invalidNoOp = run();
assert.notEqual(invalidNoOp.status, 0);
assert.match(invalidNoOp.stderr, /is not a no-op/);
dossier.verification_pages[0].remote_sha256 = sha(unchanged);

dossier.technical_pages[0].remote_sha256 = sha(technical);
write("publication-dossier.json", `${JSON.stringify(dossier, null, 2)}\n`);
const writeNoOp = run();
assert.notEqual(writeNoOp.status, 0);
assert.match(writeNoOp.stderr, /must move to verification_pages/);
dossier.technical_pages[0].remote_sha256 = "b".repeat(64);

write("artifacts/_local/notion-publication-previews/run/demo/story.md", `${editorial}Changed after approval.\n`);
const mutatedPayload = run();
assert.notEqual(mutatedPayload.status, 0);
assert.match(mutatedPayload.stderr, /target_sha256 does not match payload_path/);
write("artifacts/_local/notion-publication-previews/run/demo/story.md", editorial);

const previewJudge = judge.replace("Etapa de acción: Publication", "Etapa de acción: Preview");
write("artifacts/demo/11-refinement-judge-report.md", previewJudge);
dossier.judge_reports[0].report_sha256 = sha(previewJudge);
write("publication-dossier.json", `${JSON.stringify(dossier, null, 2)}\n`);
const previewOnly = run();
assert.notEqual(previewOnly.status, 0);
assert.match(previewOnly.stderr, /must declare Action stage/);

const inconsistentJudge = judge.replace("Bloquea acción: No", "Bloquea acción: Sí");
write("artifacts/demo/11-refinement-judge-report.md", inconsistentJudge);
dossier.judge_reports[0].report_sha256 = sha(inconsistentJudge);
write("publication-dossier.json", `${JSON.stringify(dossier, null, 2)}\n`);
const inconsistent = run();
assert.notEqual(inconsistent.status, 0);
assert.match(inconsistent.stderr, /inconsistent severity/);

write("artifacts/demo/11-refinement-judge-report.md", judge);
dossier.judge_reports[0].report_sha256 = sha(judge);
dossier.freshness_receipts[0].expected_page_count = 2;
write("publication-dossier.json", `${JSON.stringify(dossier, null, 2)}\n`);
const incompleteFreshness = run();
assert.notEqual(incompleteFreshness.status, 0);
assert.match(incompleteFreshness.stderr, /checked_pages does not match expected_page_count/);

dossier.freshness_receipts[0].expected_page_count = 4;
dossier.expected_totals.freshness_pages = 4;
const staleReceipt = freshnessReceipt.replace('"current": true', '"current": false');
write("artifacts/_local/notion-publication-previews/run/demo/freshness-receipt.json", staleReceipt);
dossier.freshness_receipts[0].receipt_sha256 = sha(staleReceipt);
write("publication-dossier.json", `${JSON.stringify(dossier, null, 2)}\n`);
const notCurrent = run();
assert.notEqual(notCurrent.status, 0);
assert.match(notCurrent.stderr, /successful current freshness receipt/);

fs.rmSync(root, { recursive: true, force: true });
process.stdout.write("OK: publication dossier regressions passed (8 checks)\n");
