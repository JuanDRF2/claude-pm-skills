# Test Design Techniques

## Selection Guide

| Technique | Use when | Typical output |
|---|---|---|
| Equivalence partitioning | Many inputs should behave alike | One representative per valid/invalid class |
| Boundary-value analysis | Rules contain minima, maxima, dates, sizes, or counts | At, below, and above meaningful limits |
| Decision tables | Outcomes depend on interacting conditions | Minimal set covering meaningful rule combinations |
| State transitions | Behavior depends on lifecycle state | Valid and invalid transitions, retry and recovery |
| Scenario testing | Value depends on an end-to-end user goal | Thin critical journeys and alternatives |
| Pairwise sampling | Several lower-risk dimensions interact | Reduced combinations covering value pairs |
| Error guessing | History or architecture suggests known failure modes | Focused regression and resilience probes |
| Exploratory charters | Novelty, usability, or unknown risk matters | Time-boxed mission with observations |

## Plain-Language Examples

- If a family membership allows up to four additional members, test three, four, and five. This is **boundary-value analysis**.
- If empty and whitespace-only messages should behave alike, choose representative examples rather than listing every possible empty-looking value. This is **equivalence partitioning**.
- If the gift email changes according to recipient choice and message presence, put those conditions and outcomes in a table. This is a **decision table**.
- If a future membership moves from scheduled to active or failed, verify the permitted moves and recovery. This is **state-transition testing**.

## Rules

1. Start with business risk, not a preferred technique.
2. Cover critical rules completely when failure impact demands it.
3. Do not use pairwise sampling for combinations with unique high-impact outcomes.
4. Use controlled, non-customer data.
5. Record why omitted values are equivalent to selected representatives.
