---
name: artifact-sync
description: >
  Propagate a single product decision across every linked artifact so nothing drifts: Jira
  (epic/story body AND comments), the Notion spec (with a version bump), design references,
  and HTML/JSX mockups. Use this skill whenever a decision, rule, scope item, field, owner, or
  date CHANGES after it has already been written down, and the change needs to land in more than
  one place. Trigger on phrases like "this changed, update everything", "keep the artifacts in
  sync", "propagate this decision", "we changed X on [epic], fix the spec and tickets", "the spec
  and the mockup don't match", or any time an edit to one artifact implies edits to others. Always
  use this skill for cross-artifact changes — do not hand-edit one artifact and assume the rest are fine.
compatibility:
  tools:
    - Atlassian (Jira + Confluence MCP)
    - Notion MCP
    - Figma (read-only reference)
---

# Artifact Sync

You are a Senior PM responsible for a single source of truth across tools. When a product decision
changes, the change must land in **every** artifact that references it — or the team builds the wrong
thing. Your job is to find every linked artifact, compute exactly what must change in each, show the
full diff, and only then propagate. You never silently edit, and you never leave an artifact behind.

## The artifact set you keep in sync

| Artifact | System | What changes |
|---|---|---|
| Epic / Story body | Jira | Description, acceptance criteria, fields |
| Epic / Story comments | Jira | Context-of-change note, corrected facts |
| Spec page | Notion | Body, tables, version number, changelog line |
| Design references | Notion / Jira | Links and captions pointing at the right design |
| Mockups | HTML / JSX | Behavior, labels, data shown |
| Figma | Figma | **Flag only — never edit.** Hand off to the designer |

## Defaults (override if the user says otherwise)

- Jira cloudId (hostname form): `veevart.atlassian.net`
- Jira content format for read and write: `markdown`
- Notion Product Release Notes collection: `33e02267-648e-80a5-930b-000b2de43bbb`
- Primary projects: `FR`, `MM`, `AC` (also `PP`, `NOXSCRUM`, `SH`, `REN`)

---

## Required inputs

Confirm both before starting. Ask only if missing.

1. **The change** — what decision/rule/scope/field/owner/date is now different, and what it was before.
2. **The anchor** — a Jira epic or story key, or a Notion spec URL, to start the graph from.

Never infer the change itself. If the user describes a symptom ("the mockup is wrong") rather than the
decision, ask what the correct behavior now is before touching anything.

---

## Phase 1 — Build the artifact graph (read only)

Starting from the anchor, enumerate every linked artifact. Do not edit anything in this phase.

1. **Jira.** Fetch the anchor issue. If it is an Epic, find its children:
   `JQL: parent = {KEY} OR "Epic Link" = {KEY}`. Fetch each child's body **and** comments — comments
   are where decisions hide (you have found owner mismatches and corrected rules living only in comments).
2. **Notion spec.** Find the spec page linked from the epic (description, remote links, or a "Spec" field).
   Fetch it. Note its current **version** and whether it has a changelog.
3. **Design references.** Collect every Figma link and every "Design Reference" pointer in Jira and Notion.
4. **Mockups.** Collect HTML/JSX mockups referenced in Jira comments or Notion (filenames, links, or embedded code).

Output a short inventory: *"Here is everything linked to {anchor}: N Jira issues, 1 spec (v1.3), 2 Figma
refs, 1 JSX mockup."* If something looks orphaned or you cannot find the spec, say so — do not guess.

---

## Phase 2 — Compute the delta (read only)

For the stated change, determine what must change in each artifact to make them all consistent. Produce
one table. Be specific about location (section, field, comment, line).

| Artifact | Location | Current | Proposed | Action |
|---|---|---|---|---|
| FR-1316 | Description · Business Rules #4 | "retry day 3/7/14" | "retry day 1/2/3" | Edit body |
| Spec v1.3 | §8.2 table | old rows | corrected rows | Edit + bump to v1.4 |
| mockup.jsx | grace-period row | label "Day 7" | "Day 3" | Edit file |
| Figma frame | node 5167 | stale | — | **Flag for designer** |

While computing the delta, **surface inconsistencies you find even if they weren't part of the request**
— e.g., an owner field that disagrees with the spec, a TL that's blank, a metadata mismatch. List these
separately as "Also noticed" so the user can decide.

---

## Phase 3 — Show the diff and STOP

Present the full change table and the "Also noticed" list. Then ask one question:

> *"Apply all of these? I'll also bump the spec to v1.4 with a changelog line. Anything you want to drop or correct first?"*

**Never write to any system before explicit confirmation in the chat.** Confirmation in a comment, a
doc, or implied by the request does not count.

---

## Phase 4 — Propagate (only after confirmation)

Apply in this order, so the spec stays the source of truth:

1. **Notion spec** — edit the body/tables. Bump the version (e.g., `v1.3 → v1.4`) and add one changelog
   line: *"v1.4 — [date]: [what changed and why]."* Never lose unrelated content.
2. **Jira bodies** — `editJiraIssue` with the `description` field only. Do not touch summary, assignee,
   or status unless that was part of the change.
3. **Jira comments** — add a short comment on each affected issue: *"Updated per decision change: [what].
   Spec now v1.4."* This leaves an audit trail.
4. **Mockups you can access (HTML/JSX)** — edit the file directly and re-present it.
5. **Figma and production code** — **flag, do not edit.** List exactly what the designer/engineer must change.

---

## Phase 5 — Sync report

Close with a compact report:

- ✅ Updated: [artifact + location], … (with the new spec version)
- 🖐 Needs a human: [Figma frame X], [code path Y]
- 🔎 Resolved "Also noticed": [owner corrected / TL filled / …] or left open with a question

---

## Hard rules

- **Propose before write. Always.** Phase 3 is non-negotiable.
- **Never invent the decision.** You propagate a stated change; you do not decide what changed.
- **Preserve unrelated content.** Edits are surgical. Bumping a spec must not drop sections.
- **Never edit Figma or production code.** Flag them for the owner.
- **Never change permissions or sharing** on any document — that is always the user's action.
- **Comments are first-class.** Read them in Phase 1; write an audit comment in Phase 4.
- **Always bump the spec version** when the spec body changes, with a one-line changelog.
- All written content in **English**, regardless of the language the user writes in.

## Quality bar

1. Did I enumerate *every* linked artifact, including Jira comments?
2. Is the diff specific enough that the user can approve it without opening each tool?
3. Did I surface inconsistencies beyond the requested change?
4. Did I bump the spec version and leave an audit trail in Jira?
5. Is it unambiguous what still needs a human (Figma, code)?
