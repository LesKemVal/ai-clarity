import { readFileSync } from 'node:fs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = process.cwd()
const metricsSource = readFileSync(
  `${root}/lib/george/live-metrics/runtime-metrics.ts`,
  'utf8'
)
const contractSource = readFileSync(
  `${root}/lib/george/live-metrics/latency-contract.mjs`,
  'utf8'
)

assert(
  metricsSource.includes('export type GeorgeRuntimeMetricRecord'),
  'LIVE latency qualification should retain timestamped metric records'
)

assert(
  metricsSource.includes('sincePreviousMs'),
  'LIVE latency qualification should expose stage-to-stage duration'
)

assert(
  metricsSource.includes('getRuntimeTurnLatencyReport'),
  'LIVE latency qualification should expose a complete per-turn report'
)

assert(
  metricsSource.includes('totalLatencyMs'),
  'LIVE latency report should expose end-to-end observed duration'
)

for (const event of [
  'mic_open',
  'first_audio_chunk_sent',
  'deepgram_interim',
  'deepgram_final',
  'transcript_input',
  'hub_transcript_sent',
  'hub_action_cue_received',
  'delivery_cue',
  'visual_cue_rendered',
  'tts_request_start',
  'tts_audio_received',
  'tts_playback_start',
  'tts_playback_end',
]) {
  assert(
    contractSource.includes(`'${event}'`),
    `LIVE latency contract should include ${event}`
  )
}

const releasePolicySource = readFileSync(
  `${root}/lib/george/live-runtime/final-transcript-release-policy.ts`,
  'utf8'
)
const shadowBridgeSource = readFileSync(
  `${root}/components/george/live/LiveHubShadowBridge.tsx`,
  'utf8'
)

for (const expected of [
  'terminal: 90',
  'standard: 140',
  'fragment: 210',
  'resolveLiveFinalTranscriptReleaseDelayMs',
]) {
  assert(
    releasePolicySource.includes(expected),
    `LIVE final transcript release policy should include ${expected}`
  )
}

assert(
  shadowBridgeSource.includes('resolveLiveFinalTranscriptReleaseDelayMs'),
  'LIVE Hub shadow bridge should use the canonical final transcript release policy'
)

assert(
  !shadowBridgeSource.includes('}, 275)'),
  'LIVE Hub shadow bridge should not retain the fixed 275ms transcript delay'
)

console.log('GEORGE LIVE latency qualification passed')
