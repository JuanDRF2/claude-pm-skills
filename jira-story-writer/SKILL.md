---
name: jira-story-writer
description: Transforms a mini spec or feature description into a set of well-formatted Jira user stories with Gherkin acceptance criteria.
---

# Skill: Jira Story Writer

## What It Does

Transforms a mini spec or feature description into a set of well-formatted Jira user stories with Gherkin acceptance criteria. Each story is sized, labeled, and ready to be copied directly into Jira.

---

## When to Use It

- You have a completed mini spec and need to break it into sprint-ready stories
- You need consistent story format across a team or multiple squads
- You want to ensure acceptance criteria are testable and unambiguous
- You're preparing a backlog grooming session and need stories fast

---

## How It Works

**Input:** A mini spec (or any feature description with functional requirements)

**Process:**
1. Identifies logical story boundaries from functional requirements
2. Writes each story in standard "As a / I want / So that" format
3. Generates Gherkin (Given/When/Then) acceptance criteria for each story
4. Assigns story type (Feature, Bug, Task, Spike)
5. Suggests story points based on complexity signals
6. Adds relevant labels and epic link placeholder

**Output:** A set of Jira-ready stories in markdown

---

## Output Format Per Story

```markdown
## Story: [Story Title]

**Type:** Feature | Bug | Task | Spike
**Epic:** [Epic name or placeholder]
**Labels:** [label-1, label-2]
**Story Points:** [1 | 2 | 3 | 5 | 8 | 13]
**Priority:** High | Medium | Low

### User Story
As a [user role],
I want to [action],
So that [benefit/value].

### Acceptance Criteria

**Scenario 1: [Happy path name]**
```gherkin
Given [initial context]
When [user action]
Then [expected outcome]
And [additional outcome]
```

**Scenario 2: [Edge case name]**
```gherkin
Given [initial context]
When [user action]
Then [expected outcome]
```

### Out of Scope
- [What this story explicitly does NOT cover]

### Dependencies
- [Upstream story or system dependency]

### Notes
- [Any implementation hints or context for engineering]
```

---

## Example Workflow

1. PM completes mini spec for "Event Duplication" feature
2. PM runs `/jira-story-writer` and pastes the spec
3. Claude breaks it into 4 stories: UI entry point, duplication logic, date adjustment, confirmation flow
4. PM reviews point estimates and adjusts based on team velocity
5. PM copies stories into Jira and assigns to sprint

---

## Story Sizing Guide Used

| Points | Complexity |
|---|---|
| 1 | Trivial change, no logic |
| 2 | Simple, well-understood |
| 3 | Moderate complexity |
| 5 | Multiple components involved |
| 8 | High complexity, some unknowns |
| 13 | Very high — consider splitting |

---

## Technical Implementation

This skill instructs Claude to:

1. Read functional requirements from the input spec
2. Apply one-story-per-requirement as a baseline, then merge where appropriate
3. Write acceptance criteria that are testable by QA (observable system behavior)
4. Never write acceptance criteria that test implementation details (e.g., "the database should…")
5. Flag stories over 8 points as candidates for splitting

**Guardrails:**
- Each story must be independently deployable where possible
- Acceptance criteria must describe user-observable behavior, not technical internals
- Stories must have explicit out-of-scope sections to prevent gold-plating
- Never add stories not implied by the input spec

---

## Tips for Best Results

- Run Mini Spec Writer first — the cleaner your spec, the better the stories
- Include any known technical constraints in the spec
- Mention your team's velocity if you want more accurate point suggestions
- Label conventions can be added to the input (e.g., "our labels are: frontend, backend, integration")
