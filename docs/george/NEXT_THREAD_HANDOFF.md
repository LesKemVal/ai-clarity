# GEORGE PRODUCTION CONTINUATION — NO DRIFT

Branch: `live-hub-runtime`

Current inspected HEAD:

```text
d2e28a4 Consolidate browser-scoped session lifecycle
```

## FIRST

Read in order:

1. `docs/george/PRODUCTION_TRACKER.md`
2. `docs/george/RUNTIME_ARCHITECTURE.md`
3. `docs/george/OPERATIONAL_PROFILE.md`
4. `docs/george/NEXT_THREAD_HANDOFF.md`

Inspect implementation before changing anything.

Do not redesign GEORGE.

Do not create another runtime, reasoning lane, support composer, delivery router, preference store, or competing authority.

Do not move reasoning into `app/george/page.tsx`.

## CURRENT VALIDATED WORK

The LIVE runtime supports two adaptive starting preferences:

- **Adaptive Cue** — recommended default.
- **Adaptive Response** — begins with concise, complete, usable language.

The preference determines where GEORGE begins, not where GEORGE must remain.

GEORGE adapts from observed execution unless the user explicitly requires a particular support style.

Adaptive Cue seeks the smallest useful resource the user can successfully execute from.

Adaptive Response seeks the shortest complete, speakable response likely to improve execution.

If complete lines are working, preserve them.

Do not compress merely because a cue is shorter.

Continuation remains a runtime-selected resource for lost words, sentence endings, prepared talking points, repeatable lines, interruption recovery, or language already in queue.

## ARCHITECTURE

One GEORGE.

One LIVE runtime.

One signal-to-support pipeline.

One Support Behavior Composer.

One operational-resource vocabulary.

One receiver delivery policy.

Canonical owners:

- `lib/george/live-runtime/support-behavior-composer.ts`
- `lib/george/live-runtime/live-support-behavior-pipeline.ts`
- `lib/george/capabilities/live-support-panels.ts`
- `app/george/live-entry/LiveEntryClient.tsx`
- `lib/george/live-delivery/*`

`app/george/page.tsx` remains a UI mount, interaction, rendering, and pass-through surface only.

Do not add support-resource selection, continuation rules, response-length doctrine, signal interpretation, receiver policy, explicit style-lock authority, or duplicate LIVE runtime state there.

## USER AUTHORITY

Adaptive preference is a starting default.

Explicit user instruction is authoritative for the current room.

Do not automatically promote current-room constraints into the Operational Profile.

## CURRENT HOMEPAGE STATE

The homepage hero communicates:

1. Preparation before the conversation.
2. Support during the conversation.
3. Review after the conversation.

Each pass flips from the top, fades in the tagline, and types a short explanation.

Ask GEORGE, LIVE Support, and Help appear side by side on desktop.

Post-conversation doctrine:

- summary first;
- transcript immediately available on request;
- transcript treated as evidence.

## NEXT PRODUCT AREA

Inspect and redesign the active LIVE room.

Direction:

- remove the oversized permanent card;
- create a quiet operating surface;
- use realistic phone controls that can later translate to glasses;
- do not expose internal runtime concepts;
- do not add controls that duplicate GEORGE adaptation.

Controls to inspect:

- listening and connection state;
- receiver;
- pause or suspend support;
- repeat last support;
- discreet exit.

## VALIDATION

The adaptive-preference implementation passed:

- LIVE Entry smoke
- LIVE Runtime smoke
- production build
- LIVE Hub TypeScript build
- `git diff --check`

## WORKING STYLE

The owner does not manually edit code.

Every patch must be one complete copy-and-paste command beginning with `cd ~/ai-clarity`.

Do not use shell heredocs.

Use downloadable Python patch files for large changes.

Inspect first.

Patch one canonical owner.

Run focused smoke tests.

Run the production build.

Run the LIVE Hub build.

Run `git diff --check`.

Synchronize documentation after implementation passes.

Commit only validated work.

## PRODUCTION DIRECTION

Preserve adaptive behavior.

Validate with real LIVE room evidence.

Redesign LIVE without moving runtime authority into UI.

Optimize measured latency.

Preserve receiver portability.

Keep `app/george/page.tsx` thin.

Keep validation green.

Continue toward production freeze and portable runtime extraction.

No drift.
