# GEORGE Production Tracker

## Authority

This document is the primary production authority for the current GEORGE implementation.

Read in this order:

1. `docs/george/PRODUCTION_TRACKER.md`
2. `docs/george/RUNTIME_ARCHITECTURE.md`
3. `docs/george/OPERATIONAL_PROFILE.md`

Continuation packets provide operational context only. They do not override implementation or these synchronized authorities.

## Current Phase

GEORGE is in **Production Completion and Product Qualification**.

The core runtime architecture is implemented, ownership-qualified, portability-qualified, and production-build validated.

The current work is:

- documentation synchronization;
- production UX inspection;
- release-surface cleanup;
- real-room LIVE acceptance testing;
- behavioral tuning from measured evidence;
- production freeze readiness.

The current work is not runtime redesign.

Do not:

- create another runtime;
- create another reasoning lane;
- redesign LIVE;
- move authority into rendering;
- move delivery policy into `app/george/page.tsx`;
- duplicate canonical ownership;
- manufacture architecture changes where ownership is already correct.

<!-- GEORGE_LIVE_INPUT_LATENCY_OPTIMIZATION_START -->
## Production Update — LIVE Input Latency Optimization

LIVE input transport latency has been reduced without moving timing authority into behavior, reasoning, delivery policy, rendering, or `app/george/page.tsx`.

Validated transport configuration:

- browser microphone audio chunks are sent every 100 ms;
- browser Deepgram endpointing is reduced from 350 ms to 250 ms;
- LIVE Hub Deepgram endpointing is reduced from 350 ms to 250 ms;
- terminal final-transcript release preserves the canonical 90 ms delay;
- standard final-transcript release preserves the canonical 140 ms delay;
- fragment final-transcript release preserves the canonical 210 ms delay.

Canonical ownership remains:

- `lib/george/live-voice/stt/deepgram-live-client.ts` owns browser microphone transport cadence and browser Deepgram endpointing;
- `live-hub/src/stt/deepgram-stream.ts` owns LIVE Hub provider transport endpointing;
- `lib/george/live-runtime/final-transcript-release-policy.ts` owns final-transcript release timing.

STT latency tuning is transport configuration, not behavioral authority.

This optimization does not create another runtime, reasoning lane, transcript owner, support-behavior authority, or delivery system.

Qualification:

- `npm run george:live-input-latency:qualify`
- full production build
- LIVE Hub TypeScript build
<!-- GEORGE_LIVE_INPUT_LATENCY_OPTIMIZATION_END -->

## Operational Learning and Memory — Production Qualified

GEORGE now has a complete operational-learning path from durable formula persistence through governed runtime retrieval.

Validated implementation:

- operational learning records are persisted through the canonical operational-memory owner;
- authenticated retrieval is isolated to the current user's durable formula library;
- retrieval context is normalized from current room, objective, and observed signals;
- candidate formulas are ranked before runtime use;
- retrieval policy selects only formulas that materially match the present work;
- selected formulas are converted into supporting runtime evidence;
- empty or unusable retrieval does not create provider context;
- the canonical runtime pipeline consumes operational-memory evidence without transferring reasoning authority;
- `app/api/chat/route.ts` owns retrieval invocation and observational retrieval telemetry;
- LIVE execution telemetry remains separate and does not acquire operational-memory ownership.

Operational memory is supporting evidence, not instruction or authority.

Current-turn meaning, active desired outcome, present evidence, explicit user direction, and canonical operational judgment remain authoritative.

Focused qualification:

```text
node --experimental-strip-types scripts/george-operational-memory-retrieval-qualification.mjs
```

Validated commits:

```text
88ca0a4 Persist operational learning records
6ceb99b Wire operational memory retrieval
5969eaf Qualify operational memory retrieval
```

## Product Doctrine

GEORGE is one operational intelligence.

Normal and LIVE are operating modes, not separate intelligences.

Normal prepares.

LIVE executes.

Both modes share canonical outcome reasoning, judgment, strategy, user understanding, and operational profile. `execution_policy` is the canonical boundary where the same resolved intelligence receives mode-specific execution constraints.

