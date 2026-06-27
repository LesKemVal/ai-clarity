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

## Next audit targets

1. Verify `liveContextBufferRef` is no longer an authoritative owner of conversational memory.
2. Verify `handleLiveFinalTranscript()` now only executes side effects and handoff.
3. Classify speech lifecycle responsibilities:
   - `fetchSpeech()`
   - `playQueue()`
   - `stopSpeech()`
4. Classify remaining campaign references as active, archived, or removable.
5. Keep reducing `page.tsx` only where it owns non-presentation responsibilities.
