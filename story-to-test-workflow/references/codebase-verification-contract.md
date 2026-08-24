# Codebase Verification Contract

Read this reference only when a refinement or review makes a material claim about current
implemented behavior, an existing integration contract, data ownership, compatibility or
technical feasibility. Do not require code inspection for ordinary copy changes or future
behavior that Product is still defining.

## Discover the owning codebase

Do not keep a fixed repository list in the skill. Repositories and ownership change. Use
the current evidence in this order:

1. repository-local `AGENTS.md` and routing indexes;
2. organization routing guidance, `PROJECTS.md`, README files and manifests;
3. referenced architecture or domain ownership sources;
4. the runtime, deployment target and test suite that actually own the behavior.

If multiple repositories participate, identify the owner and each consumer. Inspect only
the smallest code and tests needed to prove or disprove the claim. A broad codebase scan is
not a substitute for identifying ownership.

## Evidence and authority

Record the repository, branch or commit observed, relevant paths, behavior found and any
tests or contracts consulted. Put source context in `01-project-understanding.md`, material
gaps or conflicts in `08-traceability-and-risks.md`, and implementation guidance in
`handoffs/dev-handoff.md`. Do not create a separate canonical code inventory.

Code is evidence of current implementation; it does not override approved future product
intent. When code, design, architecture and approved behavior disagree, state the conflict,
identify the owner and classify its impact instead of silently choosing one source.

If the owning repository, revision or required access cannot be confirmed, record
`Codebase verification pending`, the exact claim that remains unverified, its owner and
whether it blocks the current gate. Never invent repository names, paths, commits, APIs,
objects or test results.
