#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { verifyMarkdownReadback } from "./markdown-transport.mjs";

const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const out = value("--out");
const baseFile = value("--base");
const manifestFile = value("--manifest");
const unitId = value("--unit-id");
if (!out) {
  console.error("Usage: serialize-notion-fetch.mjs --out <file>");
  process.exit(2);
}

const decode = (text) =>
  text
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&");

const cellText = (html) =>
  decode(
    html
      .replace(/<br\s*\/?\s*>/gi, "<br>")
      .replace(/\r?\n/g, " ")
      .replace(/<\/?(?:strong|b)>/gi, "**")
      .replace(/<\/?(?:em|i)>/gi, "_")
      .replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`")
      .replace(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
      .replace(/<[^>]+>/g, "")
      .trim(),
  ).replace(/\|/g, "\\|");

const tableToMarkdown = (attrs, html, continuation = false) => {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) =>
    [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
      cellText(cell[1]),
    ),
  );
  if (!rows.length) return "";
  const width = Math.max(...rows.map((row) => row.length));
  for (const row of rows) while (row.length < width) row.push("");
  if (continuation) return rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  const header = /header-row="true"/i.test(attrs) ? rows.shift() : Array(width).fill("");
  const lines = [
    `| ${header.join(" | ")} |`,
    `|${Array(width).fill("---").join("|")}|`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ];
  return lines.join("\n");
};

let input = fs.readFileSync(0, "utf8");
try {
  const parsed = JSON.parse(input);
  if (typeof parsed.text === "string") input = parsed.text;
} catch {
  // Connector responses may already be plain enhanced Markdown.
}

const content = input.match(/<content>\s*([\s\S]*?)\s*<\/content>/i);
if (!content) {
  console.error("Notion response does not contain a complete <content> block");
  process.exit(3);
}

let body = content[1].replace(/\r\n?/g, "\n");
let previousTableEnd = -1;
body = body.replace(/<table([^>]*)>([\s\S]*?)<\/table>/gi, (match, attrs, table, offset, source) => {
  const between = previousTableEnd >= 0 ? source.slice(previousTableEnd, offset) : "";
  const continuation = previousTableEnd >= 0 && /^\s*$/.test(between) && !/header-row="true"/i.test(attrs);
  previousTableEnd = offset + match.length;
  return tableToMarkdown(attrs, table, continuation);
});
const sourceLines = body.split("\n").map((line) => line.replace(/[ \t]+$/g, ""));
const formatted = [];
let fence = null;
const blank = () => {
  if (formatted.length && formatted.at(-1) !== "") formatted.push("");
};
const fenceMarker = (line) => line.match(/^\s{0,3}(`{3,}|~{3,})/u)?.[1] || null;
const closesFence = (line, activeFence) => {
  const marker = line.match(/^\s{0,3}(`{3,}|~{3,})\s*$/u)?.[1] || null;
  return Boolean(
    marker &&
    marker[0] === activeFence.character &&
    marker.length >= activeFence.length
  );
};
for (let index = 0; index < sourceLines.length; index += 1) {
  const line = sourceLines[index];
  if (fence) {
    formatted.push(line);
    if (closesFence(line, fence)) fence = null;
    continue;
  }
  const marker = fenceMarker(line);
  if (marker) {
    fence = { character: marker[0], length: marker.length };
    formatted.push(line);
    continue;
  }
  const previous = sourceLines[index - 1] || "";
  const next = sourceLines[index + 1] || "";
  const heading = /^#{1,6}\s/.test(line);
  const table = /^\|.*\|$/.test(line);
  const previousTable = /^\|.*\|$/.test(previous);
  const nextTable = /^\|.*\|$/.test(next);
  const quote = /^>/.test(line);
  if (heading || (table && !previousTable) || (quote && !/^>/.test(previous))) blank();
  formatted.push(line);
  if (heading || (table && !nextTable) || (quote && !/^>/.test(next))) blank();
}
body = formatted.join("\n");
body = `${body.replace(/\n*$/g, "")}\n`;

let equivalent = null;
if (baseFile) {
  if (!fs.existsSync(baseFile)) {
    console.error(`Base file does not exist: ${baseFile}`);
    process.exit(4);
  }
  let manifest = null;
  if (manifestFile || unitId) {
    if (!manifestFile || !unitId) {
      console.error("--manifest and --unit-id must be provided together");
      process.exit(4);
    }
    manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  }
  const base = fs.readFileSync(baseFile, "utf8");
  equivalent = verifyMarkdownReadback(base, body, { manifest, unitId }).ok;
  if (equivalent) body = `${base.replace(/\r\n?/g, "\n").replace(/\n*$/g, "")}\n`;
}

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, body, "utf8");
console.log(JSON.stringify({ ok: true, out: path.resolve(out), bytes: Buffer.byteLength(body), equivalent }));
