# GEORGE Runtime Architecture

## Authority

This document is the architectural authority for the current GEORGE implementation.

`GEORGE_DOCUMENTATION_SYNC: 2026-08-05-preparation-session-routing`

`IMPLEMENTATION_AUTHORITY: Implementation is authoritative; these documents are authoritative only while synchronized with the validated local implementation.`

`GEORGE_AUTHORITY_READ_ORDER: PRODUCTION_TRACKER.md -> RUNTIME_ARCHITECTURE.md -> OPERATIONAL_PROFILE.md -> NEXT_THREAD_HANDOFF.md`

Read after:

```text
docs/george/PRODUCTION_TRACKER.md
```

Read before:

```text
docs/george/OPERATIONAL_PROFILE.md
docs/george/NEXT_THREAD_HANDOFF.md
```

The implementation remains the source of truth. This document is authoritative only while synchronized with the validated production runtime.

## Architectural Status

Current phase:

```text
Production Completion — conversational preparation and session continuity
```

The runtime architecture is frozen unless current implementation evidence proves a genuine architectural defect.

Preparation Session route migration is product-completion work over the existing runtime. Operational Formula Experience remains an established product layer over the operational-memory and formula-intelligence architecture. Neither may create another runtime, reasoning authority, retrieval path, learning owner, conversation-type registry, or page-level intelligence.

Canonical boundaries:

- `lib/george/operational-memory/*` owns operational formula contracts, persistence, evidence, scripts, reassessment, revision proposals, evolution, and lineage;
- `lib/george/live-entry/conversation-types.ts` owns Conversation Types;
- `app/george/library/*` presents canonical formula and script data;
- `app/george/page.tsx` owns browser-host integration: request transport and LIVE mode identification, browser session state, approved rendering, voice playback, host controls, and bridge mounting. It does not own runtime reasoning, presentation policy, receiver policy, or delivery routing.

Do not create:

- another GEORGE;
- another LIVE runtime;
- another reasoning lane;
- another formula registry;
- another conversation-type registry;
- another operational-learning owner;
- page-level runtime or formula intelligence.

## Synchronized Runtime Ownership — 2026-08-05

GEORGE remains one operational intelligence with one shared runtime and one reasoning authority. Normal and LIVE are operating modes over that same intelligence.

### Preparation Runtime and Preparation Session

The Preparation Runtime is the canonical lifecycle authority. `PreparationSessionV1` is the versioned state for one preparation. Entry routes seed or restore that session; routes do not own preparation state, and route-specific screens do not create separate preparation runtimes.

Canonical owners:

- `lib/george/live-runtime/live-preparation-controller.ts` owns the Preparation Session contract, construction, normalization, canonical interaction normalization, semantic workflow checkpoints, preparation-state resolution, and derived readiness;
- `lib/george/live-runtime/live-preparation-storage.ts` owns portable session serialization under `GEORGE_PREPARATION_SESSION_V1` while retaining legacy preparation-signal compatibility;
- `lib/george/live-browser/live-preparation-browser-storage.ts` owns browser access to canonical and legacy preparation storage;
- `components/home/HomeConversationTypeSurface.tsx` and `app/george/live-entry/LiveEntryClient.tsx` are route adapters and presentation hosts. They seed, restore, persist, and consume the canonical session without becoming a second lifecycle authority.

A Preparation Session may carry:

- stable identity, version, timestamps, provenance, and entry source;
- objective, role or responsibility, participants or audience, conversation identity, known context, communication medium, receiver evidence, and additional briefing signals;
- document references;
- canonical `priorInteractions`, including original question text and answered, skipped, or unknown status, plus the current unanswered question when one exists;
- Formula selection, Script selection, and a session-only customized Script;
- GEORGE support, receiver, and speaking-style recommendations separately from user overrides;
- confirmations and runtime preferences relevant to the prepared room;
- semantic workflow checkpoint, checkpoint history, and return target;
- valid related Normal and LIVE session identities.

### GEORGE working-session continuity

`lib/george/session/store.ts` owns `GeorgeStoredSession`, the parent working-session identity and linkage boundary. It records the stable GEORGE session ID, validated `preparationSessionId` when present, operating mode, and current surface. It points to canonical Preparation, LIVE, Conversation Package, Conversation Record, Formula, Script, and authentication identities; it does not absorb their payloads.

