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
    "BR": re.compile(r"\bBR-\d{2,}\b"),
    "US": re.compile(r"\bUS-[A-Z0-9]+-\d{2,}[A-Za-z]?\b"),
    "AC": re.compile(r"\bAC-[A-Z0-9]+-\d{2,}[A-Za-z]?-\d{2,}[A-Za-z]?\b"),
    "TC": re.compile(r"\bTC-[A-Z0-9]+-\d{3,}\b"),
    "CHK": re.compile(r"\bCHK-[A-Z0-9]+-\d{3,}\b"),
    "FTC": re.compile(r"\bFTC-[A-Z0-9]+-\d{2,}\b"),
    "SC": re.compile(r"\bSC-[A-Z0-9]+-\d{2,}[A-Za-z]?-\d{2,}[A-Za-z]?(?:-\d{2,}[A-Za-z]?)?\b"),
}

RANGE_PATTERN = re.compile(
    r"\b((?:BR-\d{2,}|(?:TC|CHK)-[A-Z0-9]+-\d{3,}))\s*[–—-]\s*((?:BR-)?\d{2,}|(?:(?:TC|CHK)-[A-Z0-9]+-)?\d{3,})\b"
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


AUDIT_ARTIFACTS = {
    "11-refinement-judge-report.md",
}


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


def strict_checks(root: Path, files: dict[Path, str]) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    all_text = "\n".join(files.values())

    for match in RANGE_PATTERN.finditer(all_text):
        warnings.append(
            f"ID range must be expanded and each ID defined individually: {match.group(0)}"
        )

    master = acceptance_blocks(files.get(root / "05-user-stories.md", ""))
    for ac_id, block in master.items():
        when_count = len(re.findall(r"(?:^|\s)(?:-\s*)?(?:\*\*)?(?:When|Cuando)(?:\*\*)?\s*:?", block, re.IGNORECASE))
        if when_count < 1:
            errors.append(f"{ac_id} must contain an identifiable When/Cuando event.")
        if re.search(r"\b(correctly|properly|successfully|correctamente|adecuadamente|exitosamente)\b", block, re.IGNORECASE):
            warnings.append(f"{ac_id} may contain an ambiguous expected result.")

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
        when_count = len(re.findall(r"\*\*(?:When|Cuando)(?:\*\*)?\s*:?(?=\s|$)", block, re.IGNORECASE))
        if when_count != 1:
            errors.append(f"{sc_id} must contain exactly one primary When/Cuando event; found {when_count}.")
        strategy_required = [r"Estrategia QA|QA Strategy", r"Automatizaci[oó]n\s*:", r"Nivel recomendado\s*:", r"Prioridad\s*:", r"Raz[oó]n\s*:", r"Dependencias\s*:", r"Estado\s*:"]
        if any(not re.search(pattern, block, re.IGNORECASE) for pattern in strategy_required):
            errors.append(f"{sc_id} is missing its canonical QA strategy fields in the story.")
        decision = re.search(r"Automatizaci[oó]n:\*\*\s*([^\n]+)", block, re.IGNORECASE)
        if decision and decision.group(1).strip() not in {"Automate now", "Automate later", "Manual", "Blocked"}:
            errors.append(f"{sc_id} has an unsupported canonical automation decision: {decision.group(1).strip()}.")
        given_match = re.search(
            r"(?im)^(?:-\s*)?\*\*(?:Given|Dado)\*\*\s*:?\s*([^\n]+)",
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
    if not functional and not re.search(r"Duplicate|Duplicad", tests, re.IGNORECASE):
        warnings.append("No duplicate/combination review found before detailed test cases.")
    native = [*root.rglob("*.testcase.yml"), *root.rglob("*.testplan.yml"), *root.rglob("*.testrun.yml")]
    if native:
        errors.append("Native test-management YAML is outside this workflow boundary.")
    return errors, warnings


def validate(root: Path, language: str, strict: bool = False) -> tuple[list[str], list[str]]:
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
    defined = {kind: definitions(files, kind) for kind in ID_PATTERNS}
    for kind, pattern in ID_PATTERNS.items():
        referenced = set(pattern.findall(all_text))
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
    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=Path)
    parser.add_argument("--language", choices=("en", "es"), required=True)
    parser.add_argument("--strict", action="store_true", help="Enable readiness, parity, Gherkin, range, and full test-schema checks")
    args = parser.parse_args()
    if not args.folder.is_dir():
        print(f"ERROR: package folder does not exist: {args.folder}")
        return 2
    errors, warnings = validate(args.folder.resolve(), args.language, args.strict)
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
