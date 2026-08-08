# Specialist Dispatch Contract

Use before every specialist phase. A specialist is an executable dependency, not optional
background reading.

## Resolution order

1. Invoke the exact specialist name through the host's native skill mechanism.
2. Confirm that the loaded skill frontmatter `name` matches the requested specialist.
3. If native invocation is unavailable, resolve the sibling skill from the installed package
   or registered skill directory and read its complete `SKILL.md`.
4. Never substitute general model knowledge, a similarly named skill, or an improvised
   workflow while claiming compliance.

## Preflight

Before substantive work, establish:

- phase and required specialist;
- resolution method and resolved identity;
- specialist instructions loaded completely;
- required references available;
- required external capability or connector available;
- allowed action and stop condition.

Keep this receipt concise in conversation and record it in workflow state when the phase
can write externally or change an approved artifact.

## Mandatory routing

| Work | Required specialist |
|---|---|
| journey and release mapping | `user-story-mapping` |
| vertical decomposition | `user-story-splitting` |
| stories and acceptance criteria | `user-story` |
| QA coverage and functional cases | `test-case-designer` |
| adversarial quality gate | `refinement-judge` |
| initial native Notion publication | `publish-refinement-to-notion` |
| registered Notion synchronization | `sync-refinement-package-notion` |
| optional Word export | `build-refinement-document` |

## Hard stops

Stop instead of improvising when:

- the required specialist cannot be resolved or read completely;
- a required reference, script, connector, permission or destination is unavailable;
- the specialist preconditions or prior decision gate are not satisfied;
- the requested customization conflicts with an artifact, publication or verification
  contract.

User preferences may select wording, detail and supported presentation choices. They do not
authorize bypassing the specialist, changing canonical IDs or structure, omitting readback,
or claiming an external write succeeded. When a preference conflicts, explain the supported
choices and ask for a decision.

## Notion invariant

Any request that creates or changes the shared refinement in Notion must use
`publish-refinement-to-notion` for initial native publication or
`sync-refinement-package-notion` for a registered project. If the active host has no
compatible Notion connection, generate only the declared pending export and report
`Local draft — publication pending`. Never create a custom substitute and describe it as a
skill-compliant publication.
