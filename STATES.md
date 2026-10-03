# Shared states and gate names

Skills in this library describe where a piece of work stands in their own words. That is fine inside a skill and
confusing at a hand-off. This file is the **crosswalk**: translate at the boundary, do not rename inside a skill
(some validators depend on the original words).

## 1. One lifecycle for any artifact

`draft` → `in_review` → `approved` → `published` → (`superseded` or `rolled_back`), with `blocked` reachable from
anywhere.

| Shared state | user-story, story-to-test-workflow (item approval) | release-notes-writer (Status) | sync-refinement-package-taxonomy (mapping) | refinement-judge (verdict) | signal-to-ship (delivery tracking) |
|---|---|---|---|---|---|
| `draft` | Proposed by AI | Draft | Draft | | draft |
| `in_review` | Engineering review needed; QA review needed | | | | |
| `approved` | Product confirmed | En Progreso (approved, being communicated) | Verified | PASS; PASS WITH OBSERVATIONS (with open findings) | reviewed |
| `published` | | Comunicado | | | published |
| `superseded` | | | Stale | | |
| `rolled_back` | | | | | rollback_sent |
| `blocked` | Blocked | | Blocked | FAIL | |

Two rules at every hand-off:

- A human sets `approved`. An assistant never moves an item from `draft` to `approved` to let work advance.
- When a state has no equivalent in the receiving skill, carry the original word in a note instead of guessing.

## 2. Gate names

Several skills number their gates. An unqualified "Gate 3" is ambiguous, so **always name the workflow**:
"signal-to-ship Gate 3", "refinement gate 3" (story-to-test-workflow), "the Define to Build gate" (idea-to-ship).

| Workflow | Gates | What they mean |
|---|---|---|
| signal-to-ship | 0 to 7 | initiative type, signals, prioritization, specification, prototype, refinement, delivery, measurement |
| story-to-test-workflow | refinement gates 1 to 5 | understanding, stories, acceptance criteria and test design, review, optional publication |
| idea-to-ship | Define to Build, Build to Verify, Verify to Ship | stage changes of one initiative |

A gate that closes in an inner workflow is **input** to the outer one, not the same event: refinement gate 4 passing
does not close signal-to-ship Gate 5 by itself; the outer workflow reads the Judge verdict and the human approvals.

## 3. Gate and status words that are not lifecycle states

`partial` and `provisional` (signal-to-ship) mean a gate is open with a written reason. `Automate now`, `Automate
later`, `Manual` and `Blocked` (test-case-designer) classify test automation, not approval. Do not map them to the
lifecycle above.
