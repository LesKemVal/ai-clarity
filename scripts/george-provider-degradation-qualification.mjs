import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = process.cwd()

function read(relativePath) {
  return readFileSync(`${root}/${relativePath}`, 'utf8')
}

function assertIncludes(source, fragment, message) {
  assert.ok(source.includes(fragment), message)
}

function assertOrder(source, first, second, message) {
  const firstIndex = source.indexOf(first)
  const secondIndex = source.indexOf(second)

  assert.notEqual(firstIndex, -1, `${message}: missing first contract fragment`)
  assert.notEqual(secondIndex, -1, `${message}: missing second contract fragment`)
  assert.ok(firstIndex < secondIndex, message)
}

const sttTokenRoute = read('app/api/george/live/stt-token/route.ts')
const browserSttClient = read('lib/george/live-voice/stt/deepgram-live-client.ts')
const hubSttStream = read('live-hub/src/stt/deepgram-stream.ts')
const groqFastLane = read('live-hub/src/llm/groq-fast-lane.ts')
const ttsRoute = read('app/api/george/live/tts/route.ts')
const deliveryBridge = read('components/george/live/LiveHubDeliveryBridge.tsx')

/*
 * STT token degradation
 *
 * A missing configuration must return a bounded JSON failure. A temporary
 * Deepgram grant failure must preserve the existing direct-key fallback rather
 * than crashing the route or preventing the client from attempting recovery.
 */
assertIncludes(
  sttTokenRoute,
  "if (!apiKey)",
  'STT token route must explicitly handle missing Deepgram configuration'
)
assertIncludes(
  sttTokenRoute,
  "{ error: 'LIVE speech is not fully configured.' }",
  'Missing STT configuration must produce a stable JSON error'
)
assertIncludes(
  sttTokenRoute,
  'directKeyFallback: true',
  'Deepgram grant failure must retain the direct-key fallback'
)
assertIncludes(
  sttTokenRoute,
  "{ error: 'Temporary token generation failed' }",
  'Unexpected STT token failures must remain bounded at the route boundary'
)

/*
 * Browser STT degradation
 *
 * Failed token acquisition, unreadable provider responses, socket failures,
 * and remote closure must be surfaced through handlers rather than becoming
 * unhandled browser failures.
 */
assertIncludes(
  browserSttClient,
  "throw new Error(tokenData?.error || 'Deepgram token unavailable')",
  'Browser STT startup must reject explicitly when no provider token is available'
)
assertIncludes(
  browserSttClient,
  'reportLiveSttError(',
  'Browser STT failures must be reported through the canonical error handler'
)
assertIncludes(
  browserSttClient,
  'handlers.onClose?.()',
  'Unexpected STT socket closure must be surfaced to runtime ownership'
)
assertIncludes(
  browserSttClient,
  'if (!socket || socket.readyState !== WebSocket.OPEN) return',
  'Audio capture must not write into an unavailable STT socket'
)

/*
 * LIVE Hub STT degradation
 *
 * Audio queued while Deepgram is unavailable must remain bounded by chunk,
 * byte, and age limits. Provider errors must clear pending audio and emit a
 * protocol ERROR without terminating the LIVE Hub process.
 */
assertIncludes(
  hubSttStream,
  'LIVE_HUB_DEEPGRAM_MAX_PENDING_CHUNKS',
  'LIVE Hub STT buffering must have a configurable chunk bound'
)
assertIncludes(
  hubSttStream,
  'LIVE_HUB_DEEPGRAM_MAX_PENDING_BYTES',
  'LIVE Hub STT buffering must have a configurable byte bound'
)
assertIncludes(
  hubSttStream,
  'LIVE_HUB_DEEPGRAM_MAX_PENDING_AGE_MS',
  'LIVE Hub STT buffering must expire stale audio'
)
assertIncludes(
  hubSttStream,
  "clearPendingAudio('deepgram_error')",
  'Deepgram provider errors must release pending audio'
)
assertIncludes(
  hubSttStream,
  "type: 'ERROR'",
  'Deepgram provider errors must be surfaced over the LIVE Hub protocol'
)
assertOrder(
  hubSttStream,
  "clearPendingAudio('deepgram_error')",
  "type: 'ERROR'",
  'STT degradation must clear unavailable-provider backlog before reporting the error'
)

/*
 * LLM degradation
 *
 * The Groq lane is optional. Missing configuration returns null, while network
 * or provider rejection is caught at the orchestration boundary. Local cue
 * arbitration must happen before the optional provider request so cue-capable
 * receiver profiles continue operating without Groq.
 */
assertIncludes(
  groqFastLane,
  "console.warn('[LIVE HUB][groq] missing GROQ_API_KEY')",
  'Missing Groq configuration must be visible in telemetry'
)
assertIncludes(
  groqFastLane,
  'return null',
  'Missing Groq configuration must degrade to no fast cue rather than throw'
)
assertIncludes(
  hubSttStream,
  'const localActionCue = arbitrateCue({ packet })',
  'LIVE Hub must resolve its local action cue independently of the LLM provider'
)
assertIncludes(
  hubSttStream,
  '.catch((error) => {',
  'Groq rejection must be caught at the LIVE Hub orchestration boundary'
)
assertOrder(
  hubSttStream,
  'const localActionCue = arbitrateCue({ packet })',
  'void resolveGroqFastCue(packet)',
  'Local cue resolution must precede optional LLM enrichment'
)

/*
 * TTS degradation
 *
 * Provider failure must be logged and returned as JSON. The existing OpenAI
 * fallback remains bounded, and failure of both providers must not throw beyond
 * the route. Visual dispatch remains independent from voice dispatch.
 */
assertIncludes(
  ttsRoute,
  "console.warn('[LIVE][tts][provider-failed]'",
  'Primary TTS provider failure must be logged'
)
assertIncludes(
  ttsRoute,
  "console.warn('[LIVE][tts][fallback-failed]'",
  'Fallback TTS provider failure must be logged'
)
assertIncludes(
  ttsRoute,
  "console.info('[LIVE][tts][fallback-used]'",
  'Successful fallback use must be visible in telemetry'
)
assertIncludes(
  ttsRoute,
  "return NextResponse.json({ error: 'TTS request failed' }",
  'Exhausted TTS providers must return a stable JSON failure'
)
assertIncludes(
  ttsRoute,
  "return NextResponse.json({ error: 'TTS failed safely' }, { status: 500 })",
  'Unexpected TTS failures must remain bounded at the route boundary'
)
assertIncludes(
  deliveryBridge,
  "if (routedCue.mode === 'visual')",
  'Visual delivery must remain an independent dispatch path'
)
assertIncludes(
  deliveryBridge,
  "if (routedCue.mode === 'voice')",
  'Voice delivery must remain an independent dispatch path'
)
assertOrder(
  deliveryBridge,
  "if (routedCue.mode === 'visual')",
  "if (routedCue.mode === 'voice')",
  'Visual dispatch must not depend on successful voice dispatch'
)

console.log('GEORGE provider degradation qualification passed')
