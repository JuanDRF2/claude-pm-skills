# Decision Capture

Use this transaction after every material user approval. A decision is material when it
changes product behavior, scope, data meaning, integration, propagation, recovery,
permissions, observability, acceptance criteria or test expectations.

## Transaction

Complete in order:

1. Interpret the approval narrowly; do not expand it into adjacent assumptions.
2. Create or update the stable `BR-*` record.
3. Record source, approver, date, status, affected flows, exceptions and any superseded
   rule.
4. For integration behavior, create or update the required `MAP-*` using
   `integration-mapping.md`.
5. Identify every downstream story, criterion, check, scenario, handoff and derived view
   affected by the change.
6. Update stable artifacts immediately. Mark affected derived artifacts stale instead of
   silently leaving them current.
7. Update the Decision Checkpoint in `00-workflow-state.md`.
8. Re-read the exact persisted records and compare them with the user's approved wording.
9. Run:

   ```text
   scripts/validate-package.py <artifact-folder> --language <code> --decision-checkpoint
   ```

10. Correct failures before asking the next question.

## Capture receipt

Keep the user-visible receipt short:

```text
Captured: BR-99 and MAP-ADDR-01
Updated: rules, mapping ledger and workflow checkpoint
Marked stale: US-CON-02 and address test coverage
```

Do not expose mechanical detail unless validation failed or the user asks. Never say
“documented” when the write, readback or incremental validation did not succeed.

## Reconciliation

Do not rewrite unstable downstream artifacts after every decision. Before the next gate
that approves or consumes an affected artifact:

1. Reconcile every stale consumer against the current `BR-*` and `MAP-*`.
2. Preserve stable IDs.
3. Clear the stale entry only after readback.
4. Run the applicable full package validation at the gate.
