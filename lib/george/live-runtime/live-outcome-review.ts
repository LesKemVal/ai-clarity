import type { OutcomeGovernorSnapshot } from '@/lib/george/live-voice/runtime/outcome-governor'

export type LiveOutcomeObservation = {
  desiredOutcome: string
  observedProgress: 'unknown' | 'improving' | 'stable' | 'declining'
  confidence: number
  possibleSecondaryOutcome: string
  notes: string

  desiredState: string
  currentState: string
  observedChange: string
  availablePaths: string[]
  bestAvailablePath: string
  assistanceOptions: string[]
  internalNotes: string
}

export function buildLiveOutcomeObservation({
  desiredOutcome,
  transcript,
  supportSummary,
  outcomeGovernor,
}: {
  desiredOutcome?: string | null
  transcript?: string | null
  supportSummary?: string | null
  outcomeGovernor?: OutcomeGovernorSnapshot | null
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

  const movementState = outcomeGovernor?.movementState || null
  const governorMove = outcomeGovernor?.move || null
  const governorConfidence =
    typeof outcomeGovernor?.confidence === 'number'
      ? Math.round(outcomeGovernor.confidence * 100)
      : confidence

  const currentState =
    movementState === 'advancing'
      ? 'Advancing toward the desired outcome.'
      : movementState === 'closing'
        ? 'Close to a decision or next step.'
        : movementState === 'blocked'
          ? 'Blocked by missing signal or unresolved constraint.'
          : movementState === 'escalating'
            ? 'Pressure increased; position may need protection.'
            : movementState === 'stalled'
              ? 'Stalled or waiting for a clearer next signal.'
              : observedProgress === 'improving'
                ? 'Progress appears positive.'
                : observedProgress === 'declining'
                  ? 'Progress appears negative.'
                  : observedProgress === 'stable'
                    ? 'Conversation continued without a clear outcome marker.'
                    : 'Outcome position is unclear.'

  const observedChange =
    movementState
      ? `Runtime movement state: ${movementState}.`
      : notes

  const availablePaths =
    movementState === 'advancing' || movementState === 'closing'
      ? ['Original outcome remains available.', 'Follow-up or next-step path may be available.']
      : movementState === 'blocked'
        ? ['Acquire missing signal.', 'Clarify constraints before stronger action.']
        : movementState === 'escalating'
          ? ['Protect user position.', 'Slow the room or rebrief before continuing.']
          : movementState === 'stalled'
            ? ['Recover signal.', 'Reframe the conversation.', 'Consider a secondary outcome.']
            : observedProgress === 'improving'
              ? ['Continue toward original outcome.', 'Preserve secondary opportunity.']
              : observedProgress === 'declining'
                ? ['Recover relationship.', 'Ask for referral or future follow-up.', 'Consider a new outcome.']
                : ['Clarify what happened.', 'Identify the next available path.']

  const bestAvailablePath =
    governorMove === 'direct_response'
      ? 'Respond directly and move toward the next commitment.'
      : governorMove === 'signal_acquisition'
        ? 'Acquire the next meaningful signal.'
        : governorMove === 'context_recovery'
          ? 'Recover context before stronger action.'
          : governorMove === 'buy_time'
            ? 'Buy time and avoid premature commitment.'
            : governorMove === 'protect_position'
              ? 'Protect the user position before advancing.'
              : governorMove === 'clarify'
                ? 'Clarify the situation before acting.'
                : governorMove === 'summarize'
                  ? 'Summarize the room and define the next step.'
                  : governorMove === 'hold'
                    ? 'Hold position.'
                    : availablePaths[0] || 'Clarify the next available path.'

  const assistanceOptions =
    movementState === 'advancing' || movementState === 'closing'
      ? ['Prepare follow-up.', 'Draft next message.', 'Prepare requested materials.', 'Prepare next conversation.']
      : movementState === 'blocked' || movementState === 'stalled'
        ? ['Identify missing signal.', 'Prepare clarifying question.', 'Reframe the objective.', 'Plan next attempt.']
        : movementState === 'escalating'
          ? ['Prepare de-escalation.', 'Protect position.', 'Plan rebrief.', 'Draft careful follow-up.']
          : ['Summarize what happened.', 'Plan the next move.', 'Prepare follow-up.', 'Consider a new outcome.']

  return {
    desiredOutcome: cleanOutcome,
    observedProgress,
    confidence: governorConfidence,
    possibleSecondaryOutcome,
    notes: [notes, supportSummary ? `Runtime: ${supportSummary}` : ''].filter(Boolean).join(' '),

    desiredState: cleanOutcome,
    currentState,
    observedChange,
    availablePaths,
    bestAvailablePath,
    assistanceOptions,
    internalNotes: [
      notes,
      outcomeGovernor?.reason ? `Governor: ${outcomeGovernor.reason}` : '',
      outcomeGovernor?.missingSignalReason ? `Missing signal: ${outcomeGovernor.missingSignalReason}` : '',
      supportSummary ? `Runtime: ${supportSummary}` : '',
    ].filter(Boolean).join(' '),
  }
}
