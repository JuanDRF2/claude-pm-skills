# Specialist Contracts

Each Signal to Ship phase can dispatch to a specialist skill. This document defines the contract (inputs,
outputs, required tools, fallback) for each specialist slot. Any skill that fulfills the contract can fill the slot.

The orchestrator does not hardcode skills. It checks that the slot is filled, confirms the specialist is visible
in the session (`references/environment-check.md`), and dispatches. If the specialist is unavailable, it uses the
fallback in the contract and says so in one line: which fallback, and what it changes. It never lowers the depth
to get around a missing specialist.

## Contents

- Fallback summary
- Signal phase specialists
- Prioritization phase specialists
- Specification phase specialists
- Prototyping phase specialists
- Refinement phase specialists
- Delivery phase specialists
- Measurement phase specialists
- For other organizations

## Fallback summary

| Slot | When unavailable | Fallback |
|------|------------------|----------|
| signal-collector | The feedback tool or tracker is not visible | The PM supplies the data in one batch; list which sources were not checked |
| competitive-researcher | No web search | The PM supplies it (one question) |
| legacy-analyzer | No repo access | The PM describes V1; flag "not code-verified" |
| priority-scorer | A library skill is not installed | Built-in; a library skill may fill it, the PM still chooses the method |
| spec-writer | No spec skill installed | Guided interview (`references/spec-interview.md`) or the PM's existing spec; Light = inline scope in/out |
| competitive-teardown | The skill is not installed | WebSearch findings, less structured |
| prototype-builder | No prototype tool | `mockup-builder` if installed; else a text storyboard the PM builds in any tool |
| refinement-orchestrator | The refinement skill is not installed | The orchestrator writes a compact refinement package |
| refinement-judge | The judge skill is not installed or is disabled | The orchestrator's self-check plus PM review |
| ticket-writer | The tracker is not visible | Paste-ready ticket text; the destination check happens before approve / hold |
| taxonomy-sync | No taxonomy system | Document the mapping in notes; sync later (optional, off by default) |
| template-filler | Built-in | Built-in templates |
| release-notes-writer | The skill is not installed | The orchestrator fills the templates |
| metric-designer | A library skill is not installed | The PM defines metrics; Light uses the short form |
| eval-designer | A library skill is not installed | Built-in; Gate 3 cannot close for AI features without an approved plan (a gate rule, not a stop) |

STOP only when a contract lists no fallback. Every contract below lists one. If a slot is added without a fallback,
the orchestrator must STOP and inform the PM for that slot.

## Signal phase specialists

### signal-collector

**Slot:** Built-in (orchestrator handles directly)
**Reference:** `references/signal-collection.md`

| Field | Value |
|-------|-------|
| Input | Feature name, domain, search terms |
| Output | Feedback aggregates (votes, users, companies, MRR, insights), tracker bugs (direct/indirect, linked support cases), taxonomy mapping (JTBD, feature, journey, coverage) |
| Required MCP | The feedback tool, the issue tracker and, if configured, the taxonomy system, as named in the slot config |
| Fallback | Ask the PM to provide the data manually, in one batch. Document which sources were not checked. |

### competitive-researcher

**Slot:** Built-in (orchestrator handles directly)
**Reference:** `references/signal-collection.md` Section 5

