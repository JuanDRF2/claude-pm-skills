---
name: weekly-product-pulse
description: >
  Generates a structured weekly status report for the Head of Product by pulling
  the active sprint from all product team Jira projects, grouping results by team,
  and surfacing delivery health, blockers, and risks. Use this skill whenever the
  Head of Product asks for things like "give me the weekly pulse", "what's the
  status across teams this week", "how are the sprints going", "weekly update",
  "what got shipped this week", "sprint health report", or any time a weekly or
  sprint-level cross-team overview is requested. Always trigger this skill for
  cross-team status requests — do not attempt to summarize Jira manually without it.
compatibility:
  tools:
    - Atlassian (Jira MCP)
---

# Skill: Weekly Product Pulse

## Purpose

This skill gives the Head of Product a single, structured view of what's
happening across all product teams in the current sprint. It answers four
questions per team:

1. **What got done?** — Closed issues in the active sprint
2. **What's at risk?** — Issues that are blocked, overdue, or stuck across multiple sprints
3. **What are the teams working on?** — Active work with enough context to understand the bet
4. **Are there patterns that need attention?** — Multi-sprint carry-overs, time overruns, recurring blockers
5. **What's the bug health?** — Open vs. closed bugs per team, carry-over bugs, and high-priority unstarted bugs

The output is a weekly digest — sharp, scannable, opinionated. Not a raw data
dump. Think of it as the briefing a good Chief of Staff would hand the Head of
Product on Monday morning.

---

## Projects in scope

Always query all five projects unless the user specifies otherwise:

| Project Key | Team |
|-------------|------|
| `PP` | the finance module |
| `NOXSCRUM` | Ticketing |
| `FR` | Fundraising |
| `SH` | Shop |
| `REN` | Rentals |

---

## Step 1 — Find the active sprint for each project

For each project, run a JQL query to identify the currently active sprint:

```jql
project = {PROJECT_KEY} AND sprint in openSprints()
ORDER BY updated DESC
```

Extract:
- Sprint name
- Sprint start date
- Sprint end date
- Total issues in sprint

If a project has no open sprint, note it in the report as "No active sprint found" and skip to the next project.

---

## Step 2 — Fetch all issues in each active sprint

For each project with an active sprint, run:

```jql
project = {PROJECT_KEY}
AND sprint in openSprints()
ORDER BY status ASC, priority DESC
```

### Fields to request per issue:
- `summary`
- `status`
- `issuetype`
- `priority`
- `assignee`
- `story_points` (or `customfield_10016` — the story points field)
- `timespent` (actual time logged in seconds)
- `timeoriginalestimate` (original estimate in seconds)
- `timeestimate` (remaining estimate)
- `created`
- `updated`
- `labels`
- `sprint` (to detect if issue was carried from a previous sprint)
- `parent` (to identify the parent epic)
- `customfield_10014` (Epic Link, if present)
- `comment` (latest comment only — to understand blockers)

---

## Step 3 — Classify each issue

For each issue, apply these classifications:

### Delivery status
- ✅ **Done** — Status is `Done`, `Released`, `Closed`, or equivalent
- 🔄 **In Progress** — Status is `In Progress`, `In Review`, `Testing`, or equivalent
- 📋 **Not Started** — Status is `To Do`, `Backlog`, `Open`
- 🚫 **Blocked** — Has a label `blocked`, or latest comment mentions blocker language ("blocked", "waiting on", "dependency", "can't proceed")

### Bug classification
Separate bugs from stories and tasks throughout the entire report. A bug in a sprint
is a signal about quality debt — it deserves its own visibility, not to be buried
in a generic issue list.

- **Bug in sprint** — `issuetype = Bug` AND issue is in the active sprint
- **Bug closed this sprint** — `issuetype = Bug` AND status is Done/Closed AND resolved within sprint dates
- **Bug open and not started** — `issuetype = Bug` AND status is To Do/Backlog — flag if it has High or Critical priority
- **Bug carry-over** — `issuetype = Bug` AND carrying over from a previous sprint (apply same multi-sprint logic as stories)

