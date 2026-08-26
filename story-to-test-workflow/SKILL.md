---
name: story-to-test-workflow
description: Orchestrate product refinement through an always-guided conversation from a rough idea or spec to reviewed stories, acceptance criteria, QA coverage and handoffs. Use as the single entry point to create a refinement, review existing work, continue an approved phase, reconcile a prototype or generated SPEC, or extend an approved canonical package. Infer and confirm the appropriate internal route, ask one to three related questions per round, wait for answers and use explicit decision gates; produce a fast provisional draft only when the user explicitly requests one.
---

## Purpose

Guide a person or team through one continuous conversation that turns rough product information into reviewed user stories, acceptance criteria, and test cases. Coordinate the specialist skills in the correct order so the user does not need to know or invoke them individually.

Do not rush from an incomplete idea to a large backlog. Build shared understanding first, preserve unanswered questions, and pause for human confirmation when a decision changes product behavior or scope.

## Entry-Point Rule

Use this orchestrator before any specialist skill when the request spans more than one refinement stage or begins from a PRD, spec, idea, or existing artifact package. Do not require the user to know the specialist skill names.

At the start of every new workflow:

1. Infer the internal route from the supplied context; if materially ambiguous, ask one short route-level clarification first.
2. State the recommended route, why it fits and the current phase; confirm that interpretation before substantive questions or writes.
3. Show the route list only if the user disagrees or asks for alternatives.
4. Ask one to three related questions needed for the next decision only and wait.
5. Confirm material answers and obtain the applicable gate approval before downstream work.

Do not reconfirm a recorded active route unless new input materially changes it.

Do not replace this sequence with a single questionnaire, a complete speculative draft, or all remaining questions at once. Read and follow `references/interaction-protocol.md` before the first user-facing question and whenever resuming a paused workflow.

This interaction layer controls discovery, sequencing, questions, confirmations, and approvals only. It must not change artifact contracts, IDs, templates, schemas, generated Markdown, Notion structure, optional exports, or specialist methodology.

## In Simple Terms

The user explains the project once. This skill then:

1. Organizes what is known and asks only useful follow-up questions.
2. Shows the customer journey and differences between flows.
3. Proposes smaller, useful deliveries.
4. Writes the selected stories and acceptance criteria.
5. Designs atomic coverage checks and groups them into functional cases QA can review.
6. Checks that rules, stories, criteria, and tests remain connected.

The conversation adapts to the user's answers. It is not a fixed questionnaire.

## Input

**Works best with:** Any description of a product, feature, project, workflow, problem, or existing backlog item.

**Also useful:** Notes, business rules, designs, screenshots, tickets, process diagrams, API information, known risks, existing stories, test cases, and decisions already made.

Treat everything supplied inline as answered context. Do not ask the user to repeat it. Partial or unstructured input is acceptable. Organize it, state what was understood, and ask only questions that materially improve the next decision.

**Example invocation:** `Help me organize online membership purchasing into releases, user stories, acceptance criteria, and test cases. We support individual, family, and gift memberships.`

### Output Contract to Confirm Once

At Phase 0, infer from the conversation and confirm together with the output folder:

- Artifact language: default to the user's language across headings and content
- Audience: business, DEV, QA, or all
- Canonical source: local Markdown; when a shared GitHub repository is registered, the
  configured canonical branch (normally `main`) becomes the shared documentary source of
  truth once merged — read `references/github-source-of-truth-contract.md` before any
  checkout, branch, commit or Pull Request action
- Optional final presentations: Portal HTML, Word, Notion, several, or none
- Detail level: concise tickets or full review package
- Team conventions: IDs, ticket template, and story sizing method or ceiling

Do not ask about information already clear. Preserve universal IDs such as `BR-`, `US-`, `AC-`, `CHK-`, `FTC-`, and `SC-` regardless of language. Use English only when requested by the user or target convention.

## Key Concepts

### One Entry Point, Nine Specialist Skills

Use these local skills as the source of truth for each phase:

1. `skills/user-story-mapping/SKILL.md`
2. `skills/user-story-splitting/SKILL.md`
3. `skills/user-story/SKILL.md`
4. `skills/test-case-designer/SKILL.md`
5. `skills/refinement-judge/SKILL.md`
6. `skills/build-refinement-portal/SKILL.md`
7. `skills/build-refinement-document/SKILL.md`
8. `skills/publish-refinement-to-notion/SKILL.md`
9. `skills/sync-refinement-package-notion/SKILL.md`

