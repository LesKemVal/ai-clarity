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
| Recent transcript continuity | LIVE Hub | `liveContextBufferRef` removed; no current search hits on branch | Treat as resolved unless a new page-level transcript buffer appears |
| Continuation authority | GEORGE Core | Mostly owned by core/verification | Continue verifying no delivery/page duplication |
| Continuation repair | GEORGE Core | Owned by core/verification | Keep minimal; do not create second generator |
| Delivery routing | Delivery modules | Mostly owned by delivery router/bridge | Continue auditing voice and visual edges |
| TTS metric event names | Delivery/runtime metrics | Extracted into helper | Keep; behavior still needs ownership audit |
| TTS fetch behavior | Mixed | Still in `page.tsx` with tier/campaign remnants | Do not extract until dependencies are classified |
| Audio playback | Delivery | Audio element lifecycle moved to `audio-playback.ts` | Keep request construction and spoken memory outside helper |
| Browser SpeechRecognition LIVE decisions | Archive | Removed from production path | Preserved in PRO LIVE / campaigns archive |
| Campaign runtime | Archive | Shelved but remnants remain; startup clears campaigns and activeCampaignId | Do not migrate; remove only after field-level references are replaced or proven inert |
| Campaign delivery fallback | Presentation / compatibility residue | `resolvedDeliveryMode` still reads `activeCampaign?.deliveryMode` before voiceOn fallback | Replace only after confirming no active UI sets campaigns |
| Campaign posture/output fallback | Compatibility residue | `resolvedLivePosture`, `resolvedOutputStyle`, and desired-outcome fallbacks still read campaign fields | Keep until LIVE posture/objective paths are fully non-campaign-owned |
| Campaign chat payload | Compatibility residue | `/api/chat` payload still includes `activeCampaign` only when campaign-like prompt context is active | Keep until backend no longer expects this optional shape |
| Campaign no-op helpers | Archive residue | `syncCampaignEnvironment()` is a no-op and campaign persistence effect returns immediately | Deletion candidate after reliable local grep/build |
| `handleLiveFinalTranscript()` decision call | GEORGE Core / LIVE runtime boundary | Adapter introduced; authority resolution belongs to GEORGE Core through `resolveLiveFinalTranscriptAction()` | Keep authority out of page; inspect side-effect execution separately |
| LIVE final transcript side effects | Presentation / Delivery handoff boundary | `handleLiveFinalTranscript()` still executes logs, continuation-route suppression, buy-time timer, speak handoff, and send handoff | Do not extract yet; first classify whether these are delivery actions, UI effects, or runtime timers |
| UI rendering and controls | Presentation | Correctly belongs in `page.tsx` | Keep |
| Browser SpeechRecognition non-LIVE input | Presentation / browser adapter | `startListening()` now exits early during LIVE and remains available for non-LIVE voice input | Preserve until non-LIVE voice has a replacement owner |
| LIVE audio capture | LIVE audio runtime / hook boundary | `useLiveAudioRuntime()` owns Deepgram runtime start/stop/status and transcript callbacks | Keep page as consumer only; do not reintroduce LIVE browser SpeechRecognition loops |
| TTS request construction | Delivery boundary, with tier/config inputs from presentation/subscription state | `fetchSpeech()` still selects `/api/george/live/tts` vs `/api/tts` and carries `currentTier`, `activeCampaign`, `forceClose`, `voiceSpeed`, and `voiceType` | Split config classification before extraction; do not move campaign/tier assumptions into runtime |
| TTS playback queue | Delivery | Queue draining moved to `speech-queue.ts`; duplicate startup state removed from `playQueue()` | Keep chunk request construction outside queue helper |
| Speech interruption / cancellation | Delivery with presentation state reflection | `stopSpeech()` now calls `clearSpeechQueue()` but still owns audio cancellation and visible speaking state | Candidate for audit after final transcript side effects are classified |
| Spoken line memory | LIVE runtime evidence | `speakText()` writes `rememberLiveSpokenLine()` state during LIVE before queueing audio | Keep with LIVE evidence owner; do not bury inside generic audio playback |
| `speakText()` orchestration seam | Presentation-to-Delivery boundary | Currently acceptable: coordinates permission, suppression, text prep, spoken memory, queue replacement, and delivery start | Do not extract as one block; no obvious safe 15-30 line extraction remains right now |
| Legacy governor runtime memory | Archive / legacy governor bridge | `liveRuntimeMemoryRef` remains for `injectGovernedLiveCue()` and `/api/george/live/govern`, not as active conversational transcript memory | Keep classified as legacy until call path is proven removable |
| Legacy governor page bridge | Archive / legacy bridge | `canGovernorInjectLiveCue()` and `injectGovernedLiveCue()` remain in `page.tsx`; current inspected active Deepgram path uses final transcript adapter instead | Do not migrate; remove only after direct call-path search/build verification |
| LIVE governor API route | Legacy/API compatibility | `/api/george/live/govern` still performs access checks, support-style normalization, live voice governance, reasoning fallback, and continuation evidence safeguards | Do not delete with page bridge unless all test/legacy consumers are classified |

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

