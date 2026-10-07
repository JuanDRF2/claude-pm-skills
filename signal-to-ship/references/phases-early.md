# Phases 1-3: Signals, Prioritization, Specification

> Detailed instructions for the early phases. `SKILL.md` holds the invariants, paths,
> modes and gate map; this file holds the step-by-step. Steps are tagged with the
> **mode** that runs them: `L` = light, `S` = standard, `F` = full (see SKILL.md, "Depth modes").

## Phase 1: Signals

**Goal:** Understand what is driving this work, frame the problem, and map it to the
product taxonomy.

### Step 0a — Who is asking? (only when someone with authority requested it)

When the work starts because a stakeholder asked ("Sales needs X for a deal", "leadership
wants Y"), record `request.origin: stakeholder` and fill `templates/stakeholder-request.md`
**before** problem framing. The rule: negotiate with evidence, not with position.

1. What is the **underlying need**? Ask what the customer must be able to do, and whether
   it is the whole request or a part of it.
2. What is the **smallest slice** that meets that need, and what is explicitly not in it?
3. What does saying yes **displace**? State it as a date: "X moves from A to B."
4. Who **decides** (DACI)? The approver signs off on the trade-off, and the decision date is recorded.

Gate 1 will not close on a stakeholder request without `underlying_need`, `minimal_slice`,
`tradeoff`, `approver` and `decided_on`. If the approver overrides the recommendation, record
that and the opportunity cost they accepted; do not argue it again. Requests that come from
customers or the team itself use `origin: customer` / `internal` and skip this step.

### Step 0 — Problem framing (L: one line / S, F: full)

Before any query, the PM articulates the problem in plain language. Ask these three **one per message,
in this order**, each as a single question (an example in the same sentence is fine; a second question is not):

- **Who has this problem?** A named persona ("front-desk staff member", "operations manager"), not "users".
- **How do they solve it today?** The current workaround, however ugly.
- **What does it cost them?** Time, money, frustration, lost revenue, manual steps.

If the PM arrives with a **solution** ("build Quick Checkout"), reframe: "What problem does
Quick Checkout solve? Who has it? How do they handle it today?"
If the PM arrives with a **problem** ("checkout entry takes 3 minutes and should take 30
seconds"), record it and explore solutions only after signal collection.

Save the problem statement in the state file; it feeds the hypothesis (Step 6).
A PM who cannot articulate the problem should not be collecting signals yet.

### Step 0b — The cost of not building (L, S, F; one line in Light)

Ask it **as its own question**: **"If we do not build this, what happens?"** Record the answer as
`problem_statement.cost_of_inaction`: who is hurt, how much, and by when.

Never infer it silently, even when earlier answers hint at it. If the PM already described the cost in
their own words, quote it back and ask them to confirm ("You said the cost today is none. If we do not
build this, does nothing significant happen?").

- If the honest answer is "nothing significant", say so plainly and **recommend stopping**.
  Every yes is a no to something else.
- If the PM stops: set `status: stopped` with `stop_reason` and `stopped_on`, log the decision,
  and leave later gates `pending`. A stopped initiative is a good outcome, not a failure.
- If the PM proceeds anyway, record the reason in the decision log.

### Step 1 — Automatic collection (L, S, F)

Follow `references/signal-collection.md`. Query the feedback tool, the bug tracker (resolved by
slot), the taxonomy and any customer-call source. Present each finding one at a time for PM
confirmation.

### Step 2 — Competitive research (S, F)

`references/signal-collection.md`, Section 5. Search 2-3 top competitors. Present a comparison table.

### Step 3 — Legacy analysis (conditional: Path 4 or migration state > 0)

Investigate legacy code autonomously: source repos, current behavior, delta, risks,
reference-implementation check. Present findings one at a time.

### Step 4 — Guided collection (S, F)

Only what the PM uniquely knows. Questions adapt to the initiative type.

### Step 5 — Cross-reference with the spec (if a spec exists)

For each finding: what it says, what the spec says, what the code says, is there a gap.
One finding at a time.

### Step 6 — Hypothesis and outcome (S, F)

After all signals are confirmed, ask: "We believe **[change]** will cause **[outcome]**,
measured by **[metric]**." Record in the state file. This links Phase 1 to Phase 7. Also record today's date in
`learning.hypothesis_formed`; when the first real evidence arrives (a test result, a prototype session, beta usage, an
adoption figure) record its date in `learning.first_evidence`. The gap is your **speed to learning**.

Then fix the **outcome** the work should move, as three fields: `outcome.metric`,
`outcome.baseline` (the value today, measured, not guessed) and `outcome.target`.
Example: "checkout completion, 48%, 70%". A roadmap item without a baseline and a target is
an output, not an outcome. If the baseline is unknown, the first task is to measure it. Until it is, write
`outcome.baseline` as "unmeasured (estimate X)" naming who measures it and by when, and close Gate 1 as
`provisional` with that reason in `gate_reasons.signals`. Update the baseline text when the gate status changes.

### Step 7 — Risk assessment (S, F)

The PM scores risks 1 (low) to 5 (high). The orchestrator presents each with evidence
from the signals already collected, one risk per message. Write the evidence and the gaps as **statements**; the
only question in the message is the score. (A list of things you would like to know is not a list of questions to
ask the PM: note it as an open question in the state file.)

| Risk | Question | Evidence the orchestrator cites |
|------|----------|---------------------------------|
| **Value** | Will users want this? | Feedback votes, support cases, competitive parity |
| **Usability** | Will they figure out how to use it? | Flow complexity, number of steps, similar features |
| **Feasibility** | Can we build and maintain it? | Tech dependencies, legacy constraints, team familiarity |
| **Viability** | Does it work for the business? | Pricing impact, support load, legal/compliance |
| **AI** (only if the feature includes a model; see `references/ai-features.md`) | Can the model be trusted at the autonomy we need? | Failure modes, data sensitivity, cost per task, eval feasibility |

The highest-scored risk (>= 4) decides what is validated first:

- Value >= 4 → an assumption test is required in Phase 3 before building.
- Usability >= 4 → the prototype is mandatory; Phase 4 cannot be skipped.
- Feasibility >= 4 → engineering spike before committing to the spec.
- Viability >= 4 → business-case review before proceeding.
- AI >= 4 → eval plan and autonomy limits are mandatory before Gate 3 (`references/ai-features.md`).

Any risk >= 4 **upgrades the depth mode to Full**. When value or usability is scored >= 4, also set
`spec.riskiest_assumption: pending` so the test is visible in the state until it is done.

Record in state: `risks: { value, usability, feasibility, viability, ai, highest, mitigation_plan }`.

**Gate 1:** Signal mapped to taxonomy. Source channels documented. Problem statement and
`cost_of_inaction` recorded. (S, F: hypothesis and outcome baseline/target recorded, risks
scored, with a mitigation plan for the highest when it scores >= 4. Stakeholder requests: Step 0a complete.)

## Phase 2: Prioritization

**Skipped for Path 3, 4 and 5.**

### Roadmap review (F, optional; worth it whenever several candidates compete for the same cycle)

Before scoring, the PM can take the candidates to the people who see the market and the business: leadership and
the go-to-market leads. Prepare the pre-read with `templates/roadmap-review.md` (Part 1): each candidate's
problem, signal summary, rough effort and highest risk. Showing the pre-read to anyone outside the team is a
communication, so the PM approves it first. The review feeds the manual variables of the score; it does not
replace the PM's scoring or turn into a vote. Record in the decision log that it happened and what changed.

### Scoring

Follow `references/priority-calculator.md`. Auto-fill from Phase 1 data, collect manual variables one at a time,
calculate, and show the calibration warnings listed there before the PM approves.

**Gate 2, decision point.** When the score is shown, the PM chooses one:

1. **Build now:** close Gate 2 and go on to Phase 3.
2. **Backlog:** close Gate 2 with the score recorded, log the decision, and do not start Phase 3. The
   initiative waits for a later cycle.
3. **Archive:** a recorded stop (`status: stopped`, with `stop_reason`). A stop is a valid outcome.

**Gate 2:** Score calculated and PM approves the ranking and one of the three decisions. At Full depth with a
roadmap review, produce the roadmap artifact (`templates/roadmap-review.md`, Part 2) and propose sharing it with
the people who took part; the PM approves before it goes anywhere.
When the system of record supports it, persist the score on the work item (see `references/system-of-record.md`).

## Phase 3: Specification

**When a spec exists:** review it, verify alignment with Signals findings, register gaps.
**When it does not:** invoke the spec-writer specialist. If none is installed, or the PM wants to think it
through first, run the guided interview in `references/spec-interview.md`.

### Scope decisions (L: in/out only / S, F: full)

Before closing Gate 3, confirm with the PM:

- What is **in** scope for this version.
- What is deliberately **out**, with a reason for each exclusion.
- Which **alternatives** were considered and why the chosen approach won.

### Implementation classification (S, F)

| Class | Meaning |
|-------|---------|
| `zero_touch` | Deploy and it works; no client action |
| `auto_activation` | Behind a feature flag; client activates when ready |
| `config_needed` | Needs configuration (can smart defaults or migrated config remove it?) |
| `data_migration` | Data moves between systems (must be automated and idempotent) |
| `manual_required` | Someone does something by hand (why? what would automate it?) |

For anything not `zero_touch`, ask: "What would it take to make this zero-touch?" Record the
answer as an automation plan with a target date.

### Onboarding analysis (S, F)

For each audience, what happens after deploy?

- Existing clients of the legacy flow (goal: nothing changes, or it gets better).
- Existing clients who do not use this (how do they discover it?).
- New clients (does it work out of the box?).
- Internal teams (what do CSM and Support need to know?).

### Agent surface (S, F; "none" for UI-only changes)

Every feature creates capabilities. Identify which are exposed to agents:

- **Capabilities**, not endpoints (`create_checkout`, `list_payment_methods`).
- **Consumers:** UI (always), agent/MCP, integration API.
- **Autonomy:** reads are autonomous; writes depend on destructiveness.
- **Learning signal:** what each interaction teaches the system.

If the feature includes a model, or exposes write capabilities to agents, continue with
`references/ai-features.md` (tool ergonomics, auth scopes, idempotency, eval plan).

### Adoption threshold (S, F)

The PM completes one sentence: "A user has adopted this journey when they have **[done X]**
at least **[N]** times in **[Y]** days."
Example: "...completed at least 1 checkout through the online form within 14 days of the
feature being available to them." This becomes the Phase 7 checkpoint target. If the PM
cannot write the sentence, the value proposition is not clear enough to build.

### Riskiest assumption (F, or any mode if Value/Usability >= 4)

"What is the single riskiest assumption? How could we test it without building the full
feature?" Examples:

- "We assume users prefer inline over a wizard. Test: show the prototype to 5 CSMs."
- "We assume legacy config can be auto-migrated. Test: run the migrator on 3 sandboxes."

While the test is open, the state value is `pending`. Gate 3 cannot close with `pending` or
`not_required` at Full depth, or when value or usability is >= 4: it must be `tested` or `accepted_untested`.
If it can be tested before building, record the test plan and have the PM complete it before
Gate 3. If the PM proceeds untested, record: "Assumption untested: [X]. PM accepted risk on [date]."

### Advisory check (F, optional)

If the feature has a visual component and a customer advisory group exists, ask whether
it has been validated there. Informational, never blocking.

### Early notification

When Phase 4 starts (or when Gate 3 passes on a path with no prototype), send the GTM
early heads-up described in `references/audience-views.md` (Release Communication Protocol).

**Gate 3, decision point.** When the spec is complete for the depth, the PM chooses:

1. **Approve:** close Gate 3 and send the early heads-up.
2. **Revise:** name what changes; stay in Phase 3.
3. **Defer to the roadmap:** the spec stands but the work does not start now; log the decision and park the
   initiative as at Gate 2 *backlog*.

**Gate 3 (by mode):**

| Mode | Required to close |
|------|-------------------|
| Light | Spec approved, gaps registered, scope in/out recorded |
| Standard | + alternatives, implementation class, onboarding, agent surface, adoption threshold |
| Full | + riskiest assumption tested or risk accepted, advisory status, eval plan (AI features) |
