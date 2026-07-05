import type { LiveOutcomeObservation } from './live-outcome-review'

export type OpportunityContinuityState =
  | 'continues'
  | 'changes_form'
  | 'pauses'
  | 'dormant'
  | 'transfers'
  | 'ends'
  | 'unknown'

export type OpportunityContinuityExecutionDecision =
  | 'wait'
  | 'follow_up'
  | 'do_not_follow_up'
  | 'prepare_next_conversation'
  | 'seek_decision_maker'
  | 'preserve_access'
  | 'reframe_objective'
  | 'close_out'
  | 'gather_missing_evidence'

export type OpportunityContinuityInput = {
  desiredOutcome?: string | null
  transcript?: string | null
  outcomeReview?: LiveOutcomeObservation | null
  conversationRecord?: {
    desiredOutcome?: string | null
    futureActions?: unknown[] | null
    latestOutcome?: Partial<LiveOutcomeObservation> | null
    latestLearning?: unknown
    outcomeProgression?: unknown[] | null
  } | null
  transcriptHighlights?: Array<{
    type?: 'operational_signal' | 'concern' | string
    label?: string
    text?: string
    whyItMattered?: string
    changed?: string
    effect?: string
  }> | null
  conversationPackage?: {
    desiredOutcome?: string | null
    futureActions?: unknown[] | null
    outcomeProgression?: unknown[] | null
    followUps?: unknown[] | null
  } | null
}

export type OpportunityContinuityDecision = {
  doctrine: 'Live to fight another day.'
  desiredOutcome: string
  opportunityState: OpportunityContinuityState
  executionDecision: OpportunityContinuityExecutionDecision
  confidence: number
  opportunitySurvived: boolean
  desiredOutcomeStillAchievable: boolean
  roomActuallyEnded: boolean
  credibilityImproved: boolean
  trustIncreased: boolean
  accessPreserved: boolean
  decisionMakerRequired: boolean
  appointmentRealistic: boolean
  waitingStrategicallyCorrect: boolean
  followUpStrategicallyCorrect: boolean
  noFollowUpStrategicallyCorrect: boolean
  desiredOutcomeEvolved: boolean
  nextExecutableOpportunity: string
  timing: 'now' | 'wait' | 'next_appointment' | 'only_if_reopened' | 'none'
  preservedLeverage: string[]
  evidenceStillRequired: string[]
  decisionMakerKnowledge: string
  objectiveEvolution: string
  reasoning: string
  preparationCarryForward: {
    opportunityState: OpportunityContinuityState
    nextExecutableOpportunity: string
    preservedLeverage: string[]
    evidenceStillRequired: string[]
    decisionMakerKnowledge: string
    waitingState: string
    followUpTiming: string
    objectiveEvolution: string
  }
}

function normalizeText(value: unknown): string {
  return String(value || '').trim()
}

function normalizeList<T = unknown>(value: T[] | T | null | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function includesAny(text: string, signals: string[]): boolean {
  return signals.some((signal) => text.includes(signal))
}

function countSignals(text: string, signals: string[]): number {
  return signals.filter((signal) => text.includes(signal)).length
}

function boundConfidence(value: number): number {
  return Math.max(0, Math.min(95, Math.round(value)))
}

function uniqueStrings(items: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const item of items.map((entry) => entry.trim()).filter(Boolean)) {
    const key = item.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }

  return result
}