Mode or surface changes across Normal, Library/Marketplace, Preparation, LIVE, Post-LIVE, Ask GEORGE, and Next Call preserve the parent session identity while leaving navigation and adoption decisions to the user. Validated session/preparation linkage takes precedence over compatibility/latest storage, which remains recovery material only. Unrelated sessions cannot inherit active briefing, Formula, Script, LIVE setup, signals, or Conversation Records.

Normal GEORGE's parent linkage is implemented, while full Normal route migration remains pending.

Operational Memory is materially retrievable in Normal and Preparation and resumes full analysis after LIVE. LIVE prioritizes current room, approved preparation, objective, script/formula, and uploaded material; historical memory is consulted only when materially necessary or explicitly requested. Retrieved memory informs work but does not become current-session authority without user adoption.

The production preparation flow is objective → required operational signals → relevant existing assets → missing signal → conversational briefing. Voice and typing share the same Preparation Runtime; speech confidence and non-fabricating compensation remain preparation behaviors. Preparation resolves assessment → operational action → communication behavior → voice/visual expression. LIVE execution composition remains mode-specific and is not replaced by a universal composer.

Readiness, missing evidence, confidence, and recommended next step are derived selectors recomputed by the preparation controller. They are not persisted as canonical Preparation Session truth. `LivePrepSetup` and runtime-support payloads are outputs derived for existing consumers; they are not canonical preparation state, and their external contracts remain unchanged.

Current route status:

- Traditional is migrated and seeds the shared session while preserving questions → Popup 1 → Popup 2 → Popup 3 → LIVE;
- Quick LIVE is migrated and seeds the shared session while preserving its narrow outcome-first gate and direct entry;
- Homepage is migrated and preserves stable session identity through briefing, handoff, Continue Briefing, Popup 3 / Ready Room, Library or Marketplace return, and LIVE entry;
- Normal GEORGE is pending migration and continues to use its legacy handoff;
- Resume is pending meaningful eligibility and must eventually restore a valid Preparation Session rather than a popup or mere storage key;
- Strategy will operate on this same session through semantic workflow transitions after the remaining route migrations. It will not introduce another preparation runtime.

Popup numbers are presentation details. Canonical workflow checkpoints are:

- `briefing/questions`;
- `briefing/decision`;
- `briefing/review`;
- `ready_room/brief`;
- `ready_room/mechanics`;
- `ready_room/readiness`.

The routes remain visually and behaviorally distinct even though preparation authority is shared.

### Adaptive briefing continuity

```text
Homepage or LIVE Entry briefing surface
↓
accumulated priorAnswers + skippedQuestions + priorInteractions
↓
app/api/george/live/signal-question/route.ts
↓
canonical normalized interaction history
↓
one adaptive question or readiness response
↓
control returns to the user
```

Ownership is explicit:

- `components/home/HomeConversationTypeSurface.tsx` owns Homepage briefing state, the user-directed **START LIVE / NEXT QUESTION** decision surface, and the Homepage handoff snapshot;
- `app/george/live-entry/LiveEntryClient.tsx` owns LIVE Entry briefing state, handoff hydration, preparation progression, Popup 2, Popup 3, Continue Briefing, and Enter LIVE;
- `app/api/george/live/signal-question/route.ts` is the single adaptive-question governor and normalization owner;
- both callers produce `priorInteractions`; the governor prefers them and supplements only missing legacy history from `priorAnswers` and `skippedQuestions`;
- each interaction preserves `key`, original `question`, optional `answer`, and `status: answered | skipped | unknown`;
- another question is requested only through explicit **NEXT QUESTION** or **Continue Briefing** action.

### Route-aware preparation and progressive Ready Room

- Traditional and direct preparation keep canonical mechanics configuration in Popup 2. Popup 3 summarizes the selections already confirmed there, and Change returns to the appropriate Popup 2 section.
- Homepage preparation bypasses duplicate traditional mechanics. Popup 3 reviews the current-session support recommendation derived from the Homepage briefing and lets the user change support behavior, receiver/delivery profile, and speaking style before agreement.
- LIVE Entry prefers canonical Homepage handoff data when present and remains compatible with older `optionalSignals`-only handoffs.
- Ready Room progressively resolves assessment → review → agreement → collapse → Formula → final room actions. Only the unresolved decision remains visually primary.
- Formula and Script selections remain part of the LIVE Entry preparation state across Marketplace/Library return.

### Context and receiver-specific presentation

