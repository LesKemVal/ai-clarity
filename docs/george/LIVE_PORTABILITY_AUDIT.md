# LIVE Portability Audit

**Status:** PASS  
**Validated commit:** `6fadb44`  
**Generated:** 2026-07-17 23:57 UTC

## Audit boundary

The audit inspected every JavaScript and TypeScript source file under:

```text
lib/george/live-runtime
```

It verified that the portable LIVE runtime does not directly own browser or DOM APIs and does not import from `lib/george/live-host`.

## Prohibited runtime ownership

The audit checks for direct runtime ownership of:

- `window`
- `document`
- `localStorage`
- `sessionStorage`
- `navigator`
- `indexedDB`
- browser lifecycle events
- browser audio and speech synthesis
- media recording
- DOM element types
- imports from `live-host`

## Result

- Runtime source files inspected: **49**
- Host source files observed: **8**
- Portability violations: **0**
- Qualification and build validation: **PASS**

## Portable runtime files

- `lib/george/live-runtime/approved-delivery-history.ts`
- `lib/george/live-runtime/approved-delivery-transform.ts`
- `lib/george/live-runtime/context-signals.ts`
- `lib/george/live-runtime/continuation-state.ts`
- `lib/george/live-runtime/cue-depth.ts`
- `lib/george/live-runtime/governed-live-cue.ts`
- `lib/george/live-runtime/index.ts`
- `lib/george/live-runtime/line-transforms.ts`
- `lib/george/live-runtime/live-action-authority.ts`
- `lib/george/live-runtime/live-attention-manager.ts`
- `lib/george/live-runtime/live-awareness-buffer.ts`
- `lib/george/live-runtime/live-awareness-pipeline.ts`
- `lib/george/live-runtime/live-awareness-reconciliation.ts`
- `lib/george/live-runtime/live-behavior-engine.ts`
- `lib/george/live-runtime/live-behavior-executor.ts`
- `lib/george/live-runtime/live-entry-briefing.ts`
- `lib/george/live-runtime/live-entry-reasoning.ts`
- `lib/george/live-runtime/live-fast-path.ts`
- `lib/george/live-runtime/live-final-transcript-adapter.ts`
- `lib/george/live-runtime/live-friction.ts`
- `lib/george/live-runtime/live-guidance.ts`
- `lib/george/live-runtime/live-influence-map.ts`
- `lib/george/live-runtime/live-intent-runtime.ts`
- `lib/george/live-runtime/live-interaction-continuity.ts`
- `lib/george/live-runtime/live-outcome-drift.ts`
- `lib/george/live-runtime/live-outcome-observation.ts`
- `lib/george/live-runtime/live-outcome-review.ts`
- `lib/george/live-runtime/live-overlap-recovery.ts`
- `lib/george/live-runtime/live-room-priorities.ts`
- `lib/george/live-runtime/live-room-state.ts`
- `lib/george/live-runtime/live-runtime-authority.ts`
- `lib/george/live-runtime/live-runtime-context.ts`
- `lib/george/live-runtime/live-runtime-state.ts`
- `lib/george/live-runtime/live-speaker-persistence.ts`
- `lib/george/live-runtime/live-support-ranking.ts`
- `lib/george/live-runtime/live-transcript-controller.ts`
- `lib/george/live-runtime/live-tts-metrics.ts`
- `lib/george/live-runtime/opportunity-continuity.mjs`
- `lib/george/live-runtime/opportunity-continuity.ts`
- `lib/george/live-runtime/outcome-consistency.mjs`
- `lib/george/live-runtime/outcome-consistency.ts`
- `lib/george/live-runtime/outcome-reassessment.ts`
- `lib/george/live-runtime/prep-runtime.ts`
- `lib/george/live-runtime/pro-live-boundary.ts`
- `lib/george/live-runtime/speech-queue.ts`
- `lib/george/live-runtime/spoken-memory.ts`
- `lib/george/live-runtime/support-behavior-composer.ts`
- `lib/george/live-runtime/support-style.ts`
- `lib/george/live-runtime/transcript-routing.ts`

## Browser host files

- `lib/george/live-host/audio-playback.ts`
- `lib/george/live-host/draft-restoration.ts`
- `lib/george/live-host/live-outcome-observation.ts`
- `lib/george/live-host/live-prep-storage.ts`
- `lib/george/live-host/live-runtime-owner.ts`
- `lib/george/live-host/live-runtime-usage.ts`
- `lib/george/live-host/live-support-preferences.ts`
- `lib/george/live-host/session-controller.ts`

## Production rule

`lib/george/live-runtime` owns portable operational intelligence, policy, reasoning, composition, and state transformation.

`lib/george/live-host` owns browser integration, persistence, lifecycle, playback, restoration, and other environment-specific effects.

Runtime code must not import host code. Host adapters may invoke portable runtime behavior.
