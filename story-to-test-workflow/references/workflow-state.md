# Workflow state and resumption

At each gate, maintain:

```markdown
## Workflow State
- Route:
- Current phase:
- Approved through:
- Confirmed rules:
- Open blocking questions:
- Selected scope:
- Next action:
- Markdown package path:
- Shared storage mode:
- Notion availability/destination state:
- Notion root/page manifest:
- Loaded remote snapshot:
- Last synchronized snapshot:
- Artifact language/audiences:
- Optional Word export:
- Notion URL and Word path:
- Notion publication mode and page manifest:
- Publication dossier/run: None | [digest, run path, verified/pending/blocked counts]
- Post-publication receipts: None | [parity, Judge and audit receipt paths]
- Project status and delivery statuses:
- Derived artifacts: None | [artifact list and role]
- Canonical base snapshot:
```

After every material approval, also maintain:

```markdown
## Decision Checkpoint
- Last captured decision:
- Last verified mapping: None | MAP-*
- Rules changed since last gate:
- Stale stories:
- Stale acceptance criteria:
- Stale test artifacts:
- Unresolved mapping questions:
- Last incremental validation:
- Next reconciliation gate:
```

Use `None` explicitly when a stale category or mapping question does not apply. Never
remove a stale item merely because work continued; clear it only after the affected
artifact was reconciled and verified.

When resuming, read this state before the conversation history. If a source changed,
identify affected downstream artifacts and resume from the first stale phase. Never infer
remote identity, approval or synchronization state from an earlier project.
