# Story Mapping Examples and Pitfalls

## Contents

- Running membership example
- Additional mapping example
- Seven common pitfalls and fixes

### Running Membership Example

Carry stable IDs into the next skills:

```text
BR-01: In an individual purchase, the buyer is the membership holder.
BR-02: One approved purchase creates one payment and one membership.
BR-03: A rejected payment does not create or activate a membership.

Candidate story: US-MEM-01 — Guest buys an individual membership end to end.
```

The splitting skill decides whether `US-MEM-01` is small enough. The user-story skill turns it into accepted behavior. The test-case skill later produces `TC-MEM-*` evidence.

---

## Examples

See `examples/sample.md` for a full story map example.

---

## Common Pitfalls

### Pitfall 1: Activities Are Features, Not User Behaviors
**Symptom:** "Activity 1: Use the dashboard. Activity 2: Generate reports."

**Consequence:** You've mapped the product, not the user journey.

**Fix:** Reframe as user actions: "Activity 1: Monitor project progress. Activity 2: Summarize work for stakeholders."

---

### Pitfall 2: Too Many Activities
**Symptom:** 10+ activities across the backbone

**Consequence:** Map becomes overwhelming and loses focus.

**Fix:** Consolidate. If you have 10 activities, you're likely mixing activities with steps. Aim for 3-5 high-level activities.

---

### Pitfall 3: Tasks Are Too Vague
**Symptom:** "Task 1: Do the thing"

**Consequence:** Can't prioritize or estimate vague tasks.

**Fix:** Be specific: "Task 1: Enter client email address in the 'Bill To' field."

---

### Pitfall 4: Ignoring Vertical Prioritization
**Symptom:** All tasks at the same level—no MVP vs. future releases defined

**Consequence:** No clarity on what to build first.

**Fix:** Explicitly prioritize. Draw release lines. Force hard choices about what's MVP.

---

### Pitfall 5: Mapping in Isolation
**Symptom:** PM creates the map alone, then presents it to the team

**Consequence:** No shared ownership or understanding.

**Fix:** Map collaboratively. Run a story mapping workshop with product, design, and engineering.

---

### Pitfall 6: A Single Happy Path Hides the Product
**Symptom:** The map ends at success and omits rejection, partial failure, retries, or future activation.

**Consequence:** Stories look smaller than the behavior engineering and QA must actually support.

**Fix:** Add alternate and recovery paths, then decide explicitly which release owns them.

---

### Pitfall 7: Treating Unknowns as Rules
**Symptom:** The map contains plausible behavior with no source or owner.

**Consequence:** AI-generated assumptions become accidental product commitments.

**Fix:** Label each item as confirmed, proposed, assumed, or unknown and assign a decision owner.

---
