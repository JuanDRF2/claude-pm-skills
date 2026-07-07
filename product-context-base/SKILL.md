---
name: product-context-base
description: >
  Builds and stores a rich product context snapshot for a specific team by pulling
  the last 6 months of Jira issues and relevant Notion product pages. Use this skill
  whenever a PM or Head of Product says things like "load my product context",
  "give yourself context about my product", "catch up on what we've been building",
  "refresh your memory about our product", "initialize context for my team", or
  any time a user wants Claude to understand the history of product decisions before
  doing strategic work, writing stories, prioritizing roadmap, or doing analysis.
  Always trigger this skill before any deep product work if context has not been
  loaded yet in the conversation.
compatibility:
  tools:
    - Atlassian (Jira + Confluence MCP)
    - Notion MCP
  storage: persistent (window.storage API via artifact)
---

# Skill: Product Context Base

## Purpose

This skill gives Claude a working memory of the product by loading:
1. The last 6 months of Jira issues for a specific team project
2. Relevant Notion product pages tagged under the team's product area

The output is a structured context snapshot saved to persistent storage and
displayed as a readable summary the PM can verify. Once loaded, Claude uses
this context to reason better about strategy, story creation, prioritization,
and product decisions — without needing to re-fetch data every conversation.

---

## Step 0 — Ask for team configuration

Before fetching anything, ask the user:

> "Which team should I load context for? Please tell me:
> 1. **Team name** (e.g. [YourTeamName])
> 2. **Jira project key** (e.g. `PROJ`)
> 3. **Notion product label** — the value in the `Product` field that matches your team (e.g. `[YourTeamName]`)
>
> I'll pull the last 6 months of Jira issues and your team's Notion product pages."

Wait for the user's response before proceeding.

---

## Step 1 — Fetch Jira context

Use the Atlassian MCP to query Jira.

### JQL query to use:
```
project = {PROJECT_KEY}
AND created >= -180d
ORDER BY created DESC
```

### Fields to request:
- `summary`
- `description`
- `status`
- `issuetype`
- `priority`
- `created`
- `assignee`
- `labels`
- `resolution`

### What to extract and synthesize:
- **Epics and major themes**: Group issues by epic or label to identify the main bets the team has made
- **Shipped features**: Issues with status `Done` or `Released` — what got built
- **Abandoned or deprioritized work**: Issues moved to `Won't Do` or `Cancelled` — what was decided against (these are gold for understanding product thinking)
- **Current in-progress work**: Issues `In Progress` or `In Review`
- **Open backlog items**: Issues in `To Do` or `Backlog` with high priority
- **Key decisions visible in issue descriptions**: Any acceptance criteria, technical notes, or design rationale captured

Aim to synthesize, not just list. For each major theme, write 2–3 sentences that explain **what the team was trying to do and why**, based on the issues.

Limit processing to the 100 most recent issues if the project is large. Prioritize Epics and Stories over Tasks and Subtasks.

---

## Step 2 — Fetch Notion context

Use the Notion MCP to find relevant pages.

### Search strategy:
1. Start with the Notion page provided by the user's organization (the product database)
2. Filter pages where the `Product` field equals the team name provided (e.g. `[YourTeamName]`)
3. Fetch the content of up to **10 most recently updated pages**

### What to extract:
- **Strategy docs**: Vision, mission, OKRs, product principles
- **Decision logs**: Any page documenting why a decision was made
- **PRDs and specs**: Feature definitions and their rationale
- **Retrospectives or learnings**: What the team learned from past bets
- **Competitive or market notes**: Any pages capturing external context

For each page, extract a 2–4 sentence summary capturing the key insight or decision documented. Do not reproduce full page content — synthesize the meaning.

---

## Step 3 — Build the context snapshot

Combine Jira + Notion data into a structured context object using this format:

```json
{
  "team": "[YourTeamName]",
  "jira_project": "PROJ",
  "generated_at": "2026-03-28",
  "valid_until": "2026-04-28",
  "product_snapshot": {
    "current_focus": "One paragraph: what is this team primarily working on right now and why",
    "key_bets_last_6_months": [
      {
        "theme": "Theme name",
        "description": "What the team bet on and why",
        "outcome": "shipped | in_progress | abandoned | unclear"
      }
    ],
    "shipped": ["Summary of major shipped items"],
    "in_progress": ["What is actively being built"],
    "abandoned_or_deprioritized": ["What was cut and any visible rationale"],
    "open_strategic_questions": ["Unresolved items or open backlog themes worth noting"],
    "key_decisions": ["Important product decisions visible in Jira/Notion"],
    "notion_pages_synthesized": [
      {
        "title": "Page title",
        "insight": "2-sentence summary of key insight or decision"
      }
    ]
  },
  "raw_stats": {
    "jira_issues_analyzed": 0,
    "notion_pages_analyzed": 0,
    "date_range": "YYYY-MM-DD to YYYY-MM-DD"
  }
}
```

---

## Step 4 — Save to persistent storage

Save the context snapshot using the persistent storage API:

```javascript
const storageKey = `product-context:${teamName.toLowerCase().replace(/\s+/g, '-')}`;
await window.storage.set(storageKey, JSON.stringify(contextSnapshot));
```

This allows the context to persist across sessions so the PM doesn't need to
reload it every conversation.

---

## Step 5 — Display the context summary to the user

After saving, present the context as a clean, readable summary — NOT as raw JSON.

Use this structure in your response:

---

### 🗂 Product context loaded: {Team Name}
**Generated:** {date} | **Valid until:** {date + 30 days} | **Coverage:** last 6 months

**Current focus**
{current_focus paragraph}

**Key bets (last 6 months)**
For each bet: name, description, outcome badge (✅ Shipped / 🔄 In Progress / ❌ Abandoned)

**What's in progress now**
Bullet list of active work

**Key decisions on record**
Bullet list of notable product decisions

**Open strategic questions**
Bullet list of unresolved themes or tensions visible in the data

**Notion pages synthesized**
List of page titles with their 1-sentence insight

---

Then add:
> ✅ Context saved. I'll use this throughout our conversation. To refresh it, just say "reload product context for [team]".

---

## Step 6 — Activate context in the conversation

Once context is loaded, Claude should:
- Reference the snapshot when writing user stories ("Based on your current focus on X...")
- Use it when doing prioritization ("Given that Y was recently abandoned, this suggests...")
- Surface relevant past decisions when they bear on the current question
- Flag when a request contradicts a known past decision or current bet

If the user starts a new conversation and context was previously saved, check storage first:

```javascript
try {
  const stored = await window.storage.get(`product-context:${teamSlug}`);
  if (stored) {
    const ctx = JSON.parse(stored.value);
    // Check if context is still valid (within 30 days)
    const validUntil = new Date(ctx.valid_until);
    if (new Date() <= validUntil) {
      // Use this context — it's fresh enough
    } else {
      // Prompt user: "Your product context is from {date}. Want me to refresh it?"
    }
  }
} catch (e) {
  // No stored context — proceed with Step 0
}
```

---

## Edge cases and handling

| Situation | How to handle |
|-----------|--------------|
| Jira project key doesn't exist | Tell the user, ask them to verify the key |
| No Notion pages found for team | Proceed with Jira only, note the gap to the user |
| More than 100 Jira issues found | Process the 100 most recent, note the total count to the user |
| Context already saved and still valid | Ask: "I have context from {date}. Want to use it or refresh?" |
| Context expired (>30 days old) | Prompt to refresh automatically |
| User wants context for multiple teams | Run the skill once per team, store separately per team key |

---

## What makes this context valuable

The goal is not to give Claude a list of tickets. The goal is to give Claude
the **product thinking** behind the work — so that when a PM asks "should we
build X?", Claude can respond with awareness of past bets, current focus, and
the team's accumulated decision-making patterns.

Always synthesize for meaning. A ticket titled "Fix pagination bug" is
forgettable. A pattern of 12 performance fixes in the last 3 months tells a
story about where the team's quality debt lies.

**This context should make Claude feel like a colleague who's been on the team
for 6 months — not a consultant reading a brief for the first time.**
