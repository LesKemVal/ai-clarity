# GEORGE LIVE Hub

Stateful WebSocket runtime for low-latency GEORGE LIVE.

## Purpose

This service replaces the older `server/live` Deepgram-only proxy with a portable LIVE runtime.

## Current baseline

Vercel remains responsible for:

- web UI
- billing
- session pages
- account/subscription APIs
- normal GEORGE chat

The LIVE Hub is responsible for:

- browser microphone WebSocket connection
- streaming STT
- transcript events
- local cue generation
- future GEORGE Core execution
- future speculative LLM
- future streaming TTS

## Existing Fly app

Existing app:

`live-moonlit-meadowstone-2540`

Current old implementation:

`server/live`

That old service is a Deepgram proxy only. It should not become the canonical GEORGE LIVE runtime.

## Canonical path

New runtime source:

`live-hub/`

Do not add LIVE hub logic to `app/george/page.tsx`.

Page wiring should only connect to a transport/client hook after the hub is proven.


## Client consumption rule

Production clients should treat `ACTION_CUE` as the primary operational output.

Diagnostic events:

- `LOCAL_CUE`
- `FAST_CUE`
- `TRANSCRIPT_PARTIAL`
- `TRANSCRIPT_FINAL`

These are useful for testing and observability, but should not drive the final user-facing LIVE cue behavior.

`ACTION_CUE` represents the current winning instruction after local/runtime/Groq arbitration.
