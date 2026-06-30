import assert from 'node:assert'
import {
  LIVE_LATENCY_TIMELINE,
  validateLatencyTimeline,
} from '../../lib/george/live-metrics/latency-contract.mjs'

export function run() {
  const valid = validateLatencyTimeline(LIVE_LATENCY_TIMELINE)

  assert.equal(valid.complete, true)
  assert.equal(valid.ordered, true)
  assert.deepEqual(valid.missing, [])

  const incomplete = validateLatencyTimeline([
    'mic_open',
    'deepgram_final',
    'transcript_input',
  ])

  assert.equal(incomplete.complete, false)
  assert(
    incomplete.missing.includes('tts_playback_end'),
    'Latency contract should detect missing end-to-end stages.'
  )

  const outOfOrder = validateLatencyTimeline([
    'mic_open',
    'tts_playback_end',
    'transcript_input',
  ])

  assert.equal(
    outOfOrder.ordered,
    false,
    'Latency contract should detect out-of-order runtime stages.'
  )

  return true
}
