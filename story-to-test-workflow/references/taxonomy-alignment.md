# Taxonomy Alignment Routing

Read this reference after Gate 4 only when the initiative is governed by the product
taxonomy system, an existing mapping may be stale, or a post-handoff reconciliation is in
scope. It routes the work; the specialist owns the mapping and remote-operation contract.

## Authority

- Merged refinement Markdown owns approved `BR-*`, `US-*`, `AC-*`, `SC-*`, `CHK-*` and
  `FTC-*` behavior.
- Product Taxonomy owns `PRD-*`, `FEA-*`, `JTB-*`, `OUT-*`, `JRN-*`, `ACR-*`, `SCN-*`,
  their hierarchy and remote status.
- `integrations/taxonomy-mapping.md` is the versioned cross-reference. It does not replace
  either authority.
- The confirmed development destination owns delivery execution evidence, not refinement or
  taxonomy decisions.

## Applicability checkpoint

Use the existing project context first. Ask once only when material ambiguity remains:

1. Is this initiative governed in Product Taxonomy?
2. Must a verified mapping exist before the development-destination handoff, or may a named
   owner close it later under an approved exception?

Do not query Taxonomy during Gates 1–4 merely because it may apply. Record applicability and
defer the connector until the approved stories, criteria and scenarios are stable.

Taxonomy is normally not applicable to exploratory notes, internal tooling with no product
journey, shared technical contracts, or a localized correction proven not to affect the
mapping. Preserve an existing verified mapping when the impact closure proves it current.

## Gate 5 route

1. Validate and Judge the Gate 4 package.
2. Establish the canonical GitHub commit or clearly label a branch preview.
3. Invoke `sync-refinement-package-taxonomy` in `align` mode.
4. If the Taxonomy MCP is available, read only the affected product hierarchy and produce
   the proposed mapping or delta.
5. If unavailable, do not invent codes or use repository source as live taxonomy data.
   Record `Draft` or `Blocked`, the missing capability, owner and handoff consequence.
6. Obtain product decisions for ambiguous relationships. A tool result does not decide
   which journey or outcome owns behavior.
7. Commit the mapping through the normal GitHub branch/PR flow.
8. Treat any remote Taxonomy creation or update as a separate production write requiring
   its own exact authorization and readback.

Lack of MCP access never blocks Gates 1–4. It blocks the development-destination handoff
only when the recorded team policy requires verified alignment; otherwise preserve an
explicit exception, owner, target and residual risk.

## Post-handoff route

When implementation and QA evidence are available, invoke the specialist in `reconcile`
mode. Compare delivery with approved behavior first. If product behavior changed, update and
approve Markdown before proposing Taxonomy changes. Delivery completion alone does not prove
journey coverage or QA status.

Do not route Taxonomy work through either Notion specialist. Notion remains an optional
presentation; Product Taxonomy is a separate production system with separate authority and
authorization.
