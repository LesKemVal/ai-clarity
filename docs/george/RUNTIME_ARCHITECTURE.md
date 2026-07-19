# GEORGE Runtime Architecture

<!-- GEORGE_RECEIVER_RENDERING_CONTRACT_START -->
## Receiver Rendering and Application-Host Contract

The receiver realization boundary is validated as:

```text
Signals and transcripts
↓
Support Behavior Composer
↓
Selected operational resource
↓
Receiver Policy
↓
Delivery Router
↓
Delivery Bridge
↓
Surface renderer or host voice executor
```

### Visual rendering contract

`lib/george/live-delivery/receiver-policy.ts` owns the structure and wording of receiver-specific visual guidance.

`components/george/live/LiveHubVisualCueBridge.tsx` owns presentation of approved visual guidance.

The visual bridge must:

- render policy-created text unchanged;
- preserve policy-created newline boundaries;
- allow normal wrapping of long lines;
- preserve existing hold, replacement, replay, priority, and commitment behavior;
- remain free of receiver-specific text limits and behavioral shaping.

The current renderer satisfies this contract with newline-preserving whitespace behavior and normal word wrapping.

Rendering preserves structure. It does not create structure.

### Application-host contract

`app/george/page.tsx` may own host integration responsibilities, including receiver-preference hydration and persistence, LIVE bridge mounting, microphone lifecycle integration, speech synthesis or TTS execution, playback lifecycle and telemetry, user-triggered repeat, pause, and compression controls, and presentation state.

It must not own support-resource selection, receiver-specific shaping, delivery-surface selection, delivery routing, independent ACTION_CUE interpretation, a parallel speech-delivery policy, or a second LIVE runtime.

A host voice executor is not a competing delivery owner when it speaks only text already approved and dispatched through the canonical delivery chain.

### Validated ownership conclusion

Inspection found no proven duplicate receiver-policy or delivery-router ownership in `app/george/page.tsx`.

No architecture change is authorized from suspicion alone.

Patch the application host only when inspection proves that it independently makes a decision already owned by Support Behavior Composer, Receiver Policy, Delivery Router, or Delivery Bridge.
<!-- GEORGE_RECEIVER_RENDERING_CONTRACT_END -->


<!-- GEORGE_LIVE_ENTRY_AUTHORITY_CLEANUP_ARCHITECTURE_START -->
## LIVE Entry Boundary After Authority Cleanup

LIVE Entry is a preparation and presentation boundary, not a runtime.

Canonical flow:

```text
Normal preparation and persisted conversation context
↓
LIVE Entry room preparation
↓
Canonical runtime snapshot
↓
LIVE Hub / LIVE runtime
↓
Support Behavior Composer
↓
Receiver delivery policy
↓
Audio, visual, or audio-visual realization
```

`app/george/live-entry/LiveEntryClient.tsx` may:

- collect room, audience, objective, participant, document, receiver, and user-preference inputs;
- present briefing, mechanics, readiness, responsibility, and orientation UI;
- persist current-room setup;
- publish or carry the canonical runtime snapshot into LIVE;
- render presentational components.

It must not:

- infer a separate room-specific intelligence;
- own support judgment;
- define alternate support behavior by conversation category;
- replace canonical runtime state with stale briefing state;
- own receiver-specific delivery policy;
- become a second LIVE coordinator.

Presentational extraction is permitted when behavior remains unchanged. `components/george/live-entry/LiveOrientationIcon.tsx` is a presentation-only owner for orientation SVGs and their local icon-kind type. It has no runtime, signal, support, or delivery authority.

The validated architectural direction is to continue reducing route-level presentation weight while preserving one runtime, one authority chain, and one LIVE execution path.
<!-- GEORGE_LIVE_ENTRY_AUTHORITY_CLEANUP_ARCHITECTURE_END -->



<!-- GEORGE_ADAPTIVE_LIVE_STARTING_PREFERENCE_ARCHITECTURE_START -->
## Adaptive LIVE Starting-Preference Architecture

Adaptive Cue and Adaptive Response are starting preferences inside the existing LIVE runtime.

They are not separate modes or separate intelligences.

Canonical flow:

```text
Desired outcome
↓
Room, user, and conversation signals
↓
Selected adaptive starting preference
↓
Support Behavior Composer
↓
Observed execution assessment
↓
Operational resource
↓
Receiver delivery policy
↓
Audio, visual, or audio-visual realization
```

The preference remains stable until the user changes it.

The operational resource may adapt moment by moment.

Operational resources remain:

- cue
- line
- continuation
- response
- repeat
- recovery
- temporary yield while the user is already executing successfully

Adaptive Cue starts from concise support and expands when the user cannot successfully execute from a cue.

Adaptive Response starts from concise completeness. If complete lines are working, preserve them. Do not reduce support solely to minimize word count.

Continuation is selected from evidence such as unfinished language, known talking points, missing endings, repeatable lines, interruption recovery, and language already available in queue.

A starting preference permits adaptation.

An explicit current-room style instruction constrains adaptation until changed.

Behavior Composer decides the support resource.

Delivery policy decides how that resource is rendered for audio-only, visual-only, or audio-visual receivers.

`app/george/page.tsx` must not choose operational resources, interpret room signals, generate continuation behavior, own adaptive preference doctrine, or own receiver policy.
<!-- GEORGE_ADAPTIVE_LIVE_STARTING_PREFERENCE_ARCHITECTURE_END -->

<!-- GEORGE_RECEIVER_POLICY_ARCHITECTURE_START -->
## Explicit Receiver-Policy Architecture

Receiver realization is now separated from delivery routing without creating a new runtime or reasoning lane.

Canonical LIVE realization flow:

```text
Support Behavior Composer
↓
Selected operational resource
↓
Receiver Policy
↓
Delivery Router
↓
Bridge dispatch
↓
Audio, visual, or silent surface
```

Canonical owners:

- `lib/george/live-runtime/support-behavior-composer.ts`
  - decides what operational support resource is appropriate;
  - does not decide surface-specific wording or routing.
- `lib/george/live-delivery/receiver-policy.ts`
  - resolves audio-only, visual-only, and audio-visual realization;
  - applies surface-specific cognitive-load and readability constraints;
  - does not change the selected operational resource or reason independently.
- `lib/george/live-delivery/delivery-router.ts`
  - creates delivery cues from approved behavior and receiver-policy results;
  - does not own receiver shaping.
