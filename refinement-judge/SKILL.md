---
name: refinement-judge
description: Audit a complete product-refinement package as an independent adversarial quality gate before external publication, Jira creation, final handoff, automation planning, or another consequential action. Use after stories, acceptance criteria, business rules, canonical scenarios, coverage checks, functional test cases, traceability, and handoffs have been generated or materially changed, or when a user asks whether an existing refinement package is trustworthy, complete, consistent, and ready to proceed.
---

# Refinement Judge

## Purpose

Act as an independent reviewer, not as another author. Attempt to disprove that the refinement is ready by comparing the canonical Markdown package with its original sources and approved decisions.

Emit evidence-backed findings and one verdict. Do not silently repair artifacts, invent missing behavior, or approve work merely because its files are structurally valid.

## Required Independence

Review raw sources and current artifacts. Do not rely on the generating skill's conclusions, hidden reasoning, intended answer, or self-reported quality.

Keep these responsibilities separate:

- The deterministic validator detects structural defects.
- This Judge detects semantic defects, omissions, contradictions, unsupported claims, and unsafe readiness.
- `story-to-test-workflow` coordinates user-approved corrections.

If the same agent authored the package, start a fresh review pass: reload sources and artifacts from disk, discard prior conclusions, and reconstruct every finding from cited evidence.

## Inputs

Require:

1. Canonical Markdown package folder.
2. Original spec, PRD, notes, designs, tickets, or a source manifest with accessible locations.
3. Approved decisions and explicit open questions.
4. Confirmed artifact language.
5. Intended next action.
6. Derived-artifact inventory, base snapshot and delta ledger when prototypes, HTML,
   designs or generated SPECs are in scope.

Do not treat derived HTML, Word, Notion, or Jira presentations as canonical sources. Use them only for parity checks.

If original evidence is unavailable, do not claim source fidelity. Record the limitation as a blocking finding when the intended action depends on fidelity.

## Workflow

### 1. Freeze the reviewed snapshot

For a complete package before publication, Jira or final handoff, run the strict default:

```bash
python3 scripts/validate-judge.py preflight <artifact-folder> --language <es|en>
```

Cuando el manifiesto registrado declare `package_kind: shared-contract`, conserva ese tipo:

```bash
python3 scripts/validate-judge.py preflight <artifact-folder> --language <es|en> \
  --package-kind shared-contract
```

No selecciones este modo solo por el tamaño del paquete. Un proyecto normal conserva el
contrato completo aunque le falten archivos.

For the extension-route Gate C that occurs before Gate 2 stories exist, run:

```bash
python3 scripts/validate-judge.py preflight <artifact-folder> --language <es|en> --phase gate-c
```

`gate-c` validates the decision checkpoint and freezes every numbered root product Markdown
plus Jira/handoff projections when present. Unnumbered guidance such as `README.md` does not
belong to the product snapshot. This phase must not require artifacts owned by future gates
and does not authorize final publication readiness. The default `final` mode remains strict
and requires the complete package.

Record the returned snapshot SHA-256 in the report. If deterministic validation fails, continue only far enough to explain the defects and emit `FAIL`.

The preflight validates and hashes product artifacts only. It excludes
`11-refinement-judge-report.md` because findings may intentionally mention missing
or contradictory IDs and must not become product requirements merely by being
recorded in the audit.

For a localized Notion publication, evaluate the remote write itself, not only preparation
of its preview. Record `Action stage / Etapa de acción: Publication` and `Action scope /
Alcance de acción: technical=N; editorial=N` using the frozen authorization dossier.

### 2. Reconstruct the source model

Read the original sources and approved decision record before reading author conclusions. Extract:

- Objective, users, actors, systems and in-scope outcomes
- Confirmed rules and their authority
- Explicit exclusions and deferred behavior
- Open questions, owners and blocking state
- Failure, recovery, payment, permission, data and integration risks

Read `references/review-contract.md` completely before the semantic audit.

### 3. Audit adversarially

Try to find counterexamples across these dimensions:

1. Source fidelity
2. Scope and decision integrity
3. Story size and vertical value
4. Acceptance-criterion observability
5. Test executability and risk coverage
6. Traceability and ID parity
7. Readiness and approval ownership
8. Cross-presentation parity
9. Derived-artifact and product-boundary integrity

For each high-risk scenario marked `Ready`, require the compact execution contract defined
by the package and independently test whether another QA reviewer could reproduce it without
inventing product behavior. Missing material decisions require `FAIL` or `Needs refinement`;
a structurally valid Gherkin block is insufficient.

