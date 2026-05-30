export type SituationType =
  | 'pressure'
  | 'proof_challenge'
  | 'authority'
  | 'interview'
  | 'negotiation'
  | 'objection'
  | 'unknown'

export type SituationResult = {
  type: SituationType
  confidence: number
  reason: string
}

export function extractSituation(
  text: string
): SituationResult {
  const clean = text.toLowerCase()

  if (
    /interview|hiring manager|recruiter|job interview/i.test(clean)
  ) {
    return {
      type: 'interview',
      confidence: 0.9,
      reason: 'Interview context detected.',
    }
  }

  if (
    /rushing me|pressuring me|pushing me|moving too fast/i.test(clean)
  ) {
    return {
      type: 'pressure',
      confidence: 0.85,
      reason: 'Pressure signal detected.',
    }
  }

  if (
    /challenge my numbers|prove it|evidence|show me proof/i.test(clean)
  ) {
    return {
      type: 'proof_challenge',
      confidence: 0.9,
      reason: 'Proof challenge detected.',
    }
  }

  if (
    /officer|license|registration|show me your id/i.test(clean)
  ) {
    return {
      type: 'authority',
      confidence: 0.95,
      reason: 'Authority interaction detected.',
    }
  }

  return {
    type: 'unknown',
    confidence: 0.3,
    reason: 'No strong situation detected.',
  }
}
