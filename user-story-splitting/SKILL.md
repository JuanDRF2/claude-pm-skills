---
name: user-story-splitting
argument-hint: "[story or epic to split]"
description: Break a large story or epic into smaller deliverable stories using proven split patterns. Use when backlog items are too big for estimation, sequencing, or independent release.
intent: >-
  Break down large user stories, epics, or features into smaller, independently deliverable stories using systematic splitting patterns. Use this to make work more manageable, reduce risk, enable faster feedback cycles, and maintain flow in agile development. This skill applies to user stories, epics, and any work that's too large to complete in a single sprint.
type: component
---


## Purpose
Break down large user stories, epics, or features into smaller, independently deliverable stories using systematic splitting patterns. Use this to make work more manageable, reduce risk, enable faster feedback cycles, and maintain flow in agile development. This skill applies to user stories, epics, and any work that's too large to complete in a single sprint.

This is not arbitrary slicing—it's strategic decomposition that preserves user value while reducing complexity.

## In Simple Terms

Use this skill when a piece of work is too large to understand, estimate, build, or test comfortably. The goal is to find smaller useful outcomes—not to create more tickets.

A good split answers:

1. What can the customer meaningfully accomplish after this part is done?
2. What rule, risk, or variation does this part add?
3. What remains for later?
4. Does the team depend on another decision or technical foundation first?

### Who Contributes What

| Role | Contribution |
|---|---|
| PM/PO | Protects customer value, scope, and delivery priority |
| QA | Checks whether each part can be verified and whether rules were lost |
| Engineering | Identifies technical risk, sequence, and unavoidable dependencies |

Terms used below:

- A **vertical slice** is a small result that works from the user's action through the necessary system behavior.
- An **enabler** is technical work needed before a user-facing result can work.
- A **Tiny Act of Discovery (TAD)** is a small experiment used to answer an important unknown before committing to a solution.

## Input

Write splits and headings in the user's language unless the user or destination convention requests another language. Preserve stable IDs regardless of language.

**Works best with:** The story or epic that's too big — paste it as written.
**Also useful:** Why it's too big (can't estimate, can't finish in a sprint, can't release independently) and your team's sizing ceiling.

Anything supplied with the invocation itself — text after the skill name, a pasted context dump, or an appended `ARGUMENTS:` line — counts as answers already given. Use it and skip whatever it covers; don't re-ask.

**Arriving empty-handed? That works too.** The skill asks for the story text, then walks the split patterns against it.

**Example invocation:** `Split this: 'As an admin, I can bulk-import users from CSV, Excel, or our HR system with field mapping and error handling.'`

## Key Concepts

### The Story Splitting Framework
Based on Richard Lawrence and Peter Green's "Humanizing Work Guide to Splitting User Stories," the framework provides 8 systematic patterns for splitting work:

1. **Workflow steps:** Split along sequential steps in a user's journey
2. **Business rule variations:** Split by different rule scenarios (permissions, calculations, etc.)
3. **Data variations:** Split by different data types or inputs
4. **Acceptance criteria complexity:** Split when multiple "When" or "Then" statements exist
5. **Major effort:** Split by technical milestones or implementation phases
6. **External dependencies:** Split along dependency boundaries (APIs, third parties, etc.)
7. **DevOps steps:** Split by deployment or infrastructure requirements
8. **Tiny Acts of Discovery (TADs):** When none of the above apply, use small experiments to unpack unknowns

### Why Split Stories?
- **Faster feedback:** Smaller stories ship sooner, allowing earlier validation
- **Reduced risk:** Less to build = less that can go wrong
- **Better estimation:** Small stories are easier to estimate accurately
- **Maintain flow:** Keeps work moving through the sprint without bottlenecks
- **Testability:** Smaller scope = easier to write and run tests

### Anti-Patterns (What This Is NOT)
- **Not horizontal slicing:** Don't split into "front-end story" and "back-end story" (each story should deliver user value)
- **Not task decomposition:** Stories aren't tasks ("Set up database," "Write API")
- **Not arbitrary chopping:** Don't split "Add user management" into "Add user" and "Management" (meaningless)

### When to Use This
- Story is too large for a single sprint
- Multiple "When" or "Then" statements in acceptance criteria
- Epic needs to be broken down into deliverable increments
- Team can't reach consensus on story size or scope
- Story has multiple personas or workflows bundled together

