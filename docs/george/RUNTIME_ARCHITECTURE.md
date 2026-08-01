# GEORGE Runtime Architecture

## Authority

This document is the architectural authority for the current GEORGE implementation.

Read after:

```text
docs/george/PRODUCTION_TRACKER.md
```

Read before:

```text
docs/george/OPERATIONAL_PROFILE.md
```

The implementation remains the source of truth. This document is authoritative only while synchronized with the validated production runtime.

## Architectural Status

Current phase:

```text
Production Completion & Operational Formula Experience
```

The runtime architecture is frozen unless current implementation evidence proves a genuine architectural defect.

Operational Formula Experience work is a product-completion layer over the existing operational-memory and formula-intelligence architecture. It may extend canonical formula contracts and product surfaces, but it must not create another runtime, reasoning authority, retrieval path, learning owner, conversation-type registry, or page-level intelligence.

Canonical boundaries:

- `lib/george/operational-memory/*` owns operational formula contracts, persistence, evidence, scripts, reassessment, revision proposals, evolution, and lineage;
- `lib/george/live-entry/conversation-types.ts` owns Conversation Types;
- `app/george/library/*` presents canonical formula and script data;
- `app/george/page.tsx` remains a mount surface.

Do not create:

- another GEORGE;
- another LIVE runtime;
- another reasoning lane;
- another formula registry;
- another conversation-type registry;
- another operational-learning owner;
- page-level runtime or formula intelligence.

<!-- GEORGE_OPERATIONAL_FORMULA_EXPERIENCE_START -->
## Operational Formula Experience

GEORGE is in **Production Completion & Operational Formula Experience**.

The runtime architecture is largely complete. The active work is product completion around the existing operational-formula system. This work must document, organize, expose, and extend the current production assets without replacing them or introducing another runtime, reasoning authority, learning system, or ownership path.

Existing production assets include:

- operational formulas;
- authenticated persistence and retrieval;
- qualification evidence;
- confidence;
- success, contradiction, and unknown tracking;
- scripts;
- script execution and deviation tracking;
- reassessment;
- evolution;
- revision-proposal contracts and canonical ownership foundation;
- lineage;
- operational learning.

Validated Operational Formula Experience capabilities include:

- structured formula identity and version lineage;
- author and publisher metadata contracts;
- BRANESX verification metadata contracts;
- Proven By records;
- formula editing through the Operational Library and authenticated formula API;
- formula alternatives;
- script generation, retrieval, and Operational Library presentation;
- marketplace-readiness metadata;
- one canonical conversation-type catalog;
- expanded Operational Library formula, lineage, verification, publication, alternative, and script presentation.

Remaining work is downstream product workflow, UX refinement, and qualification expansion. It does not require another runtime, formula model, recommendation owner, learning owner, conversation-type registry, or Operational Library data authority.

Canonical ownership remains:

- formula contracts, persistence, evidence, reassessment, revision, and lineage: `lib/george/operational-memory/*`;
- formula retrieval and runtime-evidence policy: `lib/george/operational-memory/*`;
- conversation-type registry: `lib/george/live-entry/conversation-types.ts`;
- Operational Library presentation: `app/george/library/*`.

### Operational-learning ownership boundaries

Canonical rules:

- `formula-validator.ts` owns evidence aggregation, confidence calculation, and formula lifecycle status;
- reassessment records operational judgment and emits only `confirm`, `weaken`, or `insufficient_evidence`;
- reassessment does not mutate confidence or lifecycle state;
- the evolution engine preserves the canonical evolution seam but performs no passive structural derivation;
- `formula-derivation-service.ts` is the sole owner of intentional derived-formula creation and derived lineage creation;
- the Operational Library remains a presentation surface and does not acquire learning authority.

### Recommendation and executed-formula learning boundary

Operational Memory owns retrieval, derivation, reassessment, learning, and recommendation.

Recommendation occurs once for the active preparation decision. After the user intentionally selects a formula, the selected `formulaId`, `formulaVersion`, and source become authoritative execution identity.

The canonical preservation and learning chain is:

