#!/usr/bin/env python3
"""Regression tests for Judge snapshots and the Gate C preflight."""

from __future__ import annotations

import importlib.util
import subprocess
import sys
import tempfile
from pathlib import Path


SCRIPT = Path(__file__).resolve().parent / "validate-judge.py"
SPEC = importlib.util.spec_from_file_location("validate_judge", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def write_checkpoint(root: Path, *, complete: bool) -> None:
    fields = [
        "- Last captured decision: BR-TST-01",
        "- Last verified mapping: None",
        "- Rules changed since last gate: None",
        "- Stale stories: None",
        "- Stale acceptance criteria: None",
        "- Stale test artifacts: None",
        "- Unresolved mapping questions: None",
        "- Last incremental validation: Passed",
    ]
    if complete:
        fields.append("- Next reconciliation gate: Gate 2")
    (root / "00-workflow-state.md").write_text(
        "# Workflow state\n\n## Decision Checkpoint\n" + "\n".join(fields) + "\n",
        encoding="utf-8",
    )
    (root / "02-rules-and-questions.md").write_text(
        "# Rules\n\n| ID | Rule | Status |\n|---|---|---|\n"
        "| BR-TST-01 | Preserve approved behavior. | Confirmed |\n",
        encoding="utf-8",
    )


def preflight(root: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(SCRIPT), "preflight", str(root), "--language", "en", "--phase", "gate-c"],
        text=True,
        capture_output=True,
        check=False,
    )


def report_text(*, verdict: str, findings: str, stage: str = "Publication", scope: str = "technical=1; editorial=1") -> str:
    return f"""# Refinement Judge — Test

- Veredicto: {verdict}
- Acción evaluada: Publicar el write set exacto en Notion
- Etapa de acción: {stage}
- Alcance de acción: {scope}
- Snapshot revisado SHA-256: {"a" * 64}

## Resumen ejecutivo

Resultado.

## Alcance y evidencia

Evidencia.

## Hallazgos

{findings}

## Resumen de cobertura

Cobertura.

## Correcciones requeridas

Ninguna.

## Riesgo residual

Controlado.

## Autorización del gate

- Acciones permitidas: Publicación autorizada.
- Acciones bloqueadas: Ninguna adicional.
"""


def validate_report(report: Path, *, publication: bool = False, post_publication: bool = False) -> subprocess.CompletedProcess[str]:
    command = [sys.executable, str(SCRIPT), "report", str(report)]
    if publication:
        command.append("--publication")
    if post_publication:
        command.append("--post-publication")
    return subprocess.run(command, text=True, capture_output=True, check=False)


