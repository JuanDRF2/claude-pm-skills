# Extending an Approved Package

Use this contract when external scope is added to a registered canonical package whose
behavior already passed Gate 3. Preserve existing decisions, IDs and vocabulary.

## Gate C — Compatibility

Run before assigning IDs, proposing rules or writing stories.

### 1. Load authority

Read the verified canonical snapshot, occupied IDs, rule and contradiction ledgers, closed
decisions, shared contracts and applicable `MAP-*` records. Do not use a handoff or
derived artifact as the ID authority.

### 2. Refute absence semantically

Attempt to disprove every claim that a capability is absent. Compare outcome, actor,
controls, states, transitions, entity lifecycle and inverted control polarity—not only
keywords. Give this pass to `refinement-judge` independently from the authoring pass.

### 3. Map vocabulary

Map incoming and canonical terms in both directions. Record aliases and inverted
equivalences such as `Hide from X = off` versus `List on X = on`.

### 4. Classify every incoming item

Use:

- `Aligned`: same behavior.
- `Duplicate`: behavior already owned by the canon.
- `Contradicted`: conflicts with approved behavior.
- `Overrides`: explicitly proposes replacing approved behavior.
- `Gap`: no owner or equivalent found after the adversarial search.

For the first four, cite both incoming and canonical evidence. For `Gap`, cite the incoming
evidence and record concepts, canonical areas and decision logs reviewed plus the failed
refutation attempt. Never hide a gap merely because no canonical quotation exists.

Save:

```markdown
| Incoming item | Classification | Incoming evidence | Canonical evidence or search record | Owner/action |
|---|---|---|---|---|
```

### 5. Protect closed decisions

Do not downgrade confirmed behavior to pending. Escalate a disagreement as
`Contradicted`; require owner-approved supersession for `Overrides`. Record an approval as
withdrawn when its premise is later disproved.

## Assign IDs only after Gate C

- Read the highest occupied ID per family from the canon.
- Never reuse or renumber an approved ID.
- Record foreign IDs as aliases and keep the package's existing prefix.
- Prefer extending the story that owns the outcome. Create a new story only when no
  cohesive owner exists.
- Apply Decision Capture to every approved change and maintain `MAP-*` when integration or
  propagation applies.

## Gate result

Gate C passes only when every incoming item is classified, blocking contradictions and
overrides have an owner decision, gaps have an owner package, and the independent Judge
does not return `FAIL`. Then continue at Phase 3 and obtain Gates 3 and 4 normally.