`playQueue()` is now a delivery handoff seam. It supplies the page-specific callbacks and dependencies needed by `drainSpeechQueue()` but no longer duplicates queue startup state before handing off to the helper.

`speakText()` is currently the correct orchestration seam between Presentation intent and Delivery queue. It still owns:

- permission / UI gating
- voice enabled checks
- iOS/browser guard
- legacy-vs-hub suppression
- text cleaning
- chunk generation
- LIVE spoken-line memory update
- queue replacement decision
- call into `playQueue()`
- visible voice error fallback

Ownership conclusion: do not patch `speakText()` right now. The remaining logic is mostly the coordination boundary between Presentation intent and Delivery queue. It is acceptable for `page.tsx` to hold this seam temporarily while it coordinates UI permission, hub/legacy suppression, text preparation, LIVE evidence update, and delivery start.

`stopSpeech()` is a shared cancellation primitive. It currently cancels delivery side effects and reflects presentation state. It should move only after playback ownership is clearer.

## LIVE final transcript inspection notes

`resolveLiveFinalTranscriptAction()` is the correct GEORGE Core / LIVE runtime boundary. It receives transcript, routing state, overlap evidence, last spoken line, and desired outcome, then delegates to `resolveGeorgeCoreLiveExecution()`.

`handleLiveFinalTranscript()` should not own authority. Current inspection shows authority resolution has already moved out of page-level logic. The remaining page code executes effects after an authority result exists:

- update `lastLiveFinalTranscriptRef`
- log the action for debugging
- suppress legacy continuation when `liveDeliveryStyle === 'continue'`
- optionally warn when an ignored action is debug-visible
- start and expire local buy-time timer
- hand a `speak` action to `speakText()`
- hand a `send` action to `handleSend()` with `source: 'live_transcript'`

Ownership conclusion: do not move these side effects yet. The next step is to classify action execution into a possible `live-final-transcript-effects` helper only if it can remain dependency-injected and avoid importing React state, browser globals beyond timers, or GEORGE authority.

## LIVE context buffer inspection notes

`liveContextBufferRef` is no longer present on the current `live-hub-runtime` branch. It should no longer be treated as an authoritative page-level conversational memory owner.

Do not confuse the removed `liveContextBufferRef` with `liveRuntimeMemoryRef`. The latter is legacy governor/cue memory used by `injectGovernedLiveCue()` and `/api/george/live/govern`; it tracks accepted carry count, override count, hesitation count, preferred force, tone correction, and communication notes. That is not the active transcript continuity owner.

Active LIVE evidence now flows through more specific boundaries:

- `useLiveAudioRuntime()` for audio runtime transcript callbacks
- `resolveLiveFinalTranscriptAction()` for final transcript action authority
- `lastLiveFinalTranscriptRef` for final transcript routing continuity
- `liveLastSpokenUtteranceRef` / spoken-memory helpers for overlap and repetition evidence
- prepared runtime support from `prep-runtime` for room/objective/user-position context

