# claude-pm-skills

See `README.md` for what this repo is (the public, sanitized library of PM skills). This file
only carries the cross-repo map, added 2026-09-24 after an audit found sessions had no way to know
how this repo relates to Juan's other repos without asking.

## Repo ecosystem (Juan's Mac + GitHub)

| Repo | Where | Purpose | Relates to |
|---|---|---|---|
| **`claude-pm-skills`** (this repo) | Desktop + GitHub, **public** | Sanitized, company-agnostic library of ~31 PM skills | Mirrors `~/.claude/skills/` (the personal copy on Juan's Mac intentionally diverges slightly — see its own `MANIFEST.json`) |
| `claude-personal-config` | GitHub only, private (not cloned anywhere) | Private backup of `~/.claude/` itself (`CLAUDE.md`, `rules/cadence.md`, `skills/`) | **Not** redundant with this repo — one is a private full backup, this one a public sanitized subset; different purposes, kept separate on purpose |
| `AI-First-Workspace` | Desktop + GitHub, private | Juan's personal life/career workspace (job search, PM-craft portfolio, learning) | Uses this library's skills as tools |
| `genesis` | Desktop + GitHub, private | Juan's own scaffolding tool — bootstraps *new* projects with guard hooks, subagents, and an initiative ledger | Independent of this library |
| `ai-pm-playbook` | Desktop + GitHub, private | Sanitized, shareable version of PIP (Juan's PM orchestrator) + the FORJA methodology | Independent of this library; the real PIP lives only on Juan's work Mac |

No RAG or graph index across these — the set is small enough that this table plus each repo's own
README is the right amount of structure.
