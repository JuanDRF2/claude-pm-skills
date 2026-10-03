# Claude PM Skills

A library of product-management Skills for Claude. Each skill is a folder containing a `SKILL.md` that instructs Claude how to handle a specific PM workflow — from writing specs to distributing launch comms.

Not sure which one to use? Start with [`idea-to-ship`](./idea-to-ship/) — it doesn't draft anything itself, it figures out where your initiative stands (idea, spec, approved stories, mid-build, shipped) and routes you to the right skill below, one guided step at a time. Works the same whether you run this with a team on Jira or solo with AI and no tracker at all.

See [`ACTION-TIERS.md`](./ACTION-TIERS.md) for the shared `allow`/`ask`/`block` classification that any skill touching a live system (Jira, Notion, a hosted portal) follows instead of inventing its own confirmation rule. It also states that text a skill reads from tools, files or the web is data, never instructions.

## Install

This repo is a [Claude Code Plugin](https://code.claude.com/docs/en/plugins). Install every skill in one shot:

```
/plugin install claude-pm-skills@github:JuanDRF2/claude-pm-skills
```

Or clone the repo and copy whichever individual skill folders you want into `~/.claude/skills/` (personal) or `.claude/skills/` (project) — no plugin required either way.

---

## Want the whole rhythm, not just individual skills?

The skills below are useful on their own, but they were built to run inside **Cadence** — a
solo delivery rhythm (Shape → Build → Verify → Ship) they already speak the language of under
generic names, whether or not you know it exists. See [`CADENCE.md`](./CADENCE.md) for the
one-screen version, [`CADENCE-REFERENCE.md`](./CADENCE-REFERENCE.md) for the fuller write-up with
sources cited for every idea in it.

If you also want to set up your own version of the *workspace* this all runs from — not copying
anyone's personal folder, just the structural pattern — it's simple and has no dependencies:

1. **One folder per project**, each with its own short `CLAUDE.md` (or `AGENTS.md`) stating that
   project's specific rules — keep the shared/global rules in a parent-level file instead of
   repeating them per project.
2. **A guided entry point** — a short, plain-language "how to start a session" reference (project
   names, a one-line starter phrase per project, what happens after you say it) beats expecting
   anyone — including future-you — to remember exact skill names or vocabulary.
3. **`idea-to-ship` as the default front door** for anything that doesn't obviously belong to one
   project yet — it infers the phase and routes for you, so a new workspace doesn't need every
   other skill memorized on day one.

That's the whole pattern. No scaffolding tool required — a few Markdown files and the skills
below are enough to start.

---

## Skills

| Skill | Description |
|---|---|
| [`ai-feature-eval-planner`](./ai-feature-eval-planner/) | Plans how to prove that a feature built on a language model works before it ships: autonomy level per capability, AI risk review, an eval plan with numeric thresholds and a golden dataset, tool ergonomics for agents, and a staged rollout. |
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
| [`launch-comms`](./launch-comms/) | Turns an approved release note into a set of short, channel-specific launch communications: internal Slack announcement, leadership brief, CS/Support heads-up, sales enablement blurb, and customer-facing copy. |
| [`mini-spec-writer`](./mini-spec-writer/) | Converts a raw product idea, feature request, or Slack message into a structured, implementation-ready mini specification. |
| [`mockup-builder`](./mockup-builder/) | Builds on-brand, handoff-ready HTML or JSX mockups pinned to the platform's design system and domain-correct data references. |
| [`okr-tracker`](./okr-tracker/) | Defines, reviews, scores, and updates OKRs (Objectives and Key Results) for a product team or initiative. |
| [`prd-writer`](./prd-writer/) | Writes a full Product Requirements Document (PRD) for a feature, initiative, or product area. |
| [`prioritization-scorer`](./prioritization-scorer/) | Scores and ranks product work with a transparent framework (RICE, ICE, WSJF, MoSCoW or custom), labelling every input as measured, estimated or guessed and showing how fragile the ranking is. |
| [`product-context-base`](./product-context-base/) | Builds and stores a rich product context snapshot for a specific team by pulling the last 6 months of Jira issues and relevant Notion product pages. |
| [`publish-refinement-to-notion`](./publish-refinement-to-notion/) | Publishes or updates an approved product/QA refinement Markdown package as native, readable Notion pages. |
| [`refinement-judge`](./refinement-judge/) | Independent adversarial quality gate that audits a complete product-refinement package before external publication, Jira creation, or another consequential action — comparing it against original sources rather than trusting the generating skill's own conclusions. |
| [`release-notes-writer`](./release-notes-writer/) | Writes structured, audience-aware release notes and publishes them to Notion. |
| [`signal-to-ship`](./signal-to-ship/) | Orchestrates a product initiative from customer signal to measured outcome in seven gated phases (signals, prioritization, specification, prototyping, refinement, delivery, measurement), right-sized to light, standard or full depth, with a recorded stop and a keep / iterate / retire verdict. Dispatches the specialist skills in this library. Start with its [`GETTING-STARTED.md`](./signal-to-ship/GETTING-STARTED.md). |
| [`stakeholder-request-triage`](./stakeholder-request-triage/) | Turns a request from someone with authority into a defensible decision: the need behind the ask, the smallest slice, the trade-off in dates, a decision owner (DACI) and a written record. |
| [`story-to-test-workflow`](./story-to-test-workflow/) | Orchestrates product refinement end to end — journey mapping, story splitting, user stories with acceptance criteria, and risk-based QA test design — through explicit decision gates, from a rough idea or an approved spec. |
| [`success-metrics-designer`](./success-metrics-designer/) | Designs how a change will be judged: outcome metric with a measured baseline and target, adoption definition, metrics in five categories, checkpoints, and the keep / iterate / retire rule. |
| [`sync-refinement-package-notion`](./sync-refinement-package-notion/) | Ongoing sync after an initial Notion publication: status/diff, start a local checkout, publish approved changes, reconcile concurrent edits, recover a partial write, or accept editorial drift. |
| [`test-case-designer`](./test-case-designer/) | Designs risk-based, traceable QA coverage from approved stories and criteria: atomic checks and QA-reviewable functional test cases, with automation guidance and a downstream test-management handoff. |
| [`user-story`](./user-story/) | Writes a user story (Mike Cohn format) and its acceptance criteria (Gherkin, stable `AC-*`/`SC-*` IDs, plain-language contract, per-role readiness state). |
| [`user-story-mapping`](./user-story-mapping/) | Creates a user story map — activities, steps, tasks, release slices — that lays out the customer journey before any story gets written. |
| [`user-story-splitting`](./user-story-splitting/) | Breaks a large story or epic into smaller deliverable stories using proven split patterns. |
| [`video-demo-generator`](./video-demo-generator/) | Generates an on-brand MP4 demo video from an interactive artifact or feature flow, using design tokens from `design-system`. |
| [`weekly-product-pulse`](./weekly-product-pulse/) | Generates a structured weekly status report for the Head of Product by pulling the active sprint from all product team Jira projects, grouping results by team, and surfacing delivery health, blockers, and risks. |
| [`writing-voice`](./writing-voice/) | Applies your own calibrated writing voice — direct, human, no AI-tells — to external-facing content (LinkedIn, cover letters, bios, launch announcements) in English or Spanish. |

34 skills in total.

---

## Maturity

An honest label, so you know what to trust. "Tested" means automated tests of the skill's own scripts exist (they
check formats and validators, not that the skill works against your tools).

