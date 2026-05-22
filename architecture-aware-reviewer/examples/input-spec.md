# Architecture-Aware Reviewer — Input Example

This is the spec passed to the Architecture-Aware Reviewer skill. The PM wants to validate it before handing to engineering for estimation.

---

## Spec: Real-Time Notification System

**Feature:** In-app notifications for event managers
**Author:** PM
**Date:** 2026-05-21

### Problem Statement
Event managers miss critical updates (ticket sales milestones, capacity warnings, payment failures) because they only learn about them when they log in and manually check the dashboard.

### Proposed Solution
Build a real-time notification system that pushes alerts to event managers while they are logged into the platform.

### Functional Requirements

**FR-01:** System sends in-app notifications when:
- Ticket sales reach 50%, 75%, 90%, and 100% of capacity
- A payment fails for a ticket purchase
- An event is 48 hours away and attendance confirmation rate is below 60%

**FR-02:** Notification bell icon in the nav bar shows unread count badge

**FR-03:** Clicking the bell opens a notification drawer with the last 50 notifications

**FR-04:** Notifications are delivered in real-time via WebSocket connection

**FR-05:** Notification data is stored in a new `notifications` table in the main application database, with fields: id, user_id, org_id, event_id, type, message, read, created_at

**FR-06:** The notification service reads directly from the Ticketing database to detect capacity thresholds (by running a query every 30 seconds)

**FR-07:** Notification preferences (opt-out per type) are stored in the User table by adding columns: `notif_capacity_enabled`, `notif_payment_enabled`, `notif_attendance_enabled`

### Tech Assumptions
- WebSocket connection managed by a new Node.js service
- Frontend uses a shared WebSocket context provider
- Notification queries run against the Ticketing database (PostgreSQL, separate instance)

---

## Architecture Context Provided

**ADR-003:** All inter-service communication must use the internal event bus (Kafka), not direct database queries. Direct cross-service DB access is prohibited.

**ADR-007:** WebSocket connections are not supported in the current infrastructure tier. All real-time updates must use HTTP long-polling until the platform migrates to a WebSocket-capable load balancer (planned Q4).

**ADR-012:** User preferences and settings must be stored in the User Service, not in the application database tables. Schema changes to the User table require User Service team sign-off.

**Architecture principle:** The Ticketing database is owned by the Ticketing Service. No other service may query it directly.
