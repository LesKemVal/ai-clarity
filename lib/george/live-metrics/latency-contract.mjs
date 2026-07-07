export const LIVE_STT_LATENCY_TIMELINE = [
  'mic_open',
  'first_audio_chunk_sent',
  'deepgram_interim',
  'deepgram_final',
]

export const LIVE_HUB_LATENCY_TIMELINE = [
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

export const LIVE_LATENCY_TIMELINE = [
  ...LIVE_STT_LATENCY_TIMELINE,
  ...LIVE_HUB_LATENCY_TIMELINE,
]

function validateAgainstTimeline(events = [], timeline = LIVE_LATENCY_TIMELINE) {
  const seen = new Map()

  for (const event of events) {
    if (!timeline.includes(event)) continue
    if (!seen.has(event)) seen.set(event, seen.size)
  }

  const missing = timeline.filter((event) => !seen.has(event))

  const ordered = [...seen.keys()].every((event, index, observed) => {
    if (index === 0) return true
    return timeline.indexOf(observed[index - 1]) <= timeline.indexOf(event)
  })

  return {
    complete: missing.length === 0,
    ordered,
    missing,
  }
}

export function getLatencyTimelineForTurn(turnId = '') {
  return String(turnId).startsWith('live-hub-')
    ? LIVE_HUB_LATENCY_TIMELINE
    : LIVE_STT_LATENCY_TIMELINE
}

export function validateLatencyTimeline(events = [], turnId = '') {
  return validateAgainstTimeline(events, getLatencyTimelineForTurn(turnId))
}
