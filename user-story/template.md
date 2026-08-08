# User Story Template

Use this template to write a single user story with Gherkin-style acceptance criteria.

## Provenance
Adapted from `prompts/user-story-prompt-template.md` in the `https://github.com/deanpeters/product-manager-prompts` repo.

## Template
```markdown
### [US-ID] — [Brief title focused on user value]

#### Status, scope, and readiness
- **Summary:** [Brief, memorable title focused on user value]
- **Approval state:** [Proposed by AI/Product confirmed/Engineering review needed/QA review needed/Blocked]
- **Size assessment:** [Likely small/Suitable/Potentially too large/Not estimable — reason]
- **Backlog state:** [Candidate/Selected/Approved/Deferred/Blocked/Superseded]
- **Ready for Sprint:** [Yes/No/Blocked — reason]
- **Role readiness:** [Product: state; Engineering: state; QA: state]

#### User story
- **As a** [user name if available, otherwise persona, otherwise role]
- **I want to** [action the user takes to get to the outcome]
- **so that** [desired outcome for the user]

#### Scope
- **In scope:** [Behavior included]
- **Out of scope:** [Behavior explicitly deferred]

#### Agreed behavior and business rules
- [Plain-language behavior a non-technical reader can understand] ([BR-01])
- [Another behavior] ([BR-02])

#### Dependencies, questions, and rule sources
- **Rule sources and authority:** [BR-01: source, authority, status]
- **Dependencies:** [Known product/technical dependencies]
- **Assumptions:** [Explicit, not accepted as fact]
- **Open questions:** [Q-01]
- **Configuration ownership:** [Existing unchanged configuration/New or changed behavior/Unknown]

#### Acceptance criteria

##### AC-01 — [Human-readable outcome]

**Rules:** [BR-01]

**Acceptance condition:** [One clear product statement describing what must be true for this criterion to be accepted]

###### [SC-ID] — [Brief, human-readable scenario describing value]

**Given:** [Initial context or precondition]  
**And:** [Additional context or preconditions]  
**When:** [Event that triggers the action]  
**Then:** [Expected outcome aligned to "so that"]  
**And:** [Additional inseparable observable outcome, if needed]

**Technical consideration:** [Only when needed: internal records, services, events, idempotency, logs, or evidence; never replace the product outcome]

**QA relationship:** [CHK IDs or Pending design; FTC ID or Pending grouping]

##### AC-02 — [Human-readable outcome]

**Rules:** [BR-02]

**Scenario:** [Validation, alternate rule, or material failure required for acceptance]

**Given:** [Context]  
**When:** [Single business event]  
**Then:** [Observable result]

#### Relevant quality requirements
- **Security/privacy:** [Only if applicable and sourced]
- **Accessibility:** [Only if applicable]
- **Performance/reliability:** [Measurable requirement, if applicable]
- **Support/audit evidence:** [Information needed to understand what happened]

#### Delivery classification
- **Business rules:** [Customer or organizational behavior]
- **Quality requirements:** [Security, accessibility, reliability, performance]
- **Observability requirements:** [Correlation, audit, support evidence]
- **Technical enablers:** [Non-user prerequisite; do not disguise as a story]
- **Test data/environment needs:** [Controlled states, accounts, integrations]

#### Traceability summary
| Criterion | Rules | Checks | Functional case/scenario |
|---|---|---|---|
| [AC-ID] | [BR-IDs] | [CHK-IDs or Pending design] | [FTC-ID/SC-ID or Pending grouping] |

#### QA coverage
| Criterion | What it proves | Checks | Functional case/scenario | Status | Full case |
|---|---|---|---|---|---|
| [AC-ID] | [Short description without testing jargon] | [CHK-IDs] | [FTC-ID/SC-ID] | [Planned/Approved/Blocked] | [View functional case](../07-functional-test-cases.md#[anchor]) |
```

## Notes
- Use one business event per scenario. Multiple `Then/And` results are valid when they jointly prove one coherent outcome.
- Use multiple scenarios when distinct accepted conditions belong to the same user outcome; split only unrelated behaviors.
- Never promote an assumption or open question into an acceptance criterion.
- Keep functional scenarios in the QA design artifact. This table is the story-friendly index, not a duplicate specification.
- Jira and master-story criteria must contain the same approved behavior; never abbreviate criteria in the Jira view.
- Lead with user value and scope. Keep IDs visible but secondary to human-readable headings.
- Use headings and whitespace for hierarchy; do not embed CSS or platform-specific styling in Markdown.
- Render acceptance behavior as short paragraphs with bold `Given/Dado`, `When/Cuando`, `Then/Entonces`, `And/Y`, and `But/Pero` labels. Do not place rules and behavior in one undifferentiated bullet list.
- Make the criterion understandable after hiding IDs and technical considerations. Use product nouns and complete sentences.
- Split distinct selection, navigation, save, validation, failure, recovery, cancellation, and retry paths into separately titled scenarios when their primary action or outcome differs.
- Do not use symbols or shorthand to compress behavior (`+`, `→`, `/`, `=`, semicolon chains). Put internal model and integration details under **Technical consideration**.
- Keep detailed scenario execution in the QA artifact. A derived interactive reader may show it inline without duplicating the authoritative Markdown.
- Create stable `SC-*` scenarios under every `AC-*`. Directly below every scenario include `Estrategia QA` with automation decision, level, priority, reason, dependencies and status. The QA artifact reuses those same IDs, behavior and strategy; `FTC-*` only groups and enriches them.
