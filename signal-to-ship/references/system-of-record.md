# System-of-Record Migration Plan

Version: 1.0.0 | Updated: 2026-10-02

How Signal to Ship's data moves from local files and scattered tools toward **one product
system of record** (in the reference setup, the product taxonomy server), without ever making
the cycle depend on it. This is a plan for the *integration*, not for building that server.

> **The cycle works today with zero extensions.** It uses local Markdown, the configured
> tracker and the docs platform as workarounds. Each stage below only improves it.

## The model: value entity vs work item

The single most important idea. Two different things are easy to conflate:

| | **Journey** (value entity) | **Initiative** (work item) |
|---|---|---|
| What it is | A capability that delivers value to a user | One iteration of work on it |
| Audience | External: it is what you communicate | Internal: it is what you schedule |
| Owns | Hypothesis, signals, adoption, success metric, agent surface, implementation class, release artifacts, communication status | Priority score, scope in/out, alternatives, appetite, squad, lane, type, stage |
| Example | "Quick Checkout from Contact" | "INI-0042: migrate checkout entry to V2" |
| Cardinality | One | Many initiatives can touch one journey |

Consequences:
- **Release artifacts attach to the journey**, because you communicate about the capability,
  not the ticket. Three initiatives on one journey produce one CSM briefing, not three.
- **Communication status is read from the journey**: "what was communicated about this
  capability, to whom, through which channel?"
- **Priority belongs to the work item.** A score ranks work; it does not describe the product.
- **The executive roadmap shows jobs-to-be-done with journeys beneath them.** Initiatives are
  the execution detail per team.

(Entity names are the reference setup's. Use whatever your system calls them; keep the split.)

## Where each datum lives

| Data | Today (workaround) | Target |
|------|--------------------|--------|
| Bugs / known issues | The tracker (e.g. Jira), via the `issue_tracker` slot | Known-issue records in the system of record |
| Hypothesis, signal summary, advisory feedback, adoption threshold, agent surface, implementation class, onboarding notes | Local scorecard + state file | Fields on the journey |
| Success metric, baseline, measured value, adoption status and check date | Scorecard + manual check | Fields on the journey |
| Priority score, scope in/out, alternatives, appetite, squad, lane, type | State file | Fields on the initiative |
| Delivery templates | Local `templates/` | Versioned template library |
| Release artifacts and their publication record | Docs platform + chat | Artifact records linked to the journey |

## Stages

Each stage is additive and independent of the others unless a dependency is stated.

### Stage A: Known issues (retires the tracker slot)
**The system ships:** extra fields on known issues (reporter, support-case ID, source, assignee,
resolved-at, resolved-in-version, priority) and list/get tools.
**Signal to Ship changes:** switch the `issue_tracker` adapter to `taxonomy_known_issues` and
disable the tracker adapter; Step 3 of `references/signal-collection.md` already supports both.

### Stage B: Product-context fields on the journey
**The system ships:** ~15 columns on the journey; existing tools accept the new fields.
**Signal to Ship changes:**
- After Gate 3, write hypothesis, signal summary, advisory result, adoption threshold, agent
  surface, implementation class and onboarding notes to the journey.
- At Phase 7, write success metric, baseline, adoption check date, adoption status and measured value.
- No new tools are needed in the slot config.

### Stage C: Work-item fields on the initiative
**Prerequisite:** the base initiative entity exists.
**The system ships:** type (required enum) plus score, appetite, squad, lane, scope in/out,
alternatives, and a `rolled_back` stage.
**Signal to Ship changes:** at Gate 0, create the initiative (type from the initiative-type
question); at Gate 2 write the score; at Gate 3 write scope decisions.

### Stage D: Squad capacity and template library
**The system ships:** per-squad capacity and WIP limits, and a versioned template library.
**Signal to Ship changes:** read templates from the library with a local fallback; warn at
Phase 2 when the target squad is over its WIP limit.

### Stage E: Release artifacts linked to the journey
**Depends on:** Stage B.
**The system ships:** artifact records (FK to the journey), a publish record, and a
communication-status view on the journey.
**Signal to Ship changes (Phase 6):**
1. Read the template; fill placeholders from journey fields and initiative scope.
2. Create the artifact on the journey.
3. The PM reviews and approves.
4. **Signal to Ship publishes through its own connections** (chat, docs). The system of record
   never calls external APIs.
5. Record the publication (**record-only**: channel, target, time).
6. Read the journey's communication status to verify Gate 6: which audiences have a published
   artifact and which are missing.

## What does not change

The seven phases, the eight gates, the five paths, the depth modes, the refinement workflow, the
specialist contracts and explicit PM approval. The orchestrator never auto-publishes,
auto-approves or decides unilaterally. Canny-style feedback tools stay the voting source
(referenced from the journey's signal summary); the docs platform and chat stay publication destinations.

## Dependencies

```
Stage A (known issues)      independent
Stage B (journey fields)    independent
Stage C (initiative fields) needs the base initiative entity
Stage D (squad + templates) independent
Stage E (release artifacts) needs Stage B
```

## Safety notes for write stages

Stages B, C and E make the orchestrator write to a shared system. Apply the autonomy rules
(`references/ai-features.md`, section 8): propose the exact write, show the diff against the
current values, and execute only after PM approval. Never batch writes across journeys without
listing every target first.
