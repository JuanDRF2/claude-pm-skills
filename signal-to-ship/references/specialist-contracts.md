# Specialist Contracts

Each Signal to Ship phase can dispatch to a specialist skill. This document defines the contract
(inputs, outputs, required tools) for each specialist slot. Any skill that fulfills
the contract can fill the slot.

The orchestrator does not hardcode skills. It checks if the slot is filled, confirms
the specialist is available, and dispatches. If unavailable, it stops and informs the PM.

## Signal phase specialists

### signal-collector

**Slot:** Built-in (orchestrator handles directly)
**Reference:** `references/signal-collection.md`

| Field | Value |
|-------|-------|
| Input | Feature name, domain, search terms |
| Output | Canny aggregates (votes, users, companies, MRR, insights), Jira bugs (direct/indirect, linked support cases), taxonomy mapping (JTBD, feature, journey, coverage) |
| Required MCP | Canny (list_boards, list_ideas), Jira/Atlassian Rovo (searchJiraIssuesUsingJql), taxonomy-system (list_jtbds, get_jtbd, get_journey, list_features) |
| Fallback if unavailable | Ask PM to provide data manually. Document which sources were not checked. |

### competitive-researcher

**Slot:** Built-in (orchestrator handles directly)
**Reference:** `references/signal-collection.md` Section 5