For Notion, obtain the native-page manifest, baseline and human-page manifest. In an initial
publication or explicit full audit, inspect every registered page. In `Actualización
localizada`, inspect every technical and human page in the proven impact scope, plus any
cover facts or links that changed. Confirm from the local graph that unrelated pages were
correctly excluded; do not require downloading them. Require valid prewrite and
post-readback `notion-presentation-format` receipts for affected presentations.

After a Notion write, run a second Judge pass against the actual readback before audit
completion. Require Markdown-equivalence receipts for every affected technical page, plus
semantic presentation-parity receipts for every affected cover, story and auxiliary page,
and the structural format receipt produced from the same readback. Independently confirm
that each visible story contains its complete applicable `AC`, `SC`, `CHK`, `FTC` and
scenario behavior. A summary
or link is not parity. Emit `FAIL` when an affected technical page differs materially from
its authorized target, or when a required human presentation is missing, abbreviated or
incorrectly linked.

Do not infer that absence of a finding proves completeness. State what was actually inspected and what could not be verified.

### 4. Write atomic findings

Create one finding per independently actionable defect. Use stable IDs:

```text
JUDGE-<PROJECT>-001
```

For every finding include severity, status, evidence, affected artifacts, consequence, required correction, and whether it blocks the intended action. Cite file paths plus IDs, headings, or source sections; do not use vague statements such as “coverage seems incomplete.”

Read `references/severity-and-verdict.md` before assigning severity or verdict.

### 5. Emit the report

Write:

```text
11-refinement-judge-report.md
```

Follow `references/report-schema.md` exactly. Preserve previous finding IDs when rerunning the Judge. Mark resolved findings as resolved with verification evidence; never delete their history merely to obtain a pass.

Validate the report:

```bash
python3 scripts/validate-judge.py report <artifact-folder>/11-refinement-judge-report.md
```

For the Judge that authorizes an exact Notion write set, use `--publication`. Fix every
semantic inconsistency before requesting human authorization:

```bash
python3 scripts/validate-judge.py report \
  <artifact-folder>/11-refinement-judge-report.md --publication
```

For the mandatory readback pass, record `Action stage / Etapa de acción:
Post-publication` and validate it separately:

```bash
python3 scripts/validate-judge.py report \
  <artifact-folder>/11-refinement-judge-report.md --post-publication
```

### 6. Enforce the gate

- `PASS`: permit the intended next gate.
- `PASS WITH OBSERVATIONS` / `PASS CON OBSERVACIONES`: permit it while retaining low findings and observations.
- `FAIL`: block external publication, Jira creation, an approved final handoff, and other consequential actions.

A `FAIL` may still allow a local draft preview if it is visibly labeled non-approved.

Do not override `FAIL` yourself. A human may explicitly accept the risk by naming the action, accepted findings, owner, reason, and date. Record the override in the report; it does not convert the verdict to `PASS`.

When the intended action is a Notion publication, a missing, stale, duplicated or
incorrectly linked required human page is a parity defect. A missing, altered or ambiguous
affected native page is a source-integrity defect. Marking an auxiliary page `No aplica` does not
resolve the defect when its applicable canonical source exists.

A missing or failed Notion format receipt blocks publication completion even when all IDs
and semantic clauses are present. Content completeness does not excuse broken navigation,
flat criteria, loose child pages or duplicated coverage tables.

Do not let a pre-publication package `PASS` authorize audit completion. The Notion
publication remains `pending_post_publication_verification` until the post-publication Judge
pass reviews the connector readback and all deterministic parity receipts. Persist the
report with the final snapshot so `sync-refinement-package-notion` can verify it before
audit completion.

## Correction Loop

Return findings to `story-to-test-workflow`. That orchestrator must:

1. Explain affected IDs and behavior.
2. Ask only the decisions needed to correct the package.
3. Obtain the applicable owner approval.
4. Update canonical Markdown and derived views.
5. Rerun deterministic validation.
6. Rerun this Judge against a new snapshot.

Never edit the product package while acting as Judge.

## Output Rules

- Match the package language; preserve universal identifiers.
- Lead with the verdict and blocked/allowed action.
- Separate verified facts, findings, limitations and recommendations.
- Keep finding titles understandable without technical knowledge.
- Treat questions as questions, not defects, unless their unresolved state makes the intended action unsafe.
- Never expose hidden chain-of-thought. Provide concise evidence and reasoning sufficient for review.

## Resources

- `references/review-contract.md` — evidence order and audit dimensions
- `references/severity-and-verdict.md` — severity, verdict and override rules
- `references/report-schema.md` — required Markdown report format
- `scripts/validate-judge.py` — deterministic preflight, snapshot and report validation
