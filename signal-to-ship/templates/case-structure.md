# Case Structure Contract

Defines what files a Signal to Ship case directory must contain and when each is created.

## One folder per initiative

Each initiative gets its own folder, `cases/<feature-kebab>/`, created when Gate 0 closes (the first save) and
announced in one line. The only name for the saved progress is `00-signal-to-ship-state.md`. If the working
directory already holds a `00-signal-to-ship-state.md`, use it and do not nest a new folder under it.

```
cases/<feature>/
├── 00-signal-to-ship-state.md      # Created at Gate 0 (saved progress)
├── scorecard.md                    # Created at Gate 1 (templates/feature-scorecard.md)
├── <feature>-spec.md               # Created in Phase 3 (templates/spec.md, or the PM's own)
├── <feature>-refinement.md         # Created in Phase 5 when the compact package is used
└── delivery/
    └── <feature>-<type>.md         # Created at Gate 6, one per document (release-notes, patch-notes, ...)
```

## A group of related initiatives

A group of related initiatives may nest `cases/<group>/<feature>/`. Group-level files stay in `cases/<group>/`:

```
cases/<group>/
├── 00-overview.md                  # Created at group start: deadline, scope, context
├── gaps-analysis.md                # Created after a parity scan or cross-feature Signals
├── feature-cards/
│   └── <feature-name>.md           # One scorecard per feature in the group, created at Gate 1
├── roadmap-snapshot-<date>.md      # Optional, created on a `roadmap` request
└── <feature>/                      # One folder per initiative, as above
```

## File creation triggers

| File | Created when | Template |
|------|-------------|----------|
| `00-signal-to-ship-state.md` | Gate 0 closes | `templates/signal-to-ship-state.md` |
| `scorecard.md` (or `feature-cards/<name>.md` in a group) | Gate 1 passes (signal mapping complete) | `templates/feature-scorecard.md` |
| `<feature>-spec.md` | The spec is drafted in Phase 3 | `templates/spec.md`, or the PM's own |
| `<feature>-refinement.md` | The compact refinement package is written | `templates/refinement-package.md`, or the PM's own |
| `delivery/<feature>-<type>.md` | Gate 6 passes (delivery artifacts generated) | Selected from `templates/` by initiative type, or the PM's own |
| `00-overview.md`, `gaps-analysis.md` | A group starts, or after a parity scan | Free form |
| `roadmap-snapshot-<date>.md` | The PM requests a snapshot of `roadmap` | Generated per `references/roadmap-view.md` |

The `roadmap` mode reads `cases/*/scorecard.md` and `cases/*/feature-cards/*.md`.

## Naming conventions

- Initiative folder: kebab-case, descriptive (`quick-checkout`, `night-shift-reassign`).
- Group folder: kebab-case (`fundraising-critical-path`, `q4-payments`).
- Delivery docs: `<feature-name>-<template-type>.md` (`quick-checkout-release-notes.md`).
- The saved progress is always `00-signal-to-ship-state.md`. There is no other file name.

## Lifecycle

1. **Initiative created:** the folder and the saved progress appear at Gate 0.
2. **Scorecard:** written after Gate 1.
3. **Spec and refinement:** one document each, beside the saved progress.
4. **Delivery produced:** one document per artifact after Gate 6, in `delivery/`.
5. **Group files:** `gaps-analysis.md` and the roadmap snapshots are updated as parity scans or signals find gaps.
6. **Closed:** when the initiative reaches Gate 7, is stopped, or the PM declares the scope complete.
