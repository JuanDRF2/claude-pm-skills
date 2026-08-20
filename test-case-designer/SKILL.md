---
name: test-case-designer
description: Design risk-based, traceable QA coverage from stories, criteria, rules, designs, or specs; produce atomic checks and clearly separated functional scenarios in product language, plus gaps, levels, automation guidance, and a downstream test-management handoff.
---

## Purpose

Turn approved product behavior into proportionate coverage checks and functional scenarios ready for QA review. Preserve traceability from rule to expected evidence without generating tool-native test-management artifacts.

This skill designs tests. It does not invent product rules, execute tests, mutate environments, or declare a release safe without evidence.

## In Simple Terms

Use this skill to decide what must be checked, why it matters, and what evidence would show that the feature works safely.

It answers:

1. Which business rules and risks need evidence?
2. Which examples provide useful coverage without testing every possible combination?
3. Where is each check most reliable and economical?
4. Which questions must be answered before a valid expected result can be written?

### Who Contributes What

| Role | Contribution |
|---|---|
| PM/PO or business owner | Confirms expected business behavior and answers rule questions |
| QA | Owns coverage design, priorities, test data, and communication of remaining risk |
| Engineering | Advises where behavior can be tested reliably and what evidence exists after failures |

QA is the primary owner of the test cases, but does not invent the product behavior being tested.

## Input

**Works best with:** A user story, acceptance criteria, business-rule IDs, and scope boundaries.

**Also useful:** Story maps, variation matrices, designs, API contracts, state models, integrations, supported platforms, historical defects, risk constraints, and available test data.

Anything supplied inline counts as context already provided. Do not ask for it again. Partial input is acceptable: produce a provisional coverage audit, keep unknowns visible, and identify which missing decisions block valid expected results.

**Example invocation:** `Design story-level tests for this gift-membership story. Trace BR-12 and BR-13, cover payment duplication and email recipient rules, and do not invent the unresolved start-date policy.`

### Language and Audience

Write in the artifact language confirmed by the workflow or, when standalone, the user's language. Preserve IDs. Provide a QA-focused view and concise Jira traceability when requested.

## Key Concepts

### Criteria Are Not Test Cases

Acceptance criteria define accepted behavior. Test cases specify the evidence, data, actions, and expected observations used to verify it. One criterion may require several tests; one efficient test may cover several compatible rules.

Scenarios are shared: each canonical `SC-*` lives under an `AC-*` and carries the approved Given/When/Then plus its canonical QA strategy. QA adds checks, data, evidence, risk, level, executability and automation to that same scenario, then groups it under an `FTC-*`.

### Professional Terms in Plain Language

- **Risk-based testing:** spend more effort where failure is more likely or more harmful.
- **Equivalence partitioning:** group inputs expected to behave alike and test a representative example.
- **Boundary-value analysis:** test the permitted limit and values immediately around it.
- **Decision table:** compare combinations of conditions and their expected results in a table.
- **State transition:** verify how something moves between conditions such as pending, active, failed, or cancelled.
- **Pairwise sampling:** reduce a large set of lower-risk combinations while still pairing each value with other values.
- **End-to-end (E2E):** check a small number of complete journeys through the real participating parts.
- **Traceability ledger:** a table showing which rules and criteria are covered, missing, blocked, or intentionally excluded.
- **Residual risk:** relevant risk that remains after the planned checks.

### Risk-Based Coverage

Prioritize by impact and likelihood, adjusted for change complexity, detectability, integration boundaries, irreversible effects, and historical failures. See `references/risk-model.md`.

### Coverage Without Combinatorial Explosion

Do not multiply every dimension. Use complete coverage for critical rules, equivalence partitions for similar inputs, boundary analysis for ranges, decision tables for interacting rules, state transitions for lifecycle behavior, and pairwise sampling for lower-risk combinations.

### Traceability

Maintain this chain wherever source IDs exist:

```text
Business objective → BR rule → User story → AC criterion → CHK check → FTC functional case / SC scenario → Evidence
```

Missing links are findings. Do not hide them by manufacturing behavior.

## Application

### Step 1: Audit Testability

Extract:

- Actors and permissions
- Business rules and sources
- Acceptance criteria
- States and transitions
- Variations and boundaries
- Integrations and irreversible effects
- Non-functional constraints
- Assumptions, questions, and contradictions

