# GEORGE Production Tracker

## Authority

This document is the primary production authority for the current GEORGE implementation.

`GEORGE_DOCUMENTATION_SYNC: 2026-08-05-preparation-session-routing`

`IMPLEMENTATION_AUTHORITY: Implementation is authoritative; these documents are authoritative only while synchronized with the validated local implementation.`

`GEORGE_AUTHORITY_READ_ORDER: PRODUCTION_TRACKER.md -> RUNTIME_ARCHITECTURE.md -> OPERATIONAL_PROFILE.md -> NEXT_THREAD_HANDOFF.md`

Read in this order:

1. `docs/george/PRODUCTION_TRACKER.md`
2. `docs/george/RUNTIME_ARCHITECTURE.md`
3. `docs/george/OPERATIONAL_PROFILE.md`
4. `docs/george/NEXT_THREAD_HANDOFF.md`

Continuation packets provide operational context only. They do not override implementation or these synchronized authorities.

## Synchronized Current Status — 2026-08-07

Current branch: `conversation-summary-runtime`

Current validated phase: **Production Completion — conversational preparation and session continuity**.

The local implementation has one GEORGE intelligence, one runtime, and one reasoning authority. The current branch preserves that architecture while completing these production behaviors:

- the Preparation Runtime is the canonical lifecycle authority, and the versioned `PreparationSessionV1` is the canonical state for one preparation;
- `lib/george/live-runtime/live-preparation-controller.ts` owns session construction, normalization, interaction normalization, semantic workflow checkpoints, and derived preparation resolution;
- `lib/george/live-runtime/live-preparation-storage.ts` owns the portable `GEORGE_PREPARATION_SESSION_V1` persistence contract, and `lib/george/live-browser/live-preparation-browser-storage.ts` owns browser storage access;
- fresh Traditional, Quick LIVE, and Homepage entry paths now seed and persist the same Preparation Session while preserving their distinct user experiences;
- Homepage preserves one stable preparation identity through briefing, LIVE Entry handoff, Continue Briefing, Popup 3 / Ready Room, Library or Marketplace return, and LIVE entry;
- preparation recommendations and explicit user overrides remain distinct; Formula, Script, customized Script, documents, confirmations, workflow checkpoints, and valid related-session identities may travel with the session;
- preparation readiness, missing evidence, confidence, and recommended next step are recomputed controller results rather than persisted canonical truth;
- existing `LivePrepSetup` and runtime-support payloads remain output contracts rather than Preparation Session state;
- `GeorgeStoredSession` is the parent GEORGE working-session identity/linkage boundary. Mode and surface changes preserve it; Preparation, LIVE, Conversation Package, Conversation Record, Formula, Script, and authentication retain their own canonical ownership;
- Normal, Library/Marketplace, Preparation, LIVE, Post-LIVE, Ask GEORGE, and Next Call preserve validated session/preparation linkage without forcing navigation or user choices;
- unrelated sessions remain isolated by validated session/preparation identity; compatibility/latest storage is recovery material only and cannot override a conflicting validated identity;
- Normal and Preparation may retrieve materially relevant Operational Memory. LIVE prioritizes current room, preparation, objective, script/formula, and approved material; historical memory is suppressed unless materially necessary or explicitly requested. Retrieved memory remains advisory until the user adopts it;
- every conversation yields signals; accumulated signals support evidence, evidence supports recommendations, and recommendations do not automatically rewrite the brief or script;
- Preparation determines required operational signals before searching relevant existing assets. Conversational voice and typing share the same Preparation Runtime, incrementally assemble the briefing, and never fabricate unavailable facts;
- preparation communication resolves assessment → operational action → behavior → voice/visual expression. This preparation-specific composition is not a universalized LIVE Behavior Composer;
- meaningful Resume restoration, legacy cleanup, and Strategy integration remain pending;
- Homepage and LIVE Entry construct canonical `priorInteractions` from accumulated answers, skipped questions, and original question text;
- `app/api/george/live/signal-question/route.ts` normalizes canonical briefing history while retaining `priorAnswers` and `skippedQuestions` compatibility;
- Homepage returns control after each optional question and requests another question only through **NEXT QUESTION**;
- LIVE Entry returns control after answer, skip, or “I don’t know” and requests one additional interaction only through **Continue Briefing**;
- Homepage handoff and LIVE Entry hydration preserve answers, question history, skips, and canonical interaction history;
- traditional preparation keeps mechanics ownership in Popup 2, while Homepage-origin Popup 3 reviews a current-session support recommendation;
- the progressive Ready Room follows assessment → review → agreement → collapse → Formula → final room actions;
- typed/composer LIVE requests activate `ContextFraming` through canonical `mode: "conversation"`, preserving framing before guidance while audible LIVE output remains compact;
- `lib/george/live-delivery/visual-presentation-policy.ts` plans evidence-first visual stages from existing operational assessment, and `components/george/live/LiveHubVisualCueBridge.tsx` executes those plans without becoming a reasoning owner;
- staged visual execution is cancellable, lifecycle-safe, and build-qualified by `scripts/george-live-delivery-policy-smoke.mjs`.

