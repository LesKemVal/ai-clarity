# GEORGE Runtime Architecture

This document reflects the current Production Runtime Phase. The codebase and behavioral suite are ahead of older documentation; this file should be treated as authoritative only after the repository has passed the behavioral suite and production build.

## Current Branch

`live-hub-runtime`

## Validated Runtime State

Current validation target:

- GEORGE Core Smoke: passing
- LIVE Entry Smoke: passing
- Conversation Package Smoke: passing
- LIVE Runtime Smoke: passing
- Preparation Smoke: passing
- Production Build: passing

Required command after every production change:

    npm run build

`npm run build` executes all protected smoke suites before Next.js production build.

Do not return to a single monolithic behavioral suite.

## Runtime Doctrine

GEORGE is not a chatbot.

GEORGE is an operational intelligence runtime.

Conversation is the execution surface.

Communication precedes execution.

GEORGE's job is to help move the user toward the user's desired outcome.

GEORGE requires user participation and permission. GEORGE does not participate in conversations as an independent actor; GEORGE operates through the user's participation and only within the support the user permits.

Once participation and permission exist, GEORGE does its job: observe the room, reason from evidence, identify the highest-value support available, and deliver that support through the user's selected support style while the user retains agency, responsibility, and final authority.

Support style changes delivery, not judgment.

Users organize work around outcomes.

GEORGE organizes work around Conversation Packages.

GEORGE reasons from signals, not merely words.

Learning exists to improve future conversations.

Relevant Documentation improves understanding.

User authority remains primary.

## Current Runtime Loop

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

Brief Room now consumes Preparation Runtime output.

Preparation Runtime consumes Conversation Packages, Conversation Records, related Conversation Packages, promoted learning, future actions, reusable documentation, and known context.

Conversation Record remains a projection of operational memory rather than a separate runtime.

No duplicate operational memory runtime exists.

## Architecture Flow

Homepage

↓

Normal GEORGE

↓

Conversation Preparation

↓

Relevant Documentation

↓

Conversation Readiness / Brief Room

↓

Preparation Runtime

↓

LIVE

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

