# Jira Story Writer — Input Example

This is the spec passed to the Jira Story Writer skill. It's the output from Mini Spec Writer, cleaned up after the PM reviewed open questions.

---

## Input: Mini Spec (Resolved)

**Feature:** Event Duplication
**Status:** Ready for story breakdown
**Open questions resolved:**
- Ticket prices are copied as-is; managers can edit after duplication
- Stripe product references are excluded from copy (reset to unconfigured)
- Salesforce campaign links are NOT copied (out of scope)
- No archive date limit for source events

---

## Functional Requirements (for story breakdown)

**FR-01:** Duplicate action available from event list view (kebab menu) and event detail view (Actions menu) — requires `event:write` permission

**FR-02:** Duplication confirmation modal with: source event name, editable new name (pre-filled "Copy of [Name]"), required new date field, Duplicate + Cancel CTAs

**FR-03:** System creates new event in Draft status with all fields copied except: event ID, created date, status, attendee data, Stripe product references

**FR-04:** After duplication, redirect to new draft's edit view with success banner

**FR-05:** Users without `event:write` permission do not see the Duplicate action

---

## Team Context
- **Labels used:** frontend, backend, permissions
- **Epic:** Event Management Enhancements — Q2
- **Team velocity:** ~30 points per 2-week sprint
- **Tech stack:** React frontend, Node/Express API, PostgreSQL
