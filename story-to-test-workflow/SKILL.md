---
name: story-to-test-workflow
description: Orchestrate product refinement interactively from a rough idea or spec through discovery, story mapping, splitting, user stories, acceptance criteria, coverage checks, QA-reviewable functional test cases, and downstream handoffs. Use as the single entry point whenever a user asks to analyze a PRD or spec, refine a feature, create or review stories and acceptance criteria, derive test cases, or continue an existing refinement package. In Guided mode, lead the user step by step with one to three related questions per round and explicit decision gates instead of generating every deliverable at once.
---

## Purpose

Guide a person or team through one continuous conversation that turns rough product information into reviewed user stories, acceptance criteria, and test cases. Coordinate the specialist skills in the correct order so the user does not need to know or invoke them individually.

Do not rush from an incomplete idea to a large backlog. Build shared understanding first, preserve unanswered questions, and pause for human confirmation when a decision changes product behavior or scope.

## Entry-Point Rule

Use this orchestrator before any specialist skill when the request spans more than one refinement stage or begins from a PRD, spec, idea, or existing artifact package. Do not require the user to know the specialist skill names.

At the start of Guided mode:

1. State the current phase and what was already understood.
2. Ask one to three related questions needed for the next decision only.
3. Wait for the user's response before asking the next group or advancing a gate.
4. Confirm the interpretation of material answers.
5. Obtain the applicable decision-gate approval before producing downstream deliverables.

Do not replace this sequence with a single questionnaire, a complete speculative draft, or all remaining questions at once. Read and follow `references/interaction-protocol.md` before the first user-facing question and whenever resuming a paused workflow.

This interaction layer controls discovery, sequencing, questions, confirmations, and approvals only. It must not change the artifact contracts, ID model, templates, schemas, generated Markdown structure, portal, Word output, Notion structure, or specialist-skill methodology.

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
- Canonical source: always local Markdown
- Optional final presentations: Portal HTML, Word, Notion, several, or none
- Detail level: concise tickets or full review package
- Team conventions: IDs, ticket template, and story sizing method or ceiling

Do not ask about information already clear. Preserve universal IDs such as `BR-`, `US-`, `AC-`, `CHK-`, `FTC-`, and `SC-` regardless of language. Use English only when requested by the user or target convention.

## Key Concepts

### One Entry Point, Seven Specialist Skills

Use these local skills as the source of truth for each phase:

1. `skills/user-story-mapping/SKILL.md`
2. `skills/user-story-splitting/SKILL.md`
3. `skills/user-story/SKILL.md`
4. `skills/test-case-designer/SKILL.md`
5. `skills/build-refinement-portal/SKILL.md`
6. `skills/build-refinement-document/SKILL.md`
7. `skills/publish-refinement-to-notion/SKILL.md`

Before executing a phase, read that skill completely and follow its current instructions. Do not copy its full methodology into this orchestrator.

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

Use one canonical scenario model: `US → AC → SC → CHK/evidence`, with `FTC` grouping those same `SC` items. Write each `SC-*` once under its primary `AC-*`; include its canonical QA strategy there: automation decision, level, priority, rationale, dependencies and implementation status. QA and publication views reuse these fields and must not invent or recalculate a parallel decision. Every approved criterion must own or explicitly reference at least one `SC-*`.

### Question Classification

Classify every unanswered question:

- **Blocking now:** the current phase cannot produce a valid result without an answer
- **Important but not blocking:** continue with confirmed information and keep the question visible
- **Needed later:** defer until the relevant phase
- **Already answered:** do not ask again

Never convert a question into an assumed business rule. Offer an explicit best-effort path only when the user chooses it.

## Conversation Modes

If the user already indicates a preference, use it. Otherwise briefly offer these numbered options:

1. **Guided:** ask small groups of questions, explain why they matter, and pause at every decision gate
2. **Fast draft:** generate a provisional end-to-end draft and stop only for blocking decisions
3. **Review existing work:** audit supplied maps, stories, criteria, or tests and continue from the first weak or missing phase
4. **Continue from a phase:** begin at mapping, splitting, stories, or test cases using approved earlier artifacts

Recommend Guided for a new or poorly understood project. Do not repeatedly ask for the mode once selected.

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
7. Keep `00-workflow-state.md` current after every approved gate so the workflow can resume without rereading the full conversation.
8. Keep project status separate from delivery status; one completed delivery does not complete the project.
9. Generate Jira and role-specific views from approved source artifacts, never as competing sources of truth.
10. Keep atomic checks in `06-test-coverage.md` and QA-reviewable functional scenarios in `07-functional-test-cases.md`.
11. Do not generate `.testcase.yml`, `.testplan.yml`, `.testrun.yml`, TestManager keys, UUIDs, or execution results; prepare a handoff for the repository that owns them.

Read `references/markdown-package.md` before creating or updating the package.

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

## Application

### Phase 0: Choose the Starting Point

Inspect the supplied material and determine whether the work begins with discovery, mapping, splitting, story writing, or test design. Do not force completed work through earlier phases again.