Current qualification status: **PASS** at `2fe3cbda` after `git diff --check`, `george:documentation:qualify`, the complete production qualification chain, TypeScript, and the Next.js production build. Legacy preparation keys remain read-compatible while route migrations are incomplete.

### Route migration status

| Entry path | Canonical session status | Preserved experience |
| --- | --- | --- |
| Traditional | Migrated | Full questions → Popup 1 → Popup 2 → Popup 3 → LIVE |
| Quick LIVE | Migrated | Minimum outcome-first setup → LIVE |
| Homepage | Migrated | Adaptive briefing → Popup 3 / Ready Room → LIVE |
| Normal GEORGE | Linked / pending full migration | Existing GEORGE session identity is preserved through deliberate preparation/LIVE handoff; full route migration remains pending |
| Resume | Pending | Must restore meaningful preparation, not infer eligibility from a storage key |

Strategy remains future workflow over the same Preparation Session. It must not introduce another preparation runtime or semantic layer.

### Current remaining production priorities

1. Migrate the deliberate Normal GEORGE → LIVE handoff to the canonical Preparation Session with both `preparationSessionId` and `normalSessionId`.
2. Add focused Normal-handoff qualification after the production migration.
3. Implement meaningful Resume eligibility and restoration using canonical session evidence rather than storage-key existence.
4. Retire legacy preparation compatibility only after all route migrations are validated.
5. Integrate future Strategy transitions into the same Preparation Session lifecycle after Normal and Resume are canonical.
6. Continue product priorities including recommendation quality, Formula/Marketplace empty states, manual Homepage → Library → Ready Room continuity, and progressive-disclosure polish.
7. Preserve adaptive briefing and staged visual behavior through their build-gated qualifications.
8. Keep the authority set synchronized as production behavior changes.

## Documentation Synchronization Rule

A production milestone that changes observable behavior, ownership, runtime flow, qualification, product doctrine, canonical preparation ownership, route migration status, session contract, persistence, or workflow semantics is not complete until either the synchronized authority set is updated in the same milestone, or the change is explicitly recorded as implementation-ahead documentation debt in `PRODUCTION_TRACKER.md` and `NEXT_THREAD_HANDOFF.md`.

Documentation debt must not survive a production checkpoint or branch push intended as a validated handoff.


### Conversation Description Doctrine

Production UI now follows the **User-Facing Conversation Doctrine**.

Conversation descriptions communicate observable execution capabilities rather than internal runtime behavior. Runtime cognition (listening, reasoning, observation, signal evaluation, etc.) remains implementation detail and should not appear in user-facing conversation descriptions or operational formula summaries.



### Formula Marketplace Doctrine

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

Formula capabilities are now considered core functionality.

Commercial differentiation may apply to both formulas and scripts. Formula creation and editing remain core capabilities; marketplace publication, pricing, acquisition, and resale follow the canonical asset-governance policy.



### Operational Asset Doctrine

Operational Memory, Formulas, Scripts, Verified Scripts, and the Marketplace now form the canonical operational asset hierarchy for GEORGE.



### Operational Matching Doctrine

Formula and script recommendations now derive from user outcomes together with relevant operational signal evaluation rather than keyword matching.



### Operational Matching Pipeline

The operational matcher now follows a canonical seven-stage reasoning pipeline:

Outcome → Briefing → Evidence Retrieval → Relevant Signal Evaluation → Formula Ranking → Script Ranking → Operational Matching Decision.



### Operational Recommendation Doctrine

Operational recommendation is owned by Operational Memory.

Operational Memory remains the single canonical owner of:

- formula retrieval;
- derivation;
- reassessment;
- learning;
- recommendation.

`OperationalScriptLibrary` is the canonical owner of script retrieval by formula. It owns formula matching, optional formula-version matching, and retrieval ordering.

`RedisScriptLibrary` is the canonical implementation of that retrieval contract.

Operational Memory consumes the script-library retrieval contract and does not implement formula-specific script lookup.

Recommendation consumes retrieval evidence. It does not replace retrieval, create another matching path, or move recommendation authority into LIVE Entry, Popup 3, Review Formula, Marketplace, the Operational Library, or an API route.

A recommendation may include:

- a recommended formula;
- a recommended script;
- contextual confidence;
- operational rationale;
- ranked alternatives.

Recommendation occurs once for the active preparation decision.

The user may review, edit, or select another formula. Once the user intentionally selects a formula, that selection becomes authoritative for execution.

Recommendation restraint requires GEORGE to:

- confirm compatibility when the selected formula remains operationally sound;
- preserve user choice quietly;
- identify only material operational contradictions;
- avoid treating a merely different formula as a reason to replace the user's selection;
- avoid repeatedly reopening recommendation after an intentional selection;
- preserve comparison and performance evidence for post-LIVE learning and reporting.

Learning improves future recommendation quality. It does not override, rewrite, or retroactively replace the user's choice.

### Session-Only Customized Script Handoff

`LivePrepSetup` is the canonical payload owner for carrying a customized script from LIVE Entry into LIVE execution.

Ownership remains separated:

- `LiveEntryClient` creates and places the session-only customized working copy into `LivePrepSetup.customizedScript`;
- the existing `GEORGE_LIVE_SETUP` preparation-storage path transports the complete setup payload;
- LIVE consumes the optional customized script from that same payload for the current session;
- the source script, published script, and script-library record remain immutable through this path.

This handoff does not create another storage key, preparation object, runtime, script persistence path, recommendation owner, or execution authority.

### Executed-formula operational learning

The production learning path preserves the exact formula selected for execution:

```text
LIVE setup formula selection
↓
LIVE completion
↓
Conversation Package `formulaSelection`
↓
Conversation Record `formulaSelection`
↓
Conversation Record Adapter
↓
canonical `formulaExecution`
↓
exact persisted formula/version reassessment
↓
Operational Memory learning
```

Ownership remains separated:

- LIVE Entry and LIVE setup preserve the resolved `formulaId`, `formulaVersion`, and selection source;
- the browser-host LIVE completion owner passes that selection into interaction continuity;
- Conversation Package owns package-level `formulaSelection`;
- Conversation Record projects that same identity for post-LIVE learning;
- `conversation-record-adapter.ts` alone converts valid selection identity into canonical `formulaExecution`;
- `operational-memory.ts` owns learning orchestration and reassesses only when the persisted formula exists and its version exactly matches the executed version;
- the reassessment engine owns reassessment judgment;
- the evolution engine owns the evolution seam and performs no passive structural derivation;
- `formula-derivation-service.ts` remains the sole owner of intentional derived-formula creation and derived lineage.

If the exact executed formula or version is unavailable, Operational Memory does not infer another execution target.

Qualification coverage:

- `george:operational-memory:qualify` protects retrieval, recommendation ownership, reassessment, evolution, derivation, and persistence boundaries;
- `george:executed-formula-learning:qualify` protects formula identity preservation from setup through `formulaExecution`, exact-version reassessment, mismatch restraint, and Operational Memory learning;
- the production `build` command includes both qualifications, the duplicate-ownership audit, portability qualification, preparation qualification, and the Next.js production build.


## Historical Phase — Operational Formula Experience

This section records the earlier **Production Completion & Operational Formula Experience** phase.

The runtime architecture, shared reasoning authority, LIVE runtime, receiver policy, delivery routing, behavior composition, operational assessment, portability, operational-learning foundation, and production qualification are established.

The active work in that phase was product completion around the existing operational-formula system.

Do not:

- redesign GEORGE;
- redesign LIVE;
- create another runtime;
- create another reasoning lane;
- move canonical ownership;
- move formula, learning, conversation-type, or delivery authority into `app/george/page.tsx`;
- replace existing formula qualification, evidence, reassessment, revision, or lineage capabilities.

The sequence recorded for that phase was:

1. keep the production authorities synchronized with implementation evidence;
2. continue Operational Formula Experience implementation from the established canonical owners;
3. inspect only the canonical owner directly affected by the next production task;
4. investigate ownership drift only when qualification, audit, or implementation evidence indicates it;
5. patch canonical owners only;
6. build and run focused qualification.

<!-- GEORGE_OPERATIONAL_FORMULA_EXPERIENCE_START -->
## Operational Formula Experience

This section preserves the completed **Production Completion & Operational Formula Experience** program history.

The runtime architecture was largely complete. That work documented, organized, exposed, and extended the production operational-formula assets without replacing them or introducing another runtime, reasoning authority, learning system, or ownership path.

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

Marketplace publication lifecycle ownership is implemented.

Validated implementation now includes:

- a separate `OperationalFormulaPublicationState` contract for `draft`, `verification_requested`, `verified`, `published`, `marketplace_listed`, `retired`, and `withdrawn`;
- `publication-lifecycle-service.ts` as the sole owner of publication transition policy;
- guarded transitions for verification request, verified state, publication, marketplace listing, unlisting, retirement, and withdrawal;
- BRANESX verification as a prerequisite for the verified publication state;
- marketplace-readiness metadata as a prerequisite for marketplace listing;
- metadata-change invalidation that clears stale verification and returns publication state to `draft`;
- Redis formula storage remaining persistence-only;
- the formula API route remaining authentication, request normalization, ownership enforcement, orchestration, and response handling;
- `george:publication-lifecycle:qualify` included in the production build.

Publication lifecycle ownership does not replace operational-validity status. `OperationalFormulaStatus` remains owned by formula validation and continues to represent `candidate`, `validated`, `contested`, and `retired`.

Operational Library publication controls are implemented.

Validated UI orchestration now includes:

- publication state displayed on each owned formula;
- state-aware actions for verification request, BRANESX verification confirmation, publication, marketplace listing, unlisting, retirement, and withdrawal;
- transition requests sent through the existing formula PATCH route as `publicationTransition` intent only;
- local formula state refreshed from the canonical API response;
- destructive retirement and withdrawal actions guarded by user confirmation;
- BRANESX verification never created or granted by the UI;
- `george:publication-lifecycle-ui:qualify` included in the production build.

The Operational Library remains a presentation and intent surface. It does not decide whether a transition is legal. Transition policy remains owned by `publication-lifecycle-service.ts`.

Marketplace Catalog ownership is implemented.

Validated catalog implementation now includes:

- `marketplace-catalog-service.ts` as the sole owner of marketplace browse and discovery filtering;
- a dedicated authenticated `/api/george/marketplace/catalog` endpoint;
- catalog retrieval through the existing `OperationalFormulaLibrary.listAccessible()` contract;
- catalog inclusion limited to formulas in `marketplace_listed` publication state;
- BRANESX verification required for catalog inclusion;
- operationally retired formulas excluded from catalog results;
- search, room type, objective type, and bounded result-limit support;
- confidence-first and recency-second catalog ordering;
- explicit separation from publication transitions, entitlement, checkout, payment, and fulfillment;
- `george:marketplace-catalog:qualify` included in the production build.

The Marketplace Catalog consumes the Operational Formula Library but does not become another formula store, recommendation authority, publication owner, entitlement owner, or payment system.

Marketplace Entitlement ownership is implemented.

Validated entitlement implementation now includes:

- `marketplace-entitlement-service.ts` as the sole owner of marketplace access decisions;
- explicit formula marketplace policy through `requiredTier`, `includedWithTier`, and `purchasable`;
- creator ownership access;
- durable purchase, founder, promotion, and administrative entitlement sources;
- tier-derived access using the verified `smart`, `intelligent`, or `brilliant` tier from `GeorgeSession`;
- Redis-backed durable entitlement persistence, expiration handling, listing, and revocation;
- a dedicated authenticated `/api/george/marketplace/entitlements/[formulaId]` decision endpoint;
- entitlement decisions restricted to verified, non-retired, marketplace-listed formulas except creator ownership;
- strict separation from catalog discovery, publication transitions, subscription-tier determination, checkout, Stripe verification, and fulfillment;
- `george:marketplace-entitlement:qualify` included in the production build.

Tier-derived access is not a durable entitlement. When a subscription tier changes, tier-derived access changes with it. Purchased or otherwise durable entitlements remain independent of subscription tier until expiration or revocation.

