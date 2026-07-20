# QA Design Output Schema

## 1. Testability Audit

List confirmed inputs, contradictions, blocked results, data/environment needs, and owners.

## 2. Risk and Coverage Strategy

| Risk | Rationale | Technique | Coverage mode | Level |
|---|---|---|---|---|

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

### Preconditions
- [Minimum setup before execution]

### Data and environment
- [Controlled data, configuration, environment, integrations]

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

Use bold labels and whitespace to separate traceability metadata from Given/When/Then behavior. Use bullets only for actual collections, multiple expected results, or compact metadata groups.

Use complete product-language sentences in Given/When/Then. Do not place fixtures such as “synthetic Contact/Household” in the business behavior, and do not compress results with `+`, `→`, `/`, `=`, or semicolon chains. A reader must understand the scenario without the traceability and technical-evidence sections.

Do not mark a scenario Ready when it uses placeholders such as “appropriate data,” “valid configuration,” “works correctly,” or “verify the records” without identifying what state, configuration, result, or evidence is required.

## 6. Traceability Ledger

| Rule | Story | Criterion | Check | Functional case | Scenario | Status | Gap/owner |
|---|---|---|---|---|---|---|---|

## 7. QA Handoff

Include project/release, epic and stories, approved functional cases, scenarios, checks, preconditions, data/environment, risk, level, evidence, automation guidance, blockers, residual risk, and requested downstream artifact language.

End with this boundary instruction:

> Use the local skills of the test-management repository to generate its native test cases, test plan, and test run. Preserve approved scenario boundaries and traceability. Assertions from the same flow may remain consolidated; do not remove behavior or risk without recording a rationale.

Do not generate `.testcase.yml`, `.testplan.yml`, `.testrun.yml`, UUIDs, native keys, counters, execution results, evidence, or defects in this skill.
