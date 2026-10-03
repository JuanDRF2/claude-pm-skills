# Slot Configuration Format (v0.6.0)

## What slots are

A slot is a typed integration point between the Signal to Ship orchestrator and an external tool
or skill. Every capability the orchestrator needs (collecting feedback, writing tickets,
scoring priorities) is represented as a slot rather than a hardcoded dependency.

Each slot has a contract (defined in `specialist-contracts.md`) that specifies required
inputs, expected outputs, and a quality gate. Any tool or skill that satisfies the
contract can fill the slot. When no tool is available, the orchestrator uses the slot's
declared fallback, which is typically manual data entry or a built-in approximation.

Slots exist so that Signal to Ship works for any product organization, not just Acme.
A company using Linear instead of Jira swaps one YAML block. A company without
a taxonomy tool leaves that slot empty and the orchestrator skips taxonomy alignment.

## The slot.yaml file

Each organization gets one `<org>.slot.yaml` file (where it lives: see "File location"). This file declares:

1. **Organization identity** and metadata.
2. **Active prioritization framework** and its weights.
3. **Slot bindings**: which tool fills each slot, which MCP tools to call, and any
   slot-specific configuration (boards, projects, competitor lists, repo paths).
4. **Delivery preferences**: templates, audiences, channels.

The orchestrator reads the active slot file at startup. Every phase checks the relevant
slots before dispatching. If a required slot has `enabled: false` or its MCP tools are
not connected, the orchestrator reports what is missing and uses the fallback.

## File location

The orchestrator looks for `<org>.slot.yaml` in this order (see `references/slot-engine.md`, Step 1):

```
<project>/.signal-to-ship/<org>.slot.yaml       # 1. the team's own config, with their repo
~/.claude/signal-to-ship/orgs/<org>.slot.yaml    # 2. the PM's personal folder, outside any repo
<this skill>/examples/acme.slot.yaml             # 3. a fictitious example, used only if nothing else exists
```

Keep an employer's real configuration in (1) inside that employer's repo or in (2). Never put it in a
public repository.

## Format specification

### Top-level keys

| Key | Required | Type | Description |
|-----|----------|------|-------------|
| `version` | Yes | String | Schema version. Currently `"0.6.0"`. |
| `organization` | Yes | Object | Name, industry, product line. |
| `framework` | Yes | Object | Active prioritization framework and its weights. |
| `slots` | Yes | Object | Keyed by slot ID. Each entry configures one integration. |
| `delivery` | No | Object | Templates, audiences, and publication channels. |
| `competitive` | No | Object | Competitor list and research preferences. |
| `process` | No | Object | Depth defaults, forced-full rules, checkpoint windows and the autonomy policy. |

### Organization block

```yaml
organization:
  name: "Acme SaaS"
  industry: "B2B SaaS"
  product: "Acme Platform"
```

### Framework block

```yaml
framework:
  active: brice_plus          # One of: brice_plus, rice, moscow, wsjf, ice, custom
  phase: 1                    # Which extension phase (BRICE+ specific)
  weights:                    # Only for frameworks that use numeric weights
    new_arr: 2.0
    expansion: 2.0
    churn_risk: 3.5
    nps: 1.0
    contractual_multiplier: 1.5
  channels:                   # Signal channel origin tracking
    - pain_points
    - competitive_parity
    - market_innovation
    - tech_debt_migration
    - contractual
  auto_review_threshold: 3    # Channels needed for automatic priority review
```

For non-numeric frameworks like MoSCoW, the `weights` block is replaced by `categories`:

```yaml
framework:
  active: moscow
  categories: [must, should, could, wont]
```

### Slot block

Each slot follows this structure:

```yaml
slots:
  <slot-id>:
    enabled: true              # Boolean. false = slot skipped, fallback used.
    adapter: "<tool-or-skill>" # What fills this slot.
    mcp_tools:                 # List of MCP tool prefixes or exact names.
      - "mcp__tool_name__action"
    config:                    # Slot-specific configuration (free-form object).
      key: value
    fallback: "description"    # What happens when adapter is unavailable.
    notes: "optional context"  # Human-readable notes.
```

### Slot IDs

The 15 specialist slot IDs correspond to the contracts in `specialist-contracts.md`:

