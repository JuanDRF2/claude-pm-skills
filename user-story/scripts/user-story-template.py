#!/usr/bin/env python3
"""Generate a user story Markdown snippet from CLI inputs.

No network access. Prints to stdout.
"""

import argparse
import sys


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a user story with Gherkin-style acceptance criteria.",
    )
    parser.add_argument("--summary", help="Short summary/title for the story.")
    parser.add_argument("--story-id", help="Stable story ID, for example US-MEM-01.")
    parser.add_argument("--persona", help='Persona or role for "As a".')
    parser.add_argument("--action", help='Action for "I want to".')
    parser.add_argument("--outcome", help='Outcome for "so that".')
    parser.add_argument("--scenario", help="Scenario description.")
    parser.add_argument("--criterion-id", help="Stable acceptance-criterion ID.")
    parser.add_argument("--acceptance-condition", help="Plain-language condition for accepting the criterion.")
    parser.add_argument("--scenario-id", help="Stable canonical scenario ID.")
    parser.add_argument("--rules", help="Comma-separated confirmed business-rule IDs.")
    parser.add_argument("--given", action="append", default=[], help="Given precondition (repeatable).")
    parser.add_argument("--when", dest="when", help="When trigger.")
    parser.add_argument("--then", dest="then", help="Then outcome.")
    return parser.parse_args()


def normalize(value: str, placeholder: str) -> str:
    if value and value.strip():
        return value.strip()
    return placeholder


def main() -> int:
    args = parse_args()

    summary = normalize(args.summary, "[Brief, memorable title focused on value]")
    story_id = normalize(args.story_id, "[US-ID]")
    persona = normalize(args.persona, "[persona or role]")
    action = normalize(args.action, "[action user takes to get to outcome]")
    outcome = normalize(args.outcome, "[desired outcome]")
    scenario = normalize(args.scenario, "[Brief, human-readable scenario describing value]")
    criterion_id = normalize(args.criterion_id, "[AC-ID]")
    acceptance_condition = normalize(
        args.acceptance_condition,
        "[One clear product statement describing what must be true]",
    )
    scenario_id = normalize(args.scenario_id, "[SC-ID]")
    rules = normalize(args.rules, "[Confirmed BR IDs]")
    whens = normalize(args.when, "[Event that triggers the action]")
    thens = normalize(args.then, "[Expected outcome]")

    givens = args.given or ["[Initial context or precondition]"]

    print(f"### {story_id} — {summary}\n")
    print(f"- **Summary:** {summary}\n")
    print("#### User story")
    print(f"**As a** {persona}  ")
    print(f"**I want to** {action}  ")
    print(f"**so that** {outcome}\n")
    print("#### Acceptance criteria\n")
    print(f"##### {criterion_id} — {scenario}\n")
    print(f"**Rules:** {rules}\n")
    print(f"**Acceptance condition:** {acceptance_condition}\n")
    print(f"###### {scenario_id} — {scenario}\n")

    for index, given in enumerate(givens):
        label = "Given" if index == 0 else "And"
        print(f"**{label}:** {given}  ")

    print(f"**When:** {whens}  ")
    print(f"**Then:** {thens}\n")
    print("**QA strategy:**\n")
    print("- **Executability:** [Ready/Needs refinement/Blocked — reason]")
    print("- **Automation:** [Automate now/Automate later/Manual/Blocked]")
    print("- **Recommended level:** [Unit/Component/API/Integration/E2E/Manual/To define]")
    print("- **Priority:** [High/Medium/Low/To define]")
    print("- **Rationale:** [Why]")
    print("- **Dependencies:** [Controlled data/environment/evidence or None]")
    print("- **Automated coverage:** [Not started/Planned/Implemented]")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
