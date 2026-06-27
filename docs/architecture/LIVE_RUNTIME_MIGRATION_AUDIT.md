# GEORGE LIVE Runtime Migration Audit

Status: active production audit.

## Runtime authority

Production LIVE behavior should continue moving out of `app/george/page.tsx` and into portable runtime surfaces:

- `live-hub/src/**`
- `lib/george/live-hub/**`
- `components/george/live/*Bridge.tsx`
- `lib/george/live-delivery/**`
- `lib/george/core/verification/**`

`page.tsx` should become a mount/composition surface, not the source of LIVE reasoning or delivery behavior.

## Current authority map

### Migrated / replaced

- Turn identity is now generated or preserved through the LIVE hub path.
- Delivery routing is handled by `LiveHubDeliveryBridge` and `routeGeorgeDeliveryCue()`.
- Continuation authority and repair now run through the hub delivery path.
- Recent transcript continuity was migrated from the legacy `liveContextBufferRef` concept into the LIVE hub as `recentTranscript`.
- `transcript` remains the latest/governing utterance.
- `recentTranscript` is continuity evidence only; it may clarify premise and speaker direction, but it must not override the latest utterance.

### Production path

- Deepgram LIVE hub owns production LIVE listening authority.
- Runtime packets should carry separated evidence:
  - `transcript` = latest/governing utterance
  - `recentTranscript` = continuity evidence
  - objective/context = directional constraints

### Legacy / retired / removable after verification

The following browser-STT LIVE decision branches are guarded by `LEGACY_BROWSER_STT_LIVE_DECISIONS_ENABLED = false` and should be treated as retired legacy unless proven otherwise:

- proactive conversational guidance inside browser SpeechRecognition result handling
- old live sales signal detection
- old campaign performance tracking in LIVE transcript handling
- old injected cue branches tied to browser-STT LIVE decisions
- PRO LIVE / campaign runtime behavior

PRO LIVE and campaigns are shelved. Do not migrate them into the production LIVE hub.

### Still requires careful treatment

Do not delete without separate verification:

- browser `SpeechRecognition` setup, because it may still support non-LIVE voice input
- `interimTranscript`, because UI surfaces may still read it
- `handleLiveFinalTranscript()`, because it remains wired through `liveTranscriptSubmitRef`
- imports that appear campaign-related but may still be referenced by non-dead code
- TTS timing metrics still living in `page.tsx`

## Cleanup rule

Do not delete code from `page.tsx` merely because it looks old.

For each removal candidate, classify it first:

1. migrated
2. replaced
3. still active
4. shelved/dead

Then remove in small commits with build verification after each pass.

## Next recommended audit targets

1. Verify whether any code still depends on `liveContextBufferRef` after hub `recentTranscript` migration.
2. Verify `handleLiveFinalTranscript()` responsibilities and whether non-continuation LIVE modes still depend on it.
3. Verify TTS timing metrics and move them behind delivery/runtime surfaces when possible.
4. Remove retired campaign/PRO LIVE imports and branches only after TypeScript confirms they are unused or isolated.
