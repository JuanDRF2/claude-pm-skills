# Cadence — Full Reference

A personal delivery rhythm for building software solo with an AI coding agent. Assembled from
public methodologies and Anthropic's own published Claude Code practices — not derived from any
single company's internal process. See [`CADENCE.md`](./CADENCE.md) in this repo for the
one-screen version; this document goes deeper on each phase and is meant to be read once, not
re-read every session.

---

## 1. Shape

**What it is:** deciding what you're building and roughly how, before any code gets written.
Adapted from Basecamp's [Shape Up](https://shapeup.basecamp.com), scaled to one person per their
own guidance for small teams (drop the betting table, drop the fixed cycle length, let the same
person shape and build).

A shape is short — a paragraph or two, not a document. It answers:

- **Appetite** — how much time/effort is this worth? Decide this *before* you think about the
  solution, so the solution has to fit the appetite instead of the appetite expanding to fit
  whatever solution occurred to you first.
- **Rough approach** — the shape of a solution, described at the level of "these are the pieces
  and roughly how they connect," not a detailed spec. Leave room for the how to get figured out
  during Build.
- **Rabbit holes** — anything that looks simple but has a trap in it (an edge case, an
  integration quirk, a decision that looks small but forces a bigger one). Naming them up front
  is the whole point of shaping — most scope blowups are an unnamed rabbit hole.
- **No-gos** — what's explicitly out of scope for this pass, so you don't scope-creep mid-build.

**Lite vs. Full:** Most personal work only needs **Shape Lite** — appetite + rough approach in a
few sentences, decided in minutes. Go to **Full Shape** (a written-out version you actually sit
with for a day) when: the appetite is more than a few days, it touches something you'd hate to
redo (data model, auth, anything hard to reverse), or you genuinely don't know the approach yet
and need to think out loud first.

**Circuit breaker:** if a shaped piece of work isn't shipping within its appetite, the default is
to kill it or re-shape it — not silently let it run over. An unbounded "just a bit more" is how
solo projects stall.

**Hotfix format — lighter than Lite.** For a small, well-understood fix to something already
built (not a new build), even Shape Lite's four questions are more than the fix needs. Use this
instead: **what's broken** (in plain language, how you noticed it), **the fix** (one or two
sentences), **how you'll verify it** (a concrete check, not a feeling), **rollback** (what undoes
it if it goes wrong — usually: revert the commit). If while writing this you find the fix isn't
actually small — it touches multiple areas, needs a real decision, changes behavior you haven't
seen yet — stop and go back to Shape Lite instead.

---

## 2. Build

**The loop:** *Explore → Plan → Code → Commit* — Anthropic's own recommended pattern for working
with Claude Code. Concretely:

1. **Explore** — before writing anything, have the agent read the relevant code/docs and report
   back what it found. No edits yet. This is where you catch a wrong assumption cheaply.
2. **Plan** — use plan mode (or just ask for a plan) before the agent touches files. Read the
   plan. Redirect it if it's solving the wrong problem — that's much cheaper than redirecting
   half-written code.
3. **Code** — let the agent implement against the approved plan, in small enough increments that
   you can actually review each one.
4. **Commit** — a real commit, with a message that says why, not just what.

**Tests drive the build.** This is TDD, not full BDD — BDD assumes a PM, a dev, and a tester
co-writing examples together; TDD is explicitly designed to work for one person. Write the check
(a test, a script, a concrete "this should do X") before or alongside the code, not after. For a
solo builder this doesn't need Gherkin files or formal scenario ceremony — a plain test that
fails for the right reason, then passes, is enough.

