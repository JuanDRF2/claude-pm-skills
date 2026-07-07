# Product Spec Agent — Onboarding for New PMs

This is a Claude Skill that helps you produce rigorous Product Specs by interviewing you, pulling real Salesforce data, and publishing a structured spec to Notion. It's not a one-shot generator. It's a sparring partner — expect to be challenged.

## What it does

When you type **"create a product spec for [feature]"** in a Claude conversation, the skill:

1. Asks you for the basics — product, feature, jobs to be done, technical lane, domain team.
2. Pulls Salesforce cases to ground the business case in real data. Cases are matched by **Product Feature** (the formal SF taxonomy), broken down by Request Category / Case Priority / Severity, and deduplicated by account for ARR exposure. Implementation Cases are excluded (those are internal cost, not client demand).
3. Pauses for your reaction to the business case.
4. Walks you through strategic questions — problem, why now, success metrics, constraints, non-goals, architecture context, dependencies.
5. Drafts the full spec in the conversation.
6. Pauses for your review and edits.
7. Publishes the approved spec to the Notion **Product Specs** database (under Mini Specs).

Total time: 30–60 minutes per spec, mostly spent in the back-and-forth.

## Before your first spec

Make sure these are connected to your Claude account:

1. **Salesforce MCP** — for case + ARR data. Use the same connector configuration as other PMs on your team.
2. **Notion MCP** — for publishing to the Product Specs database. Make sure the integration has access to the Mini Specs page tree.

If either isn't working, talk to your Salesforce/Notion admin or IT contact before starting a spec — running half a spec without one of these wastes everyone's time.

## How to invoke

Just type, in a normal Claude conversation:

> create a product spec for [your feature]

You can also say "PRD for X" or "draft a spec for X" — the skill recognizes a few variations.

The skill takes over from there. Answer its questions, push back when it gets something wrong (it will get things wrong — that's why you're in the loop), and edit the draft until you're happy.

## What the skill expects from you

- **Be specific about the feature.** "Improve membership" is too vague. "Digital Membership Cards" is right.
- **Know your jobs to be done.** Most features have 2–6 JTBDs across multiple user roles. If you have only one, the skill will push back.
- **Know your lane.** Is this a V2-native build, an SF package update, or both during migration? If unsure, default to V2-native — SF packages are bug-fix-only.
- **Push back when the skill is wrong.** It will assume things. Correct it. The interview is the value.

## What you can edit after publish

The spec lands in Notion as a **Draft**. You (and reviewers) can:

- Edit any section directly in Notion
- Promote the Status from Draft → In Review → Approved → Building → Shipped
- Add comments and reviewers
- Link to JIRA projects, ADRs, etc.

The skill writes a complete spec, but it's not the last word. Treat it as a high-quality first draft.

## When NOT to use this skill

- **Architecture decisions** (ADRs) — use the Architecture Guild process, not this.
- **Tiny enhancements** — a one-line config change doesn't need a spec.
- **Pure bug fixes** — file in JIRA, not here.
- **Strategy documents / "Love Letters"** — these are a different format.

## Where to get help

If the skill misbehaves or produces nonsense, share the conversation with your team lead or post in the Product channel. The skill is versioned — feedback drives improvements.
