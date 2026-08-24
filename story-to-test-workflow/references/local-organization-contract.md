# Local Organization Contract

## Contents

- Authority and standard local layout
- New, shared and existing work
- Link, duplicate and rollback safety
- Notion isolation and explicit derived-output routing

## Authority

Organize the local Markdown workspace before publishing or synchronizing externally.
Local organization must not silently compensate for ambiguous ownership. When the project
uses a registered GitHub repository, its canonical branch is the shared documentary source
of truth and the local Markdown folder is a branch-bound checkout. Notion may provide a
derived collaborative view but never outranks the merged Markdown.

Use repository `PROJECTS.md` to locate packages and each package `09-package-index.md` to
declare internal authority and supersession. Do not add a parallel `_canon/INDEX.md`.

## Standard local layout

```text
artifacts/
├── <project-slug>/
├── _shared/<shared-package-slug>/
├── _reviews/<review-group>/
└── _local/tooling/<tool-group>/
```

- Keep normal refinement projects directly under `artifacts/<project-slug>/`.
- Put authoritative cross-project Markdown under `_shared/`.
- Put historical deltas and independent audits under `_reviews/`.
- Put executable generators, normalizers and publication helpers under `_local/tooling/`.
- Treat everything under `_local/` as local-only: exclude it from canonical package
  inventories, presentation manifests and Notion publication.
- Store Notion manifests, snapshots, readbacks, outboxes, backups and receipts under
  `_local/notion-sync/<project>/`; they are operational evidence, not canonical
  refinement artifacts.
- Treat project-level `tools/`, `scripts/`, `notion-export/` and `_notion-updates/` as local-only until they are moved under `_local/`.
- Include `_local/` in the backup created before local normalization.
- Keep Notion exports inside their source project only when needed locally; operational
  exports and transport files belong under `artifacts/_local/`.
- Do not create new files directly under `artifacts/`.

## New work

Create a project in its final local category from the start:

| Content | Local destination | Shared treatment |
|---|---|---|
| Canonical project package | `artifacts/<project-slug>/` | Review and merge through the configured GitHub repository |
| Authoritative shared contract | `artifacts/_shared/<slug>/` | Version once in GitHub; register a derived Notion view only when requested |
| Review, audit or historical delta | `artifacts/_reviews/<group>/` | Commit only when durable and understandable without local evidence |
| Executable helper | `artifacts/_local/tooling/<group>/` | Never commit or publish |

A shared package must include `00-workflow-state.md` and `09-package-index.md`, name its owner and consumers, and preserve approval state.

## Shared ownership routing

Classify every shared artifact before publishing it:

| Shared artifact | Owner | GitHub location | Optional Notion location |
|---|---|---|---|
| Contract created and governed by one feature/project | That feature/project | `artifacts/_shared/<contract-slug>/` | Inside the derived page of the owner project |
| Organization-wide standard without a natural project owner | Named team or governance domain | `artifacts/_shared/<standard-slug>/` | A dedicated shared-standards hub under the user-confirmed parent |

Do not infer ownership from the number of consumers. A contract used by many projects can
remain owned by the feature that defines and governs its behavior.

Every shared package must declare `package_kind`, owner, consumers, change-impact rule and
canonical file. Consumers link to the GitHub-versioned contract and never copy it as
independently editable truth. Keep the Markdown under `_shared/` even when an optional
Notion page lives inside the owner project.

## Existing work

Create a read-only local inventory and migration plan before moving anything. Treat every
classification as a proposal. A human must approve:

- every loose-file destination;
- ownership of shared contracts;
- duplicate removal or preservation;
- link rewrites;
- any file whose category is `unclassified`.

Normalize only from the reviewed plan. Show a dry-run write set first. Applying requires a
versioned backup directory outside the artifacts root and explicit authorization for the listed moves and
link rewrites. Use a repository tool when one exists; otherwise perform the approved moves
with ordinary filesystem operations and rerun the checks below.

## Link safety

Before moving a file, list every Markdown file that resolves to its old location. Update those links in the same local transaction. Afterward:

1. verify every relative Markdown target;
2. search for the old path;
3. rerun deterministic package validation;
4. regenerate the local inventory and confirm no new missing dependency.

Do not rewrite a relative source link into an invented Notion URL. Record only page URLs
and IDs observed after remote creation and readback.

## Notion isolation

Local normalization must report `notion_actions: none`.

They must not:

- call Notion connectors;
- run Notion publication scripts;
- change or archive Notion pages;
- claim presentation parity;
- treat `notion-export/` or `_notion-updates/` as canonical sources.

Existing Notion pages remain unchanged. If local path changes later require a Notion
republication, handle that as a separate `story-to-test-workflow` Gate 5 action with its
own authorization and parity review.

## Local-only boundary

No canonical Markdown file may depend on `_local/`. Before publishing, fail when an
included file links to or requires a path under `_local/`.

Moving a helper into `_local/` does not make it safe or maintained. Preserve its
archive/candidate classification and do not execute it unless a separate task requires it.

## Duplicate safety

Hash equality identifies byte-for-byte duplicates but does not determine authority. Prefer the standard `jira/` view over legacy aliases such as `jira-stories/` only after confirming all consumers and links. Never delete duplicates during initial import without a named approval.

## Rollback

The backup created before normalization is the recovery source. If a move, link rewrite or validation fails:

1. stop before Notion actions;
2. restore the original local paths and contents;
3. regenerate the local inventory;
4. report the failed action and remaining differences.

## Derived outputs only on request

Do not classify, offer or ask about Notion during Phase 0. The default route is the complete
GitHub workflow. Evaluate Notion only when:

- the user explicitly requests publication, synchronization or parity review; or
- a known material remote edit must be reconciled into Markdown.

When applicable, record one of: `Publication requested`, `Synced to commit <SHA>`,
`Deferred`, `Stale or unknown`, or `Unavailable`. An absent, stale, deferred or unavailable
view blocks only that requested Notion action; it never blocks GitHub review, merge, DEV
handoff or QA design. Do not invent page IDs, URLs, manifests, readbacks or synchronized
snapshots.

Never use the destination of a previous project as a default. A person without local files
begins by cloning the registered GitHub repository. For an explicitly requested Notion
view, `start` imports remote content only as reconciliation evidence and `status` compares a
registered view with its baseline. The receiving tool must still preview, authorize,
publish and read back.