Before executing a phase, read `references/specialist-dispatch-contract.md`, invoke the required specialist through the host's skill mechanism, read it completely and follow its current instructions. Do not copy its full methodology into this orchestrator or replace it with an improvised equivalent.

### Human Decision Gates

A **decision gate** is a short pause where the user confirms information that would materially change later work. Use five gates:

1. Understanding and business rules
2. Proposed releases and story split
3. Stories and acceptance criteria
4. Test coverage and remaining risk
5. Optional publication and export formats

Do not ask for confirmation after every minor step. Do not skip a gate when unresolved behavior would make later output unreliable.

### Stable Traceability

Keep the same IDs throughout the workflow:

```text
BR-01 → US-MEM-01 → AC-MEM-01-01 → CHK-MEM-001 → FTC-MEM-01 / SC-MEM-01-01
```

Never renumber silently between phases. If an item changes, record the change and update its links. Run the deterministic package validator before final handoff.

### Decision Capture Transaction

After every material approval, read and execute
`references/decision-capture.md` before asking the next question. Persist and read back the
stable `BR-*`, update the checkpoint, mark stale consumers and validate incrementally.
For cross-system behavior, also read `references/integration-mapping.md` and maintain its
`MAP-*`. Give the user a concise receipt only after validation succeeds.
Before regenerating or publishing, read `references/change-impact-contract.md`; build the write set from explicit IDs and document responsibility, preserving only proven-current consumers.

Use one canonical scenario model: `US → AC → SC → CHK/evidence`, with `FTC` grouping those same `SC` items. Write each `SC-*` once under its primary `AC-*`; include its canonical QA strategy there: automation decision, level, priority, rationale, dependencies and implementation status. QA and publication views reuse these fields and must not invent or recalculate a parallel decision. Every approved criterion must own or explicitly reference at least one `SC-*`.

### Question Classification

Classify every unanswered question:

- **Blocking now:** the current phase cannot produce a valid result without an answer
- **Important but not blocking:** continue with confirmed information and keep the question visible
- **Needed later:** defer until the relevant phase
- **Already answered:** do not ask again

Never convert a question into an assumed business rule. Offer an explicit best-effort path only when the user chooses it.

## Guided Routes

Every route uses the same guided loop and decision gates. Infer one internal route:

1. **Create new refinement:** start from an idea, PRD or SPEC without an approved canon.
2. **Review existing work:** audit supplied work and continue from its first weak phase.
3. **Continue approved work:** load workflow state and resume at the next applicable phase.
4. **Reconcile derived artifact:** compare canon with HTML, design, screenshots or generated SPEC.
5. **Extend approved package:** run Gate C before assigning IDs or changing approved behavior.
6. **Explicit deep or cross-refinement audit:** read `references/deep-audit-contract.md`, freeze the exact packages in scope, then continue from the first phase that scope actually requires; never turn a routine localized review into a full audit without the user asking for one.

Routes are internal choices, not interaction styles. Always guide the user. A requested fast draft stays provisional and returns to the guided loop before approval or publication. For the extension route, read `references/extend-approved-package.md` in Phase 0.

When the source inventory proves that a package consumes rules, mappings or a shared
contract owned elsewhere, read `references/external-dependency-contract.md`. Verify the
directly referenced source subset inside the current scope. If the evidence indicates
broader cross-package risk, propose an exact cross-refinement audit and wait for the user's
scope decision; do not expand automatically.

Read `references/codebase-verification-contract.md` only when a material claim depends on
current implemented behavior, an integration contract or technical feasibility — not for
ordinary copy changes or future behavior Product is still defining. When design evidence or
domain/architecture boundaries for your own product are material, read
`references/domain-and-design-sources.md`. If the team confirms an external dev-tracking
destination for this project, read `references/dev-destination-handoff.md` before mapping
canonical IDs into it. None of these references change product authority or add a
mandatory Notion cover section.

## Markdown Output

Use local Markdown files as the default durable output. The conversation remains the place for questions and short previews; the files become the reviewable project package.

At the start, determine a short project name suitable for a folder, for example `online-membership-purchase`. If no workspace path is specified, propose rather than silently assume the location. A recommended structure is:

```text
artifacts/<project-name>/
├── 00-workflow-state.md
├── 01-project-understanding.md
├── 02-rules-and-questions.md
├── 03-story-map.md
├── 04-release-slices.md
├── 05-user-stories.md
├── 06-test-coverage.md
├── 07-functional-test-cases.md
├── 08-traceability-and-risks.md
├── 09-package-index.md
├── 11-refinement-judge-report.md
├── jira/US-[ID].md
└── handoffs/{dev-handoff,qa-handoff}.md
```