Remaining production-completion work is downstream marketplace and commerce workflow:

- integrate catalog discovery and entitlement state into the Operational Library presentation;
- connect purchase intent to the existing checkout and payment-verification infrastructure;
- implement payment-confirmed entitlement granting and fulfillment;
- define revision behavior for already published, listed, purchased, or otherwise entitled assets;
- refine Operational Library marketplace usability and presentation;
- expand qualification for catalog UI, commerce, payment-confirmed entitlement grants, fulfillment, and published-asset revision behavior;
- keep all three production authorities synchronized with implementation evidence.

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

Formula ownership is distinct from operational authority. A formula may be owned by BRANESX, co-owned by BRANESX and one user, or owned by one user.

GEORGE remains responsible for formula creation, operational learning, evidence, confidence, success, contradictions, revisions, lineage, reassessment, and the decision that a formula remains operationally valid. This operational authority does not make GEORGE the commercial or legal owner of every formula.

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

### Historical branch hygiene

The former `material-language-redesign` branch carried an earlier visual-refinement checkpoint. It is historical context, not the current branch declaration.

Git is the recovery system. Do not add timestamped source backups, copied page files, `.backup-*` artifacts, or new patch-backup directories.

Keep visual changes reviewable and clean enough to merge selectively.

### Popup 3 / Ready Room

Popup 3 is the canonical Ready Room owned by LIVE Entry.

It is not another briefing, mechanics screen, control tutorial, or runtime.

Traditional routes resolve mechanics in Popup 2, and Popup 3 summarizes those confirmed choices without reopening ownership. Homepage routes use Popup 3 to review and confirm the current-session support recommendation derived from the active Homepage briefing. Ready Room then progressively collapses completed decisions and reveals Formula and final room actions.

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
- return a pure visual presentation plan;
- stage meaningful `GeorgeOperationalAssessment.evidence` before its recommended action and include distinct `outcomeImpact` only when it clarifies why the evidence matters;
- preserve a single-stage fallback when meaningful evidence is absent;
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
- execute approved one-stage or multi-stage visual plans;
- cancel unfinished accepted sequences when a newer cue is accepted;
- invalidate stale callbacks and clean up timers when LIVE becomes inactive or the bridge unmounts;
- preserve Receiver Policy line structure;
- report visual delivery telemetry;
- replay approved delivery history when appropriate;
- avoid reshaping or recomposing receiver-policy text.

The Visual Bridge executes approved presentation plans. It does not own reasoning, evidence selection or ordering, interruption, replacement, priority, duplicate-suppression, or persistence policy.

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

`app/george/page.tsx` is the browser application host and integration surface. It mounts LIVE bridges and also owns browser/session transport, approved rendering, host controls, and voice playback integration.

Valid responsibilities:

- hydrate and persist host preferences;
- mount LIVE bridges;
- identify typed/composer LIVE requests with canonical conversation mode;
- preserve provider-owned `ContextFraming` and guidance order for visual responses;
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

Current validated branch:

```text
conversation-summary-runtime
```

Current synchronized HEAD: `d2b412f06de4058c6f55fe3c553c008417f9a27f`.

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

## Historical Production Status — Before Preparation Session Route Migration

### Runtime baseline

**PRESERVED FOR PRODUCT REFINEMENT**

The runtime interface freeze, portability boundary, ownership audit, resilience qualifications, and production build evidence establish the baseline for the current experience work.

Architecture changes require evidence of a genuine defect or missing production responsibility. Preference, presentation, motion, color, or wording changes do not justify a new runtime owner.

### Documentation

**SYNCHRONIZED FOR THE PRECEDING PHASE**

The production authorities describe distinct responsibilities:

1. `PRODUCTION_TRACKER.md` — canonical phase, readiness, work queue, and validation status;
2. `RUNTIME_ARCHITECTURE.md` — architectural ownership and boundaries;
3. `OPERATIONAL_PROFILE.md` — behavioral doctrine;
4. `NEXT_THREAD_HANDOFF.md` — active branch, immediate work, and execution instructions.

These documents are authoritative while synchronized with implementation.

### Historical refinement sequence