State:

- Selected mode
- Starting phase
- Information already available
- Immediate objective
- Markdown project name and approved output location
- Artifact language, audiences, destination, detail level, and sizing convention

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

Ask PM/PO, QA, and engineering to review from their perspectives. If the current user represents only one role, clearly list which confirmations remain with other owners.

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

Write acceptance criteria in product language before technical language. A reader must understand the actor, action, outcome, validation and consequence without knowing internal object names or architecture. Put required terms such as `Subscription`, `Commitment`, Agreements, events, idempotency or correlation IDs in a separate `Consideración técnica` or `Evidencia técnica` line. Do not use compressed shorthand such as `Draft+Commitment`, `Payments→Canceled`, `preview=cronograma`, “no deja parcial”, or slash-separated outcomes.

### Phase 4: Design Test Coverage

Use `test-case-designer` on approved stories and criteria. Produce:

- Testability audit
- Risk-based coverage matrix
- Atomic coverage checks (`CHK-*`) that prevent rules from being forgotten
- Canonical scenarios (`SC-*`) owned by criteria and grouped into functional cases (`FTC-*`) by feature or primary action
- Scenario-level automation decisions with rationale, priority, level, dependencies, and implementation status
- Rules-to-tests coverage table
- Remaining questions and risk

Before writing functional cases, cluster checks by primary business behavior. Create a separate scenario only when the flow, precondition, trigger, primary rule, or user-visible outcome changes materially. Otherwise add the check as another expected result in the same scenario.

Do not compress a workflow walkthrough into one scenario by listing several actions in one `When` or several unrelated outcomes in one `Then`. If a case covers selection, navigation, saving, validation and recovery, render each as a distinct `SC-*` product scenario and group them under the same `FTC-*` when appropriate. Use natural nouns such as “empleado”, “miembro”, “membresía”, “pago” and “plan”; explain test fixtures and internal records only in Preconditions, Data or Evidence.

Read `references/qa-design-handoff.md`. Treat `CHK-*` as coverage units, not executable files. Treat `FTC-*` as QA review units, not TestManager keys. Reuse the exact `SC-*` IDs and approved behavior from the criteria; add QA metadata without creating parallel scenarios.

Apply the `test-case-designer` executability gate before Gate 4 approval. Do not call a scenario QA-ready merely because Given/When/Then headings exist.

Keep scenario executability and automation separate. For every `SC-*`, record `Automate`, `Manual`, `Later`, or `To define`; include the reason, priority, lowest useful level, dependencies, and `Not started`, `Planned`, or `Implemented` coverage status. Never report execution results in this workflow.

#### Gate 4: Review Coverage

Present high-risk coverage, blocked cases, intentionally omitted combinations, and remaining risk. Ask whether the user wants to approve, revise, expand to regression, or prepare the artifacts for another system.

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

Run `scripts/validate-package.py <artifact-folder> --language <code> --strict` and fix errors. Strict validation checks ID ranges, Gherkin clarity, Jira/master parity, readiness, check-to-scenario traceability, and the functional-case schema. Return a concise handoff containing completed artifacts, decisions, open questions, owners, and the recommended next action.

### Phase 6: Choose Final Presentations

After Phase 5 succeeds, confirm that the canonical Markdown package is complete. Then open **Gate 5: Publication and export** and ask what additional presentation the user wants:

1. Portal HTML local
2. Documento Word
3. Página o estructura de Notion
4. Varias de las anteriores
5. Ninguna; finalizar con Markdown

Do not imply that one optional presentation is required. If the user already selected a format, execute it without asking again.

Route each selected output:

- **Portal:** use `build-refinement-portal`; generate a self-contained local HTML, recommended as `10-refinement-portal.html` when available.
- **Word:** use `build-refinement-document`; generate and visually verify a `.docx`, choosing the next free numbered filename.
- **Notion:** use `publish-refinement-to-notion`; confirm workspace and destination, publish only with authorization, then verify by reading the result.

Generate every presentation from approved Markdown, never from another derived presentation. A user may select several formats; produce them independently so HTML, Word and Notion cannot silently drift through chained conversion.

For external publication, preserve safety:

- Notion: create a private page by default when no destination is specified; do not edit the PRD original.
- Hosted portal: offer private hosting only after validating the local HTML; require informed confirmation before public hosting.
- Word: do not deliver internal render PNGs unless requested.

Update `00-workflow-state.md` and `09-package-index.md` with every selected format, local path or URL, generation date, scope and status. Record declined outputs as `Not requested`, not as missing work. Do not mark the project incomplete because the user declines optional presentations.

## State and Resumption

At each gate, maintain a compact state summary:

```markdown
## Workflow State
- Mode:
- Current phase:
- Approved through:
- Confirmed rules:
- Open blocking questions:
- Selected scope:
- Next action:
- Markdown package path:
- Artifact language/audiences:
- Optional presentations selected:
- Presentation paths or URLs:
- Project status and delivery statuses:
```

