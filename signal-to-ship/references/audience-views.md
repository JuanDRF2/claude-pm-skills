# Audience View Generation Reference

Instructions for the orchestrator to generate audience-specific deliverables in
Phase 6 (Delivery). Each audience gets only the information they need, in the
format they can act on.

## Audience registry

| Audience | What they need | Data sources (Signal to Ship phases) |
|----------|---------------|--------------------------|
| **Dev** | Implementation-ready tickets with ACs, tech context, dependencies | Refinement (stories, ACs, handoffs), Signals (legacy analysis) |
| **QA** | Test cases, coverage matrix, environment needs, risk areas | Refinement (checks, FTCs, automation matrix), Signals (legacy delta) |
| **Product** | Taxonomy alignment, outcome tracking, gap registry | Signals (taxonomy), Specification (gaps), Measurement (metrics) |
| **CSM** | Client-facing summary, implementation steps, known limitations, FAQ | Specification (scope), Signals (competitive), Measurement (what to measure) |
| **Implementation** | Step-by-step setup guide, config changes, layout updates, rollback | Signals (legacy, reference impl), Specification (scope), code analysis |
| **Support** | Knowledge article, known limitations, FAQ, escalation paths | Specification (scope, exclusions), Refinement (edge cases from scenarios) |
| **Marketing** | Value prop, differentiators, competitive positioning, ICP | Signals (competitive), Specification (capabilities), Measurement (impact metrics) |
| **Sales** | Elevator pitch, competitive table, deal-enabling features, objection handling | Signals (competitive), Specification (capabilities) |
| **C-Level** | Roadmap entry, strategic alignment, business impact, timeline | Prioritization (score), Specification (scope), Measurement (success metrics) |
| **End User** | Knowledge article, what changed, how to use, screenshots | Specification (scope), Prototyping (screenshots), Signals (V1 vs V2 delta) |

## Applicability by initiative type

Not every audience needs a deliverable for every feature. The orchestrator selects
applicable audiences based on initiative type, then confirms with the PM.

| Audience | Migration | New feature | Bug fix | Enhancement | Contractual |
|----------|-----------|-------------|---------|-------------|-------------|
| Dev | Always | Always | Always | Always | Always |
| QA | Always | Always | Always | Always | If refined |
| Product | Always | Always | Optional | Always | Optional |
| CSM | Always | If client-facing | If client-impacted | If client-facing | Always |
| Implementation | Always | If config needed | If config change | If config needed | If config needed |
| Support | If UX changes | Always | Always | If UX changes | If client-facing |
| Marketing | Rarely | If differentiating | Never | If differentiating | Never |
| Sales | Rarely | If competitive | Never | If competitive | If deal-related |
| C-Level | If strategic | If strategic | If critical | If strategic | Always |
| End User | If UX changes | Always | If behavior changes | If UX changes | If client-facing |

The orchestrator presents this as a checklist: "For this [migration], I recommend
generating views for: Dev, QA, Product, CSM, Implementation, End User. Marketing
and Sales are not applicable. Do you agree?"

## Generation protocol

### Step 1: Select template

Based on initiative type, select the delivery template from `templates/`:
- Migration: `migration-release-notes.md`
- New feature: `release-notes.md`
- Bug fix: `patch-notes.md`
- Product-level: `product-marketing-spec.md`

### Step 2: Fill template sections

For each applicable audience section in the template, pull data from Signal to Ship phases:

**Part A (General audience):**

| Section | Source |
|---------|--------|
| Why was this done? | Signals: customer pain (Canny), competitive gap, legacy friction |
| What it does | Specification: scope summary, key capabilities |
| Business case example | Signals: Canny customer quotes + Specification: user flow |
| What changed vs V1 | Signals: legacy analysis delta (migration only) |

**Part B (Team-specific):**

| Section | Source |
|---------|--------|
| CS: Beta status | PM input (ask once) |
| CS: Pricing | PM input (ask once) |
| Implementation: Steps | Signals: reference implementation + legacy analysis (config changes, layout updates, feature flags) |
| Support: Known limitations | Specification: exclusions + Refinement: edge cases from scenarios |
| Support: FAQ | Refinement: most common scenarios rephrased as questions |
| Sales: Value prop | Signals: competitive analysis + Specification: key capabilities |
| Sales: Competitive table | Signals: competitor comparison |

