# Feature Scorecard: [Feature Name]

> Permanent record of one feature's cycle. The machine-checked state lives in
> `00-signal-to-ship-state.md`; this scorecard is the human-readable summary.
> Sections tagged **(S/F)** are skipped in Light depth.

## Identity

| Field | Value |
|-------|-------|
| Product | [from taxonomy] |
| Feature | [from taxonomy] |
| JTBD | [from taxonomy] |
| Owner | [PM name] |
| Initiative type / path | [type] / [1-5] |
| Depth | light / standard / full |
| Delivery date | [ISO date, set when Gate 6 closes] |
| Hypothesis **(S/F)** | We believe [change] will cause [outcome] measured by [metric]. |

## Problem statement

| Field | Value |
|-------|-------|
| Who has this problem | |
| Current workaround | |
| What it costs them | |
| If we do not build this, what happens? (`cost_of_inaction`) | |

## Outcome **(S/F)**

| Metric | Baseline (measured) | Target |
|--------|---------------------|--------|
| | | |

## Alternatives considered **(S/F)**

| Option | Why considered | Why rejected / chosen |
|--------|----------------|-----------------------|
| [Chosen approach] | | Selected because: |
| [Alternative A] | | Rejected because: |

## Scope

- **In:** [what this version includes]
- **Out (and why):** [what is deliberately excluded, with the reason for each]
- **Deferred to next iteration:** [items from Signals classified as "next iteration"]

## Signal sources

- [ ] Pain points: [support case count] cases, [feedback vote count] votes
- [ ] Customer calls: [count] mentions
- [ ] Competitive: [which competitors have this]
- [ ] Market: [review-site mentions]
- [ ] Tech debt: [migration state, debt score]
- [ ] Contractual: [client commitments]

## Prioritization (two passes; Paths 1-2)

The PM chose the method; a score is an input to the decision, not the decision.

| Field | Value |
|-------|-------|
| Method chosen / suggested | rice / ice / wsjf / moscow / value_effort / custom / gut_check; the skill suggested [..] because [..] |
| Custom variables and formula (only if custom) | |

**Pass 1 (Gate 2)**

| Field | Value |
|-------|-------|
| Inputs (each labeled measured / estimated / guessed) | |
| Effort (range) | |
| Score (range) or category | |
| Confidence in the inputs | low / medium / high |
| Highest Phase 1 risk shown beside it | |
| Calibration warnings shown | vote bias / evidence diversity / effort basis / learning value |
| Decision and date | build now / backlog / archive, on [date] |

**Pass 2 (end of Phase 5, after the refinement verdict)**

| Field | Value |
|-------|-------|
| Real effort from the refined stories | |
| Score (range) or category | |
| Where it falls against the pass 1 range | inside / above / below |
| Decision and date | confirm / change / backlog, on [date] |
| What changed (if change) | scope / date / effort / order: [..] |

## Risk assessment **(S/F)**

| Risk | Score (1-5) | Evidence | Mitigation |
|------|-------------|----------|------------|
| Value | | | |
| Usability | | | |
| Feasibility | | | |
| Viability | | | |
| AI (only if the feature includes a model) | | | |
| **Highest risk** | | | |

Any score >= 4 upgrades the depth to Full.

## Implementation classification **(S/F)**

| Field | Value |
|-------|-------|
| Class | zero_touch / auto_activation / config_needed / data_migration / manual_required |
| Manual steps | |
| Automation plan | |
| Target date | |

## Onboarding analysis **(S/F)**

| Audience | Plan |
|----------|------|
| Existing clients of the legacy flow | |
| Existing non-users | |
| New clients | |
| Internal teams (CSM/Support) | |

## Adoption threshold **(S/F)**

A user has adopted this journey when they have [done X] at least [N] times in [Y] days.

## Riskiest assumption (Full, or any depth when value/usability >= 4)

| Field | Value |
|-------|-------|
| Assumption | |
| Test plan | |
| Tested? / result | |
| If untested: risk accepted by PM on | |

## Agent surface **(S/F)**

| Field | Value |
|-------|-------|
| Capabilities | |
| UI consumer | Yes |
| Agent / MCP consumer | |
| Integration API consumer | |
| Autonomy levels (read / propose / execute with approval) | |
| Tool descriptions, scopes, idempotency reviewed | |

## AI feature plan (only if the feature includes a model)

| Field | Value |
|-------|-------|
| Eval plan status | draft / approved / executed |
| Golden dataset (size, source, owner) | |
| Quality criteria and release thresholds | |
| Failure modes covered | |
| Cost per successful outcome (target) | |
| Human-escalation path | |

## Refinement status

- [ ] Stories written ([count])
- [ ] QA coverage ([count] scenarios, [count] checks)
- [ ] Judge: PASS / FAIL / PENDING
- [ ] Taxonomy synced

## Pre-release readiness

- [ ] Implementation verified against the class above
- [ ] Onboarding verified (legacy clients, new clients, internal)
- [ ] Agent surface verified (if applicable)
- [ ] Content verified (help article, walkthrough, sales material)
- [ ] Go / no-go decision: [go / go with documented blockers / wait] on [date]

## Design

- Design reference URL: [link]
- Design file URL: [link if applicable]

## Survey configuration

- Trigger: [when to show survey]
- Questions: [effort score + feature-specific]
- Frequency: [admin-configured]

## TestIds and analytics events

Convention: `<feature>-<element>-<type>`. Coverage: [count] TestIds defined.

| TestId | Screen / element | Event type | What it measures |
|--------|------------------|------------|------------------|
| `feature-element-action` | [where] | click / view / submit / error | |

## Delivery status

| Audience | Artifact | Status | Published to | Published at |
|----------|----------|--------|--------------|--------------|
| Dev | Issue-tracker stories | | | |
| QA | Test cases | | | |
| Product | Taxonomy outcomes | | | |
| CSM | Implementation case | | | |
| Marketing | One-pager | | | |
| Sales | Battle card | | | |
| C-Level | Roadmap entry | | | |
| End User | Knowledge article | | | |
| Advisory group | Prototype review | | | |

Status values: `draft` | `reviewed` | `published` | `rollback_sent`.

## Metrics

- **Hypothesis check:** [restate the hypothesis from Identity and compare against the actual]
- Success metric: [what we measure]
- Baseline: [current value]
- Target: [desired value]
- Measurement method: [survey / analytics / manual]
- AI quality metrics (if applicable): [acceptance/edit rate, cost per outcome, escalation rate, eval pass rate, drift]

| Checkpoint | Due | Checked? | Adoption status | Measured value |
|------------|-----|----------|-----------------|----------------|
| 1 (default Day-14) | | | not_checked | |
| 2 (default Day-30) | | | not_checked | |
| 3 (default Day-60) | | | not_checked | |
| Retention impact (adopters vs non-adopters) | | | | |

Adoption status: `not_checked` | `adopted` | `low_adoption` | `blocked`.
If windows differ from the defaults, record why (usage cycle).

**Verdict (after checkpoint 3):** keep | iterate | retire. Reason: [compare against the outcome target]

- **Advisory validated:** yes | no | not_applicable
- **Advisory feedback:** [summary, if applicable]

## Delivery changelog

| Version | Date | What changed | Affected stories |
|---------|------|--------------|------------------|
| v1 | [date] | Initial release | All |