```text
LIVE Entry resolved formula selection
↓
LIVE setup
↓
browser-host LIVE completion
↓
Conversation Package `formulaSelection`
↓
Conversation Record `formulaSelection`
↓
Conversation Record Adapter
↓
`ConversationRecord.formulaExecution`
↓
Operational Memory
↓
exact formula/version reassessment
↓
evolution seam
```

Canonical owners:

- LIVE Entry owns the user-facing recommendation and selection step;
- LIVE setup carries resolved formula identity into execution;
- `lib/george/live-host/live-completion.ts` owns browser-host completion orchestration;
- `lib/george/live-runtime/live-interaction-continuity.ts` carries the selection into post-LIVE continuity without acquiring operational-memory authority;
- `lib/george/conversation-packages/*` owns Conversation Package persistence and Conversation Record projection;
- `lib/george/operational-memory/conversation-record-adapter.ts` owns the sole conversion from valid `formulaSelection` to `formulaExecution`;
- `lib/george/operational-memory/operational-memory.ts` owns learning orchestration, exact-version lookup, reassessment invocation, and evolution invocation;
- the reassessment engine owns reassessment judgment;
- the evolution engine owns the evolution seam;
- `formula-derivation-service.ts` alone owns intentional derived-formula and derived-lineage creation.

Operational Memory must not reassess a different version when the exact executed version is unavailable. Missing or mismatched identity produces restraint rather than inferred execution.

Learning may improve later recommendations. It may not reopen the current selection, override user choice, or create another recommendation authority.

This path creates no second runtime, formula owner, reassessment owner, evolution owner, derivation owner, or learning owner.

### Canonical Ownership Inspection Completion

The operational-learning, operational-memory, conversation-type, Operational Library, and LIVE Entry ownership boundaries have been inspected against implementation.

Established ownership must not be reopened through broad inspection during ordinary continuation work. Inspect only the canonical owner affected by a specific production task.

A broader ownership review is warranted only when:

- qualification or runtime behavior indicates ownership drift;
- the duplicate-ownership audit reports a violation;
- a new responsibility is introduced; or
- implementation materially diverges from this architecture.

Operational-memory retrieval is complete as an architectural path unless production evidence proves a defect. LIVE completion orchestration remains browser-host responsibility and must not move into `app/george/page.tsx`.


The Operational Library consumes canonical formula and conversation data. It must not become another registry, formula owner, verification authority, learning system, or runtime.

GEORGE owns the operational formula and its lifecycle.

GEORGE owns formula creation, evidence, confidence, success, contradictions, revisions, lineage, reassessment, operational learning, and the decision that a formula remains operationally valid.

BRANESX verifies descriptive metadata claims attached to the formula. It does not verify or replace GEORGE's operational reasoning.

The Operational Library is a presentation surface. It consumes GEORGE-owned operational data and BRANESX-verified metadata without becoming a formula owner, metadata verification authority, or mutation path.

Users may edit descriptive metadata they own. BRANESX verification records are system-managed. Any change to verified metadata must stale or clear the affected verification until the updated claims are verified again.

The formula lifecycle is:

```text
GEORGE operational formula lifecycle
↓
Descriptive metadata authoring
↓
BRANESX metadata verification
↓
Published Formula
↓
Proven By
↓
GEORGE Operational Learning
↓
Revision
↓
Verification
↓
Next Published Version
```
<!-- GEORGE_OPERATIONAL_FORMULA_EXPERIENCE_END -->

## Material Motion Boundary

Material-language refinement is downstream of runtime reasoning, behavior selection, operational assessment, receiver policy, routing, and delivery approval.

Canonical flow remains:

```text
Approved product/runtime state
↓
Surface presentation policy
↓
Canonical material-motion primitives
↓
Component realization
```

Motion may communicate state change. Motion may not create state, reinterpret operational meaning, select support behavior, alter receiver policy, or become another runtime authority.

The canonical shared motion authority should live under:

```text
lib/george/ui/material-motion.ts
```

It owns shared timing and primitives for fade, collapse, slide, press, transient shimmer, and machine acknowledgement.

