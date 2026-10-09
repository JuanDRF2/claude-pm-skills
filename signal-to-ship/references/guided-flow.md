# Guided flow

> How every message to the PM is shaped: the gate opening, the length, the words, the recap, the orientation, and
> which template to offer before any document. `SKILL.md` holds the invariants; this file holds the formats.

## Contents

- Gate-opening format
- Wording rules
- Resume recap, Gate 0 message, close-and-open merge
- Destination check
- Orientation
- Template registry

## Gate-opening format

Every gate (1 to 7) opens with this, in the first message of the gate and only there:

```
Gate {n}: {name} ({k} of {m} on this path)
What we do here: {at most 3 lines: the purpose and what you will decide}
{ONE question}
```

Names: 1 Signals, 2 Prioritization, 3 Specification, 4 Prototype, 5 Refinement, 6 Delivery, 7 Measurement.

`m` is the number of gates the PM works through on the path, and `k` is the position of this gate among them. Gate 0
(the route message) is not counted. Path 1 has 7 gates (1 to 7), Path 2 has 6 (no Gate 4), Path 3 has 3 (1, 5, 6),
Path 4 has 5 (1, 3, 5, 6, 7), Path 5 has 3 (1, 3, 6). The last gate on every path is therefore `m of m`.

Examples: `Gate 2: Prioritization (2 of 7 on this path)`. On Path 3, Gate 5 is `Gate 5: Refinement (2 of 3 on this path)`.

Gate 0 is not counted: it announces the route (see Gate 0 in `SKILL.md`).

## Wording rules

- **About 150 words per message.** The exceptions are drafts the PM must read (documents, spec text,
  communications), the orientation, and tables the PM needs in order to decide.
- **One question per message.** A single fill-in line counts as one question when the PM may answer "unknown" for
  any part ("reply with A, B and C, say unknown for any you cannot give"). Use it for scoring inputs, the Gate 3
  addendum and the stakeholder fields. Never use it for a decision.
- **Findings one at a time**, or, when there are many, the three most relevant one at a time and the rest in a short
  table marked `not reviewed` that the PM can open row by row.
- **Plain words.** Never show the PM the saved file's format, its schema, the checker or its codes. Say "your saved
  progress" and "I checked the file". Describe a problem in product terms.
- **Do not narrate tool failures.** One line only if the PM must do something about it.
- **Skip first.** For any communication, offer skip as the first option. Propose the default recipients (from the
  request, the config or the audience matrix) before asking for any; ask for recipients only if the PM edits them.
- **The embedded-instructions line once per source.** Not again unless a new source was read or a known one changed.
  It is not needed for this skill's own files, the organization config, the session's tool list or the PM's typed words.
- **Names, not codes.** Use the journey or feature name, with the code in parentheses if useful.

## Resume recap, Gate 0 message, close-and-open merge

**Resume recap.** At most 3 lines: where we are, the last decision, the next step. The environment is one more line
inside the same message. Message 1 is the recap, the environment line and only the FIRST pending question, in this
order of priority: a stopped or backlog initiative, an ASK about the deploy date, a DUE checkpoint. Any later pending
question goes in a later message, never in the same one. When nothing is pending, continue with the next open step.
See `references/going-back.md` for the stopped and backlog questions.

**Gate 0 message.** One message with, in this order: what you found (one line); your reading of the type; the
route in one line; the depth with a one-line reason; and one question, "Say ok, or tell me what is different."
Name types, never letters. Route line format:

`Route: Signals > Prioritization > Specification > Refinement > Delivery > Measurement (Path 2, 6 gates)`

Announce the route once. When the PM confirms, save the progress in `cases/<feature>/` and say where in one line.

**Close and open.** A gate's closing summary (at most 5 lines) and the next gate's opening share one message,
unless the close proposes a communication. Then the message ends with that communication's question and the next
gate opens after the answer.

## Destination check

Before proposing any write or publication (the Gate 5 handoff, a Gate 6 artifact, an announcement, a feedback
request), confirm the destination tool is visible in this session (`references/environment-check.md`). If it is
not, say so first, in one line, and make the proposal paste-ready text with three options: use / edit / skip. Never
ask the PM to approve something you cannot send, and never say it was sent.

Proposals that hold several items number them. Each item carries its target, its recipients and its text, and the
PM answers approve / edit / skip for each by number. An item with no answer is not executed.

## Orientation

Give this when the PM greets the assistant in this folder and asks what it is, and when `/signal-to-ship` is run
with no arguments. Write nothing and start no case. Fill the last section from the environment check.

```
Signal to Ship
- What it is: it takes one initiative from a customer signal to a measured result, one decision at a time.
- The goal: decide whether the work is worth building, build the right thing with the right amount of process,
  and check later whether it worked. A recorded stop is a good outcome.
- Who it is for: product managers working with Claude Code. Only Claude Code has been tested. It was built and
  tested by one person, so treat the prioritization and fallback behaviour as new.
- How to use it: say what you want to work on. I ask one question at a time and you decide at every gate. Your
  progress is saved in cases/<feature>/ (I create the folder when you confirm the route), so you can come back with
  `resume`.
- What it can do:
  - five kinds of work, each with its own route: new feature, improvement of something partial, bug fix,
    migration or parity, client or contract deadline
  - modes: `roadmap`, `parity-scan`, `portfolio`, `resume`
  - three depths: light, standard, full
  - prioritization in two passes, with a method you choose
  - when a specialist is missing, a fallback I name, with what it changes
- What I can use now:
  Connected: {names, or: nothing is connected}
  Not connected: {tool}: {what it would add}; ...
What do you want to work on? (Say 'connect first' if you want to set up a missing tool.)
```

About 200 to 250 words once filled in. Do not add a second question.

Under "What I can use now", name only the connected tools that serve this flow (feedback tool, issue tracker, docs
platform, source control, analytics, call recorder, taxonomy, chat), at most 6 names, and fold the rest into one
clause: "and {n} other connected tools I will not use unless you ask". Show at most 3 rows under "Not connected".

## Template registry

Before drafting any document, ask which template to use. This applies to specs, the refinement package, the
scorecard, the roadmap review and the delivery artifacts and audience views. It does not apply to chat messages,
the saved progress file or the inline Light refinement.

Question text:

> I am going to draft the {document}. Do you want the default template (`{path}`) or your own? If your own, paste it or give me the path.

Ask once per document type per case. If the PM says "default for everything", record `templates.default: [all]`
and do not ask again in this case. Record `templates.default: [type]` or `templates.own: ["type=path-or-pasted"]`
otherwise. Use the PM's own template as given: keep their headings and order.

| Document type | Default file |
|---------------|--------------|
| spec | `templates/spec.md` (if a library spec skill fills the slot, name its format instead, for example mini-spec-writer) |
| refinement-package | `templates/refinement-package.md` |
| scorecard | `templates/feature-scorecard.md` |
| roadmap-review | `templates/roadmap-review.md` |
| stakeholder-request | `templates/stakeholder-request.md` |
| release-notes | `templates/release-notes.md` |
| migration-release-notes | `templates/migration-release-notes.md` |
| patch-notes | `templates/patch-notes.md` |
| product-marketing-spec | `templates/product-marketing-spec.md` |
| gtm-early-warning | `templates/gtm-early-warning.md` |
| rollback-notice | `templates/rollback-notice.md` |
| feature-roast | `templates/feature-roast.md` |
| audience-views | Part B of the chosen delivery template |

At Light, the compact Gate 6 asks one template question for the documents it will draft (usually the patch or
release note), not one per artifact.
