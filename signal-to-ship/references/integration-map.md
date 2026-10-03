# Signal to Ship Integration Map — Slot Model

Every tool in Signal to Ship is a "slot": a typed integration point with a default adapter and documented alternatives. No specific tool is hardcoded as a dependency.

## Slot Registry

### Signal Collection Slots

#### Feedback Tool
- **Type:** Customer feedback, feature requests, voting
- **Acme default:** Canny (MCP, 60+ tools)
- **Status:** ✅ Connected
- **Key data:** Ideas (150 total), Votes, User count, Company count, MRR, Insights, Themes (5), Boards (8: Feature Request, Billing, Onboarding, Mobile, Integrations, Reporting, API, Support)
- **Alternatives:** Productboard, UserVoice, Intercom, custom

#### Issue Tracker
- **Type:** Bug tracking, stories, sprints
- **Acme default:** Jira via Atlassian Rovo MCP (being phased out)
- **Status:** ✅ Connected
- **Key data:** Bugs with linked support cases (customfield_XXXXX), severity, sprint assignment
- **Alternatives:** Linear, GitHub Issues, Shortcut, Asana, or the taxonomy's own known-issue records
- **Swappable:** the `issue_tracker` slot picks the adapter (`jira` | `taxonomy_known_issues` | ...). See `references/signal-collection.md`, Step 3.

#### Customer Calls (optional)
- **Type:** Recorded customer and prospect calls
- **Acme default:** none configured (the orchestrator asks the PM)
- **Status:** ⚪ Optional
- **Key data:** Which clients raised the topic, request vs complaint, link to the recording
- **Alternatives:** any call-recording or meeting-notes tool with an MCP connector

#### Support Cases
- **Type:** Customer support tickets, pain points
- **Acme default:** CRM support cases (accessed via Jira links)
- **Status:** ✅ Connected
- **Key data:** Case count per feature area, severity, customer impact
- **Alternatives:** Zendesk, Freshdesk, Intercom, HubSpot Service Hub

### Product Structure Slots

#### Product Taxonomy
- **Type:** Feature hierarchy, JTBDs, outcomes, journeys
- **Acme default:** taxonomy-system MCP (taxonomy.acme.example)
- **Status:** Optional. Off by default (`taxonomy_sync.enabled: false` in `examples/acme.slot.yaml`); without it the cycle uses tags and the PM maps signals by hand. See `references/slot-configuration.md`, "Enabling the taxonomy slot".
- **Key data:** Products, Features, JTBDs, Outcomes, Journeys, ACs, Scenarios (7-level model)
- **Alternatives:** Custom taxonomy, Signal to Ship built-in (future), tagging system

#### Design Reference
- **Type:** Mockup gallery, approved designs
- **Acme default:** Design Hub (acme-design-hub.example.app)
- **Status:** ✅ Deployed
- **Key data:** URL references to approved mockups per feature
- **Alternatives:** Figma, Storybook, Zeroheight, custom gallery

### Build & Validate Slots

#### Prototype Tool
- **Type:** Clickable prototypes for UX validation
- **Acme default:** /prototype skill (AcmeFrontend repo)
- **Status:** ✅ Active
- **How it works:** PM describes in plain English → Claude builds with real design system → deploys to ephemeral URL (proto-N-app.eph.acme.example)
- **Technical details:** A skill in the frontend repo that scaffolds a route inside a dedicated sandbox area, using the org's own app structure and design system, deployed to a short-lived preview environment. Turnaround from prompt to a live URL is on the order of minutes, not hours.
- **Portability notes:** Tightly coupled to AcmeFrontend repo structure, design system, and AWS preview infra. Another company would need: their own frontend repo with a sandbox area, a design system (or generic like Shadcn), and preview deployment (Vercel previews, Netlify deploy previews, etc.)
- **Alternatives:** Figma prototypes (no code needed), v0.dev, Bolt, custom skill

#### Refinement Workflow
- **Type:** Stories, acceptance criteria, QA coverage, quality gate
- **Acme default:** story-to-test-workflow + specialist skills
- **Status:** ✅ Active (mature, 22+ packages produced)
- **Key data:** Stable IDs (BR-/US-/AC-/SC-/CHK-/FTC-), Judge verdicts, gate status
- **Alternatives:** Custom refinement process, direct story writing

### Delivery Slots

#### Docs Platform
- **Type:** Documentation, specs, release notes
- **Acme default:** Notion MCP (optional derived view)
- **Status:** ✅ Connected
- **Key data:** Pages, databases, comments
- **Alternatives:** Confluence, Slite, built-in Markdown preview

#### Source Control
- **Type:** Version control, PRs, CI
- **Acme default:** GitHub MCP
- **Status:** ✅ Connected
- **Alternatives:** GitLab, Bitbucket

#### Design Tool
- **Type:** Design files, component inspection
- **Acme default:** Figma MCP
- **Status:** ✅ Connected
- **Alternatives:** Sketch, Adobe XD, Penpot

### Measurement Slots

#### Survey Tool
- **Type:** In-app NPS/CSAT surveys per feature
- **Acme default:** Survey Tool (surveytool.acme.example)
- **Status:** ✅ Deployed
- **How it works:** Widget embed via window.SurveyWidget.open({featureId}). Admin configures frequency. DynamoDB + Cognito backend.
- **Portability notes:** Custom-built for Acme. Another company would need: their own survey widget or use Pendo/Hotjar surveys with feature-level targeting.
- **Alternatives:** Pendo surveys, Hotjar, Typeform, Delighted

#### Analytics
- **Type:** Product usage tracking
- **Acme default:** Pendo via TestIds (<feature>-<element>-<type>)
- **Status:** ⚠️ TestIds not yet defined for most features
- **Alternatives:** Amplitude, Mixpanel, PostHog, Heap

### Orchestration Slots

#### Knowledge Base
- **Type:** Domain knowledge, portable bundles
- **Acme default:** Acme JTBD Manager (jtbd.acme.example) + Acme Atlas MCP
- **Status:** ✅ Connected
- **Alternatives:** Custom RAG store, documentation repo

#### Prioritization Framework
- **Type:** Feature scoring and ranking
- **Built-in default:** BRICE+ (the Acme example config sets RICE; see `references/priority-calculator.md`)
- **Status:** ✅ Documented. 5 frameworks: BRICE+, RICE, MoSCoW, WSJF, ICE. Auto-fill from Canny data. One-at-a-time collection protocol.
- **Alternatives:** RICE, MoSCoW, WSJF, ICE, custom

#### SSO Portal
- **Type:** Single sign-on, tool navigation
- **Acme default:** Atelier Hub (atelier.acme.example)
- **Status:** ✅ Deployed
- **Alternatives:** Custom portal, Okta dashboard

## For other companies

To adapt Signal to Ship:
1. Review each slot above
2. Identify your equivalent tool (or decide to skip that slot)
3. Check if an MCP server exists for your tool (many do: Linear, GitHub, etc.)
4. Configure the adapter (v0.2.0+) or document the manual process
5. Adjust the prioritization framework to your methodology
