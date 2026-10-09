# Refinement package (compact): {feature}

> Used when no refinement specialist is available (the declared fallback in `references/specialist-contracts.md`).
> It is lighter than a specialist package and says so. Light depth and bug fixes use the inline refinement in
> `references/phases-late.md` instead.
>
> Checked by: the orchestrator's own self-check, not by an independent judge, unless the PM records otherwise.

Status: draft | self-check {PASS | PASS WITH OBSERVATIONS | FAIL} on {date} | approved by {PM} on {date}
Spec: {name or link of the approved spec}

## Contents

- Stories
- Regression checks
- Test cases
- Traceability
- Coverage against the spec
- Criteria axes (Full)
- Risks
- Open questions
- Effort summary

## Stories

One block per story. Each has 3 to 6 acceptance criteria in plain Given / When / Then, in product language (what
the user observes, not how it is built).

### US-1: {title}

As a {persona}, I want {capability}, so that {outcome}.
Effort: {range with the assumptions behind it, in person-weeks or the team's unit} (source: engineer-estimated / PM estimate / AI draft, not reviewed by engineering)

| ID | Given | When | Then |
|----|-------|------|------|
| AC-1.1 | | | |
| AC-1.2 | | | |
| AC-1.3 | | | |

### US-2: {title}

(Same shape.)

## Regression checks

| ID | What must still work | Why it could break |
|----|----------------------|--------------------|
| CHK-1 | | |

## Test cases

| ID | Scenario | Steps (short) | Expected | Covers |
|----|----------|---------------|----------|--------|
| TC-1 | | | | AC-1.1 |

## Traceability

Every story links to its criteria, and every criterion to at least one check or test case.

| Story | Criterion | Check or test case |
|-------|-----------|--------------------|
| US-1 | AC-1.1 | TC-1 |

## Coverage against the spec

Every outcome in the spec's coverage matrix has a story, or a recorded non-goal.

| Spec outcome | Story | Or non-goal (reason) |
|--------------|-------|----------------------|
| | | |

## Criteria axes (Full)

For each story, mark the axes that apply and cover them. An axis that does not apply says "n/a, because".

| Axis | Covered by | Notes |
|------|------------|-------|
| Job coverage | | |
| Authorization | | |
| Data state | | |
| Boundaries | | |
| Failure modes | | |
| Concurrency | | |
| Platform | | |
| Localization | | |

## Risks

| Risk | Affects | Mitigation |
|------|---------|------------|
| | | |

## Open questions

| Question | Owner | Date |
|----------|-------|------|
| | | |

## Effort summary

| Story | Effort | Source |
|-------|--------|--------|
| US-1 | | engineer-estimated / PM estimate / AI draft, not reviewed by engineering |
| **Total** | {sum of the story efforts; this is the number pass 2 of prioritization uses} | {the weakest source in the list} |