**Constraints for AI, kept lean.** Every project gets a short rules file (`CLAUDE.md` for Claude
Code specifically; `AGENTS.md` if the project needs to be readable by other AI coding tools too —
it's a genuinely open, vendor-neutral convention, not tied to one company). Keep it short: if a
line wouldn't cause a real mistake when removed, cut it. A bloated context file is worse than a
thin one — the agent has to find the signal in it same as you would.

**Subagents for research, not just code.** When you need to understand something without
touching files yet (how does this library actually work, what does this error mean), a read-only
subagent that reports back keeps your main working context clean instead of filling it with
exploration you don't need to keep around.

**Keep a short AI issue log, separate from your decisions log.** A decisions log tracks what the
project does and why; an issue log tracks how well the AI is building it — the moments it got
something wrong and had to be corrected. Not every slip, just the ones worth remembering: a
misunderstanding that cost real rework, a pattern that keeps recurring, a rule that turned out to
be missing from the constraints file. If the same kind of mistake happens twice, that's a signal
to fix the rule, not just patch the code again.

---

## 3. Verify

**Two checks, not a review chain.** Solo work doesn't need a multi-role sign-off chain (no
separate QA, no separate architect approval) — but it does need more than "it looks done":

1. **An automatable check** — a test suite, a build, a lint pass, a screenshot of the thing
   actually working. Something you can point to and say "this proves it," not just "I read the
   diff and it seemed fine."
2. **One adversarial pass** — a fresh look at the diff that didn't see the reasoning that
   produced it (a separate subagent, or you, coming back to it after a break). The goal is
   catching the thing that looked right *while writing it* but doesn't hold up on a second look.

**Definition of done, kept binary.** Done = passes the check + you can point to the evidence. Not
"looks done," not "should work." If you can't name the check that proves it's done, it isn't done
yet — that's usually a sign the check needs to be written, not that the work needs more polish.

**A dependency/vulnerability check belongs in the automatable check, not just in memory.** Run
`npm audit` (or the equivalent for your stack) before calling something done if dependencies
changed — a rule that exists but never gets run isn't a check, it's a hope.

---

## 4. Ship

Ship is fast, specifically *because* Verify already happened — there's nothing left to
discover. For solo work this is usually just: merge, deploy if applicable, and actually use the
thing once for real before calling it closed.

**Deploying to a public URL is its own checkpoint, not a footnote.** Before doing it, confirm
real access control exists — a login, a shared secret, an IP allowlist, something. For a
single-user app, "nobody knows the URL yet" is not access control; it's a matter of time. If
auth isn't built yet, that's fine — just don't deploy publicly until it is, and write the gap
down explicitly (a decisions log, a "known gaps" note) rather than letting it go unstated.

If something breaks after shipping: fix it, and if it was the kind of bug a test would have
caught, write that test before you move on. A bug that becomes a test never has to be caught by a
human twice.

---

## 5. Flow — how much is "in flight" at once

Adapted from **Personal Kanban** (Jim Benson / Tonianne DeMaria Barry) — a long-established,
non-proprietary practice: visualize the work, and cap how much is "in progress" at once, usually
**1–2 items** for one person. When something's in progress and you start a third thing, that's
the signal to finish or explicitly park what's already open — not add a fourth.

Team-scale Kanban adds SLAs, cumulative flow diagrams, and class-of-service policies. None of
that is needed solo — the only piece worth keeping is the WIP cap itself, because it's the part
that actually prevents half-finished sprawl.

---

## Where each idea came from (so it's traceable, not just asserted)

| Piece | Source |
|---|---|
| Appetite, shaping, rabbit holes, no-gos, circuit breaker | Basecamp, *Shape Up* (shapeup.basecamp.com) — public |
| Scaling Shape Up down for small teams | Basecamp's own "Adjust to Your Size" appendix |
| Explore → Plan → Code → Commit, plan mode, lean context files, "give it a check it can run," adversarial subagent review | Anthropic, official Claude Code best-practices docs |
| AGENTS.md as a cross-tool convention | agents.md — stewarded by the Agentic AI Foundation (Linux Foundation) |
| TDD vs. BDD distinction | Cucumber's own official blog (the makers of the leading BDD tool) |
| Personal Kanban, WIP limits | Jim Benson & Tonianne DeMaria Barry, *Personal Kanban*; Atlassian's Kanban documentation |
| AI issue log, hotfix format | Not from an external source — refined from real use building solo projects with this rhythm, added once the gap showed up in practice |

This document intentionally does not include: multi-role sign-off chains, fixed SLA hour
thresholds, scoring formulas, or named internal protocols — those are the parts of any
enterprise delivery framework that are specific implementation choices for a *team*, not
generic practice, and don't apply to one person building alone.
