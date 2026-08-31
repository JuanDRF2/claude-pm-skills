# Retired Identifier Contract

Read this contract when an approved `US-*`, `AC-*` or `SC-*` is retired or superseded.

## Canonical registry

Keep one authoritative `## Registro de identificadores retirados` or
`## Retired identifier registry` in `05-user-stories.md`, before the first active
`## US-*` block. When stories are split across `05-user-stories*.md`, the primary file owns
the registry for every volume.

Use this schema:

| Identificador | Estado | Fecha | Comportamiento anterior | Razón | Decisión o regla vigente |
|---|---|---|---|---|---|
| `AC-MEM-02-04` | Retirado | 2026-08-26 | El código se rechazaba por elegibilidad. | La elegibilidad salió del alcance. | `BR-MEM-04`: el código aplica siempre. |

English packages use the equivalent columns `Identifier`, `Status`, `Date`, `Previous
behavior`, `Reason` and `Current authority`.

- Allowed status: `Retirado`/`Retired` or `Sustituido`/`Superseded`.
- Use an ISO `YYYY-MM-DD` date.
- Preserve the previous behavior when evidence exists. Otherwise write `Desconocido` or
  `Unknown` and name the evidence limitation; never invent it.
- State why it changed and the current approved decision or rule.
- Never reuse the identifier for different behavior.

## Active versus historical content

Remove retired IDs from every active `## US-*` block, criterion, scenario, matrix, release,
coverage count, functional case, Jira view and DEV/QA handoff. Do not keep a struck-through
heading such as `### ~~AC-*~~` inside an active story.

`00-workflow-state.md` may summarize the decision and link to the canonical registry; it is
not a second definition. In `08-traceability-and-risks.md`, keep `Trazabilidad activa` or
`Active traceability` separate from `Historial retirado` or `Retired history`. Historical
rows never count as active coverage or readiness.

An `AC-*` and an `SC-*` with the same numeric suffix are different identities. Retire each
only from explicit evidence; never infer lifecycle from matching numbers.

## Change and review

Build the full consumer closure before writing. Regenerate only affected artifacts, then
run strict validation and the Judge. A retired ID that remains active, lacks its registry
record, appears simultaneously active and retired, or is reused blocks readiness and
publication.

When a prior merged snapshot is available, compare it during review. Deterministic package
validation catches current active/history conflicts; the retained registry and Git diff
provide the evidence needed to detect reuse across revisions.

## Legacy migration

When validation reports `MIGRATION_REQUIRED`, do not patch the table by guessing. Run the
read-only planner from the installed `story-to-test-workflow` skill:

```bash
python3 scripts/plan-retired-id-migration.py /path/to/artifacts/<project>
```

It recovers only explicit evidence, lists missing IDs and renders a proposed six-column
registry. Any cell marked `POR CONFIRMAR — no inferir` requires evidence or an owner
decision before adoption. Review and approve the resulting delta through the normal
change-impact workflow; the planner never edits the package.

Changing this contract or its deterministic validator is a structural skill change. Before
publishing a stable version, the repository compatibility gate must compare the base and
candidate validators against every registered ready package. A package that passed on the
base cannot fail on the candidate; migrate it in the same PR or keep the skill version out
of the stable channel.
