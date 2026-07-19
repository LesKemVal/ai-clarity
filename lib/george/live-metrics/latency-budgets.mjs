export const GEORGE_LIVE_LATENCY_BUDGETS_MS = Object.freeze({
  finalTranscriptRelease: 210,
  transcriptToActionCue: 500,
  actionCueToDelivery: 75,
  deliveryToVisualRender: 75,
  transcriptToVisualRender: 650,
  voiceCueToTtsRequest: 100,
  ttsRequestToAudio: 1500,
  audioToPlaybackStart: 150,
  transcriptToPlaybackStart: 2000,
})

export const GEORGE_LIVE_LATENCY_SEGMENTS = Object.freeze({
  transcriptToActionCue: Object.freeze({
    from: ['transcript_input'],
    to: ['action_cue', 'hub_action_cue_received'],
  }),
  actionCueToDelivery: Object.freeze({
    from: ['action_cue', 'hub_action_cue_received'],
    to: ['delivery_cue'],
  }),
  deliveryToVisualRender: Object.freeze({
    from: ['delivery_cue', 'visual_cue_received'],
    to: ['visual_cue_rendered'],
  }),
  transcriptToVisualRender: Object.freeze({
    from: ['transcript_input'],
    to: ['visual_cue_rendered'],
  }),
  voiceCueToTtsRequest: Object.freeze({
    from: ['voice_cue_requested'],
    to: ['tts_request_start'],
  }),
  ttsRequestToAudio: Object.freeze({
    from: ['tts_request_start'],
    to: ['tts_audio_received'],
  }),
  audioToPlaybackStart: Object.freeze({
    from: ['tts_audio_received'],
    to: ['tts_playback_start'],
  }),
  transcriptToPlaybackStart: Object.freeze({
    from: ['transcript_input'],
    to: ['tts_playback_start'],
  }),
})

function findRecord(records, candidates, startIndex = 0) {
  for (let index = startIndex; index < records.length; index += 1) {
    if (candidates.includes(records[index]?.event)) {
      return { record: records[index], index }
    }
  }

  return undefined
}

export function measureGeorgeLiveLatencySegment(records = [], segment) {
  const definition = GEORGE_LIVE_LATENCY_SEGMENTS[segment]
  if (!definition) return undefined

  const start = findRecord(records, definition.from)
  if (!start) return undefined

  const end = findRecord(records, definition.to, start.index + 1)
  if (!end) return undefined

  const startAt = Number(start.record?.at)
  const endAt = Number(end.record?.at)
  if (!Number.isFinite(startAt) || !Number.isFinite(endAt)) return undefined

  return Math.max(0, endAt - startAt)
}

export function evaluateGeorgeLiveLatencyBudgets(records = []) {
  const measurements = {}
  const violations = []
  const unavailable = []

  for (const segment of Object.keys(GEORGE_LIVE_LATENCY_SEGMENTS)) {
    const durationMs = measureGeorgeLiveLatencySegment(records, segment)
    const budgetMs = GEORGE_LIVE_LATENCY_BUDGETS_MS[segment]

    if (durationMs === undefined) {
      unavailable.push(segment)
      continue
    }

    measurements[segment] = durationMs

    if (durationMs > budgetMs) {
      violations.push({ segment, durationMs, budgetMs })
    }
  }

  return {
    passed: violations.length === 0,
    measurements,
    violations,
    unavailable,
  }
}
