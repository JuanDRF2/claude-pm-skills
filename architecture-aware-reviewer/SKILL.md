---
name: architecture-aware-reviewer
description: Reviews a product spec or user story set against established architecture principles and ADRs, surfacing conflicts and risks before engineering picks up the work.
---

# Skill: Architecture-Aware Reviewer

## What It Does

Reviews a product spec or user story set against established architecture principles and Architecture Decision Records (ADRs). Surfaces conflicts, risks, and alignment gaps before engineering picks up the work — saving expensive late-stage rework.

---

## When to Use It

- Before handing a spec to engineering for estimation
- When a feature touches multiple systems or integrations
- When you suspect a feature might conflict with platform constraints
- Before sprint planning, to validate stories are architecturally sound
- After a major architectural decision, to audit existing backlog

---

## How It Works

**Input:**
- A mini spec or set of Jira stories
- (Optional) A list of ADRs or architecture principles to check against

**Process:**
1. Identifies all systems, APIs, and data models referenced in the spec
2. Checks each against known architecture principles (provided or inferred from context)
3. Flags conflicts with a severity rating (Blocker / Warning / Info)
4. Suggests resolution options for each conflict
5. Identifies missing architecture context (where a decision is needed)
6. Produces a reviewer summary suitable for sharing with a tech lead

**Output:** A structured architecture review document

---

## Output Format

```markdown
# Architecture Review: [Spec/Feature Name]

**Reviewer:** Claude (Architecture-Aware Reviewer skill)
**Date:** [Date]
**Status:** ⛔ Blocked | ⚠️ Needs Discussion | ✅ Clear to Proceed

---

## Executive Summary
[2-3 sentence summary of overall architectural health of the spec]

---

## Systems Identified
- [System 1] — [how it's used in this spec]
- [System 2] — [how it's used in this spec]

---

## Findings

### ⛔ BLOCKER: [Finding Title]
**Affected requirement:** FR-02
**Conflict:** [Description of the conflict]
**ADR reference:** ADR-007 (if applicable)
**Resolution options:**
1. [Option A]
2. [Option B]

---

### ⚠️ WARNING: [Finding Title]
**Affected requirement:** FR-04
**Risk:** [Description of the risk]
**Recommendation:** [Suggested action]

---

### ℹ️ INFO: [Finding Title]
**Note:** [Non-blocking observation or suggestion]

---

## Open Architecture Decisions Needed
- [ ] [Decision 1 — what needs to be decided and by whom]
- [ ] [Decision 2]

## Checklist
- [ ] No circular dependencies introduced
- [ ] Authentication/authorization model is consistent
- [ ] Data ownership is clear (no cross-service data writes)
- [ ] API contracts are versioned or backward-compatible
- [ ] No new external integrations without security review
- [ ] Performance impact assessed for high-volume paths
```

---

## Example Workflow

1. PM writes spec for "Real-time Notification System"
2. PM runs `/architecture-aware-reviewer` and pastes the spec
3. Claude identifies: (1) spec assumes WebSockets but platform ADR mandates polling for this tier, (2) notification data model duplicates fields already owned by the User Service
4. PM shares the review with the tech lead before estimation
5. Tech lead resolves the conflicts — no surprises during sprint

---

## Technical Implementation

This skill instructs Claude to:

1. **Step 1 — Architecture context.** Use the Notion MCP (notion-search, query_type=internal) to find: 'Architecture Principles', the relevant 'ADR's, 'C4 Architecture', and the '[domain] Domain' page; then fetch them. The architecture source of truth lives in Notion, not in local or project knowledge.
2. Parse all system references, data models, and integration points from the spec
3. Apply the architecture principles and ADRs retrieved from Notion in step 1; cross-reference each finding against them
4. Rate severity as: Blocker (will cause implementation failure), Warning (will cause friction or tech debt), Info (suggestion)
5. Never recommend specific implementation approaches — only surface conflicts and options

**Guardrails:**
- Only flag genuine conflicts, not stylistic preferences
- Always provide at least one resolution option per blocker
- Mark findings as Info when uncertain — never overstate severity
- Distinguish between "this is wrong" and "this needs a decision"

---

## Architecture Principles Used By Default

When no ADRs are provided, the skill applies these common principles:

| Principle | Description |
|---|---|
| Single source of truth | Each data entity has one owning service |
| Backward compatibility | API changes must not break existing consumers |
| Explicit over implicit | All integrations must be declared, not assumed |
| Fail-safe defaults | System failures should degrade gracefully |
| Least privilege | Components request only the access they need |
| Async for scale | High-volume operations use queues, not synchronous calls |

---

## Tips for Best Results

- Paste your ADRs or link to your architecture docs in the input for more precise reviews
- Include the tech stack in the input if not obvious from the spec
- Run this skill after Mini Spec Writer, before Jira Story Writer — fix conflicts before stories are written
- Share the output directly with your tech lead as a pre-estimation checklist
