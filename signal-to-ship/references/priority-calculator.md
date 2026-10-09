# Prioritization in two passes

> How the orchestrator helps the PM decide whether work is worth building, before and after the real effort is
> known. The PM always chooses the method. A score is an input to the PM's decision, not the decision.

## Contents

- When it applies
- The method question (always asked)
- Pass 1 (Gate 2)
- Pass 2 (end of Phase 5)
- Inputs per method
- Calibration warnings
- Light depth
- Roadmap review and ranking
- What gets recorded

## When it applies

| Path | Pass 1 (Gate 2) | Pass 2 (end of Phase 5) |
|------|-----------------|-------------------------|
| 1 New feature or improvement, visual | yes | yes |
| 2 New feature or improvement, backend only | yes | yes |
| 3 Bug fix | skipped (urgency decides) | skipped |
| 4 Migration or parity | skipped (the decision is made) | skipped |
| 5 Contractual deadline | skipped (the date decides) | skipped |

Pass 2 runs only when Gate 2 recorded `build_now`. A saved case from an earlier version that has no
prioritization block skips pass 2.

## The method question (always asked)

Ask it at the start of pass 1, every time, even if the organization's config names a method. The configured one is
shown as a suggestion and never applied silently.

```
Which prioritization method do you want to use? My suggestion: {X}, because {reason from evidence you actually have}.
{If the organization config names one: "Your organization's config names {Y}; I treat that as a suggestion, not a default."}
1. RICE: Reach, Impact, Confidence, Effort. Best when you have usage or reach data.
2. ICE: Impact, Confidence, Ease. Best with little information or an early product.
3. WSJF: cost of delay divided by job size. Best when the cost of delay is known or a deadline decays value.
4. MoSCoW: Must / Should / Could / Won't. Classifies, does not rank. Best for a fixed-scope release or a date.
5. Value vs Effort 2x2: best for a team workshop.
6. Custom: you define the variables and the formula.
A score is an input to your decision, not the decision.
```

### How to suggest one

Take the first row whose condition the evidence supports, in this order (the most decisive condition first). The
reason must cite a real finding ("the feedback tool shows 14 requesting accounts", "no usage data was found"),
never a generic sentence.

| Evidence | Suggest |
|----------|---------|
| A fixed date or a fixed scope | MoSCoW |
| Cost of delay, or a deadline whose value decays, is named | WSJF |
| Usage or reach data is available | RICE |
| Anything else (little information, or an early product) | ICE |
| The PM says they will score it with the team | Value vs Effort 2x2 |
| The PM asks for their own variables | Custom |

The last two rows depend on what the PM says; never infer them. If the configured value is not one of the six methods (including values from earlier versions), read it as "no
suggestion" and tell the PM in one line. The value `gut_check` is accepted but used only at Light.
Record the PM's choice as `prioritization.method`, your suggestion as
`method_suggested`, and the reason as `method_reason` (add "PM chose X" when different).

## Pass 1 (Gate 2)

1. **Open the gate** (`references/guided-flow.md`) and ask the method question.
2. **Collect the inputs in one fill-in line**, for the chosen method (next section). When a feedback tool is
   visible, propose auto-filled values from the Phase 1 data and ask the PM to correct them; otherwise ask for an
   estimate. Always include **effort as a range** and a **confidence level** (low / medium / high; confidence in
   the inputs, not the RICE Confidence variable). Label every input **measured**, **estimated** or **guessed**.
   Offer "unknown" for any part.
3. **Show the result.** Compute with the arithmetic visible. Show the score as a **range**: the best case at the
   low end of the effort, the worst case at the high end. Next to it show the confidence and the highest risk
   from Phase 1. Show at most three calibration warnings that apply. Say: a score is an input, not the decision.
4. **Ask the decision**: build now / backlog / archive. Close Gate 2 only on the PM's answer (invariant 17); "ok"
   to the score is not the answer.

Outcomes:

- **Build now:** close Gate 2 and go on to Phase 3.
- **Backlog:** close Gate 2 with the pass 1 record, log it, and do not start Phase 3. The status stays active.
  Say how to bring it back (`references/going-back.md`).
- **Archive:** a recorded stop. Set the status to stopped with `stop_reason` and `stopped_on`, record
  `pass1_decision: archive`, and leave Gate 2 pending (a stopped initiative keeps its remaining gates pending; Gate
  2 passes only on build now or backlog). A stop is a valid outcome. If a stakeholder or customer asked for it,
  propose the notice to them (`references/going-back.md`).

Record: `prioritization.method`, `method_suggested`, `method_reason`, `method_custom` (only for Custom),
`pass1_size`, `pass1_confidence`, `pass1_score` (a range, or a category; it may stay empty for a gut check or a
custom method), `pass1_decision`, `pass1_on`.

## Pass 2 (end of Phase 5)

