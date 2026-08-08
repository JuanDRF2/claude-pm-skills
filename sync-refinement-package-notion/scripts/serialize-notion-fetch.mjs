#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

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
const blank = () => {
  if (formatted.length && formatted.at(-1) !== "") formatted.push("");
};
for (let index = 0; index < sourceLines.length; index += 1) {
  const line = sourceLines[index];
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

const semantic = (text, manifest = null, unit = null) => {
  let normalized = text.replace(/\r\n?/g, "\n");
  normalized = normalized.replace(
    /<mention-page\s+url="([^"]+)"[^>]*>[\s\S]*?<\/mention-page>/gi,
    "$1",
  );
  if (manifest && unit) {
    const current = manifest.units.find((item) => item.id === unit);
    const currentDir = path.posix.dirname(current?.local_path || ".");
    for (const target of manifest.units || []) {
      const compact = String(target.notion_page_id || "").replace(/-/g, "");
      if (!compact || !target.local_path) continue;
      let relative = path.posix.relative(currentDir, target.local_path);
      if (!relative.startsWith(".")) relative = `./${relative}`;
      if (currentDir === ".") relative = relative.replace(/^\.\//, "");
      normalized = normalized.replace(
        new RegExp(`https://(?:www\\.)?(?:app\\.)?notion\\.(?:com|so)/p/${compact}`, "gi"),
        relative,
      );
    }
  }
  return normalized
    .replace(/\\\$/g, "$")
    .replace(/\*{4}(`[^`]+`)\*{4}/g, "$1")
    .replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)\[([^\]]+)\]\(\2\)/g, "[$1$3]($2)")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<\/?page>/gi, "")
    .replace(/[`*_\\]/g, "")
    .replace(/\|\s*:?-+:?\s*(?=\|)/g, "|---")
    .split("\n")
    .map((line) => line.replace(/^\s*(?:#{1,6}|[-+>])\s*/, "").trimEnd())
    .filter((line) => !/^\|(?:\s*(?:---)?\s*\|)+$/.test(line))
    .filter((line) => line.trim() !== "")
    .join("\n")
    .trim();
};

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
  equivalent = semantic(body, manifest, unitId) === semantic(base, manifest, unitId);
  if (equivalent) body = `${base.replace(/\r\n?/g, "\n").replace(/\n*$/g, "")}\n`;
}

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, body, "utf8");
console.log(JSON.stringify({ ok: true, out: path.resolve(out), bytes: Buffer.byteLength(body), equivalent }));
