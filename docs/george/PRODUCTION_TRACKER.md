# GEORGE Production Tracker

Living project document. Update before moving to a new thread.

## Current Branch

`live-hub-runtime`

## Current Phase

Production hardening and portability.

Do not redesign GEORGE.

Prioritize:
- reliability
- portability
- authority
- latency
- maintainability
- correctness

## Product Philosophy

Operational Profile doctrine is production authority and maintained separately in `docs/george/OPERATIONAL_PROFILE.md`.


GEORGE is not a chatbot.

GEORGE is operational intelligence.

Normal GEORGE prepares.

LIVE executes.

Same intelligence. Different operating mode.

OpenAI reasons.

GEORGE decides.

Signals inform GEORGE.

GEORGE's job is to help move the user toward the user's desired outcome.

GEORGE requires user participation and permission. Once participation and permission exist, GEORGE observes, reasons, judges, supports, and adapts while the user retains agency, responsibility, and final authority.

Support style changes delivery, not judgment.


GEORGE's defining constant is relentless loyalty to improving the user's probability of achieving the user's desired outcome.

GEORGE continuously observes the room, the user, and the communication partnership so it can determine the most useful form of support.

GEORGE adapts how it supports, not whether it supports.

The user can use or ignore GEORGE's support. The user remains the final authority.

Normal GEORGE and LIVE share the same reasoning philosophy; execution constraints differ.

Normal GEORGE prepares and advances work before execution. LIVE executes under real-time constraints. Both modes reason from signals, evidence, user authority, desired outcome, credibility, timing, and operational value.

Normal GEORGE now routes normal work through `lib/george/runtime/normal-reasoning-governor.ts`, classifying work into immediate, operational, or strategic lanes before model selection.

Communication precedes execution.

Conversation is execution.



## Production Update — LIVE Partnership Runtime / Recovery / Learning

Latest validated production work added the LIVE Partnership Runtime foundation without introducing a second runtime or moving ownership into `app/george/page.tsx`.

Validated additions:

- LIVE Support Behavior Composer added in `lib/george/live-runtime/support-behavior-composer.ts`.
- Response-mode unsafe local placeholder no longer falls to silence; delivery bridge now routes fallback through the Behavior Composer and provides bridge/cue support.
- Repeat-tail and sentence-recovery behaviors are first-class LIVE recovery actions.
- Spoken memory now exposes the current LIVE sentence and can resolve only the missing tail from the user's approximate spoken line.
- LIVE transcript controller can emit `repeat_tail` and `sentence_recovery`.
- LIVE final transcript adapter executes recovery actions through the normal speak path.
- Runtime smoke protects response fallback, repeat-tail routing, controller recovery actions, and adapter execution.
- LIVE operational behavior hypotheses are derived in `lib/george/live-runtime/live-interaction-continuity.ts`.
- Behavior hypotheses are evaluated through the existing Learning Runtime and promoted through existing Conversation Package learning flow.
- Adaptive profile can now accept promoted learning hypotheses as learning signals.
- Preparation Runtime exposes and returns `profileLearningSignals` from promoted communication-pattern learning.
- Deepgram STT pipeline verified end-to-end after transient websocket failure: token issued, microphone opened, websocket opened, recorder started, audio chunks sent, interim transcript received, final transcript received.

Current validated chain:

Signals → Behavior Composer → Delivery / Recovery → LIVE Interaction Continuity → Learning Runtime → Conversation Package → Preparation Runtime → Adaptive Profile evidence.

Ownership remains:

- Behavior Composer owns temporary support behavior composition.
- Delivery Bridge owns delivery routing only.
- Spoken Memory owns last-line/current-sentence/tail recovery helpers.
- Transcript Controller owns local action resolution.
- Final Transcript Adapter owns action-to-application conversion.
- LIVE Interaction Continuity owns post-LIVE operational hypotheses.
- Learning Runtime owns evaluation and promotion decisions.
- Conversation Packages own persisted promoted learning.
- Preparation Runtime owns future-context assembly from packages.
- Operational Profile remains doctrine/evidence; no direct runtime writes.

Production rule confirmed:

GEORGE observes behavior as evidence, reasons about why it may improve or fail to improve the user's probability of achieving the desired outcome, adapts temporarily during LIVE, and promotes learning only through existing learning/conversation-package paths.

Known near-term hardening:

- Improve LIVE audio hook error normalization so websocket/Event failures are logged as useful production diagnostics instead of `[object Event]`.
- Confirm the canonical runtime consumer for `profileLearningSignals` before wiring further.
- Continue reducing `page.tsx` ownership only when a canonical module exists.
- Run real-room LIVE test covering voice + visual + response fallback + repeat-tail + sentence recovery.

## Architecture Discipline

Page/UI owns:
- what the user sees
- what the user touches
- interaction
- presentation
- signal collection
- pass-through orchestration for existing runtime identifiers

Helper modules own:
- deterministic UI support
- reusable option generation
- formatting

LIVE Hub owns:
- operational understanding
- runtime context
- signal interpretation
- decision making
- support selection
- LIVE turn identity

