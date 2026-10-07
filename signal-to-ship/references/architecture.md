# Signal to Ship Architecture

## Construction model

Signal to Ship is not a traditional software project. It's an AI-first workflow system where:
- **Claude** is the constructor (builds skills, connectors, templates)
- **MCP** is the integration layer (connects to existing tools)
- **Markdown** is the data layer (version-controlled, portable)
- **GitHub** is the collaboration layer (PRs for review, CI for validation)

## Component map (v0.2.0)

```
┌──────────────────────────────────────────────────────────┐
│                    Signal to Ship Orchestrator                        │
│         SKILL.md                   │
│         + 4 references (loaded on demand)                  │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │ signal-       │  │ priority-     │  │ audience-     │  │
│  │ collection.md │  │ calculator.md │  │ views.md      │  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  │
│          │                  │                   │          │
│  ┌───────┴──────────────────┴───────────────────┴───────┐ │
│  │           specialist-contracts.md                     │ │
│  │     15 slot definitions across 7 phases               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Gate 0 ──> Gate 1 ──> Gate 2 ──> ... ──> Gate 7          │
│  (type)    (signals)  (priority)         (measurement)    │
│                                                            │
│  State: signal-to-ship-state-{feature}.md (resume protocol)          │
│                                                            │
├──────────────────────────────────────────────────────────┤
│                    MCP Layer                                │
│  taxonomy-system │ Canny │ Jira │ Notion │ JTBD Mgr │ GitHub │
├──────────────────────────────────────────────────────────┤
│                  Knowledge Layer                           │
│  Markdown files │ Git history │ Templates │ Feature cards  │
└──────────────────────────────────────────────────────────┘
```

### Orchestrator references

The orchestrator loads references on demand, not all at once:

| Reference | Purpose | Loaded when |
|-----------|---------|-------------|
| `signal-collection.md` | Query plan for Canny, Jira, taxonomy, competitive research | Phase 1 (Signals) |
| `priority-calculator.md` | 5 scoring frameworks (BRICE+, RICE, MoSCoW, WSJF, ICE) | Phase 2 (Prioritization) |
| `audience-views.md` | 10 audience definitions, applicability matrix, publication destinations | Phase 6 (Delivery) |
| `specialist-contracts.md` | 15 slot contracts with inputs, outputs, required MCP, fallbacks | Any specialist dispatch |

## Paths and Gate 0

The orchestrator follows 5 paths determined by initiative type (Gate 0). The PM selects the initiative type in plain language; this gates every subsequent phase.

| Path | Initiative type | Phases included |
|------|----------------|-----------------|
| 1 | New feature (visual) | Signals, Prioritization, Specification, Prototyping, Refinement, Delivery, Measurement |
| 2 | New feature (backend) | Signals, Prioritization, Specification, Refinement, Delivery, Measurement |
| 3 | Bug fix | Signals (lightweight), Refinement, Delivery |
| 4 | Migration / parity | Signals (with Legacy Analysis), Specification, Refinement, Delivery, Measurement |
| 5 | Contractual urgent | Signals, Specification, Delivery |

Parity scan is a lightweight mode that checks a batch of features against V1 or a reference implementation without running the full cycle. Used before sprint planning.

## Depth modes

Process is right-sized to the work. After the initiative type, the PM confirms a depth:
**light** (bug fixes, small changes), **standard** (default) or **full** (any risk >= 4,
contractual or cross-team work, any feature with a model). Depth decides which steps and which
Gate 1/3 requirements apply, and it can only be upgraded automatically.

## State persistence

After every gate, the orchestrator writes `00-signal-to-ship-state.md` in the case folder using the template in `templates/signal-to-ship-state.md`. The file starts with a YAML frontmatter block (a small YAML subset: two-space nesting, scalars, inline lists) that is the machine-checked source of truth: identity, depth, gate statuses with reasons, problem/hypothesis/risks, scope, spec decisions, eval-plan status, delivery and checkpoint dates. The body holds collected data, gaps, proposals, delivery tracking, the checkpoint log and a decision log of what the orchestrator did on the PM's approval.

