export type ContinuationReplacementInput = {
  fallback?: string | null
  transcript?: string | null
  lastFiveSeconds?: string | null
  shadowMap?: string | null
  desiredOutcome?: string | null
  activeOutcome?: string | null
}

function compact(value: unknown, max = 240) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max)
}

export function continuationEvidence(input: ContinuationReplacementInput) {
  return [
    input.transcript,
    input.lastFiveSeconds,
    input.shadowMap,
    input.desiredOutcome,
    input.activeOutcome,
  ].join(' ')
}

export function safeContinuationReplacement(input: ContinuationReplacementInput) {
  const transcript = compact(input.transcript)
  const lower = transcript.toLowerCase()

  if (/\b(because|reason|why)\b/i.test(lower)) {
    return '...because the value has to be clear enough to support that outcome.'
  }

  if (/\b(opportunity|deal|valuation|value)\b/i.test(lower)) {
    return '...in a way the room can understand and evaluate.'
  }

  if (/\b(what matters|the point|the issue|the question)\b/i.test(lower)) {
    return '...what matters is staying clear about the next step.'
  }

  return '...__.'
}
