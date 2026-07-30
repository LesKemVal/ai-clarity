import type {
  ConversationRecord,
  OperationalIntervention,
  OperationalOutcome,
  OperationalSignal,
} from './types'

type ConversationRecordProjection = {
  id?: string
  packageId?: string
  desiredOutcome?: string
  conversationType?: string
  conversationContext?: string
  createdAt?: string | number
  latestOutcome?: {
    observedProgress?: string
    confidence?: number
    desiredOutcome?: string
  } | null
  transcriptHighlights?: TranscriptHighlightProjection[]
  behaviorHypotheses?: BehaviorHypothesisProjection[]
}

type TranscriptHighlightProjection = {
  kind: 'signal' | 'concern'
  label: string
  excerpt: string
}

type BehaviorHypothesisProjection = {
  type?: string
  evidence?: string
  hypothesis?: string
  confidence?: number
}

export type OperationalConversationRecordAdapterInput = {
  record: ConversationRecordProjection
  userId: string
  organizationId?: string
  transcriptHighlights?: TranscriptHighlightProjection[]
  behaviorHypotheses?: BehaviorHypothesisProjection[]
  startedAt?: number
  endedAt?: number
}

function normalizeConfidence(value: unknown, fallback = 0.65) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  if (number > 1) return Math.max(0, Math.min(1, number / 100))
  return Math.max(0, Math.min(1, number))
}

function parseTimestamp(value: string | number | undefined, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function normalizeType(value: unknown, fallback: string) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return normalized || fallback
}

function buildSignals(
  highlights: TranscriptHighlightProjection[],
  hypotheses: BehaviorHypothesisProjection[],
  startedAt: number
): OperationalSignal[] {
  const highlightSignals = highlights.map<OperationalSignal>((highlight, index) => ({
    id: `highlight-${index + 1}`,
    type: normalizeType(highlight.label, highlight.kind),
    at: startedAt + index,
    confidence: highlight.kind === 'signal' ? 0.72 : 0.66,
    evidence: highlight.excerpt,
  }))

  const hypothesisSignals = hypotheses.map<OperationalSignal>((hypothesis, index) => ({
    id: `hypothesis-${index + 1}`,
    type: normalizeType(hypothesis.type || hypothesis.hypothesis, 'communication_pattern'),
    at: startedAt + highlightSignals.length + index,
    confidence: normalizeConfidence(hypothesis.confidence, 0.65),
    evidence: hypothesis.evidence || hypothesis.hypothesis,
  }))

  return [...highlightSignals, ...hypothesisSignals]
}

function buildInterventions(
  hypotheses: BehaviorHypothesisProjection[],
  startedAt: number,
  signalCount: number
): OperationalIntervention[] {
  return hypotheses
    .filter((hypothesis) => Boolean(hypothesis.hypothesis))
    .map((hypothesis, index) => ({
      id: `learning-${index + 1}`,
      behavior: normalizeType(hypothesis.hypothesis, 'operational_adjustment'),
      at: startedAt + Math.min(index, Math.max(0, signalCount - 1)),
    }))
}

function buildOutcomes(
  record: ConversationRecordProjection,
  endedAt: number
): OperationalOutcome[] {
  const latestOutcome = record.latestOutcome
  if (!latestOutcome) return []

  const observedProgress = normalizeType(latestOutcome.observedProgress, 'unknown')

  return [
    {
      type: observedProgress,
      achieved: observedProgress === 'advanced' || observedProgress === 'achieved',
      confidence: normalizeConfidence(latestOutcome.confidence, 0.65),
      at: endedAt,
    },
  ]
}

export function adaptConversationRecordForOperationalMemory(
  input: OperationalConversationRecordAdapterInput
): ConversationRecord {
  const endedAt = input.endedAt ?? Date.now()
  const startedAt = input.startedAt ?? parseTimestamp(input.record.createdAt, endedAt)
  const transcriptHighlights =
    input.transcriptHighlights ??
    input.record.transcriptHighlights ??
    []
  const behaviorHypotheses =
    input.behaviorHypotheses ??
    input.record.behaviorHypotheses ??
    []
  const signals = buildSignals(transcriptHighlights, behaviorHypotheses, startedAt)

  return {
    id: input.record.id || `operational-${input.record.packageId || endedAt}`,
    userId: input.userId,
    organizationId: input.organizationId,
    roomType: input.record.conversationType || 'LIVE',
    objective:
      input.record.desiredOutcome ||
      input.record.latestOutcome?.desiredOutcome ||
      input.record.conversationContext ||
      '',
    startedAt,
    endedAt,
    participants: [
      {
        id: input.userId,
        role: 'user',
        organizationId: input.organizationId,
      },
    ],
    signals,
    interventions: buildInterventions(behaviorHypotheses, startedAt, signals.length),
    outcomes: buildOutcomes(input.record, endedAt),
  }
}
