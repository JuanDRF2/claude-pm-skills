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

Use `Needs refinement` when behavior is confirmed but execution detail is missing. Use `Blocked` when a valid expected result or execution is impossible. Approval means ready for downstream implementation, not executed or passed.

## Basis

- ISTQB Advanced Test Analyst v4.0 distinguishes abstract high-level cases from concrete low-level cases and emphasizes traceability, precision, completeness, required data, and clear expected results: https://www.istqb.org/wp-content/uploads/sdm-uploads/ISTQB-CTAL-TA-Syllabus-v4.0-EN.pdf
- Cucumber defines Given as known context, When as an event/action, and Then as an observable expected outcome; it recommends concise examples but does not require exactly one When: https://cucumber.io/docs/gherkin/reference/
- ISO/IEC/IEEE 29119-3:2021 defines test-documentation templates across lifecycle models: https://www.iso.org/standard/79429.html
