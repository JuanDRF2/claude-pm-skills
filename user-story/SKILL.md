---
name: user-story
argument-hint: "[feature or user need]"
description: Create user stories with Mike Cohn format and focused Gherkin acceptance criteria written in clear product language, with technical considerations separated from observable behavior. Use when turning user needs into development-ready or Jira-ready work with understandable outcomes and testable conditions.
intent: >-
  Create clear, concise user stories that combine Mike Cohn's user story format with Gherkin-style acceptance criteria. Use this to translate user needs into actionable development work that focuses on outcomes, ensures shared understanding between product and engineering, and provides testable success criteria.
type: component
theme: pm-artifacts
best_for:
  - "Writing user stories with proper acceptance criteria"
  - "Converting requirements into development-ready stories"
  - "Establishing story quality standards across your team"
scenarios:
  - "I need to write a user story for a new notification system in our B2B SaaS app"
  - "Convert this PRD requirement into a properly formatted user story with Gherkin acceptance criteria"
estimated_time: "5-10 min"
---


## Purpose
Create clear, concise user stories that combine Mike Cohn's user story format with Gherkin-style acceptance criteria. Use this to translate user needs into actionable development work that focuses on outcomes, ensures shared understanding between product and engineering, and provides testable success criteria.

This is not a feature spec—it's a conversation starter that captures *who* benefits, *what* they're trying to do, *why* it matters, and *how* you'll know it works.

## In Simple Terms

Use this skill to describe one useful result from the customer's point of view and agree on how the team will recognize that it works.

The story answers:

- Who needs the result?
- What are they trying to accomplish?
- Why does it matter?

The acceptance criteria answer:

- Under what conditions should it work?
- What event occurs?
- What result must be observable?

**Gherkin** is only the professional name for writing those conditions as `Given / When / Then` (`Dado / Cuando / Entonces`). The format should make the behavior clearer, not make the reader learn technical syntax.

### Who Contributes What

| Role | Contribution |
|---|---|
| PM/PO or business owner | Provides the initial story, confirms rules, intended value, priority, and scope |
| QA | Removes ambiguity and adds important success, validation, alternative, and failure conditions |
| Engineering | Confirms feasibility, dependencies, system consistency, and observable failure behavior |

The PM is the primary owner of the business meaning, but the final story belongs to the team.

## Input

**Works best with:** The feature or user need the story captures.
**Also useful:** The user role, desired outcome, business-rule IDs, scope boundaries, dependencies, designs, integrations, risks, and edge cases.

Anything supplied with the invocation itself — text after the skill name, a pasted context dump, or an appended `ARGUMENTS:` line — counts as answers already given. Use it and skip whatever it covers; don't re-ask.

**Arriving empty-handed? That works too.** The skill asks who the user is and what they're trying to accomplish before drafting story and Gherkin criteria.

**Example invocation:** `Write user stories for password reset via SMS for our banking app — include the lockout edge case.`

### Language and Destination

Write the entire artifact in the user's language unless the user or destination convention requests another language. Translate headings and Gherkin keywords consistently; preserve stable IDs. When the destination is Jira, keep each story independently copyable.

## Key Concepts

### The Mike Cohn + Gherkin Format
A user story combines:

**Use Case (Mike Cohn format):**
- **As a** [user persona/role]
- **I want to** [action to achieve outcome]
- **so that** [desired outcome]

**Acceptance Criteria (Gherkin format):**
- **Scenario:** [Brief description of the scenario]
- **Given:** [Initial context or preconditions]
- **and Given:** [Additional preconditions]
- **When:** [Event that triggers the action]
- **Then:** [Expected outcome]

### Why This Structure Works
- **User-centric:** Forces focus on who benefits and why
- **Outcome-focused:** "So that" emphasizes the value delivered, not just the action
- **Testable:** Gherkin acceptance criteria are concrete and verifiable
- **Conversational:** Story is the opening for discussion, not the final spec
- **Shared language:** Product, engineering, and QA all understand the format

### Anti-Patterns (What This Is NOT)
- **Not a task:** "As a developer, I want to refactor the database" (this is a tech task, not user value)
- **Not a feature list:** "I want dashboards, reports, and analytics" (this is too big—needs splitting)
- **Not vague:** "I want a better experience" (unmeasurable, no clear outcome)
- **Not a contract:** Stories are placeholders for conversation, not locked-in specs

