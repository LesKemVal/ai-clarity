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

export type PreparationQuestionPurpose =
  | 'live_scope_grounding'
  | 'qualification'

export type PreparationInteraction = {
  key: string
  question: string
  example?: string
  answer: string
  status: PreparationInteractionStatus
  evidenceNeed?: string
  purpose?: PreparationQuestionPurpose
}

export type PreparationQuestion = {
  key: string
  label: string
  question: string
  why: string
  example: string
  evidenceNeed?: string
  purpose?: PreparationQuestionPurpose
  clarificationRequired?: boolean
}

export type AdaptivePreparationAssessment = {
  status: 'question' | 'sufficient'
  key?: string
  label?: string
  question?: string
  why?: string
  example?: string
  evidenceNeed?: string
  eligibility?: 'eligible' | 'clarification' | 'duplicate'
}

export type AdaptivePreparationTransition =
  | {
      nextAction: 'ask_question'
      question: PreparationQuestion
      reason: 'material_evidence_gap' | 'consequential_clarification'
    }
  | {
      nextAction: 'invoke_operational_judgment'
      reason:
        | 'evidence_sufficient'
        | 'invalid_question'
        | 'duplicate_evidence_request'
        | 'unauthorized_evidence_request'
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
    baselineAssumptions: string[]
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

export type NormalPreparationConversationMessage = Readonly<{
  role?: 'user' | 'assistant' | 'system' | string
  content?: string | null
  source?: string | null
  presentationMode?: string | null
}>

export type PreparationEvidenceSource =
  | 'current_explicit_user'
  | 'confirmed_preparation_answer'
  | 'qualified_document'
  | 'active_normal_session_metadata'
  | 'persisted_preparation'
  | 'operational_memory'
  | 'inference'

export type PreparationEvidencePrecedence = Readonly<{
  source: PreparationEvidenceSource
  rank: number
  authority: 'user_owned' | 'qualified' | 'provisional'
}>

export const NORMAL_PREPARATION_EVIDENCE_PRECEDENCE = Object.freeze([
  Object.freeze({
    source: 'current_explicit_user' as const,
    rank: 1,
    authority: 'user_owned' as const,
  }),
  Object.freeze({
    source: 'confirmed_preparation_answer' as const,
    rank: 2,
    authority: 'user_owned' as const,
  }),
  Object.freeze({
    source: 'qualified_document' as const,
    rank: 3,
    authority: 'qualified' as const,
  }),
  Object.freeze({
    source: 'active_normal_session_metadata' as const,
    rank: 4,
    authority: 'provisional' as const,
  }),
  Object.freeze({
    source: 'persisted_preparation' as const,
    rank: 5,
    authority: 'provisional' as const,
  }),
  Object.freeze({
    source: 'operational_memory' as const,
    rank: 6,
    authority: 'provisional' as const,
  }),
  Object.freeze({
    source: 'inference' as const,
    rank: 7,
    authority: 'provisional' as const,
  }),
] satisfies readonly PreparationEvidencePrecedence[])

export type NormalPreparationEvidenceProjection = Readonly<{
  preparationSessionId: string
  normalSessionId: string
  entrySource: 'normal'
  preparationUpdatedAt: number
  objective?: string
  acceptableOutcome?: string
  role?: string
  audience?: string
  room?: string
  knownEvidence: readonly string[]
  currentUserEvidence: readonly string[]
  confirmedPreparationEvidence: readonly string[]
  qualifiedDocumentEvidence: readonly string[]
  provisionalPreparationEvidence: readonly string[]
  inferenceEvidence: readonly string[]
  skippedEvidenceNeeds: readonly string[]
  pendingQuestion?: Readonly<{
    key: string
    question: string
    example?: string
    evidenceNeed?: string
  }>
  priorInteractions: readonly Readonly<{
    key: string
    question: string
    example?: string
    answer: string
    status: PreparationInteractionStatus
    evidenceNeed?: string
    purpose?: PreparationQuestionPurpose
  }>[]
  sourcePrecedence: readonly PreparationEvidencePrecedence[]
  evidenceSufficiency: 'unresolved' | 'sufficient'
  signalAcquisitionAllowed: boolean
  formula?: Readonly<{
    id: string
    version: number
    source: 'george' | 'user'
  }>
}>

export type PreparationRuntimeEvidenceAuthority = Readonly<{
  source: PreparationEvidenceSource
  rank: number
  authority: PreparationEvidencePrecedence['authority']
}>

export type PreparationRuntimeEvidenceValue = Readonly<
  PreparationRuntimeEvidenceAuthority & {
    value: string
  }
>

export type PreparationRuntimeQuestionPresentation = Readonly<{
  label?: string
  why?: string
  example?: string
}>

export type PreparationRuntimeInteractionProjection = Readonly<{
  key: string
  question: string
  answer: string
  status: PreparationInteractionStatus
  evidenceNeed?: string
  purpose?: PreparationQuestionPurpose
  answerAuthority?: PreparationRuntimeEvidenceAuthority
  presentation?: PreparationRuntimeQuestionPresentation
}>

export type PreparationRuntimeQuestionProjection = Readonly<{
  key: string
  question: string
  evidenceNeed?: string
  purpose?: PreparationQuestionPurpose
  clarificationRequired?: boolean
  presentation?: PreparationRuntimeQuestionPresentation
}>

export type PreparationRuntimeEvidenceProjection = Readonly<{
  preparationVersion: typeof PREPARATION_SESSION_VERSION
  preparationSessionId: string
  createdAt: number
  updatedAt: number
  provenance: Readonly<{
    entrySource: PreparationEntrySource
    restoredFrom?: Readonly<{
      kind: 'preparation' | 'normal_session' | 'live_session'
      id: string
    }>
  }>
  relations: Readonly<{
    normalSessionId?: string
    liveSessionId?: string
  }>
  knowledge: Readonly<{
    objective?: PreparationRuntimeEvidenceValue
    baselineAssumptions: readonly PreparationRuntimeEvidenceValue[]
    name?: PreparationRuntimeEvidenceValue
    role?: PreparationRuntimeEvidenceValue
    participants: readonly PreparationRuntimeEvidenceValue[]
    audience?: PreparationRuntimeEvidenceValue
    perspectives: readonly PreparationRuntimeEvidenceValue[]
    conversation: Readonly<{
      id?: string
      title?: PreparationRuntimeEvidenceValue
      group?: PreparationRuntimeEvidenceValue
    }>
    knownContext?: PreparationRuntimeEvidenceValue
    communicationMedium?: PreparationRuntimeEvidenceValue
    receiverEvidence?: PreparationRuntimeEvidenceValue
    acceptableOutcome?: PreparationRuntimeEvidenceValue
    secondaryOutcome?: PreparationRuntimeEvidenceValue
    roomObjective?: PreparationRuntimeEvidenceValue
    additionalSignals: Readonly<
      Record<string, PreparationRuntimeEvidenceValue>
    >
    documents: readonly Readonly<{
      id: string
      name: string
      kind: string
      summary?: string
      evidence: PreparationRuntimeEvidenceValue
    }>[]
  }>
  briefing: Readonly<{
    priorInteractions: readonly PreparationRuntimeInteractionProjection[]
    currentQuestion?: PreparationRuntimeQuestionProjection
  }>
  readiness: Readonly<{
    confirmations: Readonly<
      PreparationSessionV1['support']['confirmations']
    >
    workflow: Readonly<{
      current: Readonly<PreparationCheckpoint>
      history: readonly Readonly<PreparationCheckpoint>[]
      returnTo?: Readonly<PreparationCheckpoint>
    }>
  }>
}>

export type ProjectNormalPreparationEvidenceInput = Readonly<{
  session: unknown
  activeNormalSessionId?: string | null
  linkedPreparationSessionId?: string | null
  currentConversation?: readonly NormalPreparationConversationMessage[] | null
  evidenceSufficiency?: 'unresolved' | 'sufficient'
  signalAcquisitionAllowed?: boolean
}>

export type ReconcileNormalPreparationSessionInput = Readonly<{
  existingSession?: unknown
  normalSessionId: string
  activeSessionMetadata?: Readonly<Record<string, unknown>> | null
  signals?: Readonly<Record<string, unknown>> | null
  acceptedObjective?: unknown
  currentConversation?: readonly NormalPreparationConversationMessage[] | null
  briefing?: PreparationSessionV1['briefing']
  checkpoint: PreparationCheckpoint
  updatedAt?: number
}>

const NORMAL_PREPARATION_PLACEHOLDER_OUTCOMES = new Set([
  'in progress',
  'outcome not set',
  'the desired outcome',
  'carry this session into live',
])

function cleanString(value: unknown): string {
  return String(value ?? '').trim()
}

function cleanOptionalString(value: unknown): string | undefined {
  const cleanValue = cleanString(value)
  return cleanValue || undefined
}

export function normalizeExplicitNormalPreparationObjective(value: unknown) {
  const objective = cleanString(value)
  return NORMAL_PREPARATION_PLACEHOLDER_OUTCOMES.has(objective.toLowerCase())
    ? ''
    : objective
}

function normalizeEvidenceField(value: unknown) {
  return cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/^clarify/, '')
}