Typed/composer LIVE requests identify themselves with canonical `mode: "conversation"` in `app/george/page.tsx`. `lib/george/runtime/context-framing.ts` owns `ContextFraming` selection, including **What Matters Now**, and `lib/george/chat/presentation-authority.ts` owns framing-before-guidance ordering. Audible LIVE replies remain compact through the existing voice path.

Automatic Hub presentation is a distinct path:

```text
lib/george/live-runtime/operational-assessment.ts
  owns action + evidence + outcomeImpact
↓
lib/george/live-delivery/receiver-policy.ts
  owns receiver-specific composition and modality
↓
lib/george/live-delivery/delivery-router.ts
  owns delivery cue construction
↓
lib/george/live-delivery/visual-presentation-policy.ts
  owns pure one-stage or evidence-first visual planning
↓
components/george/live/LiveHubVisualCueBridge.tsx
  executes accepted plans, timers, cancellation, and cleanup only
```

Audio remains concise and low cognitive load. Visual delivery may persist and stage meaningful evidence/context before the recommended action. Audio-visual delivery is coordinated but not identical: spoken delivery stays compact while visual delivery can stage evidence first. Voice-disabled audio-visual routing can remain visual. No owner in this chain manufactures evidence or creates a second artifact intelligence.

### Qualification ownership

- `scripts/george-live-delivery-policy-smoke.mjs` qualifies planning, suppression, modality preservation, and bridge execution contracts;
- `scripts/george-documentation-qualification.mjs` qualifies synchronization markers, ownership references, required current claims, and selected contradiction guards;
- `package.json` build registration gates both qualifications before the Next.js production build.

## Documentation Synchronization Rule

A production milestone that changes observable behavior, ownership, runtime flow, qualification, product doctrine, canonical preparation ownership, route migration status, session contract, persistence, or workflow semantics is not complete until either the synchronized authority set is updated in the same milestone, or the change is explicitly recorded as implementation-ahead documentation debt in `PRODUCTION_TRACKER.md` and `NEXT_THREAD_HANDOFF.md`.

Documentation debt must not survive a production checkpoint or branch push intended as a validated handoff.

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

Marketplace publication lifecycle ownership is established.

Canonical flow:

```text
Authenticated formula owner
↓
Formula API orchestration
↓
Publication Lifecycle Service
↓
Validated publication transition
↓
Operational Formula Library persistence
```

Ownership is separated:

- `types.ts` owns the publication-state contract;
- `publication-lifecycle-service.ts` alone owns legal publication transitions and transition prerequisites;
- BRANESX-owned verification metadata authorizes transition into the verified publication state;
- marketplace-readiness metadata authorizes transition from published to marketplace-listed;
- the formula API route owns authentication, request normalization, formula-owner enforcement, orchestration, and HTTP responses;
- `redis-formula-library.ts` owns persistence only;
- formula validation continues to own operational-validity status independently from publication state.

Implemented publication states are:

```text
draft
verification_requested
verified
published
marketplace_listed
retired
withdrawn
```

Implemented transition policy includes:

```text
draft → verification_requested
verification_requested → verified
verified → published
published → marketplace_listed
marketplace_listed → published
verified | published | marketplace_listed → retired
nonterminal publication state → withdrawn
```

Verified descriptive metadata changes invalidate BRANESX verification and reset publication state to `draft`. Publication state does not alter recommendation authority, user formula selection, formula learning, operational validity, or historical execution identity.

Operational Library UI orchestration now consumes the canonical publication lifecycle.

UI flow:

```text
Owned formula
↓
State-aware publication action
↓
`publicationTransition` request
↓
Formula API orchestration
↓
Publication Lifecycle Service
↓
Validated transition
↓
Persisted formula response
↓
Operational Library state refresh
```

The Operational Library owns presentation, user intent, loading state, confirmation for destructive actions, and local response application. It does not own transition legality, BRANESX verification, publication policy, formula validity, recommendation, learning, or persistence.

Marketplace Catalog ownership is established.

### Marketplace Governance Doctrine

Operational formulas and scripts are distinct marketplace assets with separate ownership, publication, and pricing authority.

Formula ownership is one of:

- BRANESX;
- BRANESX and one user as co-owners;
- one user.

A formula may never have more than two owners. When co-owned, one owner is always BRANESX.

Formula governance is:

- BRANESX-owned formula: BRANESX controls publication and price;
- co-owned formula: the user controls whether and how it is published, while BRANESX sets the premium price;
- user-owned formula: the user controls publication and price.

Script governance is:

- one user owns and names the script;
- the user decides whether the script is private, free, or premium;
- the user alone sets the script price;
- each script is built on one exact formula identity;
- multiple scripts may be built on the same formula.

Ownership, publication authority, pricing authority, entitlement, verification, and operational validity are separate concerns.

`marketplace-governance-policy.ts` is the canonical governance-policy owner. It does not own publication transitions, entitlement decisions, payment confirmation, fulfillment, formula validation, recommendation, or operational learning.

Canonical catalog flow:

```text
Authenticated user
↓
Marketplace Catalog API
↓
Marketplace Catalog Service
↓
Operational Formula Library access
↓
Verified `marketplace_listed` formulas
↓
Search and discovery results
```

Ownership is separated:

- `marketplace-catalog-service.ts` owns catalog inclusion, search filtering, browse constraints, result limits, and catalog ordering;
- `/api/george/marketplace/catalog` owns authentication, query normalization, orchestration, and HTTP responses;
- `OperationalFormulaLibrary` owns formula access and retrieval;
- Redis remains persistence-only;
- `publication-lifecycle-service.ts` owns publication transitions;
- BRANESX owns verification;
- entitlement, checkout, payment confirmation, and fulfillment remain downstream owners.

The catalog does not determine recommendation, formula validity, publication legality, user entitlement, payment success, or fulfillment. It only exposes discoverable marketplace-listed assets that already satisfy publication and verification requirements.

Marketplace Entitlement ownership is established.

Canonical entitlement decision flow:

```text
Authenticated user and verified tier
↓
Marketplace Entitlement API
↓
Marketplace Entitlement Service
↓
Creator ownership check
↓
Durable entitlement check
↓
Tier-inclusion policy check
↓
Authoritative access decision
```

Ownership is separated:

- `marketplace-entitlement-service.ts` owns access-decision order, entitlement-source interpretation, tier-threshold comparison, grant construction, revocation orchestration, and entitlement listing;
- `redis-marketplace-entitlement-store.ts` owns durable entitlement persistence only;
- `/api/george/marketplace/entitlements/[formulaId]` owns authentication, formula lookup, orchestration, and HTTP responses;
- `GeorgeSession` and the subscriber system own the user's verified subscription tier;
- formula publication metadata declares `requiredTier`, `includedWithTier`, and `purchasable`;
- Marketplace Catalog owns discovery only;
- Publication Lifecycle owns publication state transitions;
- checkout and Stripe verification own payment initiation and confirmation;
- fulfillment remains downstream.

Access-decision precedence is:

```text
Creator ownership
↓
Active durable entitlement
↓
Verified tier inclusion
↓
Denied
```

Durable entitlement sources may be purchase, founder, promotion, or administrative. Tier-derived access is temporary and follows the current verified subscription tier. It is never persisted as a purchase entitlement.

The remaining marketplace architecture is downstream product workflow:

```text
Marketplace listed
↓
Catalog discovered
↓
Entitlement checked
↓
Purchase initiated when required
↓
Payment confirmed
↓
Durable entitlement granted
↓
Asset delivered for use
↓
Revised, retired, or withdrawn
```

Purchase, payment confirmation, and fulfillment must consume the entitlement owner. They must not be added to Operational Memory recommendation, learning, formula validation, Redis formula persistence, Marketplace Catalog, Publication Lifecycle, or subscription-tier authority.

Canonical ownership remains:

- formula contracts, persistence, evidence, reassessment, revision, and lineage: `lib/george/operational-memory/*`;
- formula retrieval and runtime-evidence policy: `lib/george/operational-memory/*`;
- script retrieval by formula: `OperationalScriptLibrary`;
- script retrieval implementation: `RedisScriptLibrary`;
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

Operational Memory owns formula retrieval, derivation, reassessment, learning, and recommendation.

`OperationalScriptLibrary` owns script retrieval by formula. `RedisScriptLibrary` implements that contract. Operational Memory consumes the contract and does not perform formula-specific script filtering itself.

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

### Session-Only Customized Script Handoff

Canonical flow:

```text
Selected source script
↓
Session-only working copy
↓
LiveEntryClient
↓
LivePrepSetup.customizedScript
↓
existing GEORGE_LIVE_SETUP preparation storage
↓
LIVE consumer
↓
current-session execution context
```