`node "${CLAUDE_SKILL_DIR}/scripts/validate-state.mjs" <state-file>` enforces: gates only pass in path order, skipped gates carry a reason, any risk >= 4 means full depth, each gate has the fields its depth requires, AI features have the eval plan approved before Gate 3 and executed before Gate 6, and Day-14/30/60 checkpoint windows are justified when changed. It also prints any checkpoint that is due.

### Hooks (guard rails, not blockers)

Two hooks run in Claude Code (configured in `.claude/settings.json`, scripts in `.claude/hooks/`): `gate-check` warns when a delivery document is written before Gate 5 has passed according to the validated state file, and `state-reminder` runs on stop and reminds the orchestrator to save state only when the working state file is out of date relative to the conversation's last gate. They add context; they never block. The command-safety guard in `.claude/hooks/guard/` is separate and does block risky shell commands.

### Scheduled checkpoints

The orchestrator is pull-based: it only notices a due checkpoint when the PM returns. To make measurement proactive, schedule a recurring agent (for example with the `/schedule` skill) that runs weekly, opens each case folder, runs `validate-state.mjs --today <date>`, and posts any `DUE` lines to the PM. Optionally add a second weekly routine that re-runs signal collection for features in Gates 1-3. Both routines only **read** and **report**; they never write to shared systems.

**Resume protocol:** When starting a new session, the orchestrator checks for an existing state file. If found, it states what was completed and asks the PM whether to resume or restart. Passed gates are skipped; the last gate summary is re-confirmed before advancing. Two things come first: an `ASK` line (the planned delivery date passed and `delivery.deployed_on` is empty, so ask whether and when it shipped, then run the post-deploy step) and any `DUE` checkpoint. Checkpoints are anchored on `delivery.deployed_on`, falling back to the planned `delivery.delivery_date` until the deploy is confirmed.

## Anthropic patterns applied

| Pattern | How we use it |
|---------|--------------|
| AGENTS.md as load-bearing | Routes all work, defines gates and contracts |
| Verification first | Every phase has a check (Judge, taxonomy sync, TestId coverage) |
| Credential-free defaults | All local work runs without AWS keys or API tokens |
| Fan-out-and-synthesize | Orchestrator coordinates specialist skills |
| Contextual RAG | Knowledge chunks enhanced with product context before retrieval |
| Session memory | Auto-compaction + intentional artifact persistence in memory files |
| Investigate before asking | Orchestrator researches code, tools, data before posing questions to PM |

## Acme patterns reused

| Pattern | Source | How we reuse it |
|---------|--------|----------------|
| Fan-out orchestrator | story-to-test-workflow | Signal to Ship orchestrator follows same dispatch pattern |
| CLAUDE.md → AGENTS.md | AcmeBackend | Delegation, never duplication |
| Branch naming | iris | Meaningful branch names for context |
| Ports-and-adapters | atelier | Credential-free local development |
| Knowledge bundles | Acme JTBD Manager | Markdown + YAML frontmatter for portable knowledge |
| MCP for structure | taxonomy-system | Real-time product structure queries |

## Slot contracts for portability (15 slots)

Every specialist the orchestrator dispatches is a slot with a defined contract: input, output, required MCP tools, quality gate, portability notes, and fallback. See `references/specialist-contracts.md` for the full definitions.

| Slot | Phase | Default (Acme) |
|------|-------|-------------------|
| signal-collector | Signals | Built-in |
| competitive-researcher | Signals | Built-in (WebSearch) |
| legacy-analyzer | Signals | Built-in (repo access) |
| priority-scorer | Prioritization | Built-in (BRICE+) |
| spec-writer | Specification | mini-spec-writer (prd-writer for cross-team scope) |
| competitive-teardown | Specification | competitive-teardown skill (fallback: WebSearch) |
| prototype-builder | Prototyping | /prototype |
| refinement-orchestrator | Refinement | story-to-test-workflow |
| refinement-judge | Refinement | refinement-judge |
| ticket-writer | Delivery | jira-story-publisher |
| taxonomy-sync | Delivery | sync-refinement-package-taxonomy |
| template-filler | Delivery | Built-in |
| release-notes-writer | Delivery | release-notes-writer skill (fallback: templates) |
| metric-designer | Measurement | Built-in |
| eval-designer | Specification (AI features only) | Built-in |

