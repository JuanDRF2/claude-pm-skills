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
- Shared repository URL:
- Canonical branch and observed commit:
- Working branch and base commit:
- Pull Request URL/status:
- Last merged canonical commit:
- Shared storage mode: github-main-v1 | local-only
- Artifact language/audiences:
- Optional Word export:
- Project status and delivery statuses:
- Derived artifacts: None | [artifact list and role]
- Canonical base snapshot:
```

Add this block only when Notion or another external derived view was explicitly requested,
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

For packages created before `github-main-v1`, preserve their existing fields and add the
repository fields when the project is first changed in GitHub. Do not rewrite an unchanged
package only to modernize metadata. A Pull Request is not the last merged canonical commit.
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
