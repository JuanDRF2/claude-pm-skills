# User Story Splitting Template

Use this template to split a large story into smaller, independently deliverable user stories.

## Provenance
Adapted from `prompts/user-story-splitting-prompt-template.md` in the `https://github.com/deanpeters/product-manager-prompts` repo.

## Splitting Logic (Evaluate All, Then Select)
1. Workflow steps
2. Business rule variations
3. Data variations
4. Acceptance criteria complexity (multiple When/Then pairs)
5. Major effort milestones
6. External dependencies
7. DevOps steps
8. Tiny Acts of Discovery (TADs) if none apply

## Output Template
```markdown
### Original Story
[Story written using `skills/user-story/template.md`]

### Suggested Splits
| Candidate | Reason for this split | User outcome | Rules retained | Deferred scope | Dependencies | Risk reduced | Work type |
|---|---|---|---|---|---|---|---|
| 1 | [Plain-language reason and formal pattern] | [Outcome] | BR-01 | [Scope] | [Dependency] | [Risk] | User story/Technical prerequisite/Discovery experiment |

### Recommended Sequence
1. [First thin end-to-end slice and why]
2. [Next variation or risk]

### Coverage Check
- Original rules covered: [IDs]
- Original rules deferred: [IDs and target]
- Questions blocking a valid split: [IDs]
```

## Notes
- Each story should deliver user value. Label non-user work clearly as a technical prerequisite (enabler) or discovery experiment (TAD).
- Prefer a thin end-to-end journey over isolated form or technical steps.
- If no rule applies, propose TADs to de-risk and clarify before writing stories.
