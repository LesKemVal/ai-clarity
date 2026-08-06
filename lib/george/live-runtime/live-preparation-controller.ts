import {
  LIVE_PREPARATION_QUESTIONS,
  resolveLivePreparationReadiness,
  resolveLivePreparationTransition,
  type LivePreparationSignalKey,
} from './live-intent-runtime'
import type { OperationalScript } from '../operational-memory/types'

export type LivePreparationSignals = Record<string, string>

export const PREPARATION_SESSION_VERSION = 1 as const

export type PreparationInteractionStatus =
  | 'answered'
  | 'skipped'
  | 'unknown'

export type PreparationInteraction = {
  key: string
  question: string
  answer: string
  status: PreparationInteractionStatus
}

export type PreparationQuestion = {
  key: string
  label: string
  question: string
  why: string
  example: string
}

export type PreparationCheckpoint =
  | {
      surface: 'briefing'
      phase: 'questions' | 'decision' | 'review'
    }
  | {
      surface: 'strategy'
    }
  | {
      surface: 'ready_room'
      phase: 'brief' | 'mechanics' | 'readiness'
      section?: 'support' | 'formula' | 'ready'
    }

export type PreparationEntrySource =
  | 'homepage'
  | 'traditional'
  | 'quick_live'
  | 'normal'
  | 'resume'

export type PreparationSupportConfiguration = {
  behavior?: 'cue' | 'response'
  receiver?: 'visual_only' | 'audio_only' | 'audio_visual'
  speakingStyle?: string
}

export type PreparationSessionV1 = {
  version: typeof PREPARATION_SESSION_VERSION
  preparationSessionId: string
  provenance: {
    entrySource: PreparationEntrySource
    restoredFrom?: {
      kind: 'preparation' | 'normal_session' | 'live_session'
      id: string
    }
  }
  createdAt: number
  updatedAt: number
  knowledge: {
    objective: string
    name?: string
    role?: string
    participants: string[]
    audience?: string
    perspectives: string[]
    conversation: {
      id?: string
      title?: string
      group?: string
    }
    knownContext?: string
    communicationMedium?: string
    receiverEvidence?: 'visual_only' | 'audio_only' | 'audio_visual'
    acceptableOutcome?: string
    secondaryOutcome?: string
    roomObjective?: string
    additionalSignals: LivePreparationSignals
    documents: Array<{
      id: string
      name: string
      kind: string
      summary?: string
    }>
  }
  briefing: {
    priorInteractions: PreparationInteraction[]
    currentQuestion?: PreparationQuestion
  }
  assets: {
    formula?: {
      id: string
      version: number
      source: 'george' | 'user'
    }
    script?: {
      id: string
      version: number
    }
    customizedScript?: OperationalScript
  }
  support: {
    recommendation?: PreparationSupportConfiguration
    overrides: PreparationSupportConfiguration
    confirmations: {
      briefingReviewed: boolean
      supportAssessmentAgreed: boolean
      receiverConfirmed: boolean
      speakingStyleConfirmed: boolean
      mechanicsConfirmed: boolean
      recoveryAcknowledged: boolean
      readyRoomConfirmed: boolean
    }
    runtimePreferences: {
      pacing?: string
      recoveryOptionIds: string[]
      steeringEnabled?: boolean
      steeringPhrases: string[]
      selectedResources: string[]
    }
  }
  workflow: {
    current: PreparationCheckpoint
    history: PreparationCheckpoint[]
    returnTo?: PreparationCheckpoint
  }
  relations: {
    normalSessionId?: string
    liveSessionId?: string
  }
}

export type CreatePreparationSessionInput = {
  preparationSessionId?: string
  provenance: {
    entrySource: PreparationEntrySource
    restoredFrom?: {
      kind: 'preparation' | 'normal_session' | 'live_session'
      id: string
    }
  }
  createdAt?: number
  updatedAt?: number
  knowledge?: Partial<PreparationSessionV1['knowledge']> & {
    conversation?: PreparationSessionV1['knowledge']['conversation']
  }
  briefing?: {
    priorInteractions?: PreparationInteraction[]
    currentQuestion?: PreparationQuestion | null
  }
  assets?: PreparationSessionV1['assets']
  support?: {
    recommendation?: PreparationSupportConfiguration
    overrides?: PreparationSupportConfiguration
    confirmations?: Partial<PreparationSessionV1['support']['confirmations']>
    runtimePreferences?: Partial<
      PreparationSessionV1['support']['runtimePreferences']
    >
  }
  workflow?: {
    current?: PreparationCheckpoint
    history?: PreparationCheckpoint[]
    returnTo?: PreparationCheckpoint
  }
  relations?: PreparationSessionV1['relations']
}

