#!/usr/bin/env python3
"""Deterministic preflight and report validation for refinement-judge."""

from __future__ import annotations

import argparse
import hashlib
import re
import subprocess
import sys
from pathlib import Path


JUDGE_REPORT = "11-refinement-judge-report.md"
ROOT_PRODUCT_MARKDOWN_RE = re.compile(r"^\d{2}-.*\.md$")

VERDICT_RE = re.compile(
    r"(?im)^-\s*(?:Verdict|Veredicto)(?:\s*/\s*(?:Verdict|Veredicto))?\s*:\s*"
    r"(PASS WITH OBSERVATIONS|PASS CON OBSERVACIONES|PASS|FAIL)\s*$"
)
SNAPSHOT_RE = re.compile(
    r"(?im)^-\s*(?:Reviewed snapshot SHA-256|Snapshot revisado SHA-256)"
    r"(?:\s*/\s*(?:Reviewed snapshot SHA-256|Snapshot revisado SHA-256))?\s*:\s*"
    r"([0-9a-f]{64})\s*$"
)
FINDING_RE = re.compile(r"(?m)^###\s+(JUDGE-[A-Z0-9]+-\d{3,})\b")
FINDING_HEADER_RE = re.compile(
    r"(?m)^###\s+(JUDGE-([A-Z0-9]+)-(\d{3,}))\s+(?:—|-)\s+(.+?)\s*$"
)
SEVERITY_RE = re.compile(
    r"(?im)^-\s*(?:Severity|Severidad)(?:\s*/\s*(?:Severity|Severidad))?\s*:\s*"
    r"(Critical|High|Medium|Low|Observation)\s*$"
)
STATUS_RE = re.compile(
    r"(?im)^-\s*(?:Status|Estado)(?:\s*/\s*(?:Status|Estado))?\s*:\s*"
    r"(Open|Partially resolved|Resolved|Accepted risk|Not reproducible|Superseded)\s*$"
)
BLOCK_RE = re.compile(
    r"(?im)^-\s*(?:Blocks action|Bloquea acción)(?:\s*/\s*(?:Blocks action|Bloquea acción))?\s*:\s*"
    r"(Yes|No|Sí)\s*$"
)
ACTION_RE = re.compile(
    r"(?im)^-\s*(?:Intended action|Acción evaluada)"
    r"(?:\s*/\s*(?:Intended action|Acción evaluada))?\s*:\s*\S"
)
ACTION_STAGE_RE = re.compile(
    r"(?im)^-\s*(?:Action stage|Etapa de acción)"
    r"(?:\s*/\s*(?:Action stage|Etapa de acción))?\s*:\s*(Preview|Publication|Post-publication)\s*$"
)
ACTION_SCOPE_RE = re.compile(
    r"(?im)^-\s*(?:Action scope|Alcance de acción)"
    r"(?:\s*/\s*(?:Action scope|Alcance de acción))?\s*:\s*"
    r"technical\s*=\s*\d+\s*;\s*editorial\s*=\s*\d+\s*$"
)
ACTION_SCOPE_LABEL_RE = re.compile(
    r"(?im)^-\s*(?:Action scope|Alcance de acción)"
    r"(?:\s*/\s*(?:Action scope|Alcance de acción))?\s*:"
)


def package_validator() -> Path:
    candidate = Path(__file__).resolve().parents[2] / "story-to-test-workflow" / "scripts" / "validate-package.py"
    if not candidate.is_file():
        raise FileNotFoundError(f"Sibling package validator not found: {candidate}")
    return candidate


def snapshot_files(root: Path, package_kind: str = "project") -> list[Path]:
    files = [
        path
        for path in root.glob("*.md")
        if path.name != JUDGE_REPORT
        and (package_kind == "shared-contract" or ROOT_PRODUCT_MARKDOWN_RE.fullmatch(path.name))
    ]
    for folder in ("jira", "handoffs"):
        directory = root / folder
        if directory.is_dir():
            files.extend(sorted(directory.rglob("*.md")))
    return sorted(set(files), key=lambda path: path.relative_to(root).as_posix())


