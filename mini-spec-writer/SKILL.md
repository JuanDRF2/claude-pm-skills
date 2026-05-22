# Skill: Mini Spec Writer

## What It Does

Converts a raw product idea, feature request, or Slack message into a structured, implementation-ready mini specification. The output follows a consistent format that engineering, design, and QA teams can immediately act on.

---

## When to Use It

- You have a product idea or stakeholder request that needs to be formalized
- You need to quickly turn a verbal discussion into a written spec
- You want a first draft spec before a discovery meeting
- You need to scope a feature fast without starting from a blank page

---

## How It Works

**Input:** A plain-language description of a feature or problem (can be rough, bullet points, or even copied from Slack)

**Process:**
1. Extracts the core problem being solved
2. Identifies the target user and their goal
3. Defines scope (in/out of scope)
4. Lists functional requirements
5. Surfaces open questions and assumptions
6. Identifies dependencies and risks

**Output:** A structured markdown document ready for team review

---

## Output Format

```markdown
# Mini Spec: [Feature Name]

## Problem Statement
[1-2 sentences describing the user problem]

## Target User
[Who this is for and their context]

## Goal
[What success looks like]

## Scope
### In Scope
- [Item 1]
- [Item 2]

### Out of Scope
- [Item 1]

## Functional Requirements
### FR-01: [Requirement name]
[Description]

### FR-02: [Requirement name]
[Description]

## Open Questions
- [ ] [Question 1]
- [ ] [Question 2]

## Assumptions
- [Assumption 1]
- [Assumption 2]

## Dependencies
- [System or team dependency]

## Risks
- [Risk and mitigation]

## Success Metrics
- [Metric 1]
- [Metric 2]
```

---

## Example Workflow

1. PM receives stakeholder request: *"We need a way for event managers to duplicate past events"*
2. PM runs `/mini-spec-writer` and pastes the request
3. Claude produces a structured mini spec in ~30 seconds
4. PM reviews, fills in open questions, and shares with engineering
5. Engineering can immediately estimate from the spec

---

## Technical Implementation

This skill is invoked as a Claude Code slash command. The skill definition in this file instructs Claude to:

1. Parse any free-form input (text, bullets, copied messages)
2. Apply the output format template above
3. Infer reasonable assumptions from the context
4. Flag ambiguous requirements as open questions rather than guessing
5. Keep scope tight — default to the smallest viable implementation

**Guardrails:**
- Never invent requirements not implied by the input
- Always surface ambiguity as open questions
- Keep out-of-scope section explicit to prevent scope creep
- Flag dependencies on external systems or teams

---

## Tips for Best Results

- The messier your input, the more value the skill adds
- Include any known constraints (deadline, tech stack, team size)
- Mention the user persona if known
- Include stakeholder quotes verbatim — Claude will extract signal from them
