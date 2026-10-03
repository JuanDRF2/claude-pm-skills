# Markdown Project Package

## Folder Selection

Ask for or propose the output location before writing. Use a lowercase kebab-case project folder such as `online-membership-purchase`. Do not create files in an unrelated product repository without confirmation.

Record Artifact language, Audience, Destination, Detail level, and Sizing convention in `00-workflow-state.md`.
For a new complete project, also record `project-context-v1`. Adopt it in an existing
package only when Gate 1 is materially revised; use `project-context-contract.md`.

## Package Structure

A recommended structure is:

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

## Writing Rules

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

## Local Routing

When creating or migrating local work, route it before writing:

- canonical project package → `artifacts/<project-slug>/`;
- authoritative cross-project contract → `artifacts/_shared/<shared-package-slug>/`;
- audit, review or historical delta → `artifacts/_reviews/<review-group>/`;
- executable generator or publication helper → `artifacts/_local/tooling/<tool-group>/`.

Do not create new loose files directly under `artifacts/`. Read
`references/local-organization-contract.md` before reorganizing files. Local normalization
must not modify Notion.

## Standard Header

Start every generated file with:

```markdown
# [Document title]

- Project: [Project name]
- Status: Draft | Approved | Needs decision | Superseded
- Last updated: [YYYY-MM-DD]
- Approved through: [Decision gate or Not approved]
```

Do not claim a person approved an artifact unless that approval occurred in the conversation or was present in a trusted source.

## Links

Use relative links between documents:

```markdown
- Related rules: [BR-01, BR-02](./02-rules-and-questions.md)
- Stories: [US-MEM-01](./05-user-stories.md)
- Coverage: [CHK-MEM-001](./06-test-coverage.md)
- Functional case: [FTC-MEM-01](./07-functional-test-cases.md)
```

Keep stable IDs in headings so text search remains useful.

## Shared storage

Markdown defines the package structure. In a registered GitHub repository, the configured
canonical branch is the shared documentary source of truth. A local branch or Pull Request
contains proposed changes until merged. Record repository, branch and observed commit in
workflow state; use `github-source-of-truth-contract.md` for checkout and release behavior.

Treat numbered project documents as canonical unless the workflow contract marks one
otherwise. Treat `jira/*.md` and `handoffs/*.md` as generated views: publish them for
consumers, but regenerate them from canonical units and do not accept independent edits as
new product truth.

When Product Taxonomy applies, keep the versioned cross-reference at
`integrations/taxonomy-mapping.md`. It is optional for packages with no declared Taxonomy
scope and must not be created as an empty placeholder. Read the mapping contract through
`sync-refinement-package-taxonomy`; do not duplicate Taxonomy hierarchy throughout stories
or treat its remote codes as package-owned identifiers.

Notion is optional. When requested, publish each registered Markdown as one native page. A
manifest and baseline relate the GitHub-derived checkout to stable Notion page IDs and
verified hashes. Human pages are derived presentations; they do not replace the canonical
numbered documents. Use `publish-refinement-to-notion` for initial creation and
`sync-refinement-package-notion` thereafter, always from the merged commit unless the user
explicitly requests a labeled preview.

## Shared packages

Keep cross-project contracts under `artifacts/_shared/<slug>/`. Do not move a shared
contract into the owner's local project folder merely because its Notion presentation is
owned by that project.

For a feature-owned contract, keep its Markdown under `_shared/` and record its owner and
consumers. If a Notion view is requested, publish it inside the owner feature's page and
register a separate manifest and baseline. Consumers link to the canonical Markdown and may
also expose the readable derived page.

For a global standard without a feature owner, require a confirmed shared-standards hub.
Never reuse a prior project's destination as the default.

## Updating Existing Files

1. Read the current file completely.
2. Preserve sections and edits outside the approved change.
3. Update affected links when an ID is superseded.
4. Record important scope or rule changes in a short Decision History section.
5. Avoid duplicating the same authoritative rule in multiple files; link to `02-rules-and-questions.md` instead.

When prototypes, HTML, designs or generated SPECs exist, keep their source-role inventory
and material delta ledger in `02-rules-and-questions.md`. Use
`10-design-and-spec-deltas.md` only when the expanded ledger would make `02` difficult to
review; link both directions and keep one definition per `DELTA-*`.

## Draft Handling

Default behavior is to preview drafts in the conversation and save approved work. If the user requests draft files:

- Mark `Status: Draft`.
- State which questions remain open.
- Do not let downstream files present draft rules as approved.

## Completion Check

Before handoff, confirm that every expected file is either present or explicitly marked Not applicable. Report paths and statuses, not merely that “documentation was generated.”

For packages declaring `project-context-v1`, confirm the semantic sections and cross-file
consistency of `01-project-understanding.md` and `03-story-map.md`. Existence alone is not
completion; a blank template, feature list or implementation inventory does not satisfy
the contract.

Run `python3 skills/story-to-test-workflow/scripts/validate-package.py artifacts/<project> --language <code>` and fix errors before handoff. For a registered shared contract, pass `--package-kind shared-contract`; never use that mode to bypass the complete-project contract. Explain any accepted warnings.

After deterministic validation, run `refinement-judge` and add `11-refinement-judge-report.md`. Link that report from `09-package-index.md` and show its verdict, reviewed snapshot and blocked/allowed next action. The report is an audit record; it does not replace the product artifacts or silently correct them.

## Project Versus Delivery Status

Always show project and delivery status separately. Never describe the project as complete merely because one selected delivery passed Gate 4.
