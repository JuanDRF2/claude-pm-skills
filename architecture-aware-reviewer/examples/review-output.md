# Architecture Review: Real-Time Notification System

**Reviewer:** Claude (Architecture-Aware Reviewer skill)
**Date:** 2026-05-21
**Spec version:** v1.0
**Status:** ⛔ Blocked — 2 blockers, 1 warning must be resolved before estimation

---

## Executive Summary

The Real-Time Notification System spec contains **2 architecture blockers** that conflict directly with established ADRs and will cause implementation failure if not resolved. Additionally, 1 warning requires discussion with the User Service team before stories are written. The core feature intent is sound — the delivery and data ownership approach needs to be realigned with platform constraints.

---

## Systems Identified

| System | How Used in This Spec |
|---|---|
| Main application database | Storing `notifications` table (FR-05) |
| Ticketing database | Direct queries for capacity threshold detection (FR-06) |
| User table | New preference columns (FR-07) |
| WebSocket service | Real-time delivery (FR-04) |
| Frontend nav bar | Notification bell + badge (FR-02) |
| Notification drawer | Last 50 notifications (FR-03) |

---

## Findings

### ⛔ BLOCKER 1: Direct Cross-Service Database Query

**Affected requirement:** FR-06
**Conflict:** The spec proposes that the notification service polls the Ticketing database directly every 30 seconds to detect capacity thresholds.
**ADR reference:** ADR-003 — All inter-service communication must use the internal event bus (Kafka). Direct cross-service DB access is prohibited.
**Architecture principle:** The Ticketing database is owned exclusively by the Ticketing Service.

**Why this is a blocker:** Implementing direct DB queries across service boundaries creates tight coupling, bypasses the Ticketing Service's business logic, and violates the data ownership model. This pattern, if allowed, would degrade the entire platform's service isolation over time.

**Resolution options:**

1. **Preferred — Event-driven (Kafka):** Work with the Ticketing team to publish events to the Kafka bus when capacity thresholds are crossed (50%, 75%, 90%, 100%). The Notification Service subscribes to these events. No polling required; threshold logic stays inside the Ticketing Service.

2. **Acceptable — Ticketing Service API endpoint:** The Ticketing Service exposes a new internal API endpoint (`GET /internal/events/:id/capacity-status`) that the Notification Service can call. Polling interval can remain, but access is through the service boundary.

3. **Not acceptable:** Direct DB queries across services in any form.

**Action required:** PM to schedule a cross-team discussion with Ticketing Service owner before stories are written.

---

### ⛔ BLOCKER 2: WebSocket Not Supported in Current Infrastructure

**Affected requirement:** FR-04
**Conflict:** The spec calls for real-time delivery via WebSocket connection managed by a new Node.js service.
**ADR reference:** ADR-007 — WebSocket connections are not supported in the current infrastructure tier. All real-time updates must use HTTP long-polling until Q4 platform migration.

**Why this is a blocker:** Shipping a new WebSocket service requires infrastructure changes (load balancer configuration, connection management) that are blocked pending the Q4 platform migration. Attempting to implement this now would result in either non-functional delivery or out-of-band infrastructure work not scoped in the feature.

**Resolution options:**

1. **Preferred — HTTP long-polling:** Implement notification delivery using HTTP long-polling (client polls `GET /api/notifications/unread` every 15–30 seconds). This is compliant with ADR-007 and can be upgraded to WebSocket in Q4 with minimal frontend changes.

2. **Option B — Defer real-time requirement:** Deliver notifications as near-real-time (30-second polling) and communicate this as an explicit product decision. Set customer expectation accordingly.

3. **Option C — Escalate ADR-007:** If real-time is a hard business requirement for this feature, PM should escalate to the infrastructure team to evaluate whether the Q4 migration can be accelerated for this use case. This would require explicit sign-off and a revised ADR.

**Action required:** PM to decide on delivery mechanism and confirm with infrastructure team.

---

### ⚠️ WARNING: User Preference Columns in Application Database

**Affected requirement:** FR-07
**Risk:** The spec adds notification preference columns (`notif_capacity_enabled`, etc.) directly to the User table in the main application database.
**ADR reference:** ADR-012 — User preferences must be stored in the User Service, not in application database tables. Schema changes to the User table require User Service team sign-off.

**Why this is a warning, not a blocker:** The User Service team may approve this approach for a limited set of notification preferences, or may prefer to own the preferences API. This needs discussion — it is not a hard prohibition, but it requires sign-off.

**Recommendation:** PM to contact the User Service team owner to discuss options:
- User Service owns a new preferences endpoint the Notification Service calls
- User Service accepts the new columns with an agreed schema
- A shared preferences service is used (if one exists)

**Action required:** User Service team sign-off before schema migration is written.

---

### ℹ️ INFO: Notification Table Data Volume

**Note:** Storing the last 50 notifications per user in the main application database (FR-03, FR-05) may create significant row volume at scale if not pruned. Consider adding a retention policy (e.g., auto-delete notifications older than 90 days) from the start. This is not a blocker but is worth noting in the technical spec before handoff.

---

### ℹ️ INFO: Missing Delivery Guarantee Specification

**Note:** The spec does not address what happens if a notification fails to deliver (e.g., user is offline). Clarify whether notifications are: (a) fire-and-forget, (b) stored and delivered on next login, or (c) retried. FR-05 implies storage, which suggests (b), but this should be explicit.

---

## Open Architecture Decisions Needed

- [ ] **Cross-service communication for capacity thresholds** — PM + Ticketing team to decide: Kafka events vs. internal API. Blocker 1.
- [ ] **Real-time delivery mechanism** — PM to confirm: long-polling vs. escalating ADR-007. Blocker 2.
- [ ] **User preference storage ownership** — PM + User Service team to agree on approach. Warning.
- [ ] **Notification retention policy** — Agree on pruning strategy before DB migration is written.

---

## Architecture Checklist

- [x] No new external integrations (internal only)
- [ ] ⛔ No circular dependencies — FAILS: direct Ticketing DB query creates coupling
- [ ] ⛔ No cross-service data ownership violations — FAILS: direct Ticketing DB query
- [ ] ⚠️ Schema changes coordinated with owning team — User Service sign-off needed
- [x] Authentication/authorization model is consistent (`user_id`, `org_id` scoping in FR-05)
- [ ] ⛔ Infrastructure constraints respected — WebSocket violates ADR-007
- [x] Failure mode considered (payment failure notification implies error handling exists)

---

## Recommended Next Steps

1. Schedule Ticketing team sync to agree on event-driven capacity threshold approach (Blocker 1)
2. Confirm long-polling as delivery mechanism with infrastructure team (Blocker 2)
3. Ping User Service team owner about notification preference storage (Warning)
4. Re-submit updated spec for a second architecture review pass
5. Only proceed to story writing after all blockers are resolved