Writing rules:

1. Show a concise preview at the decision gate.
2. Write or update the corresponding Markdown files only after the user confirms the phase, unless the user explicitly asks to save a draft.
3. Label saved drafts visibly as `Status: Draft — Not approved`.
4. Preserve user edits. Read the current file before updating and change only the relevant sections.
5. Keep links relative so the package can move or be versioned in Git.
6. Never publish to Notion, Jira, or another external system unless the user separately requests and authorizes it.
7. Keep `00-workflow-state.md` current after every approved gate and every material decision checkpoint so the workflow can resume without rereading the full conversation.
8. Keep project status separate from delivery status; one completed delivery does not complete the project.
9. Generate Jira and role-specific views from approved source artifacts, never as competing sources of truth.
10. Keep atomic checks in `06-test-coverage.md` and QA-reviewable functional scenarios in `07-functional-test-cases.md`.
11. Do not generate `.testcase.yml`, `.testplan.yml`, `.testrun.yml`, TestManager keys, UUIDs, or execution results; prepare a handoff for the repository that owns them.

Read `references/markdown-package.md` before creating or updating the package.

When the user asks for shared team context, has no local files, wants to resume a registered
Notion project, or workflow state records Notion synchronization, read and invoke
`sync-refinement-package-notion`. Use `start` before editing and do not require a teammate
to reconstruct prior chats.

When creating or migrating local work, route it before writing:

- canonical project package → `artifacts/<project-slug>/`;
- authoritative cross-project contract → `artifacts/_shared/<shared-package-slug>/`;
- audit, review or historical delta → `artifacts/_reviews/<review-group>/`;
- executable generator or publication helper → `artifacts/_local/tooling/<tool-group>/`.

Do not create new loose files directly under `artifacts/`. Read
`references/local-organization-contract.md` before reorganizing files. Local normalization
must not modify Notion.

For every `_shared` package, resolve ownership before publication. If one feature creates
and governs the contract, publish its visible shared page inside that feature's canonical
Notion project while keeping the Markdown under `_shared/` and registering a separate
manifest. Use a shared-standards hub only when no feature owns the behavior. Consumer
projects link to the shared page and must not copy it as independent truth.

## Interaction Rules

1. Ask one to three related questions at a time.
2. Explain briefly why a blocking question matters.
3. Prefer concrete choices when the known alternatives are clear, while always allowing a custom answer.
4. Accept “unknown” as a valid answer; record an owner and continue where safe.
5. Summarize new decisions before moving to the next phase.
6. Use plain language first and professional terminology second.
7. Do not generate all downstream artifacts merely to appear productive.
8. If the user asks to skip a gate, continue only with confirmed information and label provisional output clearly.

Read `references/interaction-protocol.md` for detailed question and gate behavior.

When payments are present, read `references/payment-consistency.md` during Phase 1. Resolve or visibly defer authorization, capture, void, refund, completion, partial failure, duplicates, unknown results, compensation failure, customer communication, and support evidence.

Read `references/rule-governance.md` during Phase 1 and `references/readiness-and-approvals.md` before Gates 2 and 3.
When HTML, designs, prototypes or generated SPECs are supplied, read
`references/derived-artifact-governance.md` during Phase 1.

## Application

### Phase 0: Choose the Starting Point

Inspect the supplied material and determine whether the work begins with discovery, mapping, splitting, story writing, or test design. Do not force completed work through earlier phases again.

State:

- Selected route
- Starting phase
- Information already available
- Immediate objective
- Markdown project name and approved output location
- Artifact language, audiences, destination, detail level, and sizing convention
- Shared storage mode and registered Notion root/page manifest when configured
- Source roles and canonical base snapshot when derived artifacts are present

For every project, classify Notion availability with `references/local-organization-contract.md`. Reuse a confirmed existing project page; for a new project, create its root under the confirmed parent only at Gate 5; when Notion is unavailable, continue Phases 1–5 as `Local draft — publication pending` without inventing remote IDs, URLs or snapshots. Only shared completion remains blocked.

For an existing registered Notion project with no local package, use
`sync-refinement-package-notion start` before interpreting phase status. For existing
local artifacts that the user wants to share, preserve their current approval and Judge
state during the initial native publication.

For the Extend approved package route, complete `extend-approved-package.md`, then continue at Phase 3 using Decision Capture normally.

For a workspace containing multiple existing packages or loose refinement files, inventory
and normalize locally first under the local organization contract. Obtain separate
approval for local moves, validate every normalized package, and only then open a Notion
publication gate. Do not combine local moves and remote writes in one approval.

