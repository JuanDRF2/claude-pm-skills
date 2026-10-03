#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { verifyMarkdownReadback } from "./markdown-transport.mjs";

const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const planPath = value("--plan");
const outPath = value("--out");
const root = path.resolve(value("--root") || process.cwd());
const fail = (message, details = {}) => {
  console.error(JSON.stringify({ ok: false, message, ...details }, null, 2));
  process.exit(1);
};
if (!planPath || !outPath) fail("Usage: verify-presentation-parity.mjs --plan <plan.json> --out <receipt.json> [--root <workspace>]");
const plan = JSON.parse(fs.readFileSync(path.resolve(planPath), "utf8"));
if (!Array.isArray(plan.presentations)) fail("Plan must include a presentations array");
if (!plan.presentations.length && !plan.not_applicable_reason) {
  fail("An empty presentation plan must include not_applicable_reason");
}
const manifest = plan.manifest_path
  ? JSON.parse(fs.readFileSync(path.resolve(root, plan.manifest_path), "utf8"))
  : null;
const seen = new Set();
const results = [];
for (const item of plan.presentations) {
  if (!item.id || seen.has(item.id)) fail("Presentation IDs must be unique", { id: item.id });
  seen.add(item.id);
  const expectedPath = path.resolve(root, item.expected_path || "");
  const readbackPath = path.resolve(root, item.readback_path || "");
  if (!fs.existsSync(expectedPath) || !fs.existsSync(readbackPath)) {
    results.push({ id: item.id, type: item.type, ok: false, mode: "missing-file" });
    continue;
  }
  const expected = fs.readFileSync(expectedPath);
  const actual = fs.readFileSync(readbackPath);
  const verification = verifyMarkdownReadback(expected, actual, {
    manifest,
    unitId: item.manifest_id || item.id,
  });
  results.push({
    id: item.id,
    type: item.type || "auxiliary",
    notion_page_id: item.notion_page_id || null,
    ok: verification.ok,
    mode: verification.mode,
    expected_sha256: crypto.createHash("sha256").update(expected).digest("hex"),
    readback_sha256: crypto.createHash("sha256").update(actual).digest("hex"),
  });
}
const receipt = {
  schema_version: 1,
  ok: results.every((item) => item.ok),
  project: plan.project,
  final_snapshot: plan.final_snapshot,
  checked_at: new Date().toISOString(),
  presentations_expected: results.length,
  presentations_verified: results.filter((item) => item.ok).length,
  not_applicable_reason: plan.not_applicable_reason || null,
  by_type: Object.fromEntries([...new Set(results.map((item) => item.type))].map((type) => [
    type,
    {
      expected: results.filter((item) => item.type === type).length,
      verified: results.filter((item) => item.type === type && item.ok).length,
    },
  ])),
  presentations: results,
};
fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
fs.writeFileSync(path.resolve(outPath), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt, null, 2));
process.exit(receipt.ok ? 0 : 2);