To adapt for another organization: replace the "Default" column with your tools. The contract column in specialist-contracts.md defines what the slot requires. Any skill that fulfills the contract can fill the slot.

## Data flow

1. **Signals** arrive from 5 channels → collected by orchestrator using signal-collection.md queries
2. **Prioritization** scores signals using priority-calculator.md framework
3. **Specs** created for prioritized items → linked to existing refinement packages or created fresh
4. **Refinement** produces stories + QA → stored in AcmeDocumentation (or domain repo)
5. **Delivery** pushes to Jira + Taxonomy + Design Hub → templates selected by initiative type
6. **Measurement** configured (Survey + Pendo) → 3 metric categories, TestIds, CES triggers
7. **Feedback** collected → routed back to Signals
8. **State** persisted after every gate → `signal-to-ship-state-{feature}.md` enables resume

## Future: RAG implementation

When knowledge base grows enough:
- Use contextual RAG (Anthropic pattern): prepend document context to each chunk
- Embed with product taxonomy tags for filtered retrieval
- Store in local vector DB (e.g., ChromaDB) or use Claude's native context
- Priority: signal history, decision rationale, past mistakes (known issues)

## Pluggable Tool Slots

Signal to Ship does not hardcode any specific tool. Each integration is a "slot" with:
- **Type:** what role it fills (issue tracker, feedback tool, taxonomy, etc.)
- **Adapter:** how it connects (MCP, API, webhook, manual)
- **Default:** the Acme-preconfigured tool
- **Alternatives:** what another company could use instead

See `integration-map.md` for the complete slot registry (tool-level slots) and `specialist-contracts.md` for the specialist-level slots (15 contracts covering all 7 phases).

## Prototyping Phase

Between Specification and Refinement, Signal to Ship includes an optional Prototyping phase:
- The orchestrator suggests it when the feature has a visual component
- Automatically skipped for bugs, backend changes, tech debt
- Uses `/prototype` skill (Acme: builds clickable screens with real design system on ephemeral URLs)
- **Post-approval flow:** When a prototype is approved:
  1. DS Gap Report: identifies components used that don't exist in the design system
  2. Component spec draft: inferred props, observed variants, usage context
  3. Issue/ticket in the issue tracker for Engineering to prioritize creation
- Note: DS Gap Report is Acme-specific (requires code-based prototype). Companies using Figma would handle this manually or skip it.

## Web App Roadmap

| Version | Interface | Notes |
|---------|-----------|-------|
| v0.1.0 | Docs + diagrams only | Complete |
| v0.2.0 | CLI (Claude Code) | Complete. Orchestrator functional, tested on Quick Checkout. |
| v0.3.0 | Web app MVP | Like taxonomy.acme.example |
| v1.0.0 | Full web app | First production cycle |

The web app will follow the same patterns as existing Acme tools (taxonomy.acme.example, atelier.acme.example): Next.js, design system integration, MCP for AI backbone.

## BRICE+ Data Sources

| Variable | Auto-collectible | Source | Manual input needed |
|----------|-----------------|--------|-------------------|
| Reach | Yes | Canny: User count + Company count | — |
| Signals depth | Yes | Canny: Votes, Insights, Themes, Board | — |
| Bug severity | Yes | Jira: count + severity + linked support cases | — |
| Impact | Partial | Auto: votes + insights | Business impact (PM) |
| ChurnRisk | Partial | Auto: MRR of requesting companies | Real churn risk (CSM/Sales) |
| NewARR | No | — | Blocked deals (Sales) |
| Expansion | No | — | Enabled upsells (CSM) |
| NPS | No (future) | — | Survey Tool (when connected) |
| Confidence | No | — | PM judgment |
| Effort | No | — | Engineering estimate |

The orchestrator pre-fills auto-collectible data and guides manual collection with role-specific questions.
