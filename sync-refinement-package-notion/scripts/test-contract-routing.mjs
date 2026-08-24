#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.dirname(scriptDir);
const references = path.join(skillRoot, "references");

let checks = 0;

function assert(condition, message) {
  checks += 1;
  if (!condition) {
    throw new Error(message);
  }
}

const skill = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
const legacy = fs.readFileSync(
  path.join(references, "legacy-recovery-contract.md"),
  "utf8",
);

for (const obsolete of ["review-session-contract.md", "scope-plan-contract.md"]) {
  assert(
    !fs.existsSync(path.join(references, obsolete)),
    `Obsolete normal-flow contract still exists: ${obsolete}`,
  );
  assert(!skill.includes(obsolete), `SKILL.md still routes to ${obsolete}`);
}

assert(
  skill.includes("native-pages-fast-contract.md"),
  "SKILL.md must route normal work to native-pages-fast-contract.md",
);
assert(
  skill.includes("legacy-recovery-contract.md"),
  "SKILL.md must preserve the explicit legacy recovery route",
);
assert(
  legacy.includes("No crear nuevas sesiones de revisión") &&
    legacy.includes("evidencia legacy congelada") &&
    legacy.includes("native-pages-fast-v1"),
  "Legacy contract must prohibit new legacy flows and route normal work to native-pages-fast-v1",
);

console.log(`OK: sync contract routing is current (${checks} checks)`);