Run it after the refinement judge verdict (PASS or PASS WITH OBSERVATIONS, or the orchestrator's self-check) and
**before** the Gate 5 handoff to Dev and QA is proposed. The handoff writes to a shared system; pass 2 must come
first so tickets are never sent for work the PM then drops. Gate 6 never opens without pass 2.

1. **Take the real effort from the refined stories, and label where it comes from:** `engineer-estimated`,
   `PM estimate` or `AI draft, not reviewed by engineering`. The compact refinement package carries an effort and a
   source per story: sum the efforts and take the weakest source. With a specialist package, ask one question:
   "Effort from the refined stories (sum of the engineering estimates, or your best estimate)?" If the source is
   `AI draft`, say so and ask whether an engineer can sanity-check it before the PM confirms (one question, the PM
   may skip). Show the label next to the number and keep it in `pass2_effort` (for example "6 weeks (AI draft, not
   reviewed by engineering)").
2. **Recompute with the same method** and the same other inputs, unless the PM says they changed.
3. **Say where it falls against the pass 1 range:** inside, above or below. If above the top of the range, say it
   plainly and ask the PM to reconsider. The decision is theirs.
4. **Ask: confirm / change / backlog.** When the effort lands inside or below the pass 1 range, say so in one line and
   recommend confirm as the default; do not present a fresh menu.
   - **Confirm:** keep building. Go on to the handoff proposal.
   - **Change:** the PM keeps building on changed terms (scope, date, effort or order). Ask what changed in one
     question and record it as `pass2_note`. This is not a go-back.
   - **Backlog:** hold the handoff with the reason "back to backlog (pass 2)". Gate 5 closes with the handoff
     held, Gate 6 does not open, and the status stays active.
5. Record `pass2_effort`, `pass2_score`, `pass2_decision`, `pass2_note` (required for change), `pass2_on`.

## Inputs per method

Ask all of them in one fill-in line; the PM may answer "unknown" for any part.

| Method | Inputs | Result |
|--------|--------|--------|
| RICE | Reach per quarter; Impact (0.25, 0.5, 1, 2, 3); Confidence (50%, 80%, 100%); Effort as a range in person-weeks | Reach x Impact x Confidence / Effort |
| ICE | Impact (1 to 10); Confidence (1 to 10); Ease (1 to 10, asked directly as a range; show the person-week range beside it) | Impact x Confidence x Ease |
| WSJF | Value, time criticality, risk reduction (each 1 to 10); job size on the same 1 to 10 relative scale, as a range, with the person-week range beside it | (Value + Time criticality + Risk reduction) / Job size |
| MoSCoW | Category (Must / Should / Could / Won't); what it hangs on; effort as a range | A category. No score. |
| Value vs Effort 2x2 | Value (1 to 10); effort as a range. Ask where the lines are between low and high. | A quadrant |
| Custom | The PM states the variables, their scales and the formula. Restate them back, compute with the arithmetic shown, and store them as `method_custom`. | The PM's formula |
| Gut check (Light) | Size (XS to XL, or a range); confidence; decision | A size and a decision |

The range shown reflects the effort range only, unless the PM also gives low and high values for Reach or Impact; in
that case compute the best case from the high values and the low effort, and the worst case from the low values and
the high effort. Say which one you showed. Scores from different methods are never compared (ICE multiplies, WSJF
adds and then divides).

Worked example for RICE, with fictitious inputs: Reach 400 a quarter (estimated), Impact 1 (estimated), Confidence
80% (guessed), Effort 3 to 5 person-weeks. Best case 400 x 1 x 0.8 / 3 = 107; worst case 400 x 1 x 0.8 / 5 = 64.
Result: 64 to 107, confidence medium.

Auto-fill when a feedback tool is visible: Reach can start from the requesting users and companies the tool
reports, and the number of signal channels that produced data shows how well the evidence is spread. These are
proposals for the PM to correct, labeled with their source.

## Calibration warnings

Show at most three that apply, before the PM decides.

- **Vote bias.** Feedback-tool votes over-represent the loudest and most engaged customers. If Reach and Impact
  rest only on votes, say so and ask whether silent segments (support cases, call insights, churned accounts) tell
  a different story.
- **Evidence diversity.** A score backed by one channel is weaker than one backed by three. Name the missing channel.
- **Effort is the whole path to production.** When construction is AI-assisted, build effort shrinks but
  validation, review, integration and rollout effort do not. Ask for the whole path to production, not the coding
  time, or the score will favor work that is quick to generate and slow to ship.
- **Learning value.** Two items with the same score are not equal if one tests a risky assumption cheaply. Prefer
  the one that teaches more, and say why.

Never rank on the score alone: it is always shown next to the highest risk from Phase 1.

## Light depth

Replace the six-method menu with a suggestion of a gut check: "Small work: a gut check, no formula. Name a method
if you prefer one of the six." Replying with size and confidence counts as choosing the gut check. One message asks
for size (XS to XL, or a range) and confidence as the fill-in, and ends with the decision words (build now /
backlog / archive) as the one question. Close Gate 2 only when the PM names one of the three (invariant 17). Record
`method: gut_check`. If the depth is upgraded to Standard later in the case, redo pass 1 with the method menu.

Pass 2 at Light is one line after the inline refinement: "Still build now at about {effort}? yes / change /
backlog."

## Roadmap review and ranking

At Full depth, the optional roadmap review (`templates/roadmap-review.md`) happens before pass 1. Its artifact
shows `Method: {method}`. A ranked list across initiatives compares only items scored with the same method;
otherwise it groups them by method (`references/roadmap-view.md`).

## What gets recorded

1. The saved progress: the prioritization fields above, and Gate 2 passed (or the stop).
2. The scorecard: the "Prioritization (two passes)" table (`templates/feature-scorecard.md`).
3. When the system of record supports it, the score on the work item (`references/system-of-record.md`).
