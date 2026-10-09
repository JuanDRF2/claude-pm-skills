# Going back, stopping and the backlog

> What to do when a case is not simply moving forward: a stopped initiative the PM wants to reopen, a gate that has
> to be repeated, an item waiting in the backlog, and a stop that someone outside the team should hear about.

## Contents

- Reopen a stop
- Repeat a gate
- A backlog item returns
- Pass 2 "change" is not a go-back
- Stop with a requester to notify
- What to say to the PM

## Reopen a stop

Use it when the saved progress says the initiative is stopped and the PM wants it back.

1. Ask one question: "This was stopped on {date} because {reason}. Reopen it, or leave it stopped?"
2. On reopen:
   - Copy the stop reason and date into the decision log, then clear them from the saved progress.
   - Set the status back to active.
   - If the stop came from an archive at pass 1, re-ask the pass 1 decision (build now / backlog / archive) and
     overwrite `pass1_decision` with the answer, so the saved progress never says archive on an active initiative.
   - Set `reopened_on` to today and `reopened_reason` to the PM's reason in one line.
   - Leave `current_phase` as it was. Later gates stay pending.
3. Log the decision, then continue with the next open step.

Never delete the stop history: it moves to the decision log.

## Repeat a gate

Use it when the PM wants to redo a gate that already passed (the spec changed, the evidence changed).

1. Work out which gates return to pending: the gate itself and every later gate on this path that is passed or
   provisional. Skipped gates are re-evaluated, not assumed.
2. Say what becomes outdated. Going back to Gate 3 outdates the refinement package and pass 2. Going back to
   Gate 2 outdates the specification's priority basis. Going back to Gate 1 outdates the score.
3. Ask ONE confirmation: "To repeat Gate {n} I would reset Gates {list} to pending and mark {outdated things} as
   outdated. Go ahead?"
4. On yes, in this order: reset the later gates first, clear their reasons, then the gate itself; set
   `current_phase` to the phase of the gate; set `reopened_on` and `reopened_reason`; write the decision log row.
   Resetting later gates first keeps the progress consistent (a later gate never looks ahead of an earlier one).
   When Gate 5 or any earlier gate is reset, also clear `pass2_decision`, `pass2_effort`, `pass2_score`,
   `pass2_note`, `pass2_on` and every `refinement_mode` field, because the refinement package and pass 2 are
   outdated and must be redone.
5. Check the file again and continue at the gate you reopened.

Never lower `current_phase` and leave a later gate passed. Never reset without the confirmation.

## A backlog item returns

An initiative with a backlog decision (from pass 1 or pass 2) is not stopped and not in progress.

- On resume, say so and ask one question: "This is in the backlog since {date} (pass {1 or 2} decision). Start it
  now, or keep it in the backlog?"
- On start now: re-ask the pass 1 decision (build now / backlog / archive) and re-score if the inputs changed
  (`references/priority-calculator.md`). A pass 2 backlog item returns to the point where pass 2 was due, with a
  new effort check. Then overwrite the backlog value so the next resume does not raise it again: replace
  `pass1_decision` with the new answer, or clear `pass2_decision` for a pass 2 item, and record the date in the
  decision log.
- On keep: change nothing and say how to bring it back later.
- A spec deferred at Gate 3 is not a backlog decision in the saved progress. It is recognised by the decision-log row
  "Gate 3 deferred on {date}". Ask "Deferred on {date}. Start it now or keep it deferred?" On start now, log it and
  reopen Gate 3 at its decision point.

## Pass 2 "change" is not a go-back

When the PM answers `change` in pass 2, they keep building on changed terms (scope, date, effort or order). Ask what
changed in one question and record it in `prioritization.pass2_note`. No gate is reset.

## Stop with a requester to notify

When the initiative is stopped and `request.origin` is `stakeholder` or `customer`, the requester should hear it.
Propose the notice right after recording the stop:

- To: the requester (`request.requester`, a role, not a guess at a name).
- Text: the decision, the reason, and what would reopen it.
- Options: approve / edit / skip. Offer skip first. Nothing is sent without the answer.
- If chat is not connected, give paste-ready text (`references/guided-flow.md`, Destination check).
- Once the PM says it was sent, record `request.notified_on`. If they skip it, say in the decision log that the
  notice was skipped and why. `request.notified_on` stays empty, so the check may still show a reminder about the
  requester; after a deliberate skip that reminder is expected and the decision-log row is the record.

## What to say to the PM

Keep it in product words: "reopen", "repeat Gate 3", "back to the backlog". Do not mention the saved file's fields
or the checker.
