# Taxonomy MCP Contract

## Capability and endpoint

The canonical production endpoint is host/project-specific. Record the current
team-confirmed endpoint as workflow state or project configuration, not as a hard-coded
value in this skill — for example:

```text
https://taxonomy.<your-org>.example/mcp
```

It exposes business-code reads plus create/update tools. Internal UUIDs do not cross the
MCP boundary; destructive delete/merge operations remain outside this surface.

Connection support is host-specific. The maintained setup currently documents Claude web,
Claude Desktop, Claude Code and managed/API agents. Do not claim Codex or another host is
connected until its current tool surface proves the Taxonomy tools are callable.

## Connection safety

- Prefer per-user OAuth where the host supports it so writes are attributable.
- Treat static bearer credentials as production secrets with write capability.
- Never place credentials in a skill, prompt, Markdown package, Git repository, receipt or
  chat output.
- Connector installation is separate from refinement. If unavailable, return a
  `Draft`/`Blocked` mapping and named handoff consequence.

## Read surface

Use the available targeted tools such as `list_products`, `list_features`, `list_jtbds`,
`get_jtbd`, `list_outcomes`, `list_journeys`, `get_journey` and `list_scenarios`. Confirm
actual tool names from the connected server instead of fabricating a substitute.

Read only the Product hierarchy and relationship closure needed by the package. A targeted
read supports a localized mapping; it does not prove global Taxonomy integrity.

## Write surface

Every `create_*` or `update_*` mutates the live production taxonomy. Updates are partial,
but the plan must still state the observed before value and intended result. Require exact
authorization immediately before the write, then read back the affected identity.

The connector has no delete/merge tools. Do not work around that boundary. If an incorrect
create needs destructive correction, stop and route it to the Product Taxonomy owners.

Do not assume title matching is idempotent. Prefer an observed code already recorded in the
mapping. Until namespaced external references are supported and verified for every entity,
stop after ambiguous or partially completed creates rather than retrying.
