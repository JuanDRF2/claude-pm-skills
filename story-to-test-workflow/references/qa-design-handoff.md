# QA Design Handoff Boundary

This workflow owns test intent; the downstream test-management repository owns native representation and execution.

## Produce here

- Atomic `CHK-*` coverage units
- Grouped `FTC-*` functional cases and `SC-*` scenarios
- Preconditions, controlled data, environment needs, risk, level, evidence, and one explicit automation decision per scenario
- Traceability from rule and criterion to check and scenario
- QA approval state, blockers, and residual risk
- A risk-based journey-integrity decision and, when required, one `FTC-*` composition from
  entry action through final business and downstream consistency
- A self-contained Markdown handoff

For every `SC-*`, separate `Executability` from `Automation`. Include automation decision, rationale, priority, recommended level, dependencies, and coverage status. `Ready` never means `Automated`, and `Implemented` requires downstream evidence.

## Leave downstream

- `.testcase.yml`, `.testplan.yml`, and `.testrun.yml`
- Native test keys, UUIDs, counters, folders, and metadata
- Test-plan selection and run scheduling
- Actual results, attachments, defects, summaries, and execution history

## Grouping rule

Keep a new scenario only when it can reveal a different root business behavior. If several checks are consequences of the same action, keep one scenario and add observable `Then` results. The downstream repository may adapt formatting but must not drop approved behavior, risk, or traceability without a recorded reason.

For a required critical journey, scenarios remain independently executable and may share one
journey-level `FTC-*`. The downstream repository may implement one thin E2E or a manual path
plus lower-level tests, but must preserve the complete functional composition and residual
risk even when no automation is selected.
