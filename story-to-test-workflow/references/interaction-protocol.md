# Interaction Protocol

## Required Guided Loop

Use this loop for every route until the current decision gate is ready:

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

1. Check the confirmed sources relevant to the current decision: the package, supplied
   spec, approved decisions and any directly affected code, prototype or related package.
2. Decide whether it is needed in the current phase.
3. Explain the consequence only when it helps the user answer.
4. Ask no more than three related questions together.
5. Maintain the confirmed artifact language unless the user changes it.

Do not perform a broad repository, Notion or cross-project audit merely to ask an ordinary
question. Research enough to avoid asking for information already available, and cite the
evidence actually used. If a required source is unavailable, state that limitation instead
of implying it was checked.

## Format for material product decisions

Handle one decision topic per round. It may contain up to three tightly related
subquestions when they share the same context and can be decided together.

For a material ambiguity, contradiction or gap, provide:

1. **Context:** what was found, with the relevant file/page and ID.
2. **Practical example:** a concrete user situation when it materially clarifies the
   consequence; use names, amounts or dates only when relevant.
3. **Options:** distinct choices when genuine alternatives exist.
4. **Recommendation:** the preferred choice and its evidence-based reason.

Do not force multiple-choice options for a factual confirmation, and do not split one
cohesive decision into several rounds merely to ask one sentence at a time.

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

## Route Confirmation

For a new workflow, infer the route; if it is materially ambiguous, ask one short route-level
clarification first. Explain the recommendation in one or two sentences and ask whether the
interpretation is correct. Do not begin discovery questions, assign IDs or write artifacts
until the user confirms. Show the route list only when asked or when the user rejects the
recommendation. When resuming a recorded route, continue without another confirmation
unless the new request changes the nature of the work.

## Fast Draft Exception

Use a fast draft only when explicitly requested. Infer structure but never business rules,
mark the output provisional and group non-blocking questions visibly. A fast draft does not
skip the guided review, Decision Capture, gates, strict validation or Judge required before
approval, handoff or publication.

## Pause and Resume

End a paused phase with the compact workflow state from `SKILL.md`. On resumption, restate only the current phase, approved boundary, blocking questions, and next action.

During a long external publication, report compact progress by project and item/page state. Do
not ask the user to choose routine retry, patch fallback, local validation, cache reuse or
receipt-generation steps; resolve them under the specialist contract. Pause only for a new
product decision, changed remote scope, concurrent edit or exact external write approval.

## Approval States

Track ownership with: Proposed by AI, Product confirmed, Engineering review needed, QA review needed, or Blocked. An artifact may be approved while containing visibly pending engineering or QA confirmations.

## Change-Only Gate Previews

After the first gate, show changes since the previous approval, affected IDs, new questions, and the required decision. Link to unchanged approved material instead of repeating it.

## Evidence Before Approval

When approval changes wording, hierarchy, links or presentation, show the exact before and
after plus the visible structural effect. A summary alone is insufficient when the user must
choose between alternatives. Keep rejected candidates or mark their bytes as unavailable;
never reuse an unexplained hash from a discarded candidate.

## Efficient Authorization

- Group related, reversible local updates in one exact plan and one validation result.
- Keep local adoption separate from external writes.
- Once an external dossier is exact and validated, ask directly for authorization to execute
  it. Do not ask for approval merely to prepare another authorization request.
- Reuse an authorization while scope, payloads, remote metadata and digest remain unchanged.
  A write, rollback, concurrent remote change or digest change consumes it and requires a new
  exact authorization.