When the user returns later, continue from this state instead of restarting. If source material changed, identify what downstream artifacts may now be stale.

## Examples

### Guided Membership Opening

User:

> We need individual, family, and gift membership purchases online.

Good response:

> I recommend Guided mode because several flows share a checkout but differ in membership ownership and communication rules. I understand that all three are online purchases. To map them correctly:
>
> 1. Can each type be purchased as a guest, after login, or both?
> 2. For an individual membership, is the buyer always the holder?
> 3. Which flow should provide the first usable release?
>
> If an answer is not decided, say “unknown”; I will record it rather than invent a rule.

Why this works: it acknowledges known information, asks only three related questions, explains how to handle unknowns, and does not jump directly to stories.

### Continue From Existing Stories

User:

> These stories are already approved. Create the test coverage.

Good behavior:

1. Start at Phase 4.
2. Audit whether the stories contain enough confirmed behavior.
3. Ask only blocking questions.
4. Do not remap or rewrite approved stories unless a coverage gap reveals a contradiction.

## Common Pitfalls

### Pitfall 1: Questionnaire Dump

**Symptom:** Ask twenty questions covering every possible phase.

**Consequence:** The user cannot tell what matters now and abandons the workflow.

**Fix:** Ask one to three related questions based on the current phase and previous answer.

### Pitfall 2: Generating Everything Before Confirmation

**Symptom:** Produce a map, backlog, criteria, and tests from a short paragraph.

**Consequence:** Polished output hides invented rules and expensive rework.

**Fix:** Use decision gates and keep provisional work clearly labeled.

### Pitfall 3: Repeating Questions

**Symptom:** Ask for information already present in notes or earlier answers.

**Consequence:** The workflow feels mechanical and loses trust.

**Fix:** Maintain workflow state and treat supplied context as answered.

### Pitfall 4: Technical Questions to the Wrong Person

**Symptom:** Ask a business stakeholder to design retry architecture or a developer to choose an unconfirmed membership policy.

**Consequence:** The wrong role accidentally defines behavior.

**Fix:** Route decisions to the appropriate owner and explain the user-visible consequence in plain language.

### Pitfall 5: Orchestrator Replaces Specialist Skills

**Symptom:** Reimplement simplified mapping, splitting, stories, and tests inside this file.

**Consequence:** Methods drift and improvements to specialist skills are ignored.

**Fix:** Read and apply the relevant local skill at each phase; keep this skill focused on sequence, interaction, state, and gates.

### Pitfall 6: Approval Becomes Bureaucracy

**Symptom:** Stop after every small detail or require all roles to be present synchronously.

**Consequence:** The workflow slows work without reducing meaningful risk.

**Fix:** Gate only decisions that materially affect product behavior, scope, or test validity. Record missing owners for asynchronous confirmation.

## References

- `references/interaction-protocol.md` — How to ask, adapt, pause, and resume
- `references/artifact-contract.md` — Required handoff and traceability between phases
- `references/markdown-package.md` — File structure, statuses, and update rules
- `references/rule-governance.md` — Sources, authority, contradictions, and rule consolidation
- `references/readiness-and-approvals.md` — Backlog states, role readiness, and block approvals
- `references/qa-design-handoff.md` — Boundary between QA design and downstream TestManager artifacts
- `skills/user-story-mapping/SKILL.md` — Journey, rules, variations, and release slices
- `skills/user-story-splitting/SKILL.md` — Vertical decomposition and sequencing
- `skills/user-story/SKILL.md` — User stories and acceptance criteria
- `skills/test-case-designer/SKILL.md` — Risk-based coverage and test cases
- `skills/build-refinement-portal/SKILL.md` — Optional final portal generation from approved artifacts
- `skills/build-refinement-document/SKILL.md` — Optional Word document generation and visual verification
- `skills/publish-refinement-to-notion/SKILL.md` — Optional native Notion publication or local export fallback

### Outside This Orchestrator's Scope

- `skills/idea-to-ship/SKILL.md` — The router above this one: decides whether an initiative should even be here yet (the Define/Shape stage), or belongs at an earlier/later stage. If a user arrives unsure where to start, point them there first.
- `skills/prd-writer/SKILL.md`, `skills/product-spec-agent/SKILL.md`, `skills/mini-spec-writer/SKILL.md` — Upstream: produce the spec, PRD, or approved feature scope this orchestrator's Phase 0 expects as input. Do not re-litigate business-case or bet decisions already made there.
- `skills/jira-story-publisher/SKILL.md` — Downstream: the only skill that actually creates a Jira issue from an approved story; this orchestrator's `jira/US-[ID].md` files are previews, not live tickets.
- `skills/weekly-product-pulse/SKILL.md` — Downstream: reports on stories once they're filed in Jira and enter the team's tracked workflow.
- `skills/artifact-sync/SKILL.md` — Downstream: propagates a changed decision back into already-published Jira/Notion/design artifacts after this package has been approved and published.
