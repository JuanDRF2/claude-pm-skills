# Matrix Decision Contract

Use this contract during test design when requirements include interacting settings, states, permissions, calculations, boundaries, or reusable datasets.

## Decision Rule

Create a matrix when at least one condition is true:

1. Two or more independent variables change the applicable rule or expected result and produce at least four meaningful combinations.
2. The same calculation or controlled dataset is reused by two or more stories, channels, or flows.
3. Exact amounts, rounding, boundaries, permissions, or state transitions create high impact if one combination is missed.
4. A compact decision table is materially clearer than repeating the same setup across several scenarios.

Do not create a matrix when:

- one variable changes;
- two or three cases are clearer as separate scenarios;
- the journey is linear;
- all variations produce the same result; or
- the matrix would merely repeat existing scenarios.

When uncertain, prefer scenarios. Record `Matrix: Not needed` with a short reason.

## Combination Strategy

Do not generate an unfiltered Cartesian product.

- Use complete coverage for financial, permission, destructive, identity, or lifecycle rules when every combination can change the outcome.
- Use boundary values for ranges, amounts, dates, counts, and percentages.
- Use equivalence classes when several values behave the same.
- Use pairwise sampling only for lower-risk interactions and state what was intentionally omitted.

Record:

```markdown
### Matrix assessment

- Interacting variables:
- Meaningful combinations:
- Does the rule or result change?:
- Risk of an omitted combination:
- Reused by multiple stories or flows:
- Decision: Create matrix | Matrix not needed
- Technique: Complete | Boundaries | Equivalence classes | Pairwise
- Rationale:
```

## Scenario Contract

A matrix complements scenarios; it never replaces them.

Every scenario that uses a matrix row must remain understandable without opening it:

- name the actor or business context;
- state the relevant configuration and representative values;
- include one recognizable event;
- state the observable business result and exact values when material.

Place matrix or dataset IDs after the behavior under `Test data`, `Complete numeric data`, or the equivalent. Never use only `Given dataset X`, `Given QA executes matrix X`, or `See canonical matrix` as the initial state.

If rows have materially different triggers, rules, or primary outcomes, create separate `SC-*` scenarios. Keep rows parameterized under one scenario only when the business event and expected outcome structure are the same.

## Ownership and Publication

- Keep one canonical matrix in local Markdown.
- Consumer stories summarize the row values they need and link to the canonical matrix.
- Publish the matrix as navigable content in every selected collaborative format.
- Notion and any optional Word export must not rely on a local filesystem path.
- A broken or unavailable matrix link must not make a story impossible to understand or approve.
