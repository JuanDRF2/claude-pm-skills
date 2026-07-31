# Integration Mapping Contract

Create a stable `MAP-*` whenever an approved rule involves sync, migration, import,
export, propagation or cross-system field behavior. Store mappings in the project's
canonical rule artifact or in a dedicated mapping ledger identified in workflow state.

## Required record

Define each mapping under a heading or first table cell containing its `MAP-*` ID. Include
these labels so incremental validation can verify the contract:

```markdown
### MAP-ADDR-01 — Shared Household address in NPSP

- Canonical field: `Household.shared_address`
- Provider: Salesforce NPSP
- External field: `Account.BillingAddress`
- Direction: Bilateral
- Transformation: Address components map without semantic relabeling
- Conditions: Contact inherits the Household address
- Propagation: Update members that inherit
- Exclusions: Overridden Contacts, Contact Other and Account Shipping
- Unsupported behavior: Preserve V2-only values; never clear them
- Conflict policy: Q-04 — Deferred
- Observability: Structured integration issue on rejected or partial mapping
- Traceability: BR-98, BR-99, US-CON-02
```

Use the artifact language for labels; the validator accepts these English and Spanish
equivalents:

| English | Spanish |
|---|---|
| Canonical field | Campo canónico |
| Provider | Proveedor |
| External field | Campo externo |
| Direction | Dirección |
| Transformation | Transformación |
| Conditions | Condiciones |
| Propagation | Propagación |
| Exclusions | Exclusiones |
| Unsupported behavior | Comportamiento no soportado |
| Conflict policy | Política de conflictos |
| Observability | Observabilidad |
| Traceability | Trazabilidad |

## Rules

- Name exact entities and fields at both ends. “Update the Household” is incomplete.
- Use `Inbound`, `Outbound` or `Bilateral`; describe any asymmetric exceptions.
- If a provider has no equivalent, write `Unsupported` and how canonical data survives.
- Link an unresolved conflict to its stable question ID; never invent precedence.
- State whether propagation affects related records and which records are excluded.
- State error evidence and retry/recovery behavior when material.
- One conceptual mapping may have separate provider-specific `MAP-*` records.
- Never treat absence from a limited provider response as authorization to delete a
  canonical collection item.
