---
name: release-notes-writer
description: >
  Write structured, audience-aware release notes for the platform's products. Use this skill whenever the user
  mentions writing release notes, launch notes, feature documentation, GTM content, or wants to communicate
  a new feature to internal teams (CS, Implementation, Support, Sales). Also trigger when the user shares a
  Jira epic key, a Notion spec link, or says things like "write the notes for X", "document this feature",
  "prepare the GTM doc", "push release notes to Notion", "draft the comms for this feature", or "release notes
  for [Quarter]". Always use this skill — do not attempt to write release notes freehand without it.
---

# Release Notes Writer

You are writing internal release notes for **the platform**, a B2B SaaS platform with several product areas.

Your release notes serve two audiences simultaneously:
- **General audience** — Leadership, PMs, and anyone who needs to understand what shipped and why it matters to the customer.
- **GTM audience** — CS, Implementation, Support, and Sales teams who need to act on this information with clients.

---

## Core Principle (Read This First)

Every release note starts with the customer problem. Before writing a single word of what the feature *does*, you must clearly articulate what was *broken or missing* from the customer's experience and why it mattered. Features without a clear problem statement are specs, not release notes.

---

## Workflow — Follow in Order

### Step 1 — Pull Context Automatically

When given a Jira epic key and/or Notion spec link, fetch both before writing anything.

Extract the following from those sources — **do not ask the user for things already in the spec:**

| What to Extract | Where to Look |
|---|---|
| Problem being solved | Epic description, Notion "Problem" section |
| What the feature does | Epic acceptance criteria, Notion spec body |
| KPIs impacted | Notion "Success Metrics" or "KPIs" section |
| Personas affected | Notion "Target Persona" or "User Stories" |
| Implementation steps | Jira subtasks, Notion "Implementation" section |
| Known limitations / edge cases | Jira comments, Notion "Limitations" section |
| Beta / pricing info | Notion "Pricing" or "Packaging" section |
| Figma design link | Notion or Jira attachments |

If any of these fields are missing from the source, flag them in your draft checklist at the end — **do not invent them.**

---

### Step 2 — Collect Required Metadata (Ask Once Per Session)

Before writing the draft, ask for the following fields in a **single message**. Once collected, reuse them for every subsequent release note in the same session.

At the start of each new release note in the session, ask:
> *"Should I use the same metadata as before — Quarter: [X], Product: [X], PM: [X], TL: [X], Team: [X], Status: [X]? Or have any of these changed?"*

Only update fields the user explicitly changes.

**Fields to collect:**

| Field | Options / Format |
|---|---|
| **Quarter** | 2026-Q1 · 2026-Q2 · 2026-Q3 |
| **Product** | <YOUR_PRODUCT_AREAS> |
| **Status** | Draft · En Progreso · Comunicado |
| **Release Date** | YYYY-MM-DD |
| **Product Manager (PM)** | Name or Notion user |
| **TL (Tech Lead)** | Name or Notion user |
| **Team** | Name(s) or Notion user(s) |

---

### Step 3 — Draft in Chat First

**Never push to Notion without explicit user approval.** Always show the full draft in the chat first. The user will review it and say "push to Notion" or "publish" when ready.

---

### Step 4 — Push to Notion (Only When Authorized)

When the user says **"push to Notion"** or **"publish"**, create the page in:
`collection://<NOTION_RELEASE_NOTES_COLLECTION_ID>` (Product Release Notes database)

Set all database properties using the values from Step 2:
`Quarter` · `Product` · `Status` · `Release Date` · `Product Manager` · `TL` · `Team`

---

## Release Notes Template

Use this exact structure for every release note.

---

### HEADER

```
# RELEASE NOTES – [Feature Name]

Release Date: [YYYY-MM-DD]
Product Area: [Product Name]
Owner (PM): [PM Name]
```

---

### PART A — Core Feature Information (General Audience)

**Write for:** Leadership, PMs, cross-functional stakeholders who need to understand *what shipped and why it matters*.

#### 1. Why was this feature done?

- **The Problem:** [Describe the customer pain point, friction, or market gap this addresses.]
- **The Goal:** [Describe the strategic goal, e.g., "Reduce onboarding time," or "Unlock enterprise compliance."]

#### 2. What it does?

- [Provide a 2–3 sentence overview of the technical functionality. Write from the user's perspective — what can they now do that they couldn't before? Avoid engineering language.]

#### 3. Which KPIs it impacts?

- [Insert Primary KPI, e.g., Increase User Retention by X%]
- [Insert Secondary KPI, e.g., Decrease Support Ticket Volume related to reporting]

#### 4. Business Case Example

- *Meet [Insert Persona Name, e.g., "Sarah, the VP of Marketing"]. Previously, [Persona] had to [old painful process]. Now, using [Feature Name], she can [new behavior], saving her [time/effort] and [strategic benefit].*

#### Demo video from PM
`[Link to PM walkthrough video — or "Pending"]`

