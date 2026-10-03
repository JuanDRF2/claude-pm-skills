# User Story Mapping Example

## Example: Story Map for Freelance Invoicing Product

```markdown
## User Story Map: Freelance Invoicing

### Who

#### Segment:
- Freelance creative professionals (designers, writers, photographers)

#### Persona:
- Sarah, 35, freelance graphic designer
- Manages 5-10 clients at once
- Struggles with invoicing, payment tracking, and follow-ups
- Wants to spend less time on admin, more time designing
- Currently uses Excel + email, which is error-prone and time-consuming

### Backbone

#### Narrative:
- Complete a client project from kickoff to final payment without admin hassle

#### Activities:
1. Negotiate project scope and pricing
2. Execute design work
3. Deliver final assets
4. Send invoice and receive payment
5. Follow up on late payments

### Steps:

**For Activity 1: Negotiate project scope and pricing**
- Step 1: Review client brief
- Step 2: Draft project proposal
- Step 3: Negotiate timeline and budget

**For Activity 2: Execute design work**
- Step 1: Create initial concepts
- Step 2: Share concepts for feedback
- Step 3: Iterate based on feedback
- Step 4: Finalize design

**For Activity 3: Deliver final assets**
- Step 1: Export final files in client-requested formats
- Step 2: Upload files to shared folder or email
- Step 3: Confirm client receipt

**For Activity 4: Send invoice and receive payment**
- Step 1: Create invoice with project details
- Step 2: Send invoice to client
- Step 3: Track payment status
- Step 4: Confirm payment received

**For Activity 5: Follow up on late payments**
- Step 1: Identify overdue invoices
- Step 2: Send payment reminder
- Step 3: Escalate if still unpaid

### Tasks (Sample for Activity 4, Step 1: Create invoice):

**MVP (Release 1):**
- Task 1: Enter client name and contact info
- Task 2: Add line items (description, hours, rate)
- Task 3: Calculate total automatically
- Task 4: Preview invoice before sending

**Release 2:**
- Task 5: Add logo and custom branding
- Task 6: Save invoice templates for repeat clients
- Task 7: Auto-populate line items from project notes

**Future:**
- Task 8: Generate invoices from time tracking data
- Task 9: Multi-currency support
```

> For workflows with product variants, external integrations, or irreversible transactions, extend this basic example with the discovery ledger, variation matrix, alternate/recovery paths, and rule traceability from `template.md`.

## Mini Example: Membership Variation Matrix

| Capability | Individual | Family | Gift |
|---|---|---|---|
| Buyer information | Required | Required | Required |
| Additional members | Not applicable | Optional; limit unknown (`Q-01`) | Recipient required |
| Personalized message | Not applicable | Not applicable | Optional (`BR-07`) |
| Communication recipient | Buyer | Buyer | Buyer or recipient (`BR-08`) |
| Future start | Unknown (`Q-02`) | Unknown (`Q-02`) | Supported; range unknown (`Q-03`) |

This matrix prevents unknown limits and date policies from becoming accidental stories or acceptance criteria.