### Phase 1: Understand the Project

Use `user-story-mapping` to identify:

- Objective and users
- Actors and participating systems
- Confirmed business rules
- Differences between flows
- Main, alternate, failure, and recovery paths
- Assumptions and open questions
- Candidate first delivery

For every rule, record its plain-language behavior, source, decision authority, status, and affected flows. Consolidate rules that express one behavior instead of creating an ID for every sentence. Record conflicting sources in the contradiction log; never silently choose one.

After each material approval, execute the Decision Capture Transaction. For cross-system
behavior, do not accept phrases such as "sync the address" or "update the household" as a
complete rule. The related `MAP-*` must name both entities and fields, direction,
conditions, propagation, exclusions, unsupported-data behavior, conflict policy and
observability.

For derived artifacts, perform the required static review and interactive browser review
when behavior depends on interaction. Compare canon ↔ SPEC ↔ observed prototype, record
material `DELTA-*` items and treat unmatched behavior as Proposed or Unverifiable. This
workflow reviews and reconciles HTML/SPEC; it does not generate or edit them.

If designs or a Figma link exist, offer an optional design checkpoint before Gate 3. Its absence blocks readiness only when observable behavior depends on an unresolved design decision.

Ask business questions before detailed implementation questions. Route questions naturally:

- PM/PO or business owner: value, rules, priorities, scope
- QA: variations, risk, observable behavior
- Engineering: dependencies, failure modes, recovery, available evidence
- Design: interaction and accessibility intent

#### Gate 1: Confirm Understanding

Present:

1. What was understood
2. Confirmed rules
3. Questions and owners
4. Differences between flows
5. Material risks

Ask the user to confirm, correct, or continue only with confirmed information.

After approval, write or update:

- `01-project-understanding.md`
- `02-rules-and-questions.md`
- `03-story-map.md`
- `00-workflow-state.md`

### Phase 2: Map and Split the Work

Complete the story map, then use `user-story-splitting` to evaluate all relevant split patterns. Prefer a thin end-to-end customer outcome before advanced variations.

Run the Product Boundary Check for every material capability introduced by a derived
artifact. Route it explicitly to Same project, Feature area, Separate canonical project,
Shared contract or Discovery only before selecting scope.

Separate:

- User stories that deliver value
- Technical prerequisites needed to enable value
- Discovery experiments needed to answer unknowns

Ask for the team's sizing ceiling if unknown. Do not invent points or duration. Mark each candidate likely small, suitable, potentially too large, or not estimable, with a reason.

Give every backlog item one explicit state: Candidate, Selected, Approved, Deferred, Blocked, or Superseded.

Propose release slices with rules, dependencies, deferred scope, and risk reduction.

#### Gate 2: Select Scope

Give numbered options tailored to the project, for example:

1. Approve the recommended first delivery
2. Change the proposed order or scope
3. Produce the full provisional backlog
4. Work on one selected flow only

Do not write detailed stories for unselected scope unless the user asks.

After approval, write or update `04-release-slices.md` and `00-workflow-state.md`.

### Phase 3: Write Stories and Acceptance Criteria

Use `user-story` for the selected scope. Preserve rule and story IDs. Include:

- User outcome
- Confirmed business rules
- Included and excluded behavior
- Dependencies
- Assumptions and questions
- Multiple observable acceptance scenarios where needed
- Relevant quality requirements
- Item approval state: Proposed by AI, Product confirmed, Engineering review needed, QA review needed, or Blocked
- Readiness reviewed separately by Product, Engineering, and QA; derive `Ready for Sprint` only when all required checks pass

Classify content as business rule, quality requirement, observability requirement, technical enabler, or test-data/environment need. Do not ask product to approve implementation details as business behavior.

#### Gate 3: Approve Behavior

Ask PM/PO, QA, and engineering to review from their perspectives. Before requesting approval, surface any fragmentary journey, unexplained decision, or purely technical outcome as a finding; do not hide it merely because the file has Given/When/Then headings. If the current user represents only one role, clearly list which confirmations remain with other owners.

Offer numbered actions:

1. Approve and continue to test design
2. Revise selected stories
3. Resolve listed questions first
4. Stop with a story package for team review

Do not derive final expected test results from unapproved or contradictory behavior.

After approval, write or update `05-user-stories.md` and `00-workflow-state.md`.

Also generate one Jira-ready file per approved story. Include title, user outcome, concise context, included/excluded scope, criteria, dependencies, questions, and an `AC → BR → CHK → FTC/SC` table. Before Gate 4, test links may be pending.

