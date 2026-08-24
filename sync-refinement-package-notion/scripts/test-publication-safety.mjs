#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  applyPatchPlan,
  buildPatchPlan,
  findInvalidPublishedMarkdownLinks,
  verifyMarkdownReadback,
  verifyThreeWayPatch,
} from "./markdown-transport.mjs";

const scripts = path.dirname(fileURLToPath(import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), "publication-safety-"));
const write = (relative, body) => {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  return file;
};
const writeJson = (relative, body) => write(relative, `${JSON.stringify(body, null, 2)}\n`);
const run = (script, ...args) => spawnSync(process.execPath, [path.join(scripts, script), ...args], {
  cwd: root,
  encoding: "utf8",
});

try {
  const manifest = {
    units: [
      { id: "rules", local_path: "02-rules.md", notion_page_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
      { id: "contract", local_path: "11-contract.md", notion_page_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" },
    ],
  };
  const expected = "# Rules\n\nPrice: $10\n\n[Contract](11-contract.md)\n\n**`code`**\n";
  const actual = "Price: \\$10\n[Contract](https://www.notion.so/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb)\n`code`\n";
  assert.equal(verifyMarkdownReadback(expected, actual, { manifest, unitId: "rules" }).ok, true);
  assert.equal(
    verifyMarkdownReadback(expected, actual.replace("bbbbbbbb", "cccccccc"), { manifest, unitId: "rules" }).ok,
    false,
  );
  assert.deepEqual(findInvalidPublishedMarkdownLinks("[bad](https://11-contract.md)"), ["https://11-contract.md"]);

  const semanticTarget = `# Caso

Introducción.

- Uno
- Dos

| Campo | Valor |
| --- | --- |
| A | B |

\`\`\`gherkin
Dado un estado
Cuando ocurre el evento
Entonces se conserva
\`\`\`
`;
  const semanticReadback = semanticTarget
    .replace("Introducción.\n\n- Uno", "Introducción.\n- Uno")
    .replace("| --- | --- |", "|---|---|");
  assert.equal(verifyMarkdownReadback(semanticTarget, semanticReadback).ok, true);
  assert.equal(verifyMarkdownReadback(semanticTarget, semanticReadback.replace("- Dos", "  - Dos")).ok, false);
  assert.equal(verifyMarkdownReadback(semanticTarget, semanticReadback.replace("Entonces se conserva", "Entonces se elimina")).ok, false);

  const before = "# Page\n\nA\n\nB old\n\nC\n";
  const target = "# Page\n\nA\n\nB new\n\nC\n";
  const patch = buildPatchPlan(before, target);
  assert.equal(patch.strategy, "patch");
  assert.equal(crypto.createHash("sha256").update(applyPatchPlan(before, patch)).digest("hex"), crypto.createHash("sha256").update(target).digest("hex"));
  assert.equal(verifyThreeWayPatch({ base: before, target, actual: target }).ok, true);
  assert.equal(verifyThreeWayPatch({ base: before, target, actual: target.replace("C", "D") }).ok, false);

  writeJson("manifest.json", manifest);
  write("02-rules.md", expected);
  const resolved = run("resolve-notion-links.mjs", "resolve", "--manifest", "manifest.json", "--unit-id", "rules", "--in", "02-rules.md", "--out", "resolved.md", "--receipt", "links.json");
  assert.equal(resolved.status, 0, resolved.stderr);
  assert.match(fs.readFileSync(path.join(root, "resolved.md"), "utf8"), /notion\.so\/bbbbbbbb/);
  const linkCheck = run("resolve-notion-links.mjs", "validate", "--manifest", "manifest.json", "--unit-id", "rules", "--in", "resolved.md", "--expected", "links.json");
  assert.equal(linkCheck.status, 0, linkCheck.stderr);

  const technical = write("target.md", "Target\n");
  const dossier = {
    schema_version: 3,
    technical_pages: [{ project: "demo", unit_id: "rules", notion_page_id: "page-1", target_sha256: "a".repeat(64), strategy: "patch", source_path: technical }],
    editorial_pages: [{ project: "demo", presentation_id: "cover", notion_page_id: "page-2", target_sha256: "b".repeat(64), strategy: "replace", payload_path: technical }],
    verification_pages: [{ project: "demo", page_type: "technical", identity: "already-current", notion_page_id: "page-3", target_sha256: "c".repeat(64), remote_sha256: "c".repeat(64), payload_path: technical }],
    excluded_units: [], controls: {},
  };
  writeJson("dossier.json", dossier);
  const page1Evidence = writeJson("page-1-readback.json", { ok: true, page: "page-1" });
  const page2Evidence = writeJson("page-2-readback.json", { ok: true, page: "page-2" });
  const page3Evidence = writeJson("page-3-readback.json", { ok: true, page: "page-3" });
  const page1EvidenceSha = crypto.createHash("sha256").update(fs.readFileSync(page1Evidence)).digest("hex");
  const page2EvidenceSha = crypto.createHash("sha256").update(fs.readFileSync(page2Evidence)).digest("hex");
  const page3EvidenceSha = crypto.createHash("sha256").update(fs.readFileSync(page3Evidence)).digest("hex");
  const init = run("publication-run.mjs", "init", "--run", "run.json", "--dossier", "dossier.json");
  assert.equal(init.status, 0, init.stderr);
  assert.notEqual(run("publication-run.mjs", "record", "--run", "run.json", "--page-id", "page-3", "--state", "written").status, 0);
  assert.equal(run(
    "publication-run.mjs", "record", "--run", "run.json", "--page-id", "page-3",
    "--state", "verified-exact", "--evidence", "page-3-readback.json",
    "--evidence-sha256", page3EvidenceSha,
  ).status, 0);
  assert.equal(run("publication-run.mjs", "record", "--run", "run.json", "--page-id", "page-1", "--state", "written").status, 0);
  assert.equal(run(
    "publication-run.mjs", "record", "--run", "run.json", "--page-id", "page-1",
    "--state", "verified-three-way", "--evidence", "page-1-readback.json",
    "--evidence-sha256", page1EvidenceSha,
  ).status, 0);
  const continuation = run("publication-run.mjs", "continue", "--run", "run.json", "--out", "continuation.json");
  assert.equal(continuation.status, 0, continuation.stderr);
  const continued = JSON.parse(fs.readFileSync(path.join(root, "continuation.json"), "utf8"));
  assert.equal(continued.technical_pages.length, 0);
  assert.equal(continued.editorial_pages.length, 1);
  assert.equal(continued.verification_pages.length, 0);
  assert.equal(run("publication-run.mjs", "metric", "--run", "run.json", "--metric", "metadata_checks", "--count", "1").status, 0);
  assert.equal(run("publication-run.mjs", "metric", "--run", "run.json", "--metric", "metadata_pages_checked", "--count", "3").status, 0);
  assert.equal(run("publication-run.mjs", "metric", "--run", "run.json", "--metric", "content_reads", "--count", "3").status, 0);
  assert.equal(run("publication-run.mjs", "record", "--run", "run.json", "--page-id", "page-2", "--state", "written").status, 0);
  assert.equal(run(
    "publication-run.mjs", "record", "--run", "run.json", "--page-id", "page-2",
    "--state", "verified-exact", "--evidence", "page-2-readback.json",
    "--evidence-sha256", page2EvidenceSha,
  ).status, 0);
  const close = run(
    "publication-run.mjs", "close", "--run", "run.json", "--out", "publication-run-receipt.json",
    "--final-snapshot", "f".repeat(64), "--root", root,
  );
  assert.equal(close.status, 0, close.stderr);
  const runReceipt = JSON.parse(fs.readFileSync(path.join(root, "publication-run-receipt.json"), "utf8"));
  assert.equal(runReceipt.status, "verified");
  assert.equal(runReceipt.pages_verified, 3);
  assert.equal(runReceipt.pages_written, 2);
  assert.equal(runReceipt.pages_verification_only, 1);
  assert.deepEqual(runReceipt.metrics, {
    metadata_checks: 1,
    metadata_pages_checked: 3,
    content_reads: 3,
    writes: 2,
    retries: 0,
  });

  const presentationPlan = {
    project: "demo", final_snapshot: "f".repeat(64), presentations: [{
      id: "cover", type: "cover", expected_path: "expected-cover.md", readback_path: "actual-cover.md",
    }],
  };
  write("expected-cover.md", "# Cover\n\nApproved\n");
  write("actual-cover.md", "Approved\n");
  writeJson("presentation-plan.json", presentationPlan);
  const parity = run("verify-presentation-parity.mjs", "--plan", "presentation-plan.json", "--out", "presentation-receipt.json", "--root", root);
  assert.equal(parity.status, 0, parity.stderr);
  assert.equal(JSON.parse(parity.stdout).presentations_verified, 1);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log("OK: conservative Markdown, no-op suppression, links, patching, resumption, metrics and presentation parity passed (33 checks)");