`LivePrepSetup` owns the handoff contract. LIVE Entry populates it, existing preparation storage transports it, and LIVE consumes it.

The customized copy is execution context only. It must not overwrite the source script, mutate the script library, create another local-storage key, introduce another preparation payload, or establish a second runtime path.

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

Formula ownership is modeled separately from runtime and learning authority. A formula may be owned by BRANESX, co-owned by BRANESX and one user, or owned by one user.

GEORGE owns formula creation, evidence, confidence, success, contradictions, revisions, lineage, reassessment, operational learning, and the decision that a formula remains operationally valid. This authority does not collapse ownership, publication, pricing, entitlement, or commerce into the learning runtime.

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
- return a pure `GeorgeVisualPresentationPlan`;
- when existing `GeorgeOperationalAssessment.evidence` is meaningful, plan evidence/context first and the recommended action second;
- include `outcomeImpact` in the evidence stage only when it is distinct from the evidence and action;
- return the existing single-stage plan when evidence is absent;
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
- execute approved presentation stages without deciding their content or order;
- cancel an unfinished sequence when a newer cue is accepted, while leaving the active sequence intact when a new cue is suppressed;
- invalidate stale callbacks with a sequence token;
- refresh presentation timing for every rendered stage;
- clear timers and visual state on LIVE deactivation and invalidate callbacks on unmount;
- preserve policy-created newline structure;
- allow normal word wrapping;
- report visual telemetry;
- replay approved delivery as a single stage when no operational assessment is available;
- avoid receiver-specific text shaping.

Rendering preserves structure. It does not create structure.

The Visual Bridge does not own reasoning, evidence authority, evidence ordering, interruption, replacement, priority, duplicate-suppression, or persistence policy.

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

`app/george/page.tsx` is the browser application host and integration surface. Mounting is one responsibility, not its entire boundary.

Permitted host responsibilities:

- hydrate and persist user-selected host preferences;
- mount LIVE bridges;
- integrate microphone lifecycle;
- identify typed/composer LIVE requests with the canonical conversation mode;
- preserve provider-owned `ContextFraming` and guidance order in visual responses;
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
- staged LIVE delivery and visual-presentation policy smoke;
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
- documentation synchronization qualification;
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

The tracker owns phase and readiness status. This document owns architectural boundaries. Current work proceeds through structured support-recommendation quality, desired-outcome readiness qualification, Formula/Marketplace completion, manual return-path qualification, and progressive-disclosure polish without reopening runtime architecture.

<!-- GEORGE_HOMEPAGE_BRIEFING_ARCHITECTURE_START -->
## Homepage and Traditional Briefing Surfaces

GEORGE has one briefing capability and one optional-question reasoning authority.

Homepage and Traditional are different presentation surfaces over that same intelligence. They are not separate briefing runtimes, separate reasoning systems, or separate session authorities.

Canonical surface flow:

```text
Shared briefing capability
├─ Homepage surface
│  ├─ conversation selection
│  ├─ fresh mandatory briefing
│  ├─ START LIVE / NEXT QUESTION decision
│  ├─ exactly one optional OpenAI interaction per NEXT QUESTION action
│  ├─ homepage brief review
│  └─ approved `review_brief` handoff
│
└─ Traditional surface
   ├─ traditional questioning
   ├─ Popup 1
   ├─ Popup 2 Mechanics
   └─ preparation progression

Both surfaces converge at Popup 3
↓
LIVE
```

Canonical ownership:

- `components/home/HomeConversationTypeSurface.tsx` owns Homepage briefing presentation, local progression, accumulated answers/skips/question history, canonical `priorInteractions`, the user decision surface, and Homepage brief review/handoff;
- `app/api/george/live/signal-question/route.ts` remains the shared optional-question reasoning and canonical history-normalization authority;
- `lib/george/live-runtime/live-intent-runtime.ts` remains the canonical preparation-readiness and mandatory-transition authority;
- `app/george/live-entry/LiveEntryClient.tsx` consumes and hydrates the approved Homepage handoff and owns Popup 2, Popup 3, LIVE-entry continuation, and Marketplace/Library return state;
- Popup 1 and Popup 2 Mechanics remain Traditional preparation surfaces;
- Popup 3 is the convergence surface before LIVE.

Homepage-origin preparation must not fall through to:

```text
Quick LIVE picker
Traditional briefing
Popup 1
Mechanics
```

The Homepage handoff carries optional answers, question history, skipped-question state, canonical `priorInteractions`, and preparation selections into LIVE Entry. LIVE Entry hydrates its existing state from canonical handoff data when present and falls back to older `optionalSignals` handoffs without creating a second history owner.

Back navigation is semantic state restoration:

```text
Popup 3 Back
↓
homepage brief-review state restoration
```

It must not degrade into a generic homepage redirect when homepage review was the prior state.

After each optional answer or skip, control returns to the user. **Continue Briefing** in LIVE Entry and **NEXT QUESTION** on Homepage are the only paths that request one more adaptive interaction; no recursive automatic question loop is an owner.

Traditional Popup 2 remains the mechanics owner. Homepage Popup 3 reviews and confirms a current-session recommendation. Progressive Ready Room presentation collapses confirmed support assessment and Formula sections without transferring their underlying state ownership.

This architecture introduces no new runtime, OpenAI lane, session authority, readiness owner, or briefing engine.
<!-- GEORGE_HOMEPAGE_BRIEFING_ARCHITECTURE_END -->


-------------------------------------------------------------------------------
FORMULA & MARKETPLACE DOCTRINE
-------------------------------------------------------------------------------

Everything in GEORGE exists to improve the user's outcome.

Conversation, preparation, formulas, scripts, screeners, and LIVE are
operational means toward that end.

Operational Formula is the primary runtime asset.

Formula
↓
Scripts
↓
Screeners

Formula defines operational strategy.

Scripts implement a Formula.

Screeners support Script execution.

Scripts and Screeners exist in service of a Formula.

Formula remains the canonical operational authority.

Operational Marketplace exists inside the GEORGE ecosystem.

Marketplace distributes operational capabilities.

Marketplace does not distribute downloadable documents.

Operational capabilities influence GEORGE's behavior after activation.

Marketplace
---------
Discover
Acquire
Save

My Library
----------
Owned
Saved
Pinned
Recent
Favorites
Activate for this Room

Ready Room activates operational assets from My Library.

Marketplace remains optional after acquisition.

Publisher workflow remains separate from user workflow.

Formula presentation standard:

Formula Name

Published by BRANESX

Conversation Environment

Conversation Formula

Associated Scripts

Associated Screeners

Expanded sections may include:

Versions

Evidence

Related Formulas

<!-- GEORGE_CONVERSATIONAL_LATITUDE_AND_LEARNING_START -->
## Conversational Latitude, Intelligent Briefing, and Relationship Learning

GEORGE retains operational governance.

OpenAI has greater latitude over conversational expression when serving the user's goal.

### Governance

GEORGE governs operational intent, outcome authority, relevance, user agency, whether another question is worthwhile, what affects preparation or LIVE behavior, what may be retained, formula recommendation and activation, and when questioning should stop.

### Conversational expression

OpenAI may determine whether a bridge would improve understanding; how to premise a question or answer; how to encourage nuance; how to summarize and transition; how to adapt language and pacing; and how to recognize when the user has already answered more than was asked.

Example bridge:

> Who you're speaking with often changes how the same idea should be presented.

A bridge explains why the information matters and prepares the user's thinking for what comes next.

### Intelligent briefing

The purpose of intelligent briefing is not to collect answers.

Its purpose is to discover the operational signals that best serve the user's outcome, determine whether additional information would materially improve that outcome, and identify the operational formula most likely to help achieve it.

Every answer may contain more value than the question requested.

GEORGE should parse the direct answer and all available operational signals without forcing redundant questions.

GEORGE should never ask more than it needs before the user has access to LIVE or another execution surface.

### Formula discovery and design

Formulas are informed by intelligent briefing, selected through operational assessment, designed or refined from recurring successful patterns, recommended because they are likely to serve the user's outcome, activated to govern GEORGE's behavior for the current room, and improved through operational evidence.

Scripts implement formulas.

Screeners support scripts and may represent barriers or conditions a script must overcome, including gatekeepers in outbound calling and routing conditions in inbound or call-center environments.

### Relationship learning

Relationship learning exists only to improve GEORGE's ability to help the user achieve outcomes.

As GEORGE learns how to work effectively with a user, it should ask fewer unnecessary questions, recognize recurring work and interaction patterns, recommend more appropriate formulas, learn which support styles work best, adapt explanation depth, communicate more effectively, and reduce friction before and during execution.

