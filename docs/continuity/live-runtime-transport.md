# GEORGE LIVE Runtime Transport Doctrine

## Confirmed finding

Deepgram is valid server-side.

A Node/server-side WebSocket connection to Deepgram opens successfully using:

- `DEEPGRAM_API_KEY`
- `Authorization: Token <key>`
- `wss://api.deepgram.com/v1/listen?model=nova-2`

The server test returned:

- `OPEN`
- then `CLOSE 1011` only because no audio was sent

That means:

- the key works
- the account works
- the network works
- Deepgram works from server-side runtime

## Browser-direct finding

Browser-direct WebSocket connections to Deepgram failed repeatedly, including:

- direct API key via browser WebSocket subprotocol
- temporary token via browser WebSocket subprotocol
- token in query string
- incognito test outside GEORGE

Therefore:

GEORGE LIVE should not depend on browser → Deepgram direct WebSocket as the long-term architecture.

## Required production direction

GEORGE LIVE should move toward a backend WebSocket proxy:

Browser mic/audio
→ GEORGE backend realtime service
→ Deepgram WebSocket
→ GEORGE runtime governor/orchestrator
→ ElevenLabs/voice output
→ browser/earbud

## Architectural rule

Do not drift back into browser-native SpeechRecognition for LIVE.

Normal GEORGE may keep browser voice temporarily.

LIVE must become server-mediated, streaming, runtime-owned, and separate from normal GEORGE.

## Why this matters

LIVE is not a voice-enabled chat screen.

LIVE is the operational runtime layer.

It must own:

- listening authority
- audio transport
- interruption handling
- turn-taking
- room inference
- silence/yield timing
- runtime cues
- voice output
- continuity handoff

## Next engineering step

Build a backend WebSocket proxy for LIVE.

Recommended path:

- keep `/live-voice` as diagnostic surface
- add dedicated realtime server route/service
- use server-side Deepgram WebSocket with API key
- stream browser audio to server
- stream transcripts/runtime packets back to client
- keep Vercel for normal app
- consider Fly.io / Railway / Render / ECS for persistent realtime LIVE transport