- `components/george/live/LiveHubDeliveryBridge.tsx`
  - subscribes to approved ACTION_CUE events;
  - applies commitment and duplicate-suppression safeguards;
  - dispatches routed cues to voice, visual, or silent handlers;
  - owns no runtime reasoning.

Receiver policy principles:

### Audio-only

- concise;
- sequential;
- repeatable;
- low-cognitive-load;
- normally speakable within one breath;
- unavailable audio resolves to silence rather than an unauthorized visual fallback.

### Visual-only

- readable;
- glanceable;
- structured when useful;
- capable of carrying more detail than audio;
- persistence is a presentation concern downstream of receiver shaping.

### Audio-visual

- audio carries immediate timing or steering;
- visual carries persistent reference;
- the two surfaces may express the same selected operational resource differently without becoming separate behavior decisions.

One-breath audio is a receiver constraint, not a reasoning limit.

The receiver profile changes realization only. It must not reset adaptive preference, create a new support mode, or create another GEORGE.
<!-- GEORGE_RECEIVER_POLICY_ARCHITECTURE_END -->

<!-- GEORGE_PROVIDER_BOUNDARY_UPDATE_START -->
## Provider-Boundary Authority — Current Validated State

Current validated implementation HEAD:

`53ebf32 Compact Normal provider execution boundary`

The canonical reasoning pipeline remains:

```text
Outcome evolution
        ↓
Trajectory assessment
        ↓
Operational judgment
        ↓
Conversation strategy
        ↓
Conversation move knowledge
        ↓
Execution policy
        ↓
Operational resource / opportunity readiness
        ↓
Runtime context assembly
        ↓
Provider request assembly
```

No new runtime layer is authorized.

For Normal GEORGE, `runtime-context-composer.ts` synthesizes the final realization contract into one `PROVIDER EXECUTION AUTHORITY` block.

The selected conversational move defines the maximum response scope.

`buildGeorgeProviderRequest()` in `runtime-pipeline.ts` now receives `currentRuntime` explicitly.

When:

- `currentRuntime === 'normal_george'`; and
- the runtime context already contains consolidated provider authority;

the provider request is compacted to preserve only:

- language requirements;
- the Normal operating-mode boundary;
- any applicable preparation-time LIVE availability/opening or discipline;
- the consolidated provider execution authority as the final governing block.

That compact Normal path excludes duplicated legacy guidance already synthesized upstream, including the large base system prompt, message-source guidance, control-state guidance, runtime-score guidance, score-aware steering, dynamic runtime blocks, and conversation-engine rules.

LIVE provider assembly is preserved. `includeLiveDiscipline` is not treated as proof that the current runtime is LIVE, because LIVE availability may be surfaced during Normal preparation.

The architecture target is now implemented:

```text
Rich canonical reasoning upstream
        ↓
One compact provider realization contract
        ↓
Provider realization
```

The immediate architectural task is qualification, not expansion:

- rerun the investor-preparation scenario;
- compare perceived and measured latency;
- confirm the provider faithfully realizes the narrow selected move;
- inspect the actual compact request if behavior still fails.

Do not restore legacy provider guidance merely to increase apparent helpfulness. Do not add another authority block or reasoning layer.
<!-- GEORGE_PROVIDER_BOUNDARY_UPDATE_END -->


This document reflects the current Production Runtime Phase. The codebase and behavioral suite are ahead of older documentation; this file should be treated as authoritative only after the repository has passed the behavioral suite and production build.

## Current Branch

`live-hub-runtime`

## Validated Runtime State

Current production phase:

- Production Qualification
- architecture largely complete
- runtime behavior under qualification
- documentation synchronized to implementation through commit `975dc16`

Current protected validation target:

- GEORGE Core Smoke
- LIVE Entry Smoke
- Conversation Package Smoke
- LIVE Runtime Smoke
- LIVE Support Behavior Smoke
- Preparation Smoke
- existing behavioral qualification suite
- Production Build

Required command after every production change:

    npm run build

`npm run build` executes the protected smoke suites before the Next.js production build.

Do not weaken protected qualification to satisfy current implementation.

Do not introduce duplicate qualifiers when the existing qualification suite already covers the behavior.

## Runtime Doctrine

Operational Profile ownership, adaptive defaults, privacy boundaries, and portability doctrine are defined in `docs/george/OPERATIONAL_PROFILE.md`.


GEORGE is not a chatbot.

GEORGE is an operational intelligence runtime.

Conversation is the execution surface.

Communication precedes execution.

GEORGE's job is to help move the user toward the user's desired outcome.

GEORGE requires user participation and permission. GEORGE does not participate in conversations as an independent actor; GEORGE operates through the user's participation and only within the support the user permits.

Once participation and permission exist, GEORGE does its job: observe the room, reason from evidence, identify the highest-value support available, and deliver that support through the user's selected receiver profile and communication preferences while the user retains agency, responsibility, and final authority.

Support style changes delivery, not judgment.

Normal GEORGE and LIVE share the same reasoning philosophy; execution constraints differ.

Normal GEORGE prepares, plans, analyzes, creates, reviews, decides, and helps the user advance work before execution. LIVE executes under real-time constraints where timing, brevity, latency, and room signals matter more urgently.

Both modes reason from signals, evidence, user authority, desired outcome, credibility, timing, and operational value. The difference is not intelligence. The difference is operating conditions.

Normal GEORGE now has a reasoning lane governor at `lib/george/runtime/normal-reasoning-governor.ts`. The governor routes normal work into immediate, operational, or strategic lanes before provider and model selection so simple work can remain fast while consequential work receives deeper judgment.

Normal runtime coordination is owned by `lib/george/runtime/runtime-pipeline.ts`.

The runtime pipeline coordinates, in canonical order:

1. provider/lane resolution;
2. active outcome inference;
3. outcome evolution;
4. trajectory assessment;
5. operational judgment;
6. conversation strategy and move resolution;
7. context framing and LIVE viability presentation;
8. operational resource ranking and opportunity-readiness selection;
9. execution policy;
10. governed runtime-context assembly;
11. provider request assembly.

The pipeline returns one immutable runtime snapshot. Existing modules retain ownership of their own decisions; the pipeline coordinates only.

Provider boundary:

- `normal-reasoning-governor.ts` chooses lane, provider, and model.
- `runtime-pipeline.ts` assembles the canonical provider request and provider resolution.
- `normal-provider.ts` performs assigned Normal text-provider transport.
- `app/api/chat/route.ts` owns HTTP, authentication, request parsing, image/file handling, provider invocation, fallback transport, streaming, and final response return.
- Groq may execute only explicitly safe, low-consequence Normal transformations.
- OpenAI remains the provider for contextual, ambiguous, operational, strategic, image, and consequential reasoning.
- The LIVE Hub Groq fast lane remains separate LIVE execution plumbing and must not become Normal reasoning authority.
- Providers do not own GEORGE identity, doctrine, memory, continuity, judgment, strategy, execution policy, or delivery policy.
- Provider failure degrades to the shared OpenAI baseline without creating a second user-visible runtime.

Tier/model doctrine:

- GEORGE is the same operational intelligence across Smart, Intelligent, Brilliant, Normal, and LIVE.
- Smart and Intelligent share a competent Normal reasoning baseline.
- Brilliant may use the latest model for consequential Normal work.
- Tier differences belong in reasoning budget, depth, continuity, tools, usage limits, and LIVE access—not basic competence.

Users organize work around outcomes.

GEORGE organizes work around Conversation Packages.

GEORGE reasons from signals, not merely words.

Learning exists to improve future conversations.

Relevant Documentation improves understanding.

User authority remains primary.

## Canonical Decision Architecture

GEORGE uses shared intelligence with mode-specific realization.

Canonical shared judgment path:

Signals and words

↓

Canonical Outcome State

↓

Outcome Evolution

↓

Trajectory Assessment

↓

Operational Judgment

↓

Conversation Strategy

↓

Conversation Move Definition

↓

Execution Policy

↓

Mode-specific realization

Normal realization speaks conversationally to the user. It can explain, ask, challenge, summarize, prepare, or provide a usable line when that resource materially improves the user's probability of success.

LIVE realization equips the user to converse effectively with the room. It may deliver cues, questions, lines, continuations, complete responses, pauses, recovery, or repetition according to support adequacy, room context, receiver profile, and the user's selected support behavior.

Normal and LIVE do not share identical response shape. They share outcome logic, judgment, strategy, and move semantics. Timing, audience, realization, cognitive load, interruption behavior, and delivery remain mode-specific.

Adaptive LIVE support already owns escalation and recovery. A cue may remain sufficient; when user behavior signals that the cue is not translating into execution, existing support behavior can escalate toward a line, continuation, full response, or repeat/recovery behavior. No new adaptive-support runtime is required.

## Canonical Runtime Realization

The runtime now separates reasoning, internal operational context, realization, and delivery without creating competing authorities.

Canonical Normal flow:

Runtime pipeline

↓

Internal operational context

↓

OpenAI reasoning

↓

Natural conversational realization

↓

User

Canonical LIVE flow:

Runtime signal and transcript processing

↓

Support behavior decision

↓

Canonical operational posture and resources

↓

Receiver realization

↓

Delivery routing

The runtime must reason before it realizes. Realization expresses selected support. It does not retrieve a canned answer, independently decide behavior, or create another reasoning pass.

### Canonical Owners

- `lib/george/runtime/runtime-pipeline.ts`
  - canonical Normal runtime pipeline
  - runtime-stage latency instrumentation
  - assembly of internal operational context
  - preservation of current-turn authority
- `lib/george/chat/operational-excellence.ts`
  - operational reasoning guidance supplied as internal knowledge
- `lib/george/chat/presentation-authority.ts`
  - natural realization authority
  - suppression of user-visible runtime framing and presentation scaffolding
- `lib/george/runtime/execution-policy.ts`
  - execution constraints used by runtime realization
- `lib/george/live-runtime/support-behavior-composer.ts`
  - composition of LIVE support behavior from canonical runtime primitives
- `lib/george/live-runtime/live-behavior-executor.ts`
  - execution planning from canonical posture and operational resources
- `lib/george/live-runtime/live-final-transcript-adapter.ts`
  - adaptation of final transcripts into the canonical LIVE execution path
- `lib/george/live-runtime/live-transcript-controller.ts`
  - transcript execution control without duplicate support authority
- `lib/george/live-voice/runtime/response-shaper.ts`
  - legacy-compatible LIVE response shaping primitives where still invoked
  - not canonical receiver-policy ownership
- `lib/george/live-delivery/receiver-policy.ts`
  - canonical receiver-profile realization
  - audio, visual, and audio-visual surface shaping
- `lib/george/live-delivery/delivery-router.ts`
  - delivery-cue construction from approved behavior and receiver-policy output
- `components/george/live/LiveHubDeliveryBridge.tsx`
  - bridge-level commitment safeguards and delivery dispatch
  - no runtime reasoning, behavior-selection, or receiver-policy ownership

`app/george/page.tsx` remains a mount, interaction, and pass-through surface. It must not become the owner of posture realization, receiver policy, runtime reasoning, operational resources, or turn lifecycle.

### Canonical Operational Resources

LIVE uses one canonical operational resource vocabulary across behavior composition, execution, transcript processing, and receiver realization.

Legacy behavioral aliases are not separate supported concepts. They must not be reintroduced as compatibility-owned runtime authority.

Operational resources describe the kind of support available after reasoning. They do not function as retrieved response templates.

### Posture and Receiver Realization

Posture represents how selected support should function under the current operational conditions.

Receiver profile represents how that support can be delivered through the active surface.

The two are related but distinct:

- posture shapes the operational function of the response
- receiver shapes its expression and delivery constraints

Receiver realization may produce:

- visual-only support that is structured, persistent, skimmable, and readable
- audio-only support that is sequential, interruptible, repeatable, low-cognitive-load, and normally deliverable within one breath
- audio-visual support where audio provides immediate steering and visual provides persistent reference

One-breath audio is a realization constraint, not a universal reasoning limit. It must not truncate necessary reasoning before the appropriate receiver realization stage.

### Normal Conversational Realization

Normal GEORGE no longer exposes runtime framing, operational labels, or presentation scaffolding merely because those concepts informed reasoning.

Internal operational context is evidence supplied to reasoning.

The model should produce a natural answer that advances the user's objective.

The intended flow is:

Reasoning

↓

Recommendation

Not:

Operational label

↓

Checklist

↓

Checklist

### Current-Turn and Ambiguity Authority

Conversation history is evidence.

The current user utterance is authoritative.