GEORGE reasons from available signals, not words alone.

Information has operational value when it can improve the user's probability of reaching the desired outcome.

User agency remains primary. GEORGE may recommend, prepare, steer, continue, respond, repeat, recover, or remain silent, but the user retains final judgment and control.

## Locked Runtime Flow

```text
Available signal
↓
Shared outcome reasoning
↓
Operational judgment
↓
Conversation strategy
↓
Execution policy
↓
LIVE support behavior selection
↓
Operational assessment
↓
Receiver Policy cue composition and surface shaping
↓
Delivery Router
↓
Delivery Bridge
↓
Visual Presentation Policy
↓
Voice, visual, or silent realization
```

Rendering consumes approved delivery. Rendering does not recompute upstream reasoning, support behavior, operational assessment, receiver policy, or routing.

## Canonical Ownership

### Shared runtime reasoning

Canonical owners under `lib/george/runtime/*` own shared interpretation, outcome reasoning, trajectory assessment, operational judgment, strategy, execution policy, runtime context, and provider-request assembly.

Normal and LIVE must not create competing versions of these responsibilities.

### Normal Provider Realization

Canonical Normal text-provider owner:

- `lib/george/runtime/provider/normal-provider.ts`

Responsibilities:

- execute Normal text realization through OpenAI or Groq;
- preserve provider selection resolved by the canonical runtime pipeline;
- return complete user-facing text;
- return provider semantic intent from the same realization call;
- preserve valid plain-text provider output when semantic metadata is absent;
- avoid creating another reasoning, judgment, or product authority.

OpenAI and Groq are provider realization options for the same GEORGE intelligence. They are not separate modes or runtimes.

`app/api/chat/route.ts` coordinates the resolved provider request and Groq-to-OpenAI fallback without recreating provider-selection policy.

The route separately owns OpenAI Responses API execution for image input. This multimodal capability does not duplicate Normal text-provider realization.

### Support Behavior Composer

Canonical owner:

- `lib/george/live-runtime/support-behavior-composer.ts`

Responsibilities:

- interpret the current adaptive starting preference;
- select the smallest operational resource that materially improves execution;
- select cue, line, continuation, response, recovery, repeat, or silence from current evidence;
- preserve explicit user instructions for the current room;
- keep support decisions current-turn and inspectable.

Receiver profile is deliberately absent from behavior selection. Receiver profile changes realization downstream; it must not change the intelligence or support behavior selected.

### Operational Assessment

Canonical owner:

- `lib/george/live-runtime/operational-assessment.ts`

Responsibilities:

- resolve the approved action;
- preserve user-facing evidence when valid;
- describe outcome impact when supported;
- preserve confidence;
- reject internal reasoning language from user-facing evidence.

Operational Assessment does not own receiver-specific cue composition.

### Receiver Policy

Canonical owner:

- `lib/george/live-delivery/receiver-policy.ts`

Responsibilities:

- compose operational action, evidence, and outcome impact for delivery style;
- select available delivery surfaces from receiver profile and voice availability;
- shape concise spoken audio;
- shape readable visual-only guidance;
- shape persistent visual reference accompanying audio;
- enforce receiver-specific text limits;
- preserve structured visual guidance;
- provide receiver-policy routing reasons.

`composeGeorgeOperationalCueText` is exported only by Receiver Policy.

Internal receiver identifiers remain:

- `audio_only`
- `audio_visual`
- `visual_only`

User-facing product terminology remains:

- **Audio** — spoken support through earbuds or audio glasses;
- **Glasses** — readable guidance through supported text-capable glasses, with audio available for immediate steering;
- **Desktop / Mobile** — the responsive web workspace as the readable delivery surface.

### Delivery Router

Canonical owner:

- `lib/george/live-delivery/delivery-router.ts`

Responsibilities:

- resolve the canonical operational assessment once;
- send action plus explanatory text through Receiver Policy;
- convert approved receiver-policy results into delivery cues;
- preserve the governing operational assessment on the delivery cue;
- route voice, visual, and silent realization without rendering.

