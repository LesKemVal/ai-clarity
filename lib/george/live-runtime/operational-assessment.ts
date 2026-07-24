import type {
  GeorgeActionCue,
  GeorgeOperationalAssessment,
} from '@/lib/george/live-hub/types'

const INTERNAL_REASON_PATTERNS = [
  /receiver policy/i,
  /delivery (?:cue|router|surface)/i,
  /fast cue refined/i,
  /local cue/i,
  /fallback/i,
  /runtime/i,
  /generated/i,
  /suppressed/i,
  /authority/i,
]

function cleanSentence(value: string) {
  return String(value || '')
    .replace(/^(cue|advice|response|presentation):\s*/i, '')
    .replace(/^["“”]+|["“”]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isUserFacingEvidence(value: string) {
  const clean = cleanSentence(value)
  if (!clean || clean.length < 8) return false
  return !INTERNAL_REASON_PATTERNS.some((pattern) => pattern.test(clean))
}

export function resolveGeorgeOperationalAssessment(input: {
  actionCue: GeorgeActionCue
  actionText?: string
}): GeorgeOperationalAssessment {
  const existing = input.actionCue.operationalAssessment
  const action = cleanSentence(existing?.action || input.actionText || input.actionCue.cue)
  const evidenceCandidate = cleanSentence(
    existing?.evidence ||
      (isUserFacingEvidence(input.actionCue.reason) ? input.actionCue.reason : '')
  )
  const outcomeImpact = cleanSentence(existing?.outcomeImpact || '')

  return {
    action,
    evidence: evidenceCandidate || undefined,
    outcomeImpact: outcomeImpact || undefined,
    confidence: Math.max(
      0,
      Math.min(1, existing?.confidence ?? input.actionCue.confidence ?? 0)
    ),
  }
}