Classify every statement as **confirmed**, **proposed**, **assumed**, or **unknown**. If an expected result depends on an unknown, list the test as blocked or provisional.

Also classify it as business behavior, quality, observability, technical enabler, or test-data/environment need. Do not turn fault injection or logging mechanics into product criteria.

### Step 2: Model Risk

Assign High, Medium, or Low risk with a short rationale. Elevate payments, identity, authorization, privacy, scheduling, destructive operations, duplicate processing, and cross-system consistency unless evidence supports a lower rating.

Select a coverage mode:

- **Smoke:** critical path and release blockers
- **Story:** default; sufficient evidence to accept the story
- **Regression:** broader affected behavior and meaningful combinations

### Step 3: Select Test Design Techniques

Read `references/test-design-techniques.md` and choose only applicable techniques. State why each was selected and what risk it covers.

### Step 4: Build the Coverage Matrix

List dimensions, meaningful values or states, applicable rules, technique, priority, and planned test level. Consolidate equivalent combinations before writing cases.

First apply the matrix suitability rule:

- Create a matrix when at least two independent variables change the rule or expected result and yield four or more meaningful combinations; when exact calculations or boundaries are high risk; or when the same controlled dataset is reused by multiple stories or flows.
- Do not create one for a linear journey, one changing variable, two or three cases that are clearer as scenarios, or variations with the same outcome.
- Do not generate the full Cartesian product automatically. Use complete coverage for high-risk financial, permission, identity, destructive, or lifecycle interactions; otherwise use boundaries, equivalence classes, or justified pairwise sampling.
- Record variables, meaningful combination count, whether the outcome changes, omission risk, reuse, decision, technique, and rationale. Record `Matrix not needed` when declining one.

### Step 5: Choose the Lowest Useful Test Level

Prefer the least expensive level that can prove the behavior:

- Unit/component for isolated calculations and validation
- API/service for business rules and contracts
- Integration for external systems and state propagation
- End-to-end for a small number of critical user outcomes
- Exploratory/manual for usability, novelty, unstable behavior, or judgment-heavy risk

Do not duplicate identical assertions at every level without a risk-based reason.

### Step 6: Write Atomic Coverage Checks

Create `CHK-*` items for the smallest independently traceable verification. A check states what must be proven, risk, level, and evidence; it is not an executable test case or a TestManager file.

### Step 7: Group Functional Cases and Scenarios

Follow `references/output-schema.md`. Each case must contain:

- Stable ID and title
- Story, criterion, and rule traceability
- Priority, risk, type, and recommended level
- Preconditions and controlled data
- Minimal actions
- Observable expected results
- A scenario-level automation decision, rationale, priority, level, dependencies, and implementation status

Start from the canonical `SC-*` scenarios under the acceptance criteria. Group their checks by feature or primary action into `FTC-*` cases. Reuse every scenario ID and approved behavior exactly; never create a second QA scenario namespace for the same flow. Add another expected result instead of another scenario when the same action proves several inseparable consequences. Expected results must cover business consistency, not only UI messages.

#### Plain-language and scenario-boundary contract

- Write each functional scenario so Product, QA and Engineering can understand the business journey without decoding fixtures or internal object names.
- Do not confuse atomicity with missing context. An atomic scenario may focus on one event,
  but its Given/When/Then must still identify the actor or trigger, relevant journey state,
  named action or decision and observable business result. It must not require reconstructing
  preparation from unrelated criteria.
- A bare option such as `Yes`, `No`, `Check` or `Continue` is not self-explanatory: name the
  question, payment method, confirmation or choice it belongs to. State internal records and
  statuses under technical evidence unless they are themselves an authorized QA surface;
  never use them as the only understandable outcome.
- Use product language in Given/When/Then. Keep tenant setup, synthetic data, mocks and clocks in **Preconditions** or **Data and environment**; keep APIs, records, events, keys and logs in **Technical evidence**.
- Present three readable layers: business behavior first, QA preparation and observable
  evidence second, and optional implementation detail last. A reader must not need the
  second or third layer to understand the intended outcome.