A standalone ambiguous question must preserve plausible interpretations unless current-turn evidence resolves the intended meaning.

Previous conversation context may inform judgment, but it must not silently force a narrow interpretation onto a new standalone question.

### Runtime Latency Instrumentation

The canonical runtime pipeline records latency at meaningful internal stages.

Latency optimization must begin with measured runtime evidence.

Do not introduce speculative shortcuts, duplicate fast lanes, or behavior changes merely to reduce assumed latency.

## Current Runtime Loop

Current validated production loop:

Preparation

↓

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

Conversation Record

↓

Preparation

Brief Room now consumes Preparation Runtime output.

Preparation Runtime consumes Conversation Packages, Conversation Records, related Conversation Packages, promoted learning, future actions, reusable documentation, and known context.

Conversation Record remains a projection of operational memory rather than a separate runtime.

Interaction Continuity is the production owner for after-LIVE composition. `lib/george/live-runtime/live-interaction-continuity.ts` composes Outcome Review, Conversation Package update, and Conversation Record output after LIVE. Older post-conversation intelligence helpers remain behavior-protected primitives unless and until they are explicitly routed through Interaction Continuity.

No duplicate operational memory runtime exists.

## Architecture Flow

Homepage

↓

Normal GEORGE

↓

Conversation Preparation

↓

Operational Resource Monitor / Opportunity Readiness

↓

Bottom Operational Card

↓

Conversational Preparation for Missing Information

↓

Existing Execution Gateway

↓

Relevant Documentation / Preparation Runtime when required

↓

LIVE or another supported capability

↓

Outcome Review

↓

Conversation Package Update

↓

Conversation Record

↓

Preparation Runtime

↓

Future Preparation

↓

Conversation Package

↓

Future Conversation

## Conversation Packages

Conversation Packages are the long-lived operational container.

They are not chats.

They are not isolated sessions.

They are not user-managed folders.

Conversation Packages may contain many conversations. Conversations are events. Conversation Packages are operational containers.

A Conversation Package may contain:

- Desired Outcome
- Projects
- Organizations
- People GEORGE has helped the user communicate with
- Relevant Documentation
- Conversation Readiness
- Conversation History
- LIVE Sessions
- Conversation Summaries
- Learning
- Outcome Progression
- Follow-ups
- Future Actions
- Conversation Relationships
- Associated Projects

Conversation Packages should become the single source of truth for operational state. Relevant Documentation, Learning, LIVE, Briefing, and Summaries should attach to Conversation Packages rather than storing independent copies of operational state.

## Implemented Conversation Package Primitive

Current file:

- `lib/george/conversation-packages/identity.mjs`

Current behavior:

- Continue existing Conversation Package when evidence strongly supports continuity.
- Ask the user to confirm related work when evidence is partial.
- Create a new Conversation Package when evidence does not support continuity.

Current behavior test:

- `scripts/george-behavior/conversation-package-identification.mjs`

The behavior suite includes this scenario through `scripts/george-behavior-suite.mjs`.


## Chat Route Orchestration Boundary

`app/api/chat/route.ts` is an orchestration surface, not a canonical reasoning owner.

The chat route may assemble the request for the current model call. It must not become the owner of runtime doctrine, preparation context, memory policy, Operational Profile rules, capability governance, or LIVE authority.

Current boundary:

- Chat route: request assembly and current model-call orchestration.
- Preparation Runtime: pre-execution package, document, and context preparation.
- Conversation Packages: long-lived operational work.
- Operational Profile: user-level portable adaptation evidence.
- Reasoning Governor: Normal GEORGE lane and model routing.
- LIVE runtime: real-time execution constraints and session authority.

Future extraction target:

- `lib/george/runtime/runtime-context-composer.ts`

First extraction should be behavior-neutral:

- accept named runtime note strings
- filter empty notes
- preserve ordering
- join consistently
- return one runtime context block
- do not change prompt doctrine
- do not change model routing
- do not move Preparation Runtime ownership

Do not confuse runtime note composition with Preparation Runtime. Runtime note composition prepares the current model-call context. Preparation Runtime prepares operational context before execution from Conversation Packages, Conversation Records, related packages, learning, documentation, future actions, and known context.



## Capability Governance Boundary

Capability governance must separate availability, surfacing, and execution.

- Availability means the user can use a capability.
- Surfacing means GEORGE should mention or suggest the capability now.
- Execution means GEORGE should start or apply the capability now.

These should not collapse into one owner.

Current implemented capability layer:

- `lib/george/capabilities/live-entry-resources.ts` owns LIVE Entry resource estimation and documentation recommendations.
- `lib/george/capabilities/live-support-panels.ts` owns LIVE support panel IDs, labels, and explanatory metadata.
- `lib/george/capabilities/live-capability-registry.ts` owns stable LIVE execution capability IDs and derives applicable execution capabilities from room context.

Production boundary:

- Resource preparation is not execution capability identity.
- Support presentation is not execution capability identity.
- `selectedCapabilityIds` should carry stable execution capability IDs.
- Resource descriptors should remain in resource estimate / support descriptor fields.
- LIVE runtime authority may merge capability metadata for session transport.
- LIVE governor remains the owner of actual capability execution.
- Capability surfacing remains contextual and judgment-based; surfacing does not imply execution.

Do not collapse availability, surfacing, and execution into one owner.



## Opportunity Readiness Boundary

Opportunity Readiness is an existing Operational Resource Monitor responsibility, not a new runtime layer.

Canonical owner:

- `lib/george/runtime/operational-resource-monitor.ts`

The monitor consumes existing canonical evidence and returns one highest-confidence opportunity with:

- capability kind;
- user-facing title;
- readiness percentage;
- threshold state;
- suggestion copy;
- the next conversational preparation question;
- execution label.

Ownership chain:

Conversation

↓

Runtime Pipeline

↓

Operational Resource Monitor / Opportunity Readiness

↓

Presentation surface

↓

Conversation gathers only missing information

↓

Existing execution gateway

Opportunity Readiness owns selection and readiness state.

It does not own:

- general conversation reasoning;
- provider routing or transport;
- preparation-question rendering;
- artifact generation;
- LIVE mechanics, consent, or runtime execution;
- response shaping;
- receiver delivery policy;
- UI animation or card rendering.

Normal GEORGE may fully or partially prepare a capability through ordinary conversation. The bottom operational card may surface readiness and invite the user to continue preparation. When the readiness threshold is met, the card may offer execution while still allowing the user to keep preparing.

