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

console.log('GEORGE LIVE latency qualification passed')
