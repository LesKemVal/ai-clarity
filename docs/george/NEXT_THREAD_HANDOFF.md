# GEORGE Next Thread Handoff — Opportunity Continuity Runtime

## Start Here

This project is in Production Runtime Phase.

Do not redesign GEORGE.
Do not introduce a parallel runtime.
Do not overload `app/george/page.tsx`.

The next thread should begin with:

`lib/george/live-runtime/opportunity-continuity.ts`

## Runtime Placement

LIVE
↓
Outcome Review
↓
Interaction Continuity
↓
Opportunity Continuity
↓
Conversation Package
↓
Preparation Runtime

## Doctrine

Opportunity Continuity owns:

Live to fight another day.

Not "follow up."
Not "schedule."
Not "send email."

Instead, determine whether the opportunity continues, changes form, pauses, transfers, becomes dormant, or ends — and preserve the best executable path if it continues.

GEORGE's job is to help move the user toward the user's desired outcome.

GEORGE requires user participation and permission.

The user retains agency, responsibility, and final authority.

Support style changes delivery, not judgment.

Momentum may survive silence.

Sometimes the best move is to wait.

Sometimes it is to follow up.

Sometimes it is deliberately not to follow up.

Those are execution decisions, not conversation decisions.

## Current Validated Runtime Ownership

- Operational Understanding owns what GEORGE knows.
- Core Interpretation consumes Operational Understanding.
- LIVE Execution owns what should happen now.
- Outcome Review construction routes through Interaction Continuity.
- Interaction Continuity owns after-LIVE composition.
- Conversation Package / Conversation Record composition is no longer owned by `page.tsx`.
- After LIVE now surfaces as user-facing debriefing:
  - `LIVE Complete`
  - `Let's see what actually happened.`
- Transcript highlights now support:
  - blue operational signals
  - light red concerns
- Post-LIVE debrief observations are prioritized by desired outcome.

## Key Recent Commits

- `a998f32` Prioritize post-LIVE debrief by desired outcome
- `d14881a` Frame post-LIVE surface as debriefing
- `37d9b70` Add post-LIVE debriefing transcript highlights
- `b350781` Route Outcome Review construction through Interaction Continuity
- `74549fc` Document Interaction Continuity production ownership
- `3181c62` Protect LIVE interaction continuity ownership
- `9567bf3` Extract LIVE interaction continuity composition

## Files to Inspect First

1. `docs/george/PRODUCTION_TRACKER.md`
2. `docs/george/RUNTIME_ARCHITECTURE.md`
3. `docs/george/NEXT_THREAD_HANDOFF.md`
4. `lib/george/live-runtime/live-interaction-continuity.ts`
5. `lib/george/live-runtime/live-outcome-review.ts`
6. `components/george/live/PostLiveConversationRecordPanel.tsx`
7. `lib/george/preparation/runtime.mjs`
8. `scripts/george-live-runtime-smoke.mjs`

## First Inspection Command

Run:

    cd ~/ai-clarity

    grep -RniE "Opportunity Continuity|Interaction Continuity|operationalDebrief|transcriptHighlights|buildLiveInteractionContinuity|buildLiveOutcomeReview|futureActions|Preparation Runtime" docs/george lib/george components/george scripts --exclude-dir=.next --exclude-dir=node_modules --exclude-dir=dist

    sed -n '1,260p' lib/george/live-runtime/live-interaction-continuity.ts
    sed -n '1,240p' lib/george/live-runtime/live-outcome-review.ts
    sed -n '325,430p' lib/george/preparation/runtime.mjs
    sed -n '100,180p' scripts/george-live-runtime-smoke.mjs

    git status --short

## First Implementation Target

Create:

`lib/george/live-runtime/opportunity-continuity.ts`

Suggested input:

- desiredOutcome
- outcomeReview
- operationalDebrief
- transcriptHighlights
- conversationRecord
- conversationPackage

Suggested output:

- status: active | preserved | paused | transferred | dormant | closed | unknown
- path: continue_original | preserve_access | seek_decision_maker | provide_evidence | wait | follow_up | do_not_follow_up_yet | close_gracefully | reframe_objective
- recommendation
- reason
- nextExecutableOpportunity
- preparationNotes

## Validation

After each patch:

    cd ~/ai-clarity

    npm run george:live-runtime:smoke
    npm run build
    cd ~/ai-clarity/live-hub && npm run build

Commit small.
