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

  if (!combined) return 'the point can stay clear'

  if (/interview|job|hire|role|candidate/i.test(combined)) {
    return 'the answer stays tied to the role'
  }

  if (/sale|customer|client|buyer|deal/i.test(combined)) {
    return 'the value is clear enough to keep moving'
  }

  if (/negotiat|term|price|agreement|invest|capital|raise|fund|share|stake|equity|valuation/i.test(combined)) {
    return 'the structure stays fair and specific'
  }

  return 'the point stays connected to the outcome'
}

function continuationForStem(stem: string, hint: string) {
  const lower = stem.toLowerCase()

  if (/\b(percent|percentage|valuation|price|salary|compensation|amount|stake|share|equity|split|term|terms|months?|years?)\s+(of|at|for|is|are)?$/i.test(lower)) {
    return `...__.`
  }

  if (/\b(for|at|around|about|roughly|approximately|between)\s*$/i.test(lower)) {
    return `...__.`
  }

  if (/\b(biggest|main|primary) concern\b.*\bis$/i.test(lower)) {
    return `...whether the concern is something we can answer directly.`
  }

  if (/\b(what matters|most important thing|key thing)\b.*\bis$/i.test(lower)) {
    return `...staying clear about what actually matters here.`
  }

  if (/\b(reason|why)\b.*\bis$/i.test(lower)) {
    return `...because that changes what the next step should be.`
  }

  if (/\b(point|question|issue)\b.*\bis$/i.test(lower)) {
    return `...whether we are solving the right problem.`
  }

  if (/\b(challenge|problem)\b.*\bis$/i.test(lower)) {
    return `...getting specific without getting ahead of the facts.`
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