This file is a preview, not a live Jira issue — it does not create anything in Jira. Once a story clears Gate 4 (or Gate 3, if the team files tickets before test design finishes), use `skills/jira-story-publisher/SKILL.md` to estimate it and create the real issue.

The Jira view must reproduce the approved acceptance criteria without shortening or changing their meaning. Show the user story and scope before `Comportamiento acordado`; keep `BR-*` as secondary traceability. After test design, add `Pruebas relacionadas`: criterion, checks, functional case/scenario, status, and a relative link.

Make every story Markdown human-first: user story, scope, agreed behavior, dependencies/questions, acceptance criteria, and QA coverage. Put status metadata in its own section, keep IDs secondary to readable titles, and use whitespace plus heading hierarchy instead of dense uninterrupted lists. Never add CSS or platform-specific markup to authoritative Markdown. Preserve every approved statement when reorganizing an existing artifact.

Within each criterion, create one or more stable `SC-*` headings, then render related rules as metadata and the behavioral flow as separate lines with bold `Given/Dado`, `When/Cuando`, `Then/Entonces`, `And/Y`, and `But/Pero` labels. Do not present rules and behavior as peers in one bullet list. QA reuses these exact scenarios and adds metadata without changing their meaning.

Before Gate 3, apply journey integrity. When a story represents a sequential flow spread
across several criteria, include a brief main journey with entry point, preparation,
material decisions, final action, observable confirmation and downstream destination only
when confirmed. Do not require it for single-event stories. The journey connects the
experience; it does not replace the criteria or get copied in full into every scenario.

Then apply context sufficiency to every `SC-*`: it must identify actor or trigger, concrete
state, named action or decision, and an observable business result without forcing the
reader to reconstruct other criteria. Atomicity separates independent behaviors; it does
not authorize phrases such as "Check selected," "answers Yes," or outcomes made only of
internal objects and states.

Write acceptance criteria in product language before technical language. A reader must understand the actor, action, outcome, validation and consequence without knowing internal object names or architecture. Organize business behavior first, QA preparation/evidence second and optional technical detail last. Put terms such as `Subscription`, `Commitment`, events, idempotency or correlation IDs in `Consideración técnica` or `Evidencia técnica`; never use compressed shorthand. For async results require a confirmed final signal and window/completion condition; source material values from confirmed rules/configuration/test data and require exact copy only when approved wording makes it contractual.

### Phase 4: Design Test Coverage

Use `test-case-designer` on approved stories and criteria. Produce:

- Testability audit
- Risk-based coverage matrix
- Atomic coverage checks (`CHK-*`) that prevent rules from being forgotten
- Canonical scenarios (`SC-*`) owned by criteria and grouped into functional cases (`FTC-*`) by feature or primary action
- Scenario-level automation decisions with rationale, priority, level, dependencies, and implementation status
- Rules-to-tests coverage table
- Remaining questions and risk

Read `references/matrix-decision.md` when requirements contain interacting settings, states, permissions, calculations, boundaries, or reusable datasets. Apply its deterministic matrix assessment before creating a decision table or parameterized dataset. A matrix is optional supporting evidence and must never replace the business context, representative values, action, or expected outcome in a canonical `SC-*`.

Before writing functional cases, cluster checks by primary business behavior. Keep actions together only when they share actor/context, form one submission or event, cannot stand alone, and lead to one primary outcome with the same evidence. Otherwise create another scenario; checks that prove inseparable consequences may remain expected results in one scenario.

Do not compress a workflow walkthrough into one scenario by listing several actions in one `When` or unrelated outcomes in one `Then`. Render selection, navigation, saving, validation, rejection, asynchronous completion and recovery as distinct `SC-*` items when their trigger or outcome changes, while grouping them under one `FTC-*` when appropriate. Use natural nouns; explain fixtures, controlled values and internal records only in Preconditions, Data or Evidence.

Read `references/qa-design-handoff.md`. Treat `CHK-*` as coverage units, not executable files. Treat `FTC-*` as QA review units, not TestManager keys. Reuse the exact `SC-*` IDs and approved behavior from the criteria; add QA metadata without creating parallel scenarios.

Apply the `test-case-designer` Gherkin clarity and executability gates before Gate 4 approval. Keep those checks internal rather than adding a repeated checklist to the artifacts. For existing approved or automated scenarios, preserve IDs, traceability, behavior and automation metadata; propose clarifications and obtain approval instead of rewriting them silently. Do not call a scenario QA-ready merely because Given/When/Then headings exist.

