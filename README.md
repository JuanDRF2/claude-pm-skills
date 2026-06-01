# Claude PM Skills

A library of product-management Skills for Claude. Each skill is a folder containing a `SKILL.md` that instructs Claude how to handle a specific PM workflow — from writing specs to distributing launch comms.

---

## Skills

| Skill | Description |
|---|---|
| [`mini-spec-writer`](./mini-spec-writer/) | Converts a raw product idea, feature request, or Slack message into a structured, implementation-ready mini specification. |
| [`jira-story-writer`](./jira-story-writer/) | Transforms a mini spec or feature description into a set of well-formatted Jira user stories with Gherkin acceptance criteria. |
| [`architecture-aware-reviewer`](./architecture-aware-reviewer/) | Reviews a product spec or user story set against established architecture principles and ADRs, surfacing conflicts and risks before engineering picks up the work. |
| [`artifact-sync`](./artifact-sync/) | Propagates a single product decision across every linked artifact so nothing drifts: Jira (epic/story body and comments), the Notion spec (with a version bump), design references, and HTML/JSX mockups. |
| [`mockup-builder`](./mockup-builder/) | Builds on-brand, handoff-ready HTML or JSX mockups pinned to the platform's design system and domain-correct data references. |
| [`launch-comms`](./launch-comms/) | Turns an approved release note into a set of short, channel-specific launch communications: internal Slack announcement, leadership brief, CS/Support heads-up, sales enablement blurb, and customer-facing copy. |

---

## Install

Upload a skill folder in Claude → **Settings → Capabilities**. Each folder's `SKILL.md` is the skill definition; no other files are required.

---

## Configuration

Some skills reference workspace-specific values that are not published in this repo. Each affected `SKILL.md` has a `## Configuration` section at the bottom listing its placeholders. Replace them with your own values before use:

| Placeholder | What to set |
|---|---|
| `<JIRA_SITE>` | Your Atlassian hostname — e.g. `yourorg.atlassian.net` |
| `<NOTION_RELEASE_NOTES_COLLECTION_ID>` | The Notion database ID for your Product Release Notes collection |

---

## Contributing

Each skill lives in its own folder. The `SKILL.md` must start with YAML frontmatter containing at minimum `name` and `description`. The `name` must match the folder name exactly.

```yaml
---
name: skill-folder-name
description: One-line description of what the skill does and when to trigger it.
---
```
