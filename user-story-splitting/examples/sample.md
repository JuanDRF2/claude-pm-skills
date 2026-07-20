# User Story Splitting Examples

## Example 1: A Workflow Split That Requires Caution

**Original Story:**
```markdown
### User Story 100: Complete Checkout Process

**Use Case:**
- **As a** shopper
- **I want to** complete checkout, including entering shipping, payment, and confirming my order
- **so that** I can receive my items

**Acceptance Criteria:**
- **Given:** I have items in my cart
- **When:** I enter shipping address, payment info, and confirm
- **Then:** My order is placed
```

**Release caution:** These stories are sequential and may not deliver independent customer value. Use this split only when each step can be released, observed, or learned from meaningfully. For a new checkout architecture, prefer a thin end-to-end purchase first and add advanced variations afterward.

**Why it needs splitting:** Multiple workflow steps bundled together.

**Split using Workflow Steps:**

```markdown
### Split 1: Enter Shipping Address

**User Story 101:**
- **Summary:** Enter shipping address during checkout

**Use Case:**
- **As a** shopper
- **I want to** enter my shipping address
- **so that** my items are delivered to the right location

**Acceptance Criteria:**
- **Given:** I have items in my cart
- **When:** I enter a valid shipping address and click "Continue"
- **Then:** I proceed to payment entry

---

### Split 2: Enter Payment Information

**User Story 102:**
- **Summary:** Enter payment info during checkout

**Use Case:**
- **As a** shopper
- **I want to** enter my credit card information
- **so that** I can pay for my order

**Acceptance Criteria:**
- **Given:** I have entered a shipping address
- **When:** I enter valid payment info and click "Continue"
- **Then:** I proceed to order confirmation

---

### Split 3: Confirm Order

**User Story 103:**
- **Summary:** Review and confirm order

**Use Case:**
- **As a** shopper
- **I want to** review my order details and confirm
- **so that** my order is placed

**Acceptance Criteria:**
- **Given:** I have entered shipping and payment info
- **When:** I review the order summary and click "Place Order"
- **Then:** My order is submitted and I receive a confirmation
```

---

## Example 2: Prefer a Thin End-to-End Membership Slice

**Original epic:** Allow guests and authenticated users to purchase individual, family, and gift memberships, including optional family members, messages, recipient selection, and future start dates.

**Patterns evaluated:** Workflow, business-rule variation, acceptance-criteria complexity, external dependencies, and major effort.

**Recommended sequence:**

1. Guest purchases an individual membership end to end.
2. Individual purchase handles rejection and duplicate submission safely.
3. Authenticated buyer reuses confirmed profile information.
4. Buyer purchases a basic family membership.
5. Buyer optionally adds family members.
6. Buyer purchases a basic gift membership for a recipient.
7. Buyer selects the communication recipient and adds a message.
8. Buyer schedules a supported future start date.

**Why this works:** The first slice exercises selection, buyer data, payment, membership creation, and confirmation. Later slices add distinct rule variations and risk without pretending isolated form steps are independent outcomes.

---

## Example 3: Splitting by Acceptance Criteria Complexity

**Original Story:**
```markdown
### User Story 200: Manage Team Members

**Use Case:**
- **As a** team admin
- **I want to** manage team members
- **so that** I can control access

**Acceptance Criteria:**
- **When:** I add a member, Then they receive an invite
- **When:** I remove a member, Then they lose access
- **When:** I change a member's role, Then their permissions update
```

**Why it needs splitting:** Multiple "When/Then" statements.

**Split using Acceptance Criteria Complexity:**

```markdown
### Split 1: Add Team Members

**User Story 201:**
- **Summary:** Invite new team members

**Use Case:**
- **As a** team admin
- **I want to** invite new members to my team
- **so that** they can access shared resources

**Acceptance Criteria:**
- **Given:** I have admin permissions
- **When:** I enter an email and click "Invite"
- **Then:** The recipient receives an email invitation

---

### Split 2: Remove Team Members

**User Story 202:**
- **Summary:** Remove team members

**Use Case:**
- **As a** team admin
- **I want to** remove members from my team
- **so that** they no longer have access

**Acceptance Criteria:**
- **Given:** I have admin permissions
- **When:** I click "Remove" next to a member's name
- **Then:** That member loses access immediately

---

### Split 3: Change Member Roles

**User Story 203:**
- **Summary:** Update team member roles

**Use Case:**
- **As a** team admin
- **I want to** change a member's role
- **so that** their permissions match their responsibilities

**Acceptance Criteria:**
- **Given:** I have admin permissions
- **When:** I select a new role for a member and save
- **Then:** Their permissions update to match the new role
```
