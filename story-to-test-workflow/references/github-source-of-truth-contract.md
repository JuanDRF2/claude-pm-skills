# GitHub source-of-truth contract

Read this contract before creating, loading, changing or releasing a refinement in a
shared GitHub repository.

## Authority model

GitHub stores the shared documentary canon; it does not replace the product sources and
owner decisions that justify the canon.

```text
approved sources and decisions → Markdown on canonical branch → derived views
                                      ↑
                              branch and Pull Request
```

- The configured canonical branch, normally `main`, is the shared source of truth.
- A working tree, branch or Pull Request is a proposal until merged.
- Notion, Jira and other presentations are derived. An edit there becomes a proposed
  input and must be reconciled into Markdown through the normal review flow.
- `_local/`, backups, readbacks, dossiers, receipts and generated exports never enter the
  shared canon.

Record repository URL, canonical branch, package path and the latest base commit actually
observed. Never invent a remote, branch, commit, Pull Request or merge state.

## Starting or resuming

For an existing shared project:

1. Inspect repository instructions, status and current branch.
2. Preserve unrelated local changes; never reset or overwrite them to update the checkout.
3. Fetch the configured remote and compare the working base with the canonical branch.
4. Read `PROJECTS.md` when present, then the package `00-workflow-state.md` and
   `09-package-index.md`.
5. If the local base is stale, update safely before editing or report the conflict. Do not
   claim to have reviewed the current canon from an older checkout.

For a new project, create `artifacts/<slug>/` in a branch from the current canonical branch.
For a new collaborator without files, clone the repository; do not rebuild the canon from
Notion. If GitHub is unavailable, continue only as `Local draft — GitHub handoff pending`.

## Reconciling local Markdown

Do not copy an unreviewed local folder over `artifacts/`. Inventory it outside the canon,
match projects using package identity and stable `BR/US/AC/SC/CHK/FTC` IDs rather than
timestamps or filenames alone, and classify each unit as:

- `identical`: no action;
- `GitHub-only`: preserve the canonical unit;
- `local-only`: proposed new content requiring ownership and package routing;
- `GitHub-ahead`: keep the canonical unit unless an explicit correction is approved;
- `local-proposal`: review the material delta and its consumer closure;
- `conflict`: obtain the accountable owner decision before editing.

Review one project or cohesive objective at a time. Present the reconciliation matrix and
proposed write set before copying, moving or deleting anything. Local content remains a
candidate until it is validated, reviewed in a Pull Request and merged.

## Working changes

- Use one focused branch for one objective.
- Derive the smallest complete consumer closure with `change-impact-contract.md`.
- Do not modify `skill-package/` during normal refinement work.
- Commit only canonical Markdown and intentional repository documentation. Exclude local
  evidence and generated exports.
- Preserve stable IDs and separate historical differences from the approved write set.

Before an external Git operation, show:

- repository and canonical branch;
- working branch and observed base commit;
- exact changed files and affected IDs;
- validation and Judge verdict;
- preserved or excluded changes;
- proposed commit, push and Pull Request actions.

Local edits and validation do not authorize a push, Pull Request, merge, Jira write or
Notion write. Group a commit and branch push in one authorization only when the exact scope
is already visible. Never push directly to the canonical branch. A merge remains a
separate team-controlled action unless the user explicitly authorizes it and repository
policy permits it.

## Pull Request and completion

The Pull Request must summarize sources changed, affected IDs, derived consumers,
validation, Judge verdict, open questions and optional external publications still pending.
Do not describe the shared canon as updated until the change is merged.

The Pull Request is the default team-review surface. Its description and rendered Markdown
must let a reviewer understand the changed behavior without Notion. Include affected IDs,
canonical sources, derived consumers, preserved files, validation, Judge verdict and open
questions. GitHub comments propose changes; they become product decisions only when the
accountable owner confirms them and the Markdown is updated.

After observing the merge:

1. record the merged commit and canonical branch in workflow state;
2. classify the GitHub handoff as verified;
3. leave Notion and Jira unrequested unless the user explicitly asks for them;
4. publish requested views from the merged snapshot, not from an unmerged working tree, unless
   the user explicitly requests a clearly labeled preview.

An absent, deferred, stale or unknown Notion view does not block GitHub completion,
refinement review, DEV handoff or QA design. Do not run Notion parity merely to close a
GitHub Pull Request.

Repository completion and product readiness are distinct. A merged package may still have
Engineering review, QA execution or open product decisions, and those states must remain
visible.

## Repository layout

Use:

```text
artifacts/<project-slug>/
artifacts/_shared/<shared-contract-slug>/
artifacts/_reviews/<durable-review-group>/
```

Do not commit loose files under `artifacts/`. Keep operational evidence under an ignored
local path. A durable review may be committed only when it remains understandable without
temporary payloads or missing local dependencies.

## Index responsibilities

- Repository `PROJECTS.md` is the human catalog for locating packages and their current
  paths.
- Each package `09-package-index.md` declares its canonical, derived, deferred,
  superseded and historical artifacts.
- `00-workflow-state.md` records the active snapshot, approvals and next step.

Do not create an `artifacts/_canon/INDEX.md` parallel authority. If a legacy index exists,
review each entry and move only package-specific authority or succession information into
the owning `09-package-index.md`; keep cross-package historical evidence in a durable
review when it still adds value. Never copy the same index content into every package.
