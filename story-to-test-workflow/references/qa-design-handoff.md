# QA Design Handoff Boundary

This workflow owns test intent; the downstream test-management repository owns native representation and execution.

## Produce here

- Atomic `CHK-*` coverage units
- Grouped `FTC-*` functional cases and `SC-*` scenarios
- Preconditions, controlled data, environment needs, risk, level, evidence, and one explicit automation decision per scenario
- Traceability from rule and criterion to check and scenario
- QA approval state, blockers, and residual risk
- A self-contained Markdown handoff

For every `SC-*`, separate `Executability` from `Automation`. Include automation decision, rationale, priority, recommended level, dependencies, and coverage status. `Ready` never means `Automated`, and `Implemented` requires downstream evidence.

## Leave downstream

- `.testcase.yml`, `.testplan.yml`, and `.testrun.yml`
- Native test keys, UUIDs, counters, folders, and metadata
- Test-plan selection and run scheduling
- Actual results, attachments, defects, summaries, and execution history

## Grouping rule

Keep a new scenario only when it can reveal a different root business behavior. If several checks are consequences of the same action, keep one scenario and add observable `Then` results. The downstream repository may adapt formatting but must not drop approved behavior, risk, or traceability without a recorded reason.