- Give each materially different action or outcome its own titled `SC-*` scenario. Selection, Back, Keep editing, Save, validation failure, persistence failure, payment rejection, unknown result and recovery are different scenarios unless they are truly inseparable parts of one event.
- Require every approved `AC-*` to own or explicitly reference at least one `SC-*`.
- Keep canonical Given/When/Then under the criterion. In the QA artifact, reproduce it verbatim as a derived view or link to it while adding checks and QA metadata; never rewrite its meaning.
- Do not put a sequence of test actions in one `When` such as “searches, filters, clears, saves and retries”. Do not join unrelated outcomes in one `Then` with semicolons, arrows, plus signs, slashes or equals signs.
- Keep several expected results together only when one primary event must produce all of them for the business outcome to be complete.
- Explain exact UI or domain labels when needed, while keeping the surrounding sentence natural.
- Treat matrix and dataset IDs as supporting test data, never as the business precondition. The scenario itself must state the relevant configuration, representative values, action, and expected result. Put the ID or link afterward under test data.
- Keep rows parameterized only when their business event and expected-result structure are the same. Split materially different rules, triggers, validation paths, or outcomes into separate scenarios.
- Keep actions together only when they use the same actor and context, form one submission
  or external event, cannot be meaningfully performed alone, and share one primary outcome
  and evidence. If any condition fails, split the scenario even when the `FTC-*` remains the same.
- Source every outcome-changing value or boundary from a confirmed rule, configuration,
  approved example or named dataset. Label convenient representative values as test data;
  never promote them to product behavior.
- For asynchronous results, require a final observable signal plus an approved observation
  window or completion condition. State the relevant pending/unchanged behavior and late or
  failure result. Without those decisions, use `Needs refinement`; do not invent a timeout.
- Assert exact message wording only for approved copy, legal/accessibility text or contractual
  labels. Otherwise assert the message purpose, resulting state and available user action.

Apply a readability gate before the executability gate: hide traceability metadata and technical evidence, then confirm that a product stakeholder can still explain who acts, what happens and what result is expected.

Read `references/executability-gate.md`. Apply its Gherkin clarity check before approving a scenario: require a concrete initial state, one recognizable primary business event, specific observable results, relevant exact values, and explicit unchanged behavior when regression risk makes it material. Reject vague outcomes such as “works correctly”, “processes successfully”, “updates the information”, or equivalent wording unless the scenario names the resulting state and evidence. Multiple inseparable actions are allowed; do not enforce exactly one `When` keyword as a universal rule.

For high-risk scenarios, apply the compact execution contract from that reference. Never
mark it `Ready` or `Automate now` when required data, controlled outcome, evidence, or
interacting-result coverage is missing. `Automate now` also requires `Executability: Ready`;
otherwise use `Needs refinement` and name the decision owner.

Keep this quality control internal to test design. Do not add a repeated clarity checklist below every scenario or change the output schema.

For existing packages, audit progressively:

- Preserve an existing scenario unchanged when it passes the clarity and executability checks.
- Propose an editorial clarification without changing its `SC-*` ID, traceability, behavior, or automation metadata when the meaning is confirmed but wording is vague.
- Mark `Needs refinement` and raise a question when concrete behavior, data, unchanged state, or expected evidence is unknown; never invent the missing detail.
- Do not rewrite an approved or automated scenario without showing the current wording, proposed wording, reason, and impact, then obtaining the applicable approval.

Classify automation for every `SC-*` as **Automate now**, **Automate later**, **Manual**, or **Blocked**. Write that strategy directly below the canonical scenario under its acceptance criterion so the story is self-contained. Include rationale, priority, lowest useful level, dependencies, and implementation status. Derived FTC, Jira and publication views must reuse those fields verbatim and must never recalculate the decision. Keep this separate from executability: `Ready` means QA can execute the scenario reproducibly, not that automation is valuable or already implemented. Default implementation status to `Not started`; execution results remain downstream.

Treat `Automate now`, `Automate later`, `Manual`, `Blocked`, `Not started`, `Planned`, and
`Implemented` as language-neutral controlled values for validation and tool exchange. Keep
the value unchanged in every artifact language; translate its field label and optionally
add a human explanation beside it.

For payments, distinguish authorization, capture, void, refund, settlement, and completed purchase. Test compensation failure or record it as residual risk with an owner; do not assume compensation always succeeds.

### Step 8: Produce the Coverage Ledger

For every in-scope rule and criterion, show covered, partially covered, blocked, or intentionally excluded status. Report orphan rules, criteria without rules, duplicate cases, and uncovered high risks.

Add an inline `AC → BR → CHK → FTC/SC` view suitable for the related Jira ticket.

### Step 9: Review With PM, QA, and Engineering