### When to Use This
- Translating user needs into development work
- Backlog grooming and sprint planning
- Communicating value to engineering and design
- Ensuring testable acceptance criteria exist before development

### When NOT to Use This
- For pure technical debt or refactoring (use engineering tasks instead)
- When stories are too large (split first—see `skills/user-story-splitting/SKILL.md`)
- Before understanding the user problem (write a problem statement first)

---

## Application

### Step 1: Gather Context
Before writing a story, ensure you have:
- **User persona:** Who is this for? (reference `skills/proto-persona/SKILL.md`)
- **Problem understanding:** What need does this address? (reference `skills/problem-statement/SKILL.md`)
- **Desired outcome:** What does success look like?
- **Constraints:** Technical, time, or scope limitations
- **Business rules:** Confirmed rules with stable IDs and sources
- **Scope boundaries:** Included and explicitly excluded behavior
- **Dependencies:** Product, design, data, integration, or policy dependencies
- **Questions and assumptions:** Keep these separate; never turn them into acceptance criteria
- **Sizing convention:** Team ceiling or method; if unknown, report sizing confidence without inventing points or days
- **Configuration ownership:** Whether required fields, validations, limits, and messages already exist or change in this story

**If missing context:** Run discovery interviews or problem validation work first.

---

### Optional Helper Script (Template Generator)

If you want a consistent Markdown stub, you can generate one from CLI inputs. This script is deterministic and does not fetch data or write files.

```bash
python3 scripts/user-story-template.py --persona \"trial user\" --action \"log in with Google\" --outcome \"access the app without creating a new password\"
```

---

### Step 2: Write the Use Case

Use `template.md` for the full fill-in structure.

Fill in the template:

```markdown
### User Story [ID]:

- **Summary:** [Brief, memorable title focused on value to the user]

#### Use Case:
- **As a** [user name if available, otherwise persona, otherwise role]
- **I want to** [action user takes to get to outcome]
- **so that** [desired outcome]
```

**Quality checks:**
- **"As a" specificity:** Is this a specific persona (e.g., "trial user") or generic ("user")?
- **"I want to" clarity:** Is this an action the user takes, or a feature you're building?
- **"So that" outcome:** Does this explain the user's motivation? Or is it just restating the action?

**Common mistakes:**
- ❌ "As a user, I want a login button, so that I can log in" (restating the action)
- ✅ "As a trial user, I want to log in with Google, so that I can access the app without creating a new password"

---

### Step 3: Write the Acceptance Criteria

Fill in the template:

```markdown
#### Acceptance Criteria:

- **Scenario:** [Brief, human-readable scenario describing value]
- **Given:** [Initial context or precondition]
- **and Given:** [Additional context or preconditions]
- **and Given:** [Additional context as needed]
- **and Given:** [UI-focused context ensuring 'When' can happen]
- **and Given:** [Outcomes-focused context ensuring 'Then' is delivered]
- **When:** [Event that triggers the action—aligns with 'I want to']
- **Then:** [Primary expected outcome—aligns with 'so that']
- **And:** [Additional inseparable observable result, as needed]
```

**Quality checks:**
- **Multiple Givens are okay:** Preconditions stack up (e.g., "Given I'm logged in" + "Given I have items in my cart")
- **Only one When:** If you need multiple "When" statements, you likely have multiple stories—split them
- **One behavior per scenario:** Multiple inseparable `Then/And` results are valid when they prove one coherent business outcome
- **Multiple scenarios are expected:** Add success, validation, alternate-rule, or material-failure scenarios required for acceptance
- **Alignment:** Does "When" match "I want to"? Does "Then" match "so that"?

**Red flags:**
- **Multiple unrelated When/Then pairs:** Sign of scope creep—evaluate splitting (reference `skills/user-story-splitting/SKILL.md`)
- **Vague Thens:** "Then I see improved performance" (unmeasurable—make it specific)

#### Plain-language contract

Write every criterion so a product stakeholder can understand it without knowing the data model, service boundaries, test fixtures, or architecture.

