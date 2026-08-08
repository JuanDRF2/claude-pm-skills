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
