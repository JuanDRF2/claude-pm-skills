---
name: launch-comms
description: >
  Turn an approved release note (or a shipped feature) into the set of short, channel-specific
  launch communications: internal Slack announcement, leadership brief, CS/Support heads-up, sales
  enablement blurb, and customer-facing announcement copy. Use this skill whenever the user wants to
  "announce" a launch, "write the Slack post for X", "draft the exec update", "tell CS/Support about X",
  "write the launch email", "give me the changelog entry", "comms for [feature] launch", or wants to
  distribute a release across channels. This skill is the DISTRIBUTION layer downstream of
  release-notes-writer — it consumes the release note, it does not replace it. Always use
  this skill for launch messaging — do not write launch comms freehand.
---

# Launch Comms

You are writing launch communications for a B2B SaaS platform with several product areas.

A release note is the *system of record* for what shipped. Launch comms are the *messages that move it* — each one tailored to a single channel, audience, and action. This skill produces those messages from an existing release note.

---

## Core Principle (Read This First)

The release note already did the thinking — the problem, the outcome, the KPIs, the persona. Your job is **not** to re-analyze the feature. Your job is to **compress and re-voice** it for each channel so the right person reads the right length and knows the one thing to do next.

Three rules govern every message you write:
1. **One audience, one message, one CTA.** If a Slack post has three asks, it has none. Cut to the single next action.
2. **The customer outcome leads — not the mechanics.** Open with what changed for the customer, not what the team built.
3. **Match the channel's native length and voice.** A Slack post is not an exec brief is not a customer email. Length is a feature, not a constraint.

---

## Relationship to release-notes-writer

| | release-notes-writer | launch-comms (this skill) |
|---|---|---|
| **Produces** | One canonical release note | A set of short channel messages |
| **Lives in** | Notion (`collection://<NOTION_RELEASE_NOTES_COLLECTION_ID>`) | Slack, email, changelog, exec docs |
| **Audience** | General + GTM, in one doc | One audience per message |
| **Length** | Comprehensive | Compressed |
| **When** | When the feature ships | When the launch is announced |

If no release note exists yet, **say so and recommend running release-notes-writer first** — comms written without a source-of-truth doc drift from the facts. You may proceed from a Jira epic in a pinch, but flag that the canonical note is still owed.

---

## Workflow — Follow in Order

### Step 1 — Pull the Source

Locate the approved release note. Search the Product Release Notes database (`collection://<NOTION_RELEASE_NOTES_COLLECTION_ID>`) by feature name, or fetch the Jira epic / Notion spec if the user gives a key or link. Extract — **do not re-derive or invent:**

| What to Extract | Where |
|---|---|
| Problem & customer outcome | Release note "Why" / "What it does" |
| KPIs impacted | Release note "KPIs" |
| Persona / business case | Release note "Business Case Example" |
| Pricing, packaging, beta status | Release note "CS" / "Sales" sections |
| Known limitations / edge cases | Release note "Support" section |
| Links: KB article, demo video, Notion note, Figma | Release note + attachments |

If a link or fact is missing, leave a clearly marked `[PENDING — …]` placeholder and list it in the closing checklist. Never fabricate KPIs, pricing, or availability.

### Step 2 — Confirm Surfaces & Metadata (Ask Once)

In a **single message**, confirm which channels to produce and the shared metadata. Reuse across the session.

- **Channels** (default: Slack + Exec brief + CS/Support + Sales): Slack · Exec brief · CS/Support · Sales enablement · Customer email · In-app/changelog · Social
- **Launch date**, **Owner (PM)**, **Product area**
- **Links available**: KB article · demo video · Notion release note · sign-up/opt-in
- **Customer-facing?** Confirm explicitly before writing any external copy.

### Step 3 — Draft All Comms in Chat First

Produce every selected message in the chat for review. The user edits and approves here.

### Step 4 — Hand Off (Never Auto-Send)

**Never send a Slack message or email, and never publish external copy, on your own.** Even when a Slack or Gmail connector is available, the most you do without an explicit, per-message "send it" is create a **draft**. Posting, sending, or publishing is the user's action. State this plainly when you hand off.

---

## Channel Templates

Produce only the channels selected in Step 2. Each is intentionally short.

### A. Internal Slack Announcement
**Channel:** #product or the launch channel · **Voice:** warm, plain, energetic · **Length:** 4–7 lines.

```
:rocket: *[Feature Name] is live* — [one-line customer outcome]

*Why it matters:* [1 sentence — the problem this kills]
*Who it's for:* [persona / product area]
*What to do:* [single CTA — e.g., "CS, flag your beta accounts in the thread"]

Full release note → [Notion link] · Demo → [link or PENDING]
```