Components consume these primitives. They should not invent separate motion languages.

Popup 3 remains owned by LIVE Entry. Its presentation may be refined, but routing, briefing ownership, mechanics ownership, receiver policy, and runtime behavior must remain in their canonical owners.
<!-- GEORGE_MATERIAL_LANGUAGE_DOCTRINE_END -->

## One Intelligence, Two Operating Modes

GEORGE is one operational intelligence.

Normal and LIVE are operating modes.

They do not own separate:

- user understanding;
- desired-outcome reasoning;
- trajectory assessment;
- operational judgment;
- conversation strategy;
- memory;
- learning;
- operational profile.

Normal prepares.

LIVE executes.

The shared reasoning chain resolves intelligence before mode-specific execution constraints are applied.

Execution timing follows this canonical ownership chain:

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

Ownership rules:

- Runtime Signals interpret current-turn execution timing;
- Intent State carries canonical `executionImminent` evidence;
- Operational Judgment selects the operational posture;
- Execution Policy realizes Operational Judgment posture and must not reinterpret transcript language;
- Active Outcome trusts supplied execution-timing evidence;
- LIVE recommendation evidence does not own execution timing.

`execution_policy` is the canonical branch point between shared reasoning and mode-specific realization.

```text
Available information
↓
Conversation Signals
↓
Operational Signal Normalization
↓
Operational Signal Interpretation
↓
Shared Runtime Pipeline
↓
Outcome reasoning
↓
Trajectory assessment
↓
Operational judgment
↓
Conversation strategy
↓
Execution policy
├── Normal realization
└── LIVE realization
```

Presentation, delivery, receiver policy, rendering, and host execution are downstream consumers. They may not recompute upstream reasoning.

## Canonical Shared Runtime

Canonical shared owners under:

```text
lib/george/runtime/*
```

own the shared reasoning pipeline, including:

- provider resolution;
- outcome inference;
- previous-outcome inference;
- outcome evolution;
- trajectory assessment;
- operational judgment;
- conversation strategy;
- conversation-move resolution;
- context framing;
- operational-resource monitoring;
- execution policy;
- runtime-note assembly;
- runtime-context assembly;
- provider-request assembly.

The architecture target is:

```text
Rich canonical reasoning upstream
↓
One compact provider realization contract
↓
Provider realization
```

The provider realizes approved runtime authority. The provider does not replace GEORGE's judgment or create another runtime owner.

## Operational Signal Boundary

Canonical producer:

`lib/george/core/build-interpretation.ts`

Canonical signal owners:

- `lib/george/runtime/conversation-signals.ts`
- `lib/george/runtime/operational-signal-normalizer.ts`
- `lib/george/runtime/operational-signal-interpreter.ts`

Responsibilities:

- Conversation Signals detect conversational evidence.
- Operational Signal Normalizer produces canonical `OperationalSignal[]` values.
- Operational Signal Interpreter prepares those signals for shared runtime reasoning.
- `buildGeorgeCoreInterpretation()` coordinates the canonical signal pipeline.
- `app/api/chat/route.ts` transports canonical operational signals into the shared runtime.
- Operational Judgment and Conversation Strategy consume canonical signals without recreating signal ownership.

Conversation Strategy prefers canonical operational signals before transcript compatibility heuristics. Transcript heuristics remain temporary compatibility behavior and are not canonical ownership.

Canonical flow:

Conversation
↓
Conversation Signals
↓
Operational Signal Normalization
↓
Operational Signal Interpretation
↓
Shared Runtime Pipeline
↓
Operational Judgment
↓
Conversation Strategy

This preserves one signal interpretation path, one shared runtime, and one reasoning authority.

### Normal Provider Realization Boundary

Canonical Normal text-provider owner:

```text
lib/george/runtime/provider/normal-provider.ts
```

This owner:

- executes Normal text realization through OpenAI or Groq;
- preserves provider selection resolved by the canonical runtime pipeline;
- returns complete user-facing text;
- returns provider semantic intent from the same realization call;
- treats semantic intent as provider metadata, not as competing reasoning or judgment authority;
- preserves valid plain-text provider output when semantic metadata is absent.

