import { buildLiveOutcomeObservation, type LiveOutcomeObservation } from './live-outcome-review'
import { buildOpportunityContinuity } from './opportunity-continuity'
import {
  createConversationPackage,
  updateAfterLive,
  buildConversationRecord,
} from '../conversation-packages/index.mjs'
import type { OutcomeGovernorSnapshot } from '../live-voice/runtime/outcome-governor'
import { evaluateLearningCandidates, promoteLearningCandidates } from '../learning/runtime.mjs'


export type LiveTranscriptHighlight = {
  kind: 'signal' | 'concern'
  label: string
  excerpt: string
  reason: string
  recommendedUse: string
}

export type LiveOperationalDebrief = {
  summary: string
  observations: Array<{
    label: string
    detail: string
    importance: number
  }>
}

function clean(value: unknown) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function excerptFromTranscript(transcript: string, pattern: RegExp) {
  const lines = String(transcript || '')
    .split(/\n+/)
    .map((line) => clean(line))
    .filter(Boolean)

  return lines.find((line) => pattern.test(line)) || ''
}

function buildLiveTranscriptHighlights(params: {
  transcript: string
  outcomeReview: LiveOutcomeObservation
}): LiveTranscriptHighlight[] {
  const transcript = String(params.transcript || '')
  const review = params.outcomeReview
  const highlights: LiveTranscriptHighlight[] = []

  const add = (item: LiveTranscriptHighlight) => {
    if (!item.excerpt) return
    if (highlights.some((existing) => existing.excerpt === item.excerpt && existing.kind === item.kind)) return
    highlights.push(item)
  }

  add({
    kind: 'signal',
    label: 'Opportunity preserved',
    excerpt: excerptFromTranscript(transcript, /follow up|next step|schedule|calendar|call me|email me|send me|send the|materials|deck|proposal/i),
    reason: 'The interaction produced a continuation path instead of a terminal ending.',
    recommendedUse: review.bestAvailablePath || 'Use this to prepare the next specific move.',
  })

  add({
    kind: 'signal',
    label: 'Evidence requested',
    excerpt: excerptFromTranscript(transcript, /proof|evidence|data|results|pilot|case study|metrics|deployment/i),
    reason: 'The room may be asking for proof rather than rejecting the desired outcome.',
    recommendedUse: 'Prepare the requested evidence before pushing for the next commitment.',
  })

  add({
    kind: 'signal',
    label: 'Decision path surfaced',
    excerpt: excerptFromTranscript(transcript, /decision|decide|manager|cto|cfo|procurement|legal|board|team|approval/i),
    reason: 'The interaction may have revealed who or what controls the next stage.',
    recommendedUse: 'Treat this as a path to the next room rather than a finished conversation.',
  })

  add({
    kind: 'concern',
    label: 'Possible resistance',
    excerpt: excerptFromTranscript(transcript, /not interested|no thanks|too expensive|not now|pass|decline|not a fit|concern|risk|skeptical/i),
    reason: 'This may reduce the probability of achieving the desired outcome without a better next move.',
    recommendedUse: 'Do not over-push. Preserve credibility and determine whether the issue is final or temporary.',
  })

  add({
    kind: 'concern',
    label: 'Missing signal',
    excerpt: review.observedProgress === 'unknown'
      ? excerptFromTranscript(transcript, /think about it|circle back|later|maybe|not sure|unclear/i)
      : '',
    reason: 'The transcript does not provide enough evidence to know whether the opportunity advanced or closed.',
    recommendedUse: 'Clarify the next step before assuming momentum exists.',
  })

  return highlights.slice(0, 8)
}

function desiredOutcomeKind(outcome: string) {
  const text = outcome.toLowerCase()

  if (/investor|investment|funding|partner|licensing|pilot|customer|sale|deal|contract|enterprise/.test(text)) {
    return 'commercial'
  }

  if (/interview|job|offer|hired|candidate|recruiter/.test(text)) {
    return 'career'
  }

  if (/doctor|medical|appointment|diagnosis|treatment|symptom|medication/.test(text)) {
    return 'medical'
  }

  return 'general'
}

function prioritizeDebriefObservation(kind: string, label: string) {
  if (kind === 'commercial') {
    if (/Future opportunity|Next executable opportunity|Signals surfaced|Concerns surfaced/.test(label)) return 0.18
  }

  if (kind === 'career') {
    if (/What changed|Concerns surfaced|Next executable opportunity/.test(label)) return 0.16
  }

  if (kind === 'medical') {
    if (/Concerns surfaced|Next executable opportunity|What changed/.test(label)) return 0.16
  }

  return 0
}


function deriveBehaviorHypotheses(observations: Array<{label:string;detail:string}>) {
  return observations.map((item) => ({
    type: 'communication_pattern',
    evidence: item.detail,
    hypothesis:
      item.label === 'Signals surfaced'
        ? 'User may benefit from proactive operational support.'
      : item.label === 'Concerns surfaced'
        ? 'User may benefit from earlier risk signaling.'
      : item.label === 'Next executable opportunity'
        ? 'User may benefit from execution-oriented guidance.'
      : 'Additional runtime evidence required before adapting long-term support.',
    confidence: 0.42,
    outcomeRelevant: true,
    futureUseful: true,
  }))
}