### B. Leadership / Exec Brief
**Voice:** outcome-first, quantified, no mechanics · **Length:** 3–5 bullets, no preamble.

```
*[Feature Name] — shipped [date]*
- Problem: [the customer pain, 1 line]
- What changed: [the new capability, in outcome terms]
- Expected impact: [primary KPI + target, e.g., "−30% reconciliation support tickets"]
- Risk / watch: [known limitation or rollout risk, or "none material"]
- Owner: [PM] · Details: [Notion link]
```

### C. CS & Support Heads-Up
**Voice:** direct, operational · **Length:** scannable. Someone should read it and know what to tell a customer.

```
*Heads-up: [Feature Name] is live*
- What customers can now do: [plain outcome]
- Who's affected: [tier / persona / availability]
- Beta status: [Yes/No — opt-in process if Yes]
- KB article: [link or PENDING]
- Known limits (so you're not caught off guard): [limitation, or "none"]
- Where to route questions: [PM / channel]
```

### D. Sales Enablement Blurb
**Voice:** value-forward, anchored to prospect pain · **Length:** 1 line + 3 benefits. Complete **only if the release note marks GTM relevance**; otherwise skip and say why.

```
*How to position [Feature Name]:* [1-sentence value prop anchored to a prospect pain]
- [Outcome-oriented benefit 1]
- [Outcome-oriented benefit 2]
- [Outcome-oriented benefit 3]
[Optional one-line competitive angle — only if the release note supplies it]
```

### E. Customer-Facing Announcement (Email / In-App / Changelog)
**Only when Step 2 confirmed customer-facing.** **Voice:** external, benefit-led, no internal jargon, no unreleased roadmap, no internal team names. **Length:** email ≤ 120 words; changelog ≤ 3 lines.

```
Subject: [Benefit-led, not feature-led — e.g., "Reconcile your books in minutes, not days"]

[Greeting]. [1–2 sentences: what they can now do and why it helps them.]
[1 sentence: how to get started or where to find it.]
[Link to KB / what's-new.]
```

Changelog form:
```
*[Feature Name]* — [one-line customer benefit]. [How to access in one clause.] [Learn more → link]
```

### F. Social / Marketing Snippet (Optional)
**Voice:** external, concise, no hard claims the release note doesn't support · **Length:** 1–2 sentences. Hand to Marketing as a starting point, not final copy.

---

## Voice & Length Guide

| Channel | Voice | Length | Leads with | One CTA |
|---|---|---|---|---|
| Slack | Warm, plain | 4–7 lines | Outcome | Yes |
| Exec brief | Quantified, terse | 3–5 bullets | Impact | Owner/link |
| CS/Support | Operational | Scannable list | What to tell customer | Route |
| Sales | Value-forward | 1 line + 3 | Prospect pain | Position |
| Customer email | External, benefit-led | ≤120 words | Their benefit | Get started |
| Changelog | External, terse | ≤3 lines | Benefit | Learn more |
| Social | External, light | 1–2 lines | Hook | Link |

---

## Standing Rules — Always Apply

1. **Draft first, send never.** Posting to Slack, sending email, or publishing external copy is always the user's action. Create drafts at most.
2. **Don't re-analyze — re-voice.** Pull the problem, outcome, KPIs, and persona from the release note. If they're missing there, the gap belongs in release-notes-writer, not invented here.
3. **One CTA per message.** If you can't name the single next action, the message isn't ready.
4. **External copy is walled off.** No internal team names, no Jira/Notion jargon, no unreleased roadmap, no pricing the release note didn't confirm.
5. **Flag, don't fabricate.** Missing links, KPIs, or availability become `[PENDING — …]` placeholders and a closing checklist item.
6. **GTM sections are conditional.** Skip Sales/social for purely internal or operational releases, and say why — mirror the GTM-relevance test in release-notes-writer.
7. **Source of truth is the release note.** If facts in chat conflict with the note, the note wins; surface the conflict to the user.

---

## Closing Checklist — Before Anything Goes Out

- [ ] Source release note located (or its absence flagged)
- [ ] Every selected channel drafted and reviewed in chat
- [ ] All `[PENDING]` links resolved (KB, demo, Notion, opt-in)
- [ ] Customer-facing copy confirmed jargon-free and roadmap-free
- [ ] Sales/social completed or explicitly skipped with reason
- [ ] User has given per-channel approval before any send/post/publish

---

## Configuration

This file contains placeholders for workspace-specific values. Replace them before use:

| Placeholder | What to set |
|---|---|
| `<NOTION_RELEASE_NOTES_COLLECTION_ID>` | The Notion database ID for your Product Release Notes collection |
