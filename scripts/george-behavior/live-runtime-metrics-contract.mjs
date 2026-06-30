import assert from 'node:assert'
import {
  getRuntimeTurnLatencyContract,
  getRuntimeTurnTimeline,
  markRuntimeEvent,
  resetRuntimeTurnMetrics,
  startRuntimeTurn,
} from '../../lib/george/live-metrics/runtime-metrics.ts'

export function run() {
  const turnId = 'latency-contract-turn'

  resetRuntimeTurnMetrics()
  startRuntimeTurn(turnId)

  for (const event of [
    'mic_open',
    'first_audio_chunk_sent',
    'deepgram_interim',
    'deepgram_final',
    'transcript_input',
    'hub_transcript_sent',
    'hub_action_cue_received',
    'delivery_cue',
    'visual_cue_received',
    'visual_cue_rendered',
    'tts_request_start',
    'tts_audio_received',
    'tts_playback_start',
    'tts_playback_end',
  ]) {
    markRuntimeEvent(turnId, event)
  }

  assert.deepEqual(
    getRuntimeTurnTimeline(turnId),
    [
      'mic_open',
      'first_audio_chunk_sent',
      'deepgram_interim',
      'deepgram_final',
      'transcript_input',
      'hub_transcript_sent',
      'hub_action_cue_received',
      'delivery_cue',
      'visual_cue_received',
      'visual_cue_rendered',
      'tts_request_start',
      'tts_audio_received',
      'tts_playback_start',
      'tts_playback_end',
    ]
  )

  const contract = getRuntimeTurnLatencyContract(turnId)

  assert.equal(contract.complete, true)
  assert.equal(contract.ordered, true)
  assert.deepEqual(contract.missing, [])

  resetRuntimeTurnMetrics(turnId)

  assert.deepEqual(
    getRuntimeTurnTimeline(turnId),
    [],
    'Runtime metrics should support deterministic reset between tests.'
  )

  return true
}
