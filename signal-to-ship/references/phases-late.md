# Phases 4-7 Reference

Detailed instructions for the orchestrator's later phases. Loaded on demand when
the cycle reaches Phase 4 or later.

## Phase 4: Prototyping (optional)

**Goal:** Build a clickable prototype, validate it with stakeholders, iterate until approved.

**Orchestrator behavior:**
- Always run it when: a new feature with a visual component (Path 1), or `risks.usability` >= 4
- Suggest it when: an enhancement that changes the experience, or a migration with a significant interface change.
  Ask: "This changes what people see. Do you want a prototype to validate it?" If the PM declines, skip with a
  recorded reason in `gate_reasons.prototyping`
- Skip when: backend-only, bug fix, contractual, a migration with no visible change, or the PM declines

**If executed:**

Step 1 — Build:
- Invoke /prototype skill with the spec as context
- Claude builds the prototype and deploys to ephemeral URL

Step 2 — Validation planning:
- Ask: "Who needs to validate this prototype?"
  - Internal departments (Engineering, QA, Design, CSM, Sales, C-Level)
  - External (clients, prospects)
  - Both
- Generate shareable link + validation checklist tailored to each audience
- Ask explicitly: "Will you test this with end users who match the persona in the problem statement?
  Stakeholders and an advisory group are valuable, but their approval does not prove usability."
  - **Yes:** plan a light test: 3 to 5 people who match the persona, specific tasks, completion measured. Record
    `validation.end_user_test: done` and the result in the narrative.
  - **No:** record `accepted_risk` with the reason in `validation.end_user_note` ("no matching users reachable
    before the contract date"), or `not_applicable` when there is no end user (an internal tool for the team
    that already reviewed it).
- If a beta is likely after launch, seed the plan now (which clients, what success looks like, rough timeline).
  Phase 6 formalizes it; the decision starts here.

Step 3 — Collect feedback:
- PM brings feedback from each stakeholder
- Orchestrator organizes by: approved as-is / needs changes / blocking concerns

Step 4 — Iterate (loop until validated):
- If changes needed: describe modifications, update proto, same URL refreshes
- If blocking: escalate to PM for decision
- Repeat until all stakeholders approve or PM makes a call

Step 5 — Post-validation (Acme-specific):
- Generate DS Gap Report: components in proto not in @acme/design-system
- Generate component spec drafts
- Create issue tickets in issue tracker (slot)

**Gate 4, decision point.** When feedback is in, ask the PM to choose. Stakeholder approvals the PM reports,
and even "close Gate 4", are inputs, not the choice: ask the three-way question explicitly and close the gate
only after the answer.

1. **Validated:** approved, with or without minor changes. Proceed.
2. **Iterate:** significant changes needed. Go back to Step 4.
3. **Pivot:** fundamental problems. Return to Phase 3, or defer.