1. improve current-session support recommendation quality from structured briefing evidence;
2. qualify desired-outcome readiness requirements;
3. finish Formula/Marketplace recommendation and empty states;
4. manually qualify Homepage → Library → Ready Room continuity;
5. continue progressive-disclosure polish, including traditional Popup 1;
6. inspect no-intervention reason propagation and deliberate visual-only support through existing owners;
7. preserve staged visual presentation and documentation synchronization through build-gated qualification.

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

The four production authorities are synchronized together. No document-specific follow-up is implied by this freeze rule.

<!-- GEORGE_HOMEPAGE_BRIEFING_VALIDATED_START -->
## Homepage LIVE Briefing — Validated

The homepage now owns homepage-origin LIVE briefing from conversation selection through approved brief review.

Current validated flow:

```text
Homepage conversation selection
↓
fresh mandatory briefing
↓
core briefing complete
↓
user decision: START LIVE or NEXT QUESTION
├─ NEXT QUESTION
│  ↓
│  exactly one optional OpenAI interaction
│  ↓
│  answer or skip returns to the same user decision
│
└─ START LIVE
   ↓
   homepage brief review
   ↓
   Popup 3 readiness review
   ↓
   LIVE
```

Validated production behavior:

- selecting a new conversation starts a fresh homepage briefing;
- stale answers from another conversation do not silently satisfy readiness;
- mandatory briefing is sufficient to continue toward LIVE;
- optional OpenAI questioning begins only after explicit user choice;
- optional questioning remains on the homepage, requests exactly one interaction, and reuses the canonical `/api/george/live/signal-question` authority;
- answers, skips, original question text, and canonical `priorInteractions` persist through the Homepage handoff and LIVE Entry hydration;
- **Start Live** preserves review-first routing;
- homepage-origin preparation does not enter Quick LIVE, Traditional briefing, Popup 1, or Mechanics;
- Popup 3 Back restores the exact homepage brief-review state, including selected conversation and optional briefing answers.

Historical checkpoint that established the Homepage owner (retained for production history):

- historical branch: `homepage-fresh-briefing-owner`;
- commit: `f4ef6b0`;
- recovery tag: `homepage-briefing-stable-20260803-022911`;
- production build at that checkpoint: PASS;
- duplicate canonical owners: 0;
- non-canonical imports: 0;
- layer violations: 0;
- circular dependencies: 0.
<!-- GEORGE_HOMEPAGE_BRIEFING_VALIDATED_END -->


-------------------------------------------------------------------------------
HOMEPAGE PRODUCT DIRECTION
-------------------------------------------------------------------------------

The homepage continues evolving toward an outcome-oriented experience.

Conversation types are no longer the primary organizing principle.

Conversation outcomes are effectively unbounded.

The homepage collects only enough operational signal to begin an adaptive
briefing.

Current direction:

Outcome
↓
Role
↓
Adaptive Briefing
↓
Support Mechanics
↓
Formula
↓
LIVE

Outcome remains the governing objective.

Role supplies operational context.

OpenAI owns adaptive briefing after the initial homepage selections.

Additional context is discovered during briefing rather than encoded into
homepage branching.

Preparation is available, not required.

GEORGE cannot determine with certainty how prepared a user is before entering
LIVE.

The decision to enter LIVE always belongs to the user.

Recommended product copy:

"Prepare with GEORGE first if you'd like. When you're ready, enter LIVE."

If the user enters LIVE immediately, GEORGE adapts using the best operational
signal available and continues adapting throughout the conversation.

<!-- GEORGE_INTELLIGENT_BRIEFING_DIRECTION_START -->
## Intelligent Briefing and User Goal Language

User-facing product language should use **goal** and, where appropriate, **objective**.

The runtime and production architecture continue using **outcome** internally. This preserves existing semantic authority across runtime code, operational assessment, learning, formulas, documentation, and telemetry.

Briefing direction:

- OpenAI may use natural bridges before questions or answers when doing so helps the user think clearly, provide useful nuance, or understand why the next question matters.
- Bridges are operational framing, not filler or personality performance.
- Briefing questions should acquire the highest-value signal with the fewest necessary interactions.
- Every answer may contain more information than the question explicitly requested.
- GEORGE should extract available signals, constraints, preferences, risks, relationships, authority, timing, and other operationally useful information without forcing repetition.
- GEORGE should never ask more questions than are necessary before the user has access to LIVE or another execution surface.
- Additional questioning is justified only when the expected information could materially improve service of the user's goal.

Recommended preparation copy:

> Prepare with GEORGE first if you'd like. When you're ready, enter LIVE.

Preparation remains available, not required. The user decides when to proceed.
<!-- GEORGE_INTELLIGENT_BRIEFING_DIRECTION_END -->

<!-- LIVE_ROLE_GOAL_EXECUTION_DOCTRINE_START -->
## LIVE Role, Goal, and Execution Doctrine

LIVE remains a mode of one GEORGE intelligence.

The user chooses whether to work in Normal, enter LIVE immediately, prepare first, return to Normal, or never use LIVE. GEORGE does not second-guess that choice.

LIVE focuses on:

Role
↓
Goal
↓
Execution

Every question asked during LIVE briefing must materially improve conversational execution or the likelihood of reaching the user's stated goal.

OpenAI has latitude to ask intelligent, context-aware questions, but its reasoning remains bounded by what GEORGE and the user can accomplish together through the user's voice in the conversation.

Briefing must gather only the operational signal needed for execution, avoid unnecessary or redundant questions, account for single or repeated conversations, distinguish session context from transient conversation context, and preserve the user's access to LIVE without unnecessary preparation.

Preparation is always available and may be suggested by GEORGE when useful. It is never required. The user decides.

For repeated-conversation sessions:

- brief once;
- retain role, goal, formula, script, support style, steering phrases, and session context;
- reset only transient conversation state;
- provide a direct path to the next call or interaction.

When session evidence indicates that a different operational strategy may better serve the goal, GEORGE presents:

> Your call.

- Keep Current
- Adjust Strategy

The user retains final authority.
<!-- LIVE_ROLE_GOAL_EXECUTION_DOCTRINE_END -->

--------------------------------------------------
OPERATIONAL SESSION EXECUTION DOCTRINE
--------------------------------------------------

Some operational work consists of one conversation.

Some operational work consists of many conversations.

After Role → Goal briefing, OpenAI determines whether the user is entering:

• Single Conversation
• Repeated Conversation Session

Examples of repeated sessions include:

• Telemarketing
• Outbound Sales
• Appointment Setting
• Recruiting
• Customer Service
• Fundraising
• Collections
• Prospecting

--------------------------------------------------
REPEATED SESSION BEHAVIOR
--------------------------------------------------

Repeated sessions are briefed once.

The Operational Session remains active.

Each completed conversation retires only the Conversation Runtime.

GEORGE immediately prepares for:

Next Call

without repeating briefing.

--------------------------------------------------
CONVERSATION RETIREMENT
--------------------------------------------------

When a conversation ends:

Retire:

• transcript
• recipient
• recipient assumptions
• temporary conversational reasoning
• transient execution state
• temporary execution signals

Produce:

Conversation Record

↓

Operational Learning

↓

Evidence

↓

Operational Memory

Conversation Runtime is ephemeral.

Conversation Record is permanent.

--------------------------------------------------
NEXT CALL EXPERIENCE
--------------------------------------------------

The purpose of Conversation Summary is not review.

Its purpose is deciding what to do before the next conversation.

Default summary should require only a few seconds.

Level 1

• W / L / Neutral / Follow-up
• Current strategy appropriate?
• Suggested adjustment?
• Next Call

Level 2

Why?

Short operational explanation.

Level 3

Execution Review

Formula execution.

Script execution.

Opportunities.

Recoveries.

Level 4

Transcript

Only when requested.

--------------------------------------------------
SESSION ADAPTATION
--------------------------------------------------

Formula and Script remain adaptive until sufficient operational evidence exists.

Script may evolve continuously.

Formula changes only when operational evidence demonstrates another operational strategy performs better.

Recommendations remain advisory.

The user retains operational authority.

--------------------------------------------------
EXECUTION VELOCITY
--------------------------------------------------

The amount of feedback GEORGE presents should be proportional to execution velocity.

High-volume users should receive less information, not more.

Only information that improves the next conversation should appear by default.

--------------------------------------------------
FORMULA IMMUTABILITY DOCTRINE
--------------------------------------------------

A Formula is immutable.

A Formula is an operational hypothesis frozen at the time it is is created.

Operational Learning never edits an existing Formula.

Operational Learning never replaces an existing Formula.

A Formula either gains evidence or remains unchanged.

--------------------------------------------------
FORMULA DISCOVERY
--------------------------------------------------

Execution may improvise.

