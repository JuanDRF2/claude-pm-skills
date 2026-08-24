#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const script = path.resolve(process.argv[2] || fileURLToPath(new URL("./validate-notion-presentation.mjs", import.meta.url)));
const root = fs.mkdtempSync(path.join(os.tmpdir(), "notion-presentation-format-"));
const hashA = "a".repeat(64);
const hashB = "b".repeat(64);
const canonical = `# US-PC-01

##### AC-PC-01-01 — Encontrar un contacto
**Condición de aceptación:** el contacto aparece cuando coincide la búsqueda.
**Reglas:** BR-PC-01
###### SC-PC-01-01 — Encontrar por nombre
**Dado:** que existe Jane Doe
**Cuando:** el operador busca Jane Doe
**Entonces:** Jane Doe aparece
**QA relationship:** CHK-PC-001; FTC-PC-01
`;
const links = (label) => `- [${label}](https://app.notion.com/p/example)`;
const goodCover = `<callout>Estado</callout>
## 1. Objetivo
Objetivo.
## 2. Estado y readiness
Estado.
## 3. Refinement Judge
PASS.
## 4. Inventario
Inventario.
## 5. Alcance
Alcance.
## 6. Decisiones críticas
Decisiones.
## 7. Índice de historias
${links("US-PC-01 — Buscar un contacto")}
## 8. Pendientes y riesgos
Ninguno.
## 9. Paquete Markdown y materiales
${links("Reglas, decisiones y preguntas")}
${links("Plan funcional de pruebas")}
${links("Matriz de cobertura y automatización")}
${links("Pendientes, riesgos y preparación")}
- **Destino de desarrollo:** ExternalTracker — [Handoff DEV](https://app.notion.com/p/example)
${links("Handoff QA")}
${links("Abrir Paquete Markdown nativo")}
- **Baseline verificado:** ${hashA}
- **Snapshot del manifiesto:** ${hashB}
${links("Historial de sincronización")}
## 10. Próximo paso
Revisión.
<details>
<summary>Subpáginas internas del proyecto</summary>
<page url="https://app.notion.com/p/story">US-PC-01 — Buscar un contacto</page>
</details>
`;
const goodStory = `<callout>US-PC-01</callout>
## 1. Historia y valor
**Como** operador **quiero** buscar **para** identificar.
## 2. Estado y preparación
Pendiente QA.
## 3. Alcance
Incluye búsqueda.
## 4. Comportamiento acordado
- BR-PC-01 — Buscar contactos: permite buscar por nombre completo.
## 5. Dependencias, supuestos y preguntas
Ninguna.
## 6. Criterios de aceptación y cobertura QA
<details>
<summary>Criterio de aceptación · AC-PC-01-01 — Encontrar un contacto</summary>
**Condición de aceptación:** el contacto aparece cuando coincide la búsqueda.
### Reglas de negocio aplicables
- **Regla de negocio · BR-PC-01 — Buscar contactos:** permite buscar por nombre completo.
<details>
<summary>Escenario canónico · SC-PC-01-01 — Encontrar por nombre</summary>
**Dado:** que existe Jane Doe  
**Cuando:** el operador busca Jane Doe  
**Entonces:** Jane Doe aparece.
</details>
### Comprobaciones de cobertura
<details>
<summary>Comprobación de cobertura · CHK-PC-001 — Mostrar coincidencia</summary>
Objetivo y evidencia.
</details>
### Caso funcional relacionado
- **Caso funcional · FTC-PC-01 — Buscar contacto:** reutiliza SC-PC-01-01.
</details>
## 7. Casos funcionales relacionados
<details>
<summary>Caso funcional · FTC-PC-01 — Buscar contacto</summary>
Precondiciones y datos.
</details>
## 8. Pendientes, riesgos y calidad
Ninguno.
## 9. Trazabilidad y próximo paso
| AC | BR | SC | CHK | FTC |
|---|---|---|---|---|
| AC-PC-01-01 | BR-PC-01 | SC-PC-01-01 | CHK-PC-001 | FTC-PC-01 |
`;
const badCover = goodCover
  .replace(/\[US-PC-01 — Buscar un contacto\]\(https[^)]+\)/, "US-PC-01 — Buscar un contacto")
  .replace("## 9. Paquete Markdown y materiales", "## 9. Material de refinamiento")
  .replace("Abrir Paquete Markdown nativo", "Paquete técnico sin enlace")
  .replace("<details>\n<summary>Subpáginas internas del proyecto</summary>\n", "")
  .replace("</details>\n", "")
  .replace("Revisión.\n", "Revisión.\n## Dependencias paralelas\nContenido duplicado.\n");
const missingDestinationCover = goodCover.replace(
  "- **Destino de desarrollo:** ExternalTracker — [Handoff DEV](https://app.notion.com/p/example)",
  links("Handoff DEV"),
);
const badStory = goodStory
  .replace("<details>\n<summary>Criterio de aceptación · AC-PC-01-01 — Encontrar un contacto</summary>\n", "#### AC-PC-01-01 — Encontrar un contacto\n")
  .replace("</details>\n## 7.", "## 7.")
  .concat("\n<table><tr><td>Duplicada</td></tr></table>\n<table><tr><td>Duplicada</td></tr></table>\n");
