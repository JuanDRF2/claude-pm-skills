---
name: user-story-mapping
argument-hint: "[product or workflow]"
description: Create a user story map that lays out activities, steps, tasks, and release slices. Use when planning a workflow, backlog, or MVP around the user journey.
intent: >-
  Visualize the user journey by creating a hierarchical map that breaks down high-level activities into steps and tasks, organized left-to-right as a narrative flow. Use this to build shared understanding across product, design, and engineering, prioritize features based on user workflows, and identify gaps or opportunities in the user experience.
type: component
---


## Purpose
Visualize the user journey by creating a hierarchical map that breaks down high-level activities into steps and tasks, organized left-to-right as a narrative flow. Use this to build shared understanding across product, design, and engineering, prioritize features based on user workflows, and identify gaps or opportunities in the user experience.

This is not a backlog—it's a strategic artifact that shows *how* users accomplish their goals, which then informs *what* to build.

## In Simple Terms

Use this skill to put the entire customer experience in order before creating tickets. It answers four questions:

1. Who is trying to accomplish something?
2. What do they do from beginning to end?
3. Where do the paths differ, fail, or need a decision?
4. What is the smallest useful version the team can deliver first?

No product-management vocabulary is required. When a professional term appears, explain the idea first and give the term second.

### Who Contributes What

| Role | Contribution |
|---|---|
| PM/PO or business owner | Confirms the customer need, business rules, priorities, and unresolved decisions |
| QA | Identifies variations, missing paths, risks, and behavior that must be observable |
| Engineering | Identifies system boundaries, dependencies, failures, and recovery needs |
| Design | Confirms the intended interaction and user experience |

The map is collaborative. The PM should not be expected to know every technical failure, and QA or engineering should not invent business rules.

## Input

Write the map and all generated headings in the user's language unless the user or destination convention requests another language. Preserve stable IDs regardless of language.

**Works best with:** The product or user workflow being mapped.
**Also useful:** Actors, business rules, known variants, system states, integrations, failure paths, existing backlog items, and release goals.

Anything supplied with the invocation itself — text after the skill name, a pasted context dump, or an appended `ARGUMENTS:` line — counts as answers already given. Use it and skip whatever it covers; don't re-ask.

**Arriving empty-handed? That works too.** The skill asks whose journey you're mapping and what they're trying to get done, then builds backbone → tasks → slices.

**Example invocation:** `Story map for our expense-reporting flow, from receipt capture to reimbursement, with an MVP slice for the pilot.`

## Key Concepts

### The Jeff Patton Story Mapping Framework
Invented by Jeff Patton, story mapping organizes work into a 2D structure:

**Horizontal axis (left-to-right):** User journey over time
- **Backbone:** High-level activities the user performs
- **Steps:** Specific actions within each activity
- **Tasks:** Detailed work required to complete each step

**Vertical axis (top-to-bottom):** Priority and releases
- **Top rows:** Essential tasks (MVP / Release 1)
- **Lower rows:** Nice-to-have tasks (Future releases)

### Story Map Structure

```
Segment → Persona → Narrative (User's goal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Activity 1] → [Activity 2] → [Activity 3] → [Activity 4] → [Activity 5]
     ↓              ↓              ↓              ↓              ↓
  [Step 1.1]     [Step 2.1]     [Step 3.1]     [Step 4.1]     [Step 5.1]
  [Step 1.2]     [Step 2.2]     [Step 3.2]     [Step 4.2]     [Step 5.2]
  [Step 1.3]     [Step 2.3]     [Step 3.3]     [Step 4.3]     [Step 5.3]
     ↓              ↓              ↓              ↓              ↓
  [Task 1.1.1]   [Task 2.1.1]   [Task 3.1.1]   [Task 4.1.1]   [Task 5.1.1]
  [Task 1.1.2]   [Task 2.1.2]   [Task 3.1.2]   [Task 4.1.2]   [Task 5.1.2]
  [Task 1.1.3]   [Task 2.1.3]   [Task 3.1.3]   [Task 4.1.3]   [Task 5.1.3]
  ...            ...            ...            ...            ...
```

