# Domain and Design Sources

Read this reference only for your own product/domain work, when design evidence, domain
vocabulary, Bounded-Context ownership or cross-context flows materially affect the
decision. It does not apply to ordinary copy edits, localized publication transport or
unrelated projects.

## Source roles

| Source | Authority | Must not do |
|---|---|---|
| Approved refinement Markdown | Product behavior and acceptance intent | Defer behavior authority to a prototype or architecture diagram |
| Design hub | Approved interaction presentation when its project/snapshot is confirmed | Introduce unapproved behavior |
| Your design system | Shared visual tokens and interaction patterns | Override an approved product rule |
| DDD/context-map documents | Domain vocabulary, ownership and context boundaries | Replace a human product decision |

Record the current team-accessible design-hub URL and domain/DDD reference as workflow
state or project configuration, not as a hard-coded value in this skill. Resolve the
current prototype URL or slug from the design hub/project metadata; do not maintain a
hard-coded project-to-slug table in the router. In shared documentation, prefer the
verified public URL. A local fallback must be workspace-relative and marked pending.
Repository clone instructions are optional and require confirmed access.

## Architecture check

When a refinement creates or changes an entity, aggregate, value object, domain event,
projection, anti-corruption layer, shared contract or cross-context responsibility:

1. identify the owning Bounded Context from the current architecture source;
2. compare terminology and ownership with the refinement;
3. trace cross-context inputs, outputs and events without duplicating ownership;
4. record a new or missing architecture concept as a traceability gap with an owner;
5. preserve approved product behavior while the architecture owner resolves the gap.

Do not infer cross-context membership from a static list embedded in the skill. If the DDD
source is unavailable or stale, mark `Architecture verification pending`, name the affected
concept and owner, and assign blocking impact proportionally to the intended action.
