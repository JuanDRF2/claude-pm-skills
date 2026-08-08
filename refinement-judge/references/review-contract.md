# Review Contract

## Contents

1. Evidence hierarchy
2. Independence protocol
3. Audit dimensions
4. Sampling prohibition
5. Parity review
6. Completion boundary
7. Derived artifacts and product boundaries

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

Report omitted, shortened, stale or contradictory behavior. A polished presentation never outranks canonical evidence.

For Notion, read the publication mode and manifest:

- `Publicación completa`: verify the canonical ten-section cover, every story and these six native pages: Reglas, decisiones y preguntas; Plan funcional de pruebas; Matriz de cobertura y automatización; Pendientes, riesgos y preparación; Handoff DEV; Handoff QA.
- `Actualización localizada`: verify every declared page in scope, affected cover counts/status/links and preservation of unrelated pages.

For a complete publication, confirm that each auxiliary page derives from its assigned Markdown source, uses the reviewed snapshot, is linked from the cover and has no competing duplicate title. Treat `No aplica` or `No generado` as a defect when the applicable canonical source exists.

For every affected story presentation, compare the full Notion readback with its
`jira/<US-ID>.md` projection. Require all applicable acceptance criteria, scenarios,
checks, functional cases and Given/When/Then behavior. Treat a summary-only update as a
high-severity parity defect. Review the deterministic editorial receipt as evidence, but
independently inspect every failed or high-risk story; never infer parity from the receipt
alone.

Also verify that sections 7 and 9 provide the visible navigation while every native `<page>` block appears exactly once inside the final collapsed container `Subpáginas internas del proyecto`. Report loose native page blocks or a second visible page list as a presentation-parity defect.

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

## Completion boundary

The Judge evaluates refinement readiness. It does not:

- Approve product behavior
- Replace Engineering or QA review
- Execute tests
- Confirm production readiness
- Create Jira tickets
- Publish externally
- Modify canonical artifacts