export type LivePreparationRoute =
  | 'normal'
  | 'live_entry'
  | 'homepage'

export type LivePreparationRouteContext = {
  route: LivePreparationRoute
  conversationTypeId?: string | null
  conversationType?: string | null
  conversationGroup?: string | null
}

function cleanString(value: unknown): string {
  return String(value ?? '').trim()
}

function cleanOptionalString(value: unknown): string | undefined {
  const cleanValue = cleanString(value)
  return cleanValue || undefined
}

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return []

  return Array.from(
    new Set(values.map(cleanString).filter(Boolean)),
  )
}

function normalizeReceiver(
  value: unknown,
): PreparationSupportConfiguration['receiver'] {
  return value === 'visual_only' ||
    value === 'audio_only' ||
    value === 'audio_visual'
    ? value
    : undefined
}

function normalizeSupportBehavior(
  value: unknown,
): PreparationSupportConfiguration['behavior'] {
  if (value === 'response') return 'response'
  if (value === 'cue' || value === 'advice') return 'cue'
  return undefined
}

function normalizeSupportConfiguration(
  value: PreparationSupportConfiguration | null | undefined,
): PreparationSupportConfiguration | undefined {
  if (!value) return undefined

  const configuration = {
    behavior: normalizeSupportBehavior(value.behavior),
    receiver: normalizeReceiver(value.receiver),
    speakingStyle: cleanOptionalString(value.speakingStyle),
  }

  return Object.values(configuration).some(Boolean)
    ? configuration
    : undefined
}

export function normalizePreparationInteractions(
  interactions: PreparationInteraction[] | null | undefined,
): PreparationInteraction[] {
  const normalized = new Map<string, PreparationInteraction>()

  for (const interaction of interactions || []) {
    const key = cleanString(interaction?.key)
    if (!key) continue

    const status: PreparationInteractionStatus =
      interaction.status === 'answered' ||
      interaction.status === 'skipped' ||
      interaction.status === 'unknown'
        ? interaction.status
        : 'unknown'
    const existing = normalized.get(key)

    if (existing?.status === 'answered' && status !== 'answered') continue

    normalized.set(key, {
      key,
      question: cleanString(interaction.question),
      answer: cleanString(interaction.answer),
      status,
    })
  }

  return Array.from(normalized.values())
}

export function buildPreparationInteractions(input: {
  answers?: Record<string, string> | null
  questionHistory?: Record<string, string> | null
  skippedKeys?: string[] | null
}): PreparationInteraction[] {
  const answers = input.answers || {}
  const questionHistory = input.questionHistory || {}
  const answeredKeys = new Set(Object.keys(answers))

  return normalizePreparationInteractions([
    ...Object.entries(answers).map(([key, answer]) => ({
      key,
      question: questionHistory[key] || '',
      answer,
      status: 'answered' as const,
    })),
    ...Array.from(new Set(input.skippedKeys || []))
      .filter((key) => !answeredKeys.has(key))
      .map((key) => ({
        key,
        question: questionHistory[key] || '',
        answer: '',
        status: 'skipped' as const,
      })),
  ])
}

function createPreparationSessionId(createdAt: number): string {
  try {
    return `preparation_${globalThis.crypto.randomUUID()}`
  } catch {
    return `preparation_${createdAt}_${Math.random().toString(36).slice(2)}`
  }
}

