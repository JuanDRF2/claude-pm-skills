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

## Updating Existing Files

1. Read the current file completely.
2. Preserve sections and edits outside the approved change.
3. Update affected links when an ID is superseded.
4. Record important scope or rule changes in a short Decision History section.
5. Avoid duplicating the same authoritative rule in multiple files; link to `02-rules-and-questions.md` instead.

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