def snapshot_hash(root: Path, files: list[Path]) -> str:
    digest = hashlib.sha256()
    for path in files:
        relative = path.relative_to(root).as_posix().encode("utf-8")
        digest.update(relative)
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def run_preflight(root: Path, language: str, phase: str, package_kind: str) -> int:
    if not root.is_dir():
        print(f"ERROR: package folder does not exist: {root}")
        return 2
    command = [
        sys.executable,
        str(package_validator()),
        str(root),
        "--language",
        language,
    ]
    if phase == "gate-c":
        command.append("--decision-checkpoint")
    else:
        command.append("--strict")
        command.extend(["--package-kind", package_kind])
    result = subprocess.run(command, text=True, capture_output=True, check=False)
    if result.stdout:
        print(result.stdout.rstrip())
    if result.stderr:
        print(result.stderr.rstrip(), file=sys.stderr)
    files = snapshot_files(root, package_kind)
    if not files:
        print("ERROR: no canonical files available for snapshot")
        return 1
    print(f"PREFLIGHT_PHASE: {phase}")
    print(f"SNAPSHOT_SHA256: {snapshot_hash(root.resolve(), files)}")
    print(f"SNAPSHOT_FILES: {len(files)}")
    return result.returncode


def field_present(block: str, labels: tuple[str, ...]) -> bool:
    joined = "|".join(re.escape(label) for label in labels)
    return bool(re.search(rf"(?im)^-\s*(?:{joined})(?:\s*/\s*(?:{joined}))?\s*:\s*\S", block))


def finding_headers(text: str) -> dict[str, tuple[str, int, str]]:
    """Return stable finding identity as ID -> (project, number, title)."""
    return {
        match.group(1): (match.group(2), int(match.group(3)), match.group(4).strip())
        for match in FINDING_HEADER_RE.finditer(text)
    }


def validate_finding_history(
    current_text: str, previous_text: str, errors: list[str]
) -> None:
    """Reject deleted, repurposed, or non-sequential finding IDs on Judge reruns."""
    current = finding_headers(current_text)
    previous = finding_headers(previous_text)

    for finding_id, (_project, _number, previous_title) in previous.items():
        if finding_id not in current:
            errors.append(f"Previous finding ID was removed: {finding_id}.")
            continue
        current_title = current[finding_id][2]
        if current_title != previous_title:
            errors.append(
                f"Previous finding ID changed meaning/title: {finding_id}. "
                "Keep the historical title and create a new sequential ID for a different defect."
            )

    previous_by_project: dict[str, list[int]] = {}
    for project, number, _title in previous.values():
        previous_by_project.setdefault(project, []).append(number)
    new_by_project: dict[str, list[int]] = {}
    for finding_id, (project, number, _title) in current.items():
        if finding_id not in previous:
            new_by_project.setdefault(project, []).append(number)
    for project, numbers in new_by_project.items():
        if project not in previous_by_project:
            continue
        start = max(previous_by_project[project]) + 1
        expected = list(range(start, start + len(numbers)))
        if sorted(numbers) != expected:
            errors.append(
                f"New finding IDs for JUDGE-{project} must continue sequentially from "
                f"{start:03d}: found {', '.join(f'{number:03d}' for number in sorted(numbers))}."
            )


