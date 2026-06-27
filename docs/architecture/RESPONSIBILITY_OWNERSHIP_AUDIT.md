# GEORGE Responsibility Ownership Audit

Status: active production doctrine.

## Doctrine

Every responsibility has exactly one owner.

When two modules own the same responsibility, one of them is wrong.

When no module owns a responsibility, the architecture is incomplete.

When the wrong module owns a responsibility, portability suffers.

## Correct ownership model

### GEORGE Core

Owns judgment and authority.

Responsibilities:

- evidence evaluation
- authority decisions
- verification
- continuation authority
- proposition preservation
- repair
- outcome constraints
- confidence and correctness

GEORGE Core must not depend on React, browser APIs, microphones, WebSockets, UI layout, or device-specific delivery.

### LIVE Hub

Owns runtime orchestration and live evidence.

Responsibilities:

- transcript lifecycle
- turn lifecycle
- runtime packets
- rolling conversational evidence
- operational runtime state
- arbitration preparation
- handoff into GEORGE Core and Delivery

LIVE Hub should not become a UI layer, and it should not contain presentation-specific behavior.

### Delivery modules

Own how support reaches the user.

Responsibilities:

- voice / visual / silent routing
- modality selection
- playback timing
- delivery suppression
- delivery metrics
- delivery pacing

Delivery should not decide what GEORGE understands or believes. It executes support according to runtime/core outputs.

### Bridges

Own adaptation between systems.

Responsibilities:

- Hub to React handoff
- React to Hub handoff
- Delivery to visual surfaces
- Delivery to voice surfaces
- transport compatibility

Bridges should contain minimal business logic. They translate and hand off.

### Presentation surfaces (`page.tsx` and UI components)

Own what the user sees, touches, and permits.

Responsibilities:

- mounting
- rendering
- layout
- panels and modals
- button clicks
- input field state
- selected support style as UI state
- simple user preferences
- display of transcript, cue, status, errors, loading, listening states
- bridge mounting and handoff

Presentation should not own runtime intent, signal interpretation, cue depth, prompt contracts, arbitration, continuation intelligence, delivery policy, or portable runtime logic.

### Archive

Owns shelved ideas and rationale.

Responsibilities:

- PRO LIVE / campaign concepts
- retired implementation rationale
- future recovery rules
- product decisions that should not affect production code today

Archive preserves ideas, not obsolete production paths.

## Audit method

Before any patch, answer:

1. What responsibility is being changed?
2. Who owns it today?
3. Who should own it?
4. Is there duplicate ownership?
5. Is there no owner?
6. What is the smallest change that leaves exactly one owner?

Do not extract code until ownership is clear.

Do not delete code until its responsibility is either owned elsewhere or archived.

Do not migrate dead architecture into new files.

## Current ownership findings

