# Review Contract

## Contents

1. Evidence hierarchy
2. Independence protocol
3. Audit dimensions
4. Sampling prohibition
5. Parity review
6. Completion boundary
7. Derived artifacts and product boundaries
8. Review scope and sampling
9. Referenced external dependencies
10. Cross-refinement coherence
11. Domain architecture

## Evidence hierarchy

Use this order unless the package declares a stricter approved authority:

1. Explicit human-approved decisions
2. Original spec or PRD
3. Approved product artifacts
4. Design evidence for observable interaction
5. Engineering evidence for technical feasibility and observability
6. QA evidence for execution constraints
7. AI proposals

Do not silently resolve conflicts. Record both claims, their sources, affected artifacts and the owner needed to decide.

## Independence protocol

1. Start from raw sources and the current filesystem snapshot.
2. Build a compact source inventory before evaluating author summaries.
3. Search for disconfirming evidence, not only supporting evidence.
4. Cite observable evidence for every finding.
5. Do not ask the generating skill to explain what it intended.
6. Do not repair the artifact during the audit.
7. Rerun against a new snapshot after corrections.

If a separate agent or clean thread is available, prefer it for the semantic pass. Give it the skill, original sources, current artifact folder, language and intended action. Do not provide suspected findings or expected verdicts.

## Audit dimensions

### 1. Source fidelity

Check that:

- Every material approved rule appears correctly downstream.
- No requirement is invented, strengthened or weakened.
- Numerical values, dates, permissions, states and calculations retain their meaning.
- Explicit exclusions and deferred behavior remain visible.
- Material source changes are reflected or marked stale.

### 2. Scope and decision integrity

Check that:

- Questions have not become rules without approval.
- Contradictions have owners and visible status.
- Candidate, approved, deferred, blocked and superseded items are not conflated.
- One delivery being complete does not mark the whole project complete.
- Technical proposals are not presented as product decisions.

### 3. Story quality

Check that:

- Each story produces an independently reviewable outcome or is explicitly labeled an enabler.
- Stories do not hide multiple unrelated outcomes.
- Dependencies and excluded scope are visible.
- The split does not create horizontal component-only work disguised as customer value.
- Readiness does not depend on unresolved blocking behavior.

### 4. Acceptance behavior

Check that:

- Every criterion identifies context, action, observable outcome, validation and consequence.
- Scenarios contain one primary event.
- Alternate, negative, boundary, failure and recovery behavior exist when risk requires them.
- Product language is understandable without architecture knowledge.
- Technical evidence is separated from business behavior.

### 5. QA executability

Check that:

- A QA reviewer knows preconditions, representative data, action, expected result and evidence.
- Scenarios do not depend only on opaque datasets or matrices.
- Functional cases group scenarios without duplicating or changing their behavior.
- Automation decisions are scenario-level, justified and technically plausible.
- “Covered” does not mean “executed” or “automated.”
- For each high-risk scenario marked `Ready`, independently verify its controlled example,
  exact initial state, controlled outcome and observable evidence. When recovery outcomes
  interact, verify explicit combination coverage; do not accept a generic dataset reference.
- Reject `Automate now` when QA or Engineering must invent a material value, provider result,
  retry policy, state transition, evidence source or expected outcome.

#### Journey integrity

For payments, purchases, renewals, asynchronous completion and flows that create or update
several related business results, check that:

- one `FTC-*` composes the atomic `SC-*` scenarios from entry action through visible outcome,
  final processing and applicable downstream consistency;
- the complete path identifies authorized evidence, controlled correlation data or a visible
  observability dependency;
- scenarios remain independently executable and do not rely on execution order;
- one thin E2E, Integration or Manual validation path exists, or a Blocked exception names
  its reason, owner and residual risk;
- lower-level tests carry calculations, boundaries, failures and combinations without
  duplicating every variation in E2E;
- internal records remain evidence rather than the only understandable business outcome;
- automation classification does not erase functional coverage when execution stays manual.

Do not require a journey composition for a genuinely isolated behavior with a recorded
rationale. Do not accept `Not applicable` merely to avoid downstream or cross-system
verification. Missing required composition blocks QA approval even when each individual
scenario is syntactically valid.

### 6. Traceability

Trace both directions:

```text
Source/decision → BR → US → AC → SC → CHK/evidence → FTC
FTC/SC → AC → US → BR → source/decision
```

Check definitions, references, parity, orphan items, broken links and silently renumbered IDs.

### 7. Risk and readiness

Check high-impact areas proportionally:

- Payments: authorization, capture, zero-value charge, void, refund, duplicates, partial/unknown outcomes and compensation failure
- Permissions and tenant boundaries
- Personal or customer data
- Dates, time zones, money, percentages and rounding
- External integrations and eventual consistency
- Auditability, support evidence and recovery

Readiness requires the appropriate Product, Engineering and QA ownership. Product approval alone must not be reported as globally sprint-ready.

### 8. Presentation parity

When derived outputs exist, compare them with canonical Markdown:

- Jira-ready files
- HTML presentation or prototype
- Word
- Notion
- Handoffs

Build the complete consumer closure before judging preservation. Canonical story sources
may be split across `05-user-stories*.md`; compare every affected source with its Jira
derivative, technical payload and editorial presentation. Treat formatting that protects
meaning or transport—inline code, list hierarchy, fences and link targets—as part of that
closure. A consumer cannot remain preserved without exact evidence that it still derives
from the current canonical source.

Report omitted, shortened, stale or contradictory behavior. A polished presentation never outranks canonical evidence.

