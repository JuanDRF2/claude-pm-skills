# User Story Examples

These examples explain focused quality decisions. For the complete current structure,
including acceptance conditions, executability, QA strategy, asynchronous outcomes and
functional grouping, use `../references/golden-example.md`.

## Example 1: Good User Story

```markdown
### User Story 042:

- **Summary:** Enable Google login for trial users to reduce signup friction

#### Use Case:
- **As a** trial user visiting the app for the first time
- **I want to** log in using my Google account
- **so that** I can access the app without creating and remembering a new password

#### Acceptance Criteria:

##### AC-042-01 — Access onboarding without another password

**Acceptance condition:** A trial user who authorizes Google login enters the app without creating another password.

###### SC-042-01 — First-time trial user logs in with Google

**Given:** I am a trial user on the login page with an available Google account  
**And:** the `Sign in with Google` option is available  
**When:** I choose that option and authorize access  
**Then:** I enter the app and see the onboarding flow.

**QA strategy:** Manual; E2E; Medium; depends on a controlled Google account; Not started.
```

**Why this works:**
- Persona is specific ("trial user visiting for the first time")
- Action is clear ("log in using my Google account")
- Outcome explains motivation ("without creating a new password")
- Acceptance criteria are testable (QA can verify each step)
- Only one When, one Then (appropriately scoped)

> A single `Then` is sufficient here, but it is not a universal limit. Use additional `And` outcomes when they are inseparable evidence of the same business result.

---

## Example 2: Bad User Story (Too Vague)

```markdown
### User Story 999:

- **Summary:** Improve login experience

#### Use Case:
- **As a** user
- **I want to** better login
- **so that** I can use the app

#### Acceptance Criteria:

##### AC-999-01 — Login

**Acceptance condition:** The login should be better.

###### SC-999-01 — User logs in

**Given:** I want to log in  
**And:** I have an active account  
**When:** I log in  
**Then:** It works better.
```

**Why this fails:**
- "User" is too generic (trial user? returning user? admin?)
- "Better login" is not an action (what specifically?)
- "Use the app" is not a specific outcome (everyone wants to use the app)
- Acceptance criteria are untestable ("works better" = unmeasurable)

**How to fix it:**
- Narrow the persona: "trial user," "returning user without password manager," etc.
- Define the action: "log in using Google," "reset my password via email," etc.
- Specify the outcome: "without remembering a new password," "in under 30 seconds," etc.
- Make acceptance criteria falsifiable: "Then I am redirected to the dashboard within 2 seconds"

---

## Example 3: Story That Needs Splitting

```markdown
### User Story 100:

- **Summary:** Manage shopping cart

#### Use Case:
- **As a** shopper
- **I want to** add items, remove items, update quantities, apply coupons, and checkout
- **so that** I can complete my purchase

#### Acceptance Criteria:

##### AC-100-01 — Shopping cart management

**Acceptance condition:** The shopper can manage the entire cart and checkout.

###### SC-100-01 — Manage the complete cart in one scenario

**Given:** I have items in my cart  
**When:** I add an item  
**Then:** It appears in the cart  
**When:** I remove an item  
**Then:** It disappears from the cart  
**When:** I update quantity  
**Then:** The quantity changes  
**When:** I apply a coupon  
**Then:** The discount is applied  
**When:** I checkout  
**Then:** I proceed to payment.
```

**Why this needs splitting:**
- Multiple "When" statements = multiple stories
- Scope is too large for a single sprint
- Different outcomes aren't related (adding items ≠ applying coupons)

**How to split it:**
Use `skills/user-story-splitting/SKILL.md` to break this into:
1. "Add items to cart"
2. "Remove items from cart"
3. "Update item quantities"
4. "Apply discount coupons"
5. "Checkout and proceed to payment"

Each becomes its own story with focused acceptance criteria.

---

## Example 4: Multiple Results That Should Stay Together

```markdown
### User Story 120: Purchase an individual membership as a guest

- **Business rules:** BR-01, BR-02, BR-03

#### Use Case:
- **As a** guest purchasing a membership for myself
- **I want to** complete an approved online purchase
- **so that** my membership becomes available without staff assistance

#### Acceptance Criteria:

##### AC-120-01 — Activate membership after the charge

**Rules:** BR-01, BR-02, BR-03

**Acceptance condition:** A confirmed charge records the displayed total and activates one membership for the buyer.

###### SC-120-01 — Complete an individual membership purchase

**Given:** I selected an available individual membership with a displayed total of USD 100  
**And:** I provided the buyer information required by the confirmed rules  
**When:** I confirm the purchase and the bank reports that USD 100 was charged  
**Then:** Exactly one payment for USD 100 is recorded  
**And:** Exactly one membership is activated for the buyer  
**And:** The screen confirms that the purchase finished.

**Test data:** USD 100 is an illustrative configured value, not a product price rule.

**QA strategy:** Automate now; Integration; High; controlled provider response and final-state evidence required; Not started.
```

**Why this stays together:** The outcomes jointly prove one transaction. Splitting payment recording, membership creation, and confirmation would allow an incomplete business result to appear done.

---

## Example 5: Product Language Before Technical Detail

**Avoid:**

```markdown
**Given:** synthetic Contact/Household and seven Individual programs
**When:** staff completes Step 2 and saves with Cash
**Then:** Draft+Commitment are created without Payment; write failure leaves no partial
```

**Use:**

```markdown
**Scenario:** Save a membership for later payment

**Given:** The employee selected a member and an Individual membership program
**And:** The required membership information is complete
**When:** The employee selects Cash and finishes without recording a payment
**Then:** The membership is saved with Draft status
**And:** No money is recorded as received
**And:** The created membership record opens

**Technical consideration:** The system creates the Subscription and its Commitment without a captured Payment.
```

Create separate scenarios for going back, keeping the current edit, validation errors, persistence failures, and unavailable payment options. They do not share the same primary action or outcome.
