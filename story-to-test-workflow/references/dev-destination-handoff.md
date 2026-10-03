# Dev Destination Handoff Adapter

Read this reference only when the team confirms an external dev-tracking destination for
this project. It adapts an approved refinement for delivery; it does not change product
canon, gates or the standard handoff structure.

## Verify the destination contract

Use the accessible destination documentation or repository version supplied by the team.
Do not assume that every user story becomes a proposal or that every field has the same
name across versions. If the destination contract is unavailable, produce a pending mapping
with an owner instead of inventing it. Git or SSH access is optional and must not be a
prerequisite for reading the refinement.

## Semantic mapping

- `US-*`: outcome and scope candidate for the destination work item.
- `AC-*` and `SC-*`: approved behavior that the implementation must preserve.
- `CHK-*`: atomic coverage intent, not proof of execution or a native "done" test.
- `FTC-*`: QA-reviewable grouping of scenarios; downstream tooling owns executable test
  records and results.
- Open questions, Engineering/QA reviews and residual risks remain explicit blockers or
  follow-ups; do not translate them into completed work.

Record destination identifiers only after observing their creation. Preserve the canonical
IDs in every mapped item so changes can be traced back.

## Product Taxonomy

When `taxonomy-alignment.md` declares Taxonomy applicable, add one compact section to
`handoffs/dev-handoff.md` with the mapping link, Product, Feature, JTBDs, Journeys,
Outcomes, mapping status and whether post-delivery reconciliation is required. Do not copy
the complete mapping into the handoff.

The destination consumes the approved refinement and observed Taxonomy codes. It does not
create missing product decisions, invent codes or rerun refinement merely because
development starts. If a verified mapping is required but unavailable, preserve the named
blocker or approved exception. On completion, return implemented scope, deviations and QA
evidence to `story-to-test-workflow`; invoke `sync-refinement-package-taxonomy reconcile`
separately.

## Placement

Keep the detailed mapping in `handoffs/dev-handoff.md`. Do not duplicate proposals,
destination IDs, field mappings, execution details or unresolved delivery questions
anywhere else.

When a dev-tracking destination is confirmed, make it visible with one compact line in the
project's workflow state, for example `Development destination: <name> — see
handoffs/dev-handoff.md`. Omit it when the destination is unknown or does not apply.

External creation or update in the destination requires its own exact write scope and human
authorization under `references/interaction-protocol.md`; this adapter never authorizes a
remote write by itself.
