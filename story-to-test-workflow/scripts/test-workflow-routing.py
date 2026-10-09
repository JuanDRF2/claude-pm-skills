#!/usr/bin/env python3
"""Regression checks for the orchestrator's routing: gates, specialists, references, protected content.

Adapted to this library's single-file SKILL.md. It does NOT assert that build-refinement-document
is absent: the Word and Portal specialists are part of the routing and must stay routed.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT.parent
ENTRY = ROOT / "SKILL.md"

SPECIALISTS = (
    "user-story-mapping",
    "user-story-splitting",
    "user-story",
    "test-case-designer",
    "refinement-judge",
    "build-refinement-portal",
    "build-refinement-document",
    "sync-refinement-package-taxonomy",
)

PROTECTED_MARKERS = (
    "## In Simple Terms",
    "Example invocation",
    "Gate approval log",
    "build-refinement-portal",
    "build-refinement-document",
)

ARTIFACTS = (
    "00-workflow-state.md",
    "01-project-understanding.md",
    "02-rules-and-questions.md",
    "03-story-map.md",
    "04-release-slices.md",
    "05-user-stories.md",
    "06-test-coverage.md",
    "07-functional-test-cases.md",
    "08-traceability-and-risks.md",
    "09-package-index.md",
)

REFERENCES_REQUIRED = (
    "interaction-protocol.md",
    "workflow-state.md",
    "artifact-contract.md",
    "project-context-contract.md",
    "change-impact-contract.md",
    "decision-capture.md",
    "github-source-of-truth-contract.md",
    "specialist-dispatch-contract.md",
    "retired-identifier-contract.md",
)


def require(text: str, value: str, where: str) -> None:
    assert value in text, f"Missing {value!r} in {where}"


def main() -> int:
    entry = ENTRY.read_text(encoding="utf-8")

    require(entry, "one to three", "SKILL.md interaction rules")
    for gate in range(1, 5):
        require(entry, f"Gate {gate}", "SKILL.md decision gates")

    for specialist in SPECIALISTS:
        require(entry, f"`{specialist}`", "specialist dispatch")
        assert (SKILLS / specialist / "SKILL.md").is_file(), f"Specialist skill missing: {specialist}"

    for marker in PROTECTED_MARKERS:
        require(entry, marker, "SKILL.md protected content")

    index = (ROOT / "references" / "INDEX.md").read_text(encoding="utf-8")
    require(index, "Outside This Orchestrator's Scope", "references/INDEX.md")

    for artifact in ARTIFACTS:
        require(entry, artifact, "SKILL.md output contract")

    # Every reference the entry file names must exist, and the core contracts must be routed.
    for owner, name in sorted(set(re.findall(r"(?:([A-Za-z0-9\-]+)/)?references/([A-Za-z0-9_.\-]+\.md)", entry))):
        base = SKILLS / owner if owner and (SKILLS / owner).is_dir() else ROOT
        assert (base / "references" / name).is_file(), f"SKILL.md names missing reference: {owner}/{name}"
    for name in REFERENCES_REQUIRED:
        assert (ROOT / "references" / name).is_file(), f"Missing reference: {name}"
        require(entry, name, "SKILL.md reference routing")

    # Scripts the entry file tells the agent to run must exist.
    for name in sorted(set(re.findall(r"scripts/([A-Za-z0-9_.\-]+\.py)", entry))):
        assert (ROOT / "scripts" / name).is_file(), f"SKILL.md names missing script: {name}"

    print("OK: workflow routing preserves gates, specialists (including Portal and Word), references and protected content")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
