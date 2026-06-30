# GEORGE Runtime Architecture

This document reflects the current Production Runtime Phase. The codebase and behavioral suite are ahead of older documentation; this file should be treated as authoritative only after the repository has passed the behavioral suite and production build.

## Current Branch

`live-hub-runtime`

## Validated Runtime State

Current validation target:

- Behavioral Suite: 32 / 32 passing
- GEORGE Core Smoke: passing
- LIVE Entry Smoke: passing
- Production Build: passing

Required commands after every production change:

```bash
node scripts/george-behavior-suite.mjs
npm run build
```

## Runtime Doctrine

GEORGE is not a chatbot.

GEORGE is an operational intelligence runtime.

Conversation is the execution surface.

Communication precedes execution.

GEORGE continuously prepares, supports, learns from, and improves conversations so users have a greater probability of achieving their desired outcomes.

Users organize work around outcomes.

GEORGE organizes work around Conversation Packages.

GEORGE reasons from signals, not merely words.

Learning exists to improve future conversations.

Relevant Documentation improves understanding.

User authority remains primary.

## Architecture Flow

Homepage

↓

Normal GEORGE

↓

Conversation Preparation

↓

Relevant Documentation

↓

Conversation Readiness

↓

LIVE

↓

Conversation Summary

↓

Learning

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

LIVE Hub owns runtime state and synchronization.

GEORGE Core owns operational judgment, evidence, authority, continuation, response shaping, and semantic meaning.

Delivery owns voice, visual, silent, suppression, timing, modality, and revision execution.

Delivery may not alter operational meaning.

`app/george/page.tsx` must remain thin. Prefer bridges, runtime adapters, conversation runtime modules, behavior tests, and focused modules.

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

1. Conversation Package Manager
2. Learning Runtime
3. Conversation Summary Runtime
4. Resumable Conversation Readiness
5. Quick LIVE

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

Learning Runtime begins with outcome relevance before confidence or promotion. High confidence alone is not enough to preserve unrelated evidence.

Conversation Packages remain the operational container. Summary and Learning outputs attach to the package rather than creating independent state.


## Current Operational Improvement Loop

Validated clean state:

- Behavioral Suite: 32 / 32 passing
- GEORGE Core Smoke: passing
- LIVE Entry Smoke: passing
- Production Build: passing

Current protected loop:

Preparation Runtime

↓

Conversation Package Runtime

↓

Conversation Summary Runtime

↓

Learning Runtime

↓

Conversation Package Update

↓

Next Preparation

This proves GEORGE can use prior conversation evidence and learning to improve the next conversation without persistence, UI changes, or page-level logic.