Ownership conclusion: the old page-level rolling transcript buffer is resolved. The next relevant cleanup is legacy governor/campaign classification, not another transcript buffer extraction.

## Legacy governor inspection notes

The legacy governor bridge is split across page and API responsibilities.

`canGovernorInjectLiveCue()` is a page-level bridge to `/api/george/live/govern`. It sends transcript, support style, live assist mode, legacy runtime memory, and active runtime support. It does not appear to be part of the active Deepgram transcript -> router -> controller -> action-authority path inspected so far.

`injectGovernedLiveCue()` mutates `liveRuntimeMemoryRef` based on user overrides, hesitation, tone correction, and compression requests, then conditionally sets a pending assistant message when the governor allows a cue. This is legacy adaptive cue behavior and should not be migrated into the new LIVE Hub without a specific product decision.

`/api/george/live/govern` is not equivalent to the page bridge. The route still performs useful standalone responsibilities: rate limiting, LIVE access verification, support-style normalization, `governLiveVoice()`, `reasonLiveNextMove()`, and final continuation evidence replacement. It may still support test pages or compatibility surfaces even if the page bridge is retired later.

Ownership conclusion: classify the page bridge as archival/legacy, not active core runtime. Classify the API route as compatibility/legacy service until all callers and test surfaces are inspected. Do not delete either from GitHub tooling without a local build after removing the bridge and verifying no direct references remain.

## Campaign inspection notes

Campaign architecture is explicitly shelved in `docs/architecture/PRO_LIVE_CAMPAIGNS.bak.md`. The active rule is: do not expand campaign runtime, do not add campaign UX, do not route users into campaigns, and do not let campaign state govern Normal GEORGE or individual LIVE.

Current `page.tsx` inspection shows campaigns are disabled at startup by setting `campaigns` to `[]` and `activeCampaignId` to `null`. Campaign persistence is also inert because the persistence effect immediately returns.

However, campaign references are still entangled as optional fallbacks or compatibility fields:

- `GeorgeCampaign` type remains for local state and payload typing.
- `activeCampaign` is derived from empty/inert state but still referenced across posture, delivery, desired outcome, and chat payload construction.
- `resolvedDeliveryMode` uses `activeCampaign?.deliveryMode || (voiceOn ? 'audio' : 'text')`.
- `resolvedLivePosture` and `resolvedOutputStyle` still read campaign fields before posture/context fallbacks.
- desired outcome paths still read `activeCampaign?.desiredOutcome` and `activeCampaign?.currentGoal` before LIVE runtime support fallbacks.
- `/api/chat` still receives an `activeCampaign` object only when `campaignContextActive` is true.
- `syncCampaignEnvironment()` is currently a no-op.

Ownership conclusion: campaigns are archived/inert, but their references are not yet safe for blind deletion. The next cleanup should be field-by-field replacement: first remove no-op helpers and impossible state paths after local grep/build, then replace activeCampaign fallbacks with LIVE runtime support equivalents where behavior is identical.

## Next audit targets

1. Inspect direct call paths for `syncCampaignEnvironment()`, `setCampaigns()`, and `setActiveCampaignId()` with reliable local grep before deleting campaign no-ops.
2. Inspect direct call paths for `injectGovernedLiveCue()` and `canGovernorInjectLiveCue()` with reliable local grep before deleting.
3. Classify `/api/george/live/govern` consumers, including test pages, before deleting or changing route behavior.
4. Keep reducing `page.tsx` only where it owns non-presentation responsibilities.

## Next safe implementation move

Do not extract `fetchSpeech()` yet.

Do not extract `speakText()` yet.

Do not extract final transcript side effects yet.

Do not migrate legacy governor behavior into the new LIVE Hub.

The safest next move is local grep/build around archived no-op campaign helpers. If `syncCampaignEnvironment()` has no callers, it is a deletion candidate. If campaign state setters have only startup-clearing usage, campaign local state can become a later deletion candidate after replacing fallbacks.

This preserves behavior while leaving speech queue lifecycle with the queue helper, browser playback mechanics with the playback helper, LIVE spoken memory in the runtime evidence path, and `speakText()` as a temporary orchestration seam.
