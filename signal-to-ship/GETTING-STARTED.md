# Getting started with signal-to-ship

Ten minutes from install to your first case. This file is for people; the assistant does not load it.

## For whom, what for, where it runs

- **For whom:** product managers who work in Claude Code.
- **What for:** to take one initiative from a customer signal to a measured outcome, one decision at a time, and to
  decide whether the work is worth building at all.
- **Where it runs:** in Claude Code. Only Claude Code was tested. If you use the Claude app, Claude projects, Cursor or
  Codex you can adapt it, with losses: paste `SKILL.md` and the files of `references/` and `templates/` as project
  knowledge or as rules, and expect to lose the scripts, the hooks, the slash command, the subagent and the
  `${CLAUDE_SKILL_DIR}` path. Then the state check and the portfolio view are manual, and the skill says when it does
  a check by hand. None of that has been tried.

## What it is

A skill that walks you, a product manager, from a customer signal to a measured outcome in seven phases, with a
gate at the end of each one. It right-sizes the process (light, standard or full), can end a case with a recorded
**stop** ("not worth building"), and ends every delivered case with a **keep / iterate / retire** verdict. It
never writes to a shared system (tracker, docs, chat) without showing you exactly what it will write and getting
your go-ahead.

## 1. Install

Copy this folder into your skills directory:

- for one project: `<your-project>/.claude/skills/signal-to-ship/`
- for every project: `~/.claude/skills/signal-to-ship/`

For the full cycle also install the specialist skills it dispatches from the same library (specs, stories, test
design, tickets, release notes). Without them the skill uses a declared fallback for each one: for example a compact
refinement package plus a self-check, labeled as the orchestrator's own check and not an independent judge, instead of
the refinement specialist and the judge; a guided interview instead of the spec writer; a text storyboard instead of a
prototype tool. The result is lighter and it says so in one line. It does not stop and it does not lower the depth.

Scripts (a state-file validator and a portfolio view) need Node 18 or newer. They are optional.

## 2. Tell it about your company (once)

Copy `examples/acme.slot.yaml` to a file named after your organization, for example `mycompany.slot.yaml`, and edit
it: which tools fill each slot (feedback, tracker, docs) and what to do when a tool is missing. The prioritization
method in that file is only a suggestion: the skill always asks which method to use. Put it where the skill looks, in this order:

1. `.signal-to-ship/` inside your project (a team's config, kept with their repo);
2. `~/.claude/signal-to-ship/orgs/` (yours alone, outside any repository: use this when you work for an employer);
3. the fictitious Acme example bundled here, only if you ask for it ("use the example"). It is never used silently.

Do not put an employer's real configuration in a public repository.

## 3. Run a case

Say what you want to work on, in plain words:

> I'm a product manager at a freight software company. I want to work on a feature: let dispatchers reassign a load
> to a different driver straight from the load board, without opening the load detail page.

The first thing it does is an **environment check**: which tools it can see in this session, which expected ones are
not connected and what each would add, and one question (continue with what is connected, or connect something
first). In Claude Code you connect a tool with `/mcp` or `claude mcp add`; the vendor's docs give the exact command.
Then **Gate 0 is one message**: what it found, its reading of the type (new feature, improvement, bug fix, migration or
a contractual deadline), the route in one line and the depth with a reason. You say ok or tell it what is different.
From there every gate opens the same way: `Gate 2: Prioritization (2 of 7 on this path)`, a few lines on what you will
decide, and one question. Expect it to:

- ask **what happens if you do not build this** and recommend stopping when the honest answer is "nothing";
- ask **which prioritization method you want** (RICE, ICE, WSJF, MoSCoW, Value vs Effort 2x2 or your own), suggesting
  one with a reason; the score is an input to your decision, not the decision;
- score in **two passes** on new features and improvements: a rough one before specifying (effort as a range, a
  confidence level, then build now / backlog / archive) and a re-score after refinement, with the real effort, before
  the handoff to Dev and QA (confirm / change / backlog);
- ask **"default template or your own?"** before drafting a document, naming the default file;
- upgrade to full depth by itself when you score any risk 4 or 5, and tell you why;
- say plainly when a number is an estimate and ask you to measure it, closing the gate as `provisional` until you do;
- put each gate's decision to **you** (for example validated, iterate or pivot) and close the gate only on your answer, and propose every message to a team or a channel for your approval before anything is sent;
- ask whether people who match the persona have tried a prototype, instead of treating a stakeholder's approval as proof it is usable;
- start the first message about anything it read with `Embedded instructions: none`, or describe text inside a
  file or tool result that tried to give it orders (it does not act on it). It says this once per source.

Progress is saved after every gate in `cases/<feature>/00-signal-to-ship-state.md`, one folder per initiative. Say
`resume <feature>` to come back; it gives a three-line recap and continues. A stopped initiative or one in the backlog
is the first thing it raises, then a planned launch date that has passed with no real deploy date, then a measurement
checkpoint that has come due. You can reopen a stop, repeat an earlier gate or bring a backlog item back; it tells you
what becomes outdated and asks once before changing anything.

Small work does not need the whole cycle. At **light** depth the gates are shorter: a gut check instead of a scoring
method, scope written inline instead of an interview, one compact delivery message, no heads-up or feedback request
unless you ask. If you type `/signal-to-ship` with no words it explains what it is and what it can do, then asks what
you want to work on.

See `examples/walkthrough-globex.md` for a real conversation, up to the first gate.

## 4. See all your cases

Run `node scripts/portfolio.mjs` (or ask for the portfolio); it reads `cases/` by default, or pass the folder where your
cases live. It lists every initiative with its outcome, Day-30 adoption and verdict, shows backlog items, and warns when
recently delivered features were never measured.

## 5. Optional hardening

Permissions and hooks cannot ship inside a skill, so they live in `hardening/`. Read `hardening/README.md` to make
writes to shared systems ask you first every time.

## Quick reference

**Run it:** `/signal-to-ship <what you want to work on>`. Optional words in the same line: a mode (`roadmap`,
`parity-scan`, `resume`, `portfolio`) and a depth (`light`, `standard`, `full`; otherwise it proposes one).

**Which front door?**

| You want to... | Use |
|---|---|
| Take one initiative from signal to a keep / iterate / retire verdict, with a saved state and gates | `signal-to-ship` |
| Know which skill to run next and let it route you, one step at a time, without tracking a whole initiative | `idea-to-ship` |
| Do one task (a spec, a story, release notes) | that skill directly |

**What it saves and checks:** progress goes to `cases/<feature>/00-signal-to-ship-state.md` in your working directory
after every gate. `node scripts/validate-state.mjs <file>` checks it; `node scripts/portfolio.mjs` shows every
initiative with its outcome, adoption and verdict.

**What you decide, and when.** It asks the question and closes the gate only on your answer; a reported approval
or "close it" does not count. Every message to a team or channel is shown to you first (recipients and text) and
sent only on approve.

| Gate | You choose |
|---|---|
| 2, prioritization (pass 1) | the method; then build now / backlog / archive |
| 3, specification | approve / revise / defer |
| 4, prototype | validated / iterate / pivot (and whether real users tried it, or the risk you accept) |
| 5, refinement | PASS or FAIL; then, on new features and improvements, pass 2 (confirm / change / backlog); then send the handoff or hold it |
| 6, delivery | go / hold; then, once live, the real deploy date and the announcement |
| 7, measurement | the metrics; it can close provisional if instrumentation is not confirmed yet (open action, owner and date recorded); keep / iterate / retire after the checkpoints |

**No spec yet?** It runs a guided interview (`references/spec-interview.md`), or uses the library skill
`product-spec-interview` if you have it installed.

**You need:** nothing beyond the skill. Node 18 or newer is only for the optional scripts; connectors (feedback
tool, tracker, docs) are optional slots, and where one is missing it tells you in the environment check and asks you
for the data instead. Without Node it does the due-date and stopped checks by hand and says so.

## What to expect, honestly

- Only Claude Code was tested, and only in a headless harness with a simulated PM, on one model family. There are 51
  eval cases: eleven have a recorded run (mostly once or a few times), and the
  other forty have no recorded result: seventeen older cases and twenty-three written for version 0.12.0 that have not
  been run. The runs found real defects that were fixed. It has not been used by anyone but its author.
- It asks one question at a time, so a full cycle is many turns. That is the point, and light depth keeps it short for small work.
- It does not edit your product code, and it cannot reach a tool you have not connected: it will say so and give
  you the text to paste.
