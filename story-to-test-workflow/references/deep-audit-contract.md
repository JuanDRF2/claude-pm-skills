# Deep Audit Contract

Read this reference only when the user explicitly requests a deep, full or
cross-refinement audit, or when the intended action requires package-wide assurance that a
localized review cannot provide. A previous Judge `PASS` does not exempt the selected scope
from review.

## Scope modes

| Mode | Required evidence | Boundary |
|---|---|---|
| Localized review | Changed sources and their complete consumer closure | Do not read unrelated pages or call it a full audit |
| Package-wide audit | Every canonical Markdown artifact in one named package | Review the current local snapshot before remote presentations |
| Cross-refinement audit | Every canonical artifact in the exact named package set | Do not silently add neighboring projects |
| Remote parity audit | Registered remote pages required by the declared parity scope | Reuse a current verified snapshot; fetch only what the contract requires |

Freeze the mode, package list, snapshot and intended action before evaluation. Automated
searches may create the inventory and locate risk, but they do not replace semantic review
of every canonical artifact in the frozen deep-audit scope.

## When to propose cross-refinement

Use `external-dependency-contract.md` to distinguish a direct dependency check from a wider
audit. Propose an exact cross-refinement scope when a contradiction crosses package
boundaries, a material shared contract changed, several packages implement the same
critical behavior, or a global readiness claim depends on their combined coherence.

The proposal must name the evidence, packages and intended decision. Do not execute it
without the user's scope approval, and do not use fixed counts of packages or external
rules as a substitute for risk.

## Evidence before questions

Build the source inventory and complete the selected evidence pass before asking product
questions. Resolve apparent gaps against other in-scope sources first. Then ask only genuine
unresolved decisions using `interaction-protocol.md`; do not ask the user to repeat evidence
already present.

If size, access or time prevents complete review, record exactly what was not reviewed and
do not issue a package-wide or cross-refinement `PASS`. Lack of remote access does not force
a new download when the canonical local snapshot is current and remote parity is outside
the intended action.

## Canon and superseded material

Record the current authority and supersession relationship in the existing package
contracts:

- `09-package-index.md` for canonical, derived, deferred and historical artifacts;
- `00-workflow-state.md` for the current approved snapshot and gate;
- the registered manifest/baseline for Notion identities;
- the design delta ledger for superseded prototypes or SPECs.

Do not create an `artifacts/_canon/INDEX.md` convention or delete historical evidence merely
because an audit discovers a successor. Add a visible successor reference where confusion
is possible.