Reasoning owns:
- OpenAI prompting
- response construction
- adaptive reasoning
- support optimization

Delivery owns:
- voice delivery
- visual delivery
- silent delivery
- timing
- routing

Runtime metrics own:
- event naming
- latency timing
- turn correlation
- latency contract inspection

Do not violate these boundaries.

## LIVE Entry Direction

Mandatory signal:
1. Name
2. Desired conversational outcome
3. Responsibility in this conversation

After mandatory signal, user can enter LIVE.

Additional briefing is optional.

Additional briefing improves support.

Additional briefing never grants permission.

## Responsibility Model

Signal 3 asks:

"What is your responsibility in this conversation?"

Tier behavior:
- Smart: one responsibility
- Intelligent: up to two responsibilities
- Brilliant: multiple responsibilities later

Current files:
- `app/george/live-entry/LiveEntryClient.tsx`
- `lib/george/live-entry/responsibility-options.ts`

## Briefing Direction

After mandatory questions, GEORGE should ask one optional operational question before OpenAI adaptive briefing.

Purpose:

Acquire the single highest-value signal most likely to improve the user's probability of a successful outcome.

Then OpenAI can continue optional adaptive briefing.

## Readiness / Confidence Direction

GEORGE should explain readiness without gating access.

Show:
- what GEORGE understands
- what GEORGE can already help with
- what additional briefing may improve

Enter LIVE must remain available once unlocked.

## Runtime Direction

Briefing knowledge must reach LIVE reasoning.

Relevant files:
- `lib/george/live-voice/live-reasoning.ts`
- `app/api/george/live/govern/route.ts`
- `lib/george/live-hub/types.ts`
- `lib/george/live-runtime/prep-runtime.ts`

## Telemetry Direction

Telemetry currently covers:
- turn start
- mic open
- first audio chunk
- STT timing
- hub queue
- hub flush
- hub receive
- delivery cue
- visual render
- voice cue request
- TTS request
- TTS receive
- playback start
- playback complete

LIVE turn correlation direction:

One LIVE turn starts once and the same runtime turn identifier should flow through:

mic → STT → transcript → cue → delivery → TTS → playback

`page.tsx` may pass through an existing `turnId`, but must not invent turn lifecycle rules.

Runtime metrics helpers own event naming, timing, and correlation.

## Current High-Priority Todo

- Keep production documentation synchronized with implementation.
- Continue refining Brief Room presentation using the existing Preparation Runtime.
- Improve reusable documentation presentation inside Brief Room.
- Related Conversation Package selection now ranks and bounds packages before Preparation Runtime ingestion; continue validating this through `george:preparation:smoke` and production build.
- LIVE hub voice playback now accepts the existing LIVE `turnId` pass-through; commit `ad12b56` was validated by `npm run build` locally.
- Continue Relevant Documentation attachment and reuse inside Conversation Packages.
- Inspect real LIVE latency logs and optimize the slowest measured segment first.
- Continue production hardening through modular smoke suites.
- Continue portability and runtime extraction where page orchestration grows.
- Continue improving Normal GEORGE reasoning lane classification beyond word heuristics toward signal-based operational assessment.
- Preserve the doctrine that Normal GEORGE and LIVE share reasoning philosophy while differing by execution constraints.


## Chat Route Boundary

`app/api/chat/route.ts` is an orchestration surface, not a canonical reasoning owner.

`/api/chat` may assemble the request. It must not become the owner of runtime doctrine, preparation context, memory policy, Operational Profile rules, capability governance, or LIVE authority.

Current assessment:

- The chat route is acceptable as a composition/orchestration layer.
- It is nearing an ownership boundary because it manually assembles many runtime notes into the current model call.
- It should remain thin enough to call canonical runtime modules and assemble their outputs.
- GEORGE's judgment rules, continuity policy, Operational Profile behavior, capability surfacing, and preparation ownership must remain in canonical runtime modules.

Future extraction target:

- `lib/george/runtime/reasoning-context-composer.ts`

First extraction must be behavior-neutral:

- accept named runtime note strings
- filter empty notes
- preserve ordering
- join consistently
- return one runtime context block
- do not change prompt doctrine
- do not change model routing
- do not move Preparation Runtime ownership

Boundary warning:

Do not confuse runtime note composition with Preparation Runtime.

Preparation Runtime owns pre-execution package, document, and context preparation.

The chat route only assembles reasoning context for the current model call.



## Capability Governance Audit

Capability governance is now an active production audit area.

Do not collapse these concepts:

- Availability: the user can use a capability.
- Surfacing: GEORGE should mention or suggest a capability now.
- Execution: GEORGE should start or apply a capability now.

Current implemented capability owners:

- Resource estimation and documentation recommendations: `lib/george/capabilities/live-entry-resources.ts`
- LIVE support panel metadata: `lib/george/capabilities/live-support-panels.ts`
- Stable LIVE execution capability IDs and derivation: `lib/george/capabilities/live-capability-registry.ts`
- Runtime authority merge: `lib/george/live-runtime/live-runtime-authority.ts`
- Runtime execution: LIVE governor and LIVE runtime consumers

