# GEORGE Runtime Path Classification

Status: Active Reference
Branch: live-hub-runtime

## Active LIVE Path

Current active LIVE objective path:

app/george/page.tsx
-> lib/george/core/build-interpretation.ts
-> lib/george/live-voice/runtime/objective-engine.ts
-> objective hypothesis
-> outcome governor
-> runtime support

Recent protected changes:

- Inferred objectives are hypotheses, not authority.
- Low-confidence objective hypotheses do not mark objectiveKnown.
- Objective reinforcement is confidence-aware.

## Active Normal GEORGE Path

Current active normal-mode objective/progress path:

app/api/chat/route.ts
-> lib/george/runtime/intent-state.ts
-> lib/george/runtime/outcome-learning.ts
-> runtime interpretation / response shaping

This path is separate from the LIVE objective hypothesis path.

Do not assume they are the same runtime.

Do not merge them without inspection.

## Dormant / Side-Path Runtime

lib/george/live-voice/runtime/signal-authority.ts

Current inspection showed georgeSignalAuthority is only referenced inside its own file.

Treat this as dormant architecture unless future inspection proves an active caller.

Do not delete yet.

Do not build new logic on top of it without first deciding whether it should become active or be removed.

## No-Drift Rule

Before patching runtime authority:

1. Identify the active caller.
2. Identify whether the file is LIVE, normal mode, shared, or dormant.
3. Avoid creating duplicate reasoning paths.
4. Prefer demoting assumptions to hypotheses before deleting useful inference.
5. Preserve user authority.

## Current Doctrine Anchor

User = authority.

Conversation = signal source.

Room = inferred.

Outcome = inferred.

Trajectory = observed.

Support = immediate.

GEORGE is the user's tool.
