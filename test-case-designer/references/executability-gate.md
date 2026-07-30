# QA Executability Gate

Use this gate before approving the Markdown handoff to a test-management repository.

## Required checks

Mark each scenario Ready only when all applicable items are present:

1. Traceability: story, criterion, rules, checks, functional case, and scenario are linked.
2. Initial state: actor, permissions, record state, configuration, and relevant prior data are known.
3. Data: concrete examples or a safe strategy identifies values, boundaries, accounts, tokens, cards, dates, and records needed.
4. Primary event: QA can reproduce the user action or external event; inseparable supporting actions may remain in the same scenario.
5. Expected results: every result is specific, unambiguous, and observable by a user, external system, or authorized QA surface.
6. Evidence location: identify the screen, message, email, receipt, object/record, report, or support view where QA verifies the result.
7. Environment: required environment, integrations, controllable failures, browser/device, and dependencies are known or assigned.
8. Blockers: unresolved behavior or unavailable data/environment is visible with an owner.
9. Product readability: after hiding IDs, fixtures and technical evidence, the scenario still states a recognizable actor, one reproducible primary action and an understandable business result in complete sentences.
10. Scenario boundary: materially different actions, validation paths, failures or recovery outcomes are not compressed into one `When/Then` sequence.
11. Criterion ownership: the acceptance criterion states an explicit acceptance condition and Product and QA reuse the same stable scenario ID.
12. Gherkin clarity: after hiding traceability and technical metadata, the scenario identifies a recognizable actor or trigger, a concrete initial state, one primary business event, and specific observable results in complete product-language sentences.
13. Precision: use exact values, states, recipients, dates, limits, or record effects whenever they change the expected result; do not rely on “valid”, “appropriate”, “correctly”, “successfully”, “the information”, “process”, or “update” without naming what those terms mean in this scenario.
14. Unchanged behavior: when the action could affect related records, balances, payments, memberships, recipients, dates, statuses, or configurations, state what must remain unchanged or record why that assertion is not applicable.
15. Execution separation: keep UI click-by-click instructions, fixtures, environment setup, and technical evidence outside the canonical Given/When/Then unless they are themselves approved product behavior.

Use `Needs refinement` when behavior is confirmed but execution detail is missing. Use `Blocked` when a valid expected result or execution is impossible. Approval means ready for downstream implementation, not executed or passed.

## Progressive review of existing scenarios

Do not invalidate or rewrite an existing approved package merely because this gate was introduced later.

- **Passes:** preserve the scenario and its IDs without change.
- **Editorial ambiguity with confirmed meaning:** propose clearer wording and request approval before replacing the canonical scenario.
- **Missing product decision or evidence:** preserve the current text, mark `Needs refinement` or `Blocked`, and record the question and owner.
- **Already automated:** preserve scenario boundaries and automation metadata until the impact of the proposed clarification is reviewed.

Apply all checks obligatorily to new scenarios and to existing scenarios when they are modified, prepared for execution, or selected for automation.

## Basis

- ISTQB Advanced Test Analyst v4.0 distinguishes abstract high-level cases from concrete low-level cases and emphasizes traceability, precision, completeness, required data, and clear expected results: https://www.istqb.org/wp-content/uploads/sdm-uploads/ISTQB-CTAL-TA-Syllabus-v4.0-EN.pdf
- Cucumber defines Given as known context, When as an event/action, and Then as an observable expected outcome; it recommends concise examples but does not require exactly one When: https://cucumber.io/docs/gherkin/reference/
- ISO/IEC/IEEE 29119-3:2021 defines test-documentation templates across lifecycle models: https://www.iso.org/standard/79429.html
