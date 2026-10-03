#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "");
if (!process.argv[2] || !existsSync(root)) {
  console.error("Usage: node validate-artifacts.mjs <artifact-directory>");
  process.exit(2);
}

const errors = [];
const warnings = [];
const read = (name) => {
  const path = join(root, name);
  if (!existsSync(path)) { errors.push(`Missing required file: ${name}`); return ""; }
  return readFileSync(path, "utf8");
};
const ids = (source, pattern) => new Set(source.match(pattern) ?? []);
const difference = (left, right) => [...left].filter((value) => !right.has(value));

const rulesSource = read("02-rules-and-questions.md");
const coverageSource = read("06-test-coverage.md");
const functionalSource = read("07-functional-test-cases.md");
const risksSource = read("08-traceability-and-risks.md");

const jiraDir = join(root, "jira");
let storiesSource = "";
if (existsSync(jiraDir)) {
  storiesSource = readdirSync(jiraDir).filter((name) => name.endsWith(".md")).map((name) => readFileSync(join(jiraDir, name), "utf8")).join("\n");
} else if (existsSync(join(root, "05-user-stories.md"))) {
  storiesSource = readFileSync(join(root, "05-user-stories.md"), "utf8");
} else {
  errors.push("Missing story source: jira/*.md or 05-user-stories.md");
}

const storyIds = ids(storiesSource, /US-[A-Z0-9]+-\d+/g);
const criterionIds = ids(storiesSource, /AC-[A-Z0-9]+-\d+-\d+/g);
const ruleDefinitions = ids(rulesSource, /BR-\d+/g);
const storyRules = ids(storiesSource, /BR-\d+/g);
const checks = ids(coverageSource, /CHK-[A-Z0-9]+-\d+/g);
const functionalChecks = ids(functionalSource, /CHK-[A-Z0-9]+-\d+/g);
const cases = ids(functionalSource, /FTC-[A-Z0-9]+-\d+/g);
const scenarios = ids(functionalSource, /SC-[A-Z0-9]+-\d+-\d+/g);
const functionalCriteria = ids(functionalSource, /AC-[A-Z0-9]+-\d+-\d+/g);

for (const id of difference(storyRules, ruleDefinitions)) errors.push(`${id} is used by a story but has no rule definition`);
for (const id of difference(functionalCriteria, criterionIds)) errors.push(`${id} is used by a scenario but does not exist in the stories`);
for (const id of difference(functionalChecks, checks)) errors.push(`${id} is used by a scenario but does not exist in test coverage`);
for (const id of difference(checks, functionalChecks)) warnings.push(`${id} has no functional scenario`);

for (const criterion of criterionIds) {
  if (!coverageSource.includes(criterion)) warnings.push(`${criterion} has no coverage check`);
}

if (!/Risk|Riesgo|Blocked|Bloquead|Pending|Pendiente/i.test(risksSource)) warnings.push("Risk file has no recognizable risk or pending sections");

const report = {
  valid: errors.length === 0,
  counts: { stories: storyIds.size, criteria: criterionIds.size, rules: ruleDefinitions.size, checks: checks.size, functionalCases: cases.size, scenarios: scenarios.size },
  errors,
  warnings,
};
console.log(JSON.stringify(report, null, 2));
process.exit(errors.length ? 1 : 0);
