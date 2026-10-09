# Signal to Ship Architecture

## Contents

- Construction model
- Component map
- Paths and Gate 0
- Depth modes
- State persistence (cases folder, hooks, scheduled checkpoints, resume)
- Patterns applied
- Slot contracts for portability
- Data flow
- Pluggable tool slots

## Construction model

Signal to Ship is not a traditional software project. It's an AI-first workflow system where:
- **Claude** is the constructor (builds skills, connectors, templates)
- **MCP** is the integration layer (connects to existing tools)
- **Markdown** is the data layer (version-controlled, portable)
- **GitHub** is the collaboration layer (PRs for review, CI for validation)

## Component map

```
┌──────────────────────────────────────────────────────────┐
│                 Signal to Ship Orchestrator                │
│                         SKILL.md                           │
│            + references (loaded on demand)                 │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │ environment-  │  │ priority-     │  │ audience-     │  │
│  │ check.md      │  │ calculator.md │  │ views.md      │  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  │
│          │                  │                   │          │
│  ┌───────┴──────────────────┴───────────────────┴───────┐ │
│  │           specialist-contracts.md                     │ │
│  │   15 slot definitions across 7 phases, each with      │ │
│  │   a declared fallback                                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Environment check -> Gate 0 -> Gate 1 -> ... -> Gate 7    │
│                                                            │
│  State: cases/<feature>/00-signal-to-ship-state.md         │
│                                                            │
├──────────────────────────────────────────────────────────┤
│                    MCP Layer                                │
│  whatever the session can see: feedback tool, tracker,     │
│  docs platform, source control, taxonomy, chat             │
├──────────────────────────────────────────────────────────┤
│                  Knowledge Layer                           │
│  Markdown files │ Git history │ Templates │ Feature cards  │
└──────────────────────────────────────────────────────────┘
```

### Orchestrator references

The orchestrator loads references on demand, not all at once. The full index, with when to read each one, is in
`SKILL.md`. The main ones:

| Reference | Purpose | Loaded when |
|-----------|---------|-------------|
| `environment-check.md` | What the session can see, what is missing, one question | First message of a session |
| `guided-flow.md` | Gate-opening format, wording rules, orientation, template registry | Opening any gate; before any document |
| `signal-collection.md` | Query plan for the feedback tool, tracker, taxonomy, competitive research | Phase 1 (Signals) |
| `priority-calculator.md` | Six methods, two passes, the PM always chooses | Gate 2 and the end of Phase 5 |
| `audience-views.md` | Audience definitions, applicability matrix, publication destinations | Phase 6 (Delivery) |
| `going-back.md` | Reopen a stop, repeat a gate, backlog, notify a requester | Resume, or when the PM wants to go back |
| `specialist-contracts.md` | 15 slot contracts with inputs, outputs, required MCP, fallbacks | Any specialist dispatch |

## Paths and Gate 0

The orchestrator follows 5 paths determined by initiative type. Gate 0 is one message that shows what was found, the
reading of the type, the route in one line, and the depth; the PM answers "ok" or says what is different. This gates
every subsequent phase.

| Path | Initiative type | Gates (Gate 0, the route message, is not counted) |
|------|----------------|-------|
| 1 | New feature or improvement (visual) | 1 to 7 (7 gates) |
| 2 | New feature or improvement (backend) | 1 to 3, 5 to 7 (6 gates) |
| 3 | Bug fix | 1, 5, 6 (3 gates) |
| 4 | Migration / parity | 1, 3, 5, 6, 7 (5 gates) |
| 5 | Contractual urgent | 1, 3, 6 (3 gates) |

Parity scan is a lightweight mode that checks a batch of features against V1 or a reference implementation without running the full cycle. Used before sprint planning.

## Depth modes

Process is right-sized to the work. At Gate 0 the PM confirms a depth:
**light** (bug fixes, small changes), **standard** (default) or **full** (any risk >= 4,
contractual or cross-team work, any feature with a model). Depth decides which steps and which
Gate 1/3 requirements apply, and it can only be upgraded automatically. A missing specialist never lowers it.
`SKILL.md` defines Light phase by phase in one table.

## State persistence

After every gate, the orchestrator writes `00-signal-to-ship-state.md` in the initiative's folder,
`cases/<feature>/`, using the template in `templates/signal-to-ship-state.md` (`templates/case-structure.md` has the
layout). If the working directory already holds that file, it is used and not nested. The file starts with a YAML
frontmatter block (a small YAML subset: two-space nesting, scalars, inline lists) that is the machine-checked source
of truth: identity, depth, gate statuses with reasons, environment, prioritization passes, problem/hypothesis/risks,
scope, spec decisions, eval-plan status, delivery and checkpoint dates. The body holds collected data, gaps,
proposals, delivery tracking, the checkpoint log and a decision log of what the orchestrator did on the PM's approval.

`node "${CLAUDE_SKILL_DIR}/scripts/validate-state.mjs" <state-file>` enforces: gates only pass in path order, skipped gates carry a reason, any risk >= 4 means full depth, each gate has the fields its depth requires, AI features have the eval plan approved before Gate 3 and executed before Gate 6, a passed Gate 2 records the method and the pass 1 decision, Gate 6 does not pass without pass 2, and Day-14/30/60 checkpoint windows are justified when changed. It also prints a stopped or backlog initiative and any checkpoint that is due.

### Hooks (guard rails, not blockers)

Two hooks run in Claude Code (configured in `.claude/settings.json`, scripts in `.claude/hooks/`): `gate-check` warns when a delivery document is written before Gate 5 has passed according to the validated state file, and `state-reminder` runs on stop and reminds the orchestrator to save state only when the working state file is out of date relative to the conversation's last gate. They add context; they never block. The command-safety guard in `.claude/hooks/guard/` is separate and does block risky shell commands.

