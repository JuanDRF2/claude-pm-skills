# Action Tiers

Shared vocabulary for classifying what any skill in this library is allowed to do without asking,
what needs explicit confirmation every time, and what's never allowed — regardless of instruction.
Inspired by the `allow`/`ask`/`block` policy-tier pattern some AI coding tools use to gate risky
actions, adapted here for a library that produces documents and tickets rather than executes
arbitrary code.

Skills that touch a live system (Jira, Notion, a hosted portal, external comms) should point here
instead of re-deriving their own confirmation language from scratch. This file is the one place
that changes if the classification itself changes; individual `SKILL.md` files stay focused on
their own methodology, not on restating this.

## `allow` — no confirmation needed

- Drafting, analyzing, and generating previews in conversation or as local Markdown/temp files.
- Reading existing artifacts, Jira issues, Notion pages, etc. to inform a draft.
- Writing to a project's own `artifacts/<project>/` folder before anything is marked approved
  (labeled `Status: Draft — Not approved`).

## `ask` — explicit confirmation required, every single time

- Creating or updating a real Jira issue (`jira-story-publisher`, `jira-bug-writer`).
- Publishing or updating a Notion page (`publish-refinement-to-notion`, `release-notes-writer`).
- Hosting a portal or document somewhere reachable beyond the local machine
  (`build-refinement-portal`, `build-refinement-document`).
- Propagating a changed decision into already-published artifacts (`artifact-sync`).
- Sending any message, comm, or notification to a channel or person outside this conversation.

No standing "yes" carries over between actions of the same kind — approving one Jira issue does
not pre-approve the next one, even later in the same session.

## `block` — never, regardless of instruction

- Silently rewriting an existing BDD/test scenario, Jira ticket, or Notion page instead of flagging
  the change (`artifact-sync`'s "never edit, only flag" rule, extended library-wide).
- Self-approving a gate that `idea-to-ship` or `story-to-test-workflow` requires a human to sign —
  the Gate approval log exists precisely so this can't happen quietly.
- Making something publicly reachable (a hosted portal, a public Notion page) without informed,
  explicit confirmation of that specific consequence.
- Inventing a business rule, acceptance criterion, or QA decision to unblock a gate instead of
  leaving it as an open question.
