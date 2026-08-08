#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const planFile = value("--plan");
const outFile = value("--out");
if (!planFile || !outFile) {
  console.error("Usage: verify-editorial-parity.mjs --plan <json> --out <receipt.json>");
  process.exit(2);
}

const read = (file) => fs.readFileSync(path.resolve(file), "utf8");
const unique = (items) => [...new Set(items)];
const unwrap = (raw) => {
  let body = raw;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.text === "string") body = parsed.text;
  } catch {
    // Serialized presentation Markdown is also accepted.
  }
  const content = body.match(/<content>\s*([\s\S]*?)\s*<\/content>/i);
  return (content ? content[1] : body).replace(/\r\n?/g, "\n");
};
const fold = (text) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&(?:nbsp|amp|lt|gt|quot);/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[`*_~\[\](){}|:;,.!?¿¡#>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const ids = (body, prefix) =>
  unique([...body.matchAll(new RegExp(`\\b${prefix}-[A-Z0-9]+(?:-[A-Z0-9]+)*\\b`, "g"))].map((m) => m[0]));

const scenarioBlocks = (body) => {
  const lines = body.split("\n");
  const blocks = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^(#{3,6})\s+.*?\b(SC-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b/);
    if (!heading) continue;
    const level = heading[1].length;
    let end = index + 1;
    while (end < lines.length) {
      const next = lines[end].match(/^(#{1,6})\s+/);
      if (next && next[1].length <= level) break;
      end += 1;
    }
    blocks.set(heading[2], lines.slice(index, end).join("\n"));
  }
  return blocks;
};
const acceptanceBlocks = (body) => {
  const lines = body.split("\n");
  const blocks = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^(#{2,6})\s+.*?\b(AC-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b/);
    if (!heading) continue;
    const level = heading[1].length;
    let end = index + 1;
    while (end < lines.length) {
      const next = lines[end].match(/^(#{1,6})\s+/);
      if (next && next[1].length <= level) break;
      end += 1;
    }
    blocks.set(heading[2], lines.slice(index, end).join("\n"));
  }
  return blocks;
};
const acceptanceClauses = (block) =>
  block
    .split("\n")
    .filter((line) => /(?:Acceptance condition|Condici[oó]n de aceptaci[oó]n)\s*:/i.test(line))
    .map((line) => fold(line))
    .filter(Boolean);
const behaviorClauses = (block) =>
  block
    .split("\n")
    .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
    .filter((line) => /^\*{0,2}(?:dado|given|cuando|when|entonces|then|y|and|pero|but)\*{0,2}\s*:?(?:\s|$)/i.test(line))
    .map((line) => fold(line))
    .filter(Boolean);

const plan = JSON.parse(read(planFile));
if (!plan.project || !Array.isArray(plan.stories) || !plan.stories.length) {
  throw new Error("Editorial plan requires project and at least one story");
}
const results = [];
for (const story of plan.stories) {
  const canonical = unwrap(read(story.canonical_path));
  const presentation = unwrap(read(story.presentation_path));
  const expected = {
    AC: ids(canonical, "AC"),
    SC: ids(canonical, "SC"),
    CHK: ids(canonical, "CHK"),
    FTC: ids(canonical, "FTC"),
  };
  const missingIds = [];
  for (const [kind, expectedIds] of Object.entries(expected)) {
    const actual = new Set(ids(presentation, kind));
    for (const id of expectedIds) if (!actual.has(id)) missingIds.push(id);
  }
  const sourceScenarios = scenarioBlocks(canonical);
  const remoteScenarios = scenarioBlocks(presentation);
  const sourceCriteria = acceptanceBlocks(canonical);
  const remoteCriteria = acceptanceBlocks(presentation);
  const acceptanceFindings = [];
  for (const [criterionId, sourceBlock] of sourceCriteria) {
    const remoteBlock = remoteCriteria.get(criterionId);
    if (!remoteBlock) continue;
    const remoteFolded = fold(remoteBlock);
    const missingClauses = acceptanceClauses(sourceBlock).filter((clause) => !remoteFolded.includes(clause));
    if (missingClauses.length) {
      acceptanceFindings.push({ criterion_id: criterionId, issue: "missing-acceptance-content", missing_clauses: missingClauses });
    }
  }
  const scenarioFindings = [];
  for (const [scenarioId, sourceBlock] of sourceScenarios) {
    const remoteBlock = remoteScenarios.get(scenarioId);
    if (!remoteBlock) {
      scenarioFindings.push({ scenario_id: scenarioId, issue: "missing-scenario" });
      continue;
    }
    const remoteFolded = fold(remoteBlock);
    const missingClauses = behaviorClauses(sourceBlock).filter((clause) => !remoteFolded.includes(clause));
    if (missingClauses.length) {
      scenarioFindings.push({ scenario_id: scenarioId, issue: "missing-behavior", missing_clauses: missingClauses });
    }
  }
  results.push({
    story_id: story.story_id,
    notion_page_id: story.notion_page_id || null,
    canonical_path: story.canonical_path,
    presentation_path: story.presentation_path,
    expected_counts: Object.fromEntries(Object.entries(expected).map(([key, items]) => [key, items.length])),
    missing_ids: unique(missingIds),
    acceptance_findings: acceptanceFindings,
    scenario_findings: scenarioFindings,
    ok: missingIds.length === 0 && acceptanceFindings.length === 0 && scenarioFindings.length === 0,
  });
}
const receipt = {
  schema_version: 1,
  operation: "notion-editorial-parity",
  project: plan.project,
  checked_at: new Date().toISOString(),
  source: "notion-readback",
  stories: results,
  ok: results.every((item) => item.ok),
};
fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
fs.writeFileSync(path.resolve(outFile), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(JSON.stringify(receipt, null, 2));
process.exit(receipt.ok ? 0 : 3);
