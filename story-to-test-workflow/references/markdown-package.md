# Markdown Project Package

## Folder Selection

Ask for or propose the output location before writing. Use a lowercase kebab-case project folder such as `online-membership-purchase`. Do not create files in an unrelated product repository without confirmation.

Record Artifact language, Audience, Destination, Detail level, and Sizing convention in `00-workflow-state.md`.

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

Markdown defines the package structure. For Notion-connected teamwork, mirror every
included Markdown file as one native page and preserve relative directories through
container pages. Verified Notion pages are the shared official copy; the local folder is a
snapshot-bound checkout with the same paths.

Treat numbered project documents as canonical unless the workflow contract marks one
otherwise. Treat `jira/*.md` and `handoffs/*.md` as generated views: publish them for
consumers, but regenerate them from canonical units and do not accept independent edits as
new product truth.

Record the Notion root, page manifest, loaded snapshot and synchronized snapshot in
`00-workflow-state.md` and `09-package-index.md`. Use
`publish-refinement-to-notion` for initial creation and
`sync-refinement-package-notion` thereafter. Preserve historical storage links only as
evidence; they do not participate in the active workflow.

## Shared packages

Keep cross-project contracts under `artifacts/_shared/<slug>/`. Do not move a shared
contract into the owner's local project folder merely because its Notion presentation is
owned by that project.

For a feature-owned contract, publish its visible page inside the canonical Notion page of
the owner feature. Under that page, maintain a `Paquete Markdown` mirror for the shared
package and register it independently from the owner's main refinement package. Consumer
projects link to the readable shared-contract page.

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

Run `python3 skills/story-to-test-workflow/scripts/validate-package.py artifacts/<project> --language <code>` and fix errors before handoff. Explain any accepted warnings.

After deterministic validation, run `refinement-judge` and add `11-refinement-judge-report.md`. Link that report from `09-package-index.md` and show its verdict, reviewed snapshot and blocked/allowed next action. The report is an audit record; it does not replace the product artifacts or silently correct them.

## Project Versus Delivery Status

Always show project and delivery status separately. Never describe the project as complete merely because one selected delivery passed Gate 4.
