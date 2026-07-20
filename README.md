# Claude PM Skills

A library of product-management Skills for Claude. Each skill is a folder containing a `SKILL.md` that instructs Claude how to handle a specific PM workflow — from writing specs to distributing launch comms.

Not sure which one to use? Start with [`idea-to-ship`](./idea-to-ship/) — it doesn't draft anything itself, it figures out where your initiative stands (idea, spec, approved stories, mid-build, shipped) and routes you to the right skill below, one guided step at a time. Works the same whether you run this with a team on Jira or solo with AI and no tracker at all.

See [`ACTION-TIERS.md`](./ACTION-TIERS.md) for the shared `allow`/`ask`/`block` classification that any skill touching a live system (Jira, Notion, a hosted portal) follows instead of inventing its own confirmation rule.

---

## Skills

| Skill | Description |
|---|---|
| [`architecture-aware-reviewer`](./architecture-aware-reviewer/) | Reviews a product spec or user story set against established architecture principles and ADRs, surfacing conflicts and risks before engineering picks up the work. |
| [`artifact-sync`](./artifact-sync/) | Propagates a single product decision across every linked artifact so nothing drifts: Jira (epic/story body and comments), the Notion spec (with a version bump), design references, and HTML/JSX mockups. |
| [`build-refinement-document`](./build-refinement-document/) | Generates or updates a navigable Word (`.docx`) document from an approved product/QA refinement Markdown package. |
| [`build-refinement-portal`](./build-refinement-portal/) | Generates or updates a self-contained, offline HTML portal from an approved product/QA refinement Markdown package. |
| [`competitive-teardown`](./competitive-teardown/) | Researches, analyzes, and documents competitive intelligence for a product, feature, or market. |
| [`design-system`](./design-system/) | Defines a coherent design token system — colors, typography, spacing, components — for consistent UI. Ships with a placeholder colorimetric palette; swap in your own brand color. |
| [`discovery-interview-guide`](./discovery-interview-guide/) | Plans and runs user discovery research, including interview guides, usability test scripts, and survey questions. |
| [`idea-to-ship`](./idea-to-ship/) | Single entry point above every other skill: figures out which delivery stage (Define/Build/Verify/Ship) an initiative is in — with or without a ticket tracker — and routes to the right skill next, one numbered-menu question at a time. |
| [`jira-bug-writer`](./jira-bug-writer/) | Formats and creates bug issues in Jira from a plain-language description. |
| [`jira-story-publisher`](./jira-story-publisher/) | Takes an *already-approved* story from `user-story` (never drafts one itself), estimates it, and creates the real Jira issue. |
| [`jira-update-cases`](./jira-update-cases/) | Fetches resolved bugs from Jira across product teams and displays them in a flat grid — one row per Salesforce case — ready to be exported to Excel. |
| [`launch-comms`](./launch-comms/) | Turns an approved release note into a set of short, channel-specific launch communications: internal Slack announcement, leadership brief, CS/Support heads-up, sales enablement blurb, and customer-facing copy. |
| [`mini-spec-writer`](./mini-spec-writer/) | Converts a raw product idea, feature request, or Slack message into a structured, implementation-ready mini specification. |
| [`mockup-builder`](./mockup-builder/) | Builds on-brand, handoff-ready HTML or JSX mockups pinned to the platform's design system and domain-correct data references. |
| [`okr-tracker`](./okr-tracker/) | Defines, reviews, scores, and updates OKRs (Objectives and Key Results) for a product team or initiative. |
| [`prd-writer`](./prd-writer/) | Writes a full Product Requirements Document (PRD) for a feature, initiative, or product area. |
| [`product-context-base`](./product-context-base/) | Builds and stores a rich product context snapshot for a specific team by pulling the last 6 months of Jira issues and relevant Notion product pages. |
| [`product-spec-agent`](./product-spec-agent/) | Interviews a PM through a structured product-spec process — pulling a real CRM business case, sizing deliverables as vertical slices with explicit estimates, and generating exhaustive Gherkin acceptance criteria — before publishing to Notion. |
| [`publish-refinement-to-notion`](./publish-refinement-to-notion/) | Publishes or updates an approved product/QA refinement Markdown package as native, readable Notion pages. |
| [`release-notes-writer`](./release-notes-writer/) | Writes structured, audience-aware release notes and publishes them to Notion. |
| [`story-to-test-workflow`](./story-to-test-workflow/) | Orchestrates product refinement end to end — journey mapping, story splitting, user stories with acceptance criteria, and risk-based QA test design — through explicit decision gates, from a rough idea or an approved spec. |
| [`test-case-designer`](./test-case-designer/) | Designs risk-based, traceable QA coverage from approved stories and criteria: atomic checks and QA-reviewable functional test cases, with automation guidance and a downstream test-management handoff. |
| [`user-story`](./user-story/) | Writes a user story (Mike Cohn format) and its acceptance criteria (Gherkin, stable `AC-*`/`SC-*` IDs, plain-language contract, per-role readiness state). |
| [`user-story-mapping`](./user-story-mapping/) | Creates a user story map — activities, steps, tasks, release slices — that lays out the customer journey before any story gets written. |
| [`user-story-splitting`](./user-story-splitting/) | Breaks a large story or epic into smaller deliverable stories using proven split patterns. |
| [`video-demo-generator`](./video-demo-generator/) | Generates an on-brand MP4 demo video from an interactive artifact or feature flow, using design tokens from `design-system`. |
| [`weekly-product-pulse`](./weekly-product-pulse/) | Generates a structured weekly status report for the Head of Product by pulling the active sprint from all product team Jira projects, grouping results by team, and surfacing delivery health, blockers, and risks. |
| [`writing-voice`](./writing-voice/) | Applies your own calibrated writing voice — direct, human, no AI-tells — to external-facing content (LinkedIn, cover letters, bios, launch announcements) in English or Spanish. |

28 skills in total.

---

## Install

Upload a skill folder in Claude → **Settings → Capabilities**. Each folder's `SKILL.md` is the skill definition; no other files are required.

---

## Configuration

Some skills reference workspace-specific values that are not published in this repo. Each affected `SKILL.md` has a `## Configuration` section at the bottom listing its placeholders. Replace them with your own values before use:

| Placeholder | What to set |
|---|---|
| `<JIRA_SITE>` | Your Atlassian hostname — e.g. `yourorg.atlassian.net` |
| `<JIRA_CLOUD_ID>` | Your Atlassian Cloud ID UUID (find it in your Jira site settings) |
| `<NOTION_RELEASE_NOTES_COLLECTION_ID>` | The Notion database ID for your Product Release Notes collection |
| `<YOUR_PRODUCT_AREAS>` | The product areas / team names used in your release notes metadata |
| `<SALESFORCE_INSTANCE_URL>` | Your Salesforce instance hostname — e.g. `yourorg.my.salesforce.com` |
| `<SALESFORCE_CASE_ID>` | Example Salesforce case ID used in documentation samples |
| `<NOTION_PRODUCT_SPECS_DATA_SOURCE_ID>` | Your Notion Product Specs database's data source ID |
| `<NOTION_PRODUCT_SPECS_URL>` | The direct URL to your Notion Product Specs database |
| `$[YOUR_ARR]M` | Your organization's total ARR, used as the denominator for business-case exposure percentages in `product-spec-agent` |

---

## Contributing

Each skill lives in its own folder. The `SKILL.md` must start with YAML frontmatter containing at minimum `name` and `description`. The `name` must match the folder name exactly.

\`\`\`yaml
---
name: skill-folder-name
description: One-line description of what the skill does and when to trigger it.
---
\`\`\`