For every new or changed high-risk scenario, persist the compact execution contract required by `test-case-designer` and let strict validation enforce it; do not retroactively invalidate unchanged approved scenarios, but require migration when they are edited. If a material value or expected outcome lacks an owner decision, stop at `Needs refinement` because Product approval alone does not make the scenario executable. Keep scenario executability and automation separate. For every `SC-*`, record `Automate now`, `Automate later`, `Manual`, or `Blocked`; include the reason, priority, lowest useful level, dependencies, and `Not started`, `Planned`, or `Implemented` coverage status. Never report execution results in this workflow.

For payments, purchases, renewals, asynchronous processes or journeys that create or update
several related results, read and apply
`test-case-designer/references/journey-integrity-contract.md`. Keep the `SC-*` atomic and
independent, and compose the complete journey in one `FTC-*`. The coverage inventory must
declare `Required` or `Not applicable` with a reason; never add acceptance criteria for test
mechanics.

#### Gate 4: Review Coverage

Present high-risk coverage, blocked cases, intentionally omitted combinations, and remaining risk. Do not approve Gate 4 when a critical journey appears only as fragmented checks: a composition must exist connecting entry action, visible outcome, final condition, applicable downstream consistency and participating scenarios. Require a complete E2E/Integration/Manual validation, or a `Blocked` exception with reason, owner and risk; automation does not define functional coverage. Ask whether the user wants to approve, revise, expand to regression, or prepare the artifacts for another system.

After approval, write or update:

- `06-test-coverage.md`
- `07-functional-test-cases.md`
- `08-traceability-and-risks.md`
- `00-workflow-state.md`

Then read `references/delivery-views.md` and generate `09-package-index.md`, `handoffs/dev-handoff.md`, `handoffs/qa-handoff.md`, and refreshed Jira ticket files. The QA handoff must be sufficient for another repository to generate its native test cases, plan, and run without rereading the full PRD.

### Phase 5: Final Consistency Audit

Read `references/artifact-contract.md` and verify:

- Every confirmed in-scope rule maps to a story or documented non-story work
- Every story has observable acceptance criteria
- Every approved criterion has planned test coverage
- Questions remain questions
- Dependencies and deferred scope are visible
- No high risk is reported as covered without evidence
- Artifact language matches the confirmed output contract
- Project and delivery statuses are not conflated
- Derived artifacts declare source role/snapshot, material deltas are decided, and new capabilities are routed to an owner package

Run `scripts/validate-package.py <artifact-folder> --language <code> --decision-checkpoint`
after material decisions. Before final handoff, run
`scripts/validate-package.py <artifact-folder> --language <code> --strict` and fix errors.
Incremental validation checks decision persistence, workflow freshness and complete
integration mappings. Strict validation also checks ID ranges, Gherkin clarity,
Jira/master parity, readiness, check-to-scenario traceability, and the functional-case
schema.

For a package explicitly registered as `package_kind: shared-contract`, add
`--package-kind shared-contract` to the strict run instead; it validates state, index,
canonical contract, owner, consumers, change-impact rule, status and links, in place of a
full project's artifact set. Never infer this mode from a project's size, and never use it
to skip stories, coverage or handoffs for a normal project. Propagate the same
`package_kind` to `refinement-judge`'s preflight and presentation type.

After deterministic validation succeeds, invoke `refinement-judge` as an independent adversarial gate. Give it the original sources, approved decisions, current Markdown package, confirmed language, and intended next action. Do not give it the generating skill's conclusions or suspected findings. Require `11-refinement-judge-report.md` and a validated verdict.

- `PASS`: continue.
- `PASS WITH OBSERVATIONS` / `PASS CON OBSERVACIONES`: continue while preserving findings.
- `FAIL`: return findings to the appropriate phase, obtain owner-approved corrections, rerun deterministic validation, and rerun the Judge against a new snapshot.

Do not publish externally, create or update Jira tickets, or represent the final DEV/QA handoff as approved after `FAIL`. A human may explicitly accept named findings for one named action; record the override in the Judge report without changing its verdict.

Return a concise handoff containing completed artifacts, Judge verdict, decisions, open questions, owners, and the recommended next action.

### Phase 6: Choose Final Presentations

After deterministic validation succeeds and the Judge returns `PASS` or `PASS WITH OBSERVATIONS` / `PASS CON OBSERVACIONES`, confirm that the canonical Markdown package is complete. Then open **Gate 5: Publication and export** and ask what additional presentation the user wants:

