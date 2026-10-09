# {Feature Name} (Migration to V2)

**Release Date:** {Date or TBD}
**Product Area:** {Product / Sub-area}
**Story:** [{Jira key}]({Jira URL})
**Owner (PM):** {Name}
**Refinement:** {Link to refinement package}
**Reference Implementation:** {What existing V2 feature follows the same pattern, if any}

---

## Part A: Migration Overview (General Audience)

### 1. What is changing?

{Feature Name} is moving from the V1 platform to {the new platform}. The functionality you use today
continues to work the same way, now powered by the V2 platform.

- **What stays the same:** {List behaviors the user will recognize}
- **What improves:** {List UX or functional improvements over V1}
- **What is not included yet:** {Scope boundaries for this migration phase}

### 2. What does the user see differently?

{Describe the visual or interaction differences the staff will notice. Be specific:
"The button still says 'Complete Checkout' but the form now opens inline instead of in a
new window." Include screenshots if available.}

### 3. V1 to V2 behavior comparison

| Behavior | V1 (legacy platform) | V2 (embedded platform) |
|----------|----------------|-------------|
| {Behavior} | {How V1 works} | {How V2 works} |
| {Behavior} | {How V1 works} | {How V2 works} |
| {Behavior} | {How V1 works} | {How V2 works} |

---

## Part B: Team-Specific Instructions (GTM Focused)

### 1. CS (Customer Success) Team

- **Rollout plan:** {Phased? All at once? Feature flag?}
- **Client communication:** {Do clients need to be notified? When?}
- **Pricing & Packaging:** {Any changes? Usually "No changes, included in existing plan."}

### 2. Implementation Team

{Steps to enable the V2 version in a client's org:}

1. {Step: e.g., "Verify V2 embed setting is configured for the org"}
2. {Step: e.g., "Enable feature flag X in the CRM"}
3. {Step: e.g., "Replace V1 button with V2 button on Contact layout"}
4. {Step: e.g., "Verify the feature works end-to-end in the client's sandbox"}

> **Important:** {Rollback instructions if the V2 version has issues. How to revert
> to V1 button/component.}

### 3. Support Team

- **Help Center Documentation:** {Link or status}
  - Draft: {Link to Knowledge Article Draft subpage}
- **Known Limitations / Differences from V1:**
  - {Difference that might generate support tickets}
  - {Feature from V1 not yet available in V2}
- **Rollback procedure:** {How to revert to V1 if a client reports issues}
- **FAQ:**

**Q1: Does this replace the old {feature name}?**
A: {Yes/No. Explain the transition timeline.}

**Q2: Will my existing {records/data} be affected?**
A: {Explain data continuity.}

**Q3: Do I need to retrain my staff?**
A: {Explain what's different and what training is needed.}

### 4. Sales and Marketing Teams

**Positioning for migrations:**

This is not a new feature to sell. It is the same capability rebuilt on a modern platform.
Use it to reinforce the V2 value story:

- {Benefit of V2 platform: e.g., "Faster performance, consistent UX across all modules"}
- {Benefit of V2 platform: e.g., "Works on any device, no legacy desktop client required"}

**If asked by a prospect:** {One sentence explaining that this capability is included
and continuously improving on the V2 platform.}

---

## V1 Legacy Reference (Internal)

This section is for internal reference. Do not share with clients.

- **V1 component:** {the legacy component and the repo that holds it}
- **V1 controller:** {the legacy controller or service}
- **V1 entry point:** {e.g., a "Complete Checkout" link on the Contact record}
- **V2 embed wrapper:** {the wrapper that embeds the new surface, and its repo}
- **V2 widget:** {the new front-end entry and its repo}
- **V2 backend:** {the new APIs and their repo}

---

## Subpages

- Knowledge Article Draft
