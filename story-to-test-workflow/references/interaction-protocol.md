# Interaction Protocol

## Required Guided Loop

In Guided mode, repeat this loop until the current decision gate is ready:

1. Summarize only the confirmed context relevant to the current phase.
2. Ask one to three related questions required for the next decision.
3. Stop and wait for the user's answer; do not simulate or infer the response.
4. Interpret the answer and briefly confirm any material rule, correction, or scope change.
5. Update workflow state and ask the next small group only if the gate still needs information.
6. Present the decision gate and wait for approval before creating downstream artifacts.

Never ask questions for later phases merely because they are foreseeable. Never generate all deliverables while a current-phase material decision remains unconfirmed.

If the host agent cannot technically pause mid-execution, end the response after the current questions. Continue from the saved state in the next turn.

## Ask Adaptively

Before asking a question:

1. Check whether the answer is already present.
2. Decide whether it is needed in the current phase.
3. Explain the consequence only when it helps the user answer.
4. Ask no more than three related questions together.
5. Maintain the confirmed artifact language unless the user changes it.

## Handle Answers

- **Confirmed answer:** add or update the related rule and source.
- **Correction:** show what changed and identify affected downstream work.
- **Unknown:** record the question, owner, and whether it blocks the current phase.
- **Partial answer:** keep the confirmed portion and ask only the unresolved part when needed.
- **Contradiction:** present both statements neutrally and request an owner decision.

## Decision Gate Format

```markdown
## Decision Gate — [Name]

### What is confirmed
- [Decision or rule]

### What remains open
- [Question] — Owner: [role] — Blocking: Yes/No

### Recommendation
- [Recommended next action and reason]

### Choose
1. Approve and continue
2. Correct or revise
3. Continue only with confirmed information
4. Stop here for team review
```

Tailor the choices. Do not show irrelevant options.

## Guided Versus Fast

- **Guided:** use the Required Guided Loop, explain the purpose of each question when useful, wait between rounds, and show each gate.
- **Fast draft:** infer structure, never business rules; group non-blocking questions in the provisional output.
- **Review:** preserve approved artifacts and report defects before rewriting.
- **Continue:** load current state and begin at the requested phase.

## Pause and Resume

End a paused phase with the compact workflow state from `SKILL.md`. On resumption, restate only the current phase, approved boundary, blocking questions, and next action.

## Approval States

Track ownership with: Proposed by AI, Product confirmed, Engineering review needed, QA review needed, or Blocked. An artifact may be approved while containing visibly pending engineering or QA confirmations.

## Change-Only Gate Previews

After the first gate, show changes since the previous approval, affected IDs, new questions, and the required decision. Link to unchanged approved material instead of repeating it.