function buildOperationalDebrief(params: {
  outcomeReview: LiveOutcomeObservation
  highlights: LiveTranscriptHighlight[]
}): LiveOperationalDebrief {
  const review = params.outcomeReview
  const outcomeKind = desiredOutcomeKind(review.desiredOutcome)
  const signalCount = params.highlights.filter((item) => item.kind === 'signal').length
  const concernCount = params.highlights.filter((item) => item.kind === 'concern').length

  const observations = [
    review.currentState
      ? {
          label: 'What changed',
          detail: review.currentState,
          importance: 0.9,
        }
      : null,
    review.bestAvailablePath
      ? {
          label: 'Next executable opportunity',
          detail: review.bestAvailablePath,
          importance: 0.86,
        }
      : null,
    review.possibleSecondaryOutcome
      ? {
          label: 'Future opportunity',
          detail: review.possibleSecondaryOutcome,
          importance: 0.78,
        }
      : null,
    signalCount
      ? {
          label: 'Signals surfaced',
          detail: `${signalCount} operational signal${signalCount === 1 ? '' : 's'} may help the user move toward the desired outcome.`,
          importance: 0.7,
        }
      : null,
    concernCount
      ? {
          label: 'Concerns surfaced',
          detail: `${concernCount} concern${concernCount === 1 ? '' : 's'} may reduce the user's probability unless handled carefully.`,
          importance: 0.68,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item)).map((item) => ({
    ...item,
    importance: item.importance + prioritizeDebriefObservation(outcomeKind, item.label),
  }))

  observations.sort((a, b) => b.importance - a.importance)

  return {
    summary:
      outcomeKind === 'commercial' && review.bestAvailablePath
        ? review.bestAvailablePath
        : outcomeKind === 'career' && review.currentState
          ? review.currentState
          : outcomeKind === 'medical' && concernCount
            ? 'Important concerns surfaced. GEORGE preserved them for the next preparation.'
            : review.bestAvailablePath ||
              review.currentState ||
              'GEORGE preserved the interaction evidence for future preparation.',
    observations: observations.slice(0, 6),
  }
}

export function buildLiveOutcomeReview(params: {
  desiredOutcome: string
  transcript: string
  supportSummary?: string
  outcomeGovernor?: OutcomeGovernorSnapshot | null
}) {
  return buildLiveOutcomeObservation({
    desiredOutcome: params.desiredOutcome,
    transcript: params.transcript,
    supportSummary: params.supportSummary || '',
    outcomeGovernor: params.outcomeGovernor || null,
  })
}

export function buildLiveInteractionContinuity(params: {
  desiredOutcome: string
  conversationContext: string
  transcript: string
  transcriptEvidenceCount: number
  formulaSelection?: {
    formulaId: string
    formulaVersion: number
    source: "george" | "user"
  } | null
  scriptSelection?: {
    scriptId: string
    scriptVersion: number
    formulaId: string
    formulaVersion: number
    lineCount: number
  } | null
  supportSummary?: string
  outcomeGovernor?: OutcomeGovernorSnapshot | null
  outcomeReview?: LiveOutcomeObservation | null
}) {
  const outcomeReview =
    params.outcomeReview ||
    buildLiveOutcomeReview({
      desiredOutcome: params.desiredOutcome,
      transcript: params.transcript,
      supportSummary: params.supportSummary || '',
      outcomeGovernor: params.outcomeGovernor || null,
    })

  const transcriptHighlights = buildLiveTranscriptHighlights({
    transcript: params.transcript,
    outcomeReview,
  })

  const operationalDebrief = buildOperationalDebrief({
    outcomeReview,
    highlights: transcriptHighlights,
  })

  const behaviorHypotheses = deriveBehaviorHypotheses(
    operationalDebrief.observations
  )

  const opportunityContinuity = buildOpportunityContinuity({
    desiredOutcome: outcomeReview.desiredOutcome,
    transcript: params.transcript,
    outcomeReview,
    transcriptHighlights: transcriptHighlights.map((highlight) => ({
      type: highlight.kind === 'signal' ? 'operational_signal' : 'concern',
      label: highlight.label,
      text: highlight.excerpt,
      whyItMattered: highlight.reason,
      effect: highlight.recommendedUse,
    })),
  })

  const pkg = createConversationPackage({
    desiredOutcome: outcomeReview.desiredOutcome,
    conversationType: 'LIVE',
    conversationContext: params.conversationContext,
    formulaSelection: params.formulaSelection || null,
    conversations: params.transcriptEvidenceCount
      ? [{ type: 'live_transcript_evidence', count: params.transcriptEvidenceCount }]
      : [],
  })

  const learningCandidates = evaluateLearningCandidates({
    desiredOutcome: outcomeReview.desiredOutcome,
    evidenceCandidates: behaviorHypotheses,
  })

  const promotedLearning = promoteLearningCandidates(
    learningCandidates
  )

  const updatedPackage = updateAfterLive(pkg, {
    learning: promotedLearning,
    summary: params.supportSummary
      ? {
          id: 'last-live-summary',
          type: 'live_summary',
          summary: params.supportSummary,
          suggestedNextAction: outcomeReview.bestAvailablePath || '',
        }
      : undefined,
    outcomeReview,
    opportunityContinuity,
  })

  const conversationRecord = buildConversationRecord(updatedPackage)

  return {
    outcomeReview,
    operationalDebrief,
    transcriptHighlights,
    conversationPackage: updatedPackage,
    conversationRecord: {
      ...conversationRecord,
      scriptSelection: params.scriptSelection || null,
      operationalDebrief,
      behaviorHypotheses,
      transcriptHighlights,
    },
  }
}