For Notion, read the native-page manifest, baseline and human-page manifest.

- Initial publication or `full-audit`: verify every registered technical and editorial page.
- `Actualización localizada`: verify every selected technical and human page, affected cover facts and the complete consumer closure. Prove locally why unrelated pages are excluded; do not download them merely to reconfirm preservation.
- Interrupted legacy runs: apply their frozen recovery contract until clean closure, then adopt `native-pages-fast-v1` separately.

For a complete publication, confirm that each auxiliary page derives from the verified
Markdown snapshot, is linked from the cover and has no competing duplicate title. Treat
`No aplica` or `No generado` as a defect when the applicable canonical source exists.

For every affected story presentation, compare the full Notion readback semantically with
its `jira/<US-ID>.md` projection from the validated checkout. Require all applicable
acceptance criteria, scenarios, checks, functional cases and Given/When/Then behavior.
Treat a summary-only update as a high-severity parity defect. Notion serialization changes
such as safe URL expansion, escaping, spacing or block formatting are acceptable only when
the comparator proves no behavior, identity or destination changed. Review the
deterministic editorial receipt as evidence, but independently inspect every failed or
high-risk story; never infer parity from the receipt alone.

Require `notion-presentation-format` receipts from the frozen payload and actual readback.
Confirm that their presentation identities equal the authorized scope and every item is
`ok: true`. Independently inspect any prior failed item; a rerun cannot erase unexplained
format drift.

For every affected non-story presentation, compare its frozen expected payload with the
complete readback and require the expected IDs, headings, links and responsibility-specific
content. Validate internal destinations by Notion page ID; a URL with form `https://*.md`
is a broken link, not a harmless serialization difference.

For legacy recovery, distinguish writes from `verification-only` pages. Verify no-op
suppression, disjoint checkpoint states, immutable receipt supersession and exact evidence
hashes. Judge action scope counts only pages that can be written; verification-only pages
must still have readback evidence and must never be hidden inside the write count.

Also verify that sections 7 and 9 provide visible navigation to the native package, stories
and supporting material. Native child pages may remain grouped in the final collapsed
container `Subpáginas internas del proyecto`; do not confuse this human hierarchy with a
canonical Markdown mirror.

### 9. Derived artifacts and product boundaries

When HTML, prototypes, designs or generated SPECs are in scope, check that:

- every artifact declares its source role and canonical base snapshot, or explicitly says
  `Unknown`;
- static inspection covers structure, states, calculations, traceability and unreachable
  behavior;
- interactive behavior was actually exercised in a browser when fidelity depends on it;
- canon, SPEC and observed behavior were compared without treating agreement between two
  derived artifacts as approval;
- every material difference has one `DELTA-*`, classification, owner and affected IDs;
- Proposed, Contradicted or Unverifiable behavior did not enter approved stories or
  readiness;
- accepted changes were incorporated into the owner canonical package before derived views
  were regenerated;
- every material new capability has a Product Boundary result and is not copied across
  independent packages;
- shared contracts have one owner and consumers link rather than duplicate them.

Treat missing reconciliation as a scope/source-integrity defect. Treat a material
contradiction or unapproved scope injection as blocking.

## Sampling prohibition

Do not claim package-wide `PASS` from a sample. Automated searches may narrow attention, but review every in-scope story and every high-risk rule. If size or access prevents full review, declare the limitation and use `FAIL` when the intended action requires complete assurance.

Classify the review scope before reading:

- `Localized`: inspect every changed source and its complete consumer closure. Prove why
  unrelated artifacts are excluded; do not download or reread them merely to reconfirm.
- `Package-wide`: inspect every canonical artifact in the named package.
- `Cross-refinement deep audit`: inspect every canonical artifact in the exact named set of
  packages and compare their shared behavior.
- `Remote parity`: inspect only the remote identities required by the declared publication
  or audit contract.

A prior Judge `PASS` does not exempt an artifact in the current frozen scope. Conversely,
a request to review one change does not authorize expansion to every package or every
remote page. If a complete audit cannot be completed, state the unreviewed inventory and do
not issue a global `PASS`.

## Referenced external dependencies

Directly consumed rules, mappings and shared contracts remain in review scope even when a
full cross-refinement audit is not. When they exist, read and apply
`external-dependency-review.md`. A different ID prefix alone is not proof of a dependency,
and a localized dependency check does not authorize reviewing unrelated packages.

## Cross-refinement coherence

For a declared cross-refinement audit, verify that shared rules, field/state mappings,
closed decisions, prototype behavior and owner-package contracts agree across the selected
packages. Read the complete selected canonical set before concluding; evidence in one
package may resolve a question or expose a contradiction in another.

Do not use a hard-coded list of project IDs as proof of shared scope. Derive relationships
from registered contracts, traceability and the current source inventory.

## Domain architecture

When the reviewed behavior creates or changes domain vocabulary, ownership, events or
cross-Bounded-Context flow, compare it with the authoritative architecture evidence in the
source inventory. Check entity and aggregate names, context ownership, event existence and
cross-context responsibilities.

Architecture evidence governs terminology and ownership; it does not silently override an
approved product decision. If the source is unavailable, stale or omits a new concept,
record a traceability limitation with an owner and severity proportional to the intended
action. Do not invent the missing architecture or claim it was verified.

## Completion boundary

The Judge evaluates refinement readiness. It does not:

- Approve product behavior
- Replace Engineering or QA review
- Execute tests
- Confirm production readiness
- Create Jira tickets
- Publish externally
- Modify canonical artifacts
