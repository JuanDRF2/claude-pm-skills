# Walkthrough: a first case, up to Gate 1

A real conversation, lightly condensed. The company, product and numbers are fictitious. The PM works at a freight
software company; the assistant had no connected tools, only the skill and an organization config. Note how the
assistant keeps to one question at a time, asks what happens if nothing is built, scores risks with evidence, and
handles a number that was never measured.

**PM:** I'm a product manager at a freight software company. I want to work on a feature: let dispatchers reassign a
load to a different driver straight from the load board, without opening the load detail page.

**Assistant** (found nothing in the workspace, said so in one line, then asked the type): *What type of initiative is
this?* (new, improvement, bug, migration, contractual) → **PM:** an improvement; reassignment exists today, only on
the load detail page.

**Assistant** (proposed **standard** depth, and named three things that would push it to full) → **PM:** Standard is
fine.

Then the problem, one question per message: who (night-shift dispatchers at mid-size carriers, 40 to 60 active loads,
about 15 reassignments per shift), how they cope today (open the detail page, change the driver, save, go back; the
board's filters and scroll position reset; a separate notes document), and what it costs (about 90 seconds each, an
estimate from shadowing three dispatchers, *not measured*). The assistant noticed the filter reset might be a cheaper
fix on its own and logged it as an alternative to weigh later.

**Assistant:** *If we do not build this, what happens?* It added: if the honest answer is "not much", say so; stopping
is a valid outcome. → **PM:** two carriers, about 4% of revenue, have told their account managers they may move
night-shift volume to a competitor; volume grows 10% a quarter; no deadline. (Not a case for stopping.)

Signals came from the PM, since no feedback tool was connected: two secondhand complaints, one report from a customer
success manager of up to eight reassignments in a row when a driver calls in sick, zero known bugs (recorded as "not
searched", not "none exist"), a competitor claim recorded as unchecked hearsay.

The assistant drafted the hypothesis and an outcome: *median time to reassign a load*, target *under 25 seconds*,
baseline *unmeasured (estimate 90 s)*. Then four risks, one per message, each with evidence for and against and only
the score as a question:

| Risk | Score | What it triggered |
|---|---|---|
| Value | 3 | nothing |
| Usability | **4** (a mis-click on a dense board reassigns the wrong load) | depth upgraded to **full**; prototype mandatory; the riskiest assumption recorded as *pending* until tested |
| Feasibility | 3 (provisional; asks an engineer) | two open questions for engineering |
| Viability | 2 | an audit trail noted as a requirement |

A risk of 4 needs a mitigation plan: a prototype centered on the mis-click, tested with about five night-shift
dispatchers before Gate 3. The baseline was still a guess, so the PM chose to close Gate 1 as **provisional** with the
reason written down: the baseline must be measured from product data before prioritization.

What the state file recorded (excerpt):

```yaml
depth: full
gates:
  initiative_type: passed
  signals: provisional
gate_reasons:
  signals: Baseline median time-to-reassign is unmeasured; PM owes it from product event data before Gate 2 scoring
problem_statement:
  cost_of_inaction: Two carriers (about 4% of revenue combined) told their account managers they may move night-shift volume to a competitor...
outcome:
  metric: Median time to reassign a load
  target: Median under 25 seconds
risks:
  value: 3
  usability: 4
  feasibility: 3
  viability: 2
  highest: usability
spec:
  riskiest_assumption: pending
```

The next step was prioritization. The assistant recommended waiting for the measured baseline before scoring, because
the score would otherwise rest on three data points.