Improvisation does not modify the originating Formula.

If operational assessment determines that success resulted from a materially different operational strategy, GEORGE recognizes a Formula Candidate.

The originating Formula remains unchanged.

The post-execution derived Formula Candidate preserves lineage by referencing its originating Formula.

--------------------------------------------------
SCRIPT RETENTION
--------------------------------------------------

Scripts are execution artifacts.

Script retention is independent of Formula evaluation.

The user may retain a Script regardless of outcome.

Examples:

• unsuccessful conversation + retain Script
• successful conversation + discard Script

Script ownership belongs to the user.

--------------------------------------------------
FORMULA CREATION
--------------------------------------------------

A post-execution derived Formula Candidate becomes a retained Formula only after user approval.

Creating a new Formula does not replace the originating Formula.

Both Formulas remain available.

Each accumulates evidence independently.

--------------------------------------------------
BASELINE FORMULAS
--------------------------------------------------

Early Formulas are operational baselines.

They are experiments.

Their purpose is to establish operational hypotheses from which future operational strategies may emerge.

As execution evidence accumulates:

Baseline Formula
        ↓
Formula Candidates
        ↓
Additional Formulas

This preserves operational lineage.

GEORGE grows by expanding operational strategy rather than overwriting previous operational knowledge.
--------------------------------------------------
WORKING FORMULA HYPOTHESIS — VALIDATED
--------------------------------------------------

Operational Formula recommendation now supports a working-hypothesis path when retrieval finds no sufficiently relevant existing Formula.

Canonical flow:

completed semantic briefing
→ desired outcome remains operational authority
→ Operational Memory retrieves and applies canonical retrieval policy
→ sufficiently relevant existing Formula: recommend existing Formula
→ no sufficiently relevant Formula: request governed operational-strategy synthesis
→ materialize a personal/private candidate Formula hypothesis
→ persist through the canonical Formula Library
→ use that Formula as the current working recommendation

The working Formula is not proven truth.

It begins with candidate status, hypothesis origin, private visibility, zero samples, zero successes, and no execution evidence.

The Formula is GEORGE's current operational strategy for pursuing the desired outcome and may adapt as new signal appears.

Hypothesis creation requires a completed briefing and a usable desired outcome. An incomplete briefing does not persist a Formula hypothesis.

OpenAI/provider reasoning synthesizes structured operational strategy. It does not own Formula assets, persistence, publication, Marketplace state, learning, or Script creation.

Operational Memory remains the canonical recommendation/orchestration owner.

formula-hypothesis.ts owns conversion from structured strategy reasoning into the Formula asset shape.

The Formula Library remains the persistence owner.

No Script is created merely because a Formula hypothesis is created. Existing active Script lookup remains downstream of Formula selection.

Validated implementation commit:

fd05d1c5 Create working formula on recommendation miss

### Candidate distinction

A pre-execution working Formula hypothesis and a post-execution derived Formula Candidate are different lifecycle events.

A working Formula hypothesis exists because the current conversation requires an operational strategy and canonical retrieval found no sufficiently relevant existing Formula. GEORGE may create and persist that Formula immediately as personal, private, candidate, and unproven so the exact strategy used for execution has durable identity and can accumulate evidence.

This working-hypothesis persistence does not constitute verification, publication, Marketplace listing, proof, or post-execution derivation.

A post-execution derived Formula Candidate is different. It arises when execution evidence indicates that success or material operational change came from a strategy materially different from the Formula that was executed. That path preserves lineage and remains governed by the canonical derivation and user-retention doctrine.

Therefore:

working hypothesis = pre-execution strategy needed to operate

derived Formula Candidate = post-execution proposed strategy discovered through evidence

The working-hypothesis path does not replace or weaken the existing derived-Formula Candidate approval doctrine.

### Recommendation strategy status semantics

Recommendation strategy status now reflects Formula state rather than briefing completion alone.

Canonical meaning:

- initial = no established recommended Formula is currently available;
- confirmed = the current recommendation is an actual Formula and the prior Formula remains selected, or an actual Formula is selected without a prior Formula;
- refined = a prior Formula existed and a different Formula is now recommended.

A completed briefing with no recommended Formula remains initial.

Briefing completion may trigger strategy synthesis, but completion by itself does not confirm a strategy.

Validated implementation commit:

f447b69b Correct recommendation strategy status