| Field | Value |
|-------|-------|
| Input | Feature domain, competitor list |
| Output | Competitor capability table (has/doesn't have), parity status (ahead/parity/behind) |
| Required tools | WebSearch |
| Fallback | Ask the PM for competitive context manually (one question). |

### legacy-analyzer

**Slot:** Built-in (orchestrator handles directly)
**Reference:** `references/signal-collection.md` Step 3 (Legacy Analysis)

| Field | Value |
|-------|-------|
| Input | Feature name, repo paths, reference implementation name |
| Output | V1 behavior summary (controllers, data model, user flows), delta (adds/changes/drops), reference implementation comparison, embed surface check (new/detail/edit) |
| Required tools | File system access (Read, Grep, Glob), repo access |
| Fallback | Ask the PM to describe V1 behavior. Flag that legacy was not code-verified. |

## Prioritization phase specialists

### priority-scorer

**Slot:** Built-in (orchestrator handles directly); the `prioritization-scorer` library skill can fill it
**Reference:** `references/priority-calculator.md`

| Field | Value |
|-------|-------|
| Input | Signal data (auto-filled) + manual inputs from the PM, with effort as a range and a confidence level |
| Output | Score or category in a range, the confidence, the pass 1 and pass 2 records |
| Config | The suggested method (the PM is always asked which of the six methods to use) |
| Required MCP | None (uses Phase 1 data) |
| Fallback | Built-in. A library skill may fill the slot, but the PM still chooses the method and decides. |

## Specification phase specialists

### spec-writer

**Slot:** `mini-spec-writer` (default), `prd-writer` (large or cross-team scope), `product-spec-interview` (library skill; questioning-first, for when the problem, the success measure or the scope is still fuzzy). An organization-specific spec skill can fill the slot if it meets this contract.
**Status:** If none is installed, the orchestrator runs the guided interview in `references/spec-interview.md`.

| Field | Value |
|-------|-------|
| Input | Signals summary, legacy analysis, competitive context, taxonomy mapping |
| Output | Product specification document (scope, flows, rules, exclusions, risks, **agent surface**: capabilities, consumers, autonomy levels), following the template the PM chose |
| Phase 3 addendum | A library spec skill does not cover everything Gate 3 needs. The orchestrator collects the rest itself in one message (`references/phases-early.md`, Phase 3): alternatives considered, implementation class, onboarding, agent surface, adoption threshold, riskiest assumption. |
| Required MCP | Taxonomy system, if configured (for alignment) |
| Quality gate | Spec must be reviewable by the PM. Taxonomy-aligned when a taxonomy exists. No unresolved contradictions. |
| Light | Inline scope in/out, no dispatch. The scope is written in the conversation and approved. |
| Fallback | The orchestrator runs the guided interview in `references/spec-interview.md` (rounds with checkpoints, outcome coverage matrix, acceptance-criteria axes), using the Signals data as input; or the PM provides an existing spec for review. |

### competitive-teardown

**Slot:** competitive-teardown skill
**Status:** If it is not installed, the orchestrator uses WebSearch directly.

| Field | Value |
|-------|-------|
| Input | Feature domain, competitor list, feature name |
| Output | Structured teardown per competitor: capability description, UX approach, strengths, weaknesses, parity assessment |
| Required tools | WebSearch, optionally browser automation for screenshots |
| Quality gate | Each competitor must have verified data, not assumptions. |
| Fallback | The orchestrator runs WebSearch and presents findings. Less structured but functional. |

## Prototyping phase specialists

### prototype-builder

**Slot:** `mockup-builder` (library skill; static HTML or JSX) when installed. An organization-specific prototype skill can fill the slot if it meets this contract.
**Status:** Optional extension: an organization whose prototype tool can check components against its design system may turn on a design-system gap report with `prototype_builder.config.ds_gap_report: true` in its slot config. It is off by default.

| Field | Value |
|-------|-------|
| Input | Spec or plain-language description of what to build |
| Output | A clickable prototype the stakeholders can open, or a storyboard they can review |
| Required tools | Whatever the chosen tool needs; none for the storyboard |
| Quality gate | The prototype or storyboard matches the spec flows. Stakeholders can interact with it or follow it. |
| Portability | A prototype tool is organization-specific. The storyboard works anywhere. |
| Fallback | `mockup-builder` if installed; otherwise a **text storyboard**: numbered screens, each with what the user sees and does, plus a validation checklist, that the PM builds in any tool (a design tool, a prototyping tool, slides). Skipping the prototype needs a recorded reason and is not allowed when the usability risk is 4 or more. |

## Refinement phase specialists

### refinement-orchestrator

**Slot:** story-to-test-workflow
**Status:** Generic skill available from the skills library.

| Field | Value |
|-------|-------|
| Input | Spec + gaps from the Specification phase |
| Output | Complete refinement package: stories (US-*), acceptance criteria (AC-*), scenarios (SC-*), checks (CHK-*), functional test cases (FTC-*), traceability, risks, handoffs |
| Required MCP | Per its own SKILL.md |
| Quality gate | Must pass the refinement judge, or the orchestrator's self-check, before the handoff. |
| Owns | Its own internal gates. The orchestrator waits for completion. |
| Portability | Organization conventions (ID prefixes, folder structure, CI rules) are configurable. The core method (stories, criteria, scenarios, judge) is portable. |
| Light / Path 3 | Inline refinement (`references/phases-late.md`, Phase 5). Path 5 (contractual) has no refinement phase. |
| Fallback | The orchestrator writes a **compact refinement package** from `templates/refinement-package.md`: stories (US-n) with effort per story, 3 to 6 Given / When / Then criteria each, regression checks, a test-case table, a traceability table (story > criterion > check), a coverage matrix against the spec's outcomes, risks and open questions; at Full it adds the criteria axes table of `references/spec-interview.md`. It tells the PM in one line that the specialist is not installed and that the result is lighter. Record `refinement_mode.package: fallback`. The depth does not change. |

### refinement-judge

**Slot:** refinement-judge
**Status:** Generic skill available from the skills library.

| Field | Value |
|-------|-------|
| Input | Package snapshot (all files of the package) |
| Output | Verdict (PASS / PASS WITH OBSERVATIONS / FAIL), findings list, snapshot hash |
| Required tools | File system access for reading the package |
| Quality gate | FAIL blocks the handoff. PASS WITH OBSERVATIONS allows it with documented risks. |
| Portability | Core logic (completeness, traceability, consistency checks) is portable. Organization-specific checks are configurable. |
| Fallback | The orchestrator's **self-check**: completeness, traceability, consistency, testability, and every spec outcome has a story or a recorded non-goal. Verdict PASS / PASS WITH OBSERVATIONS / FAIL, labeled "checked by the orchestrator, not by an independent judge". When the Agent tool is available, run it in a fresh subagent that receives only the spec and the package, and note "self_check (fresh agent)" or "self_check (same context)" in the decision log. Then the PM reviews and approves it, recorded in the decision log ("judge unavailable: self-check + PM review", or "judge disabled by slot config"). Record `refinement_mode.judge: self_check`, or `pm_review` when the slot is disabled. FAIL still blocks the handoff. |

## Delivery phase specialists

### ticket-writer

**Slot:** `jira-story-publisher` (stories), `jira-bug-writer` (bugs), or the adapter of your tracker
**Status:** Generic skill available from the skills library.

| Field | Value |
|-------|-------|
| Input | Approved stories from the refinement package |
| Output | Issue tracker tickets with full criteria, scenarios and technical context. Created once, at Gate 6; the Gate 5 handoff does not create them, and an existing ticket is linked, not duplicated. |
| Required MCP | The tracker named in the slot config |
| Quality gate | Each ticket must match its source story exactly. |
| Portability | Replace Jira with Linear, GitHub Issues, Shortcut, etc. The story payload is the canonical format. |
| Fallback | A paste-ready ticket payload per story. The PM creates the tickets. The destination check (`references/guided-flow.md`) happens BEFORE the PM is asked to approve or hold, so the PM never approves something that cannot be sent. |

### taxonomy-sync

**Slot:** sync-refinement-package-taxonomy
**Status:** Generic skill available from the skills library; optional, and off unless a taxonomy system is configured.

| Field | Value |
|-------|-------|
| Input | Refinement package + existing taxonomy mapping |
| Output | Updated taxonomy entries (journeys, outcomes, criteria, scenarios, coverage status) |
| Required MCP | The taxonomy system (update tools) |
| Quality gate | Mapping must be verified against the approved package. No orphan references. |
| Portability | Requires a product taxonomy tool. |
| Fallback | Document the mapping in the case notes. Sync manually later. Optional and off by default. |

### template-filler

**Slot:** Built-in (orchestrator handles directly)
**Reference:** `references/audience-views.md`
**Status:** Built-in, uses delivery templates from `templates/` or the PM's own template

| Field | Value |
|-------|-------|
| Input | Feature data from all phases + the selected delivery template |
| Output | Filled delivery document with audience-specific sections |
| Required tools | None (uses collected data) |
| Quality gate | The PM reviews and approves before publication. |
| Fallback | Built-in. The default templates in `templates/` are used when the PM has none. |

### release-notes-writer

**Slot:** release-notes-writer
**Status:** If it is not installed, the orchestrator fills the templates directly.

| Field | Value |
|-------|-------|
| Input | Feature data, initiative type, applicable audiences |
| Output | Complete release notes following the chosen template |
| Required tools | None (uses collected data + templates) |
| Quality gate | All applicable audience sections filled. PM approved. |
| Portability | Templates are configurable per organization. |
| Fallback | The orchestrator fills the template manually using the `references/audience-views.md` protocol. |

## Measurement phase specialists

### metric-designer

**Slot:** Built-in (orchestrator handles directly); the `success-metrics-designer` library skill can fill it
**Reference:** `references/phases-late.md` (Phase 7)

| Field | Value |
|-------|-------|
| Input | Feature domain, initiative type, industry research |
| Output | Metrics (5 categories, plus AI Quality when applicable), TestIds, survey trigger, baseline plan, checkpoint schedule |
| Required tools | WebSearch (for industry research), the survey tool (for configuration) |
| Quality gate | Metrics defined in 5 categories. TestIds follow the convention with event structure. Survey type appropriate. Hypothesis verifiable by the metrics. |
| Fallback | The PM defines metrics manually. Light uses the short form (an outcome metric or adoption sentence plus default checkpoints). |

### eval-designer

**Slot:** Built-in (orchestrator handles directly); the `ai-feature-eval-planner` library skill can fill it
**Reference:** `references/ai-features.md`

| Field | Value |
|-------|-------|
| Input | Spec, agent surface, AI risk score, example inputs from signals |
| Output | Eval plan: golden dataset outline, quality criteria, release threshold, regression cadence, failure-mode list |
| Required tools | None (PM and engineering supply the data; the orchestrator structures and challenges the plan) |
| Quality gate | Every quality criterion has a measurable threshold. At least one adversarial/failure-mode case per autonomy level above "propose". |
| Fallback | Built-in. If the PM cannot define a threshold, Gate 3 cannot close for Full-depth AI features. This is a gate rule, not a stop. |

## For other organizations

To adapt the specialist roster:

1. Review each slot and its contract.
2. Identify your equivalent tool or skill for each slot.
3. If no equivalent exists, use the fallback in the contract.
4. Configure the slot in `references/integration-map.md` and in your `<org>.slot.yaml` (see `references/slot-engine.md` for where it lives).

The contract columns (Input, Output, Quality gate, Fallback) are portable. The "Required MCP" column names the
tool types an organization binds in its own config.
