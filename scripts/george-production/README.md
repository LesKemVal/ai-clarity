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
