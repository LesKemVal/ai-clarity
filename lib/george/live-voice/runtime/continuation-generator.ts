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

function objectiveHint(objective?: string | null) {
  const clean = normalizeTranscript(String(objective || ''))
  if (!clean) return 'the outcome can move forward clearly'
  if (/invest|capital|raise|fund|scale|revenue|market/i.test(clean)) {
    return 'the opportunity can scale predictably'
  }
  if (/interview|job|hire|role|candidate/i.test(clean)) {
    return 'the fit is clear, specific, and credible'
  }
  if (/sale|customer|client|buyer|deal/i.test(clean)) {
    return 'the value is clear enough to justify the next step'
  }
  if (/negotiat|term|price|agreement/i.test(clean)) {
    return 'the terms create a fair path forward'
  }
  return clean.length <= 90 ? clean : 'the outcome can move forward clearly'
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

  const hint = objectiveHint(input.objective)
  const lower = stem.toLowerCase()

  let continuation = ''

  if (/\b(biggest|main|primary) concern\b.*\bis$/i.test(lower)) {
    continuation = `...whether ${hint}.`
  } else if (/\b(what matters|most important thing|key thing)\b.*\bis$/i.test(lower)) {
    continuation = `...that ${hint}.`
  } else if (/\b(reason|why)\b.*\bis$/i.test(lower)) {
    continuation = `...because ${hint}.`
  } else if (/\b(point|question|issue|challenge|opportunity|problem|difference)\b.*\bis$/i.test(lower)) {
    continuation = `...that ${hint}.`
  } else if (/\b(if|when)\b/i.test(lower)) {
    continuation = `...then the next step should protect the objective.`
  } else {
    continuation = `...that ${hint}.`
  }

  return {
    continuation,
    confidence: 0.82,
    reason: 'Generated objective-aware continuation from explicit trigger.',
  }
}
