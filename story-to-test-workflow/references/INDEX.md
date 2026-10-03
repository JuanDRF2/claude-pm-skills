# Reference and Dependency Index

Every reference file this orchestrator uses, and what it covers. Each phase in SKILL.md
already says exactly when to read a given file inline — this index is a lookup/navigation aid,
not additional routing logic. Extracted 2026-09-29 to bring SKILL.md's body under Anthropic's
~500-line guidance; nothing here changed in meaning, only moved.

## References

- `references/interaction-protocol.md` — How to ask, adapt, pause, and resume
- `references/specialist-dispatch-contract.md` — Resolution order, preflight receipt and hard stops before invoking a specialist skill
- `references/change-impact-contract.md` — Consumer graph, per-unit update/preserve/blocked plan and gates before regenerating or publishing
- `references/artifact-contract.md` — Required handoff and traceability between phases
- `references/project-context-contract.md` — Gate 1 understanding and journey quality
- `references/retired-identifier-contract.md` — Active versus historical ID lifecycle
- `references/markdown-package.md` — File structure, statuses, and update rules
- `references/local-organization-contract.md` — Notion availability classification and local-draft normalization
- `references/rule-governance.md` — Sources, authority, contradictions, and rule consolidation
- `references/decision-capture.md` — Mandatory persistence, readback, stale-impact tracking and capture receipt after approvals
- `references/integration-mapping.md` — Required `MAP-*` contract for sync, migration, propagation and cross-system fields
- `references/derived-artifact-governance.md` — HTML/SPEC review, delta reconciliation and product-boundary routing
- `references/extend-approved-package.md` — Gate C, semantic compatibility and ID assignment when extending an approved canon
- `references/readiness-and-approvals.md` — Backlog states, role readiness, and block approvals
- `references/qa-design-handoff.md` — Boundary between QA design and downstream TestManager artifacts
- `references/matrix-decision.md` — Deterministic rule for creating matrices without making scenarios depend on them
- `references/publication-authorization-gate.md` — Autonomous exact-write dossier before Notion authorization
- `references/deep-audit-contract.md` — Explicit complete and cross-refinement audits
- `references/external-dependency-contract.md` — direct external-rule verification and when to propose a cross-refinement audit
- `references/github-source-of-truth-contract.md` — Branch, Pull Request and shared-canon rules when a repository is registered
- `references/codebase-verification-contract.md` — Conditional current-implementation evidence
- `references/domain-and-design-sources.md` — Conditional design-hub and domain/architecture evidence for your own product
- `references/dev-destination-handoff.md` — Optional adapter reference for an external dev-tracking destination
- `references/taxonomy-alignment.md` — Conditional Gate 5 and post-handoff routing for Product Taxonomy
- `references/examples-and-pitfalls.md` — Worked examples and common interaction failure patterns
- `references/story-and-scenario-writing-conventions.md` — Phase 3/4 story, criteria and scenario formatting rules
- `refinement-judge` — Independent adversarial gate before consequential actions
- `user-story-mapping` — Journey, rules, variations, and release slices
- `user-story-splitting` — Vertical decomposition and sequencing
- `user-story` — User stories and acceptance criteria; use its `references/golden-example.md` as the authoritative complete example
- `test-case-designer` — Risk-based coverage and test cases
- `build-refinement-portal` — Optional final portal generation from approved artifacts
- `build-refinement-document` — Optional Word document generation and visual verification
- `publish-refinement-to-notion` — Optional native Notion publication or local export fallback
- `sync-refinement-package-notion` — Optional ongoing sync, concurrency and recovery after an initial Notion publication

## Outside This Orchestrator's Scope

- `idea-to-ship` — The router above this one: decides whether an initiative should even be here yet (the Define/Shape stage), or belongs at an earlier/later stage. If a user arrives unsure where to start, point them there first.
- `prd-writer`, `mini-spec-writer` — Upstream: produce the spec, PRD, or approved feature scope this orchestrator's Phase 0 expects as input. Do not re-litigate business-case or bet decisions already made there.
- `jira-story-publisher` — Downstream: the only skill that actually creates a Jira issue from an approved story; this orchestrator's `jira/US-[ID].md` files are previews, not live tickets.
- `weekly-product-pulse` — Downstream: reports on stories once they're filed in Jira and enter the team's tracked workflow.
- `artifact-sync` — Downstream: propagates a changed decision back into already-published Jira/Notion/design artifacts after this package has been approved and published.
