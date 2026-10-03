# Journey Integrity Contract

Use this contract for payments, purchases, renewals, destructive or identity-sensitive
flows, and any journey whose successful completion creates or updates several related
business results. Apply it proportionally: a simple isolated behavior does not need a
journey-level case merely because it has a UI.

## Invariant

Automation does not define functional coverage. First design a complete, traceable and
verifiable journey; then decide which parts to automate and at which test level.

Keep `SC-*` scenarios atomic, independent and owned by their primary `AC-*`. Compose the
complete journey in one `FTC-*`; never turn it into a mega scenario or require one scenario
to run before another. The composition is a coverage proof, not an execution dependency.

## When journey integrity is required

Mark `Journey integrity / Integridad del recorrido: Required` when failure across the
connected flow could leave the customer, money, access, lifecycle or related records in an
inconsistent state. This normally includes:

- payments, purchases, renewals, refunds and compensation;
- asynchronous or cross-system completion;
- creation or update of several related business records;
- duplicate prevention, idempotency or retry behavior;
- destructive, permission, identity or privacy-sensitive flows.

Use `Not applicable — [reason]` for a genuinely isolated event. Risk alone does not force a
browser E2E; it forces an explicit journey-coverage decision.

## Required composition

For every required journey, the `FTC-*` must state:

1. **Entry action:** the user action or external trigger that starts the journey.
2. **Visible outcome:** what the user or authorized actor can observe.
3. **Completion condition:** the final processing signal, not merely an intermediate banner.
4. **Downstream consistency:** applicable created/updated results, exact counts, relationships,
   amounts, dates, states, absence of duplicates and idempotent outcome. Use `Not applicable`
   only with a reason.
5. **Composing scenarios:** the canonical `SC-*` scenarios that jointly prove the journey.
6. **End-to-end validation:** the thin complete path and its level or an explicit Manual or
   Blocked decision with rationale and owner.
7. **Scenario independence:** how each scenario obtains its own controlled initial state and
   does not depend on execution order.
8. **Authorized evidence:** UI, API, internal UI, permitted query, message, receipt, record or
   log used to prove the result.
9. **Residual risk:** what remains unproven, or `None` with a brief basis.

Internal object names are evidence, not the only understandable outcome. Keep product
behavior in the canonical scenario and place records, APIs, events and logs in checks,
test data or technical evidence unless they are themselves an approved product surface.

## Thin end-to-end rule

Every required journey must have one complete validation path. Automate it when the risk,
repeatability, stability, authorized access and maintenance value justify automation now.
Otherwise classify it `Manual` or `Blocked` and record the reason, owner and residual risk.

Reserve the thin path for the principal outcome. Test calculations, boundaries, validation,
failure combinations and lower-level contracts at Unit, Component, API or Integration level
when those levels prove the behavior more reliably. Do not duplicate every variation in E2E.

## Downstream and asynchronous evidence

Verify only applicable, authorized evidence. When the journey persists related results,
check the material subset of:

- existence and exact count;
- relationships and ownership;
- amounts, dates, recipients and states;
- absence of duplicates and idempotent retries;
- consistency between visible UI, API/integration result and persisted state.

For asynchronous completion, wait for an approved terminal signal or completion condition,
not a fixed delay as the primary mechanism. Locate the result with an approved correlation
identifier, controlled unique data or another reliable key. If none exists, record an
observability dependency; never invent one.

## Acceptance-criteria boundary

Do not add an `AC-*` merely to make automation easier. Create or change a criterion only
when observable product behavior is missing or has no clear owner. Test mechanics belong in
checks, controlled data, dependencies, evidence and automation strategy.

## Gate result

Journey coverage fails when a required critical flow has only fragmented checks and no
composition, lacks a complete validation path or explicit exception, depends on scenario
execution order, omits applicable downstream consistency, or hides residual risk. A journey
may remain approved for product behavior while QA design is `Needs refinement` or `Blocked`.
