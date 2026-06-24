export type ContinuationGenerationInput = {
  transcript: string
  objective?: string | null
  room?: string | null
  audio?: boolean
}

export type ContinuationGenerationResult = {
  continuation: string
  confidence: number
  reason: string
}

const EXPLICIT_CONTINUATION_TRIGGER = /(?:\.{3}|…)+$/

function normalizeTranscript(transcript: string) {
  return transcript.trim().replace(/\s+/g, ' ')
}

export function stripContinuationTrigger(transcript: string) {
  return normalizeTranscript(transcript.replace(EXPLICIT_CONTINUATION_TRIGGER, ''))
}

function objectiveHint(objective?: string | null, room?: string | null) {
  const cleanObjective = normalizeTranscript(String(objective || ''))
  const cleanRoom = normalizeTranscript(String(room || ''))
  const combined = `${cleanObjective} ${cleanRoom}`.trim()

  if (!combined) return 'the outcome can move forward clearly'

  if (/invest|capital|raise|fund|scale|revenue|market/i.test(combined)) {
    return 'demand, scalability, and execution can support the projected opportunity'
  }

  if (/interview|job|hire|role|candidate/i.test(combined)) {
    return 'the fit is specific, credible, and directly tied to the role'
  }

  if (/sale|customer|client|buyer|deal/i.test(combined)) {
    return 'the value is clear enough to justify the next step'
  }

  if (/negotiat|term|price|agreement/i.test(combined)) {
    return 'the terms create a fair path forward without weakening the objective'
  }

  return cleanObjective.length <= 90
    ? cleanObjective
    : 'the outcome can move forward clearly'
}

function continuationForStem(stem: string, hint: string) {
  const lower = stem.toLowerCase()

  if (/\b(biggest|main|primary) concern\b.*\bis$/i.test(lower)) {
    return `...whether ${hint}.`
  }

  if (/\b(what matters|most important thing|key thing)\b.*\bis$/i.test(lower)) {
    return `...showing that ${hint}.`
  }

  if (/\b(reason|why)\b.*\bis$/i.test(lower)) {
    return `...because ${hint}.`
  }

  if (/\b(point|question|issue)\b.*\bis$/i.test(lower)) {
    return `...whether ${hint}.`
  }

  if (/\b(challenge|problem)\b.*\bis$/i.test(lower)) {
    return `...proving that ${hint}.`
  }

  if (/\b(opportunity)\b.*\bis$/i.test(lower)) {
    return `...turning that proof into a clear next step.`
  }

  if (/\b(difference)\b.*\bis$/i.test(lower)) {
    return `...whether the next step is based on proof, not assumption.`
  }

  if (/\b(if|when)\b/i.test(lower)) {
    return `...then the next step should protect the objective and clarify the decision.`
  }

  return `...that ${hint}.`
}

export function generateContinuation(
  input: ContinuationGenerationInput
): ContinuationGenerationResult {
  const stem = stripContinuationTrigger(input.transcript)

  if (!stem) {
    return {
      continuation: '',
      confidence: 0,
      reason: 'No continuation stem after trigger removal.',
    }
  }

  const hint = objectiveHint(input.objective, input.room)
  const continuation = continuationForStem(stem, hint)

  return {
    continuation,
    confidence: 0.82,
    reason: 'Generated objective-aware continuation from explicit trigger.',
  }
}