The standalone `/george/live-entry` route remains the intentional entry path for users who start with LIVE. Normal GEORGE is an additional preparation path, not a replacement for LIVE Entry.

For LIVE launched from Normal:

- existing conversational preparation is reused;
- LIVE preparation begins intentionally when the user chooses it;
- the flow resumes at the first missing LIVE requirement;
- redundant questions are skipped;
- the existing LIVE runtime remains the sole execution owner.

This boundary preserves one operational intelligence, one Normal runtime, one LIVE runtime, and one preparation contract.



## Preparation Runtime Contract Boundary

Preparation Runtime produces a structured operational preparation model.

Its structured fields are canonical:

- desired outcome
- known context
- missing signals
- reusable documentation
- documentation suggestions
- risks
- opportunities
- related Conversation Package selection
- confidence
- sufficiency to begin
- preparation latency

`preparationBrief` is a convenience summary for presentation surfaces. It should not become the only preparation artifact consumed by future clients.

Portable clients, including mobile, desktop, API, audio-only devices, and glasses-capable clients, should consume the structured preparation contract first and render their own presentation layer when needed.



## Runtime Context Composer

`lib/george/runtime/runtime-context-composer.ts` is a behavior-neutral formatting utility.

It accepts an ordered collection of runtime context blocks, filters empty values, preserves caller order, joins the blocks, and returns the composed runtime context.

The composer owns formatting only.

It never owns:

- reasoning
- doctrine
- runtime policy
- semantic interpretation
- ordering decisions
- priority
- deduplication

Runtime note producers remain authoritative for content and meaning.

Orchestration layers determine which notes are included and in what order.



## Signal Interpretation Boundary

GEORGE reasons from signals, not only words.

Current canonical interpretation structure:

- `lib/george/core/build-interpretation.ts` is the core interpretation aggregation layer.
- `lib/george/core/interpretation.ts` defines the `GeorgeCoreInterpretation` contract.
- Signal-specific modules remain responsible for local signal production and interpretation.
- Runtime consumers should prefer the structured interpretation snapshot when available.

The aggregation layer may combine:

- conversation signals
- speaker intent
- room analysis
- objective hypothesis
- trajectory
- active outcome
- outcome movement
- signal sufficiency
- ranked signals
- runtime signal arbitration
- operational readiness
- operational confidence

The aggregation layer owns combination, not doctrine ownership.

Do not turn `build-interpretation.ts` into a giant reasoning owner.

Word and phrase heuristics may provide evidence, but final operational judgment should increasingly come from normalized signal objects and aggregated interpretation.


## LIVE Runtime Ownership

Presentation owns controls and visualization.

LIVE Hub owns runtime state, synchronization, runtime turn identity, and cue emission.

GEORGE Core owns operational judgment, evidence, authority, continuation, response shaping, and semantic meaning.

Groq fast lane proposes candidate language only. It must not own GEORGE doctrine, verified response repair, or final replacement.

Canonical LIVE doctrine lives in `lib/george/core/live-reasoning-doctrine.ts`. Root-side reasoning consumers may import it directly; Hub-side prompt contracts must not cross project boundaries until shared packaging is explicit.

Delivery owns voice, visual, silent, suppression, timing, modality, and revision execution.

Delivery may not alter operational meaning.


LIVE awareness processing is owned by `lib/george/live-runtime/live-awareness-pipeline.ts`.

The pipeline owns:
- awareness fragment accumulation
- awareness reconciliation
- overlap recovery

`app/george/page.tsx` retains only transient UI/runtime state (buffer references and diagnostics) and delegates awareness processing to the runtime pipeline.

Runtime metrics own event naming, latency timing, correlation, and latency contract inspection.

`app/george/page.tsx` must remain thin. Prefer bridges, runtime adapters, conversation runtime modules, behavior tests, and focused modules.

`page.tsx` may pass an existing `turnId` from a bridge into a runtime call, but must not own turn lifecycle, create competing telemetry, or invent LIVE reasoning behavior.

## LIVE Turn Correlation

The production telemetry direction is one LIVE turn identifier flowing through the execution path:

mic → STT → transcript → cue → delivery → TTS → playback

The turn starts once.

The same identifier should be carried forward when possible.

Hub voice playback uses pass-through turn identity rather than page-owned lifecycle state.

`app/george/page.tsx` remains a pass-through orchestration surface for this identifier.

Runtime metrics helpers remain the authority for event names and timing.

## Relevant Documentation Runtime

Relevant Documentation is part of Conversation Preparation and Conversation Readiness.

The uploader already exists. Do not build another uploader.

Current upload pipeline supports:

- PDF
- DOCX
- TXT
- Images
- `/api/extract-file`

Extend the existing pipeline rather than duplicating it.

Relevant Documentation recommendations are the feature. Upload remains optional and supports the Sufficiency Doctrine.

## Speech Synchronization Runtime

GEORGE reasons from conversational overlap.

If the user genuinely takes the floor, GEORGE yields.

If the user is repeating GEORGE while speaking, GEORGE disappears into the user's cadence rather than competing for the floor.

Silence may be the optimal support.

Behavior coverage:

- `scripts/george-behavior/speech-synchronization.mjs`



## LIVE Partnership Runtime Recovery Chain

LIVE now has a canonical support behavior composition layer.

This does not create another runtime. It consolidates how LIVE chooses the shape of support while preserving existing owners.

Canonical flow:

LIVE signals / transcript → transcript routing → LIVE transcript controller → support behavior composer → delivery bridge / final transcript adapter → voice, visual, silent, or recovery output → LIVE interaction continuity → Learning Runtime → Conversation Package → Preparation Runtime.

Support Behavior Composer owner: `lib/george/live-runtime/support-behavior-composer.ts`.

Receiver delivery policy owner: `lib/george/live-delivery/delivery-router.ts`.

The delivery router converts one selected support behavior into receiver-appropriate `voice`, `visual`, or `silent` cues. It owns audio flattening, visual structure preservation, surface limits, and receiver-profile routing for `audio_only`, `visual_only`, and `audio_visual`.

Approved delivery history owner: `lib/george/live-runtime/approved-delivery-history.ts`.

Approved delivery history owns the last committed LIVE delivery and the repeat/reword replay event. UI surfaces may subscribe to replay, but they do not independently own approved-delivery state.