| Responsibility | Correct owner | Current status | Action |
|---|---|---|---|
| Recent transcript continuity | LIVE Hub | Migrated to `recentTranscript` | Verify page mirror no longer authoritative |
| Continuation authority | GEORGE Core | Mostly owned by core/verification | Continue verifying no delivery/page duplication |
| Continuation repair | GEORGE Core | Owned by core/verification | Keep minimal; do not create second generator |
| Delivery routing | Delivery modules | Mostly owned by delivery router/bridge | Continue auditing voice and visual edges |
| TTS metric event names | Delivery/runtime metrics | Extracted into helper | Keep; behavior still needs ownership audit |
| TTS fetch behavior | Mixed | Still in `page.tsx` with tier/campaign remnants | Do not extract until dependencies are classified |
| Audio playback | Delivery vs presentation | Still mixed in `page.tsx` | Audit before extraction |
| Browser SpeechRecognition LIVE decisions | Archive | Removed from production path | Preserved in PRO LIVE / campaigns archive |
| Campaign runtime | Archive | Shelved but remnants remain | Do not migrate; remove only after verification |
| `handleLiveFinalTranscript()` decision call | GEORGE Core / LIVE runtime boundary | Adapter introduced, side effects remain in page | Continue ownership audit |
| UI rendering and controls | Presentation | Correctly belongs in `page.tsx` | Keep |
| Browser SpeechRecognition non-LIVE input | Presentation / browser adapter | `startListening()` now exits early during LIVE and remains available for non-LIVE voice input | Preserve until non-LIVE voice has a replacement owner |
| LIVE audio capture | LIVE audio runtime / hook boundary | `useLiveAudioRuntime()` owns Deepgram runtime start/stop/status and transcript callbacks | Keep page as consumer only; do not reintroduce LIVE browser SpeechRecognition loops |
| LIVE final transcript handoff | LIVE runtime adapter / page side-effect boundary | `handleLiveFinalTranscript()` calls `resolveLiveFinalTranscriptAction()` and executes resulting side effects | Next reduction target: move side-effect execution behind a delivery/handoff owner without changing authority |
| TTS request construction | Delivery boundary, with tier/config inputs from presentation/subscription state | `fetchSpeech()` still selects `/api/george/live/tts` vs `/api/tts` and carries `currentTier`, `activeCampaign`, `forceClose`, `voiceSpeed`, and `voiceType` | Split config classification before extraction; do not move campaign/tier assumptions into runtime |
| TTS playback queue | Delivery | `playQueue()` owns chunk turn IDs, audio element lifecycle, playback start/end metrics, and reveal timing | Candidate for extraction after request construction is classified |
| Speech interruption / cancellation | Delivery with presentation state reflection | `stopSpeech()` cancels queue, bridge speech, audio element, refs, and visible speaking state | Candidate for small helper only after playback extraction plan is clear |
| Spoken line memory | LIVE runtime evidence | `speakText()` writes `rememberLiveSpokenLine()` state during LIVE before queueing audio | Keep with LIVE evidence owner; do not bury inside generic audio playback |

## Speech lifecycle inspection notes

Current branch inspected: `live-hub-runtime`.

`startListening()` is now guarded so browser SpeechRecognition does not own LIVE listening. If `liveMode` is true, it returns immediately. That means browser SpeechRecognition should be treated as non-LIVE voice input until a separate replacement exists.

`useLiveAudioRuntime()` already provides a better LIVE audio ownership boundary. It owns runtime start, stop, emergency stop, status, interim transcript state, final transcript cleanup, and callback handoff into the page.

`fetchSpeech()` should not be extracted wholesale yet. It still mixes production TTS concerns with subscription/campaign/config inputs:

- Smart tier blocking
- LIVE vs normal TTS endpoint selection
- campaign mode selection
- force close
- voice speed
- tier
- voice type
- LIVE TTS request/audio metrics

`playQueue()` is closer to a true Delivery responsibility. It owns:

- speech queue draining
- LIVE TTS turn ID generation
- audio element lifecycle
- playback start timing
- playback start/end metrics
- reveal timing for pending assistant messages
- pause timing between chunks

`stopSpeech()` is a shared cancellation primitive. It currently cancels delivery side effects and reflects presentation state. It should move only after playback ownership is clearer.

`speakText()` is an orchestration seam, not just playback. It currently owns:

- user permission / voice-on guard
- iOS guard
- legacy-vs-hub suppression
- speech cleanup and chunking
- LIVE spoken-line memory
- queue selection
- delivery execution
- visible error state

Do not move `speakText()` as one block. Split only after deciding what belongs to Delivery, LIVE evidence, and Presentation state.

## Next audit targets

1. Verify `liveContextBufferRef` is no longer an authoritative owner of conversational memory.
2. Verify `handleLiveFinalTranscript()` now only executes side effects and handoff.
3. Classify speech lifecycle responsibilities:
   - `fetchSpeech()`
   - `playQueue()`
   - `stopSpeech()`
4. Classify remaining campaign references as active, archived, or removable.
5. Keep reducing `page.tsx` only where it owns non-presentation responsibilities.

## Next safe implementation move

Do not extract `fetchSpeech()` yet.

The safest next implementation move is to create a small Delivery-owned helper for pure audio playback mechanics only after confirming no UI behavior changes:

- keep TTS request construction in `page.tsx` temporarily
- keep tier/campaign/voice config in `page.tsx` temporarily
- keep LIVE spoken-line memory outside the playback helper
- move only audio element playback lifecycle and playback metrics behind a delivery helper

This would reduce `page.tsx` ownership without migrating subscription, campaign, or GEORGE authority concerns into Delivery.
