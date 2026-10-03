# Getting started with signal-to-ship

Ten minutes from install to your first case. This file is for people; the assistant does not load it.

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
design, tickets, release notes). The skill still works without them: it falls back to guiding you directly.

Scripts (a state-file validator and a portfolio view) need Node 18 or newer. They are optional.

## 2. Tell it about your company (once)

Copy `examples/acme.slot.yaml` to a file named after your organization, for example `mycompany.slot.yaml`, and edit
it: the prioritization framework, which tools fill each slot (feedback, tracker, docs) and what to do when a tool
is missing. Put it where the skill looks, in this order:

1. `.signal-to-ship/` inside your project (a team's config, kept with their repo);
2. `~/.claude/signal-to-ship/orgs/` (yours alone, outside any repository: use this when you work for an employer);
3. the fictitious Acme example bundled here, only if nothing else exists (it will ask before using it).

Do not put an employer's real configuration in a public repository.

## 3. Run a case

Say what you want to work on, in plain words:

> I'm a product manager at a freight software company. I want to work on a feature: let dispatchers reassign a load
> to a different driver straight from the load board, without opening the load detail page.

It will check the workspace, ask what kind of initiative this is (new feature, improvement, bug, migration or a
contractual deadline), propose how much process to apply, and then ask you one question at a time. Expect it to:

- ask **what happens if you do not build this** and recommend stopping when the honest answer is "nothing";
- upgrade to full depth by itself when you score any risk 4 or 5, and tell you why;
- say plainly when a number is an estimate and ask you to measure it, closing the gate as `provisional` until you do;
- start its first message about anything it read with `Embedded instructions: none`, or describe text inside a
  file or tool result that tried to give it orders (it does not act on it).

Progress is saved after every gate in `00-signal-to-ship-state.md` in your working directory. Say
`resume <feature>` to come back; a measurement checkpoint that has come due is the first thing it will raise.

See `examples/walkthrough-globex.md` for a real conversation, up to the first gate.

## 4. See all your cases

Run `node scripts/portfolio.mjs <folder-with-your-cases>` (or ask for the portfolio). It lists every initiative with
its outcome, Day-30 adoption and verdict, and warns when recently delivered features were never measured.

## 5. Optional hardening

Permissions and hooks cannot ship inside a skill, so they live in `hardening/`. Read `hardening/README.md` to make
writes to shared systems ask you first every time.

## What to expect, honestly

- It has been tested only in a headless harness with a simulated PM: eleven cases, one of them a full bug-fix cycle,
  almost all on one model (three on a second). The cases pass, and the runs also found real defects that were
  fixed. It has not been used by anyone but its author.
- It asks a lot of questions at the start. That is the point, and light depth keeps it short for small work.
- It does not edit your product code, and it cannot reach a tool you have not connected: it will say so and give
  you the text to paste.