export function createPreparationSession(
  input: CreatePreparationSessionInput,
): PreparationSessionV1 {
  const createdAt = Number.isFinite(input.createdAt)
    ? Number(input.createdAt)
    : Date.now()
  const updatedAt = Number.isFinite(input.updatedAt)
    ? Math.max(createdAt, Number(input.updatedAt))
    : createdAt
  const knowledge = input.knowledge || {}
  const support = input.support || {}
  const confirmations = support.confirmations || {}
  const runtimePreferences = support.runtimePreferences || {}
  const recommendation = normalizeSupportConfiguration(
    support.recommendation,
  )
  const overrides = normalizeSupportConfiguration(support.overrides) || {}
  const currentQuestion = input.briefing?.currentQuestion
  const restoredFromId = cleanString(input.provenance.restoredFrom?.id)

  return {
    version: PREPARATION_SESSION_VERSION,
    preparationSessionId:
      cleanString(input.preparationSessionId) ||
      createPreparationSessionId(createdAt),
    provenance: {
      entrySource: input.provenance.entrySource,
      ...(input.provenance.restoredFrom && restoredFromId
        ? {
            restoredFrom: {
              kind: input.provenance.restoredFrom.kind,
              id: restoredFromId,
            },
          }
        : {}),
    },
    createdAt,
    updatedAt,
    knowledge: {
      objective: cleanString(knowledge.objective),
      ...(cleanOptionalString(knowledge.name)
        ? { name: cleanOptionalString(knowledge.name) }
        : {}),
      ...(cleanOptionalString(knowledge.role)
        ? { role: cleanOptionalString(knowledge.role) }
        : {}),
      participants: uniqueStrings(knowledge.participants),
      ...(cleanOptionalString(knowledge.audience)
        ? { audience: cleanOptionalString(knowledge.audience) }
        : {}),
      perspectives: uniqueStrings(knowledge.perspectives),
      conversation: {
        ...(cleanOptionalString(knowledge.conversation?.id)
          ? { id: cleanOptionalString(knowledge.conversation?.id) }
          : {}),
        ...(cleanOptionalString(knowledge.conversation?.title)
          ? { title: cleanOptionalString(knowledge.conversation?.title) }
          : {}),
        ...(cleanOptionalString(knowledge.conversation?.group)
          ? { group: cleanOptionalString(knowledge.conversation?.group) }
          : {}),
      },
      ...(cleanOptionalString(knowledge.knownContext)
        ? { knownContext: cleanOptionalString(knowledge.knownContext) }
        : {}),
      ...(cleanOptionalString(knowledge.communicationMedium)
        ? {
            communicationMedium: cleanOptionalString(
              knowledge.communicationMedium,
            ),
          }
        : {}),
      ...(normalizeReceiver(knowledge.receiverEvidence)
        ? { receiverEvidence: normalizeReceiver(knowledge.receiverEvidence) }
        : {}),
      ...(cleanOptionalString(knowledge.acceptableOutcome)
        ? { acceptableOutcome: cleanOptionalString(knowledge.acceptableOutcome) }
        : {}),
      ...(cleanOptionalString(knowledge.secondaryOutcome)
        ? { secondaryOutcome: cleanOptionalString(knowledge.secondaryOutcome) }
        : {}),
      ...(cleanOptionalString(knowledge.roomObjective)
        ? { roomObjective: cleanOptionalString(knowledge.roomObjective) }
        : {}),
      additionalSignals: normalizeLivePreparationSignals(
        knowledge.additionalSignals,
      ),
      documents: (knowledge.documents || [])
        .map((resource) => {
          const name = cleanString(resource?.name)
          const id = cleanString(resource?.id) || name
          if (!id || !name) return null

          return {
            id,
            name,
            kind: cleanString(resource.kind) || 'file',
            ...(cleanOptionalString(resource.summary)
              ? { summary: cleanOptionalString(resource.summary) }
              : {}),
          }
        })
        .filter(
          (resource): resource is PreparationSessionV1['knowledge']['documents'][number] =>
            Boolean(resource),
        ),
    },
    briefing: {
      priorInteractions: normalizePreparationInteractions(
        input.briefing?.priorInteractions,
      ),
      ...(currentQuestion && cleanString(currentQuestion.key)
        ? {
            currentQuestion: {
              key: cleanString(currentQuestion.key),
              label: cleanString(currentQuestion.label),
              question: cleanString(currentQuestion.question),
              why: cleanString(currentQuestion.why),
              example: cleanString(currentQuestion.example),
            },
          }
        : {}),
    },
    assets: {
      ...(input.assets?.formula
        ? {
            formula: {
              id: cleanString(input.assets.formula.id),
              version: Number(input.assets.formula.version),
              source: input.assets.formula.source,
            },
          }
        : {}),
      ...(input.assets?.script
        ? {
            script: {
              id: cleanString(input.assets.script.id),
              version: Number(input.assets.script.version),
            },
          }
        : {}),
      ...(input.assets?.customizedScript
        ? { customizedScript: input.assets.customizedScript }
        : {}),
    },
    support: {
      ...(recommendation ? { recommendation } : {}),
      overrides,
      confirmations: {
        briefingReviewed: Boolean(confirmations.briefingReviewed),
        supportAssessmentAgreed: Boolean(
          confirmations.supportAssessmentAgreed,
        ),
        receiverConfirmed: Boolean(confirmations.receiverConfirmed),
        speakingStyleConfirmed: Boolean(
          confirmations.speakingStyleConfirmed,
        ),
        mechanicsConfirmed: Boolean(confirmations.mechanicsConfirmed),
        recoveryAcknowledged: Boolean(confirmations.recoveryAcknowledged),
        readyRoomConfirmed: Boolean(confirmations.readyRoomConfirmed),
      },
      runtimePreferences: {
        ...(cleanOptionalString(runtimePreferences.pacing)
          ? { pacing: cleanOptionalString(runtimePreferences.pacing) }
          : {}),
        recoveryOptionIds: uniqueStrings(
          runtimePreferences.recoveryOptionIds,
        ),
        ...(typeof runtimePreferences.steeringEnabled === 'boolean'
          ? { steeringEnabled: runtimePreferences.steeringEnabled }
          : {}),
        steeringPhrases: uniqueStrings(runtimePreferences.steeringPhrases),
        selectedResources: uniqueStrings(runtimePreferences.selectedResources),
      },
    },
    workflow: {
      current: input.workflow?.current || {
        surface: 'briefing',
        phase: 'questions',
      },
      history: input.workflow?.history || [],
      ...(input.workflow?.returnTo
        ? { returnTo: input.workflow.returnTo }
        : {}),
    },
    relations: {
      ...(cleanOptionalString(input.relations?.normalSessionId)
        ? { normalSessionId: cleanOptionalString(input.relations?.normalSessionId) }
        : {}),
      ...(cleanOptionalString(input.relations?.liveSessionId)
        ? { liveSessionId: cleanOptionalString(input.relations?.liveSessionId) }
        : {}),
    },
  }
}

