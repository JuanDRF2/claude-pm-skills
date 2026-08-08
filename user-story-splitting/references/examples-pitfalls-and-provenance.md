# Story Splitting Examples, Pitfalls, and Provenance

## Contents

- Running membership example
- Additional splitting example
- Seven common pitfalls and fixes
- Related skills, frameworks, and provenance

### Running Membership Example

Input from the map:

```text
US-MEM-01 — Guest buys an individual membership end to end.
BR-01 — Buyer is the holder.
BR-02 — One approved purchase creates one payment and one membership.
BR-03 — Rejection creates no membership.
```

Keep the first story end to end because selection, buyer information, payment, membership creation, and confirmation jointly produce the useful result. If it exceeds the team's sizing ceiling, simplify supported variations first; do not create disconnected stories for each form screen.

---

## Examples

See `examples/sample.md` for full splitting examples.

Mini example excerpt:

```markdown
### Original Story:
As a team admin, I want to manage team members so that I can control access.

### Suggested Splits (Acceptance Criteria Complexity):
1. Invite new team members
2. Remove team members
3. Update team member roles
```

---

## Common Pitfalls

### Pitfall 1: Horizontal Slicing (Technical Layers)
**Symptom:** "Story 1: Build the API. Story 2: Build the UI."

**Consequence:** Neither story delivers user value independently.

**Fix:** Split vertically—each story should include front-end + back-end work to deliver a complete user-facing capability.

---

### Pitfall 2: Over-Splitting
**Symptom:** "Story 1: Add button. Story 2: Wire button to API. Story 3: Display result."

**Consequence:** Creates unnecessary overhead and dependencies.

**Fix:** Only split when the story is too large. A 2-day story doesn't need splitting.

---

### Pitfall 3: Meaningless Splits
**Symptom:** "Story 1: First half of feature. Story 2: Second half of feature."

**Consequence:** Arbitrary splits that don't map to user value or workflow.

**Fix:** Use one of the 8 splitting patterns—each split should have a clear rationale.

---

### Pitfall 4: Creating Hard Dependencies
**Symptom:** "Story 2 can't start until Story 1 is 100% done, tested, and deployed."

**Consequence:** No parallelization, slows delivery.

**Fix:** Split in a way that allows independent development. If dependencies are unavoidable, prioritize Story 1.

---

### Pitfall 5: Ignoring the "So That"
**Symptom:** Split stories have the same "so that" statement.

**Consequence:** You've split the action but not the outcome—likely a task decomposition, not a story split.

**Fix:** Ensure each split has a distinct user outcome. If not, reconsider the split pattern.

---

### Pitfall 6: Splitting a Workflow into Non-Valuable Form Steps
**Symptom:** Separate stories for entering buyer data, entering payment, and viewing confirmation, none usable as a completed outcome.

**Consequence:** The backlog reports progress without producing a releasable or credible end-to-end result.

**Fix:** Prefer a thin complete journey first, then split by rule variation, exception, scale, or sophistication.

---

### Pitfall 7: Hiding Dependencies to Pass INVEST
**Symptom:** The split is called independent although it relies on an unfinished service, migration, or policy decision.

**Consequence:** Planning and testing assumptions become unreliable.

**Fix:** Keep dependencies visible, sequence them deliberately, and distinguish stories from enablers and discovery work.

---

## References

### Related Skills
- `skills/user-story/SKILL.md` — Format for writing the split stories

### External Frameworks
- Richard Lawrence & Peter Green, *The Humanizing Work Guide to Splitting User Stories* — Origin of the 8 splitting patterns
- Bill Wake, *INVEST in Good Stories* (2003) — Criteria for well-formed stories (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Mike Cohn, *User Stories Applied* (2004) — Story decomposition techniques

### Dean's Work
- User Story Splitting Prompt Template (based on Humanizing Work framework)

### Provenance
- Adapted from `prompts/user-story-splitting-prompt-template.md` in the `https://github.com/deanpeters/product-manager-prompts` repo.

---

**Skill type:** Component
**Suggested filename:** `user-story-splitting.md`
**Suggested placement:** `/skills/components/`
**Dependencies:** References `skills/user-story/SKILL.md`
**Applies to:** User stories, epics, and any work that's too large to complete in a single sprint