Current production boundary:

- Resource preparation remains separate from execution capability identity.
- `selectedCapabilityIds` should represent stable execution capability IDs.
- `selectedCapabilities` may continue carrying selected resource/support descriptors where existing runtime transport expects them.
- LIVE governor remains the execution owner.
- Capability surfacing remains contextual and should not become automatic execution.

Do not collapse resource preparation, capability availability, capability surfacing, and capability execution into one owner.



## Preparation Runtime Contract

Preparation Runtime owns pre-execution operational context assembly.

Canonical structured output includes:

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

`preparationBrief` is a convenience render, not the canonical preparation contract.

Portable clients should consume structured fields first. UI or briefing layers may display `preparationBrief`, but must not depend on it as the only source of preparation truth.



## Signal Interpretation Ownership

GEORGE should reason from signals, not only words.

Current canonical structure:

- `lib/george/core/build-interpretation.ts` owns core interpretation aggregation.
- `lib/george/core/interpretation.ts` owns the interpretation contract.
- Signal-specific producers own their local signal rules.
- Runtime consumers should prefer the `GeorgeCoreInterpretation` snapshot when available.

Current signal producers include:

- signal sufficiency
- signal ranking
- runtime signal arbitration
- conversation signal detection
- room analysis
- speaker intent
- objective hypothesis
- trajectory
- active outcome
- outcome governor

Boundary rule:

Do not move all signal logic into the aggregation layer.

The aggregation layer combines producer outputs. It does not become a giant reasoning owner.

Word and phrase heuristics are acceptable as evidence, but they must not become final authority. Future work should continue normalizing lexical cues into signal objects before aggregation.


## Working Rules

No page.tsx bloat.

No manual coding.

Use paste-ready scripts.

Inspect before patching.

Small commits.

Build before commit.

Do not commit if build fails.

Do not add git save/commit commands inside build patches.


## Production Validation Gate

Production validation is now modular.

Current protected smoke suites:

- `george:core:smoke`
- `george:live-entry:smoke`
- `george:conversation-package:smoke`
- `george:live-runtime:smoke`
- `george:preparation:smoke`

`npm run build` runs all five smoke suites before `next build`.

Do not return to a single monolithic behavioral-suite metric.

Add focused smoke suites as production subsystems mature.


## Current Production Runtime Loop

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

This loop is implemented, smoke-tested, documented, and now surfaced in Brief Room.

Conversation Records and related Conversation Packages can influence future preparation through the existing Preparation Runtime.

Interaction Continuity now owns after-LIVE composition through `lib/george/live-runtime/live-interaction-continuity.ts`. `page.tsx` calls this runtime owner instead of composing Conversation Packages and Conversation Records directly.

Related Conversation Packages are now selected through deterministic Preparation Runtime ranking before ingestion, with bounded package count and selection metadata exposed for inspection.

End-to-end LIVE telemetry now supports passing the same LIVE `turnId` from hub cue delivery into hub voice playback without adding page-owned lifecycle logic.

## Engineering / Tooling Notes

GitHub connector repository search can produce false negatives for existing symbols and files.

Do not treat connector search misses as evidence that runtime modules are absent.

For repository-wide inspection, prefer local `rg` / `git grep` before adding, moving, or duplicating runtime modules.


---

## Production Runtime Phase Commitments

These commitments reflect the current production direction and should be treated as implementation commitments unless superseded by validated code or architecture.

### Homepage

Homepage is considered production quality.

Completed direction:

- `public/hero/glasses21.png` is the production hero image.

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
- Continue reducing orchestration inside `app/george/page.tsx` through behavior-preserving runtime extractions.
- Preserve stable ownership boundaries between Presentation, LIVE Runtime, GEORGE Core, Prompt Contract, Generation, Verification, and Delivery.
- Validate executive-quality response behavior against enterprise briefing questions.
- Confirm no generic fallback appears when evidence/relevance/usefulness repair is possible.
- Confirm clear product questions do not trigger unnecessary clarification cues.

Doctrine:
- BRANESx is the platform. GEORGE is the agent.
- Words are operational signals, but not the only signals.
- OpenAI/Groq proposes. GEORGE decides.
- Do not move reasoning into `app/george/page.tsx`.

## Implemented Production Runtime Owner: Opportunity Continuity

Implemented runtime owner:

`lib/george/live-runtime/opportunity-continuity.ts`

Opportunity Continuity is wired after Interaction Continuity and is protected by `george:live-runtime:smoke`.

Opportunity Continuity owns the after-LIVE question:

When the current conversation ends, did the opportunity end, continue, change form, pause, transfer, or become dormant?

Doctrine:

GEORGE must know how to live to fight another day. If the desired outcome cannot be achieved in the current room, GEORGE should preserve credibility, optionality, access, and the best executable path toward the user's desired outcome when reality still supports continuation.

This is not simple follow-up logic. It should determine whether the user should wait, follow up, not follow up, seek another decision maker, preserve access, change the next objective, or treat the opportunity as closed.

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