| Field | Value |
|-------|-------|
| Input | Feature domain, competitor list |
| Output | Competitor capability table (has/doesn't have), parity status (ahead/parity/behind) |
| Required tools | WebSearch |
| Fallback if unavailable | Ask PM for competitive context manually. |

### legacy-analyzer

**Slot:** Built-in (orchestrator handles directly)
**Reference:** `references/signal-collection.md` Step 3 (Legacy Analysis)

| Field | Value |
|-------|-------|
| Input | Feature name, repo paths, reference implementation name |
| Output | V1 behavior summary (controllers, data model, user flows), delta (adds/changes/drops), reference implementation comparison, embed surface check (new/detail/edit) |
| Required tools | File system access (Read, Grep, Glob), repo access |
| Fallback if unavailable | Ask PM to describe V1 behavior. Flag that legacy was not code-verified. |

## Prioritization phase specialists

### priority-scorer

**Slot:** Built-in (orchestrator handles directly)
**Reference:** `references/priority-calculator.md`

| Field | Value |
|-------|-------|
| Input | Signal data (auto-filled) + manual scores (PM, Sales, CSM, Eng) |
| Output | Weighted score, breakdown, backlog ranking |
| Config | Active framework (BRICE+, RICE, MoSCoW, WSJF, ICE, custom), weights |
| Required MCP | None (uses Phase 1 data) |
| Fallback if unavailable | N/A (built-in) |

## Specification phase specialists

### spec-writer

**Slot:** `mini-spec-writer` (default), `prd-writer` (large or cross-team scope). An organization-specific spec skill can fill the slot if it meets this contract.
**Status:** Generic skill available (`mini-spec-writer`, or `prd-writer` for cross-team scope). If neither is installed, the orchestrator guides the PM directly.

| Field | Value |
|-------|-------|
| Input | Signals summary, legacy analysis, competitive context, taxonomy mapping |
| Output | Product specification document (scope, flows, rules, exclusions, risks, **agent surface**: capabilities, consumers, autonomy levels) |
| Phase 3 addendum | A library spec skill does not cover everything Gate 3 needs. The orchestrator collects the rest itself (`references/phases-early.md`, Phase 3): alternatives considered, implementation class, onboarding, adoption threshold, riskiest assumption. |
| Required MCP | taxonomy-system (for alignment) |
| Quality gate | Spec must be reviewable by PM. Taxonomy-aligned. No unresolved contradictions. |
| Fallback if unavailable | Orchestrator guides PM through spec creation using the Signals data as input. Or PM provides an existing spec for review. |

### competitive-teardown

**Slot:** competitive-teardown skill
**Status:** Generic skill available (`competitive-teardown`). If it is not installed, the orchestrator uses WebSearch directly.

| Field | Value |
|-------|-------|
| Input | Feature domain, competitor list, feature name |
| Output | Structured teardown per competitor: capability description, UX approach, strengths, weaknesses, parity assessment |
| Required tools | WebSearch, optionally browser automation for screenshots |
| Quality gate | Each competitor must have verified data, not assumptions. |
| Fallback if unavailable | Orchestrator runs WebSearch and presents findings. Less structured but functional. |

## Prototyping phase specialists

### prototype-builder

**Slot:** /prototype skill (AcmeFrontend repo-specific)
**Status:** Active, installed at AcmeFrontend/.claude/skills/prototype/SKILL.md

| Field | Value |
|-------|-------|
| Input | Spec or plain-language description of what to build |
| Output | Deployed clickable prototype at ephemeral URL |
| Required tools | AcmeFrontend repo access, Next.js app structure, @acme/design-system, AWS ephemeral environments |
| Quality gate | Prototype matches spec flows. Stakeholders can interact with it. |
| Portability | Tightly coupled to Acme stack. Another org needs: their frontend repo, a design system, preview deployment infra. |
| Fallback if unavailable | Use Figma prototypes, v0.dev, or static HTML mockups. |

## Refinement phase specialists

### refinement-orchestrator

**Slot:** story-to-test-workflow
**Status:** Active, installed at ~/.claude/skills/story-to-test-workflow/

| Field | Value |
|-------|-------|
| Input | Spec + gaps from Specification phase |
| Output | Complete refinement package: stories (US-*), acceptance criteria (AC-*), scenarios (SC-*), checks (CHK-*), functional test cases (FTC-*), traceability, risks, handoffs |
| Required MCP | Per its own SKILL.md (taxonomy-system for taxonomy alignment, GitHub for PRs) |
| Quality gate | Must pass refinement-judge before advancing. |
| Owns | Its own internal gates (Gates 1-5). Signal to Ship orchestrator waits for completion. |
| Portability | Acme-specific conventions (ID prefixes, folder structure, CI rules). Core methodology (stories, ACs, scenarios, judge) is portable. |
| Fallback if unavailable | Cannot be skipped for Path 1/2/4 unless the organization's slot config disables it, in which case the declared fallback applies. For Path 3 (bug) and Path 5 (contractual), a lightweight refinement is acceptable. |

### refinement-judge

**Slot:** refinement-judge
**Status:** Active, installed at ~/.claude/skills/refinement-judge/

| Field | Value |
|-------|-------|
| Input | Package snapshot (all files in artifacts/<project>/) |
| Output | Verdict (PASS / PASS WITH OBSERVATIONS / FAIL), findings list, snapshot hash |
| Required tools | File system access for reading the package |
| Quality gate | FAIL blocks advancement. PASS WITH OBSERVATIONS allows advancement with documented risks. |
| Portability | Core logic (completeness, traceability, consistency checks) is portable. Acme-specific checks (ID conventions, Notion sync) are configurable. |
| Fallback if unavailable | Mandatory before handoff **unless the organization's slot config disables the slot** (`refinement_judge.enabled: false`). Then the declared fallback applies (for example PM peer review), and the PM's approval is recorded in the decision log with the reason "judge disabled by slot config". |

## Delivery phase specialists

### ticket-writer

**Slot:** jira-story-publisher (Acme), jira-bug-writer (bugs)
**Status:** Active, installed at ~/.claude/skills/jira-story-publisher/

| Field | Value |
|-------|-------|
| Input | Approved stories from jira/*.md files in the refinement package |
| Output | Issue tracker tickets (Jira issues) with full AC, SC, technical context |
| Required MCP | Jira (Atlassian Rovo) for creating issues |
| Quality gate | Each ticket must match its source jira/*.md file exactly. |
| Portability | Replace Jira with Linear, GitHub Issues, Shortcut, etc. The jira/*.md format is the canonical payload. |
| Fallback if unavailable | jira/*.md files serve as the ticket payload. PM creates tickets manually. |

### taxonomy-sync

**Slot:** sync-refinement-package-taxonomy
**Status:** Active, installed at ~/.claude/skills/sync-refinement-package-taxonomy/

| Field | Value |
|-------|-------|
| Input | Refinement package + existing taxonomy mapping |
| Output | Updated taxonomy entries (journeys, outcomes, ACs, scenarios, coverage status) |
| Required MCP | taxonomy-system (update tools) |
| Quality gate | Mapping must be verified against the approved package. No orphan references. |
| Portability | Requires a product taxonomy tool. Replace taxonomy-system with your taxonomy system. |
| Fallback if unavailable | Document the mapping in integrations/taxonomy-mapping.md. Sync manually later. |

### template-filler

**Slot:** Built-in (orchestrator handles directly)
**Reference:** `references/audience-views.md`
**Status:** Built-in, uses delivery templates from `templates/`

| Field | Value |
|-------|-------|
| Input | Feature data from all Signal to Ship phases + selected delivery template |
| Output | Filled delivery document with audience-specific sections |
| Required tools | None (uses collected Signal to Ship data) |
| Quality gate | PM reviews and approves before publication. |
| Fallback if unavailable | N/A (built-in) |

### release-notes-writer

**Slot:** release-notes-writer
**Status:** Generic skill available (`release-notes-writer`, with `launch-comms` as the distribution layer). If it is not installed, the orchestrator fills the templates directly.

| Field | Value |
|-------|-------|
| Input | Feature data, initiative type, applicable audiences |
| Output | Complete release notes document following the org's template |
| Required tools | None (uses Signal to Ship data + templates) |
| Quality gate | All applicable audience sections filled. PM approved. |
| Portability | Templates are configurable per organization. |
| Fallback if unavailable | Orchestrator fills the template manually using audience-views.md protocol. |

## Measurement phase specialists

### metric-designer

**Slot:** Built-in (orchestrator handles directly)
**Reference:** `references/phases-late.md` (Phase 7)

| Field | Value |
|-------|-------|
| Input | Feature domain, initiative type, industry research |
| Output | Metrics (5 categories, plus AI Quality when applicable), TestIds, survey trigger, baseline plan, checkpoint schedule |
| Required tools | WebSearch (for industry research), Survey Tool (for configuration) |
| Quality gate | Metrics defined in 5 categories. TestIds follow convention with event structure. Survey type appropriate. Hypothesis verifiable by the metrics. |
| Fallback if unavailable | PM defines metrics manually. |

### eval-designer (features with a model)

**Slot:** Built-in (orchestrator handles directly)
**Reference:** `references/ai-features.md`

| Field | Value |
|-------|-------|
| Input | Spec, agent surface, AI risk score, example inputs from signals |
| Output | Eval plan: golden dataset outline, quality criteria, release threshold, regression cadence, failure-mode list |
| Required tools | None (PM and engineering supply the data; the orchestrator structures and challenges the plan) |
| Quality gate | Every quality criterion has a measurable threshold. At least one adversarial/failure-mode case per autonomy level above "propose". |
| Fallback if unavailable | N/A (built-in). If the PM cannot define a threshold, Gate 3 cannot close for Full-depth AI features. |

## For other organizations

To adapt the specialist roster:

1. Review each slot and its contract
2. Identify your equivalent tool or skill for each slot
3. If no equivalent exists, use the built-in fallback
4. Configure the slot in `references/integration-map.md` and in your `<org>.slot.yaml` (see `references/slot-engine.md` for where it lives)

The contract columns (Input, Output, Quality gate) are portable. The "Default (Acme)"
and "Required MCP" columns are organization-specific.
