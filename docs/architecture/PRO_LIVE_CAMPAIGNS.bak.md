# PRO LIVE / Campaigns — BAK Architecture

Status: shelved / out of active system architecture.

## Decision

PRO LIVE campaigns are not part of the active GEORGE architecture right now.

Current active architecture:

Normal GEORGE
→ sessions

LIVE / Conversation
→ conversation continuity

PRO LIVE / Campaigns
→ archived / .bak

## Reason

GEORGE is not being rebuilt around profession brains, campaign modes, or separate PRO LIVE runtime systems.

Current direction:

Chair
↓
Recognition
↓
Trust
↓
Signal
↓
Confidence
↓
Room Formation
↓
Execution

Campaign architecture should not govern normal GEORGE or individual LIVE.

## Rule

Do not expand campaign runtime.

Do not add new campaign UX.

Do not route users into PRO LIVE campaigns.

Do not let campaign state affect normal GEORGE or individual LIVE.

## Future Recovery

If PRO LIVE returns later, recover it as a separate professional product surface.

It must not bleed into:

- Normal GEORGE
- Individual LIVE
- Prep Room governance
- Chair / signal / confidence architecture

## Current cleanup direction

Disable first.
Stabilize Normal + LIVE.
Delete only after stability is proven.
