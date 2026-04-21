NOW:
We confirmed the current steering system exists.

Current live assets:
- Suggested prompts from conversation
- Reroute prompts
- Keep / Share / Related actions
- Sidebar prompt engines
- Brilliant conversation modes
- Prompt context handoff into /api/chat

Main problem:
The system is fragmented and too keyword-driven.

GEORGE can suggest controls,
but does not yet consistently know WHEN to steer.

NEXT OBJECTIVE:
Turn controls into intelligent guidance tools.

GEORGE should know when to point users toward:

- Related
- New Strategy
- Compare Options
- Blind Spots
- Guide w/ Scripture
- LIVE Mode
- Keep This
- Share This
- Build a Plan

Based on:
- confusion
- drift
- urgency
- decision pressure
- live conversation pressure
- repeated loops
- emotional heat
- readiness to act

PHASE 1:
Create:

lib/george/steering.ts

This file decides:
1. Should GEORGE steer now?
2. Which control?
3. Why now?
4. What label?
5. What message?
6. Should it pulse/glow?

Then page.tsx only renders it.

WHY:
Without steering logic, GEORGE reacts.
With steering logic, GEORGE leads.