On *validated*, in the same message, propose the feedback request or validation message (audiences and timing in
`references/audience-views.md`): who receives it, the prototype link, the specific question ("click through and
tell us what is missing for your work"). Show it with the recipient list. The PM answers **approve / edit /
skip**; nothing is sent without that answer. Use a direct message rather than a public channel when you want
honest feedback.

The feedback request does not hold the gate. If it cannot go out yet (a missing prototype link, say), give the PM
the ready-to-paste text, note in the narrative that it is pending and who sends it, and close the gate.

**Gate 4:** Prototype validated with stakeholders and `validation.end_user_test` answered; the feedback request
proposed (sent, skipped with a reason, or pending an input from the PM); OR phase explicitly skipped.

## Phase 5: Refinement

**Goal:** Produce stories, acceptance criteria, QA coverage, and pass the Judge.

**Size it by depth, before dispatching anything.**

- **Light (and Path 3, a bug fix):** do **not** dispatch `story-to-test-workflow`, `test-case-designer` or any
  multi-file refinement package. Write the refinement **inline**, in one message: a one-sentence story, 2 to 4
  acceptance criteria in plain Given / When / Then, what to regression-check, and the out-of-scope line. Show
  it to the PM, record it in the state file's narrative, and close Gate 5 on the PM's review (the judge slot's
  fallback applies when it is disabled). A one-line fix does not need a story map, a split, or a QA package.
- **Standard and Full:** use the specialist below.

**Orchestrator actions (Standard and Full):**
- Invoke story-to-test-workflow as the specialist orchestrator for this phase
- Pass all registered gaps from Specification phase as input
- story-to-test-workflow handles its own internal gates (Gates 1-5)
- Signal to Ship orchestrator waits for Judge PASS

**For existing packages (review + gap resolution):**
- story-to-test-workflow reviews the package against Signal to Ship findings
- Resolves gaps registered in Specification phase
- Generates proposals or applies changes (with PM authorization)

**Gate 5, decision point.** After the judge runs, present the result:

1. **PASS:** stories and QA coverage are complete. Proceed.
2. **PASS WITH OBSERVATIONS:** proceed only after the PM has read the observations; record them and the risks they
   carry in the state file's narrative and name them in the handoff.
3. **FAIL:** show the findings. The PM fixes and resubmits; nothing is handed off until PASS or PASS WITH OBSERVATIONS.

On PASS, propose the **handoff to Dev and QA**: the stories, acceptance criteria and scenario counts, the test
plan, dependencies, blockers and environment needs, delivered through the tracker slot and the refinement
package. Show the counts and the blocker list, then ask **approve / hold**. The handoff is a write to a shared
system, so the PM's approval of its content is what triggers it (invariant 14).

**Gate 5:** refinement-judge PASS or PASS WITH OBSERVATIONS (risks recorded); handoff to Dev and QA sent, or held with a reason.

## Pre-Release Readiness (between Gate 5 and Gate 6)

**Goal:** Verify that what was promised in Phase 3 actually works. This is verification,
not generation. Runs after UAT, before Gate 6 opens. Light depth runs only the first block.

**Implementation verification** (matches the class chosen in Phase 3):
- [ ] `zero_touch`: deploy to staging and open it as an existing client. Does it just work?
- [ ] `data_migration`: run the migrator on staging. Zero errors? Data correct and idempotent?
- [ ] `config_needed`: are smart defaults set? Does legacy config migrate automatically?
- [ ] `manual_required`: guide written? Time per client estimated? Automation plan committed?

**Onboarding verification** (Standard, Full):
- [ ] Existing clients of the legacy flow: everything works, or is better.
- [ ] New clients: works out of the box in a clean sandbox.
- [ ] Internal: demo done and recorded; CSM and Support can answer basic questions.

**Agent surface verification** (if applicable; details in `references/ai-features.md`):
- [ ] Tools documented and registered.
- [ ] Agent auth configured with scoped credentials, not shared human credentials.
- [ ] Autonomous-vs-confirmation boundaries tested, including the failure path.
- [ ] Eval plan executed and release threshold met (AI features).

**Content verification** (Standard, Full):
- [ ] Help article reviewed by Support.
- [ ] Walkthrough video or demo recorded.
- [ ] Sales material updated (if applicable).

**Feature roast** (Full; worth it at Standard for anything customer-facing): a 45-minute session to break the
feature before customers do, using `templates/feature-roast.md`. Record `readiness.roast: done`, or `skipped` with a
reason in `readiness.roast_note`. Full depth cannot close Gate 6 without one of the two.

**Go/no-go (decision point):** the PM confirms every applicable item and chooses **go** or **hold**.
Blockers are documented with a PM decision (launch with documented blockers, or wait). Only after a *go*
does Gate 6 open.

## Phase 6: Delivery

**Goal:** Push artifacts to all audiences.

**Orchestrator actions:**
- Invoke jira-story-publisher (or issue tracker equivalent) for Dev tickets
- Invoke sync-refinement-package-taxonomy for taxonomy alignment
- Select and fill the appropriate delivery template based on initiative type
- Generate audience-specific views per `references/audience-views.md`

**Gate-based communication.** Communication is tied to gates, not calendar dates. The full
protocol (timing by gate, 5-question check, rollout types, rollback) lives in
`references/audience-views.md`. Two templates support it: `templates/gtm-early-warning.md`
(sent when the spec is approved) and `templates/rollback-notice.md` (sent if a release is rolled back).

**Delivery templates** (in `templates/`):

| Template | Use when |
|----------|----------|
| `release-notes.md` | New feature or major enhancement |
| `migration-release-notes.md` | V1 to V2 migration or platform parity |
| `patch-notes.md` | Bug fix or hotfix |
| `product-marketing-spec.md` | New product or product-level positioning |
| `gtm-early-warning.md` | Spec approved; early heads-up to GTM leads |
| `rollback-notice.md` | A released change is rolled back |

The orchestrator selects the template based on initiative type (confirmed in Signals)
and asks the PM which sections apply. Templates are configurable: organizations can
add, remove, or modify templates in the `templates/` directory.

**Audience checklist:**
- [ ] Dev: Issue tracker tickets created
- [ ] QA: Test cases delivered (from refinement)
- [ ] Product: Taxonomy outcomes updated
- [ ] CSM: Implementation notes (if applicable)
- [ ] Marketing: Value prop summary (if applicable)
- [ ] Sales: Competitive positioning (if applicable)
- [ ] C-Level: Roadmap entry updated (if applicable)
- [ ] End User: Knowledge article draft (if applicable)

**Beta / rollout plan (after artifacts generated):**

Before declaring delivery complete, the orchestrator guides a rollout plan:

1. Ask: "How will this be rolled out?"
   - a) All clients at once (feature flag off, deploy, flag on)
   - b) Beta with specific client(s) first, then general availability
   - c) Phased by client segment or region
   - d) Internal only (staff tool, no client rollout needed)

