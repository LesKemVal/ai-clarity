export type LiveLatencyEvent =
  | 'transcript_received'
  | 'local_cue_sent'
  | 'groq_request'
  | 'groq_response'
  | 'fast_cue_sent'

export function markLatency(startAt: number, event: LiveLatencyEvent) {
  const at = Date.now()

  return {
    event,
    at,
    latencyMs: at - startAt,
  }
}
