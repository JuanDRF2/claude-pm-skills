---
name: user-story
description: Create user stories with Mike Cohn format and focused Gherkin acceptance criteria written in clear product language, with technical considerations separated from observable behavior. Use when turning user needs into development-ready or Jira-ready work with understandable outcomes and testable conditions.
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
- **User persona:** Who specifically benefits or acts?
- **Problem understanding:** What confirmed user need or problem does this address?
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
- **One primary business event:** Require at least one `When`. Multiple `When` steps are valid only when they are inseparable parts of that event; split independent events into separate scenarios
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

#### Matrix and dataset references

- A matrix or parameterized dataset may complement a scenario but must never replace its initial state or expected behavior.
- Keep the `Given/Dado` in product language: name the actor or business context, relevant configuration, and representative values. Do not write only `Given dataset X`, `Given QA executes matrix X`, `See canonical matrix`, or equivalents.
- Put matrix IDs and links after the Given/When/Then under **Test data / Datos de prueba** or **Complete numeric data / Datos numéricos completos**.
- Keep one scenario parameterized only when every matrix row shares the same business event and expected-result structure. Split rows into separate `SC-*` scenarios when the trigger, applicable rule, validation path, or primary outcome changes.
- A reviewer must be able to understand and approve the scenario when the matrix link is unavailable.

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

## Examples and Pitfalls

Read `references/examples-and-pitfalls.md` only when a concrete example is needed or a review detects one of its quality failure patterns. Apply those examples without changing the output contract above.

## References

### Related Skills
- `skills/user-story-splitting/SKILL.md` — How to break large stories into smaller ones

### Optional Helpers
- `skills/user-story/scripts/user-story-template.py` — Deterministic Markdown stub generator (no network access)

### External Frameworks
- Mike Cohn, *User Stories Applied* (2004) — Origin of the "As a / I want / so that" format
- Gherkin (Cucumber) — "Given/When/Then" acceptance criteria format
- INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable)

### Provenance
- Adapted from `prompts/user-story-prompt-template.md` in the `https://github.com/deanpeters/product-manager-prompts` repo.
