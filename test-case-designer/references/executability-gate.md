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
16. Controlled-value source: every value, boundary, date, amount, recipient or provider outcome that changes the expected result comes from a confirmed rule, configuration, approved example or named dataset. Mark illustrative values as test data, not product rules.
17. Asynchronous completion: an asynchronous result has a final observable signal and an approved observation window or completion condition; identify material pending/unchanged behavior and the late or failure result. Without them, use `Needs refinement`.
18. Message assertion: require literal wording only when approved copy, legal/accessibility text or a contractual label makes it material; otherwise verify purpose, resulting state and available action.
19. Journey context: atomicity has not removed essential context. The scenario names the
    actor or trigger, relevant point in the journey, concrete state, decision/action and
    observable business result. A reader does not need another criterion to discover what
    “Yes”, “save”, “selected” or an internal status means.

Use `Needs refinement` when behavior is confirmed but execution detail is missing. Use `Blocked` when a valid expected result or execution is impossible. Approval means ready for downstream implementation, not executed or passed.

## Progressive review of existing scenarios

Do not invalidate or rewrite an existing approved package merely because this gate was introduced later.

- **Passes:** preserve the scenario and its IDs without change.
- **Editorial ambiguity with confirmed meaning:** propose clearer wording and request approval before replacing the canonical scenario.
- **Missing product decision or evidence:** preserve the current text, mark `Needs refinement` or `Blocked`, and record the question and owner.
- **Already automated:** preserve scenario boundaries and automation metadata until the impact of the proposed clarification is reviewed.

Apply all checks obligatorily to new scenarios and to existing scenarios when they are modified, prepared for execution, or selected for automation.

## Deterministic scenario boundary

Keep actions in one scenario only when all are true:

1. They use the same actor and business context.
2. They form one submission, transaction or external event.
3. Removing one would make that event incomplete rather than create another valid journey.
4. They lead to one primary outcome and use the same evidence.

If any answer is no, create another `SC-*`; the scenarios may still share one `FTC-*`.
Multiple `Then/And` statements remain together only when each is necessary evidence that
the one outcome completed consistently.

## Plain-language gate

Read only the scenario title and Given/When/Then, hiding IDs, fixtures and technical evidence.
A non-technical stakeholder must still be able to state who acts, what happens, what changes
and what remains unchanged. Organize the rest as QA preparation/evidence and then optional
technical detail; do not move missing business meaning into those later layers.

For a story whose criteria divide one sequential journey, also inspect its short main-flow
summary. It should connect entry, preparation, material decisions, final action and visible
completion without turning every scenario into an end-to-end script. Require a subsequent
destination only when it is confirmed product behavior.

## Compact high-risk contract

For explicitly High/Critical risk scenarios, payments, scheduling, retries, duplicate
prevention, destructive actions, identity, permissions, or cross-system consistency, a
`Ready` or `Automate now` scenario must add four short fields:
`Executability: Ready`, `Controlled example`, `Initial state`, `Controlled outcome`, and `Observable evidence`.
Use representative dates, amounts, states and provider results only where they affect the
outcome. For partial or accumulated recovery, also add `Combination coverage` as a compact
decision table or named set of outcomes. Do not repeat setup that is identical across a
functional case; reference its controlled dataset and state only the values material to the
scenario. `Automate now` also requires `Executability: Ready` and is invalid while this
contract is incomplete.

## Journey-integrity gate

Apply `journey-integrity-contract.md` to every critical connected journey. Before approving
QA design, confirm that one `FTC-*` composes its atomic scenarios from the entry action to
visible outcome, final completion and applicable downstream consistency. Require one thin
complete validation path or an explicit Manual/Blocked decision with rationale and owner.

Do not require every scenario to repeat the whole journey and do not accept execution-order
dependencies between scenarios. Calculations, boundaries, failures and combinations may
remain at lower test levels. Missing composition, applicable downstream evidence,
independence or residual-risk disclosure makes QA design `Needs refinement` or `Blocked`.

## Basis

- ISTQB Advanced Test Analyst v4.0 distinguishes abstract high-level cases from concrete low-level cases and emphasizes traceability, precision, completeness, required data, and clear expected results: https://www.istqb.org/wp-content/uploads/sdm-uploads/ISTQB-CTAL-TA-Syllabus-v4.0-EN.pdf
- Cucumber defines Given as known context, When as an event/action, and Then as an observable expected outcome; it recommends concise examples but does not require exactly one When: https://cucumber.io/docs/gherkin/reference/
- ISO/IEC/IEEE 29119-3:2021 defines test-documentation templates across lifecycle models: https://www.iso.org/standard/79429.html