1. Portal HTML local
2. Documento Word
3. Página o estructura de Notion
4. Varias de las anteriores
5. Ninguna; finalizar con Markdown

Do not imply that one optional presentation is required. If the user already selected a format, execute it without asking again.

Route each selected output:

- **Portal:** use `build-refinement-portal`; generate a self-contained local HTML, recommended as `10-refinement-portal.html` when available.
- **Word:** use `build-refinement-document`; generate and visually verify a `.docx`, choosing the next free numbered filename. When Notion is also selected and already published, prefer generating it from the verified Notion checkout and regenerate it after any later Notion change.
- **Notion:** before requesting remote authorization, read and execute `references/publication-authorization-gate.md`; resolve incomplete payloads, Judges or hashes locally and ask once only after the deterministic dossier passes. Invoke `publish-refinement-to-notion` through the host skill mechanism and complete its dispatch preflight; if the specialist or a compatible Notion connection cannot be resolved, stop with publication pending instead of designing or writing an alternative page. Publish only with authorization and verify by full readback. Classify the action as:
  - `Publicación completa` when the user asks to publish or republish the refinement without limiting pages. Generate both the collaborative refinement view (cover, story pages and auxiliary pages) and a 1:1 Markdown mirror that preserves relative paths and roles.
  - `Actualización localizada` when the user explicitly names affected stories, sections or pages. Preserve the rest and update cover facts whose truth changed.

  After initial publication and registration, use `sync-refinement-package-notion` for every `status`, `start`, `publish`, `reconcile` or `recover`. Notion becomes the shared official copy only after complete readback; regenerate the local Markdown checkout from that verified result. The Notion hierarchy must follow `references/markdown-package.md`: keep the established human refinement view as the primary review experience (cover, story pages, auxiliary pages) alongside a technical 1:1 mirror for safe synchronization; publication and sync skills must not consolidate, rename, omit or reclassify its files.

Generate every presentation from approved Markdown, never from another derived presentation. A user may select several formats; produce them independently so HTML, Word and Notion cannot silently drift through chained conversion.

When the package contains a canonical matrix, every selected presentation must render it as navigable content or provide a valid destination-native link. Consumer stories still include the relevant input and expected values, so a reviewer can understand and approve each scenario without opening the matrix. Never leave a local filesystem path as the only matrix reference in Notion, Word, Portal, Jira, or another derived view.

For external publication, preserve safety:

- Notion: require a confirmed parent page; allow an explicitly requested private standalone page without making it a future default. Do not edit the PRD original.
- Hosted portal: offer private hosting only after validating the local HTML; require informed confirmation before public hosting.
- Word: do not deliver internal render PNGs unless requested.

Update `00-workflow-state.md` and `09-package-index.md` with every selected format, local path or URL, generation date, publication mode, scope, status and page manifest. Record declined outputs as `Not requested`, not as missing work. Do not mark the project incomplete because the user declines optional presentations.

After a Notion publication, rerun `refinement-judge` in presentation-parity mode against the same canonical snapshot and the pages just verified. A complete publication must fail parity when a required auxiliary page is absent, stale, duplicated, incorrectly linked or marked `No aplica` despite an applicable canonical source. A localized update is judged against its declared scope and the cover facts it changed.

If this project registers a shared GitHub repository, follow
`references/github-source-of-truth-contract.md` for the handoff: show the repository,
canonical branch, working branch, exact changed files and affected IDs, validation and
Judge verdict before any commit, push or Pull Request action. Never push directly to the
canonical branch, and never claim the shared canon changed before observing the merge.

## State and Resumption

At each gate, maintain a compact state summary. The instant a gate is approved, append one line to the Gate approval log below — who approved it (the user, by name if known, otherwise "the user") and today's date — before moving on. Don't infer or backfill a missing log line later; if a gate isn't logged, treat it as not actually approved yet.

```markdown
## Workflow State
- Route:
- Current phase:
- Approved through:
- Gate approval log:
  - Gate 1 (Understanding): [approved by <name>, <date>] or [pending]
  - Gate 2 (Scope): [approved by <name>, <date>] or [pending]
  - Gate 3 (Behavior): [approved by <name>, <date>] or [pending]
  - Gate 4 (Coverage): [approved by <name>, <date>] or [pending]
  - Gate 5 (Publication): [approved by <name>, <date>] or [pending] or [not requested]
- Confirmed rules:
- Open blocking questions:
- Selected scope:
- Next action:
- Markdown package path:
- Artifact language/audiences:
- Optional presentations selected:
- Presentation paths or URLs:
- Notion publication mode and page manifest:
- Project status and delivery statuses:
```

