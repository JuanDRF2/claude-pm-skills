# Jira Story Writer — Output Example

Generated from the Event Duplication spec. 5 stories produced, total 18 points.

---

## Story 1: Duplicate Action Entry Points

**Type:** Feature
**Epic:** Event Management Enhancements — Q2
**Labels:** frontend, permissions
**Story Points:** 2
**Priority:** High

### User Story
As an event manager with edit permissions,
I want to see a "Duplicate" option in the event list and event detail views,
So that I can initiate event duplication from wherever I'm working.

### Acceptance Criteria

**Scenario 1: Duplicate visible in event list kebab menu**
```gherkin
Given I am logged in with event:write permission
And I am on the Events list page
When I open the kebab menu for any event
Then I see a "Duplicate" option in the menu
```

**Scenario 2: Duplicate visible in event detail Actions menu**
```gherkin
Given I am logged in with event:write permission
And I am on an Event detail page
When I open the Actions menu
Then I see a "Duplicate" option
```

**Scenario 3: Duplicate NOT visible for read-only users**
```gherkin
Given I am logged in WITHOUT event:write permission
When I open the kebab menu on the Events list
Then I do NOT see a "Duplicate" option
```

### Out of Scope
- The duplication modal (Story 2)
- Any backend changes

### Dependencies
- Permissions service must expose `event:write` check to frontend

### Notes
- Reuse kebab menu component already used in the Membership module

---

## Story 2: Duplication Confirmation Modal

**Type:** Feature
**Epic:** Event Management Enhancements — Q2
**Labels:** frontend
**Story Points:** 3
**Priority:** High

### User Story
As an event manager,
I want to see a confirmation modal when I click Duplicate,
So that I can set the new event name and date before the copy is created.

### Acceptance Criteria

**Scenario 1: Modal opens with pre-filled name**
```gherkin
Given I click "Duplicate" on an event named "Annual Gala 2025"
When the confirmation modal opens
Then the "New Event Name" field is pre-filled with "Copy of Annual Gala 2025"
And the "New Event Date" field is empty
And a "Duplicate" CTA and "Cancel" button are visible
```

**Scenario 2: Date field is required**
```gherkin
Given the duplication modal is open
When I click "Duplicate" without entering a date
Then the form shows a validation error: "Event date is required"
And no duplication is initiated
```

**Scenario 3: Cancel dismisses modal**
```gherkin
Given the duplication modal is open
When I click "Cancel"
Then the modal closes
And no event is created
```

### Out of Scope
- Ticket price editing (managers edit after duplication)
- Any backend calls

### Dependencies
- Story 1 (entry points must exist to trigger modal)
- Reuse Modal component from Design System

---

## Story 3: Event Duplication API Endpoint

**Type:** Feature
**Epic:** Event Management Enhancements — Q2
**Labels:** backend, permissions
**Story Points:** 5
**Priority:** High

### User Story
As the frontend application,
I want to call an API endpoint to duplicate an event,
So that a new draft event is created with the correct copied fields.

### Acceptance Criteria

**Scenario 1: Successful duplication**
```gherkin
Given a valid event ID and a new name and date in the request body
And the requesting user has event:write permission
When POST /api/events/:id/duplicate is called
Then a new event is created in Draft status
And all fields are copied from the source event EXCEPT: id, created_at, status, attendee data, stripe_product_id
And the new event has the provided name and date
And the response returns the new event object with HTTP 201
```

**Scenario 2: Missing required fields**
```gherkin
Given the request body is missing the new event date
When POST /api/events/:id/duplicate is called
Then the API returns HTTP 400 with error: "newDate is required"
```

**Scenario 3: Unauthorized user**
```gherkin
Given the requesting user does NOT have event:write permission
When POST /api/events/:id/duplicate is called
Then the API returns HTTP 403
```

**Scenario 4: Source event not found**
```gherkin
Given an event ID that does not exist
When POST /api/events/:id/duplicate is called
Then the API returns HTTP 404
```

### Out of Scope
- Duplicating attendee records
- Copying Stripe product configuration

### Dependencies
- Auth middleware must validate `event:write` scope
- Event model must support full-field copy (confirmed with tech lead)

### Notes
- `stripe_product_id` must be explicitly set to null on the copy — do not carry over
- New event ID must be a fresh UUID

---

## Story 4: Post-Duplication Redirect and Success State

**Type:** Feature
**Epic:** Event Management Enhancements — Q2
**Labels:** frontend
**Story Points:** 2
**Priority:** Medium

### User Story
As an event manager,
I want to be redirected to the new event's edit view after duplication,
So that I can immediately review and update the copied event.

### Acceptance Criteria

**Scenario 1: Successful redirect with banner**
```gherkin
Given I have confirmed duplication in the modal
When the API returns success
Then I am redirected to the edit view of the newly created draft event
And a success banner is displayed: "Event duplicated successfully. Review and publish when ready."
And the banner is dismissible
```

**Scenario 2: API error handling**
```gherkin
Given I have confirmed duplication in the modal
When the API returns an error
Then the modal remains open
And an inline error message is displayed: "Something went wrong. Please try again."
And no redirect occurs
```

### Out of Scope
- Email notifications
- Any changes to the event edit view itself

### Dependencies
- Story 2 (modal) and Story 3 (API) must be complete

---

## Story 5: QA — End-to-End Duplication Flow

**Type:** Task
**Epic:** Event Management Enhancements — Q2
**Labels:** frontend, backend
**Story Points:** 3 (wait — actually this is a QA task, suggest 2)
**Story Points:** 2
**Priority:** Medium

### User Story
As a QA engineer,
I want to verify the complete event duplication flow end-to-end,
So that I can confirm all scenarios work correctly before release.

### Acceptance Criteria

**Scenario 1: Full happy path**
```gherkin
Given all duplication stories are deployed to staging
When I duplicate an event as an authorized user
Then a new draft event is created with correct copied data
And I am redirected to the new event edit view
And the success banner appears
```

**Scenario 2: Permission boundary**
```gherkin
Given I am logged in as a read-only user
When I navigate to the Events list
Then no Duplicate option is visible anywhere in the UI
```

**Scenario 3: Stripe field exclusion**
```gherkin
Given the source event has a stripe_product_id configured
When I duplicate the event
Then the new event has stripe_product_id = null
```

### Out of Scope
- Performance testing
- Load testing

### Dependencies
- Stories 1–4 complete on staging

### Notes
- Test with events that have: images, multiple ticket tiers, donation asks, and Stripe config

---

## Summary

| Story | Points | Priority |
|---|---|---|
| 1 — Duplicate entry points | 2 | High |
| 2 — Confirmation modal | 3 | High |
| 3 — Duplication API | 5 | High |
| 4 — Redirect + success state | 2 | Medium |
| 5 — QA end-to-end | 2 | Medium |
| **Total** | **14** | |
