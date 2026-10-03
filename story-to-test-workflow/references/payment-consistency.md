# Payment Consistency Discovery

Use this checklist only when money moves.

| Term | Plain meaning |
|---|---|
| Authorized | Funds are reserved but not necessarily collected. |
| Captured | The charge was collected. |
| Voided | An uncaptured authorization was cancelled. |
| Refunded | Captured money was submitted for return. |
| Completed purchase | The required payment and product/service states both succeeded. |

Do not use “approved payment” when authorization and capture lead to different outcomes.

Surface these decisions: completion state; product failure before and after capture; duplicates; unknown/time-out results; customer communication; support correlation/evidence; and failure of void/refund compensation.

Classify customer outcomes as business rules, correlation/audit needs as observability requirements, and fault injection/test accounts as test-environment needs.
