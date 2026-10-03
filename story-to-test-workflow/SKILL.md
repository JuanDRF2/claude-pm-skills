---
name: story-to-test-workflow
description: "Orchestrates product refinement through an always-guided conversation from a rough idea or spec to reviewed stories, acceptance criteria, QA coverage and handoffs. Use as the entry point for refinement work (not for the whole product cycle: use `idea-to-ship` when unsure where to start) to create a refinement, review existing work, continue an approved phase, reconcile a prototype or generated SPEC, or extend an approved canonical package. Infers and confirms the appropriate internal route, asks one to three related questions per round, waits for answers and uses explicit decision gates; produces a fast provisional draft only when the user explicitly requests one."
---

## Purpose

Guide a person or team through one continuous conversation that turns rough product information into reviewed user stories, acceptance criteria, and test cases. Coordinate the specialist skills in the correct order so the user does not need to know or invoke them individually.

Do not rush from an incomplete idea to a large backlog. Build shared understanding first, preserve unanswered questions, and pause for human confirmation when a decision changes product behavior or scope.

## Entry-Point Rule

If another orchestrator dispatched you for its refinement phase (for example `signal-to-ship`), read `references/embedded-mode.md` first: it changes how you present yourself and what you hand back.

Use this orchestrator before any refinement specialist skill when the request spans more than one refinement stage or begins from a PRD, spec, idea, or existing artifact package. Do not require the user to know the specialist skill names.

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

### One Entry Point, Ten Specialist Skills

Use these local skills as the source of truth for each phase:

1. `user-story-mapping`
2. `user-story-splitting`
3. `user-story`
4. `test-case-designer`
5. `refinement-judge`
6. `build-refinement-portal`
7. `build-refinement-document`
8. `publish-refinement-to-notion`
9. `sync-refinement-package-notion`
10. `sync-refinement-package-taxonomy`

Before executing a phase, read `references/specialist-dispatch-contract.md`, invoke the required specialist through the host's skill mechanism, read it completely and follow its current instructions. Do not copy its full methodology into this orchestrator or replace it with an improvised equivalent.

### Human Decision Gates

A **decision gate** is a short pause where the user confirms information that would materially change later work. Use five gates:

1. Understanding and business rules
2. Proposed releases and story split
3. Stories and acceptance criteria
4. Test coverage and remaining risk
5. Optional publication and export formats, plus conditional Taxonomy Alignment when it applies

Do not ask for confirmation after every minor step. Do not skip a gate when unresolved behavior would make later output unreliable.

### Stable Traceability

Keep the same IDs throughout the workflow:

```text
BR-01 → US-MEM-01 → AC-MEM-01-01 → CHK-MEM-001 → FTC-MEM-01 / SC-MEM-01-01
```

Never renumber silently between phases. If an item changes, record the change and update its links. Run the deterministic package validator before final handoff.

When an approved `US-*`, `AC-*` or `SC-*` is retired or superseded, read
`references/retired-identifier-contract.md`. Preserve its identity in the canonical
historical registry, never inside active delivery behavior or by reusing the ID.

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
canonical IDs into it. After Gate 4, read `references/taxonomy-alignment.md` only when
Product Taxonomy applies, an existing mapping may be stale, or post-handoff reconciliation
was requested. None of these references change product authority or add a mandatory
Notion cover section.

## Markdown Output

Use local Markdown files as the default durable output. The conversation remains the place for questions and short previews; the files become the reviewable project package.

At the start, determine a short project name suitable for a folder, for example `online-membership-purchase`. If no workspace path is specified, propose rather than silently assume the location.

Read `references/markdown-package.md` before creating or updating the package — it holds the full folder structure, the writing rules (draft labeling, relative links, when to write vs. preview, `00-workflow-state.md` freshness, never publishing to Notion/Jira without authorization), local-work routing (canonical project vs. `_shared` vs. `_reviews` vs. `_local/tooling`), and `_shared` ownership rules. Read `references/local-organization-contract.md` before reorganizing existing files — local normalization must not modify Notion.

When the user asks for shared team context, has no local files, wants to resume a registered
Notion project, or workflow state records Notion synchronization, read and invoke
`sync-refinement-package-notion`. Use `start` before editing and do not require a teammate
to reconstruct prior chats.

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

For new projects or material Gate 1 revisions, apply `references/project-context-contract.md`
so `01-project-understanding.md` explains the product boundary while `03-story-map.md`
preserves the understandable end-to-end journey without duplicating rules.

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

This file is a preview, not a live Jira issue — it does not create anything in Jira. Once a story clears Gate 4 (or Gate 3, if the team files tickets before test design finishes), use `jira-story-publisher` to estimate it and create the real issue.

Read `references/story-and-scenario-writing-conventions.md` before writing or reformatting any story/criterion content — it covers Jira-view formatting, Markdown structure, `SC-*` heading conventions, journey integrity, context sufficiency, and product-language-first ordering. Keep the phase steps and gate logic above authoritative; that file only covers writing/formatting mechanics.

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

Before writing functional cases, read `references/story-and-scenario-writing-conventions.md`'s Phase 4 section for how to cluster checks and avoid compressing a workflow walkthrough into one scenario.

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

After deterministic validation succeeds and the Judge returns `PASS` or `PASS WITH OBSERVATIONS` / `PASS CON OBSERVACIONES`, confirm that the canonical Markdown package is complete. If Product Taxonomy applies to this initiative, read `references/taxonomy-alignment.md` now and route the Gate 5 Taxonomy Alignment step before or alongside the development-destination handoff. Then open **Gate 5: Publication and export** and ask what additional presentation the user wants:

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
- Shared repository URL:
- Canonical branch and observed commit:
- Working branch and base commit:
- Pull Request URL/status:
- Last merged canonical commit:
- Shared storage mode: github-main-v1 | local-only
- Artifact language/audiences:
- Optional presentations selected:
- Presentation paths or URLs:
- Notion publication mode and page manifest:
- Context artifact contract / Contrato de artefactos de contexto: project-context-v1 | Legacy
- Project status and delivery statuses:
- Derived artifacts: None | [artifact list and role]
- Canonical base snapshot:
```

For packages created before `github-main-v1`, preserve their existing fields and add the repository fields when the project is first changed in GitHub; do not rewrite an unchanged package only to modernize metadata, and remember a Pull Request is not the last merged canonical commit. Preserve legacy derived-output fields in old packages until that package is materially changed. Read `references/workflow-state.md` for the optional Derived Output State, Taxonomy Alignment State, and Decision Checkpoint blocks and when to add each.

When the user returns later, continue from this state instead of restarting. If source material changed, identify what downstream artifacts may now be stale.

## Examples and Pitfalls

Read `references/examples-and-pitfalls.md` only when the user requests an example, interaction quality is being reviewed, or the workflow shows questionnaire dumps, premature generation, repeated questions, role confusion, specialist-skill drift, or excessive approval pauses. Keep the phases, gates, state, and specialist routing in this file authoritative.

## References

Read `references/INDEX.md` for the complete reference and skill-dependency map (upstream/downstream skills, when to read each file) — each phase above already says exactly when to read a specific file inline, so the index is a lookup aid, not additional routing logic.
