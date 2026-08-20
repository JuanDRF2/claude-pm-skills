#!/usr/bin/env python3
"""Small deterministic regression suite for validate-package.py."""

from __future__ import annotations

import argparse
import importlib.util
import tempfile
from pathlib import Path


def load_validator(path: Path):
    spec = importlib.util.spec_from_file_location("validate_package", path)
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
    validator = load_validator(args.validator.resolve())

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
