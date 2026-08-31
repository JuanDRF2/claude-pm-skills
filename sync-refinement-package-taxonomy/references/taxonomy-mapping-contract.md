# Taxonomy Mapping Contract

## Location and authority

Use `integrations/taxonomy-mapping.md` only when Product Taxonomy applies or an existing
mapping must be preserved. It is a canonical versioned cross-reference in the refinement
package, not authority for Taxonomy hierarchy or remote status.

Do not create an empty placeholder for packages where Taxonomy does not apply. Do not copy
the complete Product, JTBD or Journey definitions into every story.

## Required metadata

Use the package language for prose, but preserve these bilingual field labels so validation
is deterministic:

```markdown
# Taxonomy Mapping

- Project / Proyecto: [name]
- Status / Estado: Draft | Approved | Needs decision | Superseded
- Last updated / Última actualización: YYYY-MM-DD
- Approved through / Aprobado hasta: Gate 4 | Gate 5 | Not approved
- Taxonomy required / Taxonomy requerido: Yes | No
- Mapping status / Estado del mapping: Draft | Verified | Stale | Blocked
- Owner / Responsable: [person or role]
- Taxonomy environment / Entorno de taxonomy: Production
- Last verified / Última verificación: YYYY-MM-DD | Not verified
- Evidence / Evidencia: [receipt/path/remote read summary] | None
- Source commit / Commit de origen: [Git SHA or branch preview]
```

`Verified` requires a real date, evidence from the affected remote identities and the
source commit. `Draft` means relationships are proposed. `Stale` means a mapped package or
remote source changed. `Blocked` names the missing decision, connector or permission.

## Product and Feature

```markdown
## Product and Feature / Producto y feature

- Product: PRD-022 — Membership
- Feature: FEA-137 — Membership Sales
```

Use observed business codes only. Record `Pending — [owner]` instead of guessing.

## Active relationship tables

```markdown
## Stories and journeys / Historias y journeys

| Package story | Taxonomy journey | JTBD | Channel | Outcomes | Status or gap |
|---|---|---|---|---|---|
| US-QM-01 | JRN-0502 | JTB-0414 | Back office | OUT-0912 | Verified |

## Acceptance criteria / Criterios de aceptación

| Package criterion | Taxonomy criterion | Journey | Status or gap |
|---|---|---|---|
| AC-QM-01-01 | ACR-1475 | JRN-0502 | Verified |

## Scenarios / Escenarios

| Package scenario | Taxonomy scenario | Taxonomy criterion | Status or gap |
|---|---|---|---|
| SC-QM-01-01-01 | SCN-2041 | ACR-1475 | Verified |
```

One package story may map to several Journeys and one Journey may consume several stories.
Each Journey belongs to one JTBD and exactly one supported channel. Its Outcomes must belong
to that same JTBD. Each `ACR-*` belongs to the declared Journey; each `SCN-*` belongs to the
declared `ACR-*`.

## Explicit exclusions and pending work

Every active `US-*`, `AC-*` and `SC-*` must either appear in the active tables or here when
Taxonomy is required:

```markdown
## Unmapped, deferred or not applicable / Sin mapear, diferido o no aplicable

| Package ID | Type | Status | Reason | Owner | Target |
|---|---|---|---|---|---|
| US-QM-06 | Technical enabler | Not applicable | No user journey | Engineering | N/A |
```

Allowed dispositions are `Not applicable`, `Deferred`, `Pending` and `Blocked`. `Verified`
may contain `Not applicable` or a dated `Deferred` item with rationale; it cannot contain
`Pending` or `Blocked` items. `Draft` and `Blocked` mappings retain owners and targets for
unresolved items.

## Lifecycle and safety

- Never reuse package or Taxonomy IDs.
- Keep retired/superseded package IDs out of active mapping tables. Preserve their lifecycle
  in the package's retired-ID registry, not as active Taxonomy work.
- Mark the mapping `Stale` when an affected active story, criterion, scenario, Journey,
  Outcome, hierarchy or channel changes.
- A localized change checks only its complete affected relationship closure.
- Remote writes require a separate plan, authorization and readback. Mapping approval does
  not authorize them.
- A code returned by a create becomes authoritative only after readback and a committed
  mapping update.