### Delivery Behavior Resolver

Canonical owner:

- `lib/george/live-delivery/delivery-behavior-resolver.ts`

Responsibilities:

- consume the Support Behavior Composer decision;
- translate the selected operational resource into delivery behavior;
- avoid creating another support-behavior authority.

### Delivery Bridge

Canonical owner:

- `components/george/live/LiveHubDeliveryBridge.tsx`

Responsibilities:

- subscribe to approved runtime delivery;
- apply delivery safeguards;
- invoke Delivery Router;
- dispatch approved voice and visual cues;
- remain free of competing support behavior, receiver shaping, and routing authority.

### Visual Presentation Policy

Canonical owner:

- `lib/george/live-delivery/visual-presentation-policy.ts`

Responsibilities:

- own presentation interruption and replacement policy;
- own duplicate suppression and priority replacement policy;
- own visual persistence timing;
- preserve Receiver Policy output without reshaping it;
- remain portable and rendering-independent.

Visual Presentation Policy is downstream of Receiver Policy, Delivery Router, and Delivery Bridge.

It must not compose support behavior, operational assessment, receiver policy, or delivery routing.

### Visual Bridge

Canonical owner:

- `components/george/live/LiveHubVisualCueBridge.tsx`

Responsibilities:

- subscribe to approved delivery;
- invoke Visual Presentation Policy;
- render approved visual guidance;
- preserve Receiver Policy line structure;
- report visual delivery telemetry;
- replay approved delivery history when appropriate;
- avoid reshaping or recomposing receiver-policy text.

The Visual Bridge renders approved presentation. It does not own interruption, replacement, priority, duplicate-suppression, or persistence policy.

Validated presentation policy:

- audio-visual reference holds for 12 seconds;
- visual-only guidance holds for 20 seconds;
- audio-only does not render a visual cue.

The longer visual-only persistence is presentation policy only. It does not change behavior composition, operational assessment, receiver policy, or delivery routing.

### LIVE Runtime Adapter

Canonical owner:

- `lib/george/live-hub/live-runtime-adapter.ts`

Responsibilities include:

- preserve originating `turnId` ownership;
- reject ACTION_CUE packets without originating runtime identity;
- preserve each queued transcript's captured delivery style across reconnect;
- prevent newer context synchronization from rewriting already-accepted transcript policy;
- maintain runtime continuity without becoming another reasoning owner.

### LIVE Host and Browser Integration

Canonical browser/session boundary:

- `lib/george/live-host/*`

Portable owners:

- `lib/george/live-runtime/*`
- `lib/george/live-delivery/*`

Portable runtime owners must not depend on application routes, UI components, live-host integration, or browser execution globals.

`lib/george/live-host/live-application-host.ts` composes browser and session integration outside portable runtime owners.

### LIVE Hub Transcript and Provider Orchestration

Canonical owner:

- `live-hub/src/stt/deepgram-stream.ts`

Responsibilities include:

- transcript-to-provider orchestration;
- monotonic provider request generation;
- stale provider-result rejection;
- invalidation of unresolved provider work on newer final transcript, close, or error;
- prevention of superseded reasoning from reaching arbitration or delivery.

### Application Host

`app/george/page.tsx` is the application host and mount surface.

Valid responsibilities:

- hydrate and persist host preferences;
- mount LIVE bridges;
- expose host voice execution;
- execute approved speech;
- support user-controlled repeat, pause, stop, and compression actions;
- maintain browser-only integration that cannot belong in portable owners.

It must not own:

- shared reasoning;
- support behavior selection;
- operational assessment;
- receiver-specific cue composition;
- receiver surface selection;
- delivery routing;
- duplicate runtime authority.

The existing voice playback boundary uses playback-generation ownership so stale asynchronous TTS work cannot begin playback after a newer cue supersedes it.

## Adaptive LIVE Starting Preferences

The existing runtime supports two adaptive starting preferences:

- **Adaptive Cue** — recommended default;
- **Adaptive Response** — begins with concise, complete, immediately usable language.

These are starting preferences, not separate modes or runtimes.

### Adaptive Cue