- **PM/PO:** confirms rules and intended outcomes
- **QA:** owns coverage strategy, test design, and residual-risk communication
- **Engineering:** confirms observability, failure modes, test level, and controllable data

The skill proposes; the team approves product behavior and release evidence.

Set the QA review state to Approved only when the executability gate passes. Use Needs refinement when the behavior is known but execution details are insufficient, and Blocked when a product, environment, or data decision prevents a valid result.

Stop after the Markdown QA handoff. Do not generate `.testcase.yml`, `.testplan.yml`, `.testrun.yml`, UUIDs, native keys, or execution results. The downstream test-management repository owns that transformation and execution lifecycle.

### Membership Example

Create small checks, preserve different events as separate scenarios and group them under
one functional case. See `skills/user-story/references/golden-example.md` for the complete
current example.

```markdown
| CHK-MEM-001 | AC-MEM-01-01 | Record one approved payment |
| CHK-MEM-002 | AC-MEM-01-01 | Create one membership for the buyer |
| CHK-MEM-003 | AC-MEM-01-01 | Do not duplicate records on repeated submission |

## FTC-MEM-01 — Purchase an individual membership

### SC-MEM-01-01 — Complete a purchase with a confirmed charge

**Covered checks:** CHK-MEM-001, CHK-MEM-002

**Given:** a buyer selected a membership whose displayed total is USD 100  
**When:** the buyer confirms the purchase and the bank reports that USD 100 was charged  
**Then:** one payment for USD 100 is recorded  
**And:** one membership is activated for the buyer.

**Test data:** USD 100 is a representative configured value, not a general price rule.

### SC-MEM-01-02 — Repeat the same purchase submission

**Covered checks:** CHK-MEM-003

**Given:** the original submission already produced one payment and one membership  
**When:** the same submission is received again  
**Then:** the existing result is returned  
**And:** no additional payment or membership is created.
```

Do not create one scenario per check. The first two checks share one event; repeated
submission and rejected payment remain separate because their triggers and outcomes change.

## Common Pitfalls

### Pitfall 1: One Test Per Field

**Symptom:** Dozens of repetitive tests differ only by equivalent input values.

**Consequence:** High maintenance with little additional defect detection.

**Fix:** Use equivalence partitions and boundaries, then show the selected representative data.

### Pitfall 2: Every Test Is End-to-End

**Symptom:** Validation, pricing, API contracts, and email content are all tested only through the browser.

**Consequence:** Slow, flaky feedback and unclear failure diagnosis.

**Fix:** Place most rules at unit, API, or integration level and reserve E2E for critical outcomes.

### Pitfall 3: AI Fills Product Gaps

**Symptom:** A test expects a limit, recipient, retry, or date policy absent from the source.

**Consequence:** QA certifies invented behavior.

**Fix:** Mark the case blocked or provisional and assign the question to a decision owner.

### Pitfall 4: The UI Message Passes While Business State Fails

**Symptom:** The test checks a success banner but not payment, membership, recipient, or duplicate state.

**Consequence:** Severe cross-system inconsistencies escape detection.

**Fix:** Assert the observable business state and relevant integration evidence.

### Pitfall 5: Coverage Count Replaces Risk Judgment

**Symptom:** Success is reported as “100 test cases created.”

**Consequence:** Volume hides uncovered critical behavior.

**Fix:** Report rule coverage, high-risk gaps, blocked decisions, and residual risk instead of case count alone.

### Pitfall 6: Several Journeys Compressed Into One Scenario

**Symptom:** “When staff selects a program, tests Back/Keep editing, saves with Cash and forces a write failure; then Draft+Commitment exist and no partial remains.”

**Consequence:** The scenario is difficult to review, execute, diagnose and automate because it contains unrelated triggers and outcomes.

**Fix:** Keep one functional case, but create separately titled scenarios for program selection, Back, Keep editing, saving, validation and persistence failure. Describe internal records only under technical evidence.

## References

- `references/test-design-techniques.md` — Technique selection guidance
- `references/risk-model.md` — Lightweight risk model and coverage depth
- `references/output-schema.md` — Required output and test-case templates
- `references/executability-gate.md` — Readiness criteria for a QA-reviewable downstream handoff
- `skills/user-story/SKILL.md` and `skills/user-story/references/golden-example.md` — Source format and complete canonical example
- `skills/user-story-mapping/SKILL.md` — Source variations, states, and rules
