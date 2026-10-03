# Story and Scenario Writing Conventions

Detailed formatting rules for Phase 3 (writing stories/acceptance criteria) and Phase 4
(designing test coverage). Read this when actually writing or reformatting story/scenario
content — not needed for the routing/gate decisions in SKILL.md itself. Extracted 2026-09-29
to bring SKILL.md's body under Anthropic's ~500-line guidance; nothing here changed in meaning,
only moved.

## Phase 3 — story and acceptance-criteria formatting

The Jira view must reproduce the approved acceptance criteria without shortening or changing
their meaning. Show the user story and scope before `Comportamiento acordado`; keep `BR-*` as
secondary traceability. After test design, add `Pruebas relacionadas`: criterion, checks,
functional case/scenario, status, and a relative link.

Make every story Markdown human-first: user story, scope, agreed behavior,
dependencies/questions, acceptance criteria, and QA coverage. Put status metadata in its own
section, keep IDs secondary to readable titles, and use whitespace plus heading hierarchy
instead of dense uninterrupted lists. Never add CSS or platform-specific markup to authoritative
Markdown. Preserve every approved statement when reorganizing an existing artifact.

Within each criterion, create one or more stable `SC-*` headings, then render related rules as
metadata and the behavioral flow as separate lines with bold `Given/Dado`, `When/Cuando`,
`Then/Entonces`, `And/Y`, and `But/Pero` labels. Do not present rules and behavior as peers in
one bullet list. QA reuses these exact scenarios and adds metadata without changing their
meaning.

Before Gate 3, apply journey integrity. When a story represents a sequential flow spread across
several criteria, include a brief main journey with entry point, preparation, material
decisions, final action, observable confirmation and downstream destination only when
confirmed. Do not require it for single-event stories. The journey connects the experience; it
does not replace the criteria or get copied in full into every scenario.

Then apply context sufficiency to every `SC-*`: it must identify actor or trigger, concrete
state, named action or decision, and an observable business result without forcing the reader
to reconstruct other criteria. Atomicity separates independent behaviors; it does not authorize
phrases such as "Check selected," "answers Yes," or outcomes made only of internal objects and
states.

Write acceptance criteria in product language before technical language. A reader must
understand the actor, action, outcome, validation and consequence without knowing internal
object names or architecture. Organize business behavior first, QA preparation/evidence second
and optional technical detail last. Put terms such as `Subscription`, `Commitment`, events,
idempotency or correlation IDs in `Consideración técnica` or `Evidencia técnica`; never use
compressed shorthand. For async results require a confirmed final signal and window/completion
condition; source material values from confirmed rules/configuration/test data and require
exact copy only when approved wording makes it contractual.

## Phase 4 — functional-case clustering

Before writing functional cases, cluster checks by primary business behavior. Keep actions
together only when they share actor/context, form one submission or event, cannot stand alone,
and lead to one primary outcome with the same evidence. Otherwise create another scenario;
checks that prove inseparable consequences may remain expected results in one scenario.

Do not compress a workflow walkthrough into one scenario by listing several actions in one
`When` or unrelated outcomes in one `Then`. Render selection, navigation, saving, validation,
rejection, asynchronous completion and recovery as distinct `SC-*` items when their trigger or
outcome changes, while grouping them under one `FTC-*` when appropriate. Use natural nouns;
explain fixtures, controlled values and internal records only in Preconditions, Data or
Evidence.
