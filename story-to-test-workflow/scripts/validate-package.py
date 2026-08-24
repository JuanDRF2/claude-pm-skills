#!/usr/bin/env python3
"""Validate a story-to-test Markdown package using only the Python standard library."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ID_PATTERNS = {
    # A trailing [A-Za-z]? on each numeric segment supports user-story-splitting's own
    # "03a"/"03b" sub-story convention (e.g. US-MOS-03a, AC-MOS-03A-01, SC-MOS-03A-01-01)
    # — split IDs are an expected output of that skill, not an edge case to special-case away.
    # BR also accepts an optional project-prefix segment (e.g. BR-MOS-01) in addition to BR-01.
    "BR": re.compile(r"\bBR-(?:[A-Z0-9]+-)?\d{2,}\b"),
    "US": re.compile(r"\bUS-[A-Z0-9]+-\d{2,}[A-Za-z]?\b"),
    "AC": re.compile(r"\bAC-[A-Z0-9]+-\d{2,}[A-Za-z]?-\d{2,}[A-Za-z]?\b"),
    "TC": re.compile(r"\bTC-[A-Z0-9]+-\d{3,}\b"),
    "CHK": re.compile(r"\bCHK-[A-Z0-9]+-\d{3,}\b"),
    "FTC": re.compile(r"\bFTC-[A-Z0-9]+-\d{2,}\b"),
    "SC": re.compile(r"\bSC-[A-Z0-9]+-\d{2,}[A-Za-z]?-\d{2,}[A-Za-z]?(?:-\d{2,}[A-Za-z]?)?\b"),
    "DELTA": re.compile(r"\bDELTA-[A-Z0-9]+-\d{3,}\b"),
    "MAP": re.compile(r"\bMAP-[A-Z0-9]+-\d{2,}\b"),
}

RANGE_PATTERN = re.compile(
    r"\b((?:BR-(?:[A-Z0-9]+-)?\d{2,}|(?:TC|CHK)-[A-Z0-9]+-\d{3,}))"
    r"\s*[–—-]\s*"
    r"((?:BR-(?:[A-Z0-9]+-)?\d{2,}|(?:BR-)?\d{2,}|(?:(?:TC|CHK)-[A-Z0-9]+-)?\d{3,}))\b"
)

EXPECTED = [
    "00-workflow-state.md",
    "01-project-understanding.md",
    "02-rules-and-questions.md",
    "03-story-map.md",
    "04-release-slices.md",
    "05-user-stories.md",
    "06-test-coverage.md",
    "08-traceability-and-risks.md",
    "09-package-index.md",
    "handoffs/dev-handoff.md",
    "handoffs/qa-handoff.md",
]

SHARED_EXPECTED = [
    "00-workflow-state.md",
    "09-package-index.md",
]

AUDIT_ARTIFACTS = {
    "11-refinement-judge-report.md",
}

EN_MARKERS = re.compile(
    r"\b(Project|Status|Last updated|Approved through|User Story|Acceptance Criteria|"
    r"Expected Results|Preconditions|Actions|Rules|Risk|Test Cases)\b",
    re.IGNORECASE,
)
ES_MARKERS = re.compile(
    r"\b(Proyecto|Estado|Última actualización|Aprobado hasta|Historia de usuario|"
    r"Criterios de aceptación|Resultados esperados|Precondiciones|Acciones|Reglas|Riesgo|Casos de prueba)\b",
    re.IGNORECASE,
)


def read_files(root: Path) -> dict[Path, str]:
    return {
        path: path.read_text(encoding="utf-8")
        for path in root.rglob("*.md")
        if path.relative_to(root).as_posix() not in AUDIT_ARTIFACTS
    }


def definitions(files: dict[Path, str], prefix: str) -> set[str]:
    found: set[str] = set()
    pattern = ID_PATTERNS[prefix]
    heading = re.compile(r"^#{1,6}\s+.*?(" + pattern.pattern + r")", re.MULTILINE)
    table = re.compile(r"^\|\s*(" + pattern.pattern + r")\s*\|", re.MULTILINE)
    for text in files.values():
        found.update(heading.findall(text))
        found.update(table.findall(text))
    return found


def definitions_in_text(text: str, prefix: str) -> set[str]:
    """Return IDs formally defined in one authoritative artifact."""
    pattern = ID_PATTERNS[prefix]
    heading = re.compile(r"^#{1,6}\s+.*?(" + pattern.pattern + r")", re.MULTILINE)
    table = re.compile(r"^\|\s*(" + pattern.pattern + r")\s*\|", re.MULTILINE)
    return set(heading.findall(text)) | set(table.findall(text))


def acceptance_blocks(text: str) -> dict[str, str]:
    """Extract normalized AC blocks for parity and Gherkin checks."""
    hits = list(ID_PATTERNS["AC"].finditer(text))
    blocks: dict[str, str] = {}
    for index, hit in enumerate(hits):
        if index + 1 < len(hits):
            next_line_start = text.rfind("\n", 0, hits[index + 1].start()) + 1
            candidates = [next_line_start]
        else:
            candidates = [len(text)]
        boundary = re.search(
            r"^##\s|^#{2,6}\s+(?:Related tests|Pruebas relacionadas|QA coverage|Cobertura de QA|Relevant quality requirements|Review ownership)",
            text[hit.end():],
            re.MULTILINE | re.IGNORECASE,
        )
        if boundary:
            candidates.append(hit.end() + boundary.start())
        end = min(candidates)
        block = text[hit.start():end]
        # Ignore derived traceability rows; keep blocks that contain behavior.
        if re.search(r"\b(Given|Dado|Cuando|When|Then|Entonces)\b", block, re.IGNORECASE):
            normalized = re.sub(r"\s+", " ", block).strip()
            blocks.setdefault(hit.group(), normalized)
    return blocks


def canonical_acceptance_blocks(
    root: Path, files: dict[Path, str], errors: list[str]
) -> dict[str, str]:
    """Merge AC blocks from split story volumes and reject conflicting definitions."""
    merged: dict[str, str] = {}
    origins: dict[str, str] = {}
    for volume in sorted(root.glob("05-user-stories*.md"), key=lambda item: item.name):
        for ac_id, block in acceptance_blocks(files.get(volume, "")).items():
            if ac_id in merged and merged[ac_id] != block:
                errors.append(
                    f"Conflicting canonical acceptance criterion: {ac_id} in "
                    f"{origins[ac_id]} and {volume.name}"
                )
                continue
            merged[ac_id] = block
            origins[ac_id] = volume.name
    return merged


def canonical_story_text(root: Path, files: dict[Path, str]) -> str:
    """Return all canonical story volumes, including split 05-user-stories files."""
    volumes = sorted(root.glob("05-user-stories*.md"), key=lambda item: item.name)
    return "\n\n".join(files.get(volume, "") for volume in volumes)


def scenario_blocks(text: str) -> dict[str, str]:
    """Extract one canonical block per SC for cross-volume clarity warnings."""
    hits = list(ID_PATTERNS["SC"].finditer(text))
    blocks: dict[str, str] = {}
    for index, hit in enumerate(hits):
        end = hits[index + 1].start() if index + 1 < len(hits) else len(text)
        block = text[hit.start():end]
        next_ac = ID_PATTERNS["AC"].search(block, len(hit.group()))
        if next_ac:
            block = block[:next_ac.start()]
        blocks.setdefault(hit.group(), block)
    return blocks


def scenario_clarity_warnings(sc_id: str, block: str) -> list[str]:
    """Flag deterministic signals of incomplete prose; semantic approval stays with Judge."""
    warnings: list[str] = []

    def step(labels: str) -> str:
        match = re.search(
            rf"(?im)^(?:-\s*)?(?:\*\*)?(?:{labels})\s*:?(?:\*\*)?\s*:?\s*([^\n]+)",
            block,
        )
        return match.group(1).strip() if match else ""

    given = step("Given|Dado")
    when = step("When|Cuando")
    then = step("Then|Entonces")

    if given and len(re.findall(r"[\wÁÉÍÓÚÜÑáéíóúüñ]+", given)) < 4:
        warnings.append(
            f"{sc_id} may have a fragmentary Given/Dado. Name the actor or business "
            "context and the concrete state needed to understand the scenario."
        )

    unexplained_choice = re.search(
        r"\b(?:responds?|responde|selects?|selecciona|chooses?|elige)\s+"
        r"(?:Yes|No|S[ií])\b",
        when,
        re.IGNORECASE,
    )
    choice_context = re.search(
        r"\b(?:question|pregunta|confirmation|confirmaci[oó]n|message|mensaje|"
        r"option|opci[oó]n|whether|si desea|si quiere)\b",
        when,
        re.IGNORECASE,
    )
    if unexplained_choice and not choice_context:
        warnings.append(
            f"{sc_id} uses a Yes/No or Sí/No choice without naming the question or "
            "decision being answered."
        )

    internal_objects = re.search(
        r"\b(?:Payment|Contribution|Agreement|Opportunity|Transaction)\b",
        then,
        re.IGNORECASE,
    )
    internal_states = re.search(
        r"\b(?:Paid|Closed Won|Draft|Pending|Failed|Canceled|Cancelled)\b",
        then,
        re.IGNORECASE,
    )
    observable_language = re.search(
        r"\b(?:shows?|displays?|informs?|confirms?|receives?|can|sees?|appears?|"
        r"muestra|informa|confirma|recibe|puede|ve|aparece|pantalla|correo|"
        r"receipt|comprobante|balance|saldo|membership|membres[ií]a|donation|donaci[oó]n)\b",
        then,
        re.IGNORECASE,
    )
    if internal_objects and internal_states and not observable_language:
        warnings.append(
            f"{sc_id} may use only internal records or statuses as its Then/Entonces. "
            "State the observable business result first and move internal states to technical evidence."
        )

    return warnings


def journey_integrity_checks(functional: str, coverage: str) -> tuple[list[str], list[str]]:
    """Validate explicit journey composition while keeping historical adoption progressive."""
    errors: list[str] = []
    warnings: list[str] = []
    ftc_hits = list(
        re.finditer(r"^#{2}\s+(FTC-[A-Z0-9]+-\d{2,})\b", functional, re.MULTILINE)
    )
    declaration_pattern = re.compile(
        r"(?im)^\s*[-*]?\s*\**(?:Journey integrity|Integridad del recorrido)\s*:\**\s*([^\n]+)"
    )
    critical_pattern = re.compile(
        r"\b(payment|pago|purchase|compra|renewal|renovaci[oó]n|refund|reembolso|"
        r"void|anulaci[oó]n|retry|reintento|duplicate|duplicad[oa]|idempoten|"
        r"asynchronous|asincr[oó]nic|cross[ -]system|entre sistemas|integration|"
        r"integraci[oó]n|identity|identidad|permission|permiso|destruct|elimin)\w*\b|"
        r"(?:Priority/Risk|Prioridad/Riesgo)\s*:\**\s*(?:Critical|High|Cr[ií]tica|Alta)",
        re.IGNORECASE,
    )

    has_critical_candidate = False
    undeclared_critical: list[str] = []
    for index, hit in enumerate(ftc_hits):
        end = ftc_hits[index + 1].start() if index + 1 < len(ftc_hits) else len(functional)
        block = functional[hit.start():end]
        ftc_id = hit.group(1)
        critical_candidate = bool(critical_pattern.search(block))
        has_critical_candidate = has_critical_candidate or critical_candidate
        declaration = declaration_pattern.search(block)
        if not declaration:
            if critical_candidate:
                undeclared_critical.append(ftc_id)
            continue

        decision = declaration.group(1).strip().strip("* ")
        required = bool(re.match(r"Required\b|Requerid[oa]\b", decision, re.IGNORECASE))
        not_applicable = bool(
            re.match(r"Not applicable\b|No aplica\b", decision, re.IGNORECASE)
        )
        if not required and not not_applicable:
            errors.append(
                f"{ftc_id} has an unsupported Journey integrity decision: {decision}. "
                "Use Required or Not applicable with a reason."
            )
            continue
        if not_applicable:
            remainder = re.sub(
                r"^(?:Not applicable|No aplica)\b\s*", "", decision, flags=re.IGNORECASE
            ).strip(" —–-:.;")
            if len(remainder.split()) < 2:
                errors.append(
                    f"{ftc_id} marks Journey integrity Not applicable without a meaningful reason."
                )
            continue

        required_fields = {
            "journey composition heading": r"^#{3,6}\s+(?:Journey composition|Composici[oó]n del recorrido)\b",
            "entry action": r"(?:Entry action|Acci[oó]n de entrada)\s*:",
            "visible outcome": r"(?:Visible outcome|Resultado visible)\s*:",
            "completion condition": r"(?:Completion condition|Condici[oó]n final|Condici[oó]n de completitud)\s*:",
            "downstream consistency": r"(?:Downstream consistency|Consistencia posterior)\s*:",
            "composing scenarios": r"(?:Composing scenarios|Escenarios que lo componen)\s*:",
            "end-to-end validation": r"(?:End-to-end validation|Validaci[oó]n de extremo a extremo)\s*:",
            "scenario independence": r"(?:Scenario independence|Independencia de escenarios)\s*:",
            "authorized evidence": r"(?:Authorized evidence|Evidencia autorizada)\s*:",
            "residual risk": r"(?:Residual risk|Riesgo residual)\s*:",
        }
        missing = [
            name
            for name, pattern in required_fields.items()
            if not re.search(pattern, block, re.IGNORECASE | re.MULTILINE)
        ]
        if missing:
            errors.append(
                f"{ftc_id} requires Journey integrity but lacks: {', '.join(missing)}."
            )
        composing = re.search(
            r"(?:Composing scenarios|Escenarios que lo componen)\s*:\**\s*([^\n]+)",
            block,
            re.IGNORECASE,
        )
        if composing and not ID_PATTERNS["SC"].search(composing.group(1)):
            errors.append(
                f"{ftc_id} Journey composition must name its canonical SC-* scenarios."
            )
        e2e = re.search(
            r"(?:End-to-end validation|Validaci[oó]n de extremo a extremo)\s*:\**\s*([^\n]+)",
            block,
            re.IGNORECASE,
        )
        if e2e and re.search(r"\bBlocked\b|\bBloquead[oa]\b", e2e.group(1), re.IGNORECASE):
            if not re.search(r"\bowner\b|\bresponsable\b", e2e.group(1), re.IGNORECASE):
                errors.append(
                    f"{ftc_id} has a blocked end-to-end path without naming an owner/responsable."
                )
        downstream = re.search(
            r"(?:Downstream consistency|Consistencia posterior)\s*:\**\s*([^\n]+)",
            block,
            re.IGNORECASE,
        )
        if downstream and re.match(
            r"\s*(?:Not applicable|No aplica|N/?A)\b", downstream.group(1), re.IGNORECASE
        ):
            remainder = re.sub(
                r"^\s*(?:Not applicable|No aplica|N/?A)\b\s*",
                "",
                downstream.group(1),
                flags=re.IGNORECASE,
            ).strip(" —–-:.;*")
            if len(remainder.split()) < 2:
                errors.append(
                    f"{ftc_id} marks downstream consistency Not applicable without a meaningful reason."
                )
        residual = re.search(
            r"(?:Residual risk|Riesgo residual)\s*:\**\s*([^\n]+)",
            block,
            re.IGNORECASE,
        )
        if residual and re.fullmatch(
            r"\s*(?:None|Ninguno|Ninguna)\s*[.*]*", residual.group(1), re.IGNORECASE
        ):
            errors.append(
                f"{ftc_id} declares no residual risk without a brief basis."
            )

    if undeclared_critical:
        preview = ", ".join(undeclared_critical[:8])
        remaining = len(undeclared_critical) - 8
        suffix = f", and {remaining} more" if remaining else ""
        warnings.append(
            f"{len(undeclared_critical)} critical journey candidate FTC(s) have no Journey "
            f"integrity/Integridad del recorrido decision: {preview}{suffix}. Review the "
            "inventory before Gate 4."
        )

    inventory = re.search(
        r"Journey integrity review|Revisi[oó]n de integridad del recorrido|"
        r"Inventario de integridad del recorrido",
        coverage,
        re.IGNORECASE,
    )
    if has_critical_candidate and not inventory:
        warnings.append(
            "Critical journey candidates exist but 06-test-coverage.md has no Journey "
            "Integrity review/inventory. Historical packages remain valid, but Gate 4 must "
            "record Required or Not applicable before approving changed coverage."
        )
    return errors, warnings


def definition_blocks(files: dict[Path, str], prefix: str) -> dict[str, str]:
    """Extract heading/table definition blocks for incremental contract checks."""
    pattern = ID_PATTERNS[prefix]
    blocks: dict[str, str] = {}
    for text in files.values():
        headings = list(
            re.finditer(r"^#{1,6}\s+.*?(" + pattern.pattern + r").*$", text, re.MULTILINE)
        )
        for index, hit in enumerate(headings):
            end = headings[index + 1].start() if index + 1 < len(headings) else len(text)
            blocks.setdefault(hit.group(1), text[hit.start():end])
        for line in text.splitlines():
            match = re.match(r"^\|\s*(" + pattern.pattern + r")\s*\|", line)
            if match:
                blocks.setdefault(match.group(1), line)
    return blocks


def decision_checkpoint_checks(
    root: Path, files: dict[Path, str]
) -> tuple[list[str], list[str]]:
    """Validate persisted decisions and mappings without requiring final-phase artifacts."""
    errors: list[str] = []
    warnings: list[str] = []
    state = files.get(root / "00-workflow-state.md", "")
    rules = files.get(root / "02-rules-and-questions.md", "")

    checkpoint_fields = {
        "last captured decision": r"(?:Last captured decision|Última decisión capturada)\s*:\s*([^\n]+)",
        "last verified mapping": r"(?:Last verified mapping|Último mapping verificado|Último mapeo verificado)\s*:\s*([^\n]+)",
        "rules changed": r"(?:Rules changed since last gate|Reglas modificadas desde el último gate|Reglas modificadas desde la última aprobación)\s*:\s*([^\n]+)",
        "stale stories": r"(?:Stale stories|Historias desactualizadas)\s*:\s*([^\n]+)",
        "stale acceptance criteria": r"(?:Stale acceptance criteria|Criterios de aceptación desactualizados)\s*:\s*([^\n]+)",
        "stale test artifacts": r"(?:Stale test artifacts|Artefactos de prueba desactualizados)\s*:\s*([^\n]+)",
        "unresolved mapping questions": r"(?:Unresolved mapping questions|Preguntas de mapping sin resolver|Preguntas de mapeo sin resolver)\s*:\s*([^\n]+)",
        "last incremental validation": r"(?:Last incremental validation|Última validación incremental)\s*:\s*([^\n]+)",
        "next reconciliation gate": r"(?:Next reconciliation gate|Próximo gate de reconciliación|Próxima aprobación de reconciliación)\s*:\s*([^\n]+)",
    }
    values: dict[str, str] = {}
    for name, pattern in checkpoint_fields.items():
        match = re.search(pattern, state, re.IGNORECASE)
        if not match or not match.group(1).strip():
            errors.append(f"Decision Checkpoint is missing a value for {name}.")
        else:
            values[name] = match.group(1).strip()

    captured = values.get("last captured decision", "")
    if captured and not ID_PATTERNS["BR"].search(captured):
        errors.append("Last captured decision must reference a BR-* ID.")
    verified_mapping = values.get("last verified mapping", "")
    if verified_mapping and not (
        ID_PATTERNS["MAP"].search(verified_mapping)
        or re.fullmatch(r"(?:None|Ninguno|No aplica|N/?A)", verified_mapping, re.IGNORECASE)
    ):
        errors.append("Last verified mapping must reference MAP-* or explicitly say None.")

    mapping_blocks = definition_blocks(files, "MAP")
    required_mapping_fields = {
        "canonical field": r"(?:Canonical field|Campo can[oó]nico)\s*:",
        "provider": r"(?:Provider|Proveedor)\s*:",
        "external field": r"(?:External field|Campo externo)\s*:",
        "direction": r"(?:Direction|Direcci[oó]n)\s*:",
        "transformation": r"(?:Transformation|Transformaci[oó]n)\s*:",
        "conditions": r"(?:Conditions|Condiciones)\s*:",
        "propagation": r"(?:Propagation|Propagaci[oó]n)\s*:",
        "exclusions": r"(?:Exclusions|Exclusiones)\s*:",
        "unsupported behavior": r"(?:Unsupported behavior|Comportamiento no soportado)\s*:",
        "conflict policy": r"(?:Conflict policy|Pol[ií]tica de conflictos)\s*:",
        "observability": r"(?:Observability|Observabilidad)\s*:",
        "traceability": r"(?:Traceability|Trazabilidad)\s*:",
    }
    for map_id, block in sorted(mapping_blocks.items()):
        missing = [
            name
            for name, pattern in required_mapping_fields.items()
            if not re.search(pattern, block, re.IGNORECASE)
        ]
        if missing:
            errors.append(f"{map_id} is missing mapping fields: {', '.join(missing)}")
        direction = re.search(
            r"(?:Direction|Direcci[oó]n)\s*:\s*`?([^`\n]+)", block, re.IGNORECASE
        )
        if direction and not re.search(
            r"\b(?:Inbound|Outbound|Bilateral|Entrada|Salida|Bidireccional)\b",
            direction.group(1),
            re.IGNORECASE,
        ):
            errors.append(f"{map_id} must declare Inbound, Outbound or Bilateral direction.")

    sync_terms = re.compile(
        r"\b(?:sync\w*|synchroni[sz]\w*|sincroniz\w*|migration\w*|migraci[oó]n|"
        r"import(?:s|ed|ing|ation)?|export\w*|propagat\w*|propagaci[oó]n|inbound|outbound|"
        r"bidirectional|bidireccional)\b",
        re.IGNORECASE,
    )
    for line in rules.splitlines():
        if not line.startswith("|") or not ID_PATTERNS["BR"].search(line):
            continue
        if not re.search(r"\bConfirmed\b|\bConfirmad[ao]\b", line, re.IGNORECASE):
            continue
        if sync_terms.search(line) and not (
            ID_PATTERNS["MAP"].search(line)
            or re.search(
                r"(?:Mapping|Mapeo)\s*:\s*(?:Not applicable|No aplica|Deferred|Diferido)",
                line,
                re.IGNORECASE,
            )
        ):
            br_id = ID_PATTERNS["BR"].search(line).group()
            errors.append(
                f"{br_id} confirms integration/propagation behavior but has no MAP-* reference "
                "or explicit deferred/not-applicable mapping."
            )

    if not mapping_blocks and sync_terms.search(rules):
        warnings.append("Integration behavior is present but no MAP-* definition was found.")
    return errors, warnings


def strict_checks(root: Path, files: dict[Path, str]) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    all_text = "\n".join(files.values())
    state = files.get(root / "00-workflow-state.md", "")
    rules = files.get(root / "02-rules-and-questions.md", "")
    expanded_deltas = files.get(root / "10-design-and-spec-deltas.md", "")
    delta_text = rules + "\n" + expanded_deltas

    ranged_definitions = set()
    for line in rules.splitlines():
        line = re.sub(r"`[^`]*`", "", line)
        candidate = ""
        if re.match(r"^#{1,6}\s+", line):
            candidate = line
        elif line.startswith("|"):
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            candidate = cells[0] if cells else ""
        ranged_definitions.update(match.group(0) for match in RANGE_PATTERN.finditer(candidate))
    for item in sorted(ranged_definitions):
        warnings.append(
            f"ID range used as a definition; expand and define every ID individually: {item}"
        )

    master = canonical_acceptance_blocks(root, files, errors)
    for ac_id, block in master.items():
        when_count = len(re.findall(
            r"(?:^|\s)(?:-\s*)?(?:\*\*)?(?:When|Cuando)\s*:?(?:\*\*)?\s*:?",
            block,
            re.IGNORECASE,
        ))
        if when_count < 1:
            errors.append(f"{ac_id} must contain an identifiable When/Cuando event.")
        if re.search(r"\b(correctly|properly|successfully|correctamente|adecuadamente|exitosamente)\b", block, re.IGNORECASE):
            warnings.append(f"{ac_id} may contain an ambiguous expected result.")

    # Preserve the package's established primary-volume quality checks. Split volumes are
    # additionally authoritative for consumer parity through `master` above.
    stories_text = files.get(root / "05-user-stories.md", "")
    ac_headings = list(re.finditer(r"^###\s+(AC-[A-Z0-9]+-\d{2,}-\d{2,})\b", stories_text, re.MULTILINE))
    for index, hit in enumerate(ac_headings):
        end = ac_headings[index + 1].start() if index + 1 < len(ac_headings) else len(stories_text)
        block = stories_text[hit.start():end]
        story_boundary = re.search(r"^##(?!#)\s+", block, re.MULTILINE)
        if story_boundary:
            block = block[:story_boundary.start()]
        if not re.search(r"(?:Acceptance condition|Condición de aceptación)\s*:", block, re.IGNORECASE):
            errors.append(f"{hit.group(1)} must declare an explicit acceptance condition before its scenarios.")
        if not ID_PATTERNS["SC"].search(block):
            errors.append(f"{hit.group(1)} must own or reference at least one canonical SC scenario.")

    for sc_id in sorted(set(ID_PATTERNS["SC"].findall(stories_text))):
        start = stories_text.find(sc_id)
        next_sc = ID_PATTERNS["SC"].search(stories_text, start + len(sc_id))
        block = stories_text[start:next_sc.start() if next_sc else len(stories_text)]
        next_ac = ID_PATTERNS["AC"].search(block, len(sc_id))
        if next_ac:
            block = block[:next_ac.start()]
        when_count = len(re.findall(
            r"(?:\*\*)?(?:When|Cuando)\s*:?(?:\*\*)?\s*:?(?=\s|$)",
            block,
            re.IGNORECASE,
        ))
        # NOTE (merge 2026-07-31, reconfirmed 2026-08-20 against v3.2.0): personal requires
        # exactly one primary When/Cuando per SC-*; staging keeps relaxing this to "at least
        # one" every version. Kept personal's stricter behavior — adopted this version's
        # colon-inside/outside-bold regex robustness improvement without adopting the
        # strictness relaxation that came bundled with it.
        if when_count != 1:
            errors.append(f"{sc_id} must contain exactly one primary When/Cuando event; found {when_count}.")
        given_match = re.search(
            r"(?im)^(?:-\s*)?(?:\*\*)?(?:Given|Dado)\s*:?(?:\*\*)?\s*:?\s*([^\n]+)",
            block,
        )
        if given_match:
            given = given_match.group(1).strip()
            opaque_reference = re.search(
                r"\b(?:dataset|data\s+set|matrix|matriz|fixture)\b|"
                r"\b(?:CYCLE|TAX|CASE|CASO)-[A-Z0-9]+(?:-[A-Z0-9]+)+\b",
                given,
                re.IGNORECASE,
            )
            qa_executes_reference = re.search(
                r"\bQA\b.*\b(?:executes?|ejecuta|runs?|corre)\b",
                given,
                re.IGNORECASE,
            )
            if opaque_reference or qa_executes_reference:
                errors.append(
                    f"{sc_id} uses a matrix, dataset, or QA instruction as its Given/Dado. "
                    "State the business context, relevant configuration, and representative values "
                    "in the scenario; move the dataset ID or link to a test-data line after the behavior."
                )
        strategy_required = [
            r"Estrategia QA|QA Strategy",
            r"(?:Automatizaci[oó]n|Automation)\s*:",
            r"(?:Nivel recomendado|Recommended level)\s*:",
            r"(?:Prioridad|Priority)\s*:",
            r"(?:Raz[oó]n|Rationale)\s*:",
            r"(?:Dependencias|Dependencies)\s*:",
            r"(?:Estado|Automated coverage)\s*:",
        ]
        if any(not re.search(pattern, block, re.IGNORECASE) for pattern in strategy_required):
            errors.append(f"{sc_id} is missing its canonical QA strategy fields in the story.")
        decision = re.search(r"(?:Automatizaci[oó]n|Automation):\*\*\s*([^\n]+)", block, re.IGNORECASE)
        if decision and decision.group(1).strip() not in {"Automate now", "Automate later", "Manual", "Blocked"}:
            errors.append(f"{sc_id} has an unsupported canonical automation decision: {decision.group(1).strip()}.")

        # High-risk scenarios need a compact, concrete execution contract. Narrative
        # quality alone cannot prove that QA can reproduce financial or scheduled work.
        critical_domain = re.search(
            r"\b(payment|pago|charge|cobro|installment|cuota|retry|reintento|"
            r"schedule(?:d|r)?|programad[oa]|refund|reembolso|void|duplicate|duplicad[oa]|"
            r"idempoten|balance|saldo|token|delete|delet|elimin|destruct|identity|identidad|"
            r"permission|permiso|authorization|autorizaci[oó]n|cross[ -]system|entre sistemas|"
            r"salesforce|integration|integraci[oó]n|sync|sincroniz\w*)\b",
            block,
            re.IGNORECASE,
        )
        explicit_high_risk = re.search(
            r"(?:Priority(?:/Risk)?|Prioridad(?:/Riesgo)?)\s*:\s*\*\*?\s*"
            r"(?:High|Critical|Alta|Cr[ií]tica)",
            block,
            re.IGNORECASE,
        )
        high_risk = bool(critical_domain or explicit_high_risk)
        readiness = re.search(
            r"(?:Executability|Ejecutabilidad)\s*:\s*\*\*?\s*"
            r"(Ready|Needs refinement|Blocked)",
            block,
            re.IGNORECASE,
        )
        automate_now = bool(re.search(r"Automate now", block, re.IGNORECASE))
        claims_ready = bool(readiness and readiness.group(1).lower() == "ready")
        contract_adopted = bool(re.search(
            r"(?:Executability|Ejecutabilidad|Controlled example|Ejemplo controlado|"
            r"Initial state|Estado inicial|Controlled outcome|Resultado controlado|"
            r"Observable evidence|Evidencia observable|Combination coverage|Cobertura de combinaciones)\s*:",
            block,
            re.IGNORECASE,
        ))
        if high_risk and contract_adopted and automate_now and not claims_ready:
            errors.append(f"{sc_id} cannot use Automate now without Executability: Ready.")
        if high_risk and (claims_ready or (automate_now and contract_adopted)):
            required_execution = {
                "controlled example": r"(?:Controlled example|Ejemplo controlado)\s*:",
                "initial state": r"(?:Initial state|Estado inicial)\s*:",
                "controlled outcome": r"(?:Controlled outcome|Resultado controlado)\s*:",
                "observable evidence": r"(?:Observable evidence|Evidencia observable)\s*:",
            }
            missing = [
                name for name, pattern in required_execution.items()
                if not re.search(pattern, block, re.IGNORECASE)
            ]
            if missing:
                errors.append(
                    f"{sc_id} is high risk and claims Ready/Automate now but lacks its concrete execution contract: "
                    f"{', '.join(missing)}. Use Needs refinement when an owner decision is missing."
                )
            if re.search(r"\b(partial|parciales?|oldest|más antigu|mas antigu|accumulat\w*|acumulad\w*)\b", block, re.IGNORECASE):
                if not re.search(r"(?:Combination coverage|Cobertura de combinaciones)\s*:", block, re.IGNORECASE):
                    errors.append(
                        f"{sc_id} has interacting recovery outcomes but no Combination coverage/Cobertura de combinaciones."
                    )
            if automate_now and missing:
                errors.append(f"{sc_id} cannot use Automate now while its execution contract is incomplete.")

    # Split volumes are authoritative for behavior and must receive semantic clarity
    # warnings. Keep legacy structural adoption progressive: untouched historical
    # scenarios are not failed solely because newer QA metadata was introduced later.
    for sc_id, block in scenario_blocks(canonical_story_text(root, files)).items():
        warnings.extend(scenario_clarity_warnings(sc_id, block))

    for jira in (root / "jira").glob("US-*.md") if (root / "jira").is_dir() else []:
        jira_blocks = acceptance_blocks(jira.read_text(encoding="utf-8"))
        for ac_id, jira_block in jira_blocks.items():
            if ac_id in master and jira_block != master[ac_id]:
                errors.append(f"Jira/master acceptance criterion differs: {jira.name} / {ac_id}")

    functional = files.get(root / "07-functional-test-cases.md", "")
    tests = functional or files.get(root / "07-test-cases.md", "")
    if functional:
        ftc_hits = list(re.finditer(r"^#{2}\s+(FTC-[A-Z0-9]+-\d{2,})\b", functional, re.MULTILINE))
        ftc_required = {
            "stories": r"(?:Stories|Historias)\s*:",
            "purpose": r"(?:Purpose|Propósito)\s*:",
            "risk": r"(?:Priority/Risk|Prioridad/Riesgo)\s*:",
            "level": r"(?:Recommended level|Nivel recomendado)\s*:",
            "automation": r"(?:Automation recommendation|Recomendación de automatización)\s*:",
            "QA state": r"(?:QA review state|Estado de revisión de QA)\s*:",
            "executability": r"(?:Executability|Ejecutabilidad)\s*:",
            "preconditions": r"#{3,6}\s+(?:Preconditions|Precondiciones)",
            "data/environment": r"#{3,6}\s+(?:Data and environment|Datos y ambiente)",
        }
        for index, hit in enumerate(ftc_hits):
            end = ftc_hits[index + 1].start() if index + 1 < len(ftc_hits) else len(functional)
            block = functional[hit.start():end]
            missing = [name for name, pattern in ftc_required.items() if not re.search(pattern, block, re.IGNORECASE)]
            if missing:
                errors.append(f"{hit.group(1)} is missing required fields: {', '.join(missing)}")
        for sc_id in sorted(set(ID_PATTERNS["SC"].findall(functional))):
            start = functional.find(sc_id)
            next_match = ID_PATTERNS["SC"].search(functional, start + len(sc_id))
            block = functional[start:next_match.start() if next_match else len(functional)]
            required = [r"(?:Covered checks|Checks cubiertos)\s*:", r"(?:Given|Dado)\s*:", r"(?:When|Cuando)\s*:", r"(?:Then|Entonces)\s*:", r"(?:Evidence|Evidencia)\s*:", r"(?:Evidence location|Ubicación de evidencia)\s*:", r"(?:Automation|Automatización)\s*:", r"(?:Automation rationale|Razón de automatización)\s*:", r"(?:Automation priority|Prioridad de automatización)\s*:", r"(?:Recommended automation level|Nivel de automatización recomendado)\s*:", r"(?:Automation dependencies|Dependencias de automatización)\s*:", r"(?:Automated coverage|Cobertura automatizada)\s*:"]
            if any(not re.search(pattern, block, re.IGNORECASE) for pattern in required):
                errors.append(f"{sc_id} is missing checks, Given/When/Then, evidence, or scenario-level automation fields.")
        coverage = files.get(root / "06-test-coverage.md", "")
        ledger = files.get(root / "08-traceability-and-risks.md", "")
        for check_id in sorted(set(ID_PATTERNS["CHK"].findall(coverage))):
            if check_id not in functional and check_id not in ledger:
                errors.append(f"Coverage check has no scenario or ledger status: {check_id}")
        if not re.search(r"Grouping|Agrupaci[oó]n|Duplicate|Duplicad|Combin", functional, re.IGNORECASE):
            warnings.append("No check-grouping review found before functional cases.")
        journey_errors, journey_warnings = journey_integrity_checks(functional, coverage)
        errors.extend(journey_errors)
        warnings.extend(journey_warnings)

    tc_hits = list(re.finditer(r"^#{2,6}\s+(TC-[A-Z0-9]+-\d{3,})\b", tests, re.MULTILINE))
    required = {
        "story": r"(?:Story|Historia)\s*:",
        "criteria": r"(?:Criteria|Criterios?)\s*:",
        "rules": r"(?:Rules|Reglas)\s*:",
        "risk": r"(?:Priority/Risk|Prioridad/Riesgo)\s*:",
        "level": r"(?:Type/Level|Tipo/Nivel)\s*:",
        "automation": r"(?:Automation|Automatización)\s*:",
        "status": r"(?:Approval state|Estado de aprobación)\s*:",
        "preconditions": r"#{3,6}\s+(?:Preconditions|Precondiciones)",
        "data": r"#{3,6}\s+(?:Data|Datos)",
        "actions": r"#{3,6}\s+(?:Actions|Acciones)",
        "expected results": r"#{3,6}\s+(?:Expected Results|Resultados esperados)",
        "evidence": r"(?:Expected evidence|Evidencia esperada)\s*:",
    }
    for index, hit in enumerate(tc_hits):
        end = tc_hits[index + 1].start() if index + 1 < len(tc_hits) else len(tests)
        block = tests[hit.start():end]
        missing = [name for name, pattern in required.items() if not re.search(pattern, block, re.IGNORECASE)]
        if missing:
            errors.append(f"{hit.group(1)} is missing required fields: {', '.join(missing)}")

    if not re.search(r"Ready for Sprint|List[oa] para Sprint", all_text, re.IGNORECASE):
        errors.append("No Ready for Sprint assessment found.")

    derived_field = re.search(
        r"(?:Derived artifacts|Artefactos derivados)\s*:\s*([^\n]+)",
        state,
        re.IGNORECASE,
    )
    if derived_field:
        derived_value = derived_field.group(1).strip()
        has_derived = not re.fullmatch(
            r"(?:none|ninguno|ninguna|no aplica|not applicable|n/?a)",
            derived_value,
            re.IGNORECASE,
        )
        if has_derived:
            if not re.search(r"(?:Canonical base snapshot|Snapshot can[oó]nico base)\s*:", state, re.IGNORECASE):
                errors.append("Derived-artifact review must declare the canonical base snapshot, including Unknown when unavailable.")
            if not re.search(r"(?:Source inventory|Inventario (?:y autoridad )?de fuentes)", delta_text, re.IGNORECASE):
                errors.append("Derived-artifact review is missing its source-role inventory.")
            if not re.search(r"(?:Design and specification deltas|Deltas de dise[nñ]o y especificaci[oó]n)", delta_text, re.IGNORECASE):
                errors.append("Derived-artifact review is missing its design/specification delta ledger.")
            if not re.search(r"(?:Product Boundary|Frontera de producto)", delta_text, re.IGNORECASE):
                errors.append("Derived-artifact review is missing a Product Boundary result.")

            unresolved_rows = [
                line for line in delta_text.splitlines()
                if ID_PATTERNS["DELTA"].search(line)
                and re.search(r"\b(Proposed|Contradicted|Unverifiable|Propuesto|Contradicho|No verificable)\b", line, re.IGNORECASE)
            ]
            ready_yes = re.search(
                r"(?:Ready for Sprint|List[oa] para Sprint)\s*:\s*(?:Yes|S[ií])\b",
                all_text,
                re.IGNORECASE,
            )
            if unresolved_rows and ready_yes:
                errors.append("Ready for Sprint cannot be Yes while a material DELTA is Proposed, Contradicted, or Unverifiable.")
    elif expanded_deltas or re.search(
        r"\b(?:prototype|prototipo|figma|html|generated spec|spec generad[ao])\b",
        delta_text,
        re.IGNORECASE,
    ):
        errors.append(
            "Workflow state must declare Derived artifacts / Artefactos derivados when derived-artifact evidence is present."
        )

    if not functional and not re.search(r"Duplicate|Duplicad", tests, re.IGNORECASE):
        warnings.append("No duplicate/combination review found before detailed test cases.")
    native = [*root.rglob("*.testcase.yml"), *root.rglob("*.testplan.yml"), *root.rglob("*.testrun.yml")]
    if native:
        errors.append("Native test-management YAML is outside this workflow boundary.")
    return errors, warnings


def validate_shared_contract(
    root: Path, language: str, strict: bool = False
) -> tuple[list[str], list[str]]:
    """Validate the smaller, explicit contract used by cross-project shared packages."""
    errors: list[str] = []
    warnings: list[str] = []
    files = read_files(root)

    for relative in SHARED_EXPECTED:
        path = root / relative
        if not path.is_file():
            errors.append(f"Missing expected shared-contract artifact: {relative}")
        elif not path.read_text(encoding="utf-8").strip():
            errors.append(f"Empty shared-contract artifact: {relative}")

    contract_files = sorted(
        path
        for path in root.glob("*.md")
        if path.name not in {*SHARED_EXPECTED, *AUDIT_ARTIFACTS}
    )
    if not contract_files:
        errors.append("Shared contract must contain at least one canonical contract Markdown.")

    state = files.get(root / "00-workflow-state.md", "")
    index = files.get(root / "09-package-index.md", "")
    if not re.search(r"(?:Package kind|Tipo)\s*:\s*`?shared-contract`?", state + "\n" + index, re.IGNORECASE):
        errors.append("Shared contract must declare package_kind: shared-contract.")
    for label, pattern in (
        ("owner", r"(?:Owner project|Propietario(?: funcional)?)\s*:"),
        ("consumers", r"(?:Consumer projects|Consumidores(?: locales)?)\s*:|^##\s+(?:Consumidores|Paquetes consumidores)"),
        ("change-impact rule", r"(?:Change-impact rule|Regla de cambio)\s*:|^##\s+Gobierno de cambios"),
    ):
        if not re.search(pattern, state + "\n" + "\n".join(files.get(path, "") for path in contract_files), re.IGNORECASE | re.MULTILINE):
            errors.append(f"Shared contract does not declare {label}.")

    for path in contract_files:
        text = files.get(path, "")
        if not text.strip():
            errors.append(f"Empty shared-contract artifact: {path.name}")
            continue
        if not re.search(r"(?im)^-\s*(?:Status|Estado)\s*:\s*\S", text):
            errors.append(f"Shared-contract artifact does not declare status: {path.name}")
        if not re.search(r"(?im)^##\s+(?:Authority|Autoridad|Scope|Alcance|Authority and scope|Autoridad y alcance)\b", text):
            errors.append(f"Shared-contract artifact does not declare authority or scope: {path.name}")
        relative = path.relative_to(root).as_posix()
        if not re.search(rf"\[[^]]+\]\((?:\./)?{re.escape(relative)}(?:#[^)]+)?\)", index):
            errors.append(f"Package index does not link canonical shared contract: {relative}")

    for path, text in files.items():
        for target in re.findall(r"\[[^]]+\]\((?!https?://)([^)#]+)(?:#[^)]+)?\)", text):
            linked = (path.parent / target).resolve()
            if not linked.exists():
                errors.append(f"Broken relative link in {path.relative_to(root)}: {target}")

    if language == "es" and not re.search(r"(?im)^-\s*Estado\s*:", state + "\n" + index):
        errors.append("Spanish shared contract must use Estado in its package metadata.")
    if language == "en" and not re.search(r"(?im)^-\s*Status\s*:", state + "\n" + index):
        errors.append("English shared contract must use Status in its package metadata.")

    native = [*root.rglob("*.testcase.yml"), *root.rglob("*.testplan.yml"), *root.rglob("*.testrun.yml")]
    if native:
        errors.append("Native test-management YAML is outside this workflow boundary.")
    return errors, warnings


def validate(
    root: Path,
    language: str,
    strict: bool = False,
    package_kind: str = "project",
) -> tuple[list[str], list[str]]:
    if package_kind == "shared-contract":
        return validate_shared_contract(root, language, strict)
    errors: list[str] = []
    warnings: list[str] = []
    files = read_files(root)

    for relative in EXPECTED:
        path = root / relative
        if not path.is_file():
            errors.append(f"Missing expected artifact: {relative}")
        elif not path.read_text(encoding="utf-8").strip():
            errors.append(f"Empty artifact: {relative}")

    test_design_files = [root / "07-functional-test-cases.md", root / "07-test-cases.md"]
    if not any(path.is_file() and path.read_text(encoding="utf-8").strip() for path in test_design_files):
        errors.append("Missing test design artifact: 07-functional-test-cases.md")

    # Solo + AI, no-tracker initiatives (idea-to-ship "tracking mode 2") never file Jira
    # issues at all, so no jira/ views are expected either — that's not a gap, it's the mode.
    state_text = files.get(root / "00-workflow-state.md", "")
    no_tracker_mode = bool(re.search(r"solo\s*\+?\s*AI|no\s+tracker|sin\s+tracker|sin\s+tablero", state_text, re.IGNORECASE))
    if not no_tracker_mode:
        jira_files = list((root / "jira").glob("US-*.md")) if (root / "jira").is_dir() else []
        # Candidate stories in the map/release slices are intentionally not tickets yet.
        # Only stories formally defined in the approved story artifact require Jira views.
        story_defs = definitions_in_text(files.get(root / "05-user-stories.md", ""), "US")
        if story_defs and len(jira_files) < len(story_defs):
            errors.append(f"Jira views ({len(jira_files)}) are fewer than story IDs ({len(story_defs)}).")

    all_text = "\n".join(files.values())
    traceability_text = re.sub(r"`[^`\n]*`", "", all_text)
    defined = {kind: definitions(files, kind) for kind in ID_PATTERNS}
    for kind, pattern in ID_PATTERNS.items():
        referenced = set(pattern.findall(traceability_text))
        missing = sorted(referenced - defined[kind])
        if missing:
            errors.append(f"Referenced {kind} IDs without a definition: {', '.join(missing)}")

    stories = files.get(root / "05-user-stories.md", "")
    tests = files.get(root / "07-functional-test-cases.md", "") or files.get(root / "07-test-cases.md", "")
    ledger = files.get(root / "08-traceability-and-risks.md", "")
    for ac_id in sorted(set(ID_PATTERNS["AC"].findall(stories))):
        if ac_id not in tests and ac_id not in ledger:
            errors.append(f"Acceptance criterion has no test or ledger reference: {ac_id}")

    state = files.get(root / "00-workflow-state.md", "")
    if not re.search(r"project status|estado del proyecto", state, re.IGNORECASE):
        errors.append("Workflow state does not declare project status separately.")
    if not re.search(r"delivery|entrega", state, re.IGNORECASE):
        errors.append("Workflow state does not declare delivery status.")

    if language == "es":
        en_count, es_count = len(EN_MARKERS.findall(all_text)), len(ES_MARKERS.findall(all_text))
        if en_count > max(3, es_count // 3):
            errors.append(f"Possible mixed language: {en_count} English structural markers in Spanish package.")
    elif language == "en":
        en_count, es_count = len(EN_MARKERS.findall(all_text)), len(ES_MARKERS.findall(all_text))
        if es_count > max(3, en_count // 3):
            errors.append(f"Possible mixed language: {es_count} Spanish structural markers in English package.")

    for path, text in files.items():
        for target in re.findall(r"\[[^]]+\]\((?!https?://)([^)#]+)(?:#[^)]+)?\)", text):
            linked = (path.parent / target).resolve()
            if not linked.exists():
                errors.append(f"Broken relative link in {path.relative_to(root)}: {target}")

    if not re.search(r"Engineering (?:review needed|pending)|revisión de ingeniería", all_text, re.IGNORECASE):
        warnings.append("No explicit engineering-review state found.")
    if "QA review needed" not in all_text and "revisión de qa" not in all_text.lower():
        warnings.append("No explicit QA-review state found.")
    if strict:
        strict_errors, strict_warnings = strict_checks(root, files)
        errors.extend(strict_errors)
        warnings.extend(strict_warnings)
        checkpoint_present = re.search(
            r"(?:Decision Checkpoint|Checkpoint de decisiones)", state, re.IGNORECASE
        )
        mapping_present = ID_PATTERNS["MAP"].search(all_text)
        if checkpoint_present or mapping_present:
            checkpoint_errors, checkpoint_warnings = decision_checkpoint_checks(root, files)
            errors.extend(checkpoint_errors)
            warnings.extend(checkpoint_warnings)
    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=Path)
    parser.add_argument("--language", choices=("en", "es"), required=True)
    parser.add_argument("--strict", action="store_true", help="Enable readiness, parity, Gherkin, range, and full test-schema checks")
    parser.add_argument(
        "--package-kind",
        choices=("project", "shared-contract"),
        default="project",
        help="Validate the explicit artifact contract for a full project or shared contract.",
    )
    parser.add_argument(
        "--decision-checkpoint",
        action="store_true",
        help="Validate only the latest decision checkpoint and MAP contracts; final artifacts are not required",
    )
    args = parser.parse_args()
    if not args.folder.is_dir():
        print(f"ERROR: package folder does not exist: {args.folder}")
        return 2
    if args.decision_checkpoint:
        files = read_files(args.folder.resolve())
        errors, warnings = decision_checkpoint_checks(args.folder.resolve(), files)
    else:
        errors, warnings = validate(
            args.folder.resolve(), args.language, args.strict, args.package_kind
        )
    for message in errors:
        print(f"ERROR: {message}")
    for message in warnings:
        print(f"WARNING: {message}")
    if errors:
        print(f"FAILED: {len(errors)} error(s), {len(warnings)} warning(s)")
        return 1
    print(f"OK: 0 errors, {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