- Name the person and business object naturally: “empleado”, “miembro”, “membresía”, “pago” or the equivalent in the artifact language.
- Describe the user-visible or business result first. Put internal objects, events, APIs, keys, jobs and logs under **Technical consideration** or **Technical evidence** after the behavior.
- Use one primary business event per scenario. Create another scenario when the actor, initial condition, action, validation path, failure, recovery path, or primary outcome changes.
- Keep multiple `Then/And` results together only when they are inseparable proof of one business outcome.
- Expand shorthand into sentences. Never write compressed forms such as `Draft+Commitment`, `Payments→Canceled`, `preview=timeline`, `success/reject`, “does not leave partial”, slash-separated actions, or semicolon chains of unrelated results.
- Explain necessary product labels the first time they appear. Preserve the exact label in backticks when the UI or domain requires it.

Before accepting a criterion, read it aloud without its rule IDs or technical note. If the behavior is not clear by itself, rewrite it.

#### Canonical scenario ownership

- Write an explicit **Acceptance condition / Condición de aceptación** immediately below every `AC-*` heading. It must state what must be true for the criterion to be accepted and remain understandable without its scenarios.
- Place one or more stable `SC-*` scenarios directly under every `AC-*` criterion.
- Treat each `SC-*` as the single canonical Given/When/Then statement for Product and QA.
- Create another `SC-*` when the trigger or primary outcome changes.
- Allow secondary criterion traceability when one inseparable event proves several criteria, but ensure every criterion owns or explicitly references at least one scenario.
- Do not create separate “acceptance scenario” and “QA scenario” versions. QA enriches the same scenario with checks, evidence, data, risk and automation.

---

### Step 4: Add a Summary

Write a short, memorable summary that captures the story's value:

```markdown
- **Summary:** [Brief, human-readable title]
```

**Examples:**
- ✅ "Enable Google login for trial users to reduce signup friction"
- ✅ "Bulk delete items to save time for power users"
- ❌ "Add delete button" (feature-centric, not value-centric)

---

### Step 5: Validate and Refine

- **Read aloud to the team:** Does everyone understand who, what, why?
- **Test acceptance criteria:** Can QA write test cases from this?
- **Check for splitting:** If the story feels too big, use `skills/user-story-splitting/SKILL.md`
- **Ensure testability:** Can you prove "Then" happened?
- **Trace rules:** Does every acceptance criterion cite at least one rule, and is every in-scope rule covered?
- **Expose uncertainty:** Are assumptions and open questions visibly separated from approved behavior?
- **Check failure consistency:** For payments, identity, scheduling, or other high-risk workflows, are duplicate requests and partial failures addressed?
- **Check non-functional constraints:** Add security, privacy, accessibility, performance, localization, and observability only where relevant and sourced.
- **Classify requirements:** Business rule, quality requirement, observability requirement, technical enabler, or test-data/environment need.
- **Assess size:** Likely small, suitable, potentially too large, or not estimable; explain the dominant reason.
- **Assign review state:** Proposed by AI, Product confirmed, Engineering review needed, QA review needed, or Blocked.

Plain-language translations:

- **Traceability:** showing which confirmed rule each criterion comes from.
- **Non-functional constraint:** a quality requirement such as accessibility, privacy, speed, reliability, or audit evidence.
- **Observability:** information that lets support or engineering understand what happened after a failure.

For payment stories, never use “approved” ambiguously. Distinguish authorized, captured, voided, refunded, and completed. Capture partial failure, duplicate requests, unknown results, compensation failure, customer communication, and support evidence or leave explicit questions.

### Running Membership Example

```markdown
### US-MEM-01 — Buy an individual membership as a guest

- **As a** guest buying a membership for myself
- **I want to** complete the online purchase
- **so that** I can obtain membership benefits without staff assistance

#### AC-MEM-01-01 — Approved purchase
- **Rules:** BR-01, BR-02
- **Given:** I selected an available individual membership
- **And:** I provided valid buyer information
- **When:** My payment is approved
- **Then:** One payment is recorded
- **And:** One membership is created for me
- **And:** I receive the confirmed purchase communication

#### AC-MEM-01-02 — Rejected payment
- **Rules:** BR-03
- **Given:** I provided valid buyer information
- **When:** My payment is rejected
- **Then:** No membership is created or activated
- **And:** I am told that the payment was not completed
```

The next skill preserves these IDs when creating `TC-MEM-*` test cases.

---

## Examples

See `examples/sample.md` for full examples (good, bad, and split-needed stories).

Mini example excerpt:

