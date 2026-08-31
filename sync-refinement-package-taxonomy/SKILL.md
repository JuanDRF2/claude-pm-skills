---
name: sync-refinement-package-taxonomy
description: Align an approved refinement package with an external product taxonomy system before a development handoff, or reconcile verified implementation and QA evidence afterward. Use only when Taxonomy applies or an existing mapping changed; default to read-only preview, preserve separate authorities, and require exact authorization for production writes.
---

# Sync Refinement Package Taxonomy

## Purpose and boundaries

Maintain a reviewed cross-reference between canonical refinement IDs and the product
taxonomy system without replacing either source of truth.

- Merged GitHub Markdown owns approved `US-*`, `AC-*` and `SC-*` behavior.
- Product Taxonomy owns its Product, Feature, JTBD, Outcome, Journey, `ACR-*` and `SCN-*`
  identities, hierarchy and remote status.
- `integrations/taxonomy-mapping.md` records their relationship; read
  `references/taxonomy-mapping-contract.md` before creating or changing it.
- The confirmed development destination supplies delivery evidence. It does not authorize
  product or Taxonomy changes.

Do not activate this skill for ordinary refinement when Taxonomy is not applicable. Do not
route Product Taxonomy through Notion skills.

## Preflight

Establish:

1. mode: `align` or `reconcile`;
2. canonical package path, GitHub repository, branch and observed commit;
3. recorded Taxonomy applicability and development-destination handoff policy;
4. active package IDs and any retired-ID registry;
5. existing mapping and last remote evidence;
6. whether the current host exposes the Taxonomy MCP;
7. allowed action: read-only preview or exact production write.

Read `references/taxonomy-mcp-contract.md` before any remote call. Connector setup is an
environment concern, not part of the package. Never request, print or persist a bearer token.

## Mode: align

Use after Gate 4 and before a Taxonomy-governed development-destination handoff.

1. Read the approved stories, criteria and scenarios; do not reopen them without an actual
   product contradiction.
2. If MCP is available, query only the affected Product, Feature, JTBD, Outcomes, Journeys,
   acceptance criteria and scenarios.
3. Propose `US-* ↔ JRN-*`, `AC-* ↔ ACR-*`, `SC-* ↔ SCN-*` and Journey ↔ Outcome
   relationships. Allow many-to-many story/journey relationships.
4. Ask Product to decide ambiguous ownership, channel or outcome coverage. A title match is
   evidence, not a decision.
5. Write a `Draft`, `Verified`, `Stale` or `Blocked` mapping using the contract. Use
   `Verified` only after targeted remote existence and hierarchy checks.
6. If elements are missing, present creates and updates separately. Do not write until the
   exact production action is authorized.

When MCP is unavailable, produce or update only a `Draft`/`Blocked` mapping with owner and
handoff consequence. Do not claim that repository source, an export or remembered codes are
live verification.

## Mode: reconcile

Use after the confirmed development destination delivers, when implementation and QA
evidence exist.

1. Compare delivered behavior and deviations with the approved Markdown.
2. If product behavior changed, stop remote synchronization until the canonical package is
   corrected, approved, validated, judged and merged.
3. Distinguish implemented, QA verified, automated and covered; none implies another.
4. Propose only affected Taxonomy coverage, QA status, automation status or relationships.
5. Preserve unmapped or deferred scope and residual risk.
6. Apply the same authorization, readback and receipt rules as `align`.

## Production writes

Product Taxonomy is a live shared environment. Before `create_*` or `update_*`:

1. Freeze an exact plan with business codes, fields, before values and target values.
2. Read every affected identity immediately before writing.
3. Ask for explicit authorization for that exact plan. Read authorization does not cover
   writes; a GitHub, Notion, Jira or development-destination approval does not cover
   Taxonomy.
4. Apply the smallest resumable set and record every returned business code immediately.
5. Read back every affected identity and verify parent hierarchy, channel, Outcomes and
   content/status fields.
6. Stop on ambiguity, partial failure or unexpected transformation. Never blindly retry a
   create.
7. Produce a receipt and update the mapping through a branch/PR.

The current write surface may not accept namespaced refinement `external_id` values for
every entity. Until the platform proves that support, use observed Taxonomy codes from the
mapping as remote identities. After a partial create, stop and reconcile the returned code
before retrying; do not infer idempotency from a matching title.

## Completion

Report:

- mode and package commit;
- mapping status and path;
- active mapped, explicitly deferred/not-applicable and unresolved IDs;
- remote reads and exact writes, if any;
- readback/receipt evidence;
- development-destination handoff consequence or post-delivery residual risk;
- required GitHub PR action.

Do not claim global Taxonomy alignment from a localized read. Do not mark a mapping
`Verified` when remote evidence is missing or stale.

## Resources

- `references/taxonomy-mapping-contract.md` — artifact schema, cardinality and lifecycle
- `references/taxonomy-mcp-contract.md` — connector capability and production safeguards
