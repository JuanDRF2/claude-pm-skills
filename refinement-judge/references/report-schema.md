# Report Schema

Write the report in the package language. Use the translated headings shown below for Spanish packages; retain the exact field labels inside findings so the validator can recognize either language.

```markdown
# Refinement Judge — [Project]

- Verdict / Veredicto: PASS | PASS WITH OBSERVATIONS | PASS CON OBSERVACIONES | FAIL
- Intended action / Acción evaluada: [action]
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
- Status / Estado: Open | Resolved | Accepted risk | Not reproducible | Superseded
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

## Required corrections / Correcciones requeridas

1. [Finding ID and correction]

## Residual risk / Riesgo residual

- [Risk that remains even after the verdict]

## Gate authorization / Autorización del gate

- Allowed actions / Acciones permitidas: [...]
- Blocked actions / Acciones bloqueadas: [...]
- Human override / Excepción humana: None / Ninguna
```

## Empty findings

For `PASS`, retain the Findings section and write:

```markdown
No open findings / Sin hallazgos abiertos.
```

Do not create placeholder finding IDs.

## Reruns

On every rerun:

1. Preserve existing finding IDs.
2. Update status and verification evidence.
3. Add new IDs sequentially.
4. Update snapshot hash and date.
5. Recalculate the verdict from open findings.
6. Keep accepted-risk entries visible.
