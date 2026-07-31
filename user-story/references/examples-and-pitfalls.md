# User Story Examples and Pitfalls

## Contents

- Running membership example
- Additional user-story example
- Eight common pitfalls and fixes

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

The next skill preserves these IDs when creating `FTC-MEM-*` functional cases and `SC-*` scenarios.

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

**Fix:** Use specific personas such as "As a trial user," "As a paid subscriber," or "As an admin."

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
