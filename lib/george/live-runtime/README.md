# GEORGE LIVE Runtime Package

This folder is the portable LIVE runtime boundary for GEORGE.

## Purpose

GEORGE LIVE is the real-time execution layer for consequential conversations.

It owns:
- runtime support normalization
- LIVE setup persistence
- outcome reassessment doctrine
- fast-path continuation responses
- support preference memory
- serving tags such as Continuation, Cues, Advise, Outcome, and Close

## Enterprise rule

LIVE runtime logic should live here, not inside `app/george/page.tsx`.

`page.tsx` may render and orchestrate, but it should not own GEORGE's runtime brain.

## Portability rule

Anything in this folder should move toward being safely portable:
- typed interfaces
- explicit exports
- no hidden UI dependencies
- no provider secrets
- no scattered localStorage keys outside runtime ownership
- no mode bleed between Normal GEORGE and LIVE execution

## Current source of truth

`liveRuntimeSupport` is the normalized runtime source of truth.

Setup keys such as:
- `GEORGE_LIVE_SETUP`
- `GEORGE_LAST_LIVE_SETUP`
- `george_live_setup_active`

are handoff/recovery inputs only.

Cards, prompts, fast-path, and runtime decisions should read normalized runtime support.

## Extraction discipline

1. Stabilize behavior first.
2. Commit working checkpoints.
3. Extract one concern at a time.
4. Build after every extraction.
5. Do not combine UI refactors with behavior changes.
6. Do not patch blindly.
7. Keep LIVE and Normal as one GEORGE with separate execution functions.
