import type {
  ConversationRecord,
  OperationalFormula,
  OperationalFormulaStep,
} from './types'

export type OperationalFormulaExtractionOptions = {
  now?: number
  minimumSignalConfidence?: number
  minimumOutcomeConfidence?: number
}

function normalizeType(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function buildFormulaId(input: {
  scope: OperationalFormula['scope']
  ownerId?: string
  roomType?: string
  objectiveType?: string
  steps: OperationalFormulaStep[]
  outcomeType: string
}) {
  const sequence = input.steps
    .map((step) => [step.signalType, step.actionType, step.expectedTransition].filter(Boolean).join('-'))
    .join('__')

  return [
    input.scope,
    input.ownerId,
    input.roomType,
    input.objectiveType,
    sequence,
    input.outcomeType,
  ]
    .filter(Boolean)
    .map((value) => normalizeType(String(value)))
    .join(':')
}

function buildSteps(record: ConversationRecord, minimumSignalConfidence: number) {
  const signals = record.signals
    .filter((signal) => signal.confidence >= minimumSignalConfidence)
    .sort((left, right) => left.at - right.at)

  const interventions = [...record.interventions].sort((left, right) => left.at - right.at)

  return signals.map<OperationalFormulaStep>((signal, index) => {
    const nextSignal = signals[index + 1]
    const intervention = interventions.find((candidate) => {
      const afterSignal = candidate.at >= signal.at
      const beforeNextSignal = !nextSignal || candidate.at < nextSignal.at
      return afterSignal && beforeNextSignal
    })

    return {
      signalType: normalizeType(signal.type),
      actionType: intervention ? normalizeType(intervention.behavior) : undefined,
      expectedTransition: nextSignal ? normalizeType(nextSignal.type) : undefined,
    }
  })
}

export function extractOperationalFormulas(
  record: ConversationRecord,
  options: OperationalFormulaExtractionOptions = {}
): OperationalFormula[] {
  if (!record.endedAt) return []

  const now = options.now ?? Date.now()
  const minimumSignalConfidence = options.minimumSignalConfidence ?? 0.6
  const minimumOutcomeConfidence = options.minimumOutcomeConfidence ?? 0.65
  const steps = buildSteps(record, minimumSignalConfidence)

  if (steps.length === 0) return []

  const outcomes = record.outcomes.filter(
    (outcome) => outcome.confidence >= minimumOutcomeConfidence
  )

  return outcomes.map((outcome) => {
    const roomType = record.roomType ? normalizeType(record.roomType) : undefined
    const objectiveType = record.objective ? normalizeType(record.objective) : undefined
    const outcomeType = normalizeType(outcome.type)
    const scope: OperationalFormula['scope'] = 'personal'
    const ownerId = record.userId

    return {
      id: buildFormulaId({
        scope,
        ownerId,
        roomType,
        objectiveType,
        steps,
        outcomeType,
      }),
      version: 1,
      scope,
      ownerId,
      roomTypes: roomType ? [roomType] : [],
      objectiveTypes: objectiveType ? [objectiveType] : [],
      prerequisites: steps.slice(0, 2).map((step) => step.signalType),
      steps,
      failureConditions: [],
      confidence: outcome.confidence,
      sampleCount: 1,
      successCount: outcome.achieved ? 1 : 0,
      contradictionCount: outcome.achieved ? 0 : 1,
      evidence: [
        {
          conversationId: record.id,
          outcomeType,
          successful: outcome.achieved,
          observedAt: outcome.at ?? record.endedAt,
        },
      ],
      createdAt: now,
      updatedAt: now,
    }
  })
}
