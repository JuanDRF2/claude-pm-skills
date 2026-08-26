# External Dependency Review

Read this reference only when the reviewed package directly consumes a rule, mapping or
shared contract owned elsewhere.

## Prove the dependency

Establish the relationship through at least one registered source:

- a traceability link;
- a shared-contract declaration;
- an explicit owner/consumer record; or
- another approved source that names both the dependency and its owner.

A different ID prefix alone is not evidence of ownership or dependency.

## Verify the referenced subset

Inspect only the directly referenced source subset and verify that:

- the external ID or contract exists in the named owner source;
- its status, meaning and material values still match the consuming claim;
- it was not superseded or changed after the consumer's recorded baseline; and
- every affected local consumer is visible in the change-impact closure.

This check is part of the current package review. It does not authorize inspection of
unrelated packages.

## Report limitations and findings

If the source cannot be accessed or its version cannot be established, record the exact
dependency as `Not verifiable`, its owner and the consequence for the intended action. Do
not present a package-wide `PASS` as proof of cross-package coherence while a material
dependency remains unverified.

A contradiction or stale consumer is a finding. Set severity from the affected behavior
and intended action; do not downgrade it merely because the package is internally
consistent. Recommend a wider audit only when localized evidence cannot bound the impact.
