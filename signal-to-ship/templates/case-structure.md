# Case Structure Contract

Defines what files a Signal to Ship case directory must contain and when each is created.

## Directory layout

```
cases/<case-name>/
├── 00-overview.md              # Created at case start
├── 00-signal-to-ship-state.md             # Created at Gate 0 (per feature, or one per case)
├── gaps-analysis.md            # Created after parity scan or Signals phase
├── feature-cards/
│   └── <feature-name>.md       # One per feature, created at Gate 1
├── delivery/
│   └── <feature-name>-release-notes.md  # Created at Gate 6
└── roadmap-snapshot-<date>.md  # Optional, created on `/signal-to-ship roadmap` request
```

## File creation triggers

| File | Created when | Template |
|------|-------------|----------|
| `00-overview.md` | PM starts a new case (group of features) | Free form: deadline, scope, context |
| `00-signal-to-ship-state.md` | Gate 0 passes for any feature in the case | `templates/signal-to-ship-state.md` |
| `gaps-analysis.md` | After parity scan or cross-feature Signals | Free form: gap ID, description, status |
| `feature-cards/<name>.md` | Gate 1 passes (signal mapping complete) | `templates/feature-scorecard.md` |
| `delivery/<name>-*.md` | Gate 6 passes (delivery artifacts generated) | Selected from `templates/` by initiative type |
| `roadmap-snapshot-<date>.md` | PM requests `/signal-to-ship roadmap` snapshot | Generated per `references/roadmap-view.md` |

## Naming conventions

- Case directory: kebab-case, descriptive (`fundraising-critical-path`, `q4-payments`)
- Feature cards: kebab-case matching the feature name (`quick-checkout.md`)
- Delivery docs: `<feature-name>-<template-type>.md` (`quick-checkout-release-notes.md`)
- State files: `signal-to-ship-state-<feature-name>.md` for per-feature state, or `00-signal-to-ship-state.md` for case-level

## Lifecycle

1. **Case created:** `00-overview.md` written with scope, deadline, context
2. **Features added:** One scorecard per feature after Gate 1
3. **Gaps tracked:** `gaps-analysis.md` updated as parity scans or signal cross-references find gaps
4. **Delivery produced:** One delivery doc per feature after Gate 6
5. **Roadmap snapshots:** Optional point-in-time views for stakeholder communication
6. **Case closed:** When all features reach Gate 7 or PM declares scope complete