The composer decides temporary support behaviors: cue, bridge, completion, sentence_recovery, repeat_tail, full_response, and silence.

It must not generate language. It must not persist learning. It must not write the Operational Profile. It answers only: what support behavior is most useful right now?

Recovery ownership:

- `lib/george/live-runtime/spoken-memory.ts` owns remembered LIVE line, current LIVE sentence, and repeat-tail extraction.
- `lib/george/live-runtime/live-transcript-controller.ts` owns local recovery action resolution.
- `lib/george/live-runtime/live-final-transcript-adapter.ts` owns converting approved recovery actions into speak/send/start-buy-time application behavior.

Response fallback:

Response mode must not fall silent when a full safe response is unavailable. The delivery bridge routes unsafe local Response placeholders through the Behavior Composer and provides a useful bridge/cue fallback.

Learning boundary:

The system must distinguish observed behavior, operational hypothesis, temporary LIVE adaptation, promoted learning, and permanent Operational Profile evidence. Behavior observations do not directly become learning. LIVE Interaction Continuity derives operational hypotheses. Learning Runtime evaluates and promotes candidates. Conversation Packages store promoted learning. Preparation Runtime exposes promoted communication-pattern learning as `profileLearningSignals`.

Portability direction:

The recent recovery and learning work improves portability because support behavior, recovery, learning promotion, and preparation signals are now represented in canonical modules rather than page-level logic. Do not move this logic into `app/george/page.tsx`.

Current open hardening:

- Normalize LIVE audio/STT websocket errors into useful diagnostics.
- Confirm the canonical runtime consumer for `profileLearningSignals`.
- Add post-LIVE report details for what GEORGE adjusted, why, whether it appeared to help, and whether the user wants GEORGE to remember it.
- Continue real-room testing against voice, visual, fallback, repeat-tail, and sentence-recovery paths.

## Learning Runtime Target

Learning is evidence-driven, not memory-driven.

Target pipeline:

Conversation

↓

Evidence

↓

Confidence

↓

Learning

↓

Future Conversations

No direct memory writes.

Everything earns promotion through evidence.

GEORGE remembers only what improves future execution.

## Next Runtime Implementation Order

1. Inspect real LIVE latency logs from the full turn path.
2. Optimize the slowest measured segment first.
3. Continue Conversation Package Manager hardening.
4. Continue Learning Runtime hardening.
5. Continue Conversation Summary Runtime hardening.
6. Continue Resumable Conversation Readiness.
7. Continue Quick LIVE.

## Engineering Constraint

The doctrines are stable. The work ahead is implementation.

If implementation reveals a genuine gap, document that gap first. Only then decide whether a new doctrine is necessary. Otherwise, implement what already exists.


## Current Validated Operational Chain

Current clean validation:

- Behavioral suite: 32 / 32 passing
- Core smoke: passing
- LIVE Entry smoke: passing
- Production build: passing

The validated operational chain is:

LIVE Entry

↓

Conversation Package Runtime

↓

Conversation Package Manager

↓

Conversation Summary Runtime

↓

Evidence Candidates

↓

Learning Runtime

↓

Conversation Package Update

Conversation Summary Runtime produces operational summaries, evidence candidates, and suggested next actions.

---

## 2026-07-03 — LIVE Runtime Production Hardening Checkpoint

Current branch: `live-hub-runtime`

Validated:
- LIVE runtime support survives restart.
- Delivery style propagates with Hub transcripts.
- Response mode suppresses local placeholders.
- Response mode evidence authority blocks unsupported facts.
- Response relevance gate blocks environmental/social leakage.
- Speech normalization is centralized.
- Environmental/social chatter can be held before Hub.
- Verified response repair path exists in `lib/george/core/verification/action-cue-authority.ts`.
- Cue overfire language was reduced in `live-hub/src/george/cue-patterns.ts`.

Current production focus:
- Validate executive-quality response behavior against enterprise briefing questions.
- Confirm no generic fallback appears when evidence/relevance/usefulness repair is possible.
- Confirm clear product questions do not trigger unnecessary clarification cues.

Doctrine:
- BRANESx is the platform. GEORGE is the agent.
- Words are operational signals, but not the only signals.
- OpenAI/Groq proposes. GEORGE decides.
- Do not move reasoning into `app/george/page.tsx`.

## Implemented Production Runtime: Opportunity Continuity

Implemented runtime owner:

`lib/george/live-runtime/opportunity-continuity.ts`

It sits immediately after Interaction Continuity:

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

Opportunity Continuity owns the doctrine: live to fight another day.

It is wired into Interaction Continuity output, persisted through Conversation Package memory, exposed through Conversation Record projection, and protected by `george:live-runtime:smoke`.

It determines whether the opportunity continues, changes form, pauses, transfers to another decision maker, becomes dormant, or ends. If the opportunity continues, GEORGE should preserve the best executable path toward the user's desired outcome.

This is not simple follow-up logic. It should decide whether the user should wait, follow up, deliberately not follow up, seek another decision maker, preserve access, change the next objective, or treat the opportunity as closed.

## Visual-Only, Audio-Only, and Audio-Visual LIVE Delivery

Receiver profile changes delivery behavior, not reasoning ownership.

The same support behavior should originate from the same runtime decision. GEORGE must not run duplicate reasoning for audio and visual surfaces.

### visual_only

Visual-only support can carry richer, more persistent support because the user can glance, choose, ignore, and return to it without waiting for playback.

Visual-only delivery should support:

- richer persistent support
- hierarchy
- bullets and cards
- longer guidance when useful
- glance-and-return reading
- clear separation between cue, bridge, recovery, and full response

### audio_only

Audio-only support is sequential, interruptible, repeatable, and higher cognitive load.

Audio should generally favor short, recoverable guidance, but shortness is not law. The governing qualifier is always what is most likely to improve the user's probability of achieving the user's desired outcome.

Audio-only delivery should support:

- sequential delivery
- interruption handling
- repeat-tail
- sentence recovery
- repeatable wording
- low cognitive load where that improves outcome
- longer lines only when likely to improve the user's successful outcome

### audio_visual

Audio-visual support should treat audio as the immediate steering layer and visual as the persistent reference layer.

Both layers must originate from the same support behavior without duplicate reasoning.

Audio should carry the fastest useful steering signal.

Visual should preserve the persistent reference, structure, or fuller line the user may need to glance back to.

### Production rule

