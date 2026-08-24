#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dossierArg = args.shift();
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const fail = (message, errors = []) => {
  console.error(JSON.stringify({ ok: false, message, errors }, null, 2));
  process.exit(1);
};
if (!dossierArg) fail("Usage: validate-audit-dossier.mjs <dossier.json> [--root <workspace>]");
const root = path.resolve(value("--root") || process.cwd());
const dossierPath = path.resolve(dossierArg);
if (!fs.existsSync(dossierPath)) fail("Audit dossier not found", [dossierPath]);
let dossier;
try { dossier = JSON.parse(fs.readFileSync(dossierPath, "utf8")); }
catch (error) { fail("Audit dossier is not valid JSON", [error.message]); }
const sha = (body) => crypto.createHash("sha256").update(body).digest("hex");
const hex = (value) => /^[a-f0-9]{64}$/u.test(value || "");
const resolveSafe = (candidate) => {
  const file = path.resolve(root, candidate || "");
  return file === root || file.startsWith(`${root}${path.sep}`) ? file : null;
};
const errors = [];
if (dossier.schema_version !== 1) errors.push("schema_version must be 1");
if (dossier.intended_action !== "notion_audit_entries") errors.push("intended_action must be notion_audit_entries");
if (!Array.isArray(dossier.audit_entries) || !dossier.audit_entries.length) errors.push("audit_entries must be a non-empty array");
const identities = new Set();
for (const [index, entry] of (dossier.audit_entries || []).entries()) {
  const label = `audit_entries[${index}]`;
  for (const field of ["project", "parent_page_id", "title", "payload_path", "payload_sha256", "final_snapshot", "judge_report_path", "judge_report_sha256"]) {
    if (typeof entry[field] !== "string" || !entry[field].trim()) errors.push(`${label}.${field} is required`);
  }
  const identity = `${entry.parent_page_id}::${entry.title}`;
  if (identities.has(identity)) errors.push(`${label} duplicates parent/title identity`);
  identities.add(identity);
  for (const [pathField, hashField] of [["payload_path", "payload_sha256"], ["judge_report_path", "judge_report_sha256"]]) {
    const file = resolveSafe(entry[pathField]);
    if (!file) errors.push(`${label}.${pathField} escapes root`);
    else if (!fs.existsSync(file)) errors.push(`${label}.${pathField} not found`);
    else if (!hex(entry[hashField]) || sha(fs.readFileSync(file)) !== entry[hashField]) errors.push(`${label}.${hashField} does not match file`);
  }
  if (!hex(entry.final_snapshot)) errors.push(`${label}.final_snapshot must be SHA-256`);
  const judgeFile = resolveSafe(entry.judge_report_path);
  if (judgeFile && fs.existsSync(judgeFile)) {
    const judge = fs.readFileSync(judgeFile, "utf8");
    const stage = judge.match(/(?:Action stage|Etapa de acci[oó]n)\s*:\s*([^\n]+)/i)?.[1]?.trim();
    const snapshot = judge.match(/(?:Reviewed snapshot SHA-256|Snapshot revisado SHA-256)\s*:\s*`?([a-f0-9]{64})/i)?.[1];
    if (stage !== "Post-publication") errors.push(`${label} Judge stage must be Post-publication`);
    if (snapshot !== entry.final_snapshot) errors.push(`${label} Judge snapshot does not match final_snapshot`);
  }
  if (!Array.isArray(entry.parity_receipts) || !entry.parity_receipts.length) {
    errors.push(`${label}.parity_receipts must include every affected presentation class`);
  } else {
    for (const [receiptIndex, receipt] of entry.parity_receipts.entries()) {
      const file = resolveSafe(receipt.path);
      if (!file || !fs.existsSync(file)) errors.push(`${label}.parity_receipts[${receiptIndex}] not found`);
      else if (!hex(receipt.sha256) || sha(fs.readFileSync(file)) !== receipt.sha256) errors.push(`${label}.parity_receipts[${receiptIndex}] hash mismatch`);
      else {
        const body = JSON.parse(fs.readFileSync(file, "utf8"));
        if (body.ok !== true) errors.push(`${label}.parity_receipts[${receiptIndex}] is not successful`);
      }
    }
  }
  if (entry.status === "complete") {
    for (const field of ["entry_page_id", "readback_path", "readback_sha256", "created_at", "duplicate_check_at"]) {
      if (typeof entry[field] !== "string" || !entry[field].trim()) errors.push(`${label}.${field} is required when complete`);
    }
    const readback = resolveSafe(entry.readback_path);
    if (readback && fs.existsSync(readback)) {
      if (!hex(entry.readback_sha256) || sha(fs.readFileSync(readback)) !== entry.readback_sha256) errors.push(`${label}.readback_sha256 mismatch`);
    } else errors.push(`${label}.readback_path not found`);
    if (entry.duplicate_count !== 0) errors.push(`${label}.duplicate_count must be 0`);
  }
}
const expected = dossier.expected_totals?.audit_entries;
if (expected !== undefined && expected !== (dossier.audit_entries || []).length) errors.push("expected_totals.audit_entries mismatch");
if (errors.length) fail("Audit dossier validation failed", errors);
const canonical = `${JSON.stringify(dossier, null, 2)}\n`;
console.log(JSON.stringify({
  ok: true,
  audit_entries: dossier.audit_entries.length,
  complete: dossier.audit_entries.filter((item) => item.status === "complete").length,
  AUDIT_DOSSIER_SHA256: sha(Buffer.from(canonical)),
}, null, 2));
