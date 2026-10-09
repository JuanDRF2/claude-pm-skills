# Environment check

> The first message of a session that starts work. It tells the PM what this session can actually use, what is
> missing, and asks one question. It replaces any static list of "connected" tools.

## Contents

- When it runs
- Procedure (silent)
- What counts as visible
- The message
- What each missing tool would add
- Branches
- Re-checks

## When it runs

| Situation | What to do |
|-----------|------------|
| New work (`/signal-to-ship <topic>` or a described feature) | The check is the first message. Gate 0 comes after the PM answers. |
| `resume` | One line inside the recap: `Environment: {n} connected ({names}); missing: {names or none}.` No extra question. |
| `/signal-to-ship` with no arguments | The result goes inside the orientation (`references/guided-flow.md`, section Orientation). Its closing question replaces the continue-or-connect question. |
| `portfolio` or `roadmap` | Skipped. |

## Procedure (silent)

Do all of this without narrating it.

1. Read the session's tool list.
2. If a shell tool exists, run `command -v gh` once. It only reads. If there is no shell tool, skip this silently.
3. Work out which tools are expected:
   - From the enabled slots of the organization config, found in the order of `references/slot-engine.md`
     (the project's `.signal-to-ship/`, then `~/.claude/signal-to-ship/orgs/`). The bundled example is **not**
     used: its tools belong to a fictitious company.
   - With no config, use the generic slot types of `references/integration-map.md`: feedback tool, issue tracker,
     docs platform, source control, analytics. Say so in one clause ("no organization config found, so these are
     the generic tools").
4. Mark each expected tool visible or not (next section).

The slot engine's "check the target" step (does a visible tool reach the configured workspace?) is deferred to
first use of that tool. The environment check only answers "is it visible".

## What counts as visible

- An MCP tool whose exact name, or whose `mcp__<server>__` prefix, is in the session's tool list. Tools the session
  announces as available on demand (deferred tools listed by name) count as visible.
- `gh` only if `command -v gh` found it. Say "gh is installed"; whether it is signed in is not checked.
- WebSearch and WebFetch only if they are in the tool list.
- APIs are never claimed as connected. Add: "tell me if you use an API I cannot see".
- If the session reports a server that is configured but failed to connect, show it as
  `configured but failed to connect: {name}` and suggest retrying with `/mcp`. Do not list it as missing and do
  not list it as connected.

**With no organization config**, there are no exact names to match, so classify each visible MCP server by its
server and tool names and list it as `{Name} ({slot type})`, for example `Linear (issue tracker)`. Typical
mappings: a feedback or idea-voting server (Canny) is a feedback tool; Atlassian (Jira) or Linear is an issue
tracker; GitHub is source control; Notion or Confluence is a docs platform; an analytics server is analytics. A
server you cannot classify from its names goes under `other connected tools: {names}` without a slot type. Expected
slot types with no matching server go under "Not connected". Never classify by guess when the names do not say.

Never say a tool is connected unless it passed this test. Never invent a command, a URL or a tool name.

## The message

At most 120 words. Show at most 5 rows under "Not connected", then "and N more optional ones".

```
Before we start, here is what I can use in this session.
Connected: {names, comma separated} (or: nothing is connected)
Not connected: {tool}: {what it would add}; {tool}: {what it would add}
To connect one in Claude Code, run /mcp or use `claude mcp add`; each vendor's docs give the exact command and sign-in steps. In other apps, use their connector settings.
Do you want to continue with what is connected, or connect something first?
```

Add "tell me if you use an API I cannot see" to the Connected line when it fits. The message holds nothing else:
no initiative type, no feature identification, no route.

## What each missing tool would add

Use these clauses, not new ones.

| Tool type | What it would add |
|-----------|-------------------|
| Feedback tool | customer votes and requests for scoring |
| Issue tracker | bug search and ticket creation |
| Docs platform | publishing specs and notes |
| Source control | reading code and pull requests |
| Analytics | usage numbers for baselines |
| Call recorder | customer-call evidence |
| Taxonomy | mapping signals to the product structure |
| Chat | drafts to channels (never sent without your OK) |

## Branches

- **The PM says continue.** Record `environment.decision: continue`, with `checked_on`, `connected` and `missing`
  (short lowercase names, for example `github`, `linear`, `gh`). Go to the Gate 0 message.
- **The PM says connect first.** Give no more than the connect line above. Record `connect_first` only if the work
  stops here. Say "tell me when it is done and I will check again". When the PM returns, redo the check in one
  line and ask the same question.
- **The PM names a topic instead of answering.** That is "continue". Record it.

## Re-checks

Check again, in one line, before two writes: the Gate 5 handoff and each Gate 6 publication. If the destination is
not visible, say so first and make the proposal paste-ready text (`references/guided-flow.md`, Destination check).