def run_report(
    report: Path, required_stage: str | None, previous_report: Path | None = None
) -> int:
    if not report.is_file():
        print(f"ERROR: report does not exist: {report}")
        return 2
    text = report.read_text(encoding="utf-8")
    errors: list[str] = []

    if previous_report:
        if not previous_report.is_file():
            errors.append(f"Previous Judge report does not exist: {previous_report}")
        else:
            validate_finding_history(
                text, previous_report.read_text(encoding="utf-8"), errors
            )

    verdict_match = VERDICT_RE.search(text)
    if not verdict_match:
        errors.append("Missing or unsupported Verdict/Veredicto.")
    if not ACTION_RE.search(text):
        errors.append("Missing Intended action/Acción evaluada.")
    if not SNAPSHOT_RE.search(text):
        errors.append("Missing valid 64-character reviewed snapshot SHA-256.")
    stage = ACTION_STAGE_RE.search(text)
    if stage and stage.group(1) == "Preview" and ACTION_SCOPE_LABEL_RE.search(text):
        errors.append(
            "Preview reports must omit Action scope/Alcance de acción; exact write counts "
            "belong to Publication or Post-publication."
        )
    if required_stage:
        if not stage or stage.group(1) != required_stage:
            errors.append(
                f"{required_stage} validation requires Action stage/Etapa de acción: {required_stage}."
            )
        if not ACTION_SCOPE_RE.search(text):
            errors.append(
                f"{required_stage} validation requires Action scope/Alcance de acción: "
                "technical=N; editorial=N."
            )

    required_sections = [
        ("executive summary", ("Executive summary", "Resumen ejecutivo")),
        ("scope and evidence", ("Scope and evidence", "Alcance y evidencia")),
        ("findings", ("Findings", "Hallazgos")),
        ("coverage summary", ("Coverage summary", "Resumen de cobertura")),
        ("required corrections", ("Required corrections", "Correcciones requeridas")),
        ("residual risk", ("Residual risk", "Riesgo residual")),
        ("gate authorization", ("Gate authorization", "Autorización del gate")),
    ]
    for name, headings in required_sections:
        if not any(re.search(rf"(?im)^##\s+.*{re.escape(heading)}", text) for heading in headings):
            errors.append(f"Missing section: {name}.")

    findings = list(FINDING_RE.finditer(text))
    open_blocking_severities: list[str] = []
    open_observations: list[str] = []
    seen: set[str] = set()
    for index, match in enumerate(findings):
        finding_id = match.group(1)
        if finding_id in seen:
            errors.append(f"Duplicate finding ID: {finding_id}.")
        seen.add(finding_id)
        end = findings[index + 1].start() if index + 1 < len(findings) else len(text)
        block = text[match.start():end]
        severity = SEVERITY_RE.search(block)
        status = STATUS_RE.search(block)
        blocks = BLOCK_RE.search(block)
        if not severity:
            errors.append(f"{finding_id} is missing Severity/Severidad.")
        if not status:
            errors.append(f"{finding_id} is missing Status/Estado.")
        if not blocks:
            errors.append(f"{finding_id} is missing Blocks action/Bloquea acción.")
        required_fields = [
            ("evidence", ("Evidence", "Evidencia")),
            ("affected artifacts", ("Affected artifacts", "Artefactos afectados")),
            ("consequence", ("Consequence", "Consecuencia")),
            ("required correction", ("Required correction", "Corrección requerida")),
            ("verification", ("Verification", "Verificación")),
        ]
        for name, labels in required_fields:
            if not field_present(block, labels):
                errors.append(f"{finding_id} is missing {name}.")
        if (
            severity
            and status
            and status.group(1) in {"Open", "Partially resolved"}
        ):
            blocking_severity = severity.group(1) in {"Critical", "High", "Medium"}
            says_blocking = bool(blocks and blocks.group(1) in {"Yes", "Sí"})
            if blocking_severity:
                open_blocking_severities.append(finding_id)
            else:
                open_observations.append(finding_id)
            if blocks and blocking_severity != says_blocking:
                errors.append(
                    f"{finding_id} has inconsistent Severity/Severidad and Blocks action/Bloquea acción."
                )

    if verdict_match and verdict_match.group(1) != "FAIL" and open_blocking_severities:
        errors.append(
            "Non-FAIL verdict conflicts with open Critical/High/Medium findings: "
            + ", ".join(open_blocking_severities)
        )
    if verdict_match and verdict_match.group(1) == "PASS" and (open_blocking_severities or open_observations):
        errors.append(
            "PASS conflicts with open findings: "
            + ", ".join(open_blocking_severities + open_observations)
        )
    if (
        verdict_match
        and verdict_match.group(1) in {"PASS WITH OBSERVATIONS", "PASS CON OBSERVACIONES"}
        and not open_observations
    ):
        errors.append("Observations verdict requires at least one open Low or Observation finding.")

    for error in errors:
        print(f"ERROR: {error}")
    if errors:
        print(f"FAILED: {len(errors)} error(s)")
        return 1
    print(f"OK: report schema and verdict consistency passed ({len(findings)} finding(s))")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    preflight = subparsers.add_parser("preflight")
    preflight.add_argument("folder", type=Path)
    preflight.add_argument("--language", choices=("en", "es"), required=True)
    preflight.add_argument("--phase", choices=("final", "gate-c"), default="final")
    preflight.add_argument(
        "--package-kind",
        choices=("project", "shared-contract"),
        default="project",
    )

    report = subparsers.add_parser("report")
    report.add_argument("file", type=Path)
    report.add_argument(
        "--publication",
        action="store_true",
        help="Require an exact Publication stage and technical/editorial scope.",
    )
    report.add_argument(
        "--post-publication",
        action="store_true",
        help="Require an exact Post-publication stage and technical/editorial scope.",
    )
    report.add_argument(
        "--previous-report",
        type=Path,
        help=(
            "Validate rerun history: previous IDs must remain, keep their titles, and "
            "allocate new IDs sequentially."
        ),
    )

    args = parser.parse_args()
    if args.command == "preflight":
        return run_preflight(
            args.folder.resolve(), args.language, args.phase, args.package_kind
        )
    if args.publication and args.post_publication:
        parser.error("--publication and --post-publication are mutually exclusive")
    required_stage = "Publication" if args.publication else "Post-publication" if args.post_publication else None
    previous_report = args.previous_report.resolve() if args.previous_report else None
    return run_report(args.file.resolve(), required_stage, previous_report)


if __name__ == "__main__":
    sys.exit(main())