Count bugs separately from stories when computing sprint totals.

### Risk flags (surface these prominently)
- 🔴 **Multi-sprint carry-over** — Issue was created more than (sprint_duration + 7) days ago and is still not Done. This means it has survived at least one full sprint without closing.
- 🟡 **Time overrun** — `timespent` > `timeoriginalestimate` AND issue is not yet Done. Formula: `(timespent / timeoriginalestimate) > 1.0`. Only flag if both values are present and non-zero.
- 🟠 **Stale in-progress** — Status is `In Progress` but `updated` date is more than 4 days ago with no new comments or status change.
- ⚠️ **Sprint end risk** — Issue is `In Progress` or `Not Started` and the sprint ends within 2 days.

---

## Step 4 — Fetch epic context for flagged items

For any issue that is:
- Carrying over from a previous sprint, OR
- Flagged as blocked or stale

...retrieve its parent epic to give the Head of Product enough context to understand what bet is at risk.

Use the `parent` field or `customfield_10014` (Epic Link) to identify the epic key, then fetch the epic's:
- Summary (title)
- Description (first 300 characters are enough)
- Status

This allows the pulse report to say: *"This story is part of the 'Automated Reconciliation' epic, which is the team's main Q2 bet — a slip here is significant."*

Only fetch epics for flagged issues. Don't fetch epics for healthy, on-track items — it's not necessary and wastes tokens.

---

## Step 5 — Synthesize and write the report

Write the report using the template below. Be opinionated. Flag the things that
actually matter. Don't just list issues — synthesize what they mean.

---

### OUTPUT TEMPLATE

```
# Weekly Product Pulse
**Week of:** {Monday of current week} | **Generated:** {today's date}
**Sprint coverage:** {active sprint names across all teams}

---

## Executive summary
{2–4 sentence cross-team overview. What's the overall health this week?
Are there systemic patterns? Is there a team that stands out — positively or negatively?
What does the Head of Product need to act on today?}

---

## Team-by-team breakdown

### 🏦 the finance module (PP)
**Sprint:** {sprint name} | **Ends:** {end date} | **Health:** {🟢 On Track / 🟡 At Risk / 🔴 Off Track}

**Delivered this sprint**
- [Issue key] Summary — {story points if available}
- ...

**In progress**
- [Issue key] Summary — assigned to {name}, {X days in progress}
  {If epic context is relevant: "→ Part of [Epic Name]: {1-sentence epic description}"}

**Not started (still in sprint)**
- [Issue key] Summary — {priority}

**🐛 Bugs this sprint**
| | Count |
|---|---|
| Open (in sprint, not done) | {N} |
| Closed this sprint | {N} |
| Carried over from previous sprint | {N} |
| High/Critical priority not started | {N} |

{If there are no bugs: "No bugs in this sprint." — state it explicitly, it's good news.}
{If there are carry-over bugs or unstarted high-priority bugs, call them out by key:
  e.g. "🔴 [PP-88] 'Payment webhook fails on retry' — carried over 2 sprints, High priority, unassigned."}

**⚠️ Alerts**
- 🔴 [Issue key] "{Summary}" has been open for {N} sprints with no resolution.
  → Epic: {Epic name} | Last update: {date}
- 🟡 [Issue key] "{Summary}" has {Xh logged} vs {Yh estimated} ({Z% overrun}).
- 🟠 [Issue key] "{Summary}" has been in progress for {N} days with no updates.

**What the team is working on**
{2–3 sentence narrative. What is the dominant theme of this sprint's work?
What is the team trying to move forward? Is there a clear throughline across
the in-progress items? If the team's work feels scattered, say that.}

---

### 🎫 Ticketing (NOXSCRUM)
[same structure]

---

### 💰 Fundraising (FR)
[same structure]

---

### 🛒 Shop (SH)
[same structure]

---

### 🏠 Rentals (REN)
[same structure]

---

## Cross-team bug summary

| Team | Bugs open | Bugs closed | Carry-overs | High/Critical unstarted |
|------|-----------|-------------|-------------|------------------------|
| the finance module | {N} | {N} | {N} | {N} |
| Ticketing | {N} | {N} | {N} | {N} |
| Fundraising | {N} | {N} | {N} | {N} |
| Shop | {N} | {N} | {N} | {N} |
| Rentals | {N} | {N} | {N} | {N} |
| **Total** | **{N}** | **{N}** | **{N}** | **{N}** |

{1–2 sentence read on the bug signal: Is bug volume trending up? Are carry-over bugs
concentrating in one team? Are there unresolved high-priority bugs that should be
escalated before new feature work continues?}

---

## Cross-team alerts this week

{Only include if there are systemic patterns worth noting:}
- Teams with the most carry-over issues
- Projects with no sprint active
- Any issue type (e.g. bugs) spiking across multiple teams
- Teams where time overruns are concentrated

---

## Suggested actions for the Head of Product

{3–5 specific, actionable recommendations based on what the data shows.
Not generic advice. Grounded in the actual issues found.
Examples:
- "the finance module's [issue XX-123] has been in 3 sprints. Recommend a decision call this week — ship, cut, or escalate."
- "Fundraising sprint ends in 2 days with 5 unstarted stories. Suggest a quick sync with the team lead."
- "Time overruns are concentrated in Rentals — may indicate estimation issues or hidden complexity in the epic."}
```

