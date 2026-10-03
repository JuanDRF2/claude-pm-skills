# Cadence — One-Screen Summary

Cadence is a personal rhythm for building software solo, with AI doing most of the typing.
It's assembled from public, well-known practices — not any single company's proprietary
process — and right-sized for one person plus an AI agent, not a team.

## Where it comes from
- **Shape** — adapted from Basecamp's [Shape Up](https://shapeup.basecamp.com) (openly published),
  scaled down per their own guidance for small teams: no betting table, no fixed 6-week cycles —
  one person decides the appetite and shapes the work themselves.
- **Build** — the *Explore → Plan → Code → Commit* loop and "plan mode" pattern from
  [Anthropic's own Claude Code best practices](https://code.claude.com/docs/en/best-practices),
  plus TDD (not full BDD — BDD assumes multiple stakeholders; TDD is designed for one developer).
- **Verify** — Anthropic's "give the agent a check it can run" philosophy, plus a fresh-context
  adversarial review (a second look that didn't see the reasoning that produced the diff).
- **Flow** — Personal Kanban: a low WIP limit (1–2 things in flight) instead of team-scale boards,
  SLAs, or ceremony.
- **Constraints for AI** — a lean `CLAUDE.md`/`AGENTS.md` per project (AGENTS.md is a genuinely
  open, vendor-neutral convention now stewarded by the Agentic AI Foundation), kept short enough
  that every line earns its place.

## The cycle
**Shape** (appetite, rough approach, rabbit holes, no-gos — written down, before touching code) →
**Build** (TDD-driven, AI does the typing, you review each step) → **Verify** (an automatable
check plus one adversarial review pass) → **Ship** (fast, because you already checked it works).

## Core principles
1. Shape before you build — even a rough one-paragraph shape beats none.
2. Tests drive the build, not chase it — write the check before or alongside the code.
3. Plan → approve → build → check. Always — no skipping steps because it's "just quick."
4. Give AI explicit, lean constraints — a short rules file beats a context dump.
5. Cap your WIP low — 1–2 things in flight, not a backlog managed like a team's.
6. Done means it passes a check you can point to — not "looks done to me."
7. A circuit breaker exists — if something isn't shipping, kill it or re-shape it. Don't let it
   linger half-built.

## Full reference
The fuller write-up — each phase in more depth, with the "Lite" vs "Full" version of Shape, and
where each idea actually comes from — lives in [`CADENCE-REFERENCE.md`](./CADENCE-REFERENCE.md).
Read it once, then work from this page day to day.

## Solo vs. team
This is written for one person + AI. If Cadence is ever used with other humans on the team, the
roles this deliberately dropped (a second shaper, a separate reviewer, betting-table quorum) are
the first things worth adding back — not by inventing new process, but by re-introducing exactly
the piece that's now missing.

## Using this with the skills in this repo
Cadence is the rhythm; the skills in this repo are what you run inside it. `idea-to-ship` (start
there if you're not sure which skill applies) already speaks Cadence's phases under generic
names (Define/Shape → Build → Verify → Ship) without requiring you to know this document exists —
reading this file just tells you *why* it asks what it asks, and gives you the same rhythm for
the parts of the work no skill covers (the actual coding in Build, the actual review in Verify).
