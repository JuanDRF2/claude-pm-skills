#!/usr/bin/env python3
"""Merge-specific smoke test: confirms the personal sub-story ID convention (03a/03b)
survived the merge alongside staging's DELTA/MAP additions, and that --decision-checkpoint
works end to end via the CLI."""
from __future__ import annotations

import importlib.util
import subprocess
import sys
import tempfile
from pathlib import Path

VALIDATOR_PATH = Path(sys.argv[1] if len(sys.argv) > 1 else "validate-package.py").resolve()


def load_validator(path: Path):
    spec = importlib.util.spec_from_file_location("validate_package_merged", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    v = load_validator(VALIDATOR_PATH)

    # 1) Personal-only sub-story letter-suffix convention (US-MOS-03a, AC-MOS-03A-01, SC-MOS-03A-01-01)
    assert v.ID_PATTERNS["US"].fullmatch("US-MOS-03a"), "US letter-suffix regex broke in merge"
    assert v.ID_PATTERNS["AC"].fullmatch("AC-MOS-03A-01"), "AC letter-suffix regex broke in merge"
    assert v.ID_PATTERNS["SC"].fullmatch("SC-MOS-03A-01-01"), "SC letter-suffix regex broke in merge"
    assert v.ID_PATTERNS["US"].fullmatch("US-MEM-01"), "plain US IDs must still match"
    print("PASS: sub-story letter-suffix convention (US/AC/SC) intact")

    # 2) Staging-only DELTA/MAP patterns adopted
    assert v.ID_PATTERNS["DELTA"].fullmatch("DELTA-CON-001")
    assert v.ID_PATTERNS["MAP"].fullmatch("MAP-ADDR-01")
    print("PASS: DELTA/MAP ID patterns present")

    # 3) BR now also accepts an optional project-prefix segment, plain BR-01 still works
    assert v.ID_PATTERNS["BR"].fullmatch("BR-01")
    assert v.ID_PATTERNS["BR"].fullmatch("BR-OM-001")
    print("PASS: BR pattern accepts both plain and project-prefixed IDs")

    # 4) no_tracker_mode (personal-only) still skips the Jira-views check
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "jira").mkdir()
        (root / "00-workflow-state.md").write_text(
            "Project status: In progress\nDelivery: pending\nMode: Solo + AI, no tracker\n",
            encoding="utf-8",
        )
        (root / "05-user-stories.md").write_text(
            "### US-MEM-01 — Something\n",
            encoding="utf-8",
        )
        for name in [
            "01-project-understanding.md", "02-rules-and-questions.md", "03-story-map.md",
            "04-release-slices.md", "06-test-coverage.md", "07-functional-test-cases.md",
            "08-traceability-and-risks.md", "09-package-index.md",
        ]:
            (root / name).write_text("placeholder\n", encoding="utf-8")
        (root / "handoffs").mkdir()
        (root / "handoffs" / "dev-handoff.md").write_text("x\n", encoding="utf-8")
        (root / "handoffs" / "qa-handoff.md").write_text("x\n", encoding="utf-8")
        errors, _warnings = v.validate(root, "en", strict=False)
        jira_errors = [e for e in errors if "Jira views" in e]
        assert not jira_errors, f"no_tracker_mode should have suppressed Jira-views check: {jira_errors}"
    print("PASS: personal no_tracker_mode Jira-views skip still works")

    # 5) --decision-checkpoint CLI flag end to end
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
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
        result = subprocess.run(
            [sys.executable, str(VALIDATOR_PATH), str(root), "--language", "en", "--decision-checkpoint"],
            capture_output=True, text=True,
        )
        assert result.returncode == 0, f"--decision-checkpoint CLI failed:\n{result.stdout}\n{result.stderr}"
        assert "OK: 0 errors" in result.stdout
    print("PASS: --decision-checkpoint CLI flag works end to end")

    # 6) Exactly-one-When rule preserved (personal's stricter SC-* check, not staging's relaxed one)
    stories_text = """## US-MEM-01 — Something happens

### AC-MEM-01-01 — Something
**Condición de aceptación:** algo pasa.
#### SC-MEM-01-01 — Two events
**Dado:** contexto
**Cuando:** ocurre A
**Cuando:** ocurre B
**Entonces:** resultado
**Estrategia QA:** x
**Automatización:** Manual
**Nivel recomendado:** UI
**Prioridad:** Alta
**Razón:** x
**Dependencias:** Ninguna
**Estado:** Not started
"""
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "05-user-stories.md").write_text(stories_text, encoding="utf-8")
        files = {root / "05-user-stories.md": stories_text}
        errors, _warnings = v.strict_checks(root, files)
        multi_when_errors = [e for e in errors if "exactly one primary When/Cuando" in e]
        assert multi_when_errors, "merged validator should still flag more than one When per SC-*"
    print("PASS: personal's exactly-one-When strictness preserved in merged strict_checks")

    print("\nALL MERGE-SPECIFIC CHECKS PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