---

## Step 6 — Health scoring logic

For the **Health** indicator per team, use this rubric:

| Signal | Weight |
|--------|--------|
| % of sprint items Done or In Progress on track | High |
| Number of multi-sprint carry-overs | High |
| Number of time overruns | Medium |
| Sprint end proximity with unstarted items | Medium |
| Number of stale in-progress items | Medium |

**🟢 On Track** — No alerts, >60% of sprint items Done or In Progress, no carry-overs
**🟡 At Risk** — 1–2 alerts OR carry-overs present OR sprint ending soon with unstarted items
**🔴 Off Track** — 3+ alerts OR multiple carry-overs OR majority of sprint not started within 3 days of end

---

## Step 7 — Tone and style guidelines

The Head of Product is busy. Respect their time.

- Lead with the executive summary — put the most important thing first
- The narrative sections ("What the team is working on") should read like a
  thoughtful colleague giving a verbal update — not like a status tool output
- Alerts must be specific: include the issue key, the metric, and the implication
- Avoid generic filler phrases like "the team is making progress" — if there's
  nothing interesting to say, skip the narrative sentence
- If a team has a clean sprint with no alerts, say so briefly and move on —
  don't pad the section
- Never reproduce raw Jira descriptions verbatim — always paraphrase into
  plain language

---

## Edge cases

| Situation | How to handle |
|-----------|--------------|
| No open sprint for a project | Flag as "No active sprint" in the summary, skip the breakdown |
| Issue has no time tracking data | Skip time overrun check for that issue, don't flag it |
| All issues are Done | Report it as such — celebrate the clean sprint |
| Sprint was just started (< 2 days old) | Note sprint is newly started, reduce alerting sensitivity |
| Issue has no parent epic | Skip epic context fetch, proceed without it |
| More than 50 issues in a sprint | Process all, but only surface issues with status ≠ Done in the narrative |

---

## Scheduling note

This skill is designed to run **once per week**, ideally on Monday morning.
The Head of Product can trigger it by saying:
- "Give me the weekly pulse"
- "Weekly update"
- "How are the sprints going?"
- "Monday briefing"

There is no automated scheduling built into the skill — it is triggered on demand.
The data is always live from Jira at the moment of execution.