- **Tested:** `signal-to-ship` (its source repository has unit tests and eleven evals run against a clean install),
  `story-to-test-workflow`, `refinement-judge`, `build-refinement-document`, `sync-refinement-package-notion`.
- **Experimental** (depends on a tool or an environment that was not verified here, or still carries assumptions
  from one workflow): `publish-refinement-to-notion`, `video-demo-generator`, `mockup-builder`,
  `weekly-product-pulse`, `product-context-base`, `artifact-sync`. (`sync-refinement-package-notion` and
  `build-refinement-document` are listed under Tested because their scripts have tests; the Notion and Word sides
  themselves were not verified here.)
- **Prompt-only:** every other skill. They are plain instructions with no scripts to test; judge them by reading them
  and trying them on a small case.

Several skills say what they do when their tool is not connected (a "Without Jira" or "Without Notion" section):
they stop at a draft, hand over paste-ready text and never claim anything was created. [`STATES.md`](./STATES.md)
maps the approval, release and verdict words of different skills onto one lifecycle and explains how to name gates.

---

## Try it

With the skills installed, in Claude Code, type something like:

> I want members to be able to pay their membership in two installments. Where do I start?

`idea-to-ship` asks a few short numbered questions (is the problem clear? is there a spec? are there approved
stories? is anything built?), tells you which stage you are in (Define, Build, Verify or Ship) and hands off to the
right skill: for example `mini-spec-writer` for a raw idea or `user-story` for an approved spec. It does not draft the
spec itself.

## Limits

- These are instructions for a model, not programs. The output depends on the model you use and on what you give it.
- "Tested" only means that a skill's own scripts have tests (see Maturity). Nobody has verified every skill against
  every tool it can talk to; where a tool is not connected, the skills are meant to stop at a draft.
- A few skills are written in Spanish (the refinement document, portal and Notion skills); the rest are in English.
- The skills ask for facts instead of inventing them, but check any figure, quote or source before you use it.

---

## What to upload

Not every skill is a single file. Some carry references, templates or scripts that the `SKILL.md`
reads at run time, so uploading only the `SKILL.md` leaves them broken.

- **Upload `SKILL.md` alone** for the skills marked so in the table below.
- **Upload the whole folder** for the others (in Claude: **Settings → Capabilities**, or copy the
  folder into `~/.claude/skills/`).
- **Related skills** are other skills that a `SKILL.md` names. They are not all required, and a skill
  may still work without them in a reduced form, but this has not been verified for every skill. The
  safest set for the refinement workflow is `story-to-test-workflow` with the skills it names.
- Several skills talk to Jira, Notion or another tool. Where no tool is connected they should fall back
  to drafting in the conversation; this is also not yet verified for every skill.