Behavior Composer decides the support behavior.

Delivery policy decides how that support behavior is rendered for `visual_only`, `audio_only`, or `audio_visual`.

Do not create another runtime.
Do not duplicate reasoning between audio and visual.
Do not move this logic into `app/george/page.tsx`.

## LIVE response and guidance ownership

LIVE response governance belongs to `lib/george/live-voice/runtime/response-shaper.ts`.

LIVE guidance/profile behavior belongs to `lib/george/live-runtime/live-guidance.ts`.

`app/george/page.tsx` may call these runtime owners as part of UI wiring, but must not own response governance, LIVE guidance doctrine, support behavior, or signal interpretation.

This preserves portability: LIVE behavior can move across UI surfaces because the behavior lives in runtime modules, not the page.

## Normal Pre-Provider Portability Boundary

Normal GEORGE now has a narrow, portable pre-provider execution boundary.

Canonical owner:

- `lib/george/runtime/pre-provider-send-resolution.ts`

Existing behavior owners composed by that boundary:

- `lib/george/runtime/domain-router.ts`
- `lib/george/runtime/training-runtime.ts`

The resolver does not replace either owner. It makes their execution semantics explicit.

Current modes:

- `provider`: continue ordinary provider generation
- `provider_with_context`: attach canonical domain context and continue provider generation
- `direct`: render the authoritative runtime response and stop before provider transport
- `return`: preserve an existing training-runtime return result

The flow is:

Page input collection
↓
Domain and training behavior owners
↓
Pre-provider send resolution
↓
Page effect application and transport
↓
Chat-route orchestration
↓
Response shape and output governance
↓
Provider

`app/george/page.tsx` must consume this result without reinterpreting its authority.

The page does not own training/domain precedence, direct-versus-provider behavior, authoritative override semantics, domain system-context doctrine, or provider instructions that reproduce direct responses.

### Normal prompt behavior

`lib/george/prompts/suggested-prompts.ts` owns current Normal prompt-selection behavior, including post-response suggestions and reroute detection.

The page owns only UI state and presentation of those results.

### Same GEORGE across operating modes

Normal and LIVE continue to share one operational intelligence and reasoning philosophy.

Normal optimizes toward clarity, preparation, and useful motion under non-real-time conditions.

LIVE optimizes toward user competence, timing, room conditions, and outcome advancement under real-time constraints.

Operating-mode differences must remain limited to constraints, delivery, timing, room behavior, and execution conditions. They must not create separate identity, memory, judgment philosophy, or user understanding.

### Future Operational Judgment phase

Do not introduce Operational Judgment until the portability boundary is clean.

The future flow is:

Signals
↓
Evidence producers
↓
Operational Judgment
↓
Response Shape
↓
Output Governance
↓
Provider

Evidence producers may include Passive Intent, Runtime Interpretation, Judgment Surface, Trajectory, Outcome Learning, Continuity Restoration, and Adaptive User Profile.

They produce evidence. They must not independently decide behavior.

The future Operational Judgment owner will synthesize those streams into one operational decision. It must not become another model, prompt stack, runtime, or competing authority.


---

# Shared Operational Reasoning

GEORGE reasons once.

Normal and LIVE realize that reasoning differently.

Shared operational reasoning produces:

• desired outcome
• opportunity recognition
• signal sufficiency
• highest-value missing signal
• operational judgment
• conversation strategy

Execution policy then determines realization.

Normal:
conversation for the user.

LIVE:
real-time execution for the room.

Execution may compress.

Judgment may not.


## User-Facing Conversation Terminology

`Conversation` is the canonical user-facing concept across GEORGE and LIVE.

User-facing copy should describe:

- the conversation
- conversation participants
- conversation context
- conversation dynamics
- conversation conditions
- conversation history
- preparing, entering, pausing, resuming, saving, and ending a LIVE conversation

`Room` remains available for internal runtime identifiers and implementation concepts such
as `liveRoom`, `roomContext`, `roomSignals`, telemetry, and compatibility fields. Internal
runtime naming must not leak into user-facing product copy unless a literal physical room
is the subject.

## Ambiguity and Execution Doctrine

GEORGE is one operational intelligence.

Normal and LIVE share the same reasoning foundation.

Reasoning may preserve ambiguity when the available evidence does not justify certainty.

GEORGE reasons from signals, not merely from words.

Operating mode changes execution constraints, timing, delivery, and room behavior—not intelligence.

Normal GEORGE may:
- preserve competing hypotheses
- explore alternatives
- request additional signal
- defer commitment

LIVE may internally preserve competing hypotheses while executing only one support behavior for the current moment.

Reasoning may remain probabilistic and evidence-weighted.

Execution at any moment is singular.

Architectural ownership must remain explicit even when operational interpretation remains ambiguous.

<!-- LIVE_PORTABILITY_BOUNDARY:BEGIN -->
## LIVE runtime and host boundary

The canonical portability boundary is:

```text
Portable operational behavior
  lib/george/live-runtime/*
            ↑ invoked by
Environment and browser adapters
  lib/george/live-host/*
            ↑ mounted by
Application surfaces and bridges
```

Ownership rules:

- Runtime owns operational reasoning, signal interpretation, policy, composition, detection, arbitration inputs, and portable state transformations.
- Host owns browser storage, browser lifecycle, media playback, session restoration, runtime leases, usage persistence, support preferences, and outcome persistence.
- Runtime must not import host.
- Application surfaces must not recreate either owner's behavior.
- New device targets should implement host adapters while preserving the portable runtime.
<!-- LIVE_PORTABILITY_BOUNDARY:END -->

<!-- LIVE_OPERATIONAL_ASSESSMENT:BEGIN -->
## Operational assessment delivery contract

The LIVE runtime produces one operational assessment. It is not recomputed by a receiver surface.

```text
room signals
  -> operational reasoning
  -> operational assessment
       action
       evidence
       confidence
       optional outcome impact
  -> receiver delivery policy
```

Runtime ownership determines what support is warranted and why. Delivery ownership determines how much of that same assessment is spoken or displayed. This preserves one intelligence and one reasoning path across audio-only, visual-only, and audio-visual receivers.
<!-- LIVE_OPERATIONAL_ASSESSMENT:END -->

<!-- LIVE_HOST_COMPOSITION:BEGIN -->
## Application host composition

The browser application mounts GEORGE through one host-facing dependency:

```text
app/george/page.tsx
        |
        v
live-host/live-application-host.ts
        |
        +-- audio playback
        +-- session persistence
        +-- prep persistence
        +-- draft restoration
        +-- runtime usage
        +-- outcome recording
        +-- support preferences
```

The composition module does not absorb runtime reasoning and does not replace
the focused host owners. It defines the application-shell boundary that another
browser, desktop, mobile, or wearable companion host can replace.

Dependency direction remains one way:

```text
application surface -> host composition -> focused host adapters
application surface -> portable runtime
portable runtime -X-> browser host
```
<!-- LIVE_HOST_COMPOSITION:END -->

<!-- LIVE_AUDIO_HOST_LIFECYCLE:BEGIN -->
## Audio host lifecycle

`lib/george/live-host/audio-playback.ts` owns the complete lifecycle of one
generated audio object:

```text
audio URL
  -> readiness event or bounded fallback
  -> immediate play request
  -> playback start
  -> playback end, failure, or explicit stop
  -> timer/listener cleanup and promise settlement
```

The application retains the playback handle rather than the raw browser audio
element. This allows interruption and replacement to terminate the active host
operation cleanly without moving audio behavior into the portable runtime.
<!-- LIVE_AUDIO_HOST_LIFECYCLE:END -->

<!-- LIVE_TRANSCRIPT_PACKET_OWNER:BEGIN -->
## Transcript packet owner

The LIVE runtime adapter remains the canonical owner of transcript queueing and
transport dispatch. Within that owner, `TRANSCRIPT_INPUT` envelope construction
is centralized in one private helper:

```text
immediate transcript ─┐
                      ├─> sendTranscriptPacket -> transport
queued transcript ────┘
```

This consolidation is intentionally internal to the existing adapter boundary.
No new runtime, transport, or application abstraction is introduced.
<!-- LIVE_TRANSCRIPT_PACKET_OWNER:END -->

<!-- LIVE_TIMER_OWNER:BEGIN -->
## Final-transcript timer owner

`components/george/live/LiveHubShadowBridge.tsx` is the canonical owner of the
browser-side final-transcript release timer.

```text
final transcript fragment
        ↓
replace owned release timer
        ↓
release buffered final transcript
        ↓
clear timer and pending turn state
```

Bridge deactivation and unmount use the same reset lifecycle. No timer utility
or parallel runtime owner is introduced.
<!-- LIVE_TIMER_OWNER:END -->

<!-- GEORGE_RUNTIME_INTERFACE_FREEZE:BEGIN -->
## Frozen production runtime interfaces

The current production interfaces are stable portability boundaries, not invitations to create new layers.

```text
Support Behavior Composer
        ↓
Receiver Policy
        ↓
Delivery Router
        ↓
Delivery Bridge
        ↓
Voice / visual / silent host realization
```

The LIVE Hub adapter is a transport boundary only:

```text
connect(context)
syncContext(context)
disconnect()
sendTranscript(text, isFinal, turnId, deliveryStyle)
subscribe(listener)
```

It may own connection state, bounded reconnect, stale-transport rejection, context replay, and queued transcript release. It must not choose support behavior, shape receiver content, render guidance, or execute audio.

Contract ownership:

- Runtime behavior contracts belong to `lib/george/live-runtime`.
- Receiver and delivery contracts belong to `lib/george/live-delivery`.
- Hub transport contracts belong to `lib/george/live-hub`.
- Runtime telemetry contracts belong to `lib/george/live-metrics`.
- Browser execution belongs to host and application surfaces.
- Bridges translate and dispatch; renderers present approved output.

Dependency direction remains one way. Rendering may consume delivery output but may not reinterpret it. Delivery may consume an approved runtime assessment but may not recompute it. Telemetry may observe every boundary but may not become an authority boundary.

`scripts/george-runtime-interface-freeze-qualification.mjs` protects these ownership and public-surface constraints in the production build.
<!-- GEORGE_RUNTIME_INTERFACE_FREEZE:END -->


<!-- GEORGE_DUPLICATE_OWNERSHIP_AUDIT:BEGIN -->
## Duplicate-ownership protection

The application page is permitted to compose state, mount bridges, present runtime observations, and provide host callbacks. It is not permitted to import or invoke canonical support-behavior, receiver-policy, delivery-routing, or runtime-construction decisions directly.

The final production audit protects this dependency direction:

```text
application composition
        ↓
shadow / delivery bridges
        ↓
canonical runtime and delivery owners
        ↓
approved host realization
```

Renderers consume approved delivery output. Bridges translate and dispatch. Canonical owners decide. A new feature must extend the existing owner rather than reproduce its decision in a page, bridge, renderer, test surface, or provider adapter.

`scripts/george-duplicate-ownership-audit.mjs` is part of the production build immediately after runtime-interface-freeze qualification.
<!-- GEORGE_DUPLICATE_OWNERSHIP_AUDIT:END -->


<!-- GEORGE_LIVE_INPUT_LATENCY_BOUNDARY_START -->
## LIVE Input Latency Boundary

STT latency tuning remains transport configuration, not behavioral authority.

- Browser capture cadence: `lib/george/live-voice/stt/deepgram-live-client.ts`.
- LIVE Hub provider endpointing: `live-hub/src/stt/deepgram-stream.ts`.
- Final utterance assembly: `lib/george/live-runtime/final-transcript-release-policy.ts` through `LiveHubShadowBridge.tsx`.

These owners may reduce capture and endpoint detection delay, but they must not choose support behavior, receiver realization, delivery routing, or rendering.
<!-- GEORGE_LIVE_INPUT_LATENCY_BOUNDARY_END -->


<!-- GEORGE_EARLY_REASONING_ARCHITECTURE_START -->
## Early Reasoning Preparation Boundary

Early reasoning preparation is latency work inside the existing LIVE Hub pipeline.

```text
Stable interim transcript
↓
Candidate provider reasoning
↓
Final transcript compatibility validation
↓
Canonical cue arbitration
↓
ACTION_CUE delivery
```

Preparation does not authorize delivery. The final transcript remains the
delivery gate. Incompatible, stale, or missing preparation falls back to the
canonical final-transcript provider request.

The preparer owns only candidate lifecycle and transcript compatibility. It does
not own support behavior, receiver policy, delivery routing, rendering, or user
authority.
<!-- GEORGE_EARLY_REASONING_ARCHITECTURE_END -->
