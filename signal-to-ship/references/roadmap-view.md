# Roadmap View Reference

Instructions for the orchestrator to generate and maintain a cross-feature roadmap
from existing scorecard data. This is a read mode, not a phase.

## Contents

- Trigger and data source
- Risk derivation
- Output (status summary, table, dependency graph, blockers, build order, ranking, timeline risk)
- Updating the roadmap and adapting
- The roadmap artifact

## Trigger

`/signal-to-ship roadmap` or `/signal-to-ship roadmap <case-name>`

When the PM wants to see the big picture: what features are in what state, what
blocks what, what's at risk, and what order to build.

## Data source

Read the scorecards of the case: `cases/*/scorecard.md` for single initiatives and
`cases/<group>/feature-cards/*.md` for a group of related initiatives (`templates/case-structure.md`). Extract from
each scorecard:

```yaml
feature:
  name: ""                    # From ## Identity table
  initiative_type: ""         # migration | new_feature | enhancement | bug_fix
  deadline: ""                # From critical path overview or scorecard
  sprint_ready: true/false    # From Refinement status table
  cycle_status: ""            # From Signal to Ship cycle table (if exists)

  dependencies: []            # From ## Dependencies section
  blockers: []                # From parity scan gaps, delivery gaps, or open questions

  scores:
    method: ""                # rice | ice | wsjf | moscow | value_effort | custom | gut_check
    score: null               # The pass 1 (or pass 2) score or category, from the Prioritization table
    feedback_votes: 0         # From signal sources
    feedback_insights: 0
    tracker_bugs_direct: 0

  delivery:
    backend: ""               # Not started | Partial | Complete
    frontend: ""
    embed_surface: ""
    tracker_stories: ""
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

Shared sync service
  └── Feature A (contact pre-fill)
  └── Feature B (contact pre-fill)
  └── Feature C (customer lookup)

Order backend
  └── Feature A (reuses the same domain)
  └── Feature D (shared Order model)

Embedding contract
  └── All embedded features (complete, no longer blocking)
```

### 4. Blocker inventory

List all blockers across all features, deduplicated:

```
## Active blockers

| Blocker | Affects | Owner | Status |
|---------|---------|-------|--------|
| Security findings (2 critical) | Feature C | Engineering | Open |
| Payment-provider sandbox | Feature A QA | QA + Payments | Open |
| Test organization integration | Feature A QA | QA + Engineering | Open |
| Data migrator | Shared sync service | Engineering | Not started |
| Outbound sync | Shared sync service | Engineering | Not started |
```

### 5. Recommended build order

Based on dependencies and blockers, propose a build order:

```
## Recommended build order

### Wave 1: Foundation (unblocks everything else)
- Shared sync service: inbound is ready, outbound + migrator needed
- Order backend: shared domain for Feature A and Feature D

### Wave 2: Entry points
- Feature A + Feature B (shared entry, refactor the embedding)

### Wave 3: Extensions
- Feature D (extends the Feature A pattern)
- Feature C (blocked by the security findings, resolve first)

### Parallel track
- Shared sync service outbound (can develop while Waves 1-2 proceed)
```

### 6. Priority ranking (if scores exist)

Rank only items scored with the **same method**. If the scored items used different methods, group them by method
and do not compare scores across groups (a RICE number and an ICE number are not comparable). MoSCoW items are
grouped by category, not ranked.

```
## Priority ranking (Method: {method})

| Rank | Feature | Score (range) | Confidence | Key driver |
|------|---------|---------------|------------|------------|
```

If no scores exist, note: "No scores recorded. Features are ordered by dependency and blocker analysis."

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

The roadmap view reads whatever scorecards exist. It does not assume any organization-specific
structure beyond what's in the scorecard template. To adapt:

1. Use the `templates/feature-scorecard.md` template for your features
2. Keep each initiative in `cases/<feature>/` (or a group in `cases/<your-project>/`) with its scorecard
3. Run `/signal-to-ship roadmap <your-project>`
4. Customize risk derivation rules if your risk model differs

## The roadmap artifact (a shared page, not this view)

This view is a read mode for the PM. The page that leadership and the go-to-market leads see is the roadmap
artifact in `templates/roadmap-review.md` (Part 2), produced at Gate 2 after a roadmap review. It carries the
ranked initiatives, their method and scores, the decision (build now, backlog, archive) and the reason, worded as outcomes
rather than feature promises and without delivery dates. Generate it from the same scorecards this view reads;
share it only after the PM approves.
