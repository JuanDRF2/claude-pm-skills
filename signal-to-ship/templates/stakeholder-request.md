# Stakeholder Request: [short name]

> Use when work starts because someone with authority asked for it ("Sales needs X for a
> deal", "the CEO wants Y"). The machine-checked fields live in the `request:` block of
> `00-signal-to-ship-state.md`; this page is the human record. Fill it before Gate 1 closes.
> Goal: a decision that can be defended later, not a refusal and not a silent yes.

## 1. The ask

| Field | Value |
|-------|-------|
| Requested by (`request.requester`) | [role, e.g. "Head of Sales"] |
| What they asked for (`request.ask`) | [their words, not your translation] |
| Why now / deadline | [deal, contract, event; with the date] |
| Evidence offered | [who else asked, revenue at stake, competitor move; mark anything unverified] |

## 2. The need behind it (`request.underlying_need`)

What must be true for the requester to get what they actually need?
Ask: "What does the customer have to be able to do?" and "Is it the whole feature or part of it?"

## 3. The smallest slice that meets the need (`request.minimal_slice`)

The ~20% that unlocks the outcome. State what is **not** in it.

## 4. Options and trade-off (`request.tradeoff`)

| Option | Effort | What it delays or displaces | Risk |
|--------|--------|-----------------------------|------|
| Do the full request | | | |
| Do the minimal slice | | | |
| Do nothing / decline | | | |

State the displacement explicitly: "If we do this, **[X]** moves from **[date]** to **[date]**."

## 5. Decision (DACI)

| Role | Who |
|------|-----|
| **D**river (runs it) | |
| **A**pprover (decides; `request.approver`) | |
| **C**ontributors (consulted) | |
| **I**nformed | |

Decided on (`request.decided_on`): [ISO date]. Decision: [full / slice / decline / defer].
If the approver overrides the recommendation, record that, plus the opportunity cost they accepted.

## 6. Follow-up

Review date for the decision and the metric that will show whether it was right.
