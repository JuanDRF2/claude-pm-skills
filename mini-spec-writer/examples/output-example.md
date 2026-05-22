# Mini Spec: Event Duplication

**Status:** Draft
**Author:** PM (via Mini Spec Writer skill)
**Date:** 2026-05-21
**Version:** 1.0

---

## Problem Statement

Event managers must manually recreate recurring events (e.g., annual galas, seasonal fundraisers) from scratch each year, causing significant data entry overhead and a high error rate. This friction is contributing to customer churn at renewal time.

---

## Target User

**Event Manager** at a cultural institution (museum, nonprofit, performing arts org) who runs 1–3 recurring annual events and currently spends 2–4 hours re-entering event data each cycle.

---

## Goal

Allow event managers to duplicate an existing event, producing a new draft with all configuration copied and a prompt to update date-sensitive fields (date, ticket prices) before publishing.

---

## Scope

### In Scope
- Duplicate a single past or current event into a new draft
- Copy all event fields: name, description, venue, ticket tiers, donation asks, images, settings
- Prompt user to update: event date(s), ticket prices (optional), event name (optional)
- New event is created in **Draft** status — not auto-published
- Available from the event list view and event detail view

### Out of Scope
- Recurring/scheduled event series (future initiative)
- Bulk duplication of multiple events at once
- Duplicating events across organizations
- Copying attendee or response data from the source event

---

## Functional Requirements

### FR-01: Duplicate action entry point
Event managers can initiate duplication from:
- The event list view (kebab menu → "Duplicate")
- The event detail view (Actions menu → "Duplicate")

### FR-02: Duplication confirmation modal
Upon initiating duplication, a modal appears with:
- Source event name displayed for confirmation
- A "New Event Name" field (pre-filled with "Copy of [Source Event Name]")
- A "New Event Date" field (required, empty by default)
- A "Duplicate" CTA and "Cancel" option

### FR-03: Draft creation
On confirmation, the system creates a new event in Draft status with all fields copied from the source event, except:
- Event ID (new UUID assigned)
- Created date (set to now)
- Status (set to Draft)
- Attendee data (not copied)

### FR-04: Post-duplication redirect
After successful duplication, the user is redirected to the new draft event's edit view with a success banner: *"Event duplicated successfully. Review and publish when ready."*

### FR-05: Permission scoping
Duplication is available only to users with `event:write` permission on the organization. Read-only users do not see the Duplicate action.

---

## Open Questions

- [ ] Should ticket prices be copied as-is, or should we prompt for price updates in the modal? (Ask: ops team preference)
- [ ] What happens if the source event has a connected Stripe product? Should payment config be duplicated or reset?
- [ ] Do we need to copy event-level integrations (e.g., Salesforce campaign links)?
- [ ] Is there a limit on how old a source event can be for duplication (e.g., 2-year archive)?

---

## Assumptions

- The Event data model supports full-field copy without schema changes (confirmed by tech lead)
- The "Duplicate" UI pattern from the Membership module can be reused (design system component exists)
- Draft events do not trigger any notifications or external syncs until published

---

## Dependencies

- **Design:** Reuse Duplicate modal pattern from Membership module
- **Payments team:** Clarify behavior for copied Stripe product references (see open question)
- **Data team:** Confirm no reporting implications for draft events cloned from past events

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Stripe product config conflict on copy | Medium | High | Exclude payment config from copy; reset to unconfigured |
| Users accidentally publish without updating date | Medium | Medium | Require date field in modal before duplication proceeds |
| Performance on events with large image sets | Low | Low | Copy image references, not binaries |

---

## Success Metrics

- 40%+ of annual event customers use duplication within 90 days of launch
- Manual CSV re-import workaround usage drops by 70%
- Support tickets related to "recreating events" decrease by 50%
- Zero reported incidents of duplicated events publishing with wrong dates
