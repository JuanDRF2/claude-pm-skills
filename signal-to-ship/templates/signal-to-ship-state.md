---
schema: 2
feature: "{Feature Name}"
initiative_type: new_feature
path: 1
depth: standard
current_phase: 0
started: 2026-01-01
last_updated: 2026-01-01
ai_feature: false
status: active
stop_reason:
stopped_on:
gates:
  initiative_type: pending
  signals: pending
  prioritization: pending
  specification: pending
  prototyping: pending
  refinement: pending
  delivery: pending
  measurement: pending
gate_reasons:
  initiative_type:
problem_statement:
  summary:
  who:
  current_workaround:
  cost:
  cost_of_inaction:
outcome:
  metric:
  baseline:
  target:
request:
  origin: internal
  requester:
  ask:
  underlying_need:
  minimal_slice:
  tradeoff:
  approver:
  decided_on:
hypothesis:
risks:
  value:
  usability:
  feasibility:
  viability:
  ai:                # leave empty unless ai_feature: true (do not write n/a)
  highest:
  mitigation_plan:
scope:
  in: []
  out: []
  alternatives_considered: []
spec:
  implementation_class:
  adoption_threshold:
  agent_surface: none
  riskiest_assumption: not_required
eval_plan:
  status: not_required
delivery:
  rollout: not_set
  delivery_date:
beta:
  minimum_usage:
  feedback_sessions:
  exit_criteria:
readiness:
  roast: not_run
  roast_note:
learning:
  hypothesis_formed:
  first_evidence:
measurement:
  checkpoint_1:
  checkpoint_2:
  checkpoint_3:
  window_reason:
  checked: []
  adoption_d30:
  verdict:
  verdict_reason:
---

# Signal to Ship State: {Feature Name}

> The YAML block above is the machine-checked source of truth. Validate it with
> `node "${CLAUDE_SKILL_DIR}/scripts/validate-state.mjs" <this file>`. Only a simple YAML subset is allowed:
> two-space nesting, `key: value` scalars and inline lists (`[a, b]`). Everything below the
> frontmatter is free-form narrative for the PM.

## Field reference

| Field | Allowed values / meaning |
|-------|--------------------------|
| `initiative_type` | `migration`, `new_feature`, `enhancement`, `bug_fix`, `contractual`. Use `unconfirmed` (with `current_phase: 0` and `gates.initiative_type: pending`) to save before Gate 0 closes. |
| `path` | 1-5 (must match the type: new_feature/enhancement → 1 or 2, migration → 4, bug_fix → 3, contractual → 5) |
| `depth` | `light`, `standard`, `full`. Any risk >= 4 requires `full`. |
| `gates.*` | `pending`, `passed`, `skipped`, `partial`, `provisional`. `skipped` and `provisional` need a reason in `gate_reasons`. |
| `current_phase` | 0-7. 0 = starting, initiative type not yet confirmed; set to 1 or higher as phases begin. Never behind the last gate passed. |
| `risks.*` | 1-5 or empty. `ai` only when `ai_feature: true`. |
| `spec.implementation_class` | `zero_touch`, `auto_activation`, `config_needed`, `data_migration`, `manual_required` |
| `spec.agent_surface` | `none` or `defined` (details in the Agent surface section below) |
| `spec.riskiest_assumption` | `not_required`, `pending` (a test is owed), `tested`, `accepted_untested`. Gate 3 cannot close with `pending` or `not_required` at full depth, or when value or usability is >= 4. |
| `eval_plan.status` | `not_required`, `draft`, `approved`, `executed` |
| `delivery.rollout` | `not_set`, `all_at_once`, `beta`, `phased`, `internal_only` |
| `measurement.checkpoint_*` | ISO dates, calculated from `delivery.delivery_date` |
| `schema` | `2` (current). `1` still validates with a warning; the fields below are enforced only on `2`. |
| `status` | `active` or `stopped`. Stopping is a legitimate outcome: set `stop_reason` and `stopped_on`; remaining gates can stay `pending`. |
| `problem_statement.cost_of_inaction` | One line: "if we do not build this, what happens?" Required to pass Gate 1 at every depth. If the honest answer is "nothing significant", recommend stopping. |
| `outcome.*` | The result this work should move: `metric`, `baseline` (today) and `target`. Required to pass Gate 1 at standard and full. |
| `request.origin` | `internal`, `stakeholder` or `customer`. When `stakeholder`, Gate 1 also needs `underlying_need`, `minimal_slice`, `tradeoff`, `approver` and `decided_on` (see `templates/stakeholder-request.md`). |
| `measurement.adoption_d30` | Optional number 0-100: share of the target group that adopted at the Day-30 checkpoint. Feeds `npm run portfolio`. |
| `beta.*` | When `delivery.rollout: beta`, Gate 6 needs `minimum_usage` (what usage makes the beta meaningful) and `feedback_sessions` (a whole number >= 1); `exit_criteria` says what moves it to general availability. |
| `readiness.roast` | `not_run`, `done` or `skipped` (see `templates/feature-roast.md`). Full depth cannot close Gate 6 with `not_run`; `skipped` needs `roast_note`. |
| `learning.*` | `hypothesis_formed` (date, set at Gate 1) and `first_evidence` (date the first real evidence arrived: a test result, a prototype session, beta usage, an adoption figure). The portfolio shows the gap in days. |
| `measurement.verdict` | `keep`, `iterate` or `retire`, with `verdict_reason`. Required on schema 2 once checkpoint 3 appears in `measurement.checked` (Gate 7 itself closes when measurement is configured, before any result exists). |