const PREPARATION_FIELD_ALIASES = Object.freeze({
  objective: new Set([
    'objective',
    'desiredoutcome',
    'intent',
    'conversationintent',
  ]),
  acceptableOutcome: new Set(['acceptableoutcome']),
  role: new Set(['role', 'userrole', 'responsibility']),
  audience: new Set(['audience', 'counterparty']),
  room: new Set(['room', 'conversation', 'interactioncontext']),
  knownContext: new Set(['knowncontext', 'conversationcontext']),
})

type PreparationField = keyof typeof PREPARATION_FIELD_ALIASES

function interactionField(
  interaction: PreparationInteraction,
): PreparationField | null {
  const candidates = [
    normalizeEvidenceField(interaction.key),
    normalizeEvidenceField(interaction.evidenceNeed),
  ].filter(Boolean)

  for (const [field, aliases] of Object.entries(PREPARATION_FIELD_ALIASES)) {
    if (candidates.some((candidate) => aliases.has(candidate))) {
      return field as PreparationField
    }
  }

  return null
}

function latestAnsweredField(
  interactions: readonly PreparationInteraction[],
  field: PreparationField,
) {
  return [...interactions]
    .reverse()
    .find(
      (interaction) =>
        interaction.status === 'answered' &&
        cleanString(interaction.answer) &&
        interactionField(interaction) === field,
    )?.answer
}

