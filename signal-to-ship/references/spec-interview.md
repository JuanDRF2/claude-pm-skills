# Spec interview (a guided spec from zero)

How the orchestrator builds a spec **with** the PM when none exists. It is the fallback of the `spec-writer`
slot (`references/specialist-contracts.md`): when `mini-spec-writer` or `prd-writer` is installed, they fill the
slot and this guide only supplies the Gate 3 addendum. Use it when no spec skill is available, when the PM wants
to think the problem through before writing, or when a draft arrives that nobody has questioned.

The point is the thinking, not the document. A spec generated from a one-line prompt is confidently wrong; a
spec built from answers the PM had to defend is reviewable.

## Ground rules

- **Interview, do not generate.** One question per message (invariant 5), each with a short example. Do not
  draft the spec body before Round 2 is confirmed.
- **Start from what is already known.** Phase 1 left a problem statement, an outcome, a hypothesis and risks in
  the state file. Read them out and ask only for what is missing; never re-ask what the PM already answered.
- **Evidence comes from the slots, never from memory.** Counts and quotes come from the feedback tool, the
  tracker and call notes. If a number is not available, write "unmeasured" and name who can measure it.
- **Push back, politely and specifically.** See the list below. A vague answer is not accepted twice.
- **Write to a shared system only after approval** (invariant 14). The draft lives in the working directory
  until the PM approves publishing it.

## Depth

| Depth | What runs |
|-------|-----------|
| Light | Skip this guide: Gate 3 needs scope in/out only. |
| Standard | Pre-fill, Rounds 1 and 2, deliverables and the coverage matrix, then the Gate 3 addendum. Acceptance criteria are drafted in Phase 5 by the refinement specialist. |
| Full | Everything, including the acceptance-criteria pass in Round 3. |

## The rounds

```
Pre-fill (no questions): read the state file, present what is already known
  -> Round 1: problem and people (confirm, ask only what is missing)
  -> [CHECKPOINT 1] read back, PM confirms
  -> Evidence: pull the business case from the slots, PM reacts
  -> [CHECKPOINT 2] business case accepted or corrected
  -> Round 2: strategy (success, constraints, non-goals, dependencies, stop condition)
  -> [CHECKPOINT 3] PM confirms Round 2 -- only now is the body drafted
  -> Draft: deliverables + outcome coverage matrix
  -> [CHECKPOINT 4] PM reviews and iterates on the body
  -> Round 3 (Full): acceptance-criteria pass
  -> [CHECKPOINT 5] PM prunes, then the tech lead prunes
  -> Gate 3 addendum (phases-early.md) -> Gate 3
```

### Pre-fill

Say, in one message: "I start from this: problem, outcome, hypothesis, highest risk. Correct anything that is
wrong." Add one line on how the interview works: rounds with checkpoints, no draft until the strategy round is
confirmed, and every outcome the spec promises ends up as a deliverable or a recorded non-goal. Then ask the
first gap, if any.

### Round 1: problem and people

Confirm or collect: **who** has the problem (a persona, not "users"), **how they cope today**, **what it costs
them**, and **why now** (what changed, or what happens if we wait). If the PM arrives with a solution, reframe
as in Phase 1 Step 0.

### Evidence

Pull the signals the slots can give (votes and requesters, linked support cases or bugs, call mentions, a
competitor check at Standard and Full). Present all of it, one finding at a time, including what contradicts the
PM's view. The PM decides what is relevant.

### Round 2: strategy

- **Success:** the metric, tied to `outcome.metric`, with its baseline and target. Ask for the number that
  would make the team say "it worked".
- **Constraints:** legal, contractual, technical, calendar.
- **Non-goals:** at least one, each with a reason. A spec with no non-goals has no scope.
- **Dependencies and systems touched:** what must exist first, which data and integrations are involved.
- **Stop condition:** what evidence, found mid-build, would make us stop.

### Draft: deliverables and the coverage matrix

1. List the **outcomes** the work promises: the job being done, `outcome.target`, and anything the hypothesis
   claims. These are the completion contract.
2. Break the work into **deliverables**. Each must pass the sizing tests: it can be demoed on its own, it moves
   one persona through one action, it can be built and merged without waiting for another deliverable, and it
   has an observable pass or fail. A deliverable that fails a test is split.
3. Build the **outcome coverage matrix**: every outcome maps to a deliverable or to an explicit non-goal.

| Outcome | Deliverable(s) | Or non-goal (reason) |
|---------|----------------|----------------------|
| | | |

An outcome with neither a deliverable nor a recorded non-goal blocks Checkpoint 4. Do not drop one silently,
even if it is inconvenient.

Estimates are optional and are the delivery team's: present effort as a range with the assumptions it rests on.

### Round 3 (Full): acceptance-criteria pass

For each deliverable, write acceptance criteria in plain Given / When / Then, in product language (what the
user observes, not how it is built). Cover the axes below; an axis that does not apply is marked "n/a, because".

| Axis | Ask |
|------|-----|
| Job coverage | Does the happy path deliver the outcome? |
| Authorization | Who can and cannot do it? What do they see otherwise? |
| Data state | Empty, very large, legacy, partially migrated data |
| Boundaries | Limits, minimums, maximums, formats |
| Failure modes | What breaks, and what does the user see? |
| Concurrency | Two people, two tabs, a retry |
| Platform | Devices, browsers, embedded surfaces |
| Localization | Language, currency, date and number formats |

There is no hard cap on criteria. At 30 or more for one deliverable, say so: the deliverable is probably too
big. The PM prunes first, then the tech lead; record what was cut and why.

## Pushback list

| You hear | You say |
|----------|---------|
| A solution ("add a wizard") | "What problem does it solve, for whom, and how do they cope today?" |
| "Improve" or "better" as the metric | "Better by how much, measured how, from what baseline?" |
| One persona for a multi-role job | "Who else touches this? What do they need to see?" |
| No non-goals | "What is a reasonable person likely to assume is included that we are not doing?" |
| An outcome with no deliverable | "This promise has no work behind it. Build it, or record it as a non-goal." |
| A deliverable that needs another one first | "It is a slice of a bigger piece. Merge them or reorder." |
| Criteria that name a table, a service or a framework | "Say what the user sees instead; the how goes in the technical notes." |
| Certainty with no evidence | "What would change your mind? What have we seen that says so?" |

## Output

A Markdown document next to the state file (named after the feature, ending in "-spec"), with this skeleton:

```
# Spec: {feature}
Status: draft | approved on {date} by {PM}
## Problem and people        (persona, workaround, cost, why now)
## Evidence                  (what was found, with its source, and what contradicts the plan)
## Success                   (metric, baseline, target, adoption threshold)
## Scope                     (in, out with reasons, alternatives considered)
## Constraints and dependencies
## Outcomes and deliverables (the coverage matrix, then each deliverable)
## Acceptance criteria       (Full; otherwise "drafted in refinement")
## Risks and stop condition  (from the state file, plus anything new)
## Open questions            (each with an owner and a date)
```

Do not overwrite an existing spec document: write a new version beside it, or ask.

## Hand-off to Gate 3

When the PM approves the spec, copy what the state file tracks: `scope.in`, `scope.out`,
`scope.alternatives_considered`, and `spec.adoption_threshold`. Then collect the rest of the Gate 3 addendum
(`references/phases-early.md`: implementation class, onboarding, agent surface, riskiest assumption). Record the
approval in the decision log. For a feature with a model or agent write access, continue with
`references/ai-features.md` before Gate 3.
