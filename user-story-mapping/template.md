# User Story Map Template

Use this template to create a complete user story map (segment, persona, backbone, steps, and tasks).

## Provenance
Adapted from `prompts/user-story-mapping.md` in the `https://github.com/deanpeters/product-manager-prompts` repo.

## Template
```markdown
## User Story Map Template

### Who

#### Segment:
- [Specify the target segment]

#### Persona:
- [Describe the persona and their key characteristics]

#### Supporting Actors and Systems:
- [Actor/system and responsibility]

### Rules, Questions, and Decisions

#### Business Rules:
| ID | Rule | Source/Owner | Status |
|---|---|---|---|
| BR-01 | [Rule] | [Source] | Confirmed/Proposed/Unknown |

#### Questions and Assumptions:
| ID | Item | Owner | Blocking? |
|---|---|---|---|
| Q-01 | [Question, not an inferred answer] | [Owner] | Yes/No |

#### Differences Between Flows (Variation Matrix):
| Capability | Variant A | Variant B | Variant C |
|---|---|---|---|
| [Capability] | [Behavior] | [Behavior] | [Behavior] |

### Backbone

#### Narrative:
- [Insert the concise narrative of the persona's objective]

#### Activities:
1. [Describe Activity 1]
2. [Describe Activity 2]
3. [Continue as necessary for up to 5 activities]

#### Steps:
For [Activity 1]:
- Step 1: [Detail Step 1 for Activity 1]
- Step 2: [Detail Step 2 for Activity 1]
- Step 3: [Detail Step 3 for Activity 1]

#### Tasks:
For [Activity 1, Step 1]:
- Task 1: [Detail Task 1 for Step 1 of Activity 1]
- Task 2: [Detail Task 2 for Step 1 of Activity 1]
- Task 3: [Detail Task 3 for Step 1 of Activity 1]

### What Happens When the Main Path Changes or Fails
- [Trigger] → [Expected behavior/state] → [Recovery or owner]

### Planned Deliveries (Release Slices)
- **Release 1:** [Smallest end-to-end outcome]
- **Release 2:** [Next behavior/rule variation]
- **Future:** [Deferred scope]

### Candidate End-to-End Stories
| Candidate | User outcome | Rules | Dependencies | Risk |
|---|---|---|---|---|
| US-01 | [Outcome] | BR-01 | [Dependency] | High/Medium/Low |
```
