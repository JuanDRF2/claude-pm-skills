# Workflow Examples and Pitfalls

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

### Pitfall 6: Specialist Is Named but Not Invoked

**Symptom:** Claim to follow the Notion, Judge or test-design skill while using a custom process.

**Consequence:** The result looks plausible but bypasses contracts, verification and current specialist improvements.

**Fix:** Apply `specialist-dispatch-contract.md`; resolve the exact skill through the host mechanism and stop when it or a required capability is unavailable.

### Pitfall 7: Approval Becomes Bureaucracy

**Symptom:** Stop after every small detail or require all roles to be present synchronously.

**Consequence:** The workflow slows work without reducing meaningful risk.

**Fix:** Gate only decisions that materially affect product behavior, scope, or test validity. Record missing owners for asynchronous confirmation.