const goodSharedCover = `<callout icon="🔗" color="green_bg">
**Estado:** Aprobado por Producto.
**Propietario:** Payments.
**Consumidores:** Donations y Memberships.
**Regla de cambio:** revisar consumidores antes de sincronizar.
</callout>

- Proyecto: Contrato transversal
- Estado: Aprobado por Producto
- Última actualización: 2026-08-19
- Aprobado hasta: Gate 1

## Autoridad y alcance
Payments gobierna el contrato.
## Comportamiento aprobado
El enlace pertenece al plan.
## Decisiones todavía abiertas
Ninguna para este alcance.
## Paquetes consumidores
| Paquete | Impacto mínimo |
| --- | --- |
| Donations | Adoptar contrato. |
## Gobierno de cambios
Revisar consumidores.
## Material técnico
<page url="https://app.notion.com/p/package">Paquete Markdown</page>
## Operación y auditoría
[Historial de sincronización](https://app.notion.com/p/history)
`;
const badSharedCover = goodSharedCover
  .replace("## Gobierno de cambios\n", "")
  .replace("**Propietario:** Payments.\n", "")
  .replace("<page url=\"https://app.notion.com/p/package\">Paquete Markdown</page>", "Paquete Markdown");

try {
  fs.writeFileSync(path.join(root, "canonical.md"), canonical);
  fs.writeFileSync(path.join(root, "good-cover.md"), goodCover);
  fs.writeFileSync(path.join(root, "bad-cover.md"), badCover);
  fs.writeFileSync(path.join(root, "missing-destination-cover.md"), missingDestinationCover);
  fs.writeFileSync(path.join(root, "good-story.md"), goodStory);
  fs.writeFileSync(path.join(root, "bad-story.md"), badStory);
  fs.writeFileSync(path.join(root, "good-shared-cover.md"), goodSharedCover);
  fs.writeFileSync(path.join(root, "bad-shared-cover.md"), badSharedCover);
  const run = (cover, story, out) => {
    const plan = {
      schema_version: 1,
      project: "pos-constituents",
      presentations: [
        { type: "cover", presentation_path: path.join(root, cover), expected_story_ids: ["US-PC-01"], development_destination: "ExternalTracker" },
        { type: "story", story_id: "US-PC-01", canonical_path: path.join(root, "canonical.md"), presentation_path: path.join(root, story) },
      ],
    };
    fs.writeFileSync(path.join(root, "plan.json"), JSON.stringify(plan));
    return spawnSync(process.execPath, [script, "--plan", path.join(root, "plan.json"), "--out", path.join(root, out)], { encoding: "utf8" });
  };
  const passed = run("good-cover.md", "good-story.md", "passed.json");
  assert.equal(passed.status, 0, passed.stderr || passed.stdout);
  assert.equal(JSON.parse(passed.stdout).presentations_verified, 2);
  const failed = run("bad-cover.md", "bad-story.md", "failed.json");
  assert.equal(failed.status, 3, failed.stderr || failed.stdout);
  const receipt = JSON.parse(failed.stdout);
  const codes = receipt.presentations.flatMap((item) => item.errors.map((error) => error.code));
  assert.ok(codes.includes("COVER_SECTION_ORDER"));
  assert.ok(codes.includes("COVER_STORY_LINK"));
  assert.ok(codes.includes("COVER_CHILD_CONTAINER"));
  assert.ok(codes.includes("COVER_EXTRA_SECTIONS"));
  assert.ok(codes.includes("STORY_CRITERION_TOGGLE"));
  assert.ok(codes.includes("STORY_DUPLICATE_TABLES"));
  const destinationFailed = run(
    "missing-destination-cover.md",
    "good-story.md",
    "destination-failed.json",
  );
  assert.equal(destinationFailed.status, 3, destinationFailed.stderr || destinationFailed.stdout);
  const destinationCodes = JSON.parse(destinationFailed.stdout).presentations
    .flatMap((item) => item.errors.map((error) => error.code));
  assert.ok(destinationCodes.includes("COVER_DEVELOPMENT_DESTINATION"));
  const runShared = (presentation, out) => {
    const plan = {
      schema_version: 1,
      project: "shared-payment-contract",
      presentations: [
        { type: "shared-contract-cover", presentation_path: path.join(root, presentation) },
      ],
    };
    fs.writeFileSync(path.join(root, "shared-plan.json"), JSON.stringify(plan));
    return spawnSync(process.execPath, [script, "--plan", path.join(root, "shared-plan.json"), "--out", path.join(root, out)], { encoding: "utf8" });
  };
  const sharedPassed = runShared("good-shared-cover.md", "shared-passed.json");
  assert.equal(sharedPassed.status, 0, sharedPassed.stderr || sharedPassed.stdout);
  const sharedFailed = runShared("bad-shared-cover.md", "shared-failed.json");
  assert.equal(sharedFailed.status, 3, sharedFailed.stderr || sharedFailed.stdout);
  const sharedCodes = JSON.parse(sharedFailed.stdout).presentations[0].errors.map((error) => error.code);
  assert.ok(sharedCodes.includes("SHARED_COVER_SECTION_COUNT"));
  assert.ok(sharedCodes.includes("SHARED_COVER_SUMMARY_FIELD"));
  assert.ok(sharedCodes.includes("SHARED_COVER_OPERATION_LINK"));
  console.log("OK: Notion project, story and shared-contract presentation regressions passed (16 checks)");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
