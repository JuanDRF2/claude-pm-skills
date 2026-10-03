#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const receiptArg = args.shift();
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const fail = (message, errors = []) => {
  console.error(JSON.stringify({ ok: false, message, errors }, null, 2));
  process.exit(1);
};
if (!receiptArg) fail("Usage: validate-final-receipt.mjs <receipt.json> [--root <workspace>]");
const root = path.resolve(value("--root") || process.cwd());
const receiptPath = path.resolve(receiptArg);
if (!fs.existsSync(receiptPath)) fail("Receipt not found", [receiptPath]);
const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
const errors = [];
const sha = (body) => crypto.createHash("sha256").update(body).digest("hex");
const resolveSafe = (candidate) => {
  const file = path.resolve(root, candidate || "");
  return file === root || file.startsWith(`${root}${path.sep}`) ? file : null;
};
if (receipt.schema_version !== 3) errors.push("schema_version must be 3");
if (receipt.audit_status !== "complete") errors.push("audit_status must be complete");
if (!receipt.final_snapshot || !/^[a-f0-9]{64}$/u.test(receipt.final_snapshot)) errors.push("final_snapshot is invalid");
if (receipt.readback?.pages_expected !== receipt.readback?.pages_verified || receipt.readback?.mismatches !== 0) {
  errors.push("readback is incomplete or has mismatches");
}
if (!receipt.post_publication_judge || receipt.post_publication_judge.stage !== "Post-publication") {
  errors.push("post_publication_judge is missing or has the wrong stage");
} else if (receipt.post_publication_judge.reviewed_snapshot !== receipt.final_snapshot) {
  errors.push("post_publication_judge reviewed a different snapshot");
}
if (!receipt.presentation_verification || receipt.presentation_verification.expected !== receipt.presentation_verification.verified) {
  errors.push("presentation verification is incomplete");
}
if (!receipt.audit_entry_receipt || receipt.audit_entry_receipt.duplicate_count !== 0 || !receipt.entry_page_id) {
  errors.push("audit entry readback or duplicate evidence is incomplete");
}
const runLink = receipt.publication_run;
if (!runLink || typeof runLink.receipt !== "string" || !/^[a-f0-9]{64}$/u.test(runLink.sha256 || "")) {
  errors.push("publication_run receipt link and SHA-256 are required");
} else {
  const runReceiptPath = resolveSafe(runLink.receipt);
  if (!runReceiptPath || !fs.existsSync(runReceiptPath)) {
    errors.push(`publication run receipt not found: ${runLink.receipt}`);
  } else {
    const runBytes = fs.readFileSync(runReceiptPath);
    if (sha(runBytes) !== runLink.sha256) errors.push("publication_run.sha256 does not match its receipt");
    let runReceipt;
    try { runReceipt = JSON.parse(runBytes.toString("utf8")); }
    catch (error) { errors.push(`publication run receipt is not valid JSON: ${error.message}`); }
    if (runReceipt) {
      const project = runReceipt.projects?.[receipt.project];
      if (runReceipt.schema_version !== 2 || runReceipt.operation !== "notion-publication-run-receipt" || runReceipt.status !== "verified") {
        errors.push("publication run receipt is not a verified schema-2 receipt");
      }
      if (!project || project.verified !== project.total || project.pending || project.failed || project.blocked) {
        errors.push("publication run does not verify every page for this project");
      } else if (
        receipt.readback?.pages_expected !== project.total ||
        runLink.pages_total !== project.total ||
        runLink.pages_verified !== project.verified
      ) {
        errors.push("publication_run page counts do not match the final receipt");
      }
      if (runReceipt.final_snapshots?.[receipt.project] !== receipt.final_snapshot) {
        errors.push("publication run final snapshot does not match the project receipt");
      }
      if (runReceipt.dossier_sha256 !== receipt.dossier_sha256) {
        errors.push("publication run dossier does not match the authorized final receipt");
      }
      if (JSON.stringify(runLink.metrics) !== JSON.stringify(runReceipt.metrics)) {
        errors.push("publication_run metrics do not match their immutable receipt");
      }
      if (JSON.stringify(runLink.operation_budget) !== JSON.stringify(runReceipt.operation_budget)) {
        errors.push("publication_run operation budget does not match its immutable receipt");
      }
      for (const field of ["started_at", "completed_at", "duration_ms"]) {
        if (runLink[field] !== runReceipt[field]) errors.push(`publication_run.${field} does not match its immutable receipt`);
      }
      if (runReceipt.metrics?.metadata_checks !== 1) errors.push("publication run must contain exactly one final metadata check");
      if (runReceipt.metrics?.metadata_pages_checked !== runReceipt.freshness_pages_expected) {
        errors.push("publication run metadata coverage is incomplete");
      }
      if (runReceipt.metrics?.content_reads < runReceipt.pages_total) errors.push("publication run content readback is incomplete");
      if (runReceipt.metrics?.writes < runReceipt.pages_total) errors.push("publication run write count is incomplete");
      const acknowledgedMetrics = new Set(
        (runReceipt.budget_overruns || []).flatMap((item) => (item.exceeded || []).map((entry) => entry.metric)),
      );
      for (const [metric, budget] of Object.entries(runReceipt.operation_budget || {})) {
        if (
          Number(runReceipt.metrics?.[metric] || 0) > Number(budget) &&
          !acknowledgedMetrics.has(metric)
        ) errors.push(`publication run has an unexplained operation budget overrun for ${metric}`);
      }
      if (JSON.stringify(runLink.budget_overruns || []) !== JSON.stringify(runReceipt.budget_overruns || [])) {
        errors.push("publication_run budget overruns do not match their immutable receipt");
      }
      const projectPages = (runReceipt.pages || []).filter((item) => item.project === receipt.project);
      if (projectPages.length !== project?.total) errors.push("publication run page ledger is incomplete for the project");
      for (const page of projectPages) {
        const evidenceFile = resolveSafe(page.evidence?.path);
        if (!evidenceFile || !fs.existsSync(evidenceFile)) {
          errors.push(`publication page evidence not found: ${page.notion_page_id}`);
        } else if (sha(fs.readFileSync(evidenceFile)) !== page.evidence.sha256) {
          errors.push(`publication page evidence hash mismatch: ${page.notion_page_id}`);
        }
      }
    }
  }
}
for (const evidence of [receipt.post_publication_judge, receipt.presentation_verification, receipt.audit_entry_receipt]) {
  const candidate = evidence?.report || evidence?.receipt || evidence?.path;
  if (!candidate) continue;
  const file = resolveSafe(candidate);
  if (!file || !fs.existsSync(file)) errors.push(`evidence file not found: ${candidate}`);
  else if (evidence.sha256 && sha(fs.readFileSync(file)) !== evidence.sha256) errors.push(`evidence hash mismatch: ${candidate}`);
}
if (receipt.editorial_verification_required && !receipt.editorial_verification) {
  errors.push("story editorial verification is required but missing");
}
if (errors.length) fail("Final receipt validation failed", errors);
console.log(JSON.stringify({
  ok: true,
  project: receipt.project,
  final_snapshot: receipt.final_snapshot,
  entry_page_id: receipt.entry_page_id,
  publication_run_sha256: receipt.publication_run.sha256,
  metrics: receipt.publication_run.metrics,
  receipt_sha256: sha(fs.readFileSync(receiptPath)),
}, null, 2));
