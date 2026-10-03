# Slot Engine Reference

Instructions for the orchestrator to read and resolve slot bindings from the
organization's `slot.yaml` file at startup.

## When to load

At the start of every Signal to Ship cycle or when resuming a session. The slot resolution
happens once and its results inform all subsequent phase dispatches.

## Step 1: Locate the slot file

An organization's config is a file named `<org>.slot.yaml`. Look for it in this order and stop at the first
folder that has one:

1. `.signal-to-ship/` in the project or case directory: a team's own config, kept with their repo.
2. `~/.claude/signal-to-ship/orgs/`: the PM's personal folder, outside any repo. Use this when working for
   an employer, so their configuration never ends up in a public repository.
3. `examples/` inside this skill: the fictitious `acme.slot.yaml`. If this is the only config found, say so
   and ask whether to continue with the example or create the organization's own config.

If a folder holds several files, ask the PM which organization to use. Without any config, use
`references/integration-map.md` and the fallbacks it documents.

## Step 2: Parse organization identity

Read the top-level `organization` and `framework` blocks:

```yaml
organization:
  name: "..."        # Used in reports and audience views
  industry: "..."    # Context for competitive research
  product: "..."     # Product name for delivery docs

framework:
  active: brice_plus # Determines Phase 2 behavior
  weights: { ... }   # Passed to priority-calculator.md
  channels: [ ... ]  # Signal channels for origin tracking
```

Store:
- `org_name` for display in all outputs
- `active_framework` for Phase 2 dispatch
- `framework_weights` for the priority calculator
- `auto_review_threshold` for signal channel diversity check

## Step 3: Resolve each slot

For each entry under `slots:`, extract:

| Field | What to do with it |
|-------|--------------------|
| `enabled` | If `false`, skip this slot entirely. Use `fallback`. |
| `adapter` | Identifies the tool or skill. `built_in` = orchestrator handles. |
| `mcp_tools` | List of MCP tool names. Verify each is available in the current session. |
| `config` | Slot-specific data (boards, repos, paths). Pass to the specialist. |
| `fallback` | What to do when the slot is unavailable. Display to PM. |

### Availability check

For each MCP tool listed in `mcp_tools`:
1. The tool name should match a tool available in the current session.
2. If a tool is not available, mark the slot as **degraded**.
3. A degraded slot can still operate if some (not all) tools are missing.
   Document which tools are missing and what capabilities are lost.
4. **Check the target, not only the tool.** A tool that exists may reach a different organization's
   workspace than the one the slot config names (a tracker site, a feedback workspace). If the config
   names no target, or the reachable target is not the configured one, mark the slot **unverified**,
   do not read from it, and ask the PM to provide the data. Never use a connection to another
   organization's systems to fill a gap.

### What to tell the PM

Keep the startup message short. Ask the Gate 0 question first. Name a slot only when it is degraded or
unverified **and** needed in the current phase; leave the full slot table in the state file's notes, not
in the chat.

### Resolution result

Build a mental registry:

```
slot: signal_collector
  status: ready | degraded | disabled
  adapter: canny
  missing_tools: []
  config: { boards: [...], jira_integration: { ... } }
  fallback: "Ask PM to provide Canny data manually."
```

## Step 4: Report slot status to PM

At the start of the cycle, briefly report:

```
Slot status for [org_name]:
- Signal collector (Canny): ready
- Issue tracker (Jira): ready (note: being phased out)
- Product taxonomy: ready
- Prototype builder: ready
- Refinement (story-to-test-workflow): ready
- Ticket writer (Jira): ready
- [disabled slots]: spec_writer, competitive_teardown, release_notes_writer (using fallbacks)
```

Only report degraded or disabled slots in detail. Ready slots get one line.

## Step 5: Use during phase dispatch

When entering a phase, check the relevant slots:

| Phase | Slots to check |
|-------|---------------|
| Signals | signal_collector, competitive_researcher, legacy_analyzer, product_taxonomy |
| Prioritization | priority_scorer |
| Specification | spec_writer, competitive_teardown |
| Prototyping | prototype_builder |
| Refinement | refinement_orchestrator, refinement_judge |
| Delivery | ticket_writer, taxonomy_sync, template_filler, release_notes_writer |
| Measurement | metric_designer |

For each phase:
1. Check slot status from the registry
2. If ready: dispatch using the adapter and pass `config`
3. If degraded: proceed with available tools, document what's missing
4. If disabled: use `fallback`, inform PM

## Step 6: Use competitive config

Read `competitive.competitors` for the list of competitors to research in Phase 1.
Use `competitive.research_depth` to calibrate effort:
- `surface`: check 1-2 competitors, basic capability check
- `standard`: check 2-3 competitors, capability + UX comparison
- `deep`: check all competitors, full teardown with screenshots

## Step 7: Use delivery config

Read `delivery.templates` for available delivery templates (may differ from defaults).
Read `delivery.audiences` for the organization's audience list.
Read `delivery.publication_channels` for where to publish (and which are enabled).

## Fallback behavior

If no slot.yaml file exists at all:
1. Report: "No organization config found. Using defaults from references/integration-map.md."
2. Fall back to the integration map for slot information.
3. Ask the PM for any organization-specific config needed per phase.

The orchestrator must work without a slot.yaml. The YAML adds automation and
consistency, but the orchestrator's references contain enough information to
run manually.