2. If beta (option b): document the beta plan:
   - Which client(s) and why
   - **Usage contract** (state `beta.*`): the minimum usage that makes the beta meaningful (for example "at least 3
     clients use it weekly for 4 weeks" in `minimum_usage`), the number of feedback sessions you will hold
     (`feedback_sessions`, at least 1), and what moves it to general availability (`exit_criteria`). Gate 6 does not
     close for a beta without the first two
   - Success criteria for moving from beta to GA
   - Timeline (beta start, evaluation, GA target)
   - Rollback plan if beta fails

3. If phased (option c): document the rollout sequence and criteria for each phase.

**Launch readiness check (before closing Gate 6):**

The orchestrator verifies that generating artifacts is not enough. The teams must
have consumed them. Ask the PM to confirm:

- [ ] Dev: stories are in the sprint and assigned
- [ ] QA: test plan reviewed, environment ready (or blockers documented)
- [ ] CSM: briefed on what's changing, client communication plan exists
- [ ] Implementation: setup guide reviewed, can configure independently
- [ ] Support: Knowledge Article reviewed, FAQ covers expected questions
- [ ] Sales: can articulate the value prop without reading the doc
- [ ] Marketing: positioning approved, launch materials ready (if applicable)

Not every item applies. The orchestrator presents only the applicable items
based on the initiative type and audience applicability matrix.

If a team is not ready, document the blocker and track it. Gate 6 can pass
with documented blockers as long as the PM acknowledges them.

**5-question validation:** before publishing any artifact, verify the 5 questions in
`references/audience-views.md` (Release Communication Protocol) are answered.

**Publication tracking:** for each artifact the PM approves, record the channel and the
datetime it was published. At gate close, verify every applicable artifact is published and
flag any stuck at `draft` or `reviewed`. The orchestrator **proposes** each publication
("CSM briefing is ready. Publish to the CS channel? yes / no / later") and only the PM's
approval triggers it. Each one gets its own answer, **approve / edit / skip**; record what was published (and
where and when), what was skipped and why, and what is still pending. One approval never covers the next artifact.

**Gate 6:** All applicable audience artifacts generated AND published. Beta/rollout plan
defined. Launch readiness confirmed (or blockers documented). Publication tracked for every artifact.

## Post-deploy (after Gate 6, before measurement starts)

A separate step, not part of Gate 6: the artifacts say what is coming; this confirms that it arrived.

1. **Confirm it is live.** Ask: "Is it live in production? On what date?" Record `delivery.deployed_on`. If the
   date differs from `delivery.delivery_date` (the plan), keep both: the plan stays as it was, the real date
   drives everything after.
2. **Verify the artifacts.** Count what Gate 6 published and what is still pending, and say so: "4 published,
   1 still draft. Announce now or wait?"
3. **Propose the announcement** to the audiences that received the Gate 6 artifacts: what shipped, who it
   affects, how to explain the value, where to find the help article. Show the recipients and the text; the PM
   answers **approve / edit / skip**. Do this right after the deploy date is recorded, even when the launch
   was weeks ago (say how long ago it was), and before configuring measurement. Record `delivery.announcement` as `sent`, or `skipped` with the
   reason in `delivery.announcement_note` (an internal-only rollout has no external announcement).
4. **Re-anchor the checkpoints** if they were already set from the planned date (Phase 7 below).

**Rollback protocol.** If the PM reports a problem after deploy, offer the rollback notice at once, using
`templates/rollback-notice.md`: the same audiences and channels as the original, the same day. Contents: what
happened, current status, when the next update comes, and what to do in the meantime. The PM approves it like any
other communication. Mark the affected delivery rows `rollback_sent`, and route the cause to Phase 1 as a new signal.

## Phase 7: Measurement

**Goal:** Configure metrics and establish baseline.

**Orchestrator actions:**

0. **Start from what Phase 3 already decided.** The adoption threshold, the outcome metric (`outcome.*`) and the
   hypothesis are the source of truth. This phase does not invent new success metrics: it checks that they can
   be measured and sets up the collection. If Phase 3 was skipped (a bug fix, say), propose metrics from scratch.
1. Research industry best practices and competitor metrics for the feature domain
2. Propose metrics organized in five categories:
   - **Product & Engagement** (Pendo/TestIds): adoption rate, completion rate, time to
     complete, error rate, channel distribution
   - **Customer Success** (Survey Tool): CES for feature-level satisfaction (better than
     NPS for individual features), NPS for general satisfaction, recurring signup rate
   - **Business Impact** (CRM/Analytics): average transaction size, retention
     post-migration, conversion rates for new capabilities
   - **Go-to-Market** (cross-team): time to first client adoption (days from GA to first
     real use), Sales pipeline impact (deals influenced or unblocked), CS ticket deflection
     (support tickets reduced by Knowledge Article or self-service), Knowledge Article
     usage (views, helpful votes), implementation time (hours from request to live),
     client communication reach (% of affected clients notified before launch)
   - **Retention Impact** (CRM/Analytics): compare retention curves of users who adopted
     the feature with those who did not. If adopters retain meaningfully better, the feature
     creates real value; if the curves are identical, it is cosmetic regardless of adoption.
     Needs enough cohort size and time; if the usage cycle is longer than the checkpoint
     window (e.g. annual renewals), say so and define the proxy metric instead.
   - **AI Quality** (only for features with a model; see `references/ai-features.md`):
     acceptance/edit rate of outputs, cost per successful outcome, escalation-to-human
     rate, eval pass rate over time, drift indicators.
3. Define TestIds following convention `<feature>-<element>-<type>`. For each TestId document
   the screen/element, the event type (click/view/submit/error) and what it measures. Record
   them in the scorecard's analytics events table.
4. Configure Survey Tool trigger with appropriate survey type:
   - CES (Customer Effort Score) for task-completion features (recommended for most)
   - NPS for broader experience assessment
   - CSAT for service-oriented features
5. Establish baseline: for migrations, measure V1 current values before switching

The orchestrator investigates market benchmarks and competitor analytics capabilities
before proposing metrics. It presents the proposal and confirms with the PM.

For migrations specifically: the primary question is "does V2 perform as well as or
better than V1?" not "do users want this?" Metrics should compare V2 vs V1 baseline.

**AI Pre-analysis (post-launch):**
When measurement data is available, the orchestrator:
- Analyzes CES/NPS/CSAT trends, usage patterns, survey responses
- Compares V2 metrics against V1 baseline (for migrations)
- Generates suggested actions: "CES dropped to 4.2 after release. 3 users reported
  [issue]. Consider: [specific action]"
- Routes issues back to Signals phase as new signal entries

6. **Hypothesis check (Standard, Full):** read the hypothesis from the state file (recorded in
   Gate 1) and verify the metrics will actually test it. If the hypothesis says "cut time from
   3 min to 30 sec" and no metric measures time, flag the gap.

7. **Measurement schedule.** Register three checkpoints from the **real deploy date** (`delivery.deployed_on`;
   the planned `delivery.delivery_date` only until the deploy is confirmed) and the adoption threshold from
   Phase 3. If the deploy slips after the checkpoints were set, re-anchor them on the real date, or record in
   `measurement.window_reason` why the original ones stay. The defaults are Day-14 / Day-30 / Day-60; **adjust the
   windows to the feature's natural usage cycle** (a weekly workflow can use 14/30/60, an
   annual one needs longer windows or a leading indicator) and record the reason.

   - **Checkpoint 1 (default Day-14):** is the adoption threshold being met? New friction? Also report the **speed to
     learning**: days between `learning.hypothesis_formed` and `learning.first_evidence`; if no evidence has arrived
     yet, say that and name what would count.
     Check adoption rate, error rate and support-ticket count. Adoption under 30% points to
     onboarding friction: recommend investigation.
   - **Checkpoint 2 (default Day-30):** time-to-value confirmed? Segment splits visible?
     Check adoption by client segment, effort score, implementation time. Compare adopters
     and non-adopters. Compare the adoption figure with `spec.adoption_threshold` from Phase 3
     (and with the outcome baseline and target) and record it in `measurement.adoption_d30`.
   - **Checkpoint 3 (default Day-60):** did the original problem actually get solved? Has
     complaint volume on it fallen? Record the measured value and adoption status. If status is
     still `not_checked` after this checkpoint, flag it to the PM.

   **Record what the PM reports as soon as they report it**, even when other numbers are still missing:
   write `measurement.adoption_d30` (and the other figures) to the state file in that same turn. Mark the
   checkpoint `checked` once the PM has given at least its main figure (adoption at checkpoint 2), and list
   what is still missing as an open action with an owner and a date. Never hold a reported number back
   until a second one arrives: an unrecorded figure is a lost figure.

   Dates are saved in state. The orchestrator is pull-based, so it also supports **scheduled
   checkpoints** (a recurring agent that opens the case and surfaces due checkpoints; see
   `references/architecture.md`). When the PM returns to `/signal-to-ship <feature>`, three things come first, in
   this order: a planned delivery date that has passed with no `delivery.deployed_on` ("did it ship, and when?");
   any passed checkpoint ("Checkpoint 1 passed on [date]. Have you checked adoption?"); and the next checkpoint
   if it falls within the next 7 days.

8. **Verdict (after the last checkpoint).** When checkpoint 3 is checked, the PM records
   `measurement.verdict` and `verdict_reason`. This is the decision most teams skip:

   | Verdict | Use when |
   |---------|----------|
   | `keep` | Adoption met the threshold and the outcome moved toward its target |
   | `iterate` | The problem is real but this version did not solve it; route the learning to Phase 1 as a new signal |
   | `retire` | Adoption stayed well under the threshold and no iteration is justified; plan removal or sunset |

   Compare against `outcome.baseline` and `outcome.target` from Gate 1, not against feeling.
   Whatever the verdict, route the reasons and any user feedback back to Phase 1 as new signals.
   Under-used features carry a cost (maintenance, support, onboarding noise), so `retire` is a
   normal outcome. Record `measurement.adoption_d30` when checkpoint 2 is checked: it feeds the
   portfolio view (`npm run portfolio`), which flags delivered features nobody has measured.
   The validator requires the verdict once checkpoint 3 is in `measurement.checked`.

**Gate 7:** Metrics defined (5 categories, AI Quality when applicable). TestIds assigned with
event structure. Survey trigger configured. Baseline plan established. Hypothesis verifiable by
the metrics. Checkpoints scheduled with windows justified.
