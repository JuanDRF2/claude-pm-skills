# Derived Artifact Governance

Use this contract whenever a prototype, HTML, Figma design, screenshot set, generated SPEC,
Word document, Jira view, handoff or other presentation is created from or compared
with a refinement package.

## Contents

- Authority
- Review modes
- Review workflow
- Delta ledger
- Product boundary check
- Outputs and restrictions

## Authority

Classify every source before using it:

| Role | Meaning | May change canonical behavior |
|---|---|---|
| Canonical source | Approved rule, story, criterion, scenario or decision | Yes, through an approved change |
| Derived presentation | HTML, Word, Jira, handoff or generated SPEC | No |
| Design proposal | Experimental prototype or interaction | No; it may propose a delta |
| External candidate source | Unreconciled SPEC, notes or imported document | No; reconcile first |
| Evidence | Screenshot, observed behavior, research or implementation | No |
| Historical | Superseded snapshot or prior version | No |

A polished or executable artifact never outranks its canonical source. Treat an unknown
source role or unknown base snapshot as a fidelity limitation, not as permission to infer.

## Review modes

### Static review

Read the complete SPEC and inspect HTML structure, controls, fields, states, copy, links,
hard-coded data, calculations, traceability attributes and unreachable branches.

### Interactive review

When observable behavior depends on interaction, open the HTML in a browser and traverse
the relevant main, alternate, failure and recovery paths. Use a local HTTP server when
`file://` prevents correct loading. Record what was actually exercised and what remains
unverified. Do not claim interactive fidelity from source inspection alone.

### Three-way reconciliation

Compare:

```text
canonical snapshot ↔ derived SPEC ↔ observed prototype behavior
```

Classify each material item:

- `Aligned`: same approved behavior.
- `Editorial`: presentation-only change with no behavioral effect.
- `Proposed`: new behavior without approval.
- `Contradicted`: conflicts with canonical behavior or another authoritative source.
- `Approved change`: approved by the accountable owner and propagated to its owner package.
- `Rejected`: explicitly declined.
- `Deferred`: valid candidate outside the selected delivery.
- `Superseded`: replaced by a later approved decision.
- `Unverifiable`: source, snapshot or observable evidence is insufficient.

## Delta record

Record every material difference in `02-rules-and-questions.md` under
`Deltas de diseño y especificación / Design and specification deltas`. If the ledger is too
large for readable review, move the full table to `10-design-and-spec-deltas.md` and link it
from `02-rules-and-questions.md`.

Each delta records:

- stable `DELTA-*` ID;
- source artifact and source role;
- canonical project and base snapshot, or `Unknown`;
- plain-language change;
- classification and affected flows;
- affected `BR/US/AC/SC` or `Not yet defined`;
- accountable decision owner;
- decision, date and rationale;
- owner package and downstream artifacts that become stale.

Never convert `Proposed`, `Contradicted` or `Unverifiable` behavior into a confirmed rule.
Block Ready for Sprint, approved DEV/QA handoff and canonical publication when one of those
states materially affects selected scope.

## Product Boundary Check

Evaluate a new capability before adding it to the current package:

1. independent user outcome or JTBD;
2. distinct primary actor;
3. own navigation or interaction surface;
4. independent lifecycle or release;
5. distinct permissions or policy;
6. separate data/source-of-truth ownership;
7. significant integrations or dependencies;
8. independent security, payment, privacy or operational risk;
9. backlog large enough to require its own decisions and coverage.

Choose one routing result:

- `Same project`: cohesive variation of the current outcome.
- `Feature area`: cohesive sub-area governed by the current project.
- `Separate canonical project`: independently governed product or journey.
- `Shared contract`: one owner, multiple consumers; route to `artifacts/_shared/`.
- `Discovery only`: insufficient evidence or future scope.

Do not decide by item count alone. Record the result, evidence, owner and consumer impact in
the story map and release slices. A separate project receives its own workflow state and
gates; the current package contains only the dependency/link, not a duplicate definition.

## Grounding contract for generation

Before generating a prototype, SPEC, design or other derived artifact, supply:

1. canonical project and verified snapshot;
2. occupied canonical `BR/US/AC/SC` IDs and readable titles from that snapshot;
3. canonical vocabulary for the affected surface;
4. closed decisions and applicable shared contracts.

Require the generated artifact to declare this base snapshot in its own text. When it
cannot, classify the base as `Unknown`; treat unmatched behavior as `Proposed` or
`Unverifiable` and block Ready for Sprint where it affects selected scope.

Resolve every cited canonical location before trusting it. Read the source and check for
an archive/deleted flag, a supersession banner or a status that names a successor. A
reachable source can still be historical. Re-anchor superseded citations to the current
source and correct the originating handoff or instruction so later generations do not
repeat the error.

When an artifact is ahead in scope but behind in vocabulary, classify the new scope as
`Proposed` and its identifiers as superseded; reconcile these dimensions separately.

## Handoff between refinement and prototype work

The refinement workflow supplies:

- canonical project and verified snapshot;
- selected delivery;
- approved rules, stories, criteria and scenarios;
- open questions and shared-contract links.

The prototype-producing process returns, when available:

- HTML/design and derived SPEC;
- canonical snapshot used;
- screen/state traceability;
- proposed changes and known limitations;
- candidate new products or shared contracts.

If that metadata is missing, perform a defensive review: mark the base snapshot `Unknown`,
treat unmatched behavior as `Proposed` or `Unverifiable`, and do not claim historical
fidelity.

## Closing the loop

For an accepted change:

1. update the owner canonical package first;
2. propagate `BR → US → AC → SC → CHK/FTC` as applicable;
3. validate and obtain the required human approvals;
4. publish and verify the canonical source;
5. have the owning prototype process regenerate or correct derived artifacts;
6. rerun static and, when required, interactive parity review.

This workflow reviews and governs HTML/SPEC artifacts. It does not generate or edit them
unless a separately invoked specialist skill owns that task.
