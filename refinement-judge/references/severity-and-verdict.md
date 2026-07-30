# Severity and Verdict

## Severity

### Critical

Use when the defect can plausibly cause unauthorized access, data loss, incorrect financial behavior, unsafe irreversible action, material compliance exposure, or a fundamentally wrong implementation.

Blocks the intended consequential action.

### High

Use when required behavior, evidence, ownership or coverage is missing or contradictory enough that DEV or QA cannot proceed reliably.

Blocks the intended consequential action.

### Medium

Use when ambiguity, incomplete variation coverage, weak traceability or unclear executability can produce inconsistent implementation or review.

Blocks approval until corrected or explicitly accepted by a human owner.

### Low

Use for localized clarity, navigation, naming or maintainability problems that do not materially change implementation or QA interpretation.

Does not block by itself.

### Observation

Use for optional improvements or residual risk that is already understood and controlled. Do not disguise a real defect as an observation to obtain a pass.

## Finding status

Use one:

- Open
- Resolved
- Accepted risk
- Not reproducible
- Superseded

Include verification evidence for `Resolved` and human owner, reason and date for `Accepted risk`.

## Verdict algorithm

Evaluate only current open findings:

```text
Any Critical, High or Medium → FAIL
Only Low or Observation       → PASS WITH OBSERVATIONS / PASS CON OBSERVACIONES
No open findings              → PASS
Evidence unavailable for a required full-fidelity review → FAIL
Deterministic preflight failure → FAIL
```

Do not average severity or offset one defect with strengths elsewhere.

## Action gate

With `FAIL`, block:

- External Notion publication or update
- Jira ticket creation or update
- Approved final DEV/QA handoff
- Automation handoff represented as approved
- Public hosting
- Any action the user identified as consequential

Allow read-only review and clearly labeled local drafts.

## Human override

An override requires:

- Exact action being authorized
- Finding IDs being accepted
- Accountable human owner
- Reason
- Date
- Residual consequence

Record:

```text
Gate override: Authorized with accepted risk
Original verdict: FAIL
Authorized action: ...
Accepted findings: ...
Owner: ...
Reason: ...
Date: YYYY-MM-DD
```

The original verdict remains `FAIL`; the override authorizes only the named action.
