# QA Design Output Schema

## Contents

- Testability audit
- Risk and coverage strategy
- Journey integrity review
- Atomic coverage checks
- Grouping review
- Functional test case
- Traceability ledger
- QA handoff

## 1. Testability Audit

List confirmed inputs, contradictions, blocked results, data/environment needs, and owners.

## 2. Risk and Coverage Strategy

| Risk | Rationale | Technique | Coverage mode | Level |
|---|---|---|---|---|

## 2A. Journey Integrity Review

Keep this inventory in `06-test-coverage.md`. Include every critical connected journey and
any candidate that was evaluated and found genuinely isolated.

| Journey / candidate FTC | Risk | Decision | Reason | Complete validation path | Downstream scope | Gap/owner |
|---|---|---|---|---|---|---|
| Purchase membership / FTC-MEM-01 | Critical | Required | Payment and membership must complete consistently | Thin E2E plus API checks | Payment, membership, relationships and duplicates | None |
| View static help / FTC-HELP-01 | Low | Not applicable | One isolated read-only event | Component | Not applicable | None |

Use only `Required` or `Not applicable` as the decision. A required journey receives the
composition in its `FTC-*`; `Not applicable` always includes a concrete reason.

## 3. Atomic Coverage Checks

Keep these in `06-test-coverage.md`. A check is a traceability unit, not a manual execution or a TestManager file.

| Check | Story | Criterion | Rules | What must be proven | Risk | Level | Evidence | Status |
|---|---|---|---|---|---|---|---|---|
| CHK-ABC-001 | US-ABC-01 | AC-ABC-01-01 | BR-01 | [One independently traceable verification] | High | Integration | [Observable proof] | Planned |

Allowed status values: Planned, Covered by scenario, Blocked, Deferred, Excluded with rationale.

## 4. Grouping Review

Before writing scenarios, list candidate checks and decide whether to merge them into one scenario or keep separate. Create a separate scenario only when flow, precondition, trigger, primary rule, expected business outcome, risk, or required evidence changes materially.

Treat selection, navigation, confirmation, save, validation, rejection, unknown result, recovery and cancellation as separate scenarios when each has its own trigger or primary outcome. Grouping them under one `FTC-*` does not require compressing them into one `SC-*`.

Inventory the canonical `SC-*` scenarios already defined under `AC-*`. Do not create replacement QA scenarios. Map each scenario to one `FTC-*`, its checks and its QA metadata. If test design discovers a missing scenario, add it under the owning criterion first and then group it.

## 5. Functional Test Case

Keep these in `07-functional-test-cases.md`.

```markdown
## [FTC-ID] — [Feature or primary user action]

- Stories:
- Purpose:
- Priority/Risk:
- Recommended level:
- Automation recommendation:
- QA review state: Draft/Approved/Blocked
- Executability: Ready/Needs refinement/Blocked — [reason]
- Journey integrity: Required/Not applicable — [risk-based reason]

### Preconditions
- [Minimum setup before execution]

### Data and environment
- [Controlled data, configuration, environment, integrations and source of every material value]

### Journey composition

Include this section when `Journey integrity: Required`; omit it for a justified isolated
event.

- **Entry action:** [User action or external trigger]
- **Visible outcome:** [Understandable result for the user or authorized actor]
- **Completion condition:** [Final observable processing signal]
- **Downstream consistency:** [Applicable records/results, counts, relationships, values,
  states, duplicates and idempotency, or Not applicable with reason]
- **Composing scenarios:** [Canonical SC-IDs]
- **End-to-end validation:** [Thin E2E, Integration or Manual path; or Blocked with reason and owner]
- **Scenario independence:** [How each scenario creates or receives its own initial state]
- **Authorized evidence:** [Approved UI, API, internal UI, query, record, message, receipt or log]
- **Residual risk:** [Remaining unproven risk, or None with basis]

### [SC-ID] — [Exact canonical scenario title from the criterion]

**Covered checks:** [CHK-IDs]

**Criteria and rules:** [AC-IDs; BR-IDs]

**Canonical behavior:** [Verbatim reproduction or relative link to the SC under its AC; never a rewritten QA variant]

**Given:** [Initial state]  
**When:** [One primary event or action]  
**Then:**
  - [Observable business result]
  - [Related consistency/evidence assertion from the same flow]

**Technical evidence:** [Internal records, APIs, events, correlation/idempotency references, logs or jobs required to prove consistency; omit when unnecessary]

**Evidence:** [UI, record, email, receipt, log, or other proof]

**Evidence location:** [Exact screen, object/record, message, report, or support view]

**Asynchronous observation:** [Only when applicable: final signal, approved observation window/completion condition, pending state and late/failure result]

**Message assertion:** [Exact approved wording, or purpose/resulting state/available action]

Omit asynchronous and message fields when they do not apply; never leave template placeholders in an approved handoff.

For explicit High/Critical risk or critical-domain scenarios only, add the compact fields defined in
`executability-gate.md`: **Controlled example**, **Initial state**, **Controlled outcome**,
**Observable evidence**, and—when outcomes interact—**Combination coverage**.

- **Automation:** Automate now/Automate later/Manual/Blocked
- **Automation rationale:** [Why this scenario should or should not be automated now]
- **Automation priority:** High/Medium/Low/To define
- **Recommended automation level:** Unit/Component/API/Integration/E2E/Manual/To define
- **Automation dependencies:** [Data, environment, mock, provider behavior, fault injection, or None]
- **Automated coverage:** Not started/Planned/Implemented
- **Execution notes:** [Only information QA needs to perform or diagnose]
```