**Knowledge Article (End User):**

| Section | Source |
|---------|--------|
| Summary | Specification: scope summary in user language |
| Setup steps | Implementation section (shared) |
| How it works | Specification: main flows, rephrased for end users |
| What the user sees | Prototyping: screenshots from proto or Design Hub |
| Limitations | Support section (shared) |
| FAQ | Support section (shared, filtered for end-user relevance) |

### Step 3: Review with PM

Present the filled template section by section. The PM reviews and approves or
adjusts before publication.

### Step 4: Publish to destinations

Each audience has a destination:

| Audience | Destination | Method |
|----------|-------------|--------|
| Dev | Issue tracker (Jira) | jira-story-publisher skill |
| QA | Refinement package (already there) | Part of story-to-test-workflow output |
| Product | Taxonomy (taxonomy-system) | sync-refinement-package-taxonomy skill |
| Product (artifacts) | System of record, linked to the **journey** (the value entity), not to the work item | Record-only: the orchestrator publishes through its own connections, then records where and when (see `references/system-of-record.md`) |
| CSM | Notion (Release Notes database) | Manual or Notion MCP |
| Implementation | Notion (Release Notes subpage) | Manual or Notion MCP |
| Support | CRM Knowledge (Knowledge Article) | Manual publish from draft |
| Marketing | Notion (Product Marketing page) | Manual or Notion MCP |
| Sales | Notion (Release Notes, Sales section) | Part of release notes |
| C-Level | Roadmap (Notion or tool) | Manual update |
| End User | CRM Knowledge (Knowledge Article) | Manual publish from draft |

The orchestrator generates the content. Publication to each destination requires
separate authorization from the PM.

## Audience view examples

### Dev view (from Signal to Ship data)

```markdown
## Quick Checkout Entry — Dev Summary

**Type:** Migration (V1 CheckoutFromContact -> V2 embed surface)
**Reference impl:** Renewal Program Wizard (FR-2100)
**Package:** quick-checkout-entry (8 stories, 47 ACs, 81 scenarios)

### Key implementation notes
- Embed wiring: use action override, NOT web links (GAP-QC-01)
- Quick Entry shares tabs with Quick Renewal (quick-checkout.entry.tsx)
- V2 widget exists (QuickCheckoutWidget.tsx), CRM wrappers need refactoring
- Post-creation: postMessage QuickCheckoutCreated to CRM host

### Dependencies
- Checkout Wizard backend (shared domain)
- Contacts sync (Contact pre-fill)
- Embeddability contract (complete)
- Payment-provider sandbox (ENV-QC-001)

### Stories: [link to Jira or jira/*.md files]
```

### CSM view (from Signal to Ship data)

```markdown
## Quick Checkout Entry — CSM Briefing

**What's changing:** Staff can now record a checkout directly from the Contact
page in the CRM, without opening the full checkout wizard. The button says
"Complete Checkout" (same as today), but the form is now powered by Acme 2.

**What stays the same:** The button location, the basic flow (select amount,
choose payment method, submit). Existing order records are not affected.

**What's different:** The form opens inline (not in a new window). Payment
confirmation stays on screen until dismissed (instead of auto-redirecting
after 3 seconds).

**Client communication:** No action required from clients. The update is
automatic once deployed.

**FAQ:**
Q: Will existing order data be affected?
A: No. This is a new UI for creating orders, not a data migration.
```

## Release Communication Protocol

Every release artifact must pass the 5-question check before publication:

1. **Why does this matter to THIS audience?** (value narrative specific to them)
2. **Who needs to act?** (clear ownership for this audience)
3. **What changes for them?** (operational clarity)
4. **Are they ready?** (enablement confirmed)
5. **Is the messaging consistent?** (same narrative across all artifacts)

If any question is unanswered, flag it to the PM before publishing.

### Communication timing by gate

Gate-based, not calendar-based ("3 weeks before" does not survive a slipped date):