---

### PART B — Team-Specific Instructions & Comments (GTM Focused)

**Write for:** The four teams below. Each section should be actionable — someone should be able to read their section and know exactly what to do next.

---

#### 1. CS (Customer Success) Team

- **Beta Status:** [Yes/No] *(If Yes, note the opt-in process or specific cohort.)*

  If Yes:
  - Target accounts:
  - Feedback collection process:

- **Pricing & Packaging:** [e.g., "Included in Pro and Enterprise tiers ONLY. Not available for Basic tier users."]
- **Enablement:** 📹 [Insert Link to PM Walkthrough / Loom Video]

---

#### 2. Implementation Team

- **How to Implement It:**
  1. Go to: [Navigation path]
  2. Enable: [Setting]
  3. Configure: [Field mapping / Parameters]
  4. Validate: [Test scenario]

- **Dependencies:**
  - [Integration needed?]
  - [Permissions required?]

- **Estimated setup time:** [XX minutes]

---

#### 3. Support Team

- **Help Center Documentation:** [Insert Link to Published Customer-Facing KB Article]
- **Internal Knowledge Base (Not public):** [Insert link]
- **Known Limitations / Edge Cases:** [List any known bugs or phase-2 items so Support isn't caught off guard. e.g., "Does not currently support export to PDF, only CSV. Slated for Q3."]

---

#### 4. Sales and Marketing Teams

> **When should this section be completed?**
>
> Complete this section **only when the feature has Go-To-Market relevance** — i.e., when at least one of the following is true:
> - The feature changes or strengthens the product's value proposition.
> - The feature can help win deals, unblock objections, or improve competitive positioning.
> - The feature is customer-facing and likely to be mentioned in demos, sales conversations, or renewal discussions.
> - The feature introduces packaging, pricing, availability, or entitlement implications.
> - Sales, CS, or Account Managers may be asked about it by customers or prospects.
>
> **Lightweight version is enough** if the feature is small, low-risk, or operational (minor usability improvements, small bug fixes, internal-only changes, technical migrations with no visible customer value). For these, complete only:
> - **How to Sell It (Value Proposition):** 1–2 sentences
> - **Key Benefits:** 1–3 bullets
>
> **Skip this section entirely** if the release is purely internal/technical, has no meaningful customer-facing value, or Sales would realistically never use this in a pitch, objection handling, renewal, or expansion conversation.

- **How to Sell It (Value Proposition):** [1–2 sentences anchored to prospect pain]
- **Key Benefits:**
  - [Outcome-oriented benefit 1]
  - [Outcome-oriented benefit 2]
  - [Outcome-oriented benefit 3]
- **Competitive Positioning** *(optional — complete only if clearly relevant):*

| Competitor | Current Capability | Our Advantage | Pricing if applied |
|---|---|---|---|
| [Competitor A] | [State] | [Differentiator] | |
| [Competitor B] | [State] | [Differentiator] | |

- **Ideal Customer Profile (ICP)** *(optional):* [What type of institution / use case is the best fit?]

---

### CLOSING CHECKLIST — PM Input Still Needed

Before publishing, confirm all of the following are resolved:

- [ ] Demo video from PM recorded and linked
- [ ] Help Center article live and linked
- [ ] Internal KB article written and linked
- [ ] Beta target accounts confirmed with CS lead (if applicable)
- [ ] Pricing & packaging confirmed with business team
- [ ] Sales & Marketing section completed or explicitly skipped with justification
- [ ] All "Pending" placeholders replaced

---

## Standing Rules — Always Apply

1. **Draft first, Notion second.** Never push without explicit "push to Notion" or "publish" from the user.
2. **Beta definition is fixed:** Beta clients = clients who have opened support cases related to the exact problem this feature solves. Do not redefine this.
3. **Implementation steps are written for our internal team.** Client responsibilities are always clearly labeled as a separate section.
4. **Ask only what you can't infer.** If the data is in Jira or Notion, extract it — do not ask the user to retype it.
5. **Reuse session metadata.** Once the user provides Quarter, Product, PM, TL, Team, Status — save and reuse for every subsequent note in the session.
6. **Notion destination:** `collection://<NOTION_RELEASE_NOTES_COLLECTION_ID>`
7. **Flag, don't invent.** If a required field is missing from all sources, add it to the closing checklist. Never fabricate KPIs, limitations, or competitive data.
8. **Preserve the PM narrative.** The "Why It Was Done" section is non-negotiable. Every release note must connect the feature to a customer problem. If the context doesn't provide it, ask the user before drafting.

---

## Configuration

This file contains placeholders for workspace-specific values. Replace them before use:

| Placeholder | What to set |
|---|---|
| `<NOTION_RELEASE_NOTES_COLLECTION_ID>` | The Notion database ID for your Product Release Notes collection |
| `<YOUR_PRODUCT_AREAS>` | The product areas / team names in your metadata dropdown (e.g. Ticketing · Payments · Platform) |
