# GEORGE Production Tracker

## Authority

This document is the primary production authority for the current GEORGE implementation.

Read in this order:

1. `docs/george/PRODUCTION_TRACKER.md`
2. `docs/george/RUNTIME_ARCHITECTURE.md`
3. `docs/george/OPERATIONAL_PROFILE.md`

Continuation packets provide operational context only. They do not override implementation or these synchronized authorities.


### Conversation Description Doctrine

Production UI now follows the **User-Facing Conversation Doctrine**.

Conversation descriptions communicate observable execution capabilities rather than internal runtime behavior. Runtime cognition (listening, reasoning, observation, signal evaluation, etc.) remains implementation detail and should not appear in user-facing conversation descriptions or operational formula summaries.



### Formula Marketplace Doctrine

Formula capabilities are now considered core functionality.

Commercial differentiation applies to verified script publication and sales rather than formula creation or editing.



### Operational Asset Doctrine

Operational Memory, Formulas, Scripts, Verified Scripts, and the Marketplace now form the canonical operational asset hierarchy for GEORGE.



### Operational Matching Doctrine

Formula and script recommendations now derive from user outcomes together with relevant operational signal evaluation rather than keyword matching.



### Operational Matching Pipeline

The operational matcher now follows a canonical seven-stage reasoning pipeline:

Outcome → Briefing → Evidence Retrieval → Relevant Signal Evaluation → Formula Ranking → Script Ranking → Operational Matching Decision.

## Current Phase

GEORGE is in **Production Completion & Operational Formula Experience**.

The runtime architecture, shared reasoning authority, LIVE runtime, receiver policy, delivery routing, behavior composition, operational assessment, portability, operational-learning foundation, and production qualification are established.

The active work is product completion around the existing operational-formula system.

Do not:

- redesign GEORGE;
- redesign LIVE;
- create another runtime;
- create another reasoning lane;
- move canonical ownership;
- move formula, learning, conversation-type, or delivery authority into `app/george/page.tsx`;
- replace existing formula qualification, evidence, reassessment, revision, or lineage capabilities.

The immediate sequence is:

1. keep the production authorities synchronized with implementation evidence;
2. continue Operational Formula Experience implementation from the established canonical owners;
3. inspect only the canonical owner directly affected by the next production task;
4. investigate ownership drift only when qualification, audit, or implementation evidence indicates it;
5. patch canonical owners only;
6. build and run focused qualification.

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

Current product-completion gaps include:

- structured formula identity;
- author and publisher metadata;
- verification-authority metadata;
- Proven By experience;
- formula editing;
- formula alternatives;
- script management;
- marketplace readiness;
- conversation-type consolidation;
- expanded Operational Library presentation.

Canonical ownership remains:

- formula contracts, persistence, evidence, reassessment, revision, and lineage: `lib/george/operational-memory/*`;
- formula retrieval and runtime-evidence policy: `lib/george/operational-memory/*`;
- conversation-type registry: `lib/george/live-entry/conversation-types.ts`;
- Operational Library presentation: `app/george/library/*`.

### Operational-learning canonical ownership

The operational-learning pipeline preserves one canonical owner per responsibility:

- `formula-validator.ts` owns evidence aggregation, confidence calculation, and formula lifecycle status;
- reassessment records operational judgment without mutating confidence or formula lifecycle state;
- production reassessment decisions are `confirm`, `weaken`, and `insufficient_evidence`;
- the evolution engine remains the canonical pipeline seam but performs no structural derivation from those reassessment decisions;
- `formula-derivation-service.ts` is the sole owner of intentional derived-formula creation and derived lineage creation.

Passive reassessment must not create formulas, change confidence, or create competing lifecycle authority.

### Canonical Ownership Inspection Status

Canonical ownership inspection for the current Operational Formula Experience and LIVE Entry completion work is complete.

The following production boundaries have been inspected and synchronized with implementation:

- operational-memory ownership;
- operational-learning ownership;
- formula validation, reassessment, evolution, derivation, and lineage ownership;
- conversation-type ownership;
- Operational Library ownership;
- LIVE Entry preparation and browser-host completion ownership.

Do not repeat broad canonical-owner inspection during continuation work.

Inspect only the canonical owner directly affected by the next production task unless:

- a qualification fails;
- the duplicate-ownership audit reports a violation;
- implementation introduces a new responsibility; or
- implementation and these production authorities materially diverge.