### Scheduled checkpoints

The orchestrator is pull-based: it only notices a due checkpoint when the PM returns. To make measurement proactive, schedule a recurring agent (for example with the `/schedule` skill) that runs weekly, opens each case folder, runs `validate-state.mjs --today <date>`, and posts any `DUE` lines to the PM. Optionally add a second weekly routine that re-runs signal collection for features in Gates 1-3. Both routines only **read** and **report**; they never write to shared systems.

**Resume protocol:** When starting a new session, the orchestrator finds the saved progress and checks it. In order it surfaces: a stopped or backlog initiative (one question), an `ASK` line (the planned delivery date passed and `delivery.deployed_on` is empty, so ask whether and when it shipped, then run the post-deploy step), and any `DUE` checkpoint. Then it recaps in at most 3 lines and continues with the next open step. Checkpoints are anchored on `delivery.deployed_on`, falling back to the planned `delivery.delivery_date` until the deploy is confirmed.

## Patterns applied

| Pattern | How we use it |
|---------|--------------|
| AGENTS.md as load-bearing | Routes all work, defines gates and contracts |
| Verification first | Every phase has a check (judge or self-check, taxonomy sync, TestId coverage) |
| Credential-free defaults | All local work runs without API tokens |
| Fan-out-and-synthesize | Orchestrator coordinates specialist skills |
| Contextual RAG | Knowledge chunks enhanced with product context before retrieval |
| Session memory | Auto-compaction + intentional artifact persistence in memory files |
| Investigate before asking | Orchestrator researches code, tools, data before posing questions to the PM |
| Decide before investing | Prioritization in two passes: a rough score before specifying, a re-score with the real effort before delivery |

## Slot contracts for portability (15 slots)

Every specialist the orchestrator dispatches is a slot with a defined contract: input, output, required MCP tools, quality gate, portability notes, and fallback. See `references/specialist-contracts.md` for the full definitions.

| Slot | Phase | Example binding |
|------|-------|-----------------|
| signal-collector | Signals | Built-in |
| competitive-researcher | Signals | Built-in (WebSearch) |
| legacy-analyzer | Signals | Built-in (repo access) |
| priority-scorer | Prioritization | Built-in (6 methods, two passes) |
| spec-writer | Specification | mini-spec-writer (prd-writer for cross-team scope) |
| competitive-teardown | Specification | competitive-teardown skill (fallback: WebSearch) |
| prototype-builder | Prototyping | mockup-builder (fallback: text storyboard) |
| refinement-orchestrator | Refinement | story-to-test-workflow (fallback: compact refinement package) |
| refinement-judge | Refinement | refinement-judge (fallback: orchestrator self-check plus PM review) |
| ticket-writer | Delivery | jira-story-publisher (fallback: paste-ready tickets) |
| taxonomy-sync | Delivery | sync-refinement-package-taxonomy |
| template-filler | Delivery | Built-in |
| release-notes-writer | Delivery | release-notes-writer skill (fallback: templates) |
| metric-designer | Measurement | Built-in |
| eval-designer | Specification (AI features only) | Built-in |

To adapt for another organization: replace the "Example binding" column with your tools. The contract column in specialist-contracts.md defines what the slot requires. Any skill that fulfills the contract can fill the slot.

## Data flow

1. **Environment check** reads the session's tools and the organization config, and tells the PM what is connected and what is missing.
2. **Gate 0** confirms the type, the route and the depth in one message; the progress is saved in `cases/<feature>/`.
3. **Signals** arrive from up to 5 channels → collected by the orchestrator using signal-collection.md queries.
4. **Pass 1 of prioritization** (Paths 1 and 2): the PM chooses a method; a rough score with the effort as a range ends in build now / backlog / archive.
5. **Specs** created for prioritized items → linked to existing refinement packages or created fresh.
6. **Refinement** produces stories + QA coverage, from the specialist or the compact package, checked by the judge or the self-check.
7. **Pass 2 of prioritization** re-scores with the real effort from the refined stories; the PM confirms, changes or sends the item back to the backlog. Only then is the handoff to Dev and QA proposed.
8. **Delivery** pushes to the tracker, the docs platform and (if configured) the taxonomy → templates are chosen by the PM from the defaults by initiative type.
9. **Measurement** configured (survey + analytics) → metric categories, TestIds, CES triggers; Gate 7 may close provisional with an open action.
10. **Feedback** collected → routed back to Signals.
11. **State** persisted after every gate → `cases/<feature>/00-signal-to-ship-state.md` enables resume.

## Pluggable Tool Slots

Signal to Ship does not hardcode any specific tool. Each integration is a "slot" with:
- **Type:** what role it fills (issue tracker, feedback tool, taxonomy, etc.)
- **Adapter:** how it connects (MCP, API, webhook, manual)
- **Example:** a preconfigured tool in the sample config
- **Alternatives:** what another company could use instead

See `integration-map.md` for the complete slot registry (tool-level slots) and `specialist-contracts.md` for the specialist-level slots (15 contracts covering all 7 phases).

## Prototyping Phase

Between Specification and Refinement, Signal to Ship includes an optional Prototyping phase:
- The orchestrator suggests it when the feature has a visual component
- Automatically skipped for bugs, backend changes, tech debt
- Uses the prototype-builder slot: a prototype tool if one is visible, `mockup-builder` if installed, else a text storyboard the PM builds in any tool
- Skipping needs a recorded reason and is not allowed when the usability risk is 4 or more