export function normalizePreparationSession(
  value: unknown,
): PreparationSessionV1 | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const session = value as Partial<PreparationSessionV1>
  if (
    session.version !== PREPARATION_SESSION_VERSION ||
    !cleanString(session.preparationSessionId) ||
    !session.provenance ||
    !session.knowledge
  ) {
    return null
  }

  return createPreparationSession({
    preparationSessionId: session.preparationSessionId,
    provenance: session.provenance,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    knowledge: session.knowledge,
    briefing: session.briefing,
    assets: session.assets,
    support: session.support,
    workflow: session.workflow,
    relations: session.relations,
  })
}

export function normalizeLivePreparationSignals(
  signals: Record<string, unknown> | null | undefined,
): LivePreparationSignals {
  const normalized: LivePreparationSignals = {}

  for (const [key, value] of Object.entries(signals || {})) {
    const cleanValue = String(value ?? '').trim()

    if (cleanValue) {
      normalized[key] = cleanValue
    }
  }

  return normalized
}

export function mergeLivePreparationSignal(input: {
  signals: Record<string, unknown> | null | undefined
  key: LivePreparationSignalKey | string
  value: unknown
}): LivePreparationSignals {
  return normalizeLivePreparationSignals({
    ...(input.signals || {}),
    [input.key]: input.value,
  })
}

export function resolveLivePreparationState(
  signals: Record<string, unknown> | null | undefined,
) {
  const normalizedSignals = normalizeLivePreparationSignals(signals)
  const transition = resolveLivePreparationTransition(normalizedSignals)
  const readiness = resolveLivePreparationReadiness(normalizedSignals)
  const activeQuestion = transition.question

  return Object.freeze({
    signals: normalizedSignals,
    transition,
    readiness,
    activeQuestion,
    activeQuestionIndex: activeQuestion
      ? LIVE_PREPARATION_QUESTIONS.findIndex(
          (question) => question.key === activeQuestion.key,
        )
      : LIVE_PREPARATION_QUESTIONS.length,
    canEnterFinalCheck: readiness.thresholdMet,
  })
}

export function resolvePreparationSession(session: PreparationSessionV1) {
  const signals = normalizeLivePreparationSignals({
    ...session.knowledge.additionalSignals,
    name:
      session.knowledge.name ||
      session.knowledge.additionalSignals.name,
    role:
      session.knowledge.role ||
      session.knowledge.additionalSignals.role,
    counterparty:
      session.knowledge.audience ||
      session.knowledge.additionalSignals.counterparty,
    conversationContext:
      session.knowledge.knownContext ||
      session.knowledge.additionalSignals.conversationContext,
    desiredOutcome:
      session.knowledge.objective ||
      session.knowledge.additionalSignals.desiredOutcome,
    acceptableOutcome:
      session.knowledge.acceptableOutcome ||
      session.knowledge.additionalSignals.acceptableOutcome,
    secondaryOutcome:
      session.knowledge.secondaryOutcome ||
      session.knowledge.additionalSignals.secondaryOutcome,
  })
  const preparationState = resolveLivePreparationState(signals)
  const supportConfiguration = Object.freeze({
    ...(session.support.recommendation || {}),
    ...session.support.overrides,
  })

  return Object.freeze({
    session,
    supportConfiguration,
    ...preparationState,
  })
}

export function buildLivePreparationRouteHandoff(input: {
  context: LivePreparationRouteContext
  signals: Record<string, unknown> | null | undefined
  createdAt?: number
}) {
  const preparationState = resolveLivePreparationState(input.signals)

  return Object.freeze({
    sourceRoute: input.context.route,
    conversationTypeId: input.context.conversationTypeId || null,
    conversationType: input.context.conversationType || null,
    conversationGroup: input.context.conversationGroup || null,
    signals: preparationState.signals,
    readiness: preparationState.readiness,
    createdAt: input.createdAt ?? Date.now(),
  })
}