Operational-memory retrieval is production-complete unless qualification or production evidence exposes a defect.


The Operational Library consumes canonical formula and conversation data. It must not become another registry, formula owner, verification authority, learning system, or runtime.

GEORGE owns the operational formula and its lifecycle.

GEORGE is responsible for formula creation, operational learning, evidence, confidence, success, contradictions, revisions, lineage, reassessment, and the decision that a formula remains operationally valid.

BRANESX verifies descriptive metadata claims attached to the formula. These claims may include formula identity, author, publisher, Proven By records, marketplace readiness, script references, verification timestamp, and verification version.

BRANESX does not determine whether the operational formula is correct. Operational validity remains GEORGE's responsibility.

The Operational Library displays GEORGE-owned operational data and BRANESX-verified metadata. It does not create, verify, or modify either.

Users may edit descriptive metadata they own. Verification records are system-managed and may change only through the BRANESX verification process. When verified metadata changes, the affected verification must become stale or be cleared until BRANESX verifies the updated claims.

The formula lifecycle is:

```text
GEORGE creates and evolves the operational formula
↓
User or authorized publisher supplies descriptive metadata
↓
BRANESX verifies descriptive metadata claims
↓
Operational Library displays operational data and verified metadata
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

## Readiness Status — Product-Refinement Baseline

The validated runtime baseline must be preserved while product experience is refined.

The tracker is the canonical status owner. The architecture and operational profile describe their own boundaries and should refer back to this tracker rather than becoming duplicate project-status trackers.

Current evidence establishes that:

- GEORGE operates as one operational intelligence with one shared reasoning authority;
- canonical ownership is established for support behavior, operational assessment, receiver policy, routing, delivery, and rendering;
- operational learning and governed operational-memory retrieval are implemented and qualified;
- portability, interface-freeze, ownership, resilience, latency, and production-build qualifications are recorded in the repository;
- the project has advanced far enough that product refinement is now the primary work.

Supporting evidence in the documentation set includes:

- `LIVE_PORTABILITY_AUDIT.md`: PASS, 49 portable runtime files inspected, 0 portability violations;
- this tracker's recorded build and qualification results;
- `RUNTIME_ARCHITECTURE.md`: architecture frozen unless current implementation evidence proves a genuine defect.

`production-readiness-checklist.md` is historical qualification material. Its older blocking-item language must not be mistaken for the current project phase without fresh implementation evidence.
<!-- GEORGE_READINESS_STATUS_END -->

<!-- GEORGE_MATERIAL_LANGUAGE_DOCTRINE_START -->
## Product Experience and Material Language Doctrine

### Implementation order

The canonical refinement order is:

```text
Motion
↓
Materials
↓
Color
↓
Micro-interactions
↓
Visual refinement
```

Fluidity is implemented before the steel/material palette so material decisions are evaluated without abrupt state changes obscuring the experience.

### One motion language

GEORGE must use one calm, precise, mechanical motion language across the product.

Motion is functional acknowledgement. It is never decorative, playful, elastic, or attention-seeking.

A canonical motion authority should own shared timing and interaction primitives, for example:

```text
lib/george/ui/material-motion.ts
```

Shared primitives include:

- fade;
- collapse;
- slide;
- press;
- shimmer where transiently justified;
- machine acknowledgement.

Do not scatter competing animation timings across components.

### Fade

Anything appearing or disappearing fades.

Applies to menus, dropdowns, popups, machine status, indicators, and helper text.

Default range:

```text
opacity: 180–250 ms
easing: ease-out
```

No popping.

### Collapse

Anything changing size collapses or expands through coordinated height, opacity, and slight vertical translation.

Applies to expanding cards, mode explanations, conversation types, settings, and other revealed regions.

Animate the equivalent of:

```text
max-height: 0 → resolved height
opacity: 0 → 1
translateY: 6px → 0
```

Content must not instantly appear.

### Workspace slide

Whole workspaces settle away and arrive with a slight slide.

Example:

```text
Audio ↔ Visual
```

Default range:

```text
150–220 ms
```

The transition should be subtle, not theatrical.

### Machine acknowledgement

A selected mode does not flash, bounce, or glow aggressively.

The surface receives a restrained light sweep, settles, and becomes still.

### Conversation and stillness

Streaming intelligence remains visibly streaming.

A completed thought becomes perfectly still.

No idle shimmer on completed intelligence.

### Hover

Hover uses:

- 1–2 px lift;
- a slightly brighter edge;
- a restrained reflection.

Do not use dramatic scaling.

### Press

Buttons use approximately 1 px of mechanical travel and return.

They should feel like instrument-panel controls, not elastic web buttons.

### Branch hygiene

The `material-language-redesign` branch is the visual-refinement branch.

Git is the recovery system. Do not add timestamped source backups, copied page files, `.backup-*` artifacts, or new patch-backup directories.

Keep visual changes reviewable and clean enough to merge selectively.

### Popup 3 / Ready Room

Popup 3 is the canonical Ready Room owned by LIVE Entry.

It is not another briefing, mechanics screen, control tutorial, or runtime.

By Popup 3, preparation and mechanics are already resolved. Ready Room must explain what will happen when the user enters LIVE, using the selected receiver and support behavior.

It should communicate:

- how GEORGE will reach the user: Audio, Glasses, or Desktop / Mobile;
- how the selected support behavior will operate in the room;
- what the user should do: speak naturally, continue toward the outcome, and allow GEORGE to adapt if the room changes;
- that settings remain available during LIVE without turning readiness into a control catalogue.

Remove the control-heavy interpretation of Ready Room. Preserve routing and runtime ownership.
<!-- GEORGE_MATERIAL_LANGUAGE_DOCTRINE_END -->

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

Operational signal runtime integration completed:

- Conversation Signals now feed canonical operational signal normalization.
- Operational Signal Normalization produces canonical `OperationalSignal[]` values.
- Operational Signal Interpretation prepares those signals for shared runtime reasoning.
- `buildGeorgeCoreInterpretation()` coordinates the canonical signal pipeline.
- `app/api/chat/route.ts` transports canonical operational signals into the shared runtime.
- Operational Judgment and Conversation Strategy consume canonical signals without recreating ownership.
- Conversation Strategy prefers canonical operational signals before transcript compatibility heuristics.

Validated runtime flow:

```text
OperationalSignal[]
→ Shared Runtime Pipeline
→ Operational Judgment
→ Conversation Strategy
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

