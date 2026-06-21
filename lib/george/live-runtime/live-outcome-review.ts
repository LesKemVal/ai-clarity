export type LiveOutcomeObservation = {
  desiredOutcome: string
  observedProgress: 'unknown' | 'improving' | 'stable' | 'declining'
  confidence: number
  possibleSecondaryOutcome: string
  notes: string
}

export function buildLiveOutcomeObservation({
  desiredOutcome,
  transcript,
  supportSummary,
}: {
  desiredOutcome?: string | null
  transcript?: string | null
  supportSummary?: string | null
}): LiveOutcomeObservation {
  const cleanOutcome = String(desiredOutcome || '').trim() || 'Unspecified LIVE outcome'
  const cleanTranscript = String(transcript || '').toLowerCase()

  const positiveSignals = [
    'follow up',
    'next step',
    'send me',
    'send the',
    'introduction',
    'referral',
    'schedule',
    'calendar',
    'proposal',
    'deck',
    'materials',
    'call me',
    'email me',
    'interested',
  ]

  const negativeSignals = [
    'not interested',
    'no thanks',
    'too expensive',
    'not now',
    'pass',
    'decline',
    'not a fit',
  ]

  const positiveCount = positiveSignals.filter((signal) => cleanTranscript.includes(signal)).length
  const negativeCount = negativeSignals.filter((signal) => cleanTranscript.includes(signal)).length

  let observedProgress: LiveOutcomeObservation['observedProgress'] = 'unknown'
  let confidence = 35
  let possibleSecondaryOutcome = 'Unknown.'
  let notes = 'Insufficient signal to determine outcome.'

  if (positiveCount > negativeCount) {
    observedProgress = 'improving'
    confidence = Math.min(88, 55 + positiveCount * 8)
    possibleSecondaryOutcome = 'Follow-up, referral, next conversation, or future opportunity may have been preserved.'
    notes = 'Positive continuation signals appeared in the LIVE transcript.'
  } else if (negativeCount > positiveCount) {
    observedProgress = 'declining'
    confidence = Math.min(82, 52 + negativeCount * 8)
    possibleSecondaryOutcome = 'A later follow-up, referral request, or relationship-preserving next step may still be available.'
    notes = 'Negative or rejection signals appeared in the LIVE transcript.'
  } else if (cleanTranscript.length > 120) {
    observedProgress = 'stable'
    confidence = 48
    possibleSecondaryOutcome = 'Conversation continued, but outcome evidence was not strong enough to classify.'
    notes = 'Some conversation signal exists, but no clear outcome marker was detected.'
  }

  return {
    desiredOutcome: cleanOutcome,
    observedProgress,
    confidence,
    possibleSecondaryOutcome,
    notes: [notes, supportSummary ? `Runtime: ${supportSummary}` : ''].filter(Boolean).join(' '),
  }
}
