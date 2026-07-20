# Rule Governance

Write rules for people first and traceability second. A reader should understand the behavior without knowing what `BR` means.

## Rule record

For each rule record: ID, plain-language behavior, source, decision authority, status, affected flows, and last decision. Allowed statuses are Confirmed, Proposed, Contradicted, Deferred, and Superseded.

Authority order, unless the project defines another one:

1. Explicit decision from the accountable product owner
2. Approved primary specification
3. Approved specialized specification or design
4. Existing approved story or policy
5. Historical behavior
6. AI proposal

An authority order helps identify who must decide; it does not authorize the skill to discard a conflict.

## Contradiction log

Record: conflict ID, rule/topic, source A, source B, user-visible consequence, resolution, approver, date, and affected artifacts. Until resolved, keep the item as a question and mark dependent criteria or tests Blocked.

## Consolidation

Use one rule when several sentences describe the same decision. Split a rule only when parts can change independently, apply to different flows, have different authorities, or need independent acceptance/test coverage. Never create IDs merely to mirror paragraph boundaries.
