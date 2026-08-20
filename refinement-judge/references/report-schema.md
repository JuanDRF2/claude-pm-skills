# Report Schema

Write the report in the package language. Use the translated headings shown below for Spanish packages; retain the exact field labels inside findings so the validator can recognize either language.

```markdown
# Refinement Judge — [Project]

- Verdict / Veredicto: PASS | PASS WITH OBSERVATIONS | PASS CON OBSERVACIONES | FAIL
- Intended action / Acción evaluada: [action]
- Action stage / Etapa de acción: Preview | Publication | Post-publication
- Action scope / Alcance de acción: technical=N; editorial=N
- Gate decision / Decisión del gate: Allowed | Allowed with observations | Blocked
- Reviewed snapshot SHA-256 / Snapshot revisado SHA-256: [64 lowercase hex]
- Review date / Fecha de revisión: YYYY-MM-DD
- Reviewer / Revisor: Refinement Judge

## Executive summary / Resumen ejecutivo

[What can or cannot proceed and why.]

## Scope and evidence / Alcance y evidencia

### Sources inspected / Fuentes revisadas

- [source and location]

### Artifacts inspected / Artefactos revisados

- [artifact or range]

### Not verified / No verificable

- None / Ninguno

## Findings / Hallazgos

### JUDGE-[PROJECT]-001 — [Plain-language title]

- Severity / Severidad: Critical | High | Medium | Low | Observation
- Status / Estado: Open | Partially resolved | Resolved | Accepted risk | Not reproducible | Superseded
- Blocks action / Bloquea acción: Yes | No
- Evidence / Evidencia: [source plus exact section, file plus ID or heading]
- Affected artifacts / Artefactos afectados: [IDs and files]
- Consequence / Consecuencia: [observable risk]
- Required correction / Corrección requerida: [specific outcome, not implementation guess]
- Verification / Verificación: [evidence for resolution, or Pending / Pendiente]

## Coverage summary / Resumen de cobertura

| Dimension | Result | Evidence |
| --- | --- | --- |
| Source fidelity | Pass/Fail/Limited | [...] |
| Scope and decisions | Pass/Fail/Limited | [...] |
| Stories and criteria | Pass/Fail/Limited | [...] |
| QA executability | Pass/Fail/Limited | [...] |
| Traceability | Pass/Fail/Limited | [...] |
| Risk and readiness | Pass/Fail/Limited | [...] |
| Presentation parity | Pass/Fail/Not applicable/Limited | [...] |
| Derived artifacts and product boundaries | Pass/Fail/Not applicable/Limited | [...] |

## Required corrections / Correcciones requeridas

1. [Finding ID and correction]

## Residual risk / Riesgo residual

- [Risk that remains even after the verdict]

## Gate authorization / Autorización del gate

- Allowed actions / Acciones permitidas: [...]
- Blocked actions / Acciones bloqueadas: [...]
- Human override / Excepción humana: None / Ninguna
```

`Action stage` y `Action scope` son obligatorios cuando el Judge evalúa una publicación
localizada en Notion. Usar `technical=N; editorial=N`; contar solo páginas que pueden
escribirse y declarar `verification-only` por separado. `Publication` significa el write set remoto exacto; no usarlo
para la mera preparación de un preview. En otros gates pueden omitirse cuando no aplica
una publicación externa.

En `Preview`, omite `Action scope`: todavía no existe un write set remoto autorizable.

## Empty findings

For `PASS`, retain the Findings section and write:

```markdown
No open findings / Sin hallazgos abiertos.
```

Do not create placeholder finding IDs.

## Reruns

On every rerun:

1. Preserve every existing finding ID, title and defect meaning.
2. Use `Partially resolved` when a proven subset changed and name the residual population.
3. Update status and verification evidence without replacing a global audit with a local one.
4. Add new IDs sequentially after the highest historical ID, including IDs already recorded
   in preserved review evidence.
5. Mark a finding `Superseded` only when it names the decision or finding IDs that own the
   remaining meaning.
6. Compare the rerun with the preserved report using `--previous-report`.
7. Update snapshot hash and date.
8. Recalculate the verdict from open and partially resolved findings.
9. Keep accepted-risk entries visible.
10. For Notion publication, update the action stage and exact technical/editorial counts.

For a finding that summarizes several affected IDs, include the complete inventory directly
or link a durable review artifact with one row per ID, classification, evidence, status and
owner. Do not rely on chat-only lists or an unnamed historical inventory.
