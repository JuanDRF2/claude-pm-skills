# Signal to Ship Integration Map — Slot Model

Every tool in Signal to Ship is a "slot": a typed integration point with an example adapter and documented
alternatives. No specific tool is hardcoded as a dependency.

**Whether a tool is available is never recorded here.** Check at run time with the environment check
(`references/environment-check.md`). With no organization config, the generic slot types below are what the check
looks for: feedback tool, issue tracker, docs platform, source control, analytics.

## Contents

- Signal collection slots
- Product structure slots
- Build and validate slots
- Delivery slots
- Measurement slots
- Orchestration slots
- For other companies

## Slot Registry

### Signal Collection Slots

#### Feedback Tool
- **Type:** Customer feedback, feature requests, voting
- **Example:** Canny (MCP)
- **Key data:** Ideas, votes, user count, company count, MRR, insights, themes, boards
- **Alternatives:** Productboard, UserVoice, Intercom, custom

#### Issue Tracker
- **Type:** Bug tracking, stories, sprints
- **Example:** Jira via an Atlassian MCP server, or Linear
- **Key data:** Bugs with linked support cases, severity, sprint assignment
- **Alternatives:** GitHub Issues, Shortcut, Asana, or the taxonomy's own known-issue records
- **Swappable:** the `issue_tracker` slot picks the adapter (`jira` | `taxonomy_known_issues` | `github_issues` | `linear`). See `references/signal-collection.md`, Step 3.

#### Customer Calls (optional)
- **Type:** Recorded customer and prospect calls
- **Example:** none configured (the orchestrator asks the PM)
- **Key data:** Which clients raised the topic, request vs complaint, link to the recording
- **Alternatives:** any call-recording or meeting-notes tool with an MCP connector

#### Support Cases
- **Type:** Customer support tickets, pain points
- **Example:** CRM support cases, accessed through tracker links
- **Key data:** Case count per feature area, severity, customer impact
- **Alternatives:** Zendesk, Freshdesk, Intercom, HubSpot Service Hub

### Product Structure Slots

#### Product Taxonomy
- **Type:** Feature hierarchy, JTBDs, outcomes, journeys
- **Example:** a taxonomy-system MCP server
- **Optional and off by default** (`taxonomy_sync.enabled: false` in `examples/acme.slot.yaml`); without it the cycle uses tags and the PM maps signals by hand. See `references/slot-configuration.md`, "Enabling the taxonomy slot".
- **Key data:** Products, features, JTBDs, outcomes, journeys, acceptance criteria, scenarios
- **Alternatives:** custom taxonomy, a tagging system

#### Design Reference
- **Type:** Mockup gallery, approved designs
- **Key data:** URL references to approved mockups per feature
- **Alternatives:** Figma, Storybook, Zeroheight, a custom gallery

### Build & Validate Slots

#### Prototype Tool
- **Type:** Clickable prototypes for UX validation
- **Example:** `mockup-builder` (static HTML or JSX), or any prototype tool the organization has
- **Fallback:** a text storyboard the PM builds in any tool (`references/specialist-contracts.md`, prototype-builder)
- **Alternatives:** Figma prototypes (no code needed), v0.dev, Bolt, a custom skill
- **Optional extension:** a design-system gap report, turned on by `prototype_builder.config.ds_gap_report: true`

#### Refinement Workflow
- **Type:** Stories, acceptance criteria, QA coverage, quality gate
- **Example:** story-to-test-workflow plus specialist skills
- **Key data:** Stable IDs (US-/AC-/SC-/CHK-/FTC-), judge verdicts, gate status
- **Fallback:** the compact refinement package and the orchestrator's self-check
- **Alternatives:** custom refinement process, direct story writing

### Delivery Slots

#### Docs Platform
- **Type:** Documentation, specs, release notes
- **Example:** Notion MCP (optional derived view)
- **Key data:** Pages, databases, comments
- **Alternatives:** Confluence, Slite, built-in Markdown preview

#### Source Control
- **Type:** Version control, PRs, CI
- **Example:** GitHub MCP, or the `gh` command line
- **Alternatives:** GitLab, Bitbucket

#### Design Tool
- **Type:** Design files, component inspection
- **Example:** Figma MCP
- **Alternatives:** Sketch, Adobe XD, Penpot

### Measurement Slots

#### Survey Tool
- **Type:** In-app NPS/CSAT/CES surveys per feature
- **Alternatives:** Pendo surveys, Hotjar, Typeform, Delighted, or a custom widget with feature-level targeting

#### Analytics
- **Type:** Product usage tracking, through TestIds (`<feature>-<element>-<type>`)
- **Alternatives:** Amplitude, Mixpanel, PostHog, Heap, Pendo

### Orchestration Slots

#### Knowledge Base
- **Type:** Domain knowledge, portable bundles
- **Alternatives:** a custom RAG store, a documentation repo

#### Prioritization Method
- **Type:** Feature scoring and ranking, in two passes
- **Built in:** six methods (RICE, ICE, WSJF, MoSCoW, Value vs Effort 2x2, Custom) plus a gut check at Light. The PM is always asked which one to use; the config only suggests (`references/priority-calculator.md`).
- **Alternatives:** the `prioritization-scorer` library skill can fill the slot; the PM still chooses the method

## For other companies

To adapt Signal to Ship:
1. Review each slot above
2. Identify your equivalent tool (or decide to skip that slot)
3. Check if an MCP server exists for your tool (many do: Linear, GitHub, etc.)
4. Write your `<org>.slot.yaml` (`references/slot-configuration.md`) or document the manual process
5. Pick the prioritization method that fits your team each time you score; the config can suggest one