```markdown
### User Story 042:

- **Summary:** Enable Google login for trial users to reduce signup friction

#### Use Case:
- **As a** trial user visiting the app for the first time
- **I want to** log in using my Google account
- **so that** I can access the app without creating and remembering a new password

#### Acceptance Criteria:
- **Scenario:** First-time trial user logs in via Google OAuth
- **Given:** I am on the login page
- **and Given:** I have a login account
- **When:** I click the "Sign in with Google" button and authorize the app
- **Then:** I am logged into the app and redirected to the onboarding flow
```

---

## Common Pitfalls

### Pitfall 1: Technical Tasks Disguised as User Stories
**Symptom:** "As a developer, I want to refactor the API, so that the code is cleaner"

**Consequence:** This is an engineering task, not a user story. No user value is delivered.

**Fix:** If there's no user outcome, it's not a user story—use an engineering task or tech debt ticket instead.

---

### Pitfall 2: "As a User" (Too Generic)
**Symptom:** Every story starts with "As a user"

**Consequence:** No persona clarity. Different users have different needs.

**Fix:** Use specific personas: "As a trial user," "As a paid subscriber," "As an admin," etc. (reference `skills/proto-persona/SKILL.md`)

---

### Pitfall 3: "So That" Restates "I Want To"
**Symptom:** "I want to click the save button, so that I can save my work"

**Consequence:** No insight into *why* the user cares. Just restating the action.

**Fix:** Dig into the motivation: "so that I don't lose my progress if the page crashes" (real outcome).

---

### Pitfall 4: Multiple When/Then Statements
**Symptom:** Acceptance criteria with 5 "When" statements and 5 "Then" statements

**Consequence:** Story is too big. Likely multiple features bundled together.

**Fix:** Split the story using `skills/user-story-splitting/SKILL.md`. Each When/Then pair should be its own story (or at least evaluated for splitting).

---

### Pitfall 5: Untestable Acceptance Criteria
**Symptom:** "Then the user has a better experience" or "Then it's faster"

**Consequence:** QA can't verify success. Ambiguous definition of "done."

**Fix:** Make it measurable: "Then the page loads in under 2 seconds" or "Then the user sees a success confirmation message."

---

### Pitfall 6: One `Then` Hides an Incomplete Transaction
**Symptom:** A payment story checks only the confirmation message, not membership creation or duplicate prevention.

**Consequence:** The criterion can pass while business state is inconsistent.

**Fix:** Keep one behavior per scenario, but use all necessary `Then/And` outcomes to prove atomicity and business consistency.

---

### Pitfall 7: AI Assumptions Become Product Rules
**Symptom:** A plausible limit, recipient, date range, or retry behavior appears without a source.

**Consequence:** Engineering implements an invented rule and QA validates the wrong product.

**Fix:** Put unsupported decisions under Questions or Assumptions and block affected criteria until an owner confirms them.

---

### Pitfall 8: Architecture Disguised as Acceptance Behavior

**Symptom:** “Then Draft+Commitment are created, Payments→Canceled and fulfillment retries idempotently.”

**Consequence:** Product reviewers cannot tell what the employee experiences or what business outcome is accepted.

**Fix:** Write the product outcome first: “Then the membership is saved for later payment and no money is recorded as received.” Add internal records and retry mechanics afterward under **Technical consideration**.

---

## References

### Related Skills
- `skills/user-story-splitting/SKILL.md` — How to break large stories into smaller ones
- `skills/proto-persona/SKILL.md` — Defines the "As a [persona]" section
- `skills/problem-statement/SKILL.md` — Stories should address validated problems
- `skills/epic-hypothesis/SKILL.md` — Epics decompose into user stories

### Optional Helpers
- `skills/user-story/scripts/user-story-template.py` — Deterministic Markdown stub generator (no network access)

### External Frameworks
- Mike Cohn, *User Stories Applied* (2004) — Origin of the "As a / I want / so that" format
- Gherkin (Cucumber) — "Given/When/Then" acceptance criteria format
- INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable)

### Dean's Work
- [Link to relevant Dean Peters' Substack articles if applicable]

### Provenance
- Adapted from `prompts/user-story-prompt-template.md` in the `https://github.com/deanpeters/product-manager-prompts` repo.

---

**Skill type:** Component
**Suggested filename:** `user-story.md`
**Suggested placement:** `/skills/components/`
**Dependencies:** References `skills/proto-persona/SKILL.md`, `skills/problem-statement/SKILL.md`
**Used by:** `skills/user-story-splitting/SKILL.md`, `skills/epic-hypothesis/SKILL.md`