function stripGeneratedNormalConversationEvidence(value: unknown) {
  const context = cleanString(value)
  if (!context) return ''

  return context
    .split(
      /\n?Current-session user evidence \(provisional until qualified for LIVE preparation\):\n?/i,
    )[0]
    .trim()
}

function currentNormalUserEvidence(
  messages: readonly NormalPreparationConversationMessage[] | null | undefined,
) {
  return (messages || [])
    .filter(
      (message) =>
        message.role === 'user' &&
        message.presentationMode !== 'live_preparation' &&
        message.source !== 'system_override' &&
        cleanString(message.content),
    )
    .slice(-12)
    .map((message) => cleanString(message.content))
}

function buildPersistedNormalConversationContext(
  messages: readonly NormalPreparationConversationMessage[] | null | undefined,
) {
  const evidence = currentNormalUserEvidence(messages)
    .slice(-8)
    .map((content) => `User: ${content}`)
    .join('\n')
    .slice(0, 2800)
    .trim()

  return evidence
    ? `Current-session user evidence (provisional until qualified for LIVE preparation):\n${evidence}`
    : ''
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
      ...(cleanOptionalString(interaction.example)
        ? { example: cleanOptionalString(interaction.example) }
        : {}),
      answer: cleanString(interaction.answer),
      status,
      ...(cleanOptionalString(interaction.evidenceNeed)
        ? { evidenceNeed: cleanOptionalString(interaction.evidenceNeed) }
        : {}),
      ...(interaction.purpose === 'live_scope_grounding' ||
      interaction.purpose === 'qualification'
        ? { purpose: interaction.purpose }
        : {}),
    })
  }

  return Array.from(normalized.values())
}

