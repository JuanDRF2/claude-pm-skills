# Local Organization Contract

## Contents

- Authority and standard local layout
- New, shared and existing work
- Link, duplicate and rollback safety
- Notion isolation and destination decision

## Authority

Organize the local Markdown workspace before publishing or synchronizing externally.
Local organization must not silently compensate for ambiguous ownership. When the project
uses Notion, verified native pages are the shared official copy and the local Markdown
folder is a snapshot-bound checkout.

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

| Content | Local destination | Notion treatment |
|---|---|---|
| Canonical project package | `artifacts/<project-slug>/` | Publish to Notion before declaring the shared refinement complete |
| Authoritative shared contract | `artifacts/_shared/<slug>/` | Register separately if it needs a shared Notion home |
| Review, audit or historical delta | `artifacts/_reviews/<group>/` | Keep local unless explicitly published |
| Executable helper | `artifacts/_local/tooling/<group>/` | Never publish |

A shared package must include `00-workflow-state.md` and `09-package-index.md`, name its owner and consumers, and preserve approval state.

## Shared ownership routing

Classify every shared artifact before publishing it:

| Shared artifact | Owner | Local location | Notion location |
|---|---|---|---|
| Contract created and governed by one feature/project | That feature/project | `artifacts/_shared/<contract-slug>/` | Inside the canonical Notion page of the owner project |
| Organization-wide standard without a natural project owner | Named team or governance domain | `artifacts/_shared/<standard-slug>/` | A dedicated shared-standards hub under the user-confirmed parent |

Do not infer ownership from the number of consumers. A contract used by many projects can
remain owned by the feature that defines and governs its behavior.

Every shared package must declare `package_kind`, owner, consumers, change-impact rule,
canonical file and, once published, its confirmed Notion destination. Consumers link to
the owner's shared page and never copy the contract as independently editable truth. Keep
the Markdown under `_shared/` even when its Notion page lives inside the owner project.

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

## Shared destination decision

Classify Notion independently for every project during Phase 0:

| State | How work proceeds | Consequence |
|---|---|---|
| `Existing project page` | Confirm the exact page and permissions; synchronize before interpreting remote state | Reuse that project only after reading its registered state |
| `New project, parent confirmed` | Build and validate locally; create the project root under that parent only at Gate 5 | The page need not exist when discovery starts |
| `Notion unavailable` | Continue Phases 1–5 locally and record `Local draft — publication pending` | Only shared completion and remote-derived exports remain blocked |

Notion is unavailable when there is no compatible connection, the authorization expired,
the user lacks access, the workspace or parent is unknown, or the service/integration is
temporarily failing. Do not invent page IDs, URLs, manifests, readbacks or synchronized
snapshots. Record the reason, required owner/action and the confirmed local package path.
When availability returns, resume at Gate 5; rerun earlier phases only if their source
changed.

Never use the destination of a previous project as a default. Notion is required for the
completed shared refinement; Word is an optional final export.

Present these consequences in plain language before asking for the choice. Clarify that
Markdown still exists in Notion-connected mode for validation, safe editing, portability
and recovery; it is not a second independently editable source. Explain that a person
without local files begins with `start`, while a person with a checkout begins with
`status`. A disconnected person may hand the validated package to a person or AI with a
compatible Notion connection; the receiving tool must still preview, authorize, publish
and read back. Offer Word only after the Notion readback, synchronization and parity Judge
pass.
