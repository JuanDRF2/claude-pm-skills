#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const script = path.resolve(
  process.argv[2] || fileURLToPath(new URL("./verify-editorial-parity.mjs", import.meta.url)),
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "editorial-parity-"));
const canonical = `# US-OM-25

### AC-OM-25-08 — Recuperación acumulada

**Condición de aceptación:** las cuotas pendientes se intentan en orden antes de la actual.

#### SC-OM-25-08 — Recuperar cuotas acumuladas en una fecha programada posterior

**Cobertura QA:** CHK-OM-276; FTC-OM-25

**Dado** que existen cuotas anteriores Overdue o Failed con saldo
**Cuando** se ejecuta la cobranza de una fecha posterior
**Entonces** se intenta cada cuota pendiente y finalmente la cuota actual
**Y** cada cuota todavía fallida vuelve a ser elegible en la siguiente fecha programada
`;
const complete = canonical;
const summary = `# US-OM-25

## Actualización aprobada

Las cuotas anteriores se recuperan en una fecha posterior. CHK-OM-276; FTC-OM-25.
`;
const idsOnly = `# US-OM-25

### AC-OM-25-08 — Recuperación acumulada

#### SC-OM-25-08 — Recuperar cuotas acumuladas en una fecha programada posterior

CHK-OM-276; FTC-OM-25. Las cuotas anteriores se recuperan en una fecha posterior.
`;
const missingCriterion = complete.replace(
  "**Condición de aceptación:** las cuotas pendientes se intentan en orden antes de la actual.\n",
  "",
);
const indentedHeadings = complete.replace(/^(#{3,6}\s+)/gm, "   $1");
const togglePresentation = `# US-OM-25

## Criterios de aceptación y escenarios

<details>
<summary>AC-OM-25-08 — Recuperación acumulada</summary>
	**Condición de aceptación:** las cuotas pendientes se intentan en orden antes de la actual.
	<details>
	<summary>SC-OM-25-08 — Recuperar cuotas acumuladas en una fecha programada posterior</summary>
		**Cobertura QA:** CHK-OM-276; FTC-OM-25
		- **Dado** que existen cuotas anteriores Overdue o Failed con saldo
		- **Cuando** se ejecuta la cobranza de una fecha posterior
		- **Entonces** se intenta cada cuota pendiente y finalmente la cuota actual
		- **Y** cada cuota todavía fallida vuelve a ser elegible en la siguiente fecha programada
	</details>
</details>
`;
try {
  fs.writeFileSync(path.join(root, "canonical.md"), canonical);
  fs.writeFileSync(path.join(root, "complete.md"), complete);
  fs.writeFileSync(path.join(root, "summary.md"), summary);
  fs.writeFileSync(path.join(root, "ids-only.md"), idsOnly);
  fs.writeFileSync(path.join(root, "missing-criterion.md"), missingCriterion);
  fs.writeFileSync(path.join(root, "indented-headings.md"), indentedHeadings);
  fs.writeFileSync(path.join(root, "toggle.md"), togglePresentation);
  const run = (presentation, out) => {
    const plan = { project: "online", stories: [{ story_id: "US-OM-25", canonical_path: path.join(root, "canonical.md"), presentation_path: path.join(root, presentation), notion_page_id: "page" }] };
    fs.writeFileSync(path.join(root, "plan.json"), JSON.stringify(plan));
    return spawnSync(process.execPath, [script, "--plan", path.join(root, "plan.json"), "--out", path.join(root, out)], { encoding: "utf8" });
  };
  const failed = run("summary.md", "failed.json");
  assert.equal(failed.status, 3);
  const failedReceipt = JSON.parse(failed.stdout);
  assert.equal(failedReceipt.ok, false);
  assert.match(failedReceipt.stories[0].missing_ids.join(" "), /SC-OM-25-08/);
  const behaviorFailed = run("ids-only.md", "behavior-failed.json");
  assert.equal(behaviorFailed.status, 3);
  assert.equal(JSON.parse(behaviorFailed.stdout).stories[0].scenario_findings[0].issue, "missing-behavior");
  const criterionFailed = run("missing-criterion.md", "criterion-failed.json");
  assert.equal(criterionFailed.status, 3);
  assert.equal(JSON.parse(criterionFailed.stdout).stories[0].acceptance_findings[0].issue, "missing-acceptance-content");
  const passed = run("complete.md", "passed.json");
  assert.equal(passed.status, 0, passed.stderr);
  assert.equal(JSON.parse(passed.stdout).ok, true);
  const indentedPassed = run("indented-headings.md", "indented-passed.json");
  assert.equal(indentedPassed.status, 0, indentedPassed.stderr);
  assert.equal(JSON.parse(indentedPassed.stdout).ok, true);
  const togglePassed = run("toggle.md", "toggle-passed.json");
  assert.equal(togglePassed.status, 0, togglePassed.stderr);
  assert.equal(JSON.parse(togglePassed.stdout).ok, true);
  console.log(JSON.stringify({ ok: true, tests: 6 }, null, 2));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