### When NOT to Use This
- Story is already small and well-scoped (don't over-split)
- Splitting would create dependencies that slow delivery
- The story is a technical task (use engineering task breakdown instead)

---

## Application

### Step 1: Identify the Original Story
Start with the story/epic/feature that needs splitting. Ensure it's written using the user story format (reference `skills/user-story/SKILL.md`).

```markdown
### Original Story:
[Story formatted with use case and acceptance criteria]
```

---

### Step 2: Apply the Splitting Logic

Use `template.md` for the full fill-in structure and output format.

Evaluate all 8 splitting patterns. Recommend the split or combination that best preserves an end-to-end user outcome, reduces the dominant risk, and supports useful feedback. Do not stop at the first applicable pattern.

#### Pattern 1: Workflow Steps
**Ask:** Does this story contain multiple sequential steps?

**Example:**
- Original: "As a user, I want to sign up, verify my email, and complete onboarding"
- Split:
  1. "As a user, I want to sign up with email/password"
  2. "As a user, I want to verify my email via a confirmation link"
  3. "As a user, I want to complete onboarding by answering 3 profile questions"

---

#### Pattern 2: Business Rule Variations
**Ask:** Does this story have different rules for different scenarios?

**Example:**
- Original: "As a user, I want to apply discounts (10% for members, 20% for VIPs, 5% for first-time buyers)"
- Split:
  1. "As a member, I want to apply a 10% discount at checkout"
  2. "As a VIP, I want to apply a 20% discount at checkout"
  3. "As a first-time buyer, I want to apply a 5% discount at checkout"

---

#### Pattern 3: Data Variations
**Ask:** Does this story handle different types of data or inputs?

**Example:**
- Original: "As a user, I want to upload files (images, PDFs, videos)"
- Split:
  1. "As a user, I want to upload image files (JPG, PNG)"
  2. "As a user, I want to upload PDF documents"
  3. "As a user, I want to upload video files (MP4, MOV)"

---

#### Pattern 4: Acceptance Criteria Complexity
**Ask:** Does this story have multiple "When" or "Then" statements?

**Example:**
- Original: "As a user, I want to manage my cart"
  - When I add an item, Then it appears in my cart
  - When I remove an item, Then it disappears from my cart
  - When I update quantity, Then the cart total updates
- Split:
  1. "As a user, I want to add items to my cart so I can purchase them later"
  2. "As a user, I want to remove items from my cart so I can change my mind"
  3. "As a user, I want to update item quantities so I can buy the right amount"

**Note:** This is the most common indicator that a story needs splitting. If you see multiple "When/Then" pairs, split along those boundaries.

---

#### Pattern 5: Major Effort
**Ask:** Does this story require significant technical work that can be delivered incrementally?

**Example:**
- Original: "As a user, I want real-time collaboration on documents"
- Split:
  1. "As a user, I want to see who else is viewing the document (read-only presence)"
  2. "As a user, I want to see live cursor positions of other editors"
  3. "As a user, I want to see live edits from other users in real-time"

---

#### Pattern 6: External Dependencies
**Ask:** Does this story depend on multiple external systems or APIs?

**Example:**
- Original: "As a user, I want to log in with Google, Facebook, or Twitter"
- Split:
  1. "As a user, I want to log in with Google OAuth"
  2. "As a user, I want to log in with Facebook OAuth"
  3. "As a user, I want to log in with Twitter OAuth"

---

#### Pattern 7: DevOps Steps
**Ask:** Does this story require complex deployment, infrastructure, or operational work?

**Example:**
- Original: "As a user, I want to upload large files to cloud storage"
- Split:
  1. "As a user, I want to upload small files (<10MB) to cloud storage"
  2. "As a user, I want to upload large files (10MB-1GB) with progress tracking"
  3. "As a user, I want to resume interrupted uploads"

---

#### Pattern 8: Tiny Acts of Discovery (TADs)
**Ask:** If none of the above apply, are there unknowns or assumptions that need unpacking?

**Example:**
- Original: "As a user, I want AI-powered recommendations" (too vague, too many unknowns)
- TADs:
  1. Prototype 3 recommendation algorithms and test with 10 users
  2. Define success criteria (click-through rate, user satisfaction)
  3. Build the simplest recommendation engine (collaborative filtering)
  4. Measure and iterate

**Note:** TADs aren't stories—they're experiments. Use them to de-risk and clarify before writing stories.

---

### Step 3: Write the Split Stories

For each split, write a complete user story using the format from `skills/user-story/SKILL.md`:

```markdown
### Split 1 using [Pattern Name]:

#### User Story [ID]:
- **Summary:** [Brief title]

**Use Case:**
- **As a** [persona]
- **I want to** [action]
- **so that** [outcome]

**Acceptance Criteria:**
- **Scenario:** [Description]
- **Given:** [Preconditions]
- **When:** [Action]
- **Then:** [Outcome]
```

For each candidate, also record:

- Business rules retained
- Scope intentionally deferred
- Dependencies and sequencing
- Dominant risk reduced
- Whether it is independently releasable, independently testable, or only a prerequisite
- Size assessment against the team's stated ceiling: likely small, suitable, potentially too large, or not estimable

Do not disguise prerequisites as user stories. Use an engineering task, enabler, or discovery item when no independent user outcome exists.

If the team has no sizing ceiling, ask once and do not invent story points, days, or a universal limit.

---

### Step 4: Validate the Splits

Ask these questions:
1. **Does each split deliver user value?** (Not just "front-end done")
2. **Are dependencies minimized and explicit?** (Some product increments have legitimate sequencing)
3. **Can each split be tested independently?** (Clear acceptance criteria)
4. **Is each split within the team's stated sizing ceiling?** (Ask for it; do not impose a universal day count)
5. **Do the splits, when combined, equal the original?** (Nothing lost in translation)
6. **Does each confirmed business rule appear in at least one split?**
7. **Does the first slice exercise the real end-to-end architecture where risk warrants it?**

If any answer is "no," revise.

## Examples and Pitfalls

Read `references/examples-pitfalls-and-provenance.md` only when a concrete example is useful or a review detects one of its failure patterns. Preserve the splitting patterns, validation questions, and enabler/TAD distinctions defined above.

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
