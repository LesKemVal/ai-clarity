export type GeorgeRuntimeMetricEvent =
  | 'mic_open'
  | 'speech_detected'
  | 'first_audio_chunk_sent'
  | 'deepgram_interim'
  | 'deepgram_final'
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

  if (event === 'transcript_input' && !turnStarts.has(turnId)) {
    turnStarts.set(turnId, now)
  }

  const start = turnStarts.get(turnId)

  console.info('[LIVE][metrics]', {
    event,
    turnId,
    latencyMs: start ? now - start : undefined,
    at: now,
  })
}