with tempfile.TemporaryDirectory(prefix="refinement-judge-test-") as folder:
    root = Path(folder)
    write_checkpoint(root, complete=True)
    (root / "14-integration-mappings.md").write_text("# Mappings\n", encoding="utf-8")
    (root / "README.md").write_text("Guidance\n", encoding="utf-8")
    (root / "notes.md").write_text("Notes\n", encoding="utf-8")
    (root / MODULE.JUDGE_REPORT).write_text("Old report\n", encoding="utf-8")
    (root / "jira").mkdir()
    (root / "jira" / "US-TST-01.md").write_text("# Story\n", encoding="utf-8")

    snapshot = {path.relative_to(root).as_posix() for path in MODULE.snapshot_files(root)}
    assert snapshot == {
        "00-workflow-state.md",
        "02-rules-and-questions.md",
        "14-integration-mappings.md",
        "jira/US-TST-01.md",
    }, snapshot

    passed = preflight(root)
    assert passed.returncode == 0, passed.stdout + passed.stderr
    assert "SNAPSHOT_FILES: 4" in passed.stdout, passed.stdout

    write_checkpoint(root, complete=False)
    failed = preflight(root)
    assert failed.returncode != 0, failed.stdout + failed.stderr
    assert "next reconciliation gate" in failed.stdout, failed.stdout

    shared = root / "shared-contract"
    shared.mkdir()
    (shared / "00-workflow-state.md").write_text(
        """# Estado del workflow

- Estado: Aprobado por Producto
- Package kind: `shared-contract`
- Owner project: `payments`
- Consumer projects: `donations`, `memberships`
- Change-impact rule: revisar consumidores antes de sincronizar
""",
        encoding="utf-8",
    )
    (shared / "09-package-index.md").write_text(
        """# Índice

- Estado: Aprobado por Producto
- Tipo: `shared-contract`

## Contenido canónico

- [Estado](./00-workflow-state.md)
- [Contrato](./shared-payment-contract.md)
""",
        encoding="utf-8",
    )
    (shared / "shared-payment-contract.md").write_text(
        """# Contrato compartido

- Estado: Aprobado por Producto

## Autoridad y alcance

Payments gobierna el contrato.

## Paquetes consumidores

- Donations

## Gobierno de cambios

Revisar consumidores.
""",
        encoding="utf-8",
    )
    shared_preflight = subprocess.run(
        [
            sys.executable,
            str(SCRIPT),
            "preflight",
            str(shared),
            "--language",
            "es",
            "--package-kind",
            "shared-contract",
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    assert shared_preflight.returncode == 0, shared_preflight.stdout + shared_preflight.stderr
    assert "SNAPSHOT_FILES: 3" in shared_preflight.stdout, shared_preflight.stdout
    assert "shared-payment-contract.md" in {
        path.relative_to(shared).as_posix()
        for path in MODULE.snapshot_files(shared, "shared-contract")
    }

    report = root / MODULE.JUDGE_REPORT
    report.write_text(
        report_text(
            verdict="PASS CON OBSERVACIONES",
            findings=f"""### JUDGE-TST-001 — Observación controlada

- Severidad: Observation
- Estado: Open
- Bloquea acción: No
- Evidencia: Evidencia localizada.
- Artefactos afectados: Página editorial.
- Consecuencia: Riesgo residual conocido.
- Corrección requerida: Verificar mediante readback.
- Verificación: Pendiente.
""",
        ),
        encoding="utf-8",
    )
    valid_report = validate_report(report, publication=True)
    assert valid_report.returncode == 0, valid_report.stdout + valid_report.stderr

    report.write_text(
        report_text(
            verdict="PASS",
            findings="Sin hallazgos abiertos.",
            scope="technical=2; editorial=1",
        ),
        encoding="utf-8",
    )
    legacy_scope = validate_report(report, publication=True)
    assert legacy_scope.returncode == 0, legacy_scope.stdout + legacy_scope.stderr

    report.write_text(
        report_text(
            verdict="PASS CON OBSERVACIONES",
            findings="Sin hallazgos abiertos.",
        ),
        encoding="utf-8",
    )
    empty_observations = validate_report(report, publication=True)
    assert empty_observations.returncode != 0, empty_observations.stdout
    assert "requires at least one open" in empty_observations.stdout, empty_observations.stdout

    report.write_text(
        report_text(
            verdict="PASS CON OBSERVACIONES",
            findings=f"""### JUDGE-TST-001 — Observación contradictoria

- Severidad: Observation
- Estado: Open
- Bloquea acción: Sí
- Evidencia: Evidencia localizada.
- Artefactos afectados: Página editorial.
- Consecuencia: Gate ambiguo.
- Corrección requerida: Corregir semántica.
- Verificación: Pendiente.
""",
        ),
        encoding="utf-8",
    )
    inconsistent_block = validate_report(report, publication=True)
    assert inconsistent_block.returncode != 0, inconsistent_block.stdout
    assert "inconsistent Severity" in inconsistent_block.stdout, inconsistent_block.stdout

    report.write_text(
        report_text(verdict="PASS", findings="Sin hallazgos abiertos.", stage="Preview"),
        encoding="utf-8",
    )
    preview_only = validate_report(report, publication=True)
    assert preview_only.returncode != 0, preview_only.stdout
    assert "requires Action stage" in preview_only.stdout, preview_only.stdout

    report.write_text(
        report_text(verdict="PASS", findings="Sin hallazgos abiertos.", stage="Post-publication"),
        encoding="utf-8",
    )
    post_publication = validate_report(report, post_publication=True)
    assert post_publication.returncode == 0, post_publication.stdout + post_publication.stderr

    print("OK: Judge project/shared snapshots, publication scopes and verdict regressions passed (12 checks)")