### Record Rules and Questions Before the Map
For workflows with meaningful variants, create a discovery ledger before mapping:

- **Actors:** people and external systems participating in the outcome
- **Business rules:** stable IDs such as `BR-01`, source, and confirmed/proposed/unknown status
- **Variations:** product type, authentication state, channel, permission, or other behavior-changing dimensions
- **States:** meaningful before/after states and allowed transitions
- **Questions and assumptions:** never silently convert either into facts
- **Integrations and failures:** external boundaries, partial failures, retries, and recovery

Use a variation matrix when two or more flows share a backbone but differ in rules. This prevents the map from hiding combinatorial scope.

In plain language:

- A **discovery ledger** is simply a table of rules, questions, assumptions, and owners.
- A **variation matrix** is a comparison table showing what changes between flows.
- A **release slice** is a useful portion of the journey that the team plans to deliver together.

### Why This Works
- **User-centric:** Organizes work around user goals, not engineering modules
- **Shared understanding:** Product, design, engineering all see the same journey
- **Prioritization clarity:** Top tasks = MVP, lower tasks = future iterations
- **Gap identification:** Missing steps or tasks become obvious
- **Release planning:** Draw horizontal "release lines" to define scope

### Anti-Patterns (What This Is NOT)
- **Not a Gantt chart:** This isn't project management—it's user journey visualization
- **Not a feature list:** Activities aren't features—they're user behaviors
- **Not static:** Story maps evolve as you learn more about users

### When to Use This
- Kicking off a new product or major feature
- Aligning stakeholders on user workflow
- Prioritizing backlog based on user needs
- Identifying MVP vs. future releases
- Onboarding new team members to the product vision

