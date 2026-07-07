# Estimation & QA Reference

This reference defines the company's estimation framework and QA taxonomy for AI-built deliverables. The framework is mandatory — every deliverable in every spec must show its math using this formula.

## Why this exists

All V2 development is performed by AI agents supervised by humans (one agent + human reviewer per deliverable = a "pair"). Traditional engineer-day estimates don't apply. We measure in **pair-weeks**: how many calendar weeks one agent+human pair needs at the assumed velocity.

The formula is intentionally simple so PMs can use it without engineering background, and so estimates are comparable across specs.

## The formula

```
Effort (pair-weeks) = (Scope × Complexity × Risk) / Velocity
```

### Scope (in PRs)

| Size | PR count | Examples |
|---|---|---|
| **S** | 1–2 PRs | Single CRUD endpoint, one UI screen, one config field |
| **M** | 3–5 PRs | Bounded feature within a domain (e.g., one config UI + supporting backend) |
| **L** | 6–10 PRs | New bounded service or major surface (e.g., a wallet pass generation service) |
| **XL** | 10+ PRs | Cross-domain initiative, requires breaking down into multiple deliverables (do not estimate XL — split it) |

Default the value to the midpoint: S=1.5, M=4, L=8.

### Complexity multiplier

| Multiplier | When |
|---|---|
| **1.0×** | Baseline — patterns the team has built before, single domain, well-understood |
| **1.5×** | Cross-domain — touches multiple teams' bounded contexts (e.g., Membership + Scheduling) |
| **2.0×** | Novel pattern — no existing reference implementation at the company (e.g., first Apple PassKit integration) |

### Risk multiplier

| Multiplier | When |
|---|---|
| **1.0×** | Known stack — V2-native with established patterns |
| **1.3×** | Integration — depends on a third-party API or SDK (Apple/Google/Stripe/etc.) |
| **1.5×** | SF↔V2 dual-write — bidirectional sync with Salesforce, or any place where state must remain consistent across both systems |

### Velocity

**4 merged PRs/week per agent+human pair.** This is the V2 baseline. If a team is consistently exceeding or missing this, flag it to the Architecture Guild — but don't change the formula in a spec.

## Worked examples

### Example 1: Bounded V2-native UI

A Membership Manager config screen, 3 PRs, no third-party integration, single domain.

```
(3 × 1.0 × 1.0) / 4 = 0.75 pair-weeks
```

### Example 2: New wallet pass service

Apple + Google wallet pass generation from scratch. Net-new infrastructure (novel pattern) with two third-party SDK integrations. 6 PRs.

```
(6 × 2.0 × 1.3) / 4 = 3.9 pair-weeks
```

### Example 3: Cross-domain event consumer

Membership team writes a consumer of Scheduling domain events. 4 PRs, cross-domain, integrates with an internal event bus (not third-party).

```
(4 × 1.5 × 1.0) / 4 = 1.5 pair-weeks
```

### Example 4: SF outbox sync

Bidirectional sync writing both to V2 and SF. 2 PRs of code but 1.5× risk for the dual-write.

```
(2 × 1.0 × 1.5) / 4 = 0.75 pair-weeks
```

## How to show the math in a deliverable

Every deliverable section in every spec must include this format:

> **Estimate.** Scope M (4 PRs) × Complexity 2.0× (novel pattern — no wallet infra at the company) × Risk 1.3× (Apple/Google integration) / Velocity 4 = **2.6 pair-weeks**

Always annotate *why* each multiplier was chosen. Numbers without justification are ungovernable.

## When a deliverable reuses infrastructure from an earlier deliverable

Per Rule #10, shared infrastructure is built incrementally inside customer-facing vertical slices, not as a standalone foundation deliverable. When a later deliverable extends infrastructure built earlier in the same spec, its complexity multiplier drops one notch — the novel pattern has already been built. Mark this explicitly in the estimate justification:

> **Estimate.** Scope M (4 PRs) × Complexity 1.5× cross-domain × 1.0× (wallet pass service from D1 reused) / 4 = **1.5 pair-weeks**

This rewards reuse and keeps the math honest. The deliverable that introduces a piece of infrastructure carries the 2× novel-pattern multiplier; subsequent deliverables that extend it carry 1×.

The same logic applies even when "earlier in the same spec" means the work was bundled inside another vertical slice rather than a dedicated foundation. The skill should look at *what code already exists at the start of this deliverable* to decide the multiplier, regardless of whether that code was the explicit point of an earlier deliverable or a means-to-an-end inside one.

---

# QA Taxonomy

Every deliverable must define its QA scope across these layers. Not every layer applies to every deliverable, but you must explicitly include or exclude each one.

| Layer | What it tests | Owner | Typical scope |
|---|---|---|---|
| **Unit** | Function-level correctness | Agent writes, human reviews | 80% coverage on new code |
| **Integration** | API contracts, sync boundaries, third-party SDK behavior | Agent writes, human reviews | All public interfaces, all sync seams |
| **E2E** | User-facing happy path + 2–3 critical error paths | Agent writes, human reviews | Per JTBD in the spec |
| **Manual exploratory** | Human-only — find what tests missed | Human (QA team) | One cycle per deliverable |
| **Performance / load** | Throughput, latency, scale | Agent writes + human reviews; runs in CI | Only when scale or latency is a flagged risk |
| **Bug Killer Machine regression hook** | Auto-regression on existing bug repros | Agent-generated tests, QA reviews | Required when fixing a bug; optional for greenfield |
| **Security review** | Authn/authz, signing, secrets handling | Human | Required when handling credentials, signing keys, PII |

## QA estimation

Use the same formula. QA scope is usually 30–60% of dev scope.

```
QA effort = (QA scope × Complexity × Risk) / Velocity
```

Show the math the same way:

> **QA estimate.** 3 PRs × 1.5× (cross-platform device coverage) / 4 = **1.13 pair-weeks**

## What counts as "AI-built supervised by humans"

- Agent writes test code; human reviews before merge
- Agent runs the test suite; human reviews flaky / failed results
- Manual exploratory testing is human-only — agents cannot substitute for it
- Security review is human-only when it involves cryptographic material or PII

If a deliverable cannot be QA'd by this model (e.g., requires hardware testing, requires real customer data we don't have synthetic equivalents for), flag it as a risk in the Risks section of the spec.
