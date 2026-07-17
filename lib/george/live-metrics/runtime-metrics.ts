import { validateLatencyTimeline } from './latency-contract.mjs'

export type GeorgeRuntimeMetricEvent =
  | 'mic_open'
  | 'speech_detected'
  | 'first_audio_chunk_sent'
  | 'deepgram_interim'
  | 'deepgram_final'
  | 'final_transcript_buffer_started'
  | 'final_transcript_buffer_extended'
  | 'final_transcript_buffer_released'
  | 'transcript_input'
  | 'hub_transcript_queued'
  | 'hub_transcript_flushed'
  | 'hub_transcript_sent'
  | 'hub_action_cue_received'
  | 'action_cue'
  | 'delivery_cue'
  | 'delivery_revision'
  | 'delivery_duplicate_suppressed'
  | 'delivery_revision_suppressed'
  | 'visual_cue_received'
  | 'visual_cue_rendered'
  | 'voice_cue_requested'
  | 'core_authority_pass'
  | 'core_authority_replaced'
  | 'tts_request_start'
  | 'tts_audio_received'
  | 'tts_playback_start'
  | 'tts_playback_end'

const turnStarts = new Map<string, number>()
const turnEvents = new Map<string, GeorgeRuntimeMetricEvent[]>()

export function startRuntimeTurn(turnId: string) {
  const now = Date.now()
  turnStarts.set(turnId, now)

  console.info('[LIVE][metrics]', {
    event: 'turn_start',
    turnId,
    at: now,
  })
}

export function markRuntimeEvent(
  turnId: string,
  event: GeorgeRuntimeMetricEvent
) {
  const now = Date.now()

  if (
    (
      event === 'final_transcript_buffer_started' ||
      event === 'transcript_input'
    ) &&
    !turnStarts.has(turnId)
  ) {
    turnStarts.set(turnId, now)
  }

  const start = turnStarts.get(turnId)
  const timeline = [...(turnEvents.get(turnId) || []), event]
  turnEvents.set(turnId, timeline)

  const contract = validateLatencyTimeline(timeline, turnId)

  console.info('[LIVE][metrics]', {
    event,
    turnId,
    latencyMs: start ? now - start : undefined,
    at: now,
    latencyContract: {
      complete: contract.complete,
      ordered: contract.ordered,
      missing: contract.missing,
    },
  })

  if (!contract.ordered) {
    console.warn('[LIVE][metrics][latency-contract]', {
      turnId,
      ordered: contract.ordered,
      missing: contract.missing,
      timeline,
    })
  }
}

export function getRuntimeTurnTimeline(turnId: string) {
  return [...(turnEvents.get(turnId) || [])]
}

export function getRuntimeTurnLatencyContract(turnId: string) {
  return validateLatencyTimeline(getRuntimeTurnTimeline(turnId), turnId)
}

export function resetRuntimeTurnMetrics(turnId?: string) {
  if (turnId) {
    turnStarts.delete(turnId)
    turnEvents.delete(turnId)
    return
  }

  turnStarts.clear()
  turnEvents.clear()
}