## Data collected

```yaml
signals:
  feedback_tool:
    ideas_found: 0
    total_votes: 0
    total_users: 0
    total_companies: 0
    total_mrr: 0
    total_insights: 0
  bug_tracker:
    source: ""        # taxonomy_known_issues | jira
    direct_bugs: 0
    indirect_bugs: 0
    support_cases_linked: 0
  customer_calls:
    mentions: 0
    recordings: []
  taxonomy:
    jtbd: ""          # Name (code)
    feature: ""       # Name (code)
    journey: ""       # Name (code)
    legacy_coverage: "" # Not Covered | Partial | Covered | To Review
  competitive:
    competitors_checked: []
    parity_status: "" # ahead | parity | behind | not_checked
  legacy:
    exists: false
    repos: []
    reference_impl: ""
    delta_documented: false
```

## Scope decisions (narrative)

- **Out of scope, with reasons:**
- **Alternatives considered (chosen / rejected, and why):**
- **Onboarding by audience:** existing legacy users / existing non-users / new clients / internal teams
- **Automation plan** (if not `zero_touch`): what would make it zero-touch, target date

## Agent surface (if `spec.agent_surface: defined`)

```yaml
agent_surface:
  capabilities: []        # e.g. ["create_checkout", "list_payment_methods"]
  consumers: ""           # UI | agent/MCP | integration API
  autonomy_levels: ""     # per capability: read | propose | execute_with_approval
  learning_signals: ""    # what data improves future behavior
```

## Riskiest assumption (if required)

```yaml
riskiest_assumption:
  assumption: ""
  test_plan: ""
  tested: false
  result: ""
  accepted_untested_by_pm_on: ""
```

## Gaps registered

```yaml
gaps: []
# Each gap:
# - id: GAP-XX-NN
#   description: ""
#   type: parity | spec | implementation | architectural
#   affects: [] # feature IDs
#   status: open | proposed | resolved
#   proposal: "" # PROP-XX-NN if exists
```

## Proposals generated

```yaml
proposals: []
# Each proposal:
# - id: PROP-XX-NN
#   description: ""
#   type: parity | context | next_iteration | architectural
#   target_file: "" # which spec file to modify
#   status: proposed | approved | executed
```

## Delivery tracking

| Audience | Artifact | Status (`draft`/`reviewed`/`published`/`rollback_sent`) | Published to | Published at |
|----------|----------|--------|--------------|--------------|
| | | | | |

## Metrics (if Phase 7 reached)

```yaml
metrics:
  product_engagement: []
  customer_success: []
  business_impact: []
  go_to_market: []
  retention_impact: []
  ai_quality: []          # only for features with a model
  test_ids: []            # each: { test_id, screen, event_type, notes }
  survey_trigger: ""
  baseline_plan: ""
  hypothesis_check: ""    # restate the hypothesis and compare against the actual
```

## Checkpoint log

| Checkpoint | Due | Checked? | Adoption status (`not_checked`/`adopted`/`low_adoption`/`blocked`) | Measured value | Notes |
|------------|-----|----------|------------------|----------------|-------|
| 1 | | no | not_checked | | |
| 2 | | no | not_checked | | |
| 3 | | no | not_checked | | |

## Decision log (agent autonomy)

Record every decision the orchestrator took or proposed that the PM approved, with the evidence it was based on.

| Date | Decision | Evidence | Autonomy level | Approved by |
|------|----------|----------|----------------|-------------|
| | | | | |

## Resume instructions

When resuming this cycle:
1. Read this state file and run `node "${CLAUDE_SKILL_DIR}/scripts/validate-state.mjs"` on it.
2. Skip all gates with status `passed` or `skipped`.
3. Resume at `current_phase`.
4. Surface any checkpoint whose due date has passed.
5. Re-confirm the last gate summary with the PM before advancing.
6. Check whether any `gaps` or `proposals` were resolved since the last session.