### When NOT to Use This
- For trivial features (don't map what you already understand)
- When user workflows are constantly changing (map stabilizes workflows)
- As a replacement for user stories (the map informs stories, doesn't replace them)

---

## Application

### Step 1: Define the Context

Use `template.md` for the full fill-in structure.

#### Segment
Who are you building for?

```markdown
### Segment:
- [Specify the target segment, e.g., "Small business owners using DIY accounting software"]
```

**Quality checks:**
- **Specific:** Not "users" but "enterprise IT admins" or "freelance designers"

For multi-actor workflows, identify the primary actor and supporting actors. Keep user actions distinct from system responsibilities.

### Step 1A: Build the Discovery Ledger

Before defining the backbone, record confirmed rules and unresolved decisions. Assign IDs to rules and questions so later stories and tests can trace back to them. If a material rule is unknown, preserve it as a question; do not infer an answer.

---

#### Persona
Provide details about the persona within this segment.

```markdown
### Persona:
- [Describe the persona: demographics, behaviors, pains, goals]
```

**Example:**
- "Sarah, 35-year-old freelance graphic designer, manages 5-10 client projects at once, struggles with invoicing and payment tracking, wants to spend less time on admin and more time designing"

---

### Step 2: Define the Narrative
What is the user trying to accomplish? Frame this as a Jobs-to-be-Done statement.

```markdown
### Narrative:
- [Concise narrative of the persona's objective, e.g., "Complete a client project from kickoff to final payment"]
```

**Quality checks:**
- **Outcome-focused:** Not "use the product" but "deliver a client project on time and get paid"
- **One sentence:** If it takes more than one sentence, the scope may be too broad

---

### Step 3: Identify Activities (Backbone)
List 3-5 high-level activities the persona engages in to fulfill the narrative. These form the backbone of your map.

```markdown
### Activities:
1. [Activity 1, e.g., "Negotiate project scope and pricing"]
2. [Activity 2, e.g., "Execute design work"]
3. [Activity 3, e.g., "Deliver final assets to client"]
4. [Activity 4, e.g., "Send invoice and receive payment"]
5. [Activity 5, optional]
```

**Quality checks:**
- **Sequential:** Activities happen in order (left-to-right)
- **User actions:** Describe what the user *does*, not what the product *provides*
- **3-5 activities:** Too few = oversimplified, too many = overwhelming

---

### Step 4: Break Activities into Steps
For each activity, list 3-5 steps that detail how the activity is carried out.

```markdown
### Steps:

**For Activity 1: [Activity Name]**
- Step 1: [Detail step 1, e.g., "Review client brief"]
- Step 2: [Detail step 2, e.g., "Draft project proposal"]
- Step 3: [Detail step 3, e.g., "Negotiate timeline and budget"]
- Step 4: [Optional step 4]
- Step 5: [Optional step 5]

**For Activity 2: [Activity Name]**
- Step 1: [Detail step 1]
- Step 2: [Detail step 2]
...
```

**Quality checks:**
- **Actionable:** Each step is something the user does
- **Observable:** You could watch someone perform this step
- **Logical sequence:** Steps follow a natural order

---

### Step 5: Break Steps into Tasks
For each step, list only the tasks needed to explain behavior, scope, and release slices. Do not target a fixed task count.

```markdown
### Tasks:

**For Activity 1, Step 1: [Step Name]**
- Task 1: [Detail task 1, e.g., "Read client brief document"]
- Task 2: [Detail task 2, e.g., "Identify key deliverables"]
- Task 3: [Detail task 3, e.g., "Note budget constraints"]
- Task 4: [Detail task 4, e.g., "Clarify timeline expectations"]
- Task 5: [Detail task 5, e.g., "List open questions for client"]
- Task 6: [Optional task 6]
- Task 7: [Optional task 7]

**For Activity 1, Step 2: [Step Name]**
- Task 1: [Detail task 1]
...
```

**Quality checks:**
- **Granular:** Tasks are small, specific actions
- **Responsibility-aware:** Label user actions, system responses, and operational recovery separately
- **Prioritizable:** You'll prioritize tasks vertically (top = essential, bottom = nice-to-have)

---

### Step 6: Prioritize Vertically
Arrange tasks top-to-bottom by priority:
- **Top rows:** MVP / Release 1 (must-have)
- **Middle rows:** Release 2 (important but not critical)
- **Bottom rows:** Future / Nice-to-have

Draw horizontal "release lines" to demarcate scope.

---

### Step 7: Identify Gaps and Opportunities
Review the map and ask:
- Are there missing steps or tasks?
- Are there pain points we're not addressing?
- Are there opportunities to delight users?
- Do all activities flow logically?
- Are alternate, failure, abandonment, and recovery paths represented?
- Does every task trace to a confirmed rule, a discovery question, or an explicit product hypothesis?

### Step 8: Produce the Handoff

Output the story map together with:

1. Variation matrix
2. Rule and question ledger
3. Release slices
4. Candidate vertical stories
5. Gaps requiring PM, QA, design, or engineering decisions

## Examples and Pitfalls

Read `references/examples-pitfalls-and-provenance.md` only when a concrete example is useful or a review detects one of its failure patterns. Preserve the discovery ledger, journey hierarchy, variations, gaps, and release-slice contract defined above.

---

## References

### Related Skills
- `skills/user-story/SKILL.md` — Tasks from the map become user stories

### External Frameworks
- Jeff Patton, *User Story Mapping* (2014) — Origin of the story mapping technique
- Teresa Torres, *Continuous Discovery Habits* (2021) — Opportunity solution trees (complementary to story maps)

### Dean's Work
- User Story Mapping Prompt (adapted from Jeff Patton's methodology)

### Provenance
- Adapted from `prompts/user-story-mapping.md` in the `https://github.com/deanpeters/product-manager-prompts` repo.

---

**Skill type:** Component
**Suggested filename:** `user-story-mapping.md`
**Suggested placement:** `/skills/components/`
**Dependencies:** References `skills/user-story/SKILL.md`
