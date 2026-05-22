# Mini Spec Writer — Input Example

This is the raw input provided to the skill. It's intentionally rough — copied from a Slack message and stakeholder notes.

---

## Raw Input

```
From Slack (product channel):

"Hey, event managers keep complaining that they have to rebuild events from scratch
every year. Like our Annual Gala customer has the same setup every year — same venue,
same ticket tiers, same donation asks — but they have to re-enter everything manually.

Can we just let them copy a past event? They'd need to change the date and maybe
the ticket prices but everything else stays the same. We're losing renewals over this.

Also the operations team asked if this could work for recurring events not just
one-off copies. But that feels like a bigger thing maybe for later?

Needs to be ready before the spring fundraising season — that's like 6 weeks away."
```

**Additional context from PM discovery call:**
- Affects ~40% of annual event customers
- Current workaround: customers export to CSV and re-import (broken 30% of the time)
- Tech lead confirmed the Event model supports cloning without schema changes
- Design has a "Duplicate" pattern already used in the Membership module