| Slot ID | Phase | Contract |
|---------|-------|----------|
| `signal_collector` | Signal | Feedback aggregation from Canny/equivalent |
| `competitive_researcher` | Signal | Web-based competitor analysis |
| `legacy_analyzer` | Signal | V1 codebase analysis |
| `priority_scorer` | Prioritization | Framework-based scoring |
| `spec_writer` | Specification | Product specification drafting |
| `competitive_teardown` | Specification | Deep competitor feature analysis |
| `prototype_builder` | Prototyping | Clickable prototype creation |
| `refinement_orchestrator` | Refinement | Story/AC/SC/CHK/FTC workflow |
| `refinement_judge` | Refinement | Adversarial quality gate |
| `ticket_writer` | Delivery | Issue tracker ticket creation |
| `taxonomy_sync` | Delivery | Product taxonomy alignment |
| `template_filler` | Delivery | Audience-specific document generation |
| `release_notes_writer` | Delivery | Release notes from Signal to Ship data |
| `metric_designer` | Measurement | Metrics, TestIds, survey configuration |
| `eval_designer` | Specification | Eval plan for features with a model (built-in) |

Two **integration slots** are configured the same way but are not specialist contracts; they
select which tool the orchestrator queries during Signals:

| Slot ID | Purpose | Adapters |
|---------|---------|----------|
| `issue_tracker` | Bug lookup (Signals, Step 3) | `jira`, `taxonomy_known_issues`, `github_issues`, `linear` |
| `customer_calls` | Voice-of-customer from recorded calls (Step 5b), optional | any call-recording connector, or `none` |

### Delivery block

```yaml
delivery:
  templates:
    - name: "release-notes"
      path: "templates/release-notes.md"
    - name: "sprint-brief"
      path: "templates/sprint-brief.md"
  audiences:
    - engineering
    - sales
    - csm
    - leadership
  publication_channels:
    - type: notion
      enabled: true
    - type: slack
      channel: "#product-updates"
      enabled: true
    - type: email
      enabled: false
```

### Competitive block

```yaml
competitive:
  competitors:
    - name: "Competitor A"
      url: "https://competitor-a.com"
      category: direct
    - name: "Competitor B"
      url: "https://competitor-b.com"
      category: adjacent
  research_depth: standard     # standard | deep | surface
```

## How the orchestrator uses slot.yaml

1. **Startup.** The orchestrator reads the slot file and builds a registry of available
   slots with their adapters and MCP tool names.

2. **Phase entry.** Before dispatching a specialist, the orchestrator checks whether
   the slot is enabled and whether the required MCP tools are connected. It does this
   by comparing `mcp_tools` entries against the current MCP session.

3. **Dispatch.** If the slot is ready, the orchestrator invokes the adapter (skill or
   built-in logic) and passes `config` as context. If the slot is not ready, it uses
   `fallback` and documents the gap.

4. **Quality gate.** After the specialist returns, the orchestrator checks the output
   against the contract's quality gate. This is defined in `specialist-contracts.md`,
   not in the slot file. The slot file only controls *which tool* fills the slot.

## Relationship to specialist contracts

The slot file and the specialist contract serve different purposes:

- **Specialist contract** (`specialist-contracts.md`): defines *what* a slot must
  accept and produce. These are stable across organizations. A signal_collector must
  always output feedback aggregates regardless of whether the source is Canny or
  Productboard.

- **Slot file** (`<org>.slot.yaml`): defines *how* a specific organization fills each
  slot. Which MCP tools, which boards, which repo paths.

The contract is the interface. The slot file is the implementation binding.

## Examples

### Acme (full configuration)

