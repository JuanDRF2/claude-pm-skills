# Feature Roast: [feature name]

> A structured session to **break the feature before customers do**. Run it between Gate 5 and Gate 6, as part of
> Pre-Release Readiness. Required at full depth (or skipped with a written reason); worth it at standard depth for
> anything customer-facing. About 45 minutes. Record the result in `readiness.roast` of the state file.

## Setup

| Field | Value |
|-------|-------|
| Date and length | |
| Facilitator (the PM) | |
| In the room | engineering, design, QA, support or customer success, and **one skeptic who did not build it** |
| Build under test | [version, staging link] |

## Rules

1. The goal is to find failures, not to defend the feature. The builders listen and take notes.
2. Every finding is written down with a severity and an owner. No debate during the session about fixes.
3. Use real data and the real persona, not the happy path the team rehearsed.

## Angles to try (tick each, note what happened)

- [ ] **Empty and first-time state:** a new customer with no data
- [ ] **Wrong or messy data:** missing fields, very long values, duplicates, odd characters
- [ ] **The wrong persona:** someone without the permission, or a different role than designed for
- [ ] **Undo and mistakes:** a mis-click, a wrong confirmation, leaving halfway, going back
- [ ] **Scale:** ten times the usual volume; a slow connection
- [ ] **Interruptions:** a timeout, a refresh, two people at once
- [ ] **Accessibility and small screens**
- [ ] **What a support agent would be asked** the day after launch
- [ ] **The money or data trail:** does anything change that a customer would not expect?

## Findings

| # | What broke or confused | Severity (blocker, serious, minor) | Owner | Decision (fix before launch, accept with a reason, defer with a date) |
|---|------------------------|------------------------------------|-------|------------------------------------------------------------------------|
| | | | | |

## Outcome

- Blockers open: [number]. Launch decision: [go, go with documented blockers, wait].
- Set `readiness.roast: done` in the state file, or `skipped` with `readiness.roast_note` explaining why.
