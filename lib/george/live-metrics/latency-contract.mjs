export const LIVE_LATENCY_TIMELINE = [
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

export function validateLatencyTimeline(events = []) {
  const seen = new Map()

  for (const event of events) {
    if (!LIVE_LATENCY_TIMELINE.includes(event)) continue
    if (!seen.has(event)) seen.set(event, seen.size)
  }

  const missing = LIVE_LATENCY_TIMELINE.filter((event) => !seen.has(event))

  const ordered = [...seen.keys()].every((event, index, observed) => {
    if (index === 0) return true
    return LIVE_LATENCY_TIMELINE.indexOf(observed[index - 1]) <= LIVE_LATENCY_TIMELINE.indexOf(event)
  })

  return {
    complete: missing.length === 0,
    ordered,
    missing,
  }
}
