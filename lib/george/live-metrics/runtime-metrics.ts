export type GeorgeRuntimeMetricEvent =
  | 'transcript_input'
  | 'action_cue'
  | 'delivery_cue'

const turnStarts = new Map<string, number>()

export function markRuntimeEvent(
  turnId: string,
  event: GeorgeRuntimeMetricEvent
) {
  const now = Date.now()

  if (event === 'transcript_input') {
    turnStarts.set(turnId, now)

    console.info('[LIVE][metrics]', {
      event,
      turnId,
      at: now,
    })

    return
  }

  const start = turnStarts.get(turnId)

  console.info('[LIVE][metrics]', {
    event,
    turnId,
    latencyMs: start ? now - start : undefined,
    at: now,
  })
}