See `examples/acme.slot.yaml` for the complete working example. Acme uses
Productboard for feedback signal collection and RICE for prioritization (corrected
2026-09-29 — this description previously named a different tool stack — Canny, Jira,
taxonomy-system, BRICE+ — that doesn't match what the shipped file actually configures).

### Hypothetical: Acme SaaS (Linear + Productboard + RICE)

```yaml
version: "0.6.0"

organization:
  name: "Acme SaaS"
  industry: "B2B SaaS"
  product: "Acme Platform"

framework:
  active: rice
  weights:
    reach: 1.0
    impact: 1.0
    confidence: 1.0
    effort: 1.0

slots:
  signal_collector:
    enabled: true
    adapter: productboard
    mcp_tools:
      - "mcp__productboard__list_features"
      - "mcp__productboard__get_insights"
    config:
      workspace: "acme-workspace"
    fallback: "PM provides feedback data manually."

  competitive_researcher:
    enabled: true
    adapter: built_in
    mcp_tools:
      - WebSearch
    fallback: "PM provides competitive context manually."

  legacy_analyzer:
    enabled: false
    adapter: none
    fallback: "No legacy system. Greenfield product."

  priority_scorer:
    enabled: true
    adapter: built_in
    fallback: "N/A (built-in)"

  spec_writer:
    enabled: false
    adapter: none
    fallback: "PM writes specs in Notion. Orchestrator reviews."

  competitive_teardown:
    enabled: false
    adapter: none
    fallback: "Competitive research handled in signal phase only."

  prototype_builder:
    enabled: true
    adapter: vercel_v0
    config:
      tool: "v0.dev"
    fallback: "Figma prototypes."

  refinement_orchestrator:
    enabled: true
    adapter: built_in
    fallback: "PM writes stories directly."

  refinement_judge:
    enabled: false
    adapter: none
    fallback: "PM peer review replaces judge."

  ticket_writer:
    enabled: true
    adapter: linear
    mcp_tools:
      - "mcp__linear__create_issue"
      - "mcp__linear__update_issue"
    config:
      team_id: "ENG"
      default_project: "Platform"
    fallback: "PM creates Linear issues manually."

  taxonomy_sync:
    enabled: false
    adapter: none
    fallback: "No taxonomy system. Tags used instead."

  template_filler:
    enabled: true
    adapter: built_in
    fallback: "N/A (built-in)"

  release_notes_writer:
    enabled: true
    adapter: built_in
    fallback: "N/A (built-in)"

  metric_designer:
    enabled: true
    adapter: built_in
    mcp_tools:
      - WebSearch
    config:
      analytics: amplitude
      survey: hotjar
    fallback: "PM defines metrics manually."

competitive:
  competitors:
    - name: "RivalCo"
      url: "https://rivalco.com"
      category: direct
  research_depth: surface

delivery:
  templates:
    - name: "release-notes"
      path: "templates/release-notes.md"
  audiences:
    - engineering
    - product
    - sales
  publication_channels:
    - type: notion
      enabled: false
    - type: slack
      channel: "#product"
      enabled: true
```

This example shows an organization that skips legacy analysis (greenfield product),
does not use a refinement judge (peer review instead), has no taxonomy system,
and uses Linear instead of Jira. The orchestrator adapts its behavior at each phase
based on which slots are enabled.

## The process block

```yaml
process:
  default_depth: standard            # light | standard | full
  force_full_when:
    any_risk_at_least: 4
    ai_feature: true
  measurement:
    checkpoint_days: [14, 30, 60]    # adjust per feature usage cycle; record the reason in state
  autonomy:
    reads: autonomous
    writes_to_shared_systems: propose_then_approve
    never_autonomous: [money, authentication, personal_data_changes, irreversible_actions]
```

These are policy defaults the orchestrator reads at startup. A feature may *raise* its depth
but never lower it without a recorded PM decision. Changing a default is a policy change:
record who changed it and why.

## Adding a new slot

If your organization needs a capability not covered by the 15 built-in slots:

1. Define the contract (input, output, quality gate, fallback) in your fork of
   `specialist-contracts.md`.
2. Add the slot ID to your `slot.yaml` with `adapter`, `mcp_tools`, and `config`.
3. The orchestrator will treat unknown slot IDs as custom extensions. It will check
   availability and pass config, but dispatch logic must be provided by the adapter.

## Validation

The orchestrator validates the slot file at startup:

- Schema version must match the orchestrator's supported range.
- All 15 built-in specialist slot IDs and both integration slots must be present (use `enabled: false` for unused slots).
- `mcp_tools` entries are checked against the current MCP session.
- `framework.active` must be a recognized framework ID.
- Warnings are emitted for enabled slots with missing MCP tools, but the orchestrator
  does not refuse to start. It uses fallbacks and reports gaps.

## Enabling the taxonomy slot

`taxonomy_sync` ships disabled (`enabled: false`, `adapter: none`). With it off, Phase 1 skips
taxonomy alignment, signals are tagged by hand, and Delivery skips the taxonomy sync. Nothing else changes.

To turn it on, you need a product-structure system that exposes MCP tools. Then, in your own slot file:

1. Set `enabled: true` and `adapter` to your tool's name.
2. List its tools under `mcp_tools` (reads first; the writes will be proposed to the PM, never run silently).
3. Add the write tools to `permissions.ask` in `.claude/settings.json`, using the exact tool names your
   session shows (they depend on how the server is registered, so check them before writing the rule).
4. Optionally point the `issue_tracker` slot at the taxonomy's known-issue records.

Keep the reads and writes separate: the orchestrator may read the taxonomy on its own, but any
create, update or sign-off is an action on a shared system and needs the PM's explicit approval.
