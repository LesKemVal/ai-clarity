# GEORGE Production Readiness Checklist

## Must Pass Before Production

- npm run george:core:smoke
- npm run build
- LIVE STT route requires valid access and Deepgram config
- LIVE TTS route requires valid access and ElevenLabs config
- No browser-STT legacy decision engine may own LIVE authority
- GEORGE Core interpretation contract must use typed outputs, not unknown
- page.tsx must remain app client, not reasoning owner
- Legacy governor may remain as reference, but not primary authority
- Delete candidates must not be removed until final audit

## Production Blocking Items

1. Replace unknown fields in GeorgeCoreInterpretation with real module result types.
2. Add GEORGE Core smoke coverage for objective-engine and trajectory-engine.
3. Add smoke coverage for authority blocking cases.
4. Add CI or pre-deploy command that runs:
   npm run george:core:smoke && npm run build
5. Confirm production env vars:
   OPENAI_API_KEY
   DEEPGRAM_API_KEY
   ELEVENLABS_API_KEY
   ELEVENLABS_VOICE_ID
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   Supabase / KV / Redis values as used by subscription/session code
6. Remove or formally archive app/api/chat/route.ts.tmp after final cleanup.
7. Diff conversation-engine.ts.bak-chair-aware before deleting.

## Lease-Ready Blocking Items

1. GEORGE Core must expose one runtime contract.
2. GEORGE Core must not depend on React, page.tsx, window, localStorage, DOM, Stripe, or visual UI.
3. Tenant/license boundary must exist before external leasing.
4. Usage metering boundary must exist before external leasing.
5. Provider adapter boundary must exist for OpenAI, STT, TTS, and future providers.
6. Core telemetry must be emitted without causing execution side effects.

## Current Production Shape

Raw transcript
→ Signal / Intent interpretation
→ Active outcome
→ Outcome governor
→ Transcript controller
→ Action authority
→ Execution adapter

## Rule

Many interpreters are allowed.

Only one authority may execute.
