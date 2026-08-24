#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  canonicalLinkTarget,
  findInvalidPublishedMarkdownLinks,
  normalizeBuffer,
} from "./markdown-transport.mjs";

const args = process.argv.slice(2);
const command = args.shift();
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const fail = (message, details = {}) => {
  console.error(JSON.stringify({ ok: false, message, ...details }, null, 2));
  process.exit(1);
};
const readJson = (file, label) => {
  if (!file || !fs.existsSync(file)) fail(`${label} not found`, { path: file });
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${label} is not valid JSON`, { path: file, error: error.message });
  }
};

if (!command || !["resolve", "validate"].includes(command)) {
  fail("Usage: resolve-notion-links.mjs <resolve|validate> --manifest <file> --unit-id <id> --in <file> [--out <file>] [--expected <receipt.json>]");
}

const manifestPath = value("--manifest");
const unitId = value("--unit-id");
const inputPath = value("--in");
if (!manifestPath || !unitId || !inputPath) fail("--manifest, --unit-id and --in are required");
const manifest = readJson(path.resolve(manifestPath), "Manifest");
const items = [...(manifest.units || []), ...(manifest.presentations || [])];
const current = items.find((item) => item.id === unitId);
if (!current) fail("Unit is not present in manifest", { unit_id: unitId });
if (!fs.existsSync(inputPath)) fail("Input file not found", { path: inputPath });
const source = fs.readFileSync(inputPath, "utf8");

const links = [];
const resolvedBody = source.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (full, label, target) => {
  const canonical = canonicalLinkTarget(target, { manifest, unitId });
  if (!canonical.startsWith("notion:")) return full;
  const notionPageId = canonical.slice("notion:".length);
  const notionUrl = `https://www.notion.so/${notionPageId}`;
  links.push({ label, original_target: target, notion_page_id: notionPageId, resolved_target: notionUrl });
  return `[${label}](${notionUrl})`;
});

if (command === "resolve") {
  const unresolved = [...resolvedBody.matchAll(/\[[^\]]*\]\((?!https?:|mailto:|#)([^)\s]+\.md(?:[?#][^)\s]*)?)\)/gi)]
    .map((match) => match[1]);
  const invalid = findInvalidPublishedMarkdownLinks(resolvedBody);
  if (unresolved.length || invalid.length) {
    fail("Internal Markdown links were not resolved safely", { unresolved, invalid });
  }
  const out = value("--out");
  if (!out) fail("--out is required for resolve");
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, normalizeBuffer(resolvedBody));
  const receipt = {
    schema_version: 1,
    ok: true,
    operation: "resolve-notion-links",
    unit_id: unitId,
    source_path: path.resolve(inputPath),
    output_path: path.resolve(out),
    links,
  };
  const receiptPath = value("--receipt");
  if (receiptPath) {
    fs.mkdirSync(path.dirname(path.resolve(receiptPath)), { recursive: true });
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  }
  console.log(JSON.stringify(receipt, null, 2));
  process.exit(0);
}

const expectedPath = value("--expected");
if (!expectedPath) fail("--expected is required for validate");
const expected = readJson(path.resolve(expectedPath), "Link receipt");
const actualTargets = new Set(
  [...source.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)]
    .map((match) => canonicalLinkTarget(match[1], { manifest, unitId })),
);
const missing = (expected.links || [])
  .filter((item) => !actualTargets.has(`notion:${String(item.notion_page_id).replace(/-/g, "").toLowerCase()}`));
const invalid = findInvalidPublishedMarkdownLinks(source);
if (missing.length || invalid.length) fail("Published link validation failed", { missing, invalid });
console.log(JSON.stringify({
  schema_version: 1,
  ok: true,
  operation: "validate-notion-links",
  unit_id: unitId,
  links_expected: (expected.links || []).length,
  links_verified: (expected.links || []).length,
  invalid_links: 0,
}, null, 2));
