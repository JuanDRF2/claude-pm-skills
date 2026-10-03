# Hardening (optional)

The skill works without anything in this folder. These are extras you opt into, because **permissions and
hooks cannot travel inside a skill**: Claude Code reads them from settings files, which you own.

## What it adds

| Piece | What it does |
|-------|--------------|
| `permissions` (in `settings.snippet.json`) | Reads are free; **writes** to shared systems (tracker, docs, chat, feedback tool, taxonomy) ask you first every time; sending chat messages directly is denied (drafts only). |
| `hooks/gate-check.mjs` (PreToolUse on Write or Edit) | **Warns, never blocks**, when a delivery document is written before the case's gates allow it. Reads the validated state file. |
| `hooks/state-reminder.mjs` (Stop) | Reminds the assistant to save the state file when it announced a gate outcome but the file was not updated in the last two minutes. It stays silent in a session that has not written a case state file yet, so a report that merely mentions gates does not trigger it. |

Both hooks need Node 18 or newer and use only the files in this skill.

## Install

1. Copy `settings.snippet.json` into your project's `.claude/settings.json`, or into `~/.claude/settings.json` to
   apply it everywhere (merge with what you already have; do not overwrite).
2. **Change the tool names in `ask` and `deny` to yours.** Their names depend on how you registered each
   server (for example `mcp__<your-server>__<write_tool>`). Run `/mcp` to see them. List every tool that
   creates, updates, deletes or sends; leave read tools out.
3. Check the hook paths: the snippet assumes the skill is installed in the project
   (`.claude/skills/signal-to-ship/`). For a personal install use `$HOME/.claude/skills/signal-to-ship/`.

## Why `ask` and not a wider `allow`

Text the assistant reads from outside (tickets, pages, feedback exports) can contain instructions. The
skill tells the model to treat it as data, and this is the second layer: even if that fails, a write to a
shared system still needs your click.
