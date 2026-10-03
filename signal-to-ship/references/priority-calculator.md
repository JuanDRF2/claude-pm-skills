# Priority Calculator Reference

Instructions for the orchestrator to calculate a priority score in Phase 2
(Prioritization). Supports multiple frameworks. BRICE+ is the default.

## When to use

- **Path 1/2 (New feature):** always execute
- **Path 3 (Bug fix):** skip (urgency determines priority)
- **Path 4 (Migration):** skip (decision already made)
- **Path 5 (Contractual):** skip (deadline determines priority)

## Step 1: Select framework

Ask the PM once per organization (or confirm the default):
"Which prioritization framework do you use?"

- a) **BRICE+** (built-in default; the Acme example config sets RICE): revenue-weighted with signal evidence
- b) **RICE:** Reach, Impact, Confidence, Effort
- c) **MoSCoW:** Must, Should, Could, Won't (categorical, no formula)
- d) **WSJF:** Weighted Shortest Job First (Cost of Delay / Job Size)
- e) **ICE:** Impact, Confidence, Ease
- f) **Custom:** PM defines variables and formula

Store the selection in the Signal to Ship state file. Do not ask again in the same cycle.

## BRICE+ (default)

### Formula

```
BRICE+ = (B * w_b + R * w_r + I * w_i + C * w_c + E * w_e) / Effort
         * (Contractual ? 1.5 : 1.0)
```

### Variables

| Variable | Full name | Scale | Source | How to collect |
|----------|-----------|-------|--------|----------------|
| **B** | Business impact | 1-10 | Manual | See Step 2b |
| **R** | Reach | 1-10 | Auto + Manual | See Step 2a |
| **I** | Intelligence | 1-10 | Auto | See Step 2a |
| **C** | Confidence | 1-5 | Manual (PM) | See Step 2b |
| **E** | Evidence | 1-5 | Auto | See Step 2a |
| **Effort** | Engineering effort | 1-10 | Manual (Eng) | See Step 2b |
| **Contractual** | Contractual obligation | 0 or 1 | Manual (PM) | See Step 2b |

### Weights (configurable per organization)

| Weight | Default | Description |
|--------|---------|-------------|
| w_b | 2.0 | Business impact weight |
| w_r | 1.0 | Reach weight |
| w_i | 1.0 | Intelligence weight |
| w_c | 1.0 | Confidence weight |
| w_e | 0.5 | Evidence weight |

### Step 2a: Auto-fill from Signals data

After Phase 1 (Signals) completes, these variables can be pre-calculated:

**Reach (R):**

```
raw_reach = canny.total_users + canny.total_companies
```

Normalize to 1-10 scale:
- 0 users: R = 1
- 1-5 users: R = 2
- 6-15 users: R = 4
- 16-30 users: R = 6
- 31-50 users: R = 8
- 51+ users: R = 10

Present to PM: "Based on Canny, [N] users and [N] companies have expressed interest.
I calculated Reach as [R]. Does this seem right, or do you want to adjust?"

**Intelligence (I):**

```
raw_intelligence = canny.total_votes + (canny.total_insights * 2)
```

Insights are weighted 2x because they represent deeper customer conversations.

Normalize to 1-10 scale:
- 0: I = 1
- 1-5: I = 2
- 6-15: I = 4
- 16-30: I = 6
- 31-50: I = 8
- 51+: I = 10

Present to PM with the same pattern.

**Evidence (E):**

Count distinct signal channels that produced data:
- Canny feedback (votes > 0)
- Jira bugs (direct_bugs > 0)
- Linked support cases (support_cases_linked > 0)
- Competitive (competitors have it)
- Sales/CSM input (PM confirms deals or accounts)

```
E = count of channels with signal (1-5)
```

Present: "I found signals in [N] channels: [list]. Evidence score: [E]."

### Step 2b: Manual collection (one question at a time)

**Business impact (B):** Ask the PM:
"On a scale of 1 to 10, how much would this impact revenue?"
- 1-3: Nice to have, no direct revenue impact
- 4-6: Improves retention or enables upsell for some accounts
- 7-8: Blocks deals or puts significant MRR at risk
- 9-10: Critical for major accounts or new market entry

Then, if Sales/CSM are available:
"Are there deals blocked by this? Estimated ARR impact?"
"Which accounts are at risk without this? MRR at risk?"

Combine PM assessment with Sales/CSM data to finalize B.

**Confidence (C):** Ask the PM:
"On a scale of 1 to 5, how confident are you that this will be used as expected?"
- 1: Very uncertain, might not be used
- 2: Some uncertainty, limited validation
- 3: Moderate confidence, some user feedback
- 4: High confidence, validated with users
- 5: Certainty, proven demand or contractual