Use the smallest operational resource that materially improves the user's probability of reaching the desired outcome.

Cue does not mean minimum word count regardless of usefulness. GEORGE may select a line, continuation, response, repeat, or recovery when evidence indicates that a cue is not translating into effective execution.

### Adaptive Response

Begin with the shortest complete, speakable response likely to improve execution.

Adaptive Response is not a verbose mode. GEORGE should preserve it while the user successfully interprets, personalizes, shortens, breaks down, and delivers complete language.

### Continuation

Continuation remains an operational resource selected by GEORGE, not a separate starting preference.

When sufficient evidence of intended language exists, GEORGE should restore that language rather than introduce unrelated wording.

### Explicit User Authority

An explicit instruction to remain with cues, responses, or short lines is authoritative for the current LIVE room until the user changes it.

Changing receiver profile must not reset the adaptive preference.

## Receiver-Specific Delivery Doctrine

### Audio

Audio must be:

- concise;
- sequential;
- speakable in one usable unit;
- repeatable;
- low-cognitive-load;
- optimized for immediate execution.

Receiver Policy flattens structured text for audio and applies style-specific limits.

### Visual-only

Visual-only may be:

- structured;
- persistent;
- skimmable;
- readable at a glance;
- more explanatory than audio;
- formatted as multiple short lines or bullets when useful.

Visual-only is not audio with the sound removed.

### Audio-visual

Audio carries immediate steering.

Visual carries persistent reference.

The visual reference may preserve more information than the spoken cue but remains downstream realization of the same selected support behavior.

## Runtime Safety and Continuity — Validated

The implementation currently validates:

- ACTION_CUE turn ownership;
- voice playback generation ownership;
- reconnect transcript delivery-policy ownership;
- stale provider reasoning rejection;
- stale reasoning invalidation;
- delivery deadlines;
- provider degradation;
- runtime restart continuity;
- reconnect transcript ownership;
- approved delivery replay;
- LIVE Hub resilience;
- recovery behavior;
- duplicate ownership prevention;
- runtime interface freeze;
- portable owner boundaries.

Missing runtime identity is treated as invalid rather than assigned to the most recent transcript.

A queued transcript retains the delivery style captured when the adapter accepted it.

A newer final transcript supersedes unresolved older provider work before stale output can reach delivery.

Stopping or superseding voice invalidates older asynchronous TTS and playback work.

## Validation Baseline

Latest validated branch:

```text
live-hub-runtime
```

## Canonical Execution-Imminence Ownership — Validated

Execution timing now has one canonical semantic owner.

Canonical flow:

```text
Runtime Signals
↓
Intent State
↓
Operational Judgment
↓
Execution Policy
↓
Active Outcome
```

Ownership boundaries:

- `lib/george/chat/runtime-signals.ts` interprets current-turn execution timing through `detectExecutionImminence()`;
- `GeorgeIntentState.executionImminent` carries canonical timing evidence through the shared runtime;
- Operational Judgment consumes canonical timing evidence and selects the operational posture;
- Execution Policy realizes the posture selected by Operational Judgment and does not reinterpret transcript language;
- Active Outcome consumes supplied execution timing and does not independently infer imminence;
- LIVE recommendation evidence does not own execution timing.

Removed duplicate ownership included independent timing-language interpretation inside Operational Judgment, Execution Policy, and Active Outcome.

Focused core qualification and the complete production build pass with this ownership consolidation.

Latest production synchronization baseline includes:

```text
5969eaf Qualify operational memory retrieval
6ceb99b Wire operational memory retrieval
88ca0a4 Persist operational learning records
74dbe5d Remove premature reassessment recorder contract
7851ab1 Remove duplicate operational formula store
3fe5ce7 Add formula reassessment recorder contract
```

Validated production command:

```text
npm run build
```

The production build runs the complete qualification chain before Next.js compilation.

Current validated results:

- GEORGE core smoke — PASS;
- GEORGE behavioral qualification — PASS;
- GEORGE LIVE Entry smoke — PASS;
- GEORGE conversation package smoke — PASS;
- GEORGE LIVE runtime smoke — PASS;
- GEORGE LIVE latency qualification — PASS;
- GEORGE LIVE input latency qualification — PASS;
- GEORGE early reasoning qualification — PASS;
- GEORGE stale reasoning qualification — PASS;
- GEORGE LIVE delivery deadline qualification — PASS;
- GEORGE latency optimization qualification — PASS;
- GEORGE LIVE behavioral qualification — PASS;
- GEORGE LIVE recovery qualification — PASS;
- GEORGE LIVE Hub resilience qualification — PASS;
- GEORGE reconnect transcript ownership qualification — PASS;
- GEORGE voice playback ownership qualification — PASS;
- GEORGE ACTION_CUE turn ownership qualification — PASS;
- GEORGE provider degradation qualification — PASS;
- GEORGE LIVE restart continuity qualification — PASS;
- GEORGE runtime interface freeze qualification — PASS;
- GEORGE duplicate ownership audit — PASS;
- GEORGE LIVE portability qualification — PASS;
- GEORGE preparation smoke — PASS;
- GEORGE operational-memory retrieval qualification — PASS;
- Next.js production build — PASS.

Latest ownership-audit result:

```text
Duplicate canonical owners: 0
Non-canonical imports: 0
Layer violations: 0
Circular dependencies observed: 0
```

The current Next.js warning that edge runtime disables static generation for the affected page remains a warning, not a production-build failure.

## Production Engineering Discipline

Always follow this order:

1. Inspect implementation.
2. Identify the canonical owner.
3. Detect duplicate ownership.
4. Patch only the canonical owner.
5. Build.
6. Resolve failures one at a time.
7. Run focused qualification when the change has a dedicated test.
8. Run the complete production build.
9. Synchronize documentation.
10. Commit one operational idea.

Additional rules:

- no blind compiler-error fixes;
- no giant patches;
- no page-level reasoning additions;
- no duplicate runtime implementations;
- no competing delivery owners;
- no documentation claims ahead of implementation;
- no production commit after a failed build;
- no redesign during qualification;
- no drift from user agency and outcome orientation.

## Current Production Status

### Runtime architecture

**VALIDATED AND FROZEN FOR PRODUCT QUALIFICATION**

The runtime interface freeze, portability boundary, ownership audit, resilience qualifications, and production build pass.

Architecture changes now require evidence of a genuine defect or missing production responsibility. Preference, presentation, or wording changes do not justify a new runtime owner.

### Documentation

**SYNCHRONIZED**

The production authorities now reflect the validated operational-learning, retrieval, runtime-evidence, telemetry, and qualification implementation:

1. `PRODUCTION_TRACKER.md`
2. `RUNTIME_ARCHITECTURE.md`
3. `OPERATIONAL_PROFILE.md`

These documents are authoritative while they remain synchronized with implementation.

### Product completion

**NEXT**

After all three production authorities are synchronized:

1. inspect `/george`, `/george/live-entry`, and `/george/live` as a user;
2. identify unnecessary friction, duplicated explanation, weak hierarchy, and perceived latency;
3. audit development-only and internal test routes before release;
4. run real-room LIVE acceptance scenarios;
5. tune behavior from measured evidence without redesigning architecture;
6. complete production freeze and release-readiness review.

## Real-Room LIVE Acceptance Scenarios

Required acceptance coverage:

- interview;
- investor meeting;
- difficult conversation;
- sales conversation;
- presentation;
- negotiation.

Evaluate:

- cue timing;
- continuation quality;
- response usefulness;
- visual readability and persistence;
- audio brevity and repeatability;
- recovery behavior;
- interruption handling;
- reconnect behavior;
- stale-response suppression;
- user control;
- movement toward the desired outcome.

Behavioral tuning must patch the canonical behavior, assessment, receiver-policy, routing, or host owner proven by inspection. It must not create a new runtime.

## Freeze Rule

Until implementation evidence proves otherwise, the canonical runtime architecture is frozen.

The next change after this tracker synchronization is synchronization of:

```text
docs/george/RUNTIME_ARCHITECTURE.md
```
