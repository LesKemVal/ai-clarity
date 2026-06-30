# GEORGE Production Validation

Production validation protects GEORGE behavior, runtime ownership, and portability.

## Rule

Individual behavior tests protect the part.

Concert behavior tests protect the system.

Every production-critical behavior should have:

- dedicated behavior file(s)
- deterministic input/output coverage
- invariants
- concert coverage with adjacent runtime components when applicable

## Validation Order

1. Module behavior tests
2. Integration behavior tests
3. Full behavioral suite
4. Smoke tests
5. Production build

## Required Commands

- node scripts/george-behavior-suite.mjs
- npm run build

## Production-Critical Surface

A file is production-critical when it affects user authority, desired outcome preservation, LIVE timing, delivery meaning, speech synchronization, Conversation Package continuity, Relevant Documentation, Learning, Conversation Summary generation, runtime portability, or operational state ownership.


## Current Concert Coverage

Conversation Package concert coverage is protected by:

- `scripts/george-behavior/conversation-package-concert.mjs`

This scenario verifies:

LIVE Entry setup

↓

Package resolution

↓

Relevant Documentation attachment

↓

LIVE summary attachment

↓

Outcome progression

↓

Learning candidate attachment

↓

Package history preservation


## Conversation Summary Runtime Coverage

Conversation Summary Runtime is protected by:

- `scripts/george-behavior/conversation-summary-runtime.mjs`

The runtime must produce:

- operational summary
- evidence candidates
- suggested next action

It must not directly promote learning, persist memory, or mutate Conversation Packages.


## Learning Runtime Coverage

Learning Runtime is protected by:

- `scripts/george-behavior/learning-runtime.mjs`

The runtime starts with outcome relevance.

Evidence may become learning only when it is useful for the current outcome, an ongoing outcome, or a likely future related outcome.

High confidence alone is not enough.

The runtime classifies candidates, evaluates confidence, and returns decisions. It does not write memory directly.


## Preparation Runtime Coverage

Preparation Runtime is protected by:

- `scripts/george-behavior/preparation-runtime.mjs`

The runtime consumes Conversation Package state, Relevant Documentation, summaries, and learning.

It produces:

- preparation brief
- known context
- missing signals
- documentation suggestions
- risks
- opportunities
- confidence
- optional question

It does not ask questions directly, persist memory, or touch UI.


Relevant Documentation reuse rule:

- Prior package documentation should surface as reusable context.
- Missing documentation should be suggested only when it would materially improve preparation.
- The uploader remains secondary to recommendation and reuse.



## Preparation Feedback Loop Coverage

The first operational improvement loop is protected by:

- `scripts/george-behavior/preparation-feedback-loop.mjs`

This concert scenario verifies:

Preparation

↓

Conversation Summary

↓

Evidence Candidates

↓

Learning Runtime

↓

Conversation Package Update

↓

Next Preparation

The next preparation should use prior summary and learning to improve the following conversation.