export function buildOpportunityContinuity(input: OpportunityContinuityInput = {}): OpportunityContinuityDecision {
  const outcomeReview = input.outcomeReview || input.conversationRecord?.latestOutcome || null
  const desiredOutcome =
    normalizeText(input.desiredOutcome) ||
    normalizeText(outcomeReview?.desiredOutcome) ||
    normalizeText(input.conversationRecord?.desiredOutcome) ||
    normalizeText(input.conversationPackage?.desiredOutcome) ||
    'Unspecified LIVE outcome'

  const transcript = normalizeText(input.transcript).toLowerCase()
  const reviewText = [
    outcomeReview?.currentState,
    outcomeReview?.observedChange,
    outcomeReview?.bestAvailablePath,
    outcomeReview?.possibleSecondaryOutcome,
    outcomeReview?.internalNotes,
    outcomeReview?.notes,
    ...normalizeList(outcomeReview?.availablePaths),
    ...normalizeList(outcomeReview?.assistanceOptions),
  ].map(normalizeText).join(' ').toLowerCase()

  const highlightText = normalizeList(input.transcriptHighlights)
    .map((highlight) => [highlight.label, highlight.text, highlight.whyItMattered, highlight.changed, highlight.effect].map(normalizeText).join(' '))
    .join(' ')
    .toLowerCase()

  const combinedSignal = [transcript, reviewText, highlightText].filter(Boolean).join(' ')

  const positiveContinuitySignals = [
    'follow up',
    'next step',
    'send me',
    'send the',
    'send over',
    'materials',
    'deck',
    'proposal',
    'calendar',
    'schedule',
    'introduction',
    'referral',
    'interested',
    'circle back',
    'talk again',
    'keep me posted',
  ]

  const accessSignals = [
    'email me',
    'call me',
    'text me',
    'send me',
    'send the',
    'reach out',
    'assistant',
    'calendar',
    'intro',
    'introduction',
    'referral',
  ]

  const waitSignals = [
    'wait',
    'not now',
    'later',
    'next quarter',
    'next month',
    'after we',
    'once we',
    'when we',
    'circle back',
    'keep me posted',
    'not ready',
  ]

  const noFollowUpSignals = [
    'do not follow up',
    'don\'t follow up',
    'no follow up',
    'leave it',
    'stop contacting',
    'not interested',
    'no thanks',
    'not a fit',
    'pass',
    'decline',
  ]

  const decisionMakerSignals = [
    'decision maker',
    'partner',
    'committee',
    'board',
    'boss',
    'manager',
    'legal',
    'finance',
    'procurement',
    'investor relations',
    'my team',
    'we need to discuss',
  ]

  const evolutionSignals = [
    'instead',
    'maybe',
    'what if',
    'another way',
    'different',
    'partnership',
    'licensing',
    'pilot',
    'trial',
    'introduction',
    'referral',
  ]

  const trustSignals = [
    'that makes sense',
    'helpful',
    'good point',
    'interesting',
    'i see',
    'understand',
    'appreciate',
    'thanks for explaining',
  ]

  const concernSignals = normalizeList(input.transcriptHighlights).filter((highlight) => highlight.type === 'concern').length
  const operationalSignalCount = normalizeList(input.transcriptHighlights).filter((highlight) => highlight.type === 'operational_signal').length
  const positiveCount = countSignals(combinedSignal, positiveContinuitySignals) + operationalSignalCount
  const noFollowUpCount = countSignals(combinedSignal, noFollowUpSignals) + concernSignals

  const reviewProgress = outcomeReview?.observedProgress || 'unknown'
  const reviewConfidence = typeof outcomeReview?.confidence === 'number' ? outcomeReview.confidence : 35
  const accessPreserved = includesAny(combinedSignal, accessSignals) || positiveCount > 0
  const waitingStrategicallyCorrect = includesAny(combinedSignal, waitSignals) && noFollowUpCount === 0
  const noFollowUpStrategicallyCorrect = noFollowUpCount > positiveCount && !accessPreserved
  const followUpStrategicallyCorrect = positiveCount > noFollowUpCount && !waitingStrategicallyCorrect
  const decisionMakerRequired = includesAny(combinedSignal, decisionMakerSignals)
  const desiredOutcomeEvolved = includesAny(combinedSignal, evolutionSignals)
  const appointmentRealistic = includesAny(combinedSignal, ['schedule', 'calendar', 'next meeting', 'next call', 'talk again'])
  const credibilityImproved = reviewProgress === 'improving' || includesAny(combinedSignal, ['proof', 'evidence', 'materials', 'deck', 'proposal', 'that makes sense'])
  const trustIncreased = includesAny(combinedSignal, trustSignals) || credibilityImproved
  const roomActuallyEnded = includesAny(combinedSignal, ['goodbye', 'talk soon', 'thanks for your time', 'end of call', 'meeting ended']) || transcript.length > 0

  let opportunityState: OpportunityContinuityState = 'unknown'
  let executionDecision: OpportunityContinuityExecutionDecision = 'gather_missing_evidence'
  let timing: OpportunityContinuityDecision['timing'] = 'wait'

  if (noFollowUpStrategicallyCorrect) {
    opportunityState = 'ends'
    executionDecision = 'do_not_follow_up'
    timing = 'none'
  } else if (decisionMakerRequired && accessPreserved) {
    opportunityState = 'transfers'
    executionDecision = 'seek_decision_maker'
    timing = appointmentRealistic ? 'next_appointment' : 'now'
  } else if (desiredOutcomeEvolved && positiveCount >= noFollowUpCount) {
    opportunityState = 'changes_form'
    executionDecision = 'reframe_objective'
    timing = appointmentRealistic ? 'next_appointment' : waitingStrategicallyCorrect ? 'wait' : 'now'
  } else if (waitingStrategicallyCorrect) {
    opportunityState = 'pauses'
    executionDecision = 'wait'
    timing = 'wait'
  } else if (followUpStrategicallyCorrect || reviewProgress === 'improving') {
    opportunityState = 'continues'
    executionDecision = appointmentRealistic ? 'prepare_next_conversation' : 'follow_up'
    timing = appointmentRealistic ? 'next_appointment' : 'now'
  } else if (reviewProgress === 'declining' && accessPreserved) {
    opportunityState = 'dormant'
    executionDecision = 'preserve_access'
    timing = 'only_if_reopened'
  } else if (reviewProgress === 'declining') {
    opportunityState = 'ends'
    executionDecision = 'close_out'
    timing = 'none'
  }

  const opportunitySurvived = ['continues', 'changes_form', 'pauses', 'dormant', 'transfers'].includes(opportunityState)
  const desiredOutcomeStillAchievable = opportunitySurvived && opportunityState !== 'dormant'

  const preservedLeverage = uniqueStrings([
    accessPreserved ? 'Access was preserved.' : '',
    credibilityImproved ? 'Credibility improved or was protected.' : '',
    trustIncreased ? 'Trust increased or remained usable.' : '',
    appointmentRealistic ? 'Another appointment is realistic.' : '',
    decisionMakerRequired ? 'A decision-maker path surfaced.' : '',
    desiredOutcomeEvolved ? 'A better or secondary objective may have emerged.' : '',
    ...(outcomeReview?.availablePaths || []),
  ])

  const evidenceStillRequired = uniqueStrings([
    decisionMakerRequired ? 'Confirm the actual decision maker and path to reach them.' : '',
    waitingStrategicallyCorrect ? 'Wait for the promised condition, timing, or trigger before acting.' : '',
    desiredOutcomeEvolved ? 'Confirm whether the user wants to pursue the evolved objective.' : '',
    !accessPreserved && opportunitySurvived ? 'Confirm the channel for renewed access.' : '',
    opportunityState === 'unknown' ? 'Clarify whether the room produced a next executable opportunity.' : '',
  ])

  const decisionMakerKnowledge = decisionMakerRequired
    ? 'Another decision maker, internal partner, or approval path likely matters before the opportunity can advance.'
    : 'No separate decision-maker requirement was detected from the available signal.'

  const objectiveEvolution = desiredOutcomeEvolved
    ? 'The desired outcome may have changed form; preserve the original outcome while confirming the better executable path.'
    : 'No stronger replacement objective was detected.'

  const nextExecutableOpportunity =
    executionDecision === 'do_not_follow_up'
      ? 'Do not follow up unless the other party reopens access or the user supplies new signal.'
      : executionDecision === 'wait'
        ? 'Wait until the stated timing, condition, or room signal makes action useful.'
        : executionDecision === 'seek_decision_maker'
          ? 'Prepare the path to the decision maker and preserve the current contact as access.'
          : executionDecision === 'reframe_objective'
            ? 'Confirm the evolved objective and prepare the next conversation around that path.'
            : executionDecision === 'prepare_next_conversation'
              ? 'Prepare the next appointment using the preserved leverage and missing evidence.'
              : executionDecision === 'preserve_access'
                ? 'Preserve access without pushing; act only when the opportunity reopens.'
                : executionDecision === 'close_out'
                  ? 'Close the loop cleanly and avoid spending more execution effort on this room.'
                  : followUpStrategicallyCorrect
                    ? 'Follow up with the requested proof, material, or next-step ask.'
                    : normalizeText(outcomeReview?.bestAvailablePath) || 'Gather the missing signal before acting.'

  const confidence = boundConfidence(
    reviewConfidence +
    positiveCount * 4 -
    noFollowUpCount * 5 +
    (accessPreserved ? 6 : 0) +
    (decisionMakerRequired ? 3 : 0) +
    (desiredOutcomeEvolved ? 2 : 0)
  )

  const waitingState = waitingStrategicallyCorrect
    ? 'Waiting is an active execution decision.'
    : timing === 'none'
      ? 'No waiting state remains because the opportunity appears closed.'
      : 'No deliberate waiting state was detected.'

  const followUpTiming =
    timing === 'now'
      ? 'Follow up now while access and context are warm.'
      : timing === 'next_appointment'
        ? 'Use the next appointment as the execution surface.'
        : timing === 'wait'
          ? 'Wait before following up.'
          : timing === 'only_if_reopened'
            ? 'Follow up only if the other party reopens the opportunity or new signal appears.'
            : 'Do not follow up.'

  return {
    doctrine: 'Live to fight another day.',
    desiredOutcome,
    opportunityState,
    executionDecision,
    confidence,
    opportunitySurvived,
    desiredOutcomeStillAchievable,
    roomActuallyEnded,
    credibilityImproved,
    trustIncreased,
    accessPreserved,
    decisionMakerRequired,
    appointmentRealistic,
    waitingStrategicallyCorrect,
    followUpStrategicallyCorrect,
    noFollowUpStrategicallyCorrect,
    desiredOutcomeEvolved,
    nextExecutableOpportunity,
    timing,
    preservedLeverage,
    evidenceStillRequired,
    decisionMakerKnowledge,
    objectiveEvolution,
    reasoning: [
      `Opportunity state: ${opportunityState}.`,
      `Execution decision: ${executionDecision}.`,
      nextExecutableOpportunity,
    ].join(' '),
    preparationCarryForward: {
      opportunityState,
      nextExecutableOpportunity,
      preservedLeverage,
      evidenceStillRequired,
      decisionMakerKnowledge,
      waitingState,
      followUpTiming,
      objectiveEvolution,
    },
  }
}