OpenAI and Groq are provider realization options for the same GEORGE intelligence. They are not separate runtimes, operating modes, judgment systems, or product identities.

`app/api/chat/route.ts` coordinates the resolved provider request and Groq-to-OpenAI fallback without recreating provider-selection policy.

The route retains a separate OpenAI Responses API path for image input. That multimodal capability does not duplicate Normal text-provider realization.

## Operational Memory Retrieval Boundary

Operational memory is a shared reasoning resource. It is not a separate runtime, provider, judgment system, or operating mode.

Canonical owners:

```text
lib/george/operational-memory/operational-memory.ts
lib/george/operational-memory/redis-formula-library.ts
lib/george/operational-memory/retrieval-policy.ts
lib/george/operational-memory/runtime-evidence.ts
```

Responsibilities remain separated:

- Operational Memory coordinates durable learning and formula retrieval;
- the Redis formula library owns authenticated durable persistence and retrieval;
- Retrieval Policy normalizes current context, ranks candidates, and selects materially relevant formulas;
- Runtime Evidence converts selected formulas into a bounded supporting-evidence contract;
- the shared runtime pipeline decides how that evidence participates in current reasoning;
- `app/api/chat/route.ts` invokes retrieval and records observational retrieval telemetry.

Canonical flow:

```text
Authenticated user
↓
Current room, objective, and observed signals
↓
Operational Memory retrieval
↓
Formula ranking
↓
Retrieval Policy
↓
Operational-memory runtime evidence
↓
Shared runtime pipeline
↓
Provider-request assembly
```

Operational-memory evidence is optional.

When retrieval produces no qualified evidence, no operational-memory provider context is injected.

Retrieved formulas remain subordinate to:

- explicit current user direction;
- current-turn meaning;
- active desired outcome;
- present evidence and signals;
- current operating conditions;
- canonical operational judgment.

The runtime pipeline consumes operational-memory evidence without absorbing retrieval, persistence, ranking, or formula ownership.

Observational retrieval telemetry belongs to the canonical chat-route invocation boundary. LIVE runtime metrics continue to own LIVE execution telemetry only.

Qualification owner:

```text
scripts/george-operational-memory-retrieval-qualification.mjs
```

The qualification protects authenticated isolation, normalization, ranking, policy selection, evidence suppression and generation, runtime-pipeline injection, provider-context integration, and ownership separation.

<!-- GEORGE_LIVE_INPUT_LATENCY_BOUNDARY_START -->
## LIVE Input Latency Ownership Boundary

LIVE input latency is reduced within the existing transcript transport and final-transcript release boundaries.

Canonical ownership:

- `lib/george/live-voice/stt/deepgram-live-client.ts` owns browser microphone chunk cadence and browser Deepgram endpointing;
- `live-hub/src/stt/deepgram-stream.ts` owns LIVE Hub Deepgram transport configuration;
- `lib/george/live-runtime/final-transcript-release-policy.ts` owns final-transcript release timing.

Validated configuration:

- browser microphone audio chunks are sent every 100 ms;
- browser and LIVE Hub Deepgram endpointing use 250 ms;
- terminal final transcripts preserve a 90 ms release delay;
- standard final transcripts preserve a 140 ms release delay;
- fragment final transcripts preserve a 210 ms release delay.

STT latency tuning remains transport configuration, not behavioral authority.

Transport timing may reduce how quickly signal reaches canonical reasoning. It does not interpret user intent, infer the desired outcome, assess trajectory, make operational judgments, select support behavior, compose receiver-specific guidance, route delivery, or render output.

Latency optimization must not create another transcript owner, reasoning lane, behavior authority, delivery owner, or page-level runtime decision.
<!-- GEORGE_LIVE_INPUT_LATENCY_BOUNDARY_END -->

## LIVE Runtime Flow

Canonical LIVE flow:

```text
Microphone / transcript input
↓
LIVE Hub transcript orchestration
↓
Signal detection and prepared reasoning
↓
Shared outcome reasoning and judgment
↓
Execution policy
↓
Support Behavior Composer
↓
Operational Assessment
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

The flow is one authority chain.

No renderer, route component, bridge, or host executor may introduce competing judgment or routing.

## Support Behavior Architecture

Canonical owner:

```text
lib/george/live-runtime/support-behavior-composer.ts
```

The Support Behavior Composer decides the operational support resource appropriate for the current turn.

Canonical operational-resource vocabulary:

- cue;
- line;
- continuation;
- response;
- recovery;
- repeat;
- silence.

Responsibilities:

- interpret the current adaptive starting preference;
- evaluate whether current support is working;
- select from current execution evidence;
- preserve explicit current-room user instructions;
- yield when the user is already executing successfully;
- preserve a reason for the current-turn decision.

Support behavior is selected from outcome and execution evidence.

Receiver profile is deliberately absent from this decision.

Changing receiver profile changes realization only. It must not change the intelligence or operational resource selected.

## Adaptive Starting Preferences

The existing LIVE runtime supports:

- **Adaptive Cue**;
- **Adaptive Response**.

These are starting preferences, not separate modes, runtimes, or intelligences.

Canonical flow:

```text
Desired outcome
↓
Room, user, and conversation signals
↓
Adaptive starting preference
↓
Support Behavior Composer
↓
Current-turn operational resource
```

Adaptive Cue begins from the shortest useful support the user can execute from.

Adaptive Response begins from the shortest complete, speakable response likely to improve execution.

Continuation remains an operational resource selected from evidence. It is not a separate starting preference.

An explicit current-room instruction constrains adaptation until the user changes it.

## Operational Assessment Architecture

Canonical owner:

```text
lib/george/live-runtime/operational-assessment.ts
```

Operational Assessment converts approved runtime judgment into a stable delivery-facing contract.

Canonical contract includes:

- `action`;
- optional `evidence`;
- optional `outcomeImpact`;
- `confidence`.

Responsibilities:

- resolve the approved action once;
- retain user-facing evidence only when appropriate;
- retain supported outcome impact;
- filter internal reasoning language from user-facing evidence;
- preserve the governing assessment for delivery and telemetry.

Operational Assessment does not own receiver-specific wording or surface shaping.

## Receiver Policy Architecture

Canonical owner:

```text
lib/george/live-delivery/receiver-policy.ts
```

Receiver Policy owns receiver-specific realization.

It owns:

- operational cue composition from action, evidence, and outcome impact;
- delivery-surface selection from receiver profile and voice availability;
- audio shaping;
- visual-only shaping;
- audio-visual reference shaping;
- receiver-specific text limits;
- receiver-policy reasons.

Canonical cue-composition owner:

```text
composeGeorgeOperationalCueText
→ lib/george/live-delivery/receiver-policy.ts
```

Operational Assessment must not export or duplicate this function.

### Internal receiver identifiers

```text
audio_only
audio_visual
visual_only
```

### Product-facing terminology

- **Audio** — earbuds or audio glasses;
- **Glasses** — supported text-capable glasses with audio available for immediate steering;
- **Desktop / Mobile** — responsive web workspace as the readable surface.

Product terminology may evolve without changing the portable receiver contract.

### Audio-only policy

Audio is:

- concise;
- sequential;
- repeatable;
- low-cognitive-load;
- normally speakable as one usable unit;
- optimized for immediate execution.

Unavailable audio resolves to silence rather than an unauthorized visual fallback.

One-breath audio is a receiver constraint, not a reasoning limit.

### Visual-only policy

Visual-only is:

- readable;
- glanceable;
- structured when useful;
- persistent;
- capable of carrying more detail than audio;
- skimmable without waiting for playback.

Visual-only is not audio with sound removed.

### Audio-visual policy

Audio carries immediate timing or steering.

Visual carries persistent reference.

The two surfaces may realize the same operational resource differently without becoming separate behavior decisions.

## Delivery Router Architecture

Canonical owner:

```text
lib/george/live-delivery/delivery-router.ts
```

Responsibilities:

- resolve Operational Assessment once;
- invoke canonical cue composition from Receiver Policy;
- invoke canonical receiver-surface shaping;
- convert approved policy results into delivery cues;
- preserve the governing operational assessment;
- preserve turn identity and delivery metadata;
- produce voice, visual, or silent delivery cues.

Delivery Router does not render.

Delivery Router does not select support behavior.

Delivery Router does not own browser execution.

## Delivery Behavior Resolver

Canonical owner:

```text
lib/george/live-delivery/delivery-behavior-resolver.ts
```

It consumes Support Behavior Composer output and translates the selected operational resource into approved delivery behavior.

It must not become a second Support Behavior Composer.

## Delivery Bridge Architecture

Canonical owner:

```text
components/george/live/LiveHubDeliveryBridge.tsx
```

Responsibilities:

- subscribe to approved runtime `ACTION_CUE` delivery;
- consume canonical delivery behavior;
- invoke Delivery Router;
- apply commitment, duplicate-suppression, and delivery safeguards;
- dispatch approved voice and visual cues;
- remain free of runtime reasoning and receiver shaping.

A bridge dispatches approved delivery. It does not decide what GEORGE believes or what operational support is appropriate.

## Visual Presentation Policy Architecture

Canonical owner:

```text
lib/george/live-delivery/visual-presentation-policy.ts
```

Responsibilities:

- resolve presentation interruption and replacement;
- suppress duplicate presentation;
- enforce priority replacement safeguards;
- resolve receiver-profile-specific visual persistence timing;
- preserve Receiver Policy output without reshaping it;
- remain portable and independent of React rendering.

Visual Presentation Policy consumes approved delivery downstream of Delivery Bridge.

It does not perform reasoning, support behavior selection, operational assessment, receiver shaping, or delivery routing.

## Visual Bridge Architecture

Canonical owner:

```text
components/george/live/LiveHubVisualCueBridge.tsx
```

Responsibilities:

- subscribe to approved delivery;
- invoke Visual Presentation Policy;
- render approved visual guidance unchanged;
- preserve policy-created newline structure;
- allow normal word wrapping;
- report visual telemetry;
- replay approved delivery when appropriate;
- avoid receiver-specific text shaping.

Rendering preserves structure. It does not create structure.

The Visual Bridge does not own interruption, replacement, priority, duplicate-suppression, or persistence policy.

Current validated persistence policy:

```text
audio_only  → no visual rendering
audio_visual → 12-second visual reference
visual_only → 20-second readable guidance
```

Persistence is downstream presentation policy. It does not change support behavior, operational assessment, receiver policy, or routing.

## LIVE Hub Transcript and Provider Boundary

Canonical transcript/provider orchestration owner:

```text
live-hub/src/stt/deepgram-stream.ts
```

Responsibilities include:

- transcript orchestration;
- interim and final transcript handling;
- prepared interim reasoning integration;
- provider request generation ownership;
- stale provider-result rejection;
- arbitration entry only for current reasoning;
- invalidation on stream close or error.

Canonical stale-reasoning flow:

```text
Final transcript
↓
Claim monotonic provider generation
↓
Resolve prepared or direct provider reasoning
↓
Verify generation remains current
├── current → FAST_CUE / arbitration / ACTION_CUE
└── stale   → observe and discard
```

A newer final transcript supersedes unresolved older provider work.

The provider request may still finish, but stale output must be discarded before it influences the room.

No UI, bridge, or renderer owns provider race policy.

## ACTION_CUE Turn Identity

Turn identity originates when transcript work is accepted.

Every downstream `ACTION_CUE` must preserve the originating `turnId`.

Canonical validation boundary:

```text
lib/george/live-hub/live-runtime-adapter.ts
```

The adapter may validate identity. It must not infer ownership from the most recently submitted transcript.

Packets without `turnId` are invalid and are rejected before:

- authority finalization;
- delivery routing;
- rendering;
- voice playback;
- telemetry attribution.

This preserves one identity across transcript, reasoning, delivery, rendering, and TTS.

## Reconnect Transcript Ownership

Canonical owner:

```text
lib/george/live-hub/live-runtime-adapter.ts
```

Each queued transcript retains the `deliveryStyle` captured when it entered the adapter.

Reconnect flush must preserve packet-level delivery policy.

A later context synchronization must not rewrite already-accepted transcript intent.

Transport recovery restores continuity. It does not reinterpret behavioral delivery semantics.

## Voice Playback Generation Ownership

Canonical browser playback boundary:

```text
app/george/page.tsx
```

Stopping or replacing speech increments the playback generation.

Every asynchronous TTS result must still own its captured generation through:

- TTS response completion;
- object URL creation;
- playback assignment;
- playback start.

Superseded work is discarded and its object URL is revoked.

This is playback concurrency control only.

It does not move support behavior, receiver policy, routing, or delivery authority into the page.

## Application Host Boundary

`app/george/page.tsx` is the application host and mount surface.

Permitted host responsibilities:

- hydrate and persist user-selected host preferences;
- mount LIVE bridges;
- integrate microphone lifecycle;
- expose approved host voice execution;
- execute approved TTS and playback;
- record playback telemetry;
- provide user-controlled repeat, pause, stop, and compression actions;
- render application presentation state.

Prohibited responsibilities:

- outcome reasoning;
- operational judgment;
- support-resource selection;
- continuation selection;
- operational assessment;
- receiver-specific wording;
- delivery-surface selection;
- delivery routing;
- independent `ACTION_CUE` interpretation;
- a parallel speech policy;
- another LIVE runtime.

A host voice executor is not a competing delivery owner when it speaks only text already approved and dispatched through the canonical chain.

Do not patch the page from suspicion. Patch only when inspection proves it independently owns a decision assigned to a canonical runtime or delivery owner.

## LIVE Entry Boundary

Canonical route client:

```text
app/george/live-entry/LiveEntryClient.tsx
```

LIVE Entry is a preparation and presentation boundary, not a runtime.

Canonical flow:

```text
Normal preparation and persisted context
↓
LIVE Entry room preparation
↓
Canonical runtime snapshot
↓
LIVE Hub / LIVE runtime
```

LIVE Entry may:

- collect room, audience, objective, participant, document, receiver, and user-preference inputs;
- present briefing, mechanics, readiness, responsibility, and orientation UI;
- persist current-room setup;
- carry the canonical runtime snapshot into LIVE;
- render presentation-only components.

LIVE Entry must not:

- create room-specific intelligence;
- own support judgment;
- define alternate behavior by room category;
- replace canonical state with stale briefing state;
- own receiver policy;
- become another LIVE coordinator.

Presentation extraction is permitted when authority remains unchanged.

## Portable Runtime Boundary

Portable canonical owners:

```text
lib/george/live-runtime/*
lib/george/live-delivery/*
```

These owners must not import or depend on:

- `app/*`;
- `components/*`;
- `lib/george/live-host/*`;
- browser globals such as `window`, `document`, `localStorage`, `navigator`, `MediaRecorder`, `AudioContext`, or `HTMLAudioElement`.

Canonical browser/session integration boundary:

```text
lib/george/live-host/*
```

Canonical host composition:

```text
lib/george/live-host/live-application-host.ts
```

The host composes browser playback, session control, and support-preference integration outside portable runtime owners.

Portability means the intelligence and delivery policy can move without importing the current web application's rendering and browser execution environment.

## Telemetry Boundary

Telemetry observes runtime execution. It does not become runtime authority.

End-to-end turn identity must be preserved across events including:

- transcript input;
- action cue;
- delivery cue;
- visual cue received;
- visual cue rendered;
- voice cue requested;
- TTS request start;
- TTS audio received;
- TTS playback end.

Telemetry may expose latency and ownership failures. It must not select behavior or route delivery.

## Runtime Safety Boundaries

The architecture currently enforces:

- stale reasoning suppression;
- current-turn ACTION_CUE identity;
- reconnect transcript policy preservation;
- voice playback generation ownership;
- delivery deadline qualification;
- provider degradation behavior;
- restart continuity;
- Hub resilience;
- recovery behavior;
- duplicate ownership detection;
- circular dependency detection;
- runtime interface freeze;
- portable owner isolation.

Safety guards must patch the canonical execution boundary where the race or ownership defect originates.

Do not solve runtime races in rendering.

## Canonical Ownership Map

```text
Shared reasoning
→ lib/george/runtime/*

Normal text-provider realization
→ lib/george/runtime/provider/normal-provider.ts

Normal multimodal image realization
→ app/api/chat/route.ts through the OpenAI Responses API

Support behavior
→ lib/george/live-runtime/support-behavior-composer.ts

Operational assessment
→ lib/george/live-runtime/operational-assessment.ts

Delivery behavior resolution
→ lib/george/live-delivery/delivery-behavior-resolver.ts

Operational cue composition
→ lib/george/live-delivery/receiver-policy.ts

Receiver-specific realization
→ lib/george/live-delivery/receiver-policy.ts

Delivery routing
→ lib/george/live-delivery/delivery-router.ts

Runtime delivery dispatch
→ components/george/live/LiveHubDeliveryBridge.tsx

Visual presentation
→ components/george/live/LiveHubVisualCueBridge.tsx

Transcript/provider orchestration
→ live-hub/src/stt/deepgram-stream.ts

Reconnect and ACTION_CUE adapter continuity
→ lib/george/live-hub/live-runtime-adapter.ts

Browser/session integration
→ lib/george/live-host/*

Host voice execution
→ app/george/page.tsx

LIVE Entry preparation and presentation
→ app/george/live-entry/LiveEntryClient.tsx
```

## Prohibited Duplicate Ownership

The following are architecture violations:

- receiver shaping in a renderer;
- support behavior selection in Delivery Router;
- delivery routing in page components;
- provider race handling in UI;
- fallback turn identity assigned from the latest transcript;
- reconnect policy rewritten from current context;
- visual policy copied into the visual renderer;
- TTS playback concurrency control duplicated outside the host playback boundary;
- room-category intelligence inside LIVE Entry;
- browser dependencies inside portable runtime owners;
- documentation asserting an owner that implementation does not use.

## Validation Contract

Required production command:

```text
npm run build
```

The production build must run protected smoke and qualification suites before the Next.js production build.

Current validated suite includes:

- core smoke;
- behavioral qualification;
- LIVE Entry smoke;
- conversation package smoke;
- LIVE runtime smoke;
- LIVE latency qualification;
- LIVE input latency qualification;
- early reasoning qualification;
- stale reasoning qualification;
- delivery deadline qualification;
- latency optimization qualification;
- LIVE behavior qualification;
- LIVE recovery qualification;
- LIVE Hub resilience qualification;
- reconnect transcript ownership qualification;
- voice playback ownership qualification;
- ACTION_CUE turn ownership qualification;
- provider degradation qualification;
- LIVE restart continuity qualification;
- runtime interface freeze qualification;
- duplicate ownership audit;
- LIVE portability qualification;
- preparation smoke;
- Next.js production build.

Current validated ownership result:

```text
Duplicate canonical owners: 0
Non-canonical imports: 0
Layer violations: 0
Circular dependencies observed: 0
```

Do not weaken qualification to satisfy implementation.

Do not add duplicate qualifiers when an existing qualification already protects the behavior.

## Engineering Order

Always:

1. inspect implementation;
2. identify the canonical owner;
3. detect duplicate ownership;
4. patch only the canonical owner;
5. build;
6. resolve failures one at a time;
7. run focused qualification;
8. run the complete production build;
9. synchronize documentation.

Never reverse this order.

## Freeze Rule

The architecture described here is the preserved runtime baseline for product refinement.

The synchronized production authorities are:

```text
docs/george/PRODUCTION_TRACKER.md
docs/george/RUNTIME_ARCHITECTURE.md
docs/george/OPERATIONAL_PROFILE.md
docs/george/NEXT_THREAD_HANDOFF.md
```

The tracker owns phase and readiness status. This document owns architectural boundaries. Current work proceeds through Popup 3 correction, canonical motion, materials, color, micro-interactions, and final product-experience refinement without reopening runtime architecture.