The purpose is not to remember more.

The purpose is to serve the user's outcome more effectively over time.

### Language boundary

User-facing language: goal, objective, success, preparation, progress.

Internal runtime language: outcome, operational assessment, signal, formula, support, execution.

This boundary avoids semantic drift while preserving established runtime terminology.
<!-- GEORGE_CONVERSATIONAL_LATITUDE_AND_LEARNING_END -->

<!-- FORMULA_SCRIPT_EXECUTION_LEARNING_START -->
## Formula, Script, Execution, and Learning

Canonical execution flow:

Role
↓
Goal
↓
Intelligent Briefing
↓
Operational Assessment
↓
Formula
↓
Script or Cue Expression
↓
Execution

A Formula is the operational strategy. It determines what operational move should occur.

A Formula is proven when it is used successfully to achieve the relevant outcome.

A successful execution may prove the Formula used, add evidence to an already proven Formula, prove an existing alternate Formula, or create a new Formula when GEORGE's successful adaptation constitutes a genuinely different operational strategy.

The original Formula is preserved.

A Script is a delivery layer built on a Formula.

One Formula may produce many Scripts.

A Script may vary by wording, semantics, role, audience, environment, platform, language, delivery style, branches, openings, closings, recovery paths, timing, LIVE cues, and follow-up without necessarily changing the underlying Formula.

Cues are generated in service of the Formula. The user may create their own wording from those cues.

A successful Script is evidence for the Formula it implements. Script evidence cannot be separated from Formula evidence.

After execution, the user decides whether observed wording or delivery changes should be discarded, update an existing Script, be saved as a new Script, remain private, be shared, be published for free, or be published for premium consumption.

For repeated-conversation sessions, role, goal, active Formula, Script, support style, steering phrases, and operational context persist. Transient conversation state resets between interactions.

GEORGE may retain the current strategy or recommend an adjustment when sufficient session evidence justifies doing so.

Recommendation contract:

> Your call.

- Keep Current
- Adjust Strategy

OpenAI's LIVE reasoning remains within conversational execution: what GEORGE and the user can accomplish together through the user's voice, and how to improve the likelihood of reaching the user's goal.

Normal and LIVE remain modes of one intelligence. No separate runtime or separate reasoning authority is introduced.
<!-- FORMULA_SCRIPT_EXECUTION_LEARNING_END -->
### Working Formula Hypothesis

Operational Memory may create a working Formula hypothesis when canonical retrieval produces no sufficiently relevant Formula for a completed semantic briefing.

This does not create another reasoning authority or Formula owner.

Canonical flow:

completed briefing + desired outcome
→ canonical Formula retrieval
→ canonical retrieval policy
→ qualifying Formula exists: use existing Formula
→ no qualifying Formula: governed provider strategy synthesis
→ Formula hypothesis materializer
→ personal/private candidate Formula
→ canonical Formula Library persistence
→ current working recommendation

The desired outcome remains the authority. The Formula is the current operational strategy for achieving it.

Provider reasoning returns structured operational strategy only when explicitly requested by the recommendation path. Provider reasoning does not create, persist, publish, verify, commercialize, reassess, evolve, or learn Formula assets.

operational-memory.ts owns recommendation orchestration and the decision to materialize a hypothesis after a true retrieval miss.

formula-hypothesis.ts owns only conversion of structured strategy reasoning into the candidate Formula shape.

The resulting Formula is initially unproven and may adapt as execution produces new signal and evidence.

Incomplete briefing does not create a persisted Formula hypothesis.

Formula creation does not imply Script creation. Script selection remains a separate downstream concern.

### Working hypothesis versus derived candidate

The pre-execution working Formula hypothesis is not the same lifecycle event as a post-execution derived Formula Candidate, and only the derived-candidate path is governed by the existing user-retention approval rule.

Working-hypothesis creation occurs only after recommendation retrieval fails to produce a sufficiently relevant Formula and a completed briefing provides enough operational context to synthesize a strategy. The private candidate Formula is persisted before execution so the exact strategy used in the room has canonical identity.

Post-execution derivation remains separate. If execution evidence indicates a materially different operational strategy, the canonical derivation path may propose a derived Formula Candidate with preserved lineage. Existing retention and approval rules continue to govern that candidate.

The hypothesis materializer does not own derivation. The derivation service does not own recommendation-miss hypothesis creation.