When the user returns later, continue from this state instead of restarting. If source material changed, identify what downstream artifacts may now be stale.

## Examples and Pitfalls

Read `references/examples-and-pitfalls.md` only when the user requests an example, interaction quality is being reviewed, or the workflow shows questionnaire dumps, premature generation, repeated questions, role confusion, specialist-skill drift, or excessive approval pauses. Keep the phases, gates, state, and specialist routing in this file authoritative.

## References

- `references/interaction-protocol.md` — How to ask, adapt, pause, and resume
- `references/specialist-dispatch-contract.md` — Resolution order, preflight receipt and hard stops before invoking a specialist skill
- `references/change-impact-contract.md` — Consumer graph, per-unit update/preserve/blocked plan and gates before regenerating or publishing
- `references/artifact-contract.md` — Required handoff and traceability between phases
- `references/markdown-package.md` — File structure, statuses, and update rules
- `references/local-organization-contract.md` — Notion availability classification and local-draft normalization
- `references/rule-governance.md` — Sources, authority, contradictions, and rule consolidation
- `references/decision-capture.md` — Mandatory persistence, readback, stale-impact tracking and capture receipt after approvals
- `references/integration-mapping.md` — Required `MAP-*` contract for sync, migration, propagation and cross-system fields
- `references/derived-artifact-governance.md` — HTML/SPEC review, delta reconciliation and product-boundary routing
- `references/extend-approved-package.md` — Gate C, semantic compatibility and ID assignment when extending an approved canon
- `references/readiness-and-approvals.md` — Backlog states, role readiness, and block approvals
- `references/qa-design-handoff.md` — Boundary between QA design and downstream TestManager artifacts
- `references/matrix-decision.md` — Deterministic rule for creating matrices without making scenarios depend on them
- `references/publication-authorization-gate.md` — Autonomous exact-write dossier before Notion authorization
- `references/deep-audit-contract.md` — Explicit complete and cross-refinement audits
- `references/external-dependency-contract.md` — direct external-rule verification and when to propose a cross-refinement audit
- `references/github-source-of-truth-contract.md` — Branch, Pull Request and shared-canon rules when a repository is registered
- `references/codebase-verification-contract.md` — Conditional current-implementation evidence
- `references/domain-and-design-sources.md` — Conditional design-hub and domain/architecture evidence for your own product
- `references/dev-destination-handoff.md` — Optional adapter reference for an external dev-tracking destination
- `references/examples-and-pitfalls.md` — Worked examples and common interaction failure patterns
- `skills/refinement-judge/SKILL.md` — Independent adversarial gate before consequential actions
- `skills/user-story-mapping/SKILL.md` — Journey, rules, variations, and release slices
- `skills/user-story-splitting/SKILL.md` — Vertical decomposition and sequencing
- `skills/user-story/SKILL.md` — User stories and acceptance criteria; use its `references/golden-example.md` as the authoritative complete example
- `skills/test-case-designer/SKILL.md` — Risk-based coverage and test cases
- `skills/build-refinement-portal/SKILL.md` — Optional final portal generation from approved artifacts
- `skills/build-refinement-document/SKILL.md` — Optional Word document generation and visual verification
- `skills/publish-refinement-to-notion/SKILL.md` — Optional native Notion publication or local export fallback
- `skills/sync-refinement-package-notion/SKILL.md` — Optional ongoing sync, concurrency and recovery after an initial Notion publication

### Outside This Orchestrator's Scope

- `skills/idea-to-ship/SKILL.md` — The router above this one: decides whether an initiative should even be here yet (the Define/Shape stage), or belongs at an earlier/later stage. If a user arrives unsure where to start, point them there first.
- `skills/prd-writer/SKILL.md`, `skills/product-spec-agent/SKILL.md`, `skills/mini-spec-writer/SKILL.md` — Upstream: produce the spec, PRD, or approved feature scope this orchestrator's Phase 0 expects as input. Do not re-litigate business-case or bet decisions already made there.
- `skills/jira-story-publisher/SKILL.md` — Downstream: the only skill that actually creates a Jira issue from an approved story; this orchestrator's `jira/US-[ID].md` files are previews, not live tickets.
- `skills/weekly-product-pulse/SKILL.md` — Downstream: reports on stories once they're filed in Jira and enter the team's tracked workflow.
- `skills/artifact-sync/SKILL.md` — Downstream: propagates a changed decision back into already-published Jira/Notion/design artifacts after this package has been approved and published.
