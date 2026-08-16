# Readiness and Approvals

## Backlog state

Every item has one lifecycle state: Candidate, Selected, Approved, Deferred, Blocked, or Superseded. This is different from implementation status.

## Ready for Sprint

Assess the roles independently:

- Product: value, scope, rules, and acceptance behavior confirmed
- Engineering: dependencies, feasibility, failure behavior, and observability reviewed
- QA: criteria testable, data/environment known, and critical risks coverable

Set `Ready for Sprint: Yes` only when every required role is ready and no blocking contradiction remains. Otherwise state No or Blocked with owner and reason. Approval by one role never implies approval by all.

## Large-project approvals

For many stories, review coherent blocks such as one flow, release slice, or risk area. Show the IDs in each block and allow Approve, Revise, Defer, or Block. Record decisions per item; a block approval must not silently approve stories omitted from its list.

## Design and derived-artifact checkpoint

Before Gate 3, ask for design review when layouts, content, accessibility, responsive
behavior or interaction choices affect acceptance. Make the checkpoint mandatory when a
design, prototype or generated SPEC changes journeys, rules, required data, calculations,
permissions, integrations, payments, communications or scope. Reconcile material deltas
under `derived-artifact-governance.md`. Record Approved, Review needed, Not required or
Blocked.