**Effort:** Ask Engineering (or PM if Eng unavailable):
"What is the rough effort estimate?"
- Options: XS (1), S (2), M (4), L (6), XL (8), XXL (10)
- Or story points if the team uses them (normalize to 1-10)

**Contractual:** Ask the PM:
"Is this promised to a client or required by contract?"
- Yes: Contractual = 1 (applies 1.5x multiplier)
- No: Contractual = 0

### Step 3: Calculate and present

```
score = (B * 2.0 + R * 1.0 + I * 1.0 + C * 1.0 + E * 0.5) / Effort
        * (Contractual ? 1.5 : 1.0)
```

Present:

```
BRICE+ Score: [result]

  Business impact (B):  [value] × 2.0 = [weighted]
  Reach (R):            [value] × 1.0 = [weighted]
  Intelligence (I):     [value] × 1.0 = [weighted]
  Confidence (C):       [value] × 1.0 = [weighted]
  Evidence (E):         [value] × 0.5 = [weighted]
  ─────────────────────────────────────
  Subtotal:             [sum]
  Effort:               / [effort]
  Contractual:          × [1.0 or 1.5]
  ─────────────────────────────────────
  Final score:          [result]
```

Ask: "Does this score reflect the priority you would give this feature? If not, which
variable would you adjust?"

### Step 4: Compare against backlog

If other features have been scored, show a ranked list:

| Rank | Feature | Score | Key driver |
|------|---------|-------|------------|
| 1 | Feature A | 8.5 | High B, contractual |
| 2 | Feature B | 6.2 | High R, low effort |
| 3 | This feature | 5.8 | Moderate across all |

Ask: "Does this ranking match your intuition? If not, we should review the weights."

## RICE (alternative)

### Formula

```
RICE = (Reach * Impact * Confidence) / Effort
```

| Variable | Scale | Source |
|----------|-------|--------|
| Reach | Number of users affected per quarter | Auto (Canny users) + PM estimate |
| Impact | 0.25 (minimal) to 3 (massive) | PM assessment |
| Confidence | 0.5 (low) to 1.0 (high) | PM assessment |
| Effort | Person-months | Engineering estimate |

### Collection

Same one-at-a-time pattern. Auto-fill Reach from Canny, ask PM for Impact and
Confidence, ask Engineering for Effort.

## MoSCoW (alternative)

### No formula. Categorical assignment.

Ask the PM for each feature: "For this release, is this feature:"
- **Must have:** cannot ship without it
- **Should have:** important but not critical
- **Could have:** nice to have, include if time allows
- **Won't have:** explicitly excluded from this release

No score calculation. Output is a categorized backlog.

## WSJF (alternative)

### Formula

```
WSJF = Cost of Delay / Job Size
```

Where Cost of Delay = User/Business Value + Time Criticality + Risk Reduction

| Variable | Scale | Source |
|----------|-------|--------|
| User/Business Value | 1-10 | PM assessment |
| Time Criticality | 1-10 | PM (deadline pressure, market window) |
| Risk Reduction | 1-10 | PM (compliance, security, tech debt) |
| Job Size | 1-10 | Engineering estimate |

## ICE (alternative)

### Formula

```
ICE = Impact * Confidence * Ease
```

| Variable | Scale | Source |
|----------|-------|--------|
| Impact | 1-10 | PM assessment |
| Confidence | 1-10 | PM assessment |
| Ease | 1-10 | Engineering (inverse of effort) |

## Calibration warnings (show before the PM approves a score)

A score is a conversation starter, not a verdict. Surface these before Gate 2:

- **Vote bias.** Feedback-tool votes over-represent the loudest and most engaged customers.
  If R and I are driven only by votes, say so, and ask whether silent segments (support
  cases, call insights, churned accounts) tell a different story.
- **Evidence diversity.** A score backed by one channel is weaker than one backed by three.
  The E variable already counts channels; also report which channel is missing.
- **Effort under AI-assisted construction.** Historical effort sizes (XS-XXL) were calibrated
  on human-only delivery. When construction is AI-assisted, build effort shrinks but
  validation, review, integration and rollout effort do not. Ask the PM to estimate the
  *whole path to production*, not the coding time, or the score will systematically favor
  features that are quick to generate and slow to ship.
- **Learning value.** Two features with the same score are not equal if one tests a risky
  assumption cheaply. Prefer the one that teaches more, and say why.
- **Weights are policy, not truth.** The weights live in the slot config. If a weight was
  changed, record who changed it and why in the state file.
- **Never rank on score alone.** Show the score next to the highest risk from Phase 1.

## Storing results

After the PM approves the score, update:
1. Feature scorecard: add score in the Signal to Ship cycle table
2. State file: set Gate 2 status to passed with score
3. If backlog comparison done: note the ranking position
