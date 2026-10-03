# Roadmap View Reference

Instructions for the orchestrator to generate and maintain a cross-feature roadmap
from existing scorecard data. This is a read mode, not a phase.

## Trigger

`/signal-to-ship roadmap` or `/signal-to-ship roadmap <case-name>`

When the PM wants to see the big picture: what features are in what state, what
blocks what, what's at risk, and what order to build.

## Data source

Read all feature scorecards in `cases/<case-name>/feature-cards/*.md`. Extract from
each scorecard:

```yaml
feature:
  name: ""                    # From ## Identity table
  initiative_type: ""         # migration | new_feature | enhancement | bug_fix
  deadline: ""                # From critical path overview or scorecard
  sprint_ready: true/false    # From Refinement status table
  pip_cycle_status: ""        # From Signal to Ship cycle table (if exists)

  dependencies: []            # From ## Dependencies section
  blockers: []                # From parity scan gaps, delivery gaps, or open questions

  scores:
    brice: null               # From BRICE+ score if calculated
    canny_votes: 0            # From signal sources
    canny_insights: 0
    jira_bugs_direct: 0

  delivery:
    backend: ""               # Not started | Partial | Complete
    frontend: ""
    embed_surface: ""
    jira_stories: ""
    qa_execution: ""

  risk_level: ""              # Derived: low | medium | high | critical
```

## Risk derivation

Calculate risk level per feature based on:

| Condition | Risk |
|-----------|------|
| Sprint-ready, no blockers, delivery started | Low |
| Sprint-ready, no blockers, delivery not started | Medium |
| Sprint-ready, has blockers (ENV, dependencies) | High |
| NOT sprint-ready (QA blocked, security findings, missing reviews) | Critical |
| Deadline < 30 days AND delivery not started | High (bump up one level) |

## Output: Roadmap view

### 1. Status summary

```
## Roadmap: {Case Name}
**Deadline:** {date}
**Features:** {total} ({ready} ready, {blocked} blocked, {not_started} not started)
**Overall risk:** {highest risk across all features}
```

### 2. Feature status table (sorted by risk, then dependencies)

```
| # | Feature | Type | Sprint-ready | Delivery | Blockers | Risk |
|---|---------|------|-------------|----------|----------|------|
```

Sort order:
1. Critical risk first (these need attention now)
2. Then by dependency order (features that unblock others first)
3. Then by deadline proximity

### 3. Dependency graph

Show which features depend on which:

```
## Dependencies

Contacts Sync
  └── Quick Checkout (Contact pre-fill)
  └── Quick Renewal (Contact pre-fill)
  └── Checkout Wizard (customer lookup)
  └── Renewal Online (visitor registration)

Checkout Wizard backend
  └── Quick Checkout (reuses same domain)
  └── POS Checkout (shared Order model)

Renewal Buy backend
  └── Quick Renewal (reuses same domain)
  └── POS Renewals (shared Subscription model)
  └── Gift Renewal POS (extends POS Renewals Release 4)

Embeddability contract
  └── All embed-integrated features (complete, no longer blocking)
```

### 4. Blocker inventory

List all blockers across all features, deduplicated:

```
## Active blockers

| Blocker | Affects | Owner | Status |
|---------|---------|-------|--------|
| FR-2201 security (2 Critical) | Renewal Online | Engineering | Open |
| ENV-QC-001 (payment-provider sandbox) | Quick Checkout QA | QA + Payments | Open |
| ENV-QC-002 (CRM org integration) | Quick Checkout QA | QA + Engineering | Open |
| Contacts Domain Migrator | Contacts Sync | Engineering | Not started |
| Outbound sync (V2→CRM) | Contacts Sync | Engineering | Not started |
```

### 5. Recommended build order

Based on dependencies and blockers, propose a build order:

```
## Recommended build order

### Wave 1: Foundation (unblocks everything else)
- Contacts Sync: inbound is ready, outbound + migrator needed
- Checkout Wizard backend: shared domain for Quick Checkout and POS

### Wave 2: CRM entry points (embed integrations)
- Quick Checkout + Quick Renewal (shared Quick Entry, refactor embed wiring)
- Checkout Wizard embed (own entry point per FR-2100)
- Renewal Buy Individual (extends Quick Renewal pattern)

### Wave 3: POS features
- POS Checkout (app shell exists, add checkout slice)
- POS Renewals (add renewal slice)
- POS Contacts (add contacts slice)
- Gift Renewal POS (Release 4, after POS Renewals base)

### Wave 4: Extensions
- Renewal Buy Family + Corporate (extend Individual pattern)
- Renewal Online (blocked by FR-2201, resolve first)

### Parallel track
- Contacts Sync outbound (can develop while Waves 1-2 proceed)
```

### 6. BRICE+ ranking (if scores exist)

If any features have BRICE+ scores calculated, show a ranked comparison:

```
## Priority ranking (BRICE+)

| Rank | Feature | Score | Key driver |
|------|---------|-------|------------|
```

If no scores exist, note: "No BRICE+ scores calculated. Features are ordered by
dependency and blocker analysis."

### 7. Timeline risk

If a deadline exists, flag features at risk:

```
## Timeline risk for {deadline}

**Days remaining:** {N}

| Feature | Status | Can ship by deadline? | Why |
|---------|--------|----------------------|-----|
```

Categories:
- **Green:** sprint-ready, no blockers, delivery can start now
- **Yellow:** sprint-ready but has dependency or ENV blocker
- **Red:** NOT sprint-ready, has Critical blockers
- **Gray:** explicitly post-deadline (Phase 2/3)

## Updating the roadmap

The orchestrator regenerates the roadmap view by re-reading all scorecards.
It does not maintain a separate roadmap file (single source of truth = scorecards).

However, if the PM requests it, the orchestrator can write a snapshot to
`cases/<case-name>/roadmap-snapshot-<date>.md` for sharing with stakeholders.

## Adapting for other organizations

The roadmap view reads whatever scorecards exist. It does not assume Acme-specific
structure beyond what's in the scorecard template. To adapt:

1. Use the `templates/feature-scorecard.md` template for your features
2. Add a `cases/<your-project>/` directory with scorecards
3. Run `/signal-to-ship roadmap <your-project>`
4. Customize risk derivation rules if your risk model differs