<!-- GEORGE_OWNER_WORKFLOW_START -->
## Owner Execution Workflow

The owner prefers automated repository changes over manual coding or manual document editing.

When the owner asks for the **next terminal command**, interpret that as a request for the complete, immediately runnable command that performs the agreed next action. Do not repeat the plan, provide placeholder paths, or ask the owner to create a script that has not been generated.

Every local terminal command, patch command, or script-run command must begin exactly with:

```bash
id="031ukw"
id="xtdj16"
id="1dcmvv"
cd ~/ai-clarity
```

Additional execution rules:

- include `cd ~/ai-clarity` in every runnable local command;
- prefer a generated patch or downloadable script over manual edits;
- for synchronized documentation changes, update all affected authorities in one script or patch;
- generate the artifact before instructing the owner to run it;
- never reference `/path/to/...`, a nonexistent file, or an uncreated script;
- do not use shell heredocs for large changes;
- after execution, provide validation commands that are also immediately runnable;
- use Git as the recovery system instead of timestamped source backups.
<!-- GEORGE_OWNER_WORKFLOW_END -->

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

### Runtime baseline

**PRESERVED FOR PRODUCT REFINEMENT**

The runtime interface freeze, portability boundary, ownership audit, resilience qualifications, and production build evidence establish the baseline for the current experience work.

Architecture changes require evidence of a genuine defect or missing production responsibility. Preference, presentation, motion, color, or wording changes do not justify a new runtime owner.

### Documentation

**SYNCHRONIZED FOR THE CURRENT PHASE**

The production authorities describe distinct responsibilities:

1. `PRODUCTION_TRACKER.md` — canonical phase, readiness, work queue, and validation status;
2. `RUNTIME_ARCHITECTURE.md` — architectural ownership and boundaries;
3. `OPERATIONAL_PROFILE.md` — behavioral doctrine;
4. `NEXT_THREAD_HANDOFF.md` — active branch, immediate work, and execution instructions.

These documents are authoritative while synchronized with implementation.

### Current refinement sequence

1. correct Popup 3 / Ready Room responsibility and content;
2. establish the canonical motion authority;
3. apply motion doctrine to the Ready Room and then shared surfaces;
4. refine materials;
5. refine color;
6. refine micro-interactions;
7. complete final product-experience polish and focused validation.

Do not use product refinement as an opportunity to redesign runtime architecture.

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