Every check must map to at least one scenario or carry a gap status. Do not create one scenario per check by default.

Make the automation decision canonically on each `SC-*` under its criterion; the `FTC-*` recommendation is only the grouping strategy and must reuse the scenario decision verbatim. Do not infer `Automate now` from `Executability: Ready`, and do not use `Implemented`, `Passed`, or `Failed` without downstream evidence.

The journey-level end-to-end decision is a composition strategy, not a replacement for the
scenario-level automation fields. It may reference several independently executable
scenarios. Do not create additional acceptance criteria for test mechanics or internal
records.

Use bold labels and whitespace to separate traceability metadata from Given/When/Then behavior. Use bullets only for actual collections, multiple expected results, or compact metadata groups.

Use complete product-language sentences in Given/When/Then. Do not place fixtures such as “synthetic Contact/Household” in the business behavior, and do not compress results with `+`, `→`, `/`, `=`, or semicolon chains. A reader must understand the scenario without the traceability and technical-evidence sections.

Atomic does not mean fragmentary. Include the actor or trigger, relevant journey state and
the name of any question or choice being answered. A technical status may be evidence, but
the scenario must state the observable business result first. Do not repeat an entire main
journey when only one step changes.

Keep the output in three layers: understandable business behavior, QA preparation/evidence,
and optional technical evidence. Keep actions in one scenario only when they share actor,
context, one submission/event, one primary outcome and the same evidence. Source material
values from confirmed rules, configuration, approved examples or named datasets.

Do not mark a scenario Ready when it uses placeholders such as “appropriate data,” “valid configuration,” “works correctly,” or “verify the records” without identifying what state, configuration, result, or evidence is required.

For asynchronous outcomes, `Ready` requires a final observable signal and an approved
window or completion condition; do not invent a timeout. Validate literal copy only when
an approved requirement makes the wording contractual. Otherwise verify meaning, state and
available action.

## 6. Traceability Ledger

| Rule | Story | Criterion | Check | Functional case | Scenario | Status | Gap/owner |
|---|---|---|---|---|---|---|---|

## 7. QA Handoff

Use `Automate now`, `Automate later`, `Manual`, `Blocked`, `Not started`, `Planned`, and
`Implemented` as language-neutral controlled values. Translate field labels, not these
stored values; add a localized explanation when it improves readability.

Include project/release, epic and stories, approved functional cases, scenarios, checks, preconditions, data/environment, risk, level, evidence, automation guidance, blockers, residual risk, and requested downstream artifact language.

End with this boundary instruction:

> Use the local skills of the test-management repository to generate its native test cases, test plan, and test run. Preserve approved scenario boundaries and traceability. Assertions from the same flow may remain consolidated; do not remove behavior or risk without recording a rationale.

Do not generate `.testcase.yml`, `.testplan.yml`, `.testrun.yml`, UUIDs, native keys, counters, execution results, evidence, or defects in this skill.

See `skills/user-story/references/golden-example.md` for the complete canonical story-to-QA example.