function normalizeEvidenceRequest(value: unknown) {
  return cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Canonical preparation progression boundary. Semantic reasoning determines
 * whether a material gap exists and describes that gap; this controller owns
 * only the resulting preparation state transition.
 */
export function resolveAdaptivePreparationTransition(input: {
  assessment: AdaptivePreparationAssessment
  priorInteractions?: PreparationInteraction[] | null
  authorizedEvidenceNeed?: string | null
}): AdaptivePreparationTransition {
  if (input.assessment.status === 'sufficient') {
    return {
      nextAction: 'invoke_operational_judgment',
      reason: 'evidence_sufficient',
    }
  }

  const key = cleanString(input.assessment.key)
  const question = cleanString(input.assessment.question)
  const evidenceNeed = cleanString(
    input.assessment.evidenceNeed || input.assessment.key
  )

  if (!key || !question || !evidenceNeed) {
    return {
      nextAction: 'invoke_operational_judgment',
      reason: 'invalid_question',
    }
  }

  const authorizedEvidenceNeed = normalizeEvidenceRequest(
    input.authorizedEvidenceNeed
  )

  if (
    authorizedEvidenceNeed &&
    normalizeEvidenceRequest(evidenceNeed) !== authorizedEvidenceNeed
  ) {
    return {
      nextAction: 'invoke_operational_judgment',
      reason: 'unauthorized_evidence_request',
    }
  }

  if (input.assessment.eligibility === 'duplicate') {
    return {
      nextAction: 'invoke_operational_judgment',
      reason: 'duplicate_evidence_request',
    }
  }

  const normalizedNeed = normalizeEvidenceRequest(evidenceNeed)
  const duplicateInteraction = normalizePreparationInteractions(
    input.priorInteractions
  ).find((interaction) => {
    const priorNeed = normalizeEvidenceRequest(
      interaction.evidenceNeed || interaction.key || interaction.question
    )
    return priorNeed && priorNeed === normalizedNeed
  })
  const clarificationRequired =
    input.assessment.eligibility === 'clarification'
  const clarificationAllowed = Boolean(
    duplicateInteraction &&
      clarificationRequired &&
      (duplicateInteraction.status === 'answered' ||
        duplicateInteraction.status === 'unknown')
  )

  if (duplicateInteraction && !clarificationAllowed) {
    return {
      nextAction: 'invoke_operational_judgment',
      reason: 'duplicate_evidence_request',
    }
  }

  return {
    nextAction: 'ask_question',
    question: {
      key,
      label: cleanString(input.assessment.label) || 'Additional signal',
      question,
      why: cleanString(input.assessment.why),
      example: cleanString(input.assessment.example),
      evidenceNeed,
      ...(clarificationRequired ? { clarificationRequired: true } : {}),
    },
    reason: clarificationRequired
      ? 'consequential_clarification'
      : 'material_evidence_gap',
  }
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
      baselineAssumptions: uniqueStrings(knowledge.baselineAssumptions),
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
              ...(cleanOptionalString(currentQuestion.evidenceNeed)
                ? {
                    evidenceNeed: cleanOptionalString(
                      currentQuestion.evidenceNeed,
                    ),
                  }
                : {}),
              ...(currentQuestion.purpose === 'live_scope_grounding' ||
              currentQuestion.purpose === 'qualification'
                ? { purpose: currentQuestion.purpose }
                : {}),
              ...(currentQuestion.clarificationRequired
                ? { clarificationRequired: true }
                : {}),
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

/**
 * Canonical Normal preparation reconciliation. Callers provide current raw
 * sources; this owner applies their precedence and returns one normalized
 * PreparationSessionV1 without assigning operational meaning to the result.
 */
export function reconcileNormalPreparationSession(
  input: ReconcileNormalPreparationSessionInput,
): PreparationSessionV1 | null {
  const normalSessionId = cleanString(input.normalSessionId)
  if (!normalSessionId) return null

  const candidate = normalizePreparationSession(input.existingSession)
  const existingSession =
    candidate?.provenance.entrySource === 'normal' &&
    candidate.relations.normalSessionId === normalSessionId
      ? candidate
      : null
  const metadata = input.activeSessionMetadata || {}
  const normalizedSignals = normalizeLivePreparationSignals(input.signals)
  const briefing = input.briefing || existingSession?.briefing || {
    priorInteractions: [],
  }
  const priorInteractions = normalizePreparationInteractions(
    briefing.priorInteractions,
  )
  const acceptedObjective = normalizeExplicitNormalPreparationObjective(
    input.acceptedObjective,
  )
  const answeredObjective = normalizeExplicitNormalPreparationObjective(
    latestAnsweredField(priorInteractions, 'objective'),
  )
  const metadataObjective = normalizeExplicitNormalPreparationObjective(
    metadata.desiredOutcome,
  )
  const objective =
    acceptedObjective ||
    answeredObjective ||
    metadataObjective ||
    normalizeExplicitNormalPreparationObjective(
      existingSession?.knowledge.objective,
    )
  const inferredDirection =
    !objective && normalizedSignals.desiredOutcome
      ? normalizedSignals.desiredOutcome
      : ''
  const answeredRole = cleanString(
    latestAnsweredField(priorInteractions, 'role'),
  )
  const answeredAudience = cleanString(
    latestAnsweredField(priorInteractions, 'audience'),
  )
  const answeredKnownContext = cleanString(
    latestAnsweredField(priorInteractions, 'knownContext'),
  )
  const answeredAcceptableOutcome = cleanString(
    latestAnsweredField(priorInteractions, 'acceptableOutcome'),
  )
  const answeredRoom = cleanString(
    latestAnsweredField(priorInteractions, 'room'),
  )
  const role = cleanString(
    answeredRole ||
      normalizedSignals.role ||
      metadata.role ||
      metadata.responsibility ||
      existingSession?.knowledge.role,
  )
  const audience = cleanString(
    answeredAudience ||
      normalizedSignals.counterparty ||
      normalizedSignals.audience ||
      metadata.targetAudience ||
      metadata.audience ||
      existingSession?.knowledge.audience,
  )
  const currentConversationContext = cleanString(
    answeredKnownContext || normalizedSignals.conversationContext,
  )
  const priorPersistedContext = currentConversationContext
    ? ''
    : stripGeneratedNormalConversationEvidence(
        existingSession?.knowledge.knownContext,
      )
  const currentSessionUserEvidence = buildPersistedNormalConversationContext(
    input.currentConversation,
  )
  const knownContext = Array.from(
    new Set(
      [
        currentConversationContext,
        priorPersistedContext,
        inferredDirection ? `Proposed outcome: ${inferredDirection}` : '',
        currentSessionUserEvidence,
      ]
        .map(cleanString)
        .filter(Boolean),
    ),
  ).join('\n')
  const canonicalSignals = normalizeLivePreparationSignals({
    ...(existingSession?.knowledge.additionalSignals || {}),
    ...normalizedSignals,
    ...(answeredRole ? { role: answeredRole } : {}),
    ...(answeredAudience ? { counterparty: answeredAudience } : {}),
    ...(answeredKnownContext
      ? { conversationContext: answeredKnownContext }
      : {}),
    ...(answeredAcceptableOutcome
      ? { acceptableOutcome: answeredAcceptableOutcome }
      : {}),
  })

  if (objective) {
    canonicalSignals.desiredOutcome = objective
    delete canonicalSignals.proposedOutcome
  } else {
    delete canonicalSignals.desiredOutcome
    if (inferredDirection) {
      canonicalSignals.proposedOutcome = inferredDirection
    }
  }

  const previousCheckpoint = existingSession?.workflow.current
  const checkpointChanged = Boolean(
    previousCheckpoint &&
      JSON.stringify(previousCheckpoint) !== JSON.stringify(input.checkpoint),
  )
  const checkpointHistory = existingSession
    ? [
        ...existingSession.workflow.history,
        ...(checkpointChanged && previousCheckpoint ? [previousCheckpoint] : []),
      ]
    : []

  return createPreparationSession({
    preparationSessionId: existingSession?.preparationSessionId,
    provenance:
      existingSession?.provenance || {
        entrySource: 'normal',
        restoredFrom: {
          kind: 'normal_session',
          id: normalSessionId,
        },
      },
    createdAt: existingSession?.createdAt,
    updatedAt: input.updatedAt,
    knowledge: {
      objective,
      baselineAssumptions:
        existingSession?.knowledge.baselineAssumptions || [],
      name: existingSession?.knowledge.name,
      role,
      participants: audience
        ? [audience]
        : existingSession?.knowledge.participants || [],
      audience,
      perspectives: existingSession?.knowledge.perspectives || [],
      conversation: {
        id: normalSessionId,
        title: cleanString(
          answeredRoom ||
            metadata.conversationType ||
            metadata.room ||
            existingSession?.knowledge.conversation.title,
        ),
        group: existingSession?.knowledge.conversation.group,
      },
      knownContext,
      communicationMedium:
        normalizedSignals.communicationMedium ||
        existingSession?.knowledge.communicationMedium,
      receiverEvidence: existingSession?.knowledge.receiverEvidence,
      acceptableOutcome:
        answeredAcceptableOutcome ||
        normalizedSignals.acceptableOutcome ||
        existingSession?.knowledge.acceptableOutcome,
      secondaryOutcome:
        normalizedSignals.secondaryOutcome ||
        normalizedSignals.fallbackOutcome ||
        existingSession?.knowledge.secondaryOutcome,
      roomObjective: existingSession?.knowledge.roomObjective,
      additionalSignals: canonicalSignals,
      documents: existingSession?.knowledge.documents || [],
    },
    briefing: {
      priorInteractions,
      currentQuestion: briefing.currentQuestion,
    },
    assets: existingSession?.assets,
    support: existingSession?.support || { overrides: {} },
    workflow: {
      current: input.checkpoint,
      history: checkpointHistory,
      ...(existingSession?.workflow.returnTo
        ? { returnTo: existingSession.workflow.returnTo }
        : {}),
    },
    relations: {
      ...existingSession?.relations,
      normalSessionId,
    },
  })
}

function preparationEvidenceLabel(
  interaction: PreparationInteraction,
) {
  return (
    cleanString(interaction.evidenceNeed) ||
    cleanString(interaction.question) ||
    cleanString(interaction.key)
  )
}

type PreparationRuntimeEvidenceSource = Extract<
  PreparationEvidenceSource,
  | 'confirmed_preparation_answer'
  | 'qualified_document'
  | 'persisted_preparation'
  | 'inference'
>

function preparationRuntimeEvidenceAuthority(
  source: PreparationRuntimeEvidenceSource,
): PreparationRuntimeEvidenceAuthority {
  const precedence = NORMAL_PREPARATION_EVIDENCE_PRECEDENCE.find(
    (candidate) => candidate.source === source,
  )

  if (!precedence) {
    throw new Error(`Missing preparation evidence precedence for ${source}.`)
  }

  return Object.freeze({
    source,
    rank: precedence.rank,
    authority: precedence.authority,
  })
}

function preparationRuntimeEvidenceValue(
  value: unknown,
  source: PreparationRuntimeEvidenceSource,
): PreparationRuntimeEvidenceValue {
  return Object.freeze({
    ...preparationRuntimeEvidenceAuthority(source),
    value: cleanString(value),
  })
}

function projectPreparationKnowledgeValue(input: {
  value: unknown
  source?: Exclude<
    PreparationRuntimeEvidenceSource,
    'confirmed_preparation_answer' | 'qualified_document'
  >
}): PreparationRuntimeEvidenceValue | undefined {
  const value = cleanString(input.value)
  if (!value) return undefined

  return preparationRuntimeEvidenceValue(
    value,
    input.source || 'persisted_preparation',
  )
}

function projectPreparationKnowledgeValues(input: {
  values: unknown
  source?: Exclude<
    PreparationRuntimeEvidenceSource,
    'confirmed_preparation_answer' | 'qualified_document'
  >
}): readonly PreparationRuntimeEvidenceValue[] {
  return Object.freeze(
    uniqueStrings(input.values).map((value) =>
      preparationRuntimeEvidenceValue(
        value,
        input.source || 'persisted_preparation',
      ),
    ),
  )
}

function projectPreparationQuestionPresentation(input: {
  label?: unknown
  why?: unknown
  example?: unknown
}): PreparationRuntimeQuestionPresentation | undefined {
  const label = cleanOptionalString(input.label)
  const why = cleanOptionalString(input.why)
  const example = cleanOptionalString(input.example)

  if (!label && !why && !example) return undefined

  return Object.freeze({
    ...(label ? { label } : {}),
    ...(why ? { why } : {}),
    ...(example ? { example } : {}),
  })
}

function freezePreparationCheckpoint(
  checkpoint: PreparationCheckpoint,
): Readonly<PreparationCheckpoint> {
  return Object.freeze({ ...checkpoint })
}

/**
 * Runtime-safe projection of canonical preparation state. This preserves
 * evidence provenance and exact question/answer association without choosing
 * a LIVE move, reinterpreting evidence, or treating presentation as evidence.
 */
export function projectPreparationSessionForLiveRuntime(
  value: unknown,
): PreparationRuntimeEvidenceProjection | null {
  const session = normalizePreparationSession(value)
  if (!session) return null

  const interactions = normalizePreparationInteractions(
    session.briefing.priorInteractions,
  )
  const objective = projectPreparationKnowledgeValue({
    value: session.knowledge.objective,
  })
  const name = projectPreparationKnowledgeValue({
    value: session.knowledge.name,
  })
  const role = projectPreparationKnowledgeValue({
    value: session.knowledge.role,
  })
  const audience = projectPreparationKnowledgeValue({
    value: session.knowledge.audience,
  })
  const conversationTitle = projectPreparationKnowledgeValue({
    value: session.knowledge.conversation.title,
  })
  const conversationGroup = projectPreparationKnowledgeValue({
    value: session.knowledge.conversation.group,
  })
  const knownContext = projectPreparationKnowledgeValue({
    value: session.knowledge.knownContext,
  })
  const communicationMedium = projectPreparationKnowledgeValue({
    value: session.knowledge.communicationMedium,
  })
  const receiverEvidence = projectPreparationKnowledgeValue({
    value: session.knowledge.receiverEvidence,
  })
  const acceptableOutcome = projectPreparationKnowledgeValue({
    value: session.knowledge.acceptableOutcome,
  })
  const secondaryOutcome = projectPreparationKnowledgeValue({
    value: session.knowledge.secondaryOutcome,
  })
  const roomObjective = projectPreparationKnowledgeValue({
    value: session.knowledge.roomObjective,
  })
  const additionalSignals = Object.freeze(
    Object.fromEntries(
      Object.entries(session.knowledge.additionalSignals).map(
        ([key, signalValue]) => [
          key,
          projectPreparationKnowledgeValue({
            value: signalValue,
            source:
              normalizeEvidenceField(key) === 'proposedoutcome'
                ? 'inference'
                : 'persisted_preparation',
          })!,
        ],
      ),
    ),
  )
  const priorInteractions = Object.freeze(
    interactions.map((interaction) => {
      const answer = cleanString(interaction.answer)
      const presentation = projectPreparationQuestionPresentation({
        example: interaction.example,
      })

      return Object.freeze({
        key: interaction.key,
        question: interaction.question,
        answer,
        status: interaction.status,
        ...(interaction.evidenceNeed
          ? { evidenceNeed: interaction.evidenceNeed }
          : {}),
        ...(interaction.purpose ? { purpose: interaction.purpose } : {}),
        ...(interaction.status === 'answered' && answer
          ? {
              answerAuthority: preparationRuntimeEvidenceAuthority(
                'confirmed_preparation_answer',
              ),
            }
          : {}),
        ...(presentation ? { presentation } : {}),
      })
    }),
  )
  const currentQuestion = session.briefing.currentQuestion
  const currentQuestionPresentation = currentQuestion
    ? projectPreparationQuestionPresentation(currentQuestion)
    : undefined

  return Object.freeze({
    preparationVersion: session.version,
    preparationSessionId: session.preparationSessionId,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    provenance: Object.freeze({
      entrySource: session.provenance.entrySource,
      ...(session.provenance.restoredFrom
        ? {
            restoredFrom: Object.freeze({
              ...session.provenance.restoredFrom,
            }),
          }
        : {}),
    }),
    relations: Object.freeze({ ...session.relations }),
    knowledge: Object.freeze({
      ...(objective ? { objective } : {}),
      baselineAssumptions: Object.freeze(
        session.knowledge.baselineAssumptions.map((assumption) =>
          preparationRuntimeEvidenceValue(assumption, 'inference'),
        ),
      ),
      ...(name ? { name } : {}),
      ...(role ? { role } : {}),
      participants: projectPreparationKnowledgeValues({
        values: session.knowledge.participants,
      }),
      ...(audience ? { audience } : {}),
      perspectives: projectPreparationKnowledgeValues({
        values: session.knowledge.perspectives,
      }),
      conversation: Object.freeze({
        ...(session.knowledge.conversation.id
          ? { id: session.knowledge.conversation.id }
          : {}),
        ...(conversationTitle ? { title: conversationTitle } : {}),
        ...(conversationGroup ? { group: conversationGroup } : {}),
      }),
      ...(knownContext ? { knownContext } : {}),
      ...(communicationMedium ? { communicationMedium } : {}),
      ...(receiverEvidence ? { receiverEvidence } : {}),
      ...(acceptableOutcome ? { acceptableOutcome } : {}),
      ...(secondaryOutcome ? { secondaryOutcome } : {}),
      ...(roomObjective ? { roomObjective } : {}),
      additionalSignals,
      documents: Object.freeze(
        session.knowledge.documents.map((evidenceAsset) =>
          Object.freeze({
            id: evidenceAsset.id,
            name: evidenceAsset.name,
            kind: evidenceAsset.kind,
            ...(evidenceAsset.summary
              ? { summary: evidenceAsset.summary }
              : {}),
            evidence: preparationRuntimeEvidenceValue(
              evidenceAsset.summary ||
                `${evidenceAsset.name} (${evidenceAsset.kind})`,
              'qualified_document',
            ),
          }),
        ),
      ),
    }),
    briefing: Object.freeze({
      priorInteractions,
      ...(currentQuestion
        ? {
            currentQuestion: Object.freeze({
              key: currentQuestion.key,
              question: currentQuestion.question,
              ...(currentQuestion.evidenceNeed
                ? { evidenceNeed: currentQuestion.evidenceNeed }
                : {}),
              ...(currentQuestion.purpose
                ? { purpose: currentQuestion.purpose }
                : {}),
              ...(currentQuestion.clarificationRequired
                ? { clarificationRequired: true }
                : {}),
              ...(currentQuestionPresentation
                ? { presentation: currentQuestionPresentation }
                : {}),
            }),
          }
        : {}),
    }),
    readiness: Object.freeze({
      confirmations: Object.freeze({ ...session.support.confirmations }),
      workflow: Object.freeze({
        current: freezePreparationCheckpoint(session.workflow.current),
        history: Object.freeze(
          session.workflow.history.map(freezePreparationCheckpoint),
        ),
        ...(session.workflow.returnTo
          ? {
              returnTo: freezePreparationCheckpoint(
                session.workflow.returnTo,
              ),
            }
          : {}),
      }),
    }),
  })
}

/**
 * Canonical projection from one identity-bound PreparationSessionV1 into
 * runtime evidence. It classifies provenance; it does not choose an
 * operational disposition or infer facts from the evidence.
 */
export function projectNormalPreparationEvidence(
  input: ProjectNormalPreparationEvidenceInput,
): NormalPreparationEvidenceProjection | null {
  const session = normalizePreparationSession(input.session)
  const activeNormalSessionId = cleanString(input.activeNormalSessionId)
  const linkedPreparationSessionId = cleanString(
    input.linkedPreparationSessionId,
  )

  if (
    !session ||
    !activeNormalSessionId ||
    !linkedPreparationSessionId ||
    session.provenance.entrySource !== 'normal' ||
    session.preparationSessionId !== linkedPreparationSessionId ||
    session.relations.normalSessionId !== activeNormalSessionId ||
    (session.knowledge.conversation.id &&
      session.knowledge.conversation.id !== activeNormalSessionId) ||
    (session.provenance.restoredFrom?.kind === 'normal_session' &&
      session.provenance.restoredFrom.id !== activeNormalSessionId)
  ) {
    return null
  }

  const priorInteractions = normalizePreparationInteractions(
    session.briefing.priorInteractions,
  )
  const currentUserEvidence = currentNormalUserEvidence(
    input.currentConversation,
  )
  const confirmedPreparationEvidence = priorInteractions
    .filter(
      (interaction) =>
        interaction.status === 'answered' && cleanString(interaction.answer),
    )
    .map(
      (interaction) =>
        `${preparationEvidenceLabel(interaction)}: ${cleanString(
          interaction.answer,
        )}`,
    )
  const qualifiedDocumentEvidence = session.knowledge.documents
    .map((evidenceAsset) =>
      cleanString(
        evidenceAsset.summary ||
          `${evidenceAsset.name} (${evidenceAsset.kind})`,
      ),
    )
    .filter(Boolean)
  const answeredEvidenceKeys = new Set(
    priorInteractions
      .filter((interaction) => interaction.status === 'answered')
      .flatMap((interaction) => [
        normalizeEvidenceField(interaction.key),
        normalizeEvidenceField(interaction.evidenceNeed),
      ])
      .filter(Boolean),
  )
  const structuredPreparationEvidence = [
    session.knowledge.objective
      ? `Persisted preparation objective: ${session.knowledge.objective}`
      : '',
    session.knowledge.acceptableOutcome
      ? `Persisted acceptable outcome: ${session.knowledge.acceptableOutcome}`
      : '',
    session.knowledge.role
      ? `Persisted user role: ${session.knowledge.role}`
      : '',
    session.knowledge.audience
      ? `Persisted audience or counterparty: ${session.knowledge.audience}`
      : '',
    session.knowledge.conversation.title
      ? `Persisted interaction context: ${session.knowledge.conversation.title}`
      : '',
    stripGeneratedNormalConversationEvidence(session.knowledge.knownContext)
      ? `Persisted preparation context: ${stripGeneratedNormalConversationEvidence(
          session.knowledge.knownContext,
        )}`
      : '',
    ...Object.entries(session.knowledge.additionalSignals)
      .filter(([key]) => {
        const normalizedKey = normalizeEvidenceField(key)
        return (
          normalizedKey !== 'proposedoutcome' &&
          !answeredEvidenceKeys.has(normalizedKey)
        )
      })
      .map(([key, value]) => `Persisted preparation signal ${key}: ${value}`),
  ]
    .map(cleanString)
    .filter(Boolean)
  const provisionalPreparationEvidence = Array.from(
    new Set(structuredPreparationEvidence),
  )
  const inferenceEvidence = Array.from(
    new Set(
      [
        ...session.knowledge.baselineAssumptions,
        session.knowledge.additionalSignals.proposedOutcome,
      ]
        .map(cleanString)
        .filter(Boolean),
    ),
  )
  const skippedEvidenceNeeds = priorInteractions
    .filter((interaction) => interaction.status !== 'answered')
    .map(preparationEvidenceLabel)
    .filter(Boolean)
  const knownEvidence = Array.from(
    new Set([
      ...currentUserEvidence.map((value) => `User explicitly said: ${value}`),
      ...confirmedPreparationEvidence,
      ...qualifiedDocumentEvidence,
    ]),
  )
  const formula = session.assets.formula
  const pendingQuestion = session.briefing.currentQuestion

  return Object.freeze({
    preparationSessionId: session.preparationSessionId,
    normalSessionId: activeNormalSessionId,
    entrySource: 'normal' as const,
    preparationUpdatedAt: session.updatedAt,
    ...(session.knowledge.objective
      ? { objective: session.knowledge.objective }
      : {}),
    ...(session.knowledge.acceptableOutcome
      ? { acceptableOutcome: session.knowledge.acceptableOutcome }
      : {}),
    ...(session.knowledge.role ? { role: session.knowledge.role } : {}),
    ...(session.knowledge.audience
      ? { audience: session.knowledge.audience }
      : {}),
    ...(session.knowledge.conversation.title
      ? { room: session.knowledge.conversation.title }
      : {}),
    knownEvidence: Object.freeze(knownEvidence),
    currentUserEvidence: Object.freeze(currentUserEvidence),
    confirmedPreparationEvidence: Object.freeze(
      confirmedPreparationEvidence,
    ),
    qualifiedDocumentEvidence: Object.freeze(qualifiedDocumentEvidence),
    provisionalPreparationEvidence: Object.freeze(
      provisionalPreparationEvidence,
    ),
    inferenceEvidence: Object.freeze(inferenceEvidence),
    skippedEvidenceNeeds: Object.freeze(skippedEvidenceNeeds),
    ...(pendingQuestion
      ? {
          pendingQuestion: Object.freeze({
            key: pendingQuestion.key,
            question: pendingQuestion.question,
            ...(pendingQuestion.example
              ? { example: pendingQuestion.example }
              : {}),
            ...(pendingQuestion.evidenceNeed
              ? { evidenceNeed: pendingQuestion.evidenceNeed }
              : {}),
          }),
        }
      : {}),
    priorInteractions: Object.freeze(
      priorInteractions.map((interaction) => Object.freeze({ ...interaction })),
    ),
    sourcePrecedence: NORMAL_PREPARATION_EVIDENCE_PRECEDENCE,
    evidenceSufficiency:
      input.evidenceSufficiency === 'sufficient'
        ? 'sufficient'
        : 'unresolved',
    signalAcquisitionAllowed: input.signalAcquisitionAllowed !== false,
    ...(formula?.id && Number.isFinite(formula.version) && formula.version > 0
      ? {
          formula: Object.freeze({
            id: formula.id,
            version: formula.version,
            source: formula.source,
          }),
        }
      : {}),
  })
}

export function preparationEvidenceNeedIsAlreadyKnown(
  projection: NormalPreparationEvidenceProjection,
  evidenceNeed: unknown,
) {
  const normalizedNeed = normalizeEvidenceRequest(evidenceNeed)
  if (!normalizedNeed) return false

  const confirmedInteraction = projection.priorInteractions.some(
    (interaction) => {
      if (interaction.status !== 'answered' || !cleanString(interaction.answer)) {
        return false
      }

      return [interaction.evidenceNeed, interaction.key, interaction.question]
        .map(normalizeEvidenceRequest)
        .filter(Boolean)
        .some(
          (candidate) =>
            candidate === normalizedNeed ||
            candidate.includes(normalizedNeed) ||
            normalizedNeed.includes(candidate),
        )
    },
  )

  if (confirmedInteraction) return true

  return projection.currentUserEvidence
    .map(normalizeEvidenceRequest)
    .some((evidence) => evidence.includes(normalizedNeed))
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
