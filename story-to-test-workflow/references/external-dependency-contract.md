# External Dependency Contract

Read this reference when a package declares that it consumes a rule, mapping or shared
contract owned by another package. A different ID prefix is only a discovery signal; prove
the dependency through a registered source, traceability link, shared-contract declaration
or explicit owner/consumer relationship.

## Referenced-dependency check

Keep this check inside the current review scope. It is not automatically a full
cross-refinement audit.

1. Inventory each directly consumed external `BR-*`, `MAP-*` or contract, its owner package,
   source path or registered location, and the local consumers it affects.
2. Compare the referenced source with the consuming claim: identity, current status,
   meaning, version or canonical commit when available, and supersession state.
3. Record one of: `Verified current`, `Contradicted`, `Stale consumer` or `Not verifiable`.
4. For `Not verifiable`, name the missing evidence, owner and impact on the intended action.
   Do not imply cross-package coherence from internal validation alone.
5. For a contradiction or stale consumer, mark the affected local artifacts stale and
   route the decision or correction through the owning package before consequential use.

Read only the directly referenced source subset unless the user approves a wider audit.
Do not inspect neighboring packages merely because they share a domain or similar IDs.

## When to propose a wider cross-refinement audit

Propose, but do not start, an exact cross-refinement scope when evidence shows that a
localized dependency check is insufficient, for example:

- a contradiction spans more than one owner or consumer package;
- a shared contract changed and several material consumers may be stale;
- the same critical payment, permission, calculation, state or integration behavior is
  implemented independently in several packages;
- a package-wide or global readiness claim depends on shared behavior outside the current
  package;
- product taxonomy or traceability shows one journey crossing several package boundaries.

State the reason, exact packages, evidence to compare and intended decision. Avoid numeric
thresholds such as a fixed number of packages or rules: one critical dependency may justify
review while many informational references may not. The user decides whether to expand the
scope.

## Gate behavior

Before Gate 5, every material direct dependency in the affected closure must be verified or
carried as an explicit limitation with owner and consequence. This does not require every
package in the product domain to be audited, and it does not authorize external writes.
