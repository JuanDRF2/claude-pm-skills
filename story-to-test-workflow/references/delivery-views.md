# Jira and Role-Specific Views

These are derived views. Approved rules, stories, and tests remain authoritative.

## Jira ticket per story

Write `jira/<US-ID>.md` as a self-contained, human-readable projection with title,
backlog/readiness states, the complete user-story statement, context, included/excluded
scope, agreed rules in understandable language, dependencies/enablers, questions/owners,
acceptance criteria, canonical scenarios, inline criterion-rule-test traceability and QA
notes. Copy every applicable approved `AC-*` and its complete `SC-*` Given/When/Then
behavior without abbreviation. A list of IDs or a link to another file is not a substitute.

Use this reading order: **user story → scope → agreed behavior/rules → dependencies and questions → acceptance criteria → QA coverage**. Place status and readiness in a clearly labeled compact section. Prefer human-readable headings with IDs retained for traceability. Separate sections with whitespace; avoid long undifferentiated metadata lists, embedded CSS, or platform-specific presentation.

Add `Pruebas relacionadas` grouped by criterion with: plain-language purpose, `CHK-*`,
`FTC-*`/`SC-*`, status, and link to `07-functional-test-cases.md`. Keep detailed execution
data in the QA artifact, but retain enough scenario behavior and evidence intent for DEV and
QA to understand the ticket without reconstructing it from GitHub.

Treat this file as the exact functional payload for Jira. The remote ticket may adapt
rendering or destination fields, but must not add invented design specifications,
assumptions, estimates or behavior. Include technical considerations or sizing only when
they were confirmed in the canonical package. After publication, compare the remote ticket
with this projection; do not maintain a separate enriched Jira version.

## DEV handoff

Include approved stories and criteria, dependencies, enablers, observability, failure behavior, engineering confirmations, and the current Judge verdict with a relative report link. Do not paste every test step.

## QA handoff

Group by story and functional case. Show scenarios, covered checks, preconditions, data/environment needs, risk, priority, level, each scenario's automation decision and rationale, expected evidence, residual risk, and the current Judge verdict with a relative report link. Add a downstream instruction to preserve behavior and traceability while allowing assertions from the same flow to remain consolidated.

## Package index

Show project status separately from each delivery, then link business understanding, rules, map, releases, tickets, tests, handoffs, traceability, and `11-refinement-judge-report.md`. Display the Judge verdict, reviewed snapshot, review date and exact next action allowed or blocked.
