#!/usr/bin/env python3
"""Produce a read-only, evidence-backed plan for retired-ID registry migration."""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path
from typing import Any


sys.dont_write_bytecode = True

SCRIPT_DIR = Path(__file__).resolve().parent
VALIDATOR_PATH = SCRIPT_DIR / "validate-package.py"
UNKNOWN = "POR CONFIRMAR — no inferir"


def load_validator() -> Any:
    spec = importlib.util.spec_from_file_location("refinement_package_validator", VALIDATOR_PATH)
    if not spec or not spec.loader:
        raise RuntimeError(f"Unable to load validator: {VALIDATOR_PATH}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def evidence_for(
    identifier: str, root: Path, files: dict[Path, str], validator: Any
) -> list[str]:
    evidence: list[str] = []
    for path, text in sorted(files.items(), key=lambda item: item[0].as_posix()):
        for number, line in enumerate(text.splitlines(), start=1):
            if identifier not in line or not validator.RETIREMENT_MARKER.search(line):
                continue
            excerpt = re.sub(r"\s+", " ", line.strip()).replace("|", r"\|")
            evidence.append(f"{path.relative_to(root)}:{number} — {excerpt}")
    return evidence


def explicit_status(evidence: list[str]) -> str:
    joined = "\n".join(evidence)
    if re.search(r"\b(?:SUPERSEDED|SUPERCEDID[OA]|SUPERSEDID[OA]|SUSTITUID[OA])\b", joined, re.I):
        return "Sustituido"
    if re.search(r"\b(?:RETIRAD[OA]|RETIRED|NO\s+IMPLEMENTAR)\b", joined, re.I):
        return "Retirado"
    return UNKNOWN


def explicit_date(evidence: list[str]) -> str:
    dates = sorted(set(re.findall(r"\b\d{4}-\d{2}-\d{2}\b", "\n".join(evidence))))
    return dates[0] if len(dates) == 1 else UNKNOWN


def build_plan(root: Path) -> dict[str, Any]:
    validator = load_validator()
    files = validator.read_files(root)
    primary_text = files.get(root / "05-user-stories.md", "")
    records, _spans, registry_errors = validator.retired_identifier_registry(primary_text)
    detected = validator.historical_retired_identifiers(root, files)
    identifiers = sorted(set(records) | detected)

    rows: list[dict[str, Any]] = []
    unresolved: dict[str, list[str]] = {}
    for identifier in identifiers:
        record = records.get(identifier, {})
        evidence = evidence_for(identifier, root, files, validator)
        row = {
            "identifier": identifier,
            "status": record.get("status") or explicit_status(evidence),
            "date": record.get("date") or explicit_date(evidence),
            "previous_behavior": record.get("previous") or UNKNOWN,
            "reason": record.get("reason") or UNKNOWN,
            "current_authority": record.get("authority") or UNKNOWN,
            "evidence": evidence,
        }
        missing = [
            field
            for field in (
                "status",
                "date",
                "previous_behavior",
                "reason",
                "current_authority",
            )
            if row[field] == UNKNOWN
        ]
        if missing:
            unresolved[identifier] = missing
        rows.append(row)

    missing_records = sorted(detected - set(records))
    return {
        "package": root.as_posix(),
        "mode": "read-only",
        "status": "MIGRATION_REQUIRED" if registry_errors or missing_records or unresolved else "READY",
        "registry_errors": registry_errors,
        "missing_registry_identifiers": missing_records,
        "unresolved_fields": unresolved,
        "rows": rows,
    }


def escape_cell(value: str) -> str:
    return value.replace("|", r"\|").replace("\n", " ")


def render_markdown(plan: dict[str, Any]) -> str:
    lines = [
        "# Plan de migración de identificadores retirados",
        "",
        f"- Paquete: `{plan['package']}`",
        "- Modo: solo lectura; no modifica artefactos.",
        f"- Estado: **{plan['status']}**",
        "",
    ]
    if plan["registry_errors"] or plan["missing_registry_identifiers"]:
        lines.extend(["## Brechas detectadas", ""])
        lines.extend(f"- {error}" for error in plan["registry_errors"])
        if plan["missing_registry_identifiers"]:
            lines.append(
                "- IDs sin registro canónico: "
                + ", ".join(f"`{item}`" for item in plan["missing_registry_identifiers"])
            )
        lines.append("")

    lines.extend(
        [
            "## Registro propuesto — requiere revisión humana",
            "",
            "| Identificador | Estado | Fecha | Comportamiento anterior | Razón | Decisión o regla vigente |",
            "|---|---|---|---|---|---|",
        ]
    )
    for row in plan["rows"]:
        lines.append(
            "| "
            + " | ".join(
                escape_cell(str(row[field]))
                for field in (
                    "identifier",
                    "status",
                    "date",
                    "previous_behavior",
                    "reason",
                    "current_authority",
                )
            )
            + " |"
        )

    lines.extend(["", "## Evidencia localizada", ""])
    for row in plan["rows"]:
        lines.append(f"### {row['identifier']}")
        lines.extend(f"- {item}" for item in row["evidence"])
        if not row["evidence"]:
            lines.append("- Sin evidencia explícita localizada; requiere investigación.")
        lines.append("")
    lines.append(
        "No copies filas que contengan `POR CONFIRMAR — no inferir` al registro canónico "
        "hasta que Producto, QA o la fuente citada confirme el valor faltante."
    )
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=Path)
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args()

    root = args.folder.resolve()
    if not root.is_dir():
        print(f"ERROR: package folder does not exist: {root}", file=sys.stderr)
        return 2
    plan = build_plan(root)
    if args.as_json:
        print(json.dumps(plan, ensure_ascii=False, indent=2))
    else:
        print(render_markdown(plan), end="")
    return 1 if plan["status"] == "MIGRATION_REQUIRED" else 0


if __name__ == "__main__":
    raise SystemExit(main())