| Gate / moment | Who to notify | What to send | Template / channel |
|---------------|--------------|--------------|--------------------|
| Gate 3 (spec approved) | GTM leads (CS, Sales, Support) | Early heads-up: problem, target persona, expected timeline | `templates/gtm-early-warning.md`, team channel |
| Gate 4 (prototype validated) | GTM leads + advisory candidates | Prototype link + validation questions: "click through and tell us what's missing" | Team channel + direct message |
| Gate 5 (Judge PASS) | Dev + QA | Stories ready, test plan available, environment needs | Issue tracker (already handled by ticket creation) |
| Gate 6 (delivery) | All applicable audiences | Full artifacts per audience (see applicability matrix) | Per-audience destination |
| Post-deploy (same day, after `delivery.deployed_on` is confirmed) | CS, Support, Sales, Marketing, C-Level | Release announcement: what shipped, who it affects, how to explain the value | Announcements channel + release-notes page |
| Rollback (if needed) | Same audiences that got Gate 6 artifacts | What happened, current status, next update time, interim guidance | `templates/rollback-notice.md`, same channels as the original |

### Every communication is the PM's decision

The orchestrator proposes each message with its recipients and text, and waits for **approve / edit / skip**.
Nothing is sent without that answer, and an answer to one message never covers the next. If the PM says no at a
gate, the flow stops there. Record each decision (and each skip, with its reason) in the state file.

| Gate | The PM chooses |
|------|----------------|
| Gate 2 | build now / backlog / archive |
| Gate 3 | approve / revise / defer to the roadmap |
| Gate 4 | validated / iterate / pivot |
| Gate 5 | PASS (send the handoff) / FAIL (fix and resubmit) |
| Pre-release | go / hold |

### Which communications apply to which kind of work

| Moment | New feature | Enhancement | Migration | Bug fix | Contractual |
|--------|:-----------:|:-----------:|:---------:|:-------:|:-----------:|
| Roadmap review (before scoring) | Full | Full | no | no | no |
| Early heads-up (Gate 3) | yes | if visible | yes | no | yes |
| Prototype feedback request (Gate 4) | yes | if a prototype exists | rarely | no | no |
| Handoff to Dev and QA (Gate 5) | yes | yes | yes | yes | yes |
| Gate 6 artifacts | per matrix | per matrix | per matrix | patch notes | per matrix |
| Post-deploy announcement | yes | yes | yes | if customer-visible | yes |
| Rollback notice | if rolled back | if rolled back | if rolled back | if rolled back | if rolled back |

### Communication timing by rollout type

| Rollout type | When to publish which artifacts |
|--------------|---------------------------------|
| All at once | Deploy day: publish all artifacts together |
| Beta first | Beta start: CSM + Implementation only. GA: Sales + Marketing + End User + C-Level |
| Phased | Each phase: only the artifacts for the affected client segment |
| Internal only | Deploy day: Dev + QA + Product only; no external communication |

### Advisory validation

When Phase 4 produces a validated prototype, the orchestrator asks: "Has this been reviewed
by the customer advisory group? (yes / no / not applicable)". If yes, record
`advisoryValidated: true` and a short `advisoryFeedback`. If no but applicable, offer to share
it first. If not applicable, proceed. Informational, never blocking.

Report back: when the group's input changed something, say what; when it did not, say why. Share that with
the group at the next contact. An advisory group that never hears what happened to its feedback stops giving it.

### Publication tracking

For every artifact generated in Phase 6, the scorecard delivery table tracks:

| Audience | Artifact | Status | Published to | Published at |
|----------|----------|--------|--------------|--------------|

Status values: `draft` | `reviewed` | `published` | `rollback_sent`.

The orchestrator asks the PM to confirm each publication ("CSM briefing is ready. Publish to
the CS channel? yes / no / later"), updates the table afterwards, and at Gate 6 close verifies
that every applicable artifact is `published`. The orchestrator never publishes without that confirmation.

## Adapting for other organizations

The audience registry and applicability matrix are configurable. To adapt:

1. Add or remove audiences in the registry
2. Adjust the applicability matrix for your initiative types
3. Map your data sources to the template sections
4. Configure your publication destinations (replace Notion/Jira/CRM Knowledge
   with your tools)

The template files in `templates/` are the starting point. Modify them to match
your organization's documentation standards.