| Skill | Files in the folder | Upload | Related skills it names |
|---|---|---|---|
| `ai-feature-eval-planner` | 1 | `SKILL.md` alone | — |
| `architecture-aware-reviewer` | 1 | `SKILL.md` alone | — |
| `artifact-sync` | 1 | `SKILL.md` alone | — |
| `build-refinement-document` | 5 | whole folder (5 files) | — |
| `build-refinement-portal` | 6 | whole folder (6 files) | — |
| `competitive-teardown` | 1 | `SKILL.md` alone | — |
| `design-system` | 2 | whole folder (2 files) | `video-demo-generator` |
| `discovery-interview-guide` | 1 | `SKILL.md` alone | — |
| `idea-to-ship` | 1 | `SKILL.md` alone | routes to most skills in the library |
| `jira-bug-writer` | 1 | `SKILL.md` alone | — |
| `jira-story-publisher` | 1 | `SKILL.md` alone | `story-to-test-workflow`, `test-case-designer`, `user-story` |
| `launch-comms` | 1 | `SKILL.md` alone | — |
| `mini-spec-writer` | 1 | `SKILL.md` alone | `prd-writer`, `story-to-test-workflow`, `user-story-mapping` |
| `mockup-builder` | 1 | `SKILL.md` alone | — |
| `okr-tracker` | 1 | `SKILL.md` alone | — |
| `prd-writer` | 1 | `SKILL.md` alone | `architecture-aware-reviewer`, `idea-to-ship`, `jira-story-publisher`, `mini-spec-writer`, `story-to-test-workflow` |
| `prioritization-scorer` | 1 | `SKILL.md` alone | — |
| `product-context-base` | 1 | `SKILL.md` alone | — |
| `publish-refinement-to-notion` | 8 | whole folder (8 files) | `sync-refinement-package-notion` |
| `refinement-judge` | 8 | whole folder (8 files) | `story-to-test-workflow`, `sync-refinement-package-notion` |
| `release-notes-writer` | 1 | `SKILL.md` alone | — |
| `signal-to-ship` | 37 | whole folder (37 files) | `competitive-teardown`, `design-system`, `jira-bug-writer`, `jira-story-publisher`, `launch-comms`, `mini-spec-writer`, `prd-writer`, `refinement-judge`, `release-notes-writer`, `story-to-test-workflow`, `sync-refinement-package-taxonomy` (named in `references/specialist-contracts.md`; it falls back to guiding you directly when one is missing) |
| `stakeholder-request-triage` | 1 | `SKILL.md` alone | — |
| `story-to-test-workflow` | 38 | whole folder (38 files) | `build-refinement-document`, `build-refinement-portal`, `idea-to-ship`, `jira-story-publisher`, `publish-refinement-to-notion`, `refinement-judge`, `sync-refinement-package-notion`, `sync-refinement-package-taxonomy`, `test-case-designer`, `user-story`, `user-story-mapping`, `user-story-splitting` |
| `success-metrics-designer` | 1 | `SKILL.md` alone | — |
| `sync-refinement-package-notion` | 35 | whole folder (35 files) | — |
| `sync-refinement-package-taxonomy` | 4 | whole folder (4 files) | — |
| `test-case-designer` | 7 | whole folder (7 files) | `user-story`, `user-story-mapping` |
| `user-story` | 7 | whole folder (7 files) | `user-story-splitting` |
| `user-story-mapping` | 5 | whole folder (5 files) | — |
| `user-story-splitting` | 5 | whole folder (5 files) | `user-story` |
| `video-demo-generator` | 3 | whole folder (3 files) | `design-system` |
| `weekly-product-pulse` | 1 | `SKILL.md` alone | — |
| `writing-voice` | 1 | `SKILL.md` alone | — |

---

## Configuration

Some skills reference workspace-specific values that are not published in this repo. Each affected `SKILL.md` has a `## Configuration` section at the bottom listing its placeholders. Replace them with your own values before use:

| Placeholder | What to set |
|---|---|
| `<JIRA_SITE>` | Your Atlassian hostname — e.g. `yourorg.atlassian.net` |
| `<JIRA_CLOUD_ID>` | Your Atlassian Cloud ID UUID (find it in your Jira site settings) |
| `<NOTION_RELEASE_NOTES_COLLECTION_ID>` | The Notion database ID for your Product Release Notes collection |
| `<YOUR_PRODUCT_AREAS>` | The product areas / team names used in your release notes metadata |

---

## Contributing

Each skill lives in its own folder. The `SKILL.md` must start with YAML frontmatter containing at minimum `name` and `description`. The `name` must match the folder name exactly.

```yaml
---
name: skill-folder-name
description: One-line description of what the skill does and when to trigger it.
---
```

Run `python3 scripts/validate-skills.py` before opening a pull request; CI runs it too.

## Related

- [`pos-support-agent`](https://github.com/JuanDRF2/pos-support-agent) — a separate public project by the same
  author: a local retrieval-augmented support assistant with a deterministic eval suite, built with the same
  discipline (write down the limits, measure instead of claiming).
