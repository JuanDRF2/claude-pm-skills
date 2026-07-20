# Jira and Role-Specific Views

These are derived views. Approved rules, stories, and tests remain authoritative.

## Jira ticket per story

Write `jira/<US-ID>.md` with title, backlog/readiness states, user outcome, context, included/excluded scope, criteria, dependencies/enablers, questions/owners, inline criterion-rule-test traceability, and QA notes. Copy approved criteria without abbreviating their behavior.

Use this reading order: **user story → scope → agreed behavior/rules → dependencies and questions → acceptance criteria → QA coverage**. Place status and readiness in a clearly labeled compact section. Prefer human-readable headings with IDs retained for traceability. Separate sections with whitespace; avoid long undifferentiated metadata lists, embedded CSS, or platform-specific presentation.

Add `Pruebas relacionadas` grouped by criterion with: plain-language purpose, `CHK-*`, `FTC-*`/`SC-*`, status, and link to `07-functional-test-cases.md`. Keep Markdown tickets concise; an interactive reader may derive and display the full related scenarios inline without changing the authoritative ticket file.

## DEV handoff

Include approved stories and criteria, dependencies, enablers, observability, failure behavior, and engineering confirmations. Do not paste every test step.

## QA handoff

Group by story and functional case. Show scenarios, covered checks, preconditions, data/environment needs, risk, priority, level, each scenario's automation decision and rationale, expected evidence, and residual risk. Add a downstream instruction to preserve behavior and traceability while allowing assertions from the same flow to remain consolidated.

## Package index

Show project status separately from each delivery, then link business understanding, rules, map, releases, tickets, tests, handoffs, and traceability.
