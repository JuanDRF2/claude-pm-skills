# Artifact Contract

## Shared IDs

Use the artifact language for prose and headings. Keep these identifiers language-neutral.

| Artifact | Prefix | Example |
|---|---|---|
| Business rule | `BR-` | `BR-01` |
| Question | `Q-` | `Q-03` |
| User story | `US-` | `US-MEM-01` |
| Acceptance criterion | `AC-` | `AC-MEM-01-02` |
| Coverage check | `CHK-` | `CHK-MEM-004` |
| Functional test case | `FTC-` | `FTC-MEM-02` |
| Functional scenario | `SC-` | `SC-MEM-02-01` |
| Judge finding | `JUDGE-` | `JUDGE-MEM-001` |

Preserve IDs after approval. Record superseded items rather than silently reusing their
identifiers for different behavior. Preserving an ID does not keep its retired behavior in
an active story, test or delivery view. When a `US-*`, `AC-*` or `SC-*` is retired or
superseded, apply `retired-identifier-contract.md`.

Judge IDs also preserve their original title and defect meaning across reruns; partial
corrections update status and residual scope instead of repurposing the ID.

## Phase Handoffs

### Mapping to Splitting

Pass:

- Objective and actors
- Confirmed rules and questions
- Variation matrix
- Main and recovery paths
- Release goals and material risks
- Source-role inventory, derived-artifact deltas and Product Boundary results when applicable

### Splitting to Story Writing

Pass:

- Selected end-to-end outcomes
- Rules retained by each candidate
- Dependencies and sequence
- Deferred scope
- Technical prerequisites and discovery experiments

### Story Writing to Test Design

Pass:

- Approved story and criterion IDs
- Confirmed business rules
- Scope boundaries
- Dependencies and quality requirements
- Questions, assumptions, states, and integrations

## Final Coverage Audit

Use this status table:

| Rule | Story/work item | Criterion | Check | Functional case/scenario | Status | Owner/gap |
|---|---|---|---|---|---|---|

Allowed status values:

- Covered
- Partially covered
- Blocked
- Deferred with target
- Excluded with rationale

Never label an item Covered merely because a document exists. Coverage requires a planned or executed way to obtain relevant evidence, depending on the workflow stage.

## Markdown Ownership

| File | Primary content | Written after |
|---|---|---|
| `00-workflow-state.md` | Current phase, approvals, decision checkpoint, stale consumers, questions, next action and link/summary for retired IDs | Every approved gate and material decision |
| `01-project-understanding.md` | Objective, actors, scope, known systems | Gate 1 |
| `02-rules-and-questions.md` | Rules, sources, questions, assumptions, owners | Gate 1 |
| `03-story-map.md` | Journey, variations, alternate and recovery paths | Gate 1 |
| `04-release-slices.md` | Selected deliveries, dependencies, deferred scope | Gate 2 |
| `05-user-stories.md` | Active stories/criteria plus the canonical retired-ID registry outside all `## US-*` blocks | Gate 3 |
| `06-test-coverage.md` | Risk analysis and coverage matrix | Gate 4 |
| `07-functional-test-cases.md` | Grouped functional cases and QA-reviewable scenarios | Gate 4 |
| `08-traceability-and-risks.md` | Active rule-to-test coverage, separately labeled retired history and remaining risk | Gate 4/final audit |
| `09-package-index.md` | Project/delivery status and navigation | Gate 4/final audit |
| `10-design-and-spec-deltas.md` | Optional expanded ledger for derived artifacts; `02` remains the entry point | Gate 1 and every material prototype/SPEC review |
| `integrations/taxonomy-mapping.md` | Optional active cross-reference between approved package IDs and Product Taxonomy codes; schema owned by `sync-refinement-package-taxonomy` | Gate 5 when Taxonomy applies and after affected reconciliation |
| `jira/<US-ID>.md` | Copy-ready story view with inline traceability | Gate 3, refreshed Gate 4 |
| `handoffs/dev-handoff.md` | DEV-focused approved behavior and dependencies | Gate 4 |
| `handoffs/qa-handoff.md` | Approved QA design ready for downstream test-management generation | Gate 4 |

## Requirement Classification

Keep these labels distinct: Business rule, Quality requirement, Observability requirement, Technical enabler, and Test-data/environment need.

## Approval States

Use: Proposed by AI, Product confirmed, Engineering review needed, QA review needed, or Blocked. Artifact approval never implies every role has approved every item.
