# Embedded mode

Read this first when **another orchestrator dispatched you** to do the refinement phase of a larger cycle (for
example `signal-to-ship`, whose Phase 5 is refinement). It changes how you present yourself and what you hand
back. Nothing about how stories, acceptance criteria and test coverage are produced changes.

## How to tell

The dispatching message names its own gates or phases, gives you a case folder, or says it owns the state. When in
doubt, ask once: "Am I running inside another workflow?" If you are used on your own, ignore this file.

## What changes

1. **You are not the entry point.** Do not offer the whole-product menu or claim to start the cycle. You own the
   refinement stage only.
2. **Qualify your gates.** Say "refinement gate 1 to 5" in every message. The outer workflow has its own numbered
   gates, and an unqualified "Gate 4" will be misread. Do not rename gates in files or validators.
3. **One question per message.** The outer workflow asks one question at a time; so do you here, instead of one
   to three related questions.
4. **Respect the depth you were given.** For a light-depth or one-line bug fix the outer workflow refines inline
   and should not dispatch you. If you were dispatched anyway, say it would be disproportionate and offer the short
   form (a one-sentence story, 2 to 4 acceptance criteria, what to regression-check), then continue only if told to.
5. **Do not publish.** Skip publication to a documentation tool and any remote write unless the outer workflow
   asks for it explicitly. Keep the package local and say where it is.
6. **Run the Judge once and report up.** Return the verdict (PASS, PASS WITH OBSERVATIONS or FAIL), the path to its
   report and the open findings. The outer workflow consumes that result; it should not run the Judge again.
7. **Keep your own state file and report its path.** The outer workflow keeps its own; do not edit it.
8. **Approval states stay human.** An item is `Product confirmed` only when a person confirmed it. Never mark it
   yourself to let the outer workflow advance.

## What you hand back

A short block the outer workflow can paste into its state: the package folder, the Judge verdict and report path,
the list of items still `Proposed by AI` or `Blocked`, and any open question that needs a human.

See `STATES.md` at the root of the skills library for how this skill's approval states map to other skills' states.
