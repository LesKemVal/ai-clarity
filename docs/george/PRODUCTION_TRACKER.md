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

GEORGE is not a chatbot.

GEORGE is operational intelligence.

Normal GEORGE prepares.

LIVE executes.

Same intelligence. Different operating mode.

OpenAI reasons.

GEORGE decides.

Signals inform GEORGE.

GEORGE optimizes for successful outcomes while preserving user agency.

Communication precedes execution.

Conversation is execution.

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

Conversation Package

↓

Conversation Record

↓

Preparation

This loop is implemented, smoke-tested, documented, and now surfaced in Brief Room.

Conversation Records and related Conversation Packages can influence future preparation through the existing Preparation Runtime.

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
- Speech normalization is centralized.
- Environmental/social chatter can be held before Hub.

Current failures:
- Cue mode overfires: "Ask what changed."
- Clarification overfires on clear questions.
- Generic fallback is safe but not executive-quality.
- Need Verified Response Builder in `lib/george/core/verification/action-cue-authority.ts`.

Next milestone:
Build Verified Response Builder in the active authority path. When Groq fails evidence/relevance/usefulness authority, rebuild from verified briefing, product doctrine, objective, room, and role instead of returning generic fallback.

Doctrine:
- BRANESx is the platform. GEORGE is the agent.
- Words are operational signals, but not the only signals.
- OpenAI/Groq proposes. GEORGE decides.
- Do not move reasoning into `app/george/page.tsx`.

