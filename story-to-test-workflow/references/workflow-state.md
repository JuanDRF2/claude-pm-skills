# Workflow state and resumption

The main `## Workflow State` block lives inline in `SKILL.md`'s "State and Resumption"
section (including the Gate approval log) — maintain it there at each gate. This file holds
the optional supplementary blocks below.

Add the Derived Output State block only when Notion or another external derived view was explicitly requested,
already registered and material to the current work, or known to contain a remote edit:

```markdown
## Derived Output State
- Destination: Notion | Jira
- State: Publication requested | Synced to commit <SHA> | Deferred | Stale or unknown | Unavailable
- External identity/URL:
- Model/baseline: None | native-pages-fast-v1 | legacy-recovery | [registered baseline]
- Publication dossier/run: None | [digest, affected scope, verified/pending/blocked pages]
- Post-publication receipts: None | [parity, Judge and audit receipt paths]
```

Do not add the block merely to record `Not requested`, and do not ask the user to choose a
derived destination during ordinary refinement.

Add this block after Gate 4 only when Product Taxonomy applies, an existing mapping is in
scope, or post-delivery reconciliation was requested:

```markdown
## Taxonomy Alignment State
- Taxonomy required / Taxonomy requerido: Yes | No
- Handoff policy / Política de handoff: Verified required | Approved exception allowed
- MCP capability / Capacidad MCP: Available | Unavailable | Not checked
- Mapping path / Ruta del mapping: integrations/taxonomy-mapping.md | None
- Mapping status / Estado del mapping: Draft | Verified | Stale | Blocked
- Last remote evidence / Última evidencia remota: None | [date and receipt]
- Owner / Responsable:
- Handoff consequence / Consecuencia para el handoff:
```

Do not describe `Unavailable` as a product defect. It is an execution limitation whose
handoff consequence follows the recorded team policy. Never store a token or secret.
Preserve legacy derived-output fields in old packages until that package is materially
changed; do not treat them as required for new work.

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
