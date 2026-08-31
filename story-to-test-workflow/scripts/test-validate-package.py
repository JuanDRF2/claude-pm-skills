#!/usr/bin/env python3
"""Small deterministic regression suite for validate-package.py."""

from __future__ import annotations

import argparse
import importlib.util
import tempfile
from pathlib import Path


def load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load validator: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--validator",
        type=Path,
        default=Path(__file__).with_name("validate-package.py"),
    )
    parser.add_argument("--real-package", type=Path)
    parser.add_argument("--language", choices=("es", "en"), default="es")
    args = parser.parse_args()
    validator = load_module(args.validator.resolve(), "validate_package")

    text = """
| BR-01 | Legacy rule |
| BR-OM-001 | Namespaced rule |
### AC-OM-01-01 — Observable behavior
**Condición de aceptación:** se conserva el resultado.
#### SC-OM-01-01 — Resultado
**Dado:** un contexto
**Cuando:** ocurre el evento
**Entonces:** se observa el resultado
"""
    with tempfile.TemporaryDirectory() as temporary:
        source = Path(temporary) / "rules.md"
        source.write_text(text, encoding="utf-8")
        files = {source: text}
        assert validator.definitions(files, "BR") == {"BR-01", "BR-OM-001"}
        assert set(validator.ID_PATTERNS["BR"].findall(text)) == {"BR-01", "BR-OM-001"}
        assert "AC-OM-01-01" in validator.acceptance_blocks(text)
        assert validator.RANGE_PATTERN.search("BR-OM-001–BR-OM-003")

    # Retired headings never inherit or replace the next active AC block.
    retired_then_active = """
## US-EXT-02 — Aplicar un código

### ~~AC-EXT-02-04~~ — RETIRADO — Elegibilidad
**Condición de aceptación:** no implementar.

### AC-EXT-02-03 — Registrar la extensión
**Condición de aceptación:** el sistema registra la extensión aplicada.
#### SC-EXT-02-04 — Guardar cero sin extensión
**Dado:** una compra sin meses adicionales
**Cuando:** se confirma la compra
**Entonces:** la extensión registrada es cero
"""
    blocks = validator.acceptance_blocks(retired_then_active)
    assert set(blocks) == {"AC-EXT-02-03"}, blocks
    assert "SC-EXT-02-04" in validator.scenario_blocks(retired_then_active)
    for marker in ("RETIRED", "SUPERSEDED", "SUPERCEDIDO", "NO IMPLEMENTAR"):
        marked = retired_then_active.replace(
            "~~AC-EXT-02-04~~ — RETIRADO", f"AC-EXT-02-04 — {marker}"
        )
        assert "AC-EXT-02-04" not in validator.acceptance_blocks(marked)

    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        (root / "05-user-stories.md").write_text(
            retired_then_active, encoding="utf-8"
        )
        errors, _records = validator.retired_identifier_checks(
            root, validator.read_files(root)
        )
        assert any("missing from the canonical registry" in error for error in errors)

        (root / "05-user-stories.md").write_text(
            retired_then_active.replace("## US-EXT-02", "# US-EXT-02"),
            encoding="utf-8",
        )
        strict_errors, strict_warnings = validator.strict_checks(
            root, validator.read_files(root)
        )
        assert not any("level-two ## US-* heading" in error for error in strict_errors)
        assert any(
            "level-two ## US-* heading" in warning for warning in strict_warnings
        )

    # The canonical registry preserves retired IDs outside active stories. AC and SC
    # namespaces remain independent even when their numeric suffixes match.
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        (root / "jira").mkdir()
        stories = """# Historias

## Registro de identificadores retirados

| Identificador | Estado | Fecha | Comportamiento anterior | Razón | Decisión o regla vigente |
|---|---|---|---|---|---|
| AC-EXT-02-04 | Retirado | 2026-08-26 | El código se rechazaba por elegibilidad. | La elegibilidad salió del alcance. | BR-EXT-04: el código aplica siempre. |

## US-EXT-02 — Aplicar un código

### Historia
**Como** responsable de membresías
**quiero** aplicar el código
**para** completar la compra.

### AC-EXT-02-03 — Registrar la extensión
**Condición de aceptación:** el sistema registra la extensión aplicada.
#### SC-EXT-02-04 — Guardar cero sin extensión
**Dado:** una compra sin meses adicionales
**Cuando:** se confirma la compra
**Entonces:** la extensión registrada es cero
"""
        jira = """# US-EXT-02 — Aplicar un código

### Historia
**Como** responsable de membresías
**quiero** aplicar el código
**para** completar la compra.

### AC-EXT-02-03 — Registrar la extensión
**Condición de aceptación:** el sistema registra la extensión aplicada.
#### SC-EXT-02-04 — Guardar cero sin extensión
**Dado:** una compra sin meses adicionales
**Cuando:** se confirma la compra
**Entonces:** la extensión registrada es cero
"""
        traceability = """# Trazabilidad

## Trazabilidad activa

| Criterio | Escenario |
|---|---|
| AC-EXT-02-03 | SC-EXT-02-04 |

## Historial retirado — no implementar

| Criterio | Estado |
|---|---|
| AC-EXT-02-04 | Retirado |
"""
        (root / "05-user-stories.md").write_text(stories, encoding="utf-8")
        (root / "jira/US-EXT-02.md").write_text(jira, encoding="utf-8")
        (root / "08-traceability-and-risks.md").write_text(
            traceability, encoding="utf-8"
        )
        files = validator.read_files(root)
        errors, records = validator.retired_identifier_checks(root, files)
        assert not errors, "\n".join(errors)
        assert set(records) == {"AC-EXT-02-04"}
        assert set(validator.acceptance_blocks(stories)) == {"AC-EXT-02-03"}
        assert set(validator.scenario_blocks(stories)) == {"SC-EXT-02-04"}

        # Jira contains active behavior only; adding the retired AC must fail.
        (root / "jira/US-EXT-02.md").write_text(
            jira + "\nRetired reference: AC-EXT-02-04\n", encoding="utf-8"
        )
        errors, _records = validator.retired_identifier_checks(
            root, validator.read_files(root)
        )
        assert any("active delivery artifact" in error for error in errors), errors

        # A retired ID cannot be defined again as active behavior.
        reused = stories.replace(
            "### AC-EXT-02-03 — Registrar la extensión",
            "### AC-EXT-02-04 — Comportamiento reutilizado",
        )
        (root / "05-user-stories.md").write_text(reused, encoding="utf-8")
        (root / "jira/US-EXT-02.md").write_text(jira, encoding="utf-8")
        errors, _records = validator.retired_identifier_checks(
            root, validator.read_files(root)
        )
        assert any("reused by active behavior" in error for error in errors), errors

        # A struck-through retired criterion inside a US block fails even when its
        # historical record exists.
        embedded = stories.replace(
            "### AC-EXT-02-03 — Registrar la extensión",
            "### ~~AC-EXT-02-04~~ — RETIRADO\n\n"
            "### AC-EXT-02-03 — Registrar la extensión",
        )
        (root / "05-user-stories.md").write_text(embedded, encoding="utf-8")
        errors, _records = validator.retired_identifier_checks(
            root, validator.read_files(root)
        )
        assert any("must not remain" in error for error in errors), errors
        strict_errors, _warnings = validator.strict_checks(
            root, validator.read_files(root)
        )
        assert any("must not remain" in error for error in strict_errors), strict_errors

        # Active traceability cannot count the retired criterion.
        (root / "05-user-stories.md").write_text(stories, encoding="utf-8")
        (root / "08-traceability-and-risks.md").write_text(
            traceability.replace(
                "| AC-EXT-02-03 | SC-EXT-02-04 |",
                "| AC-EXT-02-04 | SC-EXT-02-04 |",
            ),
            encoding="utf-8",
        )
        errors, _records = validator.retired_identifier_checks(
            root, validator.read_files(root)
        )
        assert any("active traceability" in error for error in errors), errors

    # Every canonical retired record requires lifecycle evidence. Legacy tables report
    # one grouped migration error rather than one disconnected error per column.
    incomplete_registry = """# Historias

## Registro de identificadores retirados

| Identificador | Estado | Fecha | Comportamiento anterior | Decisión vigente |
|---|---|---|---|---|
| AC-EXT-02-04 | Retirado | 2026-08-26 | Comportamiento anterior. | BR-EXT-04. |
"""
    _records, _spans, registry_errors = validator.retired_identifier_registry(
        incomplete_registry
    )
    assert registry_errors == [
        "MIGRATION_REQUIRED: retired identifier registry uses a legacy schema; "
        "missing columns: reason."
    ], registry_errors

    fixture = Path(__file__).parent / "fixtures/retired-registry-legacy.md"
    fixture_records, _fixture_spans, fixture_errors = (
        validator.retired_identifier_registry(fixture.read_text(encoding="utf-8"))
    )
    assert set(fixture_records) == {"AC-EXT-01-02", "AC-EXT-02-04"}
    assert fixture_errors == [
        "MIGRATION_REQUIRED: retired identifier registry uses a legacy schema; "
        "missing columns: status, date, reason."
    ], fixture_errors

    # The migration planner is read-only, preserves available evidence and marks every
    # unsupported value for confirmation instead of inventing it.
    planner = load_module(
        Path(__file__).with_name("plan-retired-id-migration.py"),
        "plan_retired_id_migration",
    )
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        (root / "05-user-stories.md").write_text(
            fixture.read_text(encoding="utf-8"), encoding="utf-8"
        )
        (root / "00-workflow-state.md").write_text(
            "## Identificadores retirados\n\n"
            "| ID | Estado |\n|---|---|\n"
            "| SC-EXT-01-02 | Retirado el 2026-08-21. |\n",
            encoding="utf-8",
        )
        plan = planner.build_plan(root)
        assert plan["status"] == "MIGRATION_REQUIRED"
        assert plan["missing_registry_identifiers"] == ["SC-EXT-01-02"]
        rows = {row["identifier"]: row for row in plan["rows"]}
        assert rows["AC-EXT-01-02"]["date"] == "2026-08-21"
        assert rows["AC-EXT-01-02"]["reason"] == planner.UNKNOWN
        assert rows["SC-EXT-01-02"]["previous_behavior"] == planner.UNKNOWN

    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        state = """
## Decision Checkpoint
- Last captured decision: BR-99
- Last verified mapping: MAP-ADDR-01
- Rules changed since last gate: BR-99
- Stale stories: US-CON-02
- Stale acceptance criteria: None
- Stale test artifacts: None
- Unresolved mapping questions: Q-04
- Last incremental validation: Pending
- Next reconciliation gate: Gate 3
"""
        rules = """
| BR-99 | Bilateral sync uses MAP-ADDR-01. | User | Product | Confirmed | Address |

### MAP-ADDR-01 — Address mapping
- Canonical field: `Household.shared_address`
- Provider: Salesforce NPSP
- External field: `Account.BillingAddress`
- Direction: Bilateral
- Transformation: Component mapping
- Conditions: Contact inherits
- Propagation: Household members
- Exclusions: Overridden contacts
- Unsupported behavior: Preserve canonical value
- Conflict policy: Q-04 — Deferred
- Observability: Integration issue
- Traceability: BR-99
"""
        (root / "00-workflow-state.md").write_text(state, encoding="utf-8")
        (root / "02-rules-and-questions.md").write_text(rules, encoding="utf-8")
        files = validator.read_files(root)
        errors, warnings = validator.decision_checkpoint_checks(root, files)
        assert not errors, "\n".join(errors)
        assert not warnings, "\n".join(warnings)

        broken_rules = rules.replace("MAP-ADDR-01. |", "the household. |", 1)
        (root / "02-rules-and-questions.md").write_text(broken_rules, encoding="utf-8")
        errors, _warnings = validator.decision_checkpoint_checks(
            root, validator.read_files(root)
        )
        assert any("BR-99" in error and "MAP-*" in error for error in errors)

    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        english_story = """
## US-LOGIN-01 — Access onboarding

### AC-LOGIN-01-01 — Access onboarding
**Acceptance condition:** the trial user enters onboarding without another password.
#### SC-LOGIN-01-01 — Sign in with Google
**Given:** a trial user is on the login page
**When:** the user authorizes Google sign-in
**Then:** the user enters the onboarding flow
#### QA Strategy
**Executability:** Needs refinement
**Automation:** Manual
**Recommended level:** E2E
**Priority:** Medium
**Rationale:** external identity dependency
**Dependencies:** controlled Google account
**Automated coverage:** Not started
"""
        (root / "05-user-stories.md").write_text(english_story, encoding="utf-8")
        errors, _warnings = validator.strict_checks(root, validator.read_files(root))
        assert not any("canonical QA strategy" in error for error in errors), "\n".join(errors)

    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        incomplete = """
## US-PAY-01 — Reintentar un cobro

### AC-PAY-01-01 — Cobro
**Condición de aceptación:** se cobra una cuota.
#### SC-PAY-01-01 — Reintento programado
**Dado**: una cuota vencida
**Cuando**: llega la siguiente fecha programada
**Entonces**: se intenta el pago
**Ejecutabilidad:** Ready
#### Estrategia QA
**Automatización:** Automate now
**Nivel recomendado:** Integration
**Prioridad:** High
**Razón:** riesgo financiero
**Dependencias:** proveedor
**Estado:** Not started
"""
        (root / "05-user-stories.md").write_text(incomplete, encoding="utf-8")
        errors, _warnings = validator.strict_checks(root, validator.read_files(root))
        assert any("concrete execution contract" in error for error in errors)

        assert any("cannot use Automate now" in error for error in errors)

        no_readiness = incomplete.replace(
            "**Ejecutabilidad:** Ready\n",
            "**Ejemplo controlado:** pago de USD 20.\n",
        )
        (root / "05-user-stories.md").write_text(no_readiness, encoding="utf-8")
        errors, _warnings = validator.strict_checks(root, validator.read_files(root))
        assert any("without Executability: Ready" in error for error in errors)

        permission_risk = (
            incomplete.replace("Cobro", "Permisos")
            .replace("se cobra una cuota", "se modifica el acceso")
            .replace("Reintento programado", "Cambiar permisos de identidad")
            .replace("una cuota vencida", "un usuario sin privilegios")
            .replace("llega la siguiente fecha programada", "un administrador asigna un permiso")
            .replace("se intenta el pago", "el acceso queda autorizado")
            .replace("**Prioridad:** High", "**Prioridad:** Medium")
            .replace("riesgo financiero", "riesgo de acceso")
            .replace("proveedor", "directorio")
        )
        (root / "05-user-stories.md").write_text(permission_risk, encoding="utf-8")
        errors, _warnings = validator.strict_checks(root, validator.read_files(root))
        assert any("concrete execution contract" in error for error in errors)

        complete = incomplete.replace(
            "**Ejecutabilidad:** Ready",
            """**Ejecutabilidad:** Ready
**Ejemplo controlado:** cuota de enero por USD 20; fecha programada 2026-02-01.
**Estado inicial:** Payment de enero Overdue con saldo USD 20.
**Resultado controlado:** el proveedor aprueba el intento de enero.
**Evidencia observable:** Payment pagado y una Transaction por USD 20 con correlación.
**Cobertura de combinaciones:** anterior pagada/actual pagada; anterior fallida/actual pagada; ambas fallidas.""",
        )
        (root / "05-user-stories.md").write_text(complete, encoding="utf-8")
        errors, _warnings = validator.strict_checks(root, validator.read_files(root))
        assert not any("SC-PAY-01-01" in error for error in errors), "\n".join(errors)

        spanish_without_mapping = broken_rules.replace(
            "Bilateral sync uses the household.",
            "La dirección se sincroniza y se propaga al household.",
        )
        (root / "02-rules-and-questions.md").write_text(
            spanish_without_mapping, encoding="utf-8"
        )
        errors, _warnings = validator.decision_checkpoint_checks(
            root, validator.read_files(root)
        )
        assert any("BR-99" in error and "MAP-*" in error for error in errors)

    # Split canonical story volumes must remain authoritative for Jira-derived views.
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        (root / "jira").mkdir()
        (root / "05-user-stories.md").write_text("# Índice de historias\n", encoding="utf-8")
        split_story = """
## US-HH-01 — Sincronizar teléfono

### Historia
**Como** responsable de datos
**quiero** sincronizar el teléfono
**para** conservar un contacto vigente.

### AC-HH-01-01 — Campo protegido
**Condición de aceptación:** el sistema conserva `Account.Phone` como campo de negocio.
#### SC-HH-01-01 — Sincronización
**Dado:** un contacto con teléfono conocido
**Cuando:** se sincroniza el contacto
**Entonces:** se conserva el teléfono en `Account.Phone`
#### Estrategia QA
**Ejecutabilidad:** Needs refinement
**Automatización:** Manual
**Nivel recomendado:** Integration
**Prioridad:** Medium
**Razón:** integración externa
**Dependencias:** cuenta controlada
**Estado:** Not started
"""
        volume = root / "05-user-stories-contact-points.md"
        volume.write_text(split_story, encoding="utf-8")
        jira = root / "jira" / "US-HH-01.md"
        jira.write_text(split_story.replace("`Account.Phone`", "Account.Phone"), encoding="utf-8")
        errors, _warnings = validator.strict_checks(root, validator.read_files(root))
        assert any("Jira/master acceptance criterion differs" in error for error in errors)

        jira.write_text(split_story, encoding="utf-8")
        errors, _warnings = validator.strict_checks(root, validator.read_files(root))
        assert not any("Jira/master acceptance criterion differs" in error for error in errors)

        jira.write_text(
            """# US-HH-01 — Sincronizar teléfono

### Historia
**Como** responsable de datos
**quiero** sincronizar el teléfono
**para** conservar un contacto vigente.

AC-HH-01-01; SC-HH-01-01. Consulta el paquete canónico.
""",
            encoding="utf-8",
        )
        errors, _warnings = validator.strict_checks(root, validator.read_files(root))
        assert any(
            "missing canonical acceptance criterion behavior" in error for error in errors
        ), errors
        assert any("missing canonical scenario behavior" in error for error in errors), errors

    # Journey Integrity composes atomic scenarios without inventing another ID namespace.
    complete_journey = """
## FTC-MEM-01 — Comprar una membresía

- **Historias:** US-MEM-01
- **Prioridad/Riesgo:** Critical
- **Integridad del recorrido:** Required — compra, pago y activación relacionados

### Composición del recorrido

- **Acción de entrada:** la persona confirma la compra.
- **Resultado visible:** la compra queda confirmada y la membresía activa.
- **Condición final:** el procesamiento informa finalización confirmada.
- **Consistencia posterior:** existe un pago y una membresía relacionados, sin duplicados.
- **Escenarios que lo componen:** SC-MEM-01-01, SC-MEM-01-02
- **Validación de extremo a extremo:** E2E del camino principal.
- **Independencia de escenarios:** cada escenario crea su propio comprador y estado inicial.
- **Evidencia autorizada:** confirmación visible y consulta interna permitida.
- **Riesgo residual:** las variaciones de cálculo se cubren por API.
"""
    errors, warnings = validator.journey_integrity_checks(
        complete_journey, "## Revisión de integridad del recorrido\n"
    )
    assert not errors, "\n".join(errors)
    assert not warnings, "\n".join(warnings)

    incomplete_journey = complete_journey.replace(
        "- **Consistencia posterior:** existe un pago y una membresía relacionados, sin duplicados.\n",
        "",
    )
    errors, _warnings = validator.journey_integrity_checks(
        incomplete_journey, "## Revisión de integridad del recorrido\n"
    )
    assert any("downstream consistency" in error for error in errors), errors

    blocked_without_owner = complete_journey.replace(
        "E2E del camino principal.", "Blocked — falta ambiente."
    )
    errors, _warnings = validator.journey_integrity_checks(
        blocked_without_owner, "## Revisión de integridad del recorrido\n"
    )
    assert any("owner/responsable" in error for error in errors), errors

    downstream_without_reason = complete_journey.replace(
        "existe un pago y una membresía relacionados, sin duplicados.", "Not applicable."
    )
    errors, _warnings = validator.journey_integrity_checks(
        downstream_without_reason, "## Revisión de integridad del recorrido\n"
    )
    assert any("downstream consistency" in error for error in errors), errors

    residual_without_basis = complete_journey.replace(
        "las variaciones de cálculo se cubren por API.", "None"
    )
    errors, _warnings = validator.journey_integrity_checks(
        residual_without_basis, "## Revisión de integridad del recorrido\n"
    )
    assert any("no residual risk" in error for error in errors), errors

    isolated_without_reason = complete_journey.replace(
        "Required — compra, pago y activación relacionados", "Not applicable"
    )
    errors, _warnings = validator.journey_integrity_checks(
        isolated_without_reason, "## Revisión de integridad del recorrido\n"
    )
    assert any("without a meaningful reason" in error for error in errors), errors

    undeclared_critical = complete_journey.replace(
        "- **Integridad del recorrido:** Required — compra, pago y activación relacionados\n",
        "",
    )
    errors, warnings = validator.journey_integrity_checks(undeclared_critical, "")
    assert not errors, errors
    assert any("critical journey candidate" in warning for warning in warnings), warnings
    assert any("no Journey Integrity review" in warning for warning in warnings), warnings

    # Clarity checks must inspect split story volumes and flag incomplete scenario prose.
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        (root / "05-user-stories.md").write_text("# Índice\n", encoding="utf-8")
        (root / "05-user-stories-manual-payments.md").write_text(
            """
## US-PAY-01 — Registrar un pago manual

### AC-PAY-01-01 — Completar el pago
**Condición de aceptación:** el pago manual queda registrado después de la confirmación.
#### SC-PAY-01-01 — Confirmar un cheque
**Dado:** Check seleccionado
**Cuando:** responde Yes y guarda
**Entonces:** Payment queda Paid y Contribution Closed Won.
#### Estrategia QA
**Ejecutabilidad:** Needs refinement
**Automatización:** Manual
**Nivel recomendado:** E2E
**Prioridad:** Medium
**Razón:** falta contexto funcional
**Dependencias:** decisión de Producto
**Estado:** Not started
""",
            encoding="utf-8",
        )
        _errors, warnings = validator.strict_checks(root, validator.read_files(root))
        assert any("fragmentary Given" in warning for warning in warnings), warnings
        assert any("without naming the question" in warning for warning in warnings), warnings
        assert any("only internal records or statuses" in warning for warning in warnings), warnings

    # A shared contract has a smaller explicit contract; project mode must stay strict.
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        (root / "00-workflow-state.md").write_text(
            """# Estado del workflow — Contrato compartido

- Estado: Aprobado por Producto
- Package kind: `shared-contract`
- Owner project: `payments`
- Consumer projects: `donations`, `memberships`
- Change-impact rule: revisar consumidores antes de sincronizar
""",
            encoding="utf-8",
        )
        (root / "shared-payment-contract.md").write_text(
            """# Contrato compartido de pagos

- Estado: Aprobado por Producto

## Autoridad y alcance

El proyecto Payments gobierna este contrato.

## Paquetes consumidores

- Donations
- Memberships

## Gobierno de cambios

Revisar ambos consumidores antes de publicar.
""",
            encoding="utf-8",
        )
        (root / "09-package-index.md").write_text(
            """# Índice del paquete

- Estado: Aprobado por Producto
- Tipo: `shared-contract`

## Contenido canónico

- [Estado](./00-workflow-state.md)
- [Contrato](./shared-payment-contract.md)
""",
            encoding="utf-8",
        )
        errors, warnings = validator.validate(
            root, "es", strict=True, package_kind="shared-contract"
        )
        assert not errors, "\n".join(errors)
        assert not warnings, "\n".join(warnings)

        project_errors, _warnings = validator.validate(root, "es", strict=True)
        assert any("Missing expected artifact" in error for error in project_errors)

        (root / "09-package-index.md").write_text(
            "# Índice del paquete\n\n- Estado: Aprobado por Producto\n- Tipo: `shared-contract`\n",
            encoding="utf-8",
        )
        errors, _warnings = validator.validate(
            root, "es", strict=True, package_kind="shared-contract"
        )
        assert any("does not link canonical shared contract" in error for error in errors)

    # Taxonomy remains optional for legacy packages, but an explicit required declaration
    # needs the cross-reference.
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        (root / "00-workflow-state.md").write_text(
            "## Workflow State\n- Project status: Active\n- Delivery status: Gate 4\n",
            encoding="utf-8",
        )
        errors, warnings = validator.taxonomy_alignment_checks(root, validator.read_files(root))
        assert not errors and not warnings
        (root / "00-workflow-state.md").write_text(
            "## Taxonomy Alignment State\n"
            "- Taxonomy required / Taxonomy requerido: Yes\n"
            "- Handoff policy / Política de handoff: Verified required\n"
            "- MCP capability / Capacidad MCP: Available\n"
            "- Mapping path / Ruta del mapping: integrations/taxonomy-mapping.md\n"
            "- Mapping status / Estado del mapping: Verified\n"
            "- Last remote evidence / Última evidencia remota: receipt-taxonomy-2026-08-27.json\n"
            "- Owner / Responsable: Product\n"
            "- Handoff consequence / Consecuencia para el handoff: Ready when verified\n",
            encoding="utf-8",
        )
        errors, _warnings = validator.taxonomy_alignment_checks(root, validator.read_files(root))
        assert errors == ["Taxonomy is required but integrations/taxonomy-mapping.md is missing."]

    # A Verified mapping covers each active story-family ID and cannot define those IDs by
    # merely mentioning them in the cross-reference.
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        (root / "integrations").mkdir()
        (root / "00-workflow-state.md").write_text(
            "## Taxonomy Alignment State\n"
            "- Taxonomy required / Taxonomy requerido: Yes\n"
            "- Handoff policy / Política de handoff: Verified required\n"
            "- MCP capability / Capacidad MCP: Available\n"
            "- Mapping path / Ruta del mapping: integrations/taxonomy-mapping.md\n"
            "- Mapping status / Estado del mapping: Verified\n"
            "- Last remote evidence / Última evidencia remota: receipt-taxonomy-2026-08-27.json\n"
            "- Owner / Responsable: Product\n"
            "- Handoff consequence / Consecuencia para el handoff: Ready when verified\n",
            encoding="utf-8",
        )
        stories = """# Stories

## US-QM-01 — Comprar membresía
### AC-QM-01-01 — Confirmar compra
**Condición de aceptación:** se muestra la confirmación.
#### SC-QM-01-01-01 — Compra aprobada
**Dado:** un comprador con una membresía seleccionada
**Cuando:** confirma un pago aprobado
**Entonces:** observa la membresía confirmada
"""
        mapping = """# Taxonomy Mapping

- Project / Proyecto: Quick Membership
- Status / Estado: Approved
- Last updated / Última actualización: 2026-08-27
- Approved through / Aprobado hasta: Gate 5
- Taxonomy required / Taxonomy requerido: Yes
- Mapping status / Estado del mapping: Verified
- Owner / Responsable: Product
- Taxonomy environment / Entorno de taxonomy: Production
- Last verified / Última verificación: 2026-08-27
- Evidence / Evidencia: receipt-taxonomy-2026-08-27.json
- Source commit / Commit de origen: 1234567abcdef

## Product and Feature / Producto y feature
- Product: PRD-022 — Membership
- Feature: FEA-137 — Membership Sales

## Stories and journeys / Historias y journeys
| Package story | Taxonomy journey | JTBD | Channel | Outcomes | Status or gap |
|---|---|---|---|---|---|
| US-QM-01 | JRN-0502 | JTB-0414 | Back office | OUT-0912 | Verified |

## Acceptance criteria / Criterios de aceptación
| Package criterion | Taxonomy criterion | Journey | Status or gap |
|---|---|---|---|
| AC-QM-01-01 | ACR-1475 | JRN-0502 | Verified |

## Scenarios / Escenarios
| Package scenario | Taxonomy scenario | Taxonomy criterion | Status or gap |
|---|---|---|---|
| SC-QM-01-01-01 | SCN-2041 | ACR-1475 | Verified |

## Unmapped, deferred or not applicable / Sin mapear, diferido o no aplicable
| Package ID | Type | Status | Reason | Owner | Target |
|---|---|---|---|---|---|
"""
        (root / "05-user-stories.md").write_text(stories, encoding="utf-8")
        mapping_path = root / "integrations/taxonomy-mapping.md"
        mapping_path.write_text(mapping, encoding="utf-8")
        files = validator.read_files(root)
        errors, warnings = validator.taxonomy_alignment_checks(root, files)
        assert not errors, "\n".join(errors)
        assert not warnings, "\n".join(warnings)
        assert validator.definitions(files, "US") == {"US-QM-01"}

        mapping_path.write_text(
            mapping.replace("| SC-QM-01-01-01 | SCN-2041 | ACR-1475 | Verified |", "")
            .replace("| Back office |", "| Email |"),
            encoding="utf-8",
        )
        errors, _warnings = validator.taxonomy_alignment_checks(root, validator.read_files(root))
        assert any("invalid channel" in error for error in errors), errors
        assert any("does not address" in error and "SC-QM-01-01-01" in error for error in errors), errors

        mapping_path.write_text(
            mapping.replace("Mapping status / Estado del mapping: Verified", "Mapping status / Estado del mapping: Draft")
            .replace("| SC-QM-01-01-01 | SCN-2041 | ACR-1475 | Verified |", ""),
            encoding="utf-8",
        )
        state_path = root / "00-workflow-state.md"
        state_path.write_text(
            state_path.read_text(encoding="utf-8").replace(
                "Mapping status / Estado del mapping: Verified",
                "Mapping status / Estado del mapping: Draft",
            ),
            encoding="utf-8",
        )
        errors, warnings = validator.taxonomy_alignment_checks(root, validator.read_files(root))
        assert not errors, "\n".join(errors)
        assert any("does not address" in warning for warning in warnings), warnings

    if args.real_package:
        errors, _warnings = validator.validate(
            args.real_package.resolve(),
            args.language,
            strict=True,
        )
        assert not errors, "\n".join(errors)

    print("OK: validator regression checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
