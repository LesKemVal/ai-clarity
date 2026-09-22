import type { GeorgeOutcomeState } from '@/lib/george/live-voice/runtime/active-outcome'
import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import type { AdaptiveUserProfile } from '@/lib/george/runtime/adaptive-user-profile'
import type { ContinuityRestorationState } from '@/lib/george/runtime/continuity-restoration'
import type { GeorgeIntentState } from '@/lib/george/runtime/intent-state'
import type { JudgmentSurfaceState } from '@/lib/george/runtime/judgment-surface'
import type { LiveRecommendationEvidence } from '@/lib/george/runtime/live-recommendation-governor'
import type { OperationalSignal } from '@/lib/george/runtime/operational-signals'
import type { RuntimeOutcomeSignals } from '@/lib/george/runtime/outcome-learning'
import type { RuntimeSignalArbitration } from '@/lib/george/runtime/runtime-signal-arbitrator'
import type { TrajectoryAssessment } from '@/lib/george/runtime/trajectory-engine'
import { resolveGeorgeConversationStrategy, type GeorgeConversationStrategy } from '@/lib/george/runtime/conversation-strategy'
import {
  NORMAL_PREPARATION_EVIDENCE_PRECEDENCE,
  type PreparationEvidencePrecedence,
  type PreparationRuntimeEvidenceProjection,
} from '@/lib/george/live-runtime/live-preparation-controller'

export type OperationalJudgmentAction =
  | 'warn_and_move'
  | 'restore_continuity'
  | 'acquire_smallest_signal'
  | 'protect_objective'
  | 'execute_live_move'
  | 'advance_outcome'
  | 'clarify_direction'

export type GeorgeOperationalPosture =
  | 'planning'
  | 'preparing'
  | 'execution_imminent'
  | 'recovering'
  | 'executing_live'

export type LiveSupportJudgment = {
  posture: 'none' | 'surface' | 'recommend'
  explainOnRequest: boolean
  strength: 'none' | 'soft' | 'recommend' | 'strong'
  reason: string
  instruction: string
}

export type SignalAcquisitionPurpose =
  | 'live_scope_grounding'
  | 'qualification'

export type SignalAcquisitionJudgment = {
  shouldAcquire: boolean
  operationalValue: 'none' | 'low' | 'medium' | 'high'
  conversationalCost: 'low' | 'medium' | 'high'
  requestedSignal?: string
  purpose?: SignalAcquisitionPurpose
  reason: string
}

export type GeorgeOperationalDisposition =
  | 'execution_ready'
  | 'execution_opportunity'
  | 'continue_normal'
  | 'other_action'
  | 'unresolved'

export const OPERATIONAL_PREPARATION_JUDGMENT_REQUEST =
  'normal_live_operational_judgment' as const

/**
 * Compatibility alias for the existing Normal caller. The wire value is
 * unchanged while the canonical ingress now also accepts homepage
 * preparation provenance.
 */
export const NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST =
  OPERATIONAL_PREPARATION_JUDGMENT_REQUEST

export type OperationalPreparationEntrySource = 'normal' | 'homepage'

export type PreparationTurnClassification =
  | 'live_briefing'
  | 'preparation'
  | 'clarification_required'

export type PreparationTurnClassificationSource = 'explicit' | 'inferred'

export type PreparationTurnClassificationRequest = Readonly<{
  currentClassification: 'live_briefing' | 'preparation'
  explicitSelection: 'live_briefing' | 'preparation' | null
  explicitSelectionProvided: boolean
  malformed: boolean
}>

export type ProviderPreparationTurnClassificationProposal = Readonly<{
  classification: PreparationTurnClassification | null
  clarificationRequired: boolean | null
  mayAffectLivePreparation: boolean | null
  preservePendingQuestion: boolean | null
  reason: string | null
  acknowledgment: string | null
}>

export type OperationalPreparationTurnClassification = Readonly<{
  classification: PreparationTurnClassification
  classificationSource: PreparationTurnClassificationSource
  clarificationRequired: boolean
  mayAffectLivePreparation: boolean
  preservePendingQuestion: boolean
  inferredModeTransition:
    | 'retained'
    | 'switched'
    | 'clarification_required'
    | 'not_applicable'
  reason: string
  acknowledgment: string | null
  providerProposalAccepted: boolean
  authority: 'operational_judgment'
}>

export type OperationalPreparationTurnRealizationAuthorization =
  | Readonly<{
      action: 'respond_to_preparation'
      providerExecutionAuthorized: true
      directCanonicalPresentationAuthorized: false
      assessLiveBriefing: false
      mayAffectLivePreparation: false
      preservePendingQuestion: true
      source: 'operational_judgment'
    }>
  | Readonly<{
      action: 'direct_canonical_clarification'
      providerExecutionAuthorized: false
      directCanonicalPresentationAuthorized: true
      assessLiveBriefing: false
      mayAffectLivePreparation: false
      preservePendingQuestion: true
      source: 'operational_judgment'
    }>
  | Readonly<{
      action: 'assess_live_briefing'
      providerExecutionAuthorized: false
      directCanonicalPresentationAuthorized: false
      assessLiveBriefing: true
      mayAffectLivePreparation: true
      preservePendingQuestion: boolean
      source: 'operational_judgment'
    }>

export const PREPARATION_TURN_CLARIFICATION =
  'Should I use that to shape your LIVE briefing, or are we discussing preparation?' as const

export type OperationalPreparationContext = Readonly<{
  preparationSessionId: string
  normalSessionId?: string
  entrySource: OperationalPreparationEntrySource
  preparationEvidenceProjection?: PreparationRuntimeEvidenceProjection
  preparationProvenance: Readonly<{
    entrySource: OperationalPreparationEntrySource
    restoredFrom?: Readonly<{
      kind: 'preparation' | 'normal_session' | 'live_session'
      id: string
    }>
  }>
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
    status: 'answered' | 'skipped' | 'unknown'
    evidenceNeed?: string
    purpose?: SignalAcquisitionPurpose
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

export type ProviderOperationalReasoning = Readonly<{
  operationalObjective: string | null
  knownEvidence: readonly string[]
  consequentialUncertainty: string | null
  georgeResolvableWork: readonly string[]
  georgeCanAdvanceWithoutUserSignal: boolean
  disposition: Exclude<GeorgeOperationalDisposition, 'unresolved'> | null
  interaction: string | null
  interactionUseful: boolean
  purpose: string | null
  desiredResult: string | null
  liveMateriallyImprovesExecution: boolean
  materialLiveBenefit: string | null
  strongestNextStep: string | null
  rationale: string | null
  presentation: string | null
  decisionComparison?: Readonly<{
    bestActionNow: string | null
    candidateSignal: string | null
    actNowOutcomeImpact: 'none' | 'low' | 'medium' | 'high' | null
    acquireSignalOutcomeImpact: 'none' | 'low' | 'medium' | 'high' | null
    signalInteractionCost: 'none' | 'low' | 'medium' | 'high' | null
    preferredPath: 'act_now' | 'acquire_signal' | null
    bestActionNowExecutableFromKnownEvidence?: boolean
    bestActionNowMissingDependency?: string | null
    reason: string | null
  }>
  signalAcquisition?: Readonly<{
    shouldAcquire: boolean
    requestedSignal: string | null
    purpose: SignalAcquisitionPurpose | null
    evidenceIsUserOwned: boolean
    consequentialToNextAction: boolean
    reason: string | null
  }>
}>

export type CommunicationChangeKind =
  | 'fact'
  | 'substance'
  | 'wording'
  | 'tone'
  | 'timing'
  | 'support_method'
  | 'mixed'
  | 'unclear'

export type CommunicationChangeScope =
  | 'line'
  | 'turn'
  | 'live_room'
  | 'preparation_session'
  | 'durable_candidate'

export type CommunicationChangeSignalSource =
  | 'explicit_user_instruction'
  | 'user_edit'
  | 'repeated_behavior'
  | 'runtime_inference'

export type CommunicationChangeEffects = Readonly<{
  activeObjective: boolean
  factualRecord: boolean
  supportConfiguration: boolean
  realization: boolean
}>

export const SPEECH_COMPOSITION_DIMENSIONS = Object.freeze([
  'perspective',
  'nounSelection',
  'verbConstruction',
  'modifierDensity',
  'syntax',
  'rhythm',
  'figurativeLanguage',
  'implication',
] as const)

export type SpeechCompositionDimension =
  (typeof SPEECH_COMPOSITION_DIMENSIONS)[number]

export type SpeechCompositionValues = Readonly<
  Record<SpeechCompositionDimension, string | null>
>

export type SpeechCompositionDecisionFactor =
  | 'desired_outcome'
  | 'user_role'
  | 'demonstrated_user_fit'
  | 'counterpart_evidence'
  | 'current_moment'
  | 'delivery_constraints'

export type ProtectedCommunicationMeaning = Readonly<{
  objective: boolean
  facts: boolean
  commitments: boolean
  boundaries: boolean
}>

/**
 * Provider-supplied expression proposal.
 *
 * This is evidence, not authority. It describes how meaning may be expressed;
 * it may not silently change what the user means.
 */
export type ProviderSpeechCompositionProposal = Readonly<{
  dimensions: SpeechCompositionValues
  requestedScope: CommunicationChangeScope
  signalSource: CommunicationChangeSignalSource
  confidence: number
  evidence: readonly string[]
  decisionFactors: readonly SpeechCompositionDecisionFactor[]
  protectedMeaning: ProtectedCommunicationMeaning
  reason: string | null
}>

export type OperationalSpeechCompositionJudgment = Readonly<{
  accepted: boolean
  dimensions: SpeechCompositionValues
  requestedScope: CommunicationChangeScope
  acceptedScope: CommunicationChangeScope
  signalSource: CommunicationChangeSignalSource
  confidence: number
  evidence: readonly string[]
  decisionFactors: readonly SpeechCompositionDecisionFactor[]
  clarificationRequired: boolean
  clarificationQuestion: string | null
  protectedMeaning: ProtectedCommunicationMeaning
  durablePersistenceAuthorized: false
  reason: string
  authority: 'operational_judgment'
}>

/**
 * Semantic interpretation supplied by the provider. This is evidence only;
 * Operational Judgment is the sole acceptance and scope authority.
 */
export type ProviderCommunicationChangeProposal = Readonly<{
  kind: CommunicationChangeKind
  requestedScope: CommunicationChangeScope
  signalSource: CommunicationChangeSignalSource
  confidence: number
  evidence: readonly string[]
  clarificationRequired: boolean
  effects: CommunicationChangeEffects
  reason: string | null
}>

export type OperationalCommunicationChangeJudgment = Readonly<{
  accepted: boolean
  kind: CommunicationChangeKind
  requestedScope: CommunicationChangeScope
  acceptedScope: CommunicationChangeScope
  signalSource: CommunicationChangeSignalSource
  confidence: number
  evidence: readonly string[]
  clarificationRequired: boolean
  clarificationQuestion: string | null
  effects: CommunicationChangeEffects
  durablePersistenceAuthorized: false
  reason: string
  authority: 'operational_judgment'
}>

export type ProviderSignalAcquisitionSemanticValidation = Readonly<{
  purpose: SignalAcquisitionPurpose
  evidenceNeed: string
  satisfiesPurpose: boolean
  source: 'provider_semantic_validation'
  liveScopeEvidenceIdentity?: Readonly<{
    anticipatedLiveInteractionAddressed: boolean
    normalContextRelationshipAddressed: boolean
    correctionPathPreserved: boolean
    answerCouldLeaveLiveInteractionUnstated: boolean
    answerCouldBeNormalTaskOrSubjectDetailOnly: boolean
    provisionalHypothesisSpan: string
    alternativeScopeSpan: string
  }>
}>

const providerSignalAcquisitionSemanticValidations = new WeakMap<
  ProviderOperationalReasoning,
  ProviderSignalAcquisitionSemanticValidation
>()

/**
 * Records semantic evidence-purpose validation performed by the canonical
 * provider owner. This is deliberately kept outside provider-authored JSON:
 * a model cannot make an acquisition authoritative by adding another label
 * to its proposal.
 */
export function registerProviderSignalAcquisitionSemanticValidation(
  reasoning: ProviderOperationalReasoning,
  validation: ProviderSignalAcquisitionSemanticValidation
) {
  const acquisition = reasoning.signalAcquisition
  const requestedSignal = cleanOptionalText(acquisition?.requestedSignal)
  const validatedEvidenceNeed = cleanOptionalText(validation.evidenceNeed)
  const liveScopeEvidenceIdentity =
    validation.liveScopeEvidenceIdentity
  const normalizedValidatedEvidenceNeed = normalizeEvidenceNeed(
    validatedEvidenceNeed
  )
  const provisionalHypothesisSpan = cleanOptionalText(
    liveScopeEvidenceIdentity?.provisionalHypothesisSpan
  )
  const alternativeScopeSpan = cleanOptionalText(
    liveScopeEvidenceIdentity?.alternativeScopeSpan
  )
  const normalizedProvisionalHypothesisSpan = normalizeEvidenceNeed(
    provisionalHypothesisSpan
  )
  const normalizedAlternativeScopeSpan = normalizeEvidenceNeed(
    alternativeScopeSpan
  )
  const hypothesisStart = normalizedProvisionalHypothesisSpan
    ? normalizedValidatedEvidenceNeed.indexOf(
        normalizedProvisionalHypothesisSpan
      )
    : -1
  const alternativeStart = normalizedAlternativeScopeSpan
    ? normalizedValidatedEvidenceNeed.indexOf(normalizedAlternativeScopeSpan)
    : -1
  const liveScopeSpansSatisfied = Boolean(
    hypothesisStart >= 0 &&
      alternativeStart >= 0 &&
      normalizedProvisionalHypothesisSpan !==
        normalizedAlternativeScopeSpan &&
      (
        hypothesisStart + normalizedProvisionalHypothesisSpan.length <=
          alternativeStart ||
        alternativeStart + normalizedAlternativeScopeSpan.length <=
          hypothesisStart
      )
  )
  const liveScopeEvidenceIdentitySatisfied = Boolean(
    validation.purpose !== 'live_scope_grounding' ||
      (
        liveScopeEvidenceIdentity?.anticipatedLiveInteractionAddressed ===
          true &&
        liveScopeEvidenceIdentity.normalContextRelationshipAddressed ===
          true &&
        liveScopeEvidenceIdentity.correctionPathPreserved === true &&
        liveScopeEvidenceIdentity.answerCouldLeaveLiveInteractionUnstated ===
          false &&
        liveScopeEvidenceIdentity.answerCouldBeNormalTaskOrSubjectDetailOnly ===
          false &&
        liveScopeSpansSatisfied
      )
  )

  if (
    acquisition?.shouldAcquire !== true ||
    acquisition.purpose !== validation.purpose ||
    validation.satisfiesPurpose !== true ||
    validation.source !== 'provider_semantic_validation' ||
    !requestedSignal ||
    !validatedEvidenceNeed ||
    (validation.purpose === 'live_scope_grounding' &&
      (!provisionalHypothesisSpan || !alternativeScopeSpan)) ||
    !liveScopeEvidenceIdentitySatisfied ||
    normalizeEvidenceNeed(requestedSignal) !==
      normalizeEvidenceNeed(validatedEvidenceNeed)
  ) {
    return false
  }

  providerSignalAcquisitionSemanticValidations.set(
    reasoning,
    Object.freeze({
      purpose: validation.purpose,
      evidenceNeed: validatedEvidenceNeed,
      satisfiesPurpose: true,
      source: 'provider_semantic_validation' as const,
      ...(validation.purpose === 'live_scope_grounding' &&
      liveScopeEvidenceIdentity
        ? {
            liveScopeEvidenceIdentity: Object.freeze({
              anticipatedLiveInteractionAddressed: true,
              normalContextRelationshipAddressed: true,
              correctionPathPreserved: true,
              answerCouldLeaveLiveInteractionUnstated: false,
              answerCouldBeNormalTaskOrSubjectDetailOnly: false,
              provisionalHypothesisSpan: provisionalHypothesisSpan ?? '',
              alternativeScopeSpan: alternativeScopeSpan ?? '',
            }),
          }
        : {}),
    })
  )

  return true
}

export type OperationalDispositionJudgment = Readonly<{
  disposition: GeorgeOperationalDisposition
  operationalObjective: string | null
  knownEvidence: readonly string[]
  consequentialUncertainty: string | null
  georgeResolvableWork: readonly string[]
  georgeCanAdvanceWithoutUserSignal: boolean
  interaction: string | null
  interactionUseful: boolean
  purpose: string | null
  desiredResult: string | null
  liveMateriallyImprovesExecution: boolean
  materialLiveBenefit: string | null
  strongestNextStep: string | null
  reason: string
  presentation: string | null
  providerProposalAccepted: boolean
  source: 'operational_judgment'
}>

export type OperationalRealizationJudgment = Readonly<{
  executionGenerationRequired: boolean
  directPresentationAllowed: boolean
  reason: string
  source: 'operational_judgment'
}>

export type OperationalPreparationReadinessJudgment = Readonly<{
  level: 'insufficient' | 'developing' | 'supportable' | 'sharp'
  minimumLiveSupportEstablished: boolean
  furtherBriefingCouldSharpen: boolean
  sharpeningSignal: string | null
  reason: string
  source: 'operational_judgment'
}>

export type OperationalJudgment = {
  action: OperationalJudgmentAction
  operationalPosture: GeorgeOperationalPosture
  decisionSurface: JudgmentSurfaceState['decisionSurface']
  delivery: RuntimeSignalArbitration['delivery']
  agency: RuntimeSignalArbitration['agency']
  confidence: number
  outcomeState: GeorgeOutcomeState
  conversationStrategy: GeorgeConversationStrategy
  signalAcquisition: SignalAcquisitionJudgment
  smallestSignal?: string
  liveSupport: LiveSupportJudgment
  preparationTurnClassification: OperationalPreparationTurnClassification | null
  preparationTurnRealizationAuthorization: OperationalPreparationTurnRealizationAuthorization | null
  preparationReadiness: OperationalPreparationReadinessJudgment
  communicationChange: OperationalCommunicationChangeJudgment | null
  speechComposition: OperationalSpeechCompositionJudgment | null
  operationalDisposition: OperationalDispositionJudgment
  realization: OperationalRealizationJudgment
  rationale: readonly string[]
  source: 'operational_judgment'
}

export type NormalLiveOperationalJudgmentResult = Readonly<{
  request: typeof NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST
  operationalJudgment: OperationalJudgment
  message: string | null
  authorizedSignalQuestion: Readonly<{
    question: string
    label: string
    why: string
    example: string
    key: string
    evidenceNeed: string
  }> | null
  source: 'operational_judgment'
}>

export type NormalOperationalResponseResult = Readonly<{
  operationalJudgment: OperationalJudgment
  message: string | null
  executionAccepted: boolean
  realization:
    | 'provider_execution'
    | 'canonical_presentation'
    | 'unavailable'
  preAcceptanceProviderTextUsed: false
  source: 'operational_judgment'
}>

export type OperationalJudgmentInput = {
  currentRuntime: CurrentGeorgeRuntime
  intentState: GeorgeIntentState
  runtimeArbitration: RuntimeSignalArbitration
  judgmentSurface: JudgmentSurfaceState
  trajectory: TrajectoryAssessment
  continuityRestoration: ContinuityRestorationState
  outcomeSignals: RuntimeOutcomeSignals
  adaptiveProfile: AdaptiveUserProfile
  liveRecommendationEvidence: LiveRecommendationEvidence
  operationalSignals?: OperationalSignal[]
  outcomeState: GeorgeOutcomeState
  latestUserText: string
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

const EMPTY_COMMUNICATION_CHANGE_EFFECTS: CommunicationChangeEffects =
  Object.freeze({
    activeObjective: false,
    factualRecord: false,
    supportConfiguration: false,
    realization: false,
  })

function normalizeCommunicationEvidence(values: readonly string[]) {
  return Object.freeze(
    Array.from(
      new Set(
        values
          .map((value) => String(value || '').replace(/\s+/g, ' ').trim())
          .filter(Boolean)
      )
    ).slice(0, 8)
  )
}

function normalizeSpeechCompositionValues(
  values: SpeechCompositionValues
): SpeechCompositionValues {
  return Object.freeze(
    Object.fromEntries(
      SPEECH_COMPOSITION_DIMENSIONS.map((dimension) => {
        const value = String(values?.[dimension] || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 240)

        return [dimension, value || null]
      })
    ) as Record<SpeechCompositionDimension, string | null>
  )
}

const SPEECH_COMPOSITION_FACTORS = new Set<SpeechCompositionDecisionFactor>([
  'desired_outcome',
  'user_role',
  'demonstrated_user_fit',
  'counterpart_evidence',
  'current_moment',
  'delivery_constraints',
])

/**
 * Canonical speech-composition acceptance boundary.
 *
 * GEORGE may automatically compose language from qualified evidence, but only
 * Operational Judgment may authorize the plan or its scope. Expression cannot
 * alter the objective, facts, commitments, or boundaries. Acceptance never
 * authorizes durable persistence.
 */
export function resolveSpeechCompositionJudgment(input: {
  proposal: ProviderSpeechCompositionProposal | null
}): OperationalSpeechCompositionJudgment | null {
  const proposal = input.proposal
  if (!proposal) return null

  const confidence = clamp01(Number(proposal.confidence) || 0)
  const evidence = normalizeCommunicationEvidence(proposal.evidence || [])
  const dimensions = normalizeSpeechCompositionValues(proposal.dimensions)
  const populatedDimensionCount = SPEECH_COMPOSITION_DIMENSIONS.filter(
    (dimension) => Boolean(dimensions[dimension])
  ).length
  const decisionFactors = Object.freeze(
    Array.from(
      new Set(
        (proposal.decisionFactors || []).filter((factor) =>
          SPEECH_COMPOSITION_FACTORS.has(factor)
        )
      )
    )
  )
  const protectedMeaning = Object.freeze({
    objective: proposal.protectedMeaning?.objective === true,
    facts: proposal.protectedMeaning?.facts === true,
    commitments: proposal.protectedMeaning?.commitments === true,
    boundaries: proposal.protectedMeaning?.boundaries === true,
  })
  const meaningProtected = Object.values(protectedMeaning).every(Boolean)
  const explicitDirection =
    proposal.signalSource === 'explicit_user_instruction'
  const repeatedQualified =
    proposal.signalSource === 'repeated_behavior' &&
    evidence.length >= 2 &&
    confidence >= 0.68
  const automaticInference =
    proposal.signalSource === 'runtime_inference'
  const automaticFactorsQualified =
    decisionFactors.includes('desired_outcome') &&
    decisionFactors.some((factor) => factor !== 'desired_outcome')
  const automaticEvidenceQualified =
    automaticInference &&
    automaticFactorsQualified &&
    evidence.length >= 2 &&
    confidence >= 0.68
  const directUserEdit = proposal.signalSource === 'user_edit'

  let acceptedScope = proposal.requestedScope

  if (automaticInference || directUserEdit) {
    acceptedScope =
      proposal.requestedScope === 'line' ? 'line' : 'turn'
  }

  if (
    proposal.requestedScope === 'durable_candidate' &&
    !explicitDirection &&
    !repeatedQualified
  ) {
    acceptedScope = 'turn'
  }

  const evidenceSufficient =
    populatedDimensionCount > 0 &&
    evidence.length > 0 &&
    (explicitDirection ||
      repeatedQualified ||
      automaticEvidenceQualified ||
      directUserEdit)

  const clarificationRequired =
    populatedDimensionCount > 0 && !meaningProtected

  const accepted =
    evidenceSufficient &&
    meaningProtected &&
    !clarificationRequired

  const clarificationQuestion = clarificationRequired
    ? 'Should I preserve the objective, facts, commitments, and boundaries and change only how this is expressed?'
    : null

  const reason = clarificationRequired
    ? 'The proposal may alter protected meaning and cannot be treated as expression alone.'
    : !evidenceSufficient
      ? 'The expression proposal lacks sufficient qualified evidence, outcome grounding, or a usable composition dimension.'
      : acceptedScope !== proposal.requestedScope
        ? 'Operational Judgment accepted only a bounded line/turn plan because an isolated edit or inference cannot establish broader behavior.'
        : proposal.requestedScope === 'durable_candidate'
          ? 'The plan may identify a durable candidate, but persistence remains unauthorized and belongs to the existing memory boundary.'
          : 'Operational Judgment accepted a bounded expression plan while preserving the user’s meaning.'

  return Object.freeze({
    accepted,
    dimensions,
    requestedScope: proposal.requestedScope,
    acceptedScope,
    signalSource: proposal.signalSource,
    confidence,
    evidence,
    decisionFactors,
    clarificationRequired,
    clarificationQuestion,
    protectedMeaning,
    durablePersistenceAuthorized: false,
    reason,
    authority: 'operational_judgment' as const,
  })
}

function sanitizeCommunicationChangeEffects(
  proposal: ProviderCommunicationChangeProposal,
  authoritativeSignal: boolean
): CommunicationChangeEffects {
  if (proposal.kind === 'wording') {
    return Object.freeze({
      ...EMPTY_COMMUNICATION_CHANGE_EFFECTS,
      realization: true,
    })
  }

  if (proposal.kind === 'tone' || proposal.kind === 'timing') {
    return Object.freeze({
      ...EMPTY_COMMUNICATION_CHANGE_EFFECTS,
      realization: true,
    })
  }

  if (proposal.kind === 'fact') {
    return Object.freeze({
      ...EMPTY_COMMUNICATION_CHANGE_EFFECTS,
      factualRecord: true,
    })
  }

  if (proposal.kind === 'support_method') {
    return Object.freeze({
      ...EMPTY_COMMUNICATION_CHANGE_EFFECTS,
      supportConfiguration: true,
      realization: true,
    })
  }

  if (proposal.kind === 'substance') {
    return Object.freeze({
      activeObjective:
        authoritativeSignal && proposal.effects.activeObjective === true,
      factualRecord: proposal.effects.factualRecord === true,
      supportConfiguration: false,
      realization: proposal.effects.realization === true,
    })
  }

  if (proposal.kind === 'mixed' && authoritativeSignal) {
    return Object.freeze({
      activeObjective: proposal.effects.activeObjective === true,
      factualRecord: proposal.effects.factualRecord === true,
      supportConfiguration:
        proposal.effects.supportConfiguration === true,
      realization: proposal.effects.realization === true,
    })
  }

  return EMPTY_COMMUNICATION_CHANGE_EFFECTS
}

/**
 * Canonical communication-change acceptance boundary.
 *
 * Provider output proposes meaning. Only this Operational Judgment owner may
 * accept the change, narrow its scope, or require clarification. Acceptance
 * never authorizes durable persistence.
 */
export function resolveCommunicationChangeJudgment(input: {
  proposal: ProviderCommunicationChangeProposal | null
}): OperationalCommunicationChangeJudgment | null {
  const proposal = input.proposal
  if (!proposal) return null

  const confidence = clamp01(Number(proposal.confidence) || 0)
  const evidence = normalizeCommunicationEvidence(proposal.evidence || [])
  const independentEvidenceCount = evidence.length
  const explicitDirection =
    proposal.signalSource === 'explicit_user_instruction'
  const directUserEdit = proposal.signalSource === 'user_edit'
  const repeatedQualified =
    proposal.signalSource === 'repeated_behavior' &&
    independentEvidenceCount >= 2 &&
    confidence >= 0.68
  const isolatedInference =
    proposal.signalSource === 'runtime_inference' ||
    (directUserEdit && independentEvidenceCount < 2)
  const authoritativeSignal =
    explicitDirection || directUserEdit || repeatedQualified

  let acceptedScope = proposal.requestedScope
  if (isolatedInference && !explicitDirection) {
    acceptedScope =
      proposal.requestedScope === 'line' ? 'line' : 'turn'
  }

  if (
    proposal.requestedScope === 'durable_candidate' &&
    !explicitDirection &&
    !repeatedQualified
  ) {
    acceptedScope = 'turn'
  }

  const effects = sanitizeCommunicationChangeEffects(
    proposal,
    authoritativeSignal
  )
  const materiallyChangesMeaning = Boolean(
    proposal.effects.activeObjective ||
      proposal.effects.factualRecord ||
      proposal.effects.supportConfiguration
  )
  const ambiguousMaterialChange =
    (proposal.kind === 'unclear' || proposal.kind === 'mixed') &&
    materiallyChangesMeaning &&
    !authoritativeSignal
  const clarificationRequired = Boolean(
    proposal.clarificationRequired ||
      ambiguousMaterialChange ||
      (confidence < 0.55 && materiallyChangesMeaning)
  )
  const evidenceSufficient = Boolean(
    evidence.length > 0 &&
      (explicitDirection ||
        directUserEdit ||
        repeatedQualified ||
        (proposal.signalSource === 'runtime_inference' && confidence >= 0.6))
  )
  const accepted = Boolean(
    evidenceSufficient &&
      !clarificationRequired &&
      proposal.kind !== 'unclear'
  )

  const reason = clarificationRequired
    ? 'The proposed change could alter meaning or future behavior, and its intended effect is not sufficiently clear.'
    : !evidenceSufficient
      ? 'The proposal lacks qualified evidence for an accepted communication change.'
      : acceptedScope !== proposal.requestedScope
        ? 'Operational Judgment accepted only a bounded line/turn interpretation because isolated inferred behavior cannot establish a broader preference.'
        : proposal.requestedScope === 'durable_candidate'
          ? 'The evidence may identify a durable candidate, but persistence remains unauthorized and belongs to the existing continuity/profile boundary.'
          : 'Operational Judgment accepted the change within the supported scope while preserving unrelated meaning.'
  const clarificationQuestion = !clarificationRequired
    ? null
    : proposal.kind === 'mixed' || proposal.kind === 'unclear'
      ? 'Should I treat that as a factual or substantive change, or only change how it is expressed?'
      : 'Should this change apply only here, or more broadly?'

  return Object.freeze({
    accepted,
    kind: proposal.kind,
    requestedScope: proposal.requestedScope,
    acceptedScope,
    signalSource: proposal.signalSource,
    confidence,
    evidence,
    clarificationRequired,
    clarificationQuestion,
    effects: accepted ? effects : EMPTY_COMMUNICATION_CHANGE_EFFECTS,
    durablePersistenceAuthorized: false,
    reason,
    authority: 'operational_judgment' as const,
  })
}

function classifySignalValue(value: number): SignalAcquisitionJudgment['operationalValue'] {
  if (value >= 0.75) return 'high'
  if (value >= 0.5) return 'medium'
  if (value > 0) return 'low'
  return 'none'
}

function classifySignalCost(value: number): SignalAcquisitionJudgment['conversationalCost'] {
  if (value >= 0.65) return 'high'
  if (value >= 0.35) return 'medium'
  return 'low'
}

export function resolveSignalAcquisitionJudgment(
  input: OperationalJudgmentInput
): SignalAcquisitionJudgment {
  const requestedSignal = String(
    input.judgmentSurface.smallestSignal || ''
  ).trim()

  const operationalValue = clamp01(
    (input.judgmentSurface.shouldAcquireSignal ? 0.45 : 0) +
      (requestedSignal ? 0.2 : 0) +
      (input.intentState.objectiveState === 'clear' ? 0 : 0.2) +
      (input.trajectory.confidence < 0.65 ? 0.15 : 0)
  )

  const conversationalCost = clamp01(
    (input.currentRuntime === 'live_george' ? 0.35 : 0.1) +
      (input.outcomeSignals.overloadDetected >= 0.5 ? 0.35 : 0) +
      (input.runtimeArbitration.delivery === 'structured' ? 0.15 : 0)
  )

  const blockedByHigherPriority =
    input.runtimeArbitration.winner === 'safety_or_damage_risk' ||
    input.runtimeArbitration.winner === 'continuity_restoration'

  const shouldAcquire =
    !blockedByHigherPriority &&
    input.judgmentSurface.shouldAcquireSignal &&
    Boolean(requestedSignal) &&
    operationalValue >= conversationalCost + 0.1

  return {
    shouldAcquire,
    operationalValue: classifySignalValue(operationalValue),
    conversationalCost: classifySignalCost(conversationalCost),
    requestedSignal: requestedSignal || undefined,
    reason: blockedByHigherPriority
      ? 'A higher-priority safety or continuity obligation outranks signal acquisition.'
      : shouldAcquire
        ? 'The missing signal is likely to materially improve judgment or execution at acceptable conversational cost.'
        : !requestedSignal
          ? 'No specific smallest useful signal has been identified.'
          : operationalValue < conversationalCost + 0.1
            ? 'The expected operational value does not justify the conversational cost this turn.'
            : 'Additional signal is not required before the first useful move.',
  }
}

export function resolveOperationalJudgment(
  input: OperationalJudgmentInput
): OperationalJudgment {
  const signalAcquisition = resolveSignalAcquisitionJudgment(input)
  const action = resolveAction(input, signalAcquisition)
  const confidence = clamp01(
    input.trajectory.confidence * 0.45 +
      (input.judgmentSurface.signalSufficiency === 'sufficient' ? 0.35 : 0.12) +
      (input.intentState.objectiveState === 'clear' ? 0.2 : 0.08)
  )

  const conversationStrategy = resolveGeorgeConversationStrategy({
    action,
    currentRuntime: input.currentRuntime,
    latestUserText: input.latestUserText,
    operationalSignals: input.operationalSignals,
    judgmentSurface: input.judgmentSurface,
    trajectory: input.trajectory,
    outcomeState: input.outcomeState,
  })
  const operationalPosture = resolveOperationalPosture({
    currentRuntime: input.currentRuntime,
    executionImminent: input.intentState.executionImminent === true,
    action,
    conversationStrategy,
  })

  return {
    action,
    operationalPosture,
    decisionSurface: input.judgmentSurface.decisionSurface,
    delivery:
      action === 'acquire_smallest_signal' && input.runtimeArbitration.delivery === 'normal'
        ? 'short'
        : input.runtimeArbitration.delivery,
    agency: input.runtimeArbitration.agency,
    confidence,
    outcomeState: input.outcomeState,
    conversationStrategy,
    signalAcquisition,
    smallestSignal:
      signalAcquisition.shouldAcquire
        ? signalAcquisition.requestedSignal
        : undefined,
    liveSupport: resolveLiveSupportJudgment(input.liveRecommendationEvidence),
    preparationTurnClassification: null,
    preparationTurnRealizationAuthorization: null,
    preparationReadiness: Object.freeze({
      level: 'insufficient' as const,
      minimumLiveSupportEstablished: false,
      furtherBriefingCouldSharpen: false,
      sharpeningSignal: null,
      reason:
        'Canonical preparation readiness has not yet been established.',
      source: 'operational_judgment' as const,
    }),
    communicationChange: null,
    speechComposition: null,
    operationalDisposition: unresolvedOperationalDisposition(),
    realization: Object.freeze({
      executionGenerationRequired: false,
      directPresentationAllowed: false,
      reason:
        'Provider semantic reasoning has not yet been canonically resolved.',
      source: 'operational_judgment' as const,
    }),
    rationale: buildRationale(input, action, operationalPosture),
    source: 'operational_judgment',
  }
}

function cleanOptionalText(value: unknown) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return normalized || null
}

function conciseClassificationText(value: unknown, limit: number) {
  const normalized = cleanOptionalText(value)?.replace(/\s+/g, ' ') || null
  return normalized ? normalized.slice(0, limit) : null
}

export function normalizePreparationTurnClassificationRequest(
  value: unknown
): PreparationTurnClassificationRequest {
  const input =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null
  const currentSelection = input?.currentClassification
  const currentClassification =
    currentSelection === 'preparation' ||
    currentSelection === 'live_briefing'
      ? currentSelection
      : 'live_briefing'
  const explicitSelectionFieldPresent = Boolean(
    input &&
      Object.prototype.hasOwnProperty.call(input, 'explicitSelection')
  )
  const explicitSelectionProvided = Boolean(
    explicitSelectionFieldPresent && input?.explicitSelection !== null
  )
  const explicitSelection =
    input?.explicitSelection === 'live_briefing' ||
    input?.explicitSelection === 'preparation'
      ? input.explicitSelection
      : null
  const malformed = Boolean(
    !input ||
      (Object.prototype.hasOwnProperty.call(
        input,
        'currentClassification'
      ) &&
        currentSelection !== 'live_briefing' &&
        currentSelection !== 'preparation') ||
      (explicitSelectionFieldPresent &&
        input?.explicitSelection !== null &&
        !explicitSelection)
  )

  return Object.freeze({
    currentClassification,
    explicitSelection,
    explicitSelectionProvided,
    malformed,
  })
}

function rejectedPreparationTurnClassification(input: {
  classificationSource: PreparationTurnClassificationSource
  reason: string
}): OperationalPreparationTurnClassification {
  return Object.freeze({
    classification: 'clarification_required' as const,
    classificationSource: input.classificationSource,
    clarificationRequired: true,
    mayAffectLivePreparation: false,
    preservePendingQuestion: true,
    inferredModeTransition:
      input.classificationSource === 'inferred'
        ? ('clarification_required' as const)
        : ('not_applicable' as const),
    reason: input.reason,
    acknowledgment: null,
    providerProposalAccepted: false,
    authority: 'operational_judgment' as const,
  })
}

function providerPreparationTurnProposalIsConsistent(
  proposal: ProviderPreparationTurnClassificationProposal | null,
  requiredClassification?: 'live_briefing' | 'preparation'
) {
  const classification = proposal?.classification
  const reason = conciseClassificationText(proposal?.reason, 240)
  if (!classification || !reason) return false
  if (requiredClassification && classification !== requiredClassification) {
    return false
  }

  if (classification === 'live_briefing') {
    return (
      proposal?.clarificationRequired === false &&
      proposal.mayAffectLivePreparation === true &&
      typeof proposal.preservePendingQuestion === 'boolean'
    )
  }

  if (classification === 'preparation') {
    return (
      proposal?.clarificationRequired === false &&
      proposal.mayAffectLivePreparation === false &&
      proposal.preservePendingQuestion === true
    )
  }

  return (
    proposal?.clarificationRequired === true &&
    proposal.mayAffectLivePreparation === false &&
    proposal.preservePendingQuestion === true
  )
}

/**
 * Accepts or rejects the provider's non-authoritative preparation-turn
 * proposal. Explicit user selection establishes intended use; inferred turns
 * fail closed unless the complete proposal is internally consistent.
 */
export function resolvePreparationTurnClassification(input: {
  request: PreparationTurnClassificationRequest
  providerProposal: ProviderPreparationTurnClassificationProposal | null
}): OperationalPreparationTurnClassification {
  const request = input.request

  if (request.malformed) {
    return rejectedPreparationTurnClassification({
      classificationSource: request.explicitSelectionProvided
        ? 'explicit'
        : 'inferred',
      reason:
        'The preparation-turn intent selection was malformed and cannot safely affect LIVE preparation.',
    })
  }

  if (request.explicitSelection) {
    const classification = request.explicitSelection
    const proposalAccepted = providerPreparationTurnProposalIsConsistent(
      input.providerProposal,
      classification
    )
    const preservePendingQuestion =
      classification === 'preparation'
        ? true
        : proposalAccepted
          ? input.providerProposal!.preservePendingQuestion === true
          : true

    return Object.freeze({
      classification,
      classificationSource: 'explicit' as const,
      clarificationRequired: false,
      mayAffectLivePreparation: classification === 'live_briefing',
      preservePendingQuestion,
      inferredModeTransition: 'not_applicable' as const,
      reason:
        classification === 'live_briefing'
          ? 'The user explicitly selected LIVE briefing for this turn.'
          : 'The user explicitly selected Preparation for this turn.',
      acknowledgment: null,
      providerProposalAccepted: proposalAccepted,
      authority: 'operational_judgment' as const,
    })
  }

  if (
    !providerPreparationTurnProposalIsConsistent(input.providerProposal)
  ) {
    return rejectedPreparationTurnClassification({
      classificationSource: 'inferred',
      reason:
        'The provider proposal was missing, malformed, or contradictory, so the turn remains uncommitted.',
    })
  }

  const proposal = input.providerProposal!
  const classification = proposal.classification!
  if (classification === 'clarification_required') {
    return Object.freeze({
      classification,
      classificationSource: 'inferred' as const,
      clarificationRequired: true,
      mayAffectLivePreparation: false,
      preservePendingQuestion: true,
      inferredModeTransition: 'clarification_required' as const,
      reason: conciseClassificationText(proposal.reason, 240)!,
      acknowledgment: null,
      providerProposalAccepted: true,
      authority: 'operational_judgment' as const,
    })
  }

  const inferredModeTransition =
    classification === request.currentClassification
      ? ('retained' as const)
      : ('switched' as const)

  return Object.freeze({
    classification,
    classificationSource: 'inferred' as const,
    clarificationRequired: false,
    mayAffectLivePreparation: classification === 'live_briefing',
    preservePendingQuestion:
      classification === 'preparation' ||
      proposal.preservePendingQuestion === true,
    inferredModeTransition,
    reason: conciseClassificationText(proposal.reason, 240)!,
    acknowledgment:
      inferredModeTransition === 'switched'
        ? classification === 'preparation'
          ? 'I’ll keep this in Preparation.'
          : 'I’ll use that to shape your LIVE briefing.'
        : null,
    providerProposalAccepted: true,
    authority: 'operational_judgment' as const,
  })
}

function resolvePreparationTurnRealizationAuthorization(
  classification: OperationalPreparationTurnClassification | null
): OperationalPreparationTurnRealizationAuthorization | null {
  if (!classification) return null

  if (classification.classification === 'preparation') {
    return Object.freeze({
      action: 'respond_to_preparation' as const,
      providerExecutionAuthorized: true as const,
      directCanonicalPresentationAuthorized: false as const,
      assessLiveBriefing: false as const,
      mayAffectLivePreparation: false as const,
      preservePendingQuestion: true as const,
      source: 'operational_judgment' as const,
    })
  }

  if (classification.classification === 'clarification_required') {
    return Object.freeze({
      action: 'direct_canonical_clarification' as const,
      providerExecutionAuthorized: false as const,
      directCanonicalPresentationAuthorized: true as const,
      assessLiveBriefing: false as const,
      mayAffectLivePreparation: false as const,
      preservePendingQuestion: true as const,
      source: 'operational_judgment' as const,
    })
  }

  return Object.freeze({
    action: 'assess_live_briefing' as const,
    providerExecutionAuthorized: false as const,
    directCanonicalPresentationAuthorized: false as const,
    assessLiveBriefing: true as const,
    mayAffectLivePreparation: true as const,
    preservePendingQuestion: classification.preservePendingQuestion,
    source: 'operational_judgment' as const,
  })
}

function cleanTextList(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return Object.freeze([])

  return Object.freeze(
    Array.from(
      new Set(
        value
          .map(cleanOptionalText)
          .filter((item): item is string => Boolean(item))
      )
    ).slice(0, 12)
  )
}

function normalizeEvidenceNeed(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function buildCanonicalDispositionPresentation(input: {
  disposition: GeorgeOperationalDisposition
  operationalObjective: string | null
  consequentialUncertainty: string | null
  interaction: string | null
  desiredResult: string | null
  materialLiveBenefit: string | null
  reason: string
  strongestNextStep: string | null
  georgeResolvableWork: readonly string[]
}) {
  if (input.disposition === 'unresolved') {
    return null
  }

  const userFacingReason = /\b(provider|canonical|operational judgment)\b/i.test(
    input.reason
  )
    ? ''
    : input.reason
  const executionSubstance =
    input.disposition === 'execution_ready' ||
    input.disposition === 'execution_opportunity'
      ? [
          input.interaction
            ? `The useful interaction is ${input.interaction}.`
            : '',
          input.materialLiveBenefit
            ? `LIVE materially helps by ${input.materialLiveBenefit}.`
            : '',
          input.desiredResult
            ? `The result to move toward is ${input.desiredResult}.`
            : '',
        ]
      : []

  return cleanOptionalText(
    [
      userFacingReason,
      input.georgeResolvableWork[0] || '',
      ...executionSubstance,
      input.strongestNextStep || '',
    ]
      .filter(Boolean)
      .join(' ')
  )
}

function unresolvedOperationalDisposition(): OperationalDispositionJudgment {
  return Object.freeze({
    disposition: 'unresolved',
    operationalObjective: null,
    knownEvidence: Object.freeze([]),
    consequentialUncertainty: null,
    georgeResolvableWork: Object.freeze([]),
    georgeCanAdvanceWithoutUserSignal: false,
    interaction: null,
    interactionUseful: false,
    purpose: null,
    desiredResult: null,
    liveMateriallyImprovesExecution: false,
    materialLiveBenefit: null,
    strongestNextStep: null,
    reason: 'No provider semantic judgment has been resolved by Operational Judgment.',
    presentation: null,
    providerProposalAccepted: false,
    source: 'operational_judgment' as const,
  })
}

/**
 * Applies OpenAI's professional inference as evidence to the canonical
 * Operational Judgment owner. Provider output cannot activate LIVE or become
 * authority merely by existing; this boundary validates the disposition and
 * keeps the user's activation choice intact.
 */
export function resolveProviderOperationalJudgment(input: {
  judgment: OperationalJudgment
  providerReasoning: ProviderOperationalReasoning | null
  providerCommunicationChange?: ProviderCommunicationChangeProposal | null
  providerSpeechComposition?: ProviderSpeechCompositionProposal | null
  providerPreparationTurnClassification?: ProviderPreparationTurnClassificationProposal | null
  preparationTurnClassificationRequest?: PreparationTurnClassificationRequest | null
  providerCapability: 'normal' | 'live' | null
  capabilityExplicitlyRequested: boolean
  capabilityRecommendationMaterial: boolean
  canonicalSignalAcquisition?: boolean
  signalAcquisitionAllowed?: boolean
  operationalJudgmentRequest?: boolean
  ordinaryNormalRequest?: boolean
  liveScopeGroundingRequired?: boolean
}): OperationalJudgment {
  const reasoning = input.providerReasoning
  const communicationChange = resolveCommunicationChangeJudgment({
    proposal: input.providerCommunicationChange || null,
  })
  const speechComposition = resolveSpeechCompositionJudgment({
    proposal: input.providerSpeechComposition || null,
  })
  const preparationTurnClassification =
    input.preparationTurnClassificationRequest
      ? resolvePreparationTurnClassification({
          request: input.preparationTurnClassificationRequest,
          providerProposal:
            input.providerPreparationTurnClassification || null,
        })
      : null
  const preparationTurnRealizationAuthorization =
    resolvePreparationTurnRealizationAuthorization(
      preparationTurnClassification
    )

  if (
    preparationTurnClassification &&
    !preparationTurnClassification.mayAffectLivePreparation
  ) {
    const clarificationRequired =
      preparationTurnClassification.clarificationRequired
    const signalAcquisition = Object.freeze({
      ...input.judgment.signalAcquisition,
      shouldAcquire: false,
      requestedSignal: undefined,
      purpose: undefined,
      reason: clarificationRequired
        ? 'Classification must be clarified before this turn can affect LIVE preparation.'
        : 'Preparation discussion is conversational and excluded from LIVE preparation evidence.',
    })

    return Object.freeze({
      ...input.judgment,
      action: clarificationRequired
        ? ('clarify_direction' as const)
        : input.judgment.action,
      signalAcquisition,
      smallestSignal: undefined,
      preparationTurnClassification,
      preparationTurnRealizationAuthorization,
      communicationChange,
      speechComposition,
      realization: Object.freeze(
        clarificationRequired
          ? {
              executionGenerationRequired: false,
              directPresentationAllowed: true,
              reason:
                'The canonical classification gate requires immediate clarification before any preparation assessment.',
              source: 'operational_judgment' as const,
            }
          : {
              executionGenerationRequired: true,
              directPresentationAllowed: false,
              reason:
                'Canonical Operational Judgment authorized one post-classification conversational realization for the current Preparation turn.',
              source: 'operational_judgment' as const,
            }
      ),
      operationalDisposition: clarificationRequired
        ? Object.freeze({
            ...unresolvedOperationalDisposition(),
            consequentialUncertainty:
              'Whether the user intends this turn to shape LIVE support.',
            reason: preparationTurnClassification.reason,
            presentation: PREPARATION_TURN_CLARIFICATION,
          })
        : Object.freeze({
            ...unresolvedOperationalDisposition(),
            reason:
              'The accepted Preparation turn is authorized for conversational realization only and cannot become operational evidence or judgment.',
          }),
      rationale: Object.freeze([
        ...input.judgment.rationale,
        `preparation turn classification: ${preparationTurnClassification.classification}`,
      ]),
    })
  }

  const operationalJudgmentRequest = Boolean(
    input.operationalJudgmentRequest === true ||
      (
        input.operationalJudgmentRequest === undefined &&
        input.canonicalSignalAcquisition &&
        !input.ordinaryNormalRequest
      )
  )
  const operationalObjective = cleanOptionalText(
    reasoning?.operationalObjective
  )
  const knownEvidence = cleanTextList(reasoning?.knownEvidence)
  const consequentialUncertainty = cleanOptionalText(
    reasoning?.consequentialUncertainty
  )
  const georgeResolvableWork = cleanTextList(
    reasoning?.georgeResolvableWork
  )
  const georgeCanAdvanceWithoutUserSignal =
    reasoning?.georgeCanAdvanceWithoutUserSignal === true
  const proposedDisposition = reasoning?.disposition || null
  const interaction = cleanOptionalText(reasoning?.interaction)
  const interactionUseful = reasoning?.interactionUseful === true
  const purpose = cleanOptionalText(reasoning?.purpose)
  const desiredResult = cleanOptionalText(reasoning?.desiredResult)
  const liveMateriallyImprovesExecution =
    reasoning?.liveMateriallyImprovesExecution === true
  const materialLiveBenefit = cleanOptionalText(
    reasoning?.materialLiveBenefit
  )
  const strongestNextStep = cleanOptionalText(reasoning?.strongestNextStep)
  const providerRationale = cleanOptionalText(reasoning?.rationale)
  const providerPresentation = cleanOptionalText(reasoning?.presentation)
  const requestedSignal = cleanOptionalText(
    reasoning?.signalAcquisition?.requestedSignal
  )
  const signalAcquisitionPurpose =
    reasoning?.signalAcquisition?.purpose === 'live_scope_grounding' ||
    reasoning?.signalAcquisition?.purpose === 'qualification'
      ? reasoning.signalAcquisition.purpose
      : null
  const signalAcquisitionSemanticValidation = reasoning
    ? providerSignalAcquisitionSemanticValidations.get(reasoning) || null
    : null
  const validatedScopeEvidenceNeed = normalizeEvidenceNeed(
    signalAcquisitionSemanticValidation?.evidenceNeed
  )
  const validatedScopeHypothesisSpan = normalizeEvidenceNeed(
    signalAcquisitionSemanticValidation?.liveScopeEvidenceIdentity
      ?.provisionalHypothesisSpan
  )
  const validatedAlternativeScopeSpan = normalizeEvidenceNeed(
    signalAcquisitionSemanticValidation?.liveScopeEvidenceIdentity
      ?.alternativeScopeSpan
  )
  const validatedScopeHypothesisStart = validatedScopeHypothesisSpan
    ? validatedScopeEvidenceNeed.indexOf(validatedScopeHypothesisSpan)
    : -1
  const validatedAlternativeScopeStart = validatedAlternativeScopeSpan
    ? validatedScopeEvidenceNeed.indexOf(validatedAlternativeScopeSpan)
    : -1
  const validatedScopeSpansSatisfied = Boolean(
    validatedScopeHypothesisStart >= 0 &&
      validatedAlternativeScopeStart >= 0 &&
      validatedScopeHypothesisSpan !== validatedAlternativeScopeSpan &&
      (
        validatedScopeHypothesisStart + validatedScopeHypothesisSpan.length <=
          validatedAlternativeScopeStart ||
        validatedAlternativeScopeStart + validatedAlternativeScopeSpan.length <=
          validatedScopeHypothesisStart
      )
  )

  const decisionComparison = reasoning?.decisionComparison
  const comparisonBestActionNow = cleanOptionalText(
    decisionComparison?.bestActionNow
  )
  const comparisonCandidateSignal = cleanOptionalText(
    decisionComparison?.candidateSignal
  )
  const comparisonPreferredPath =
    decisionComparison?.preferredPath || null
  const comparisonBestActionExecutableFromKnownEvidence =
    decisionComparison?.bestActionNowExecutableFromKnownEvidence === true
  const comparisonBestActionMissingDependency = cleanOptionalText(
    decisionComparison?.bestActionNowMissingDependency
  )

  const outcomeImpactRank = {
    none: 0,
    low: 1,
    medium: 2,
    high: 3,
  } as const

  const actNowOutcomeImpact =
    decisionComparison?.actNowOutcomeImpact || null
  const acquireSignalOutcomeImpact =
    decisionComparison?.acquireSignalOutcomeImpact || null

  const actNowImpactRank =
    actNowOutcomeImpact
      ? outcomeImpactRank[actNowOutcomeImpact]
      : -1

  const acquireSignalImpactRank =
    acquireSignalOutcomeImpact
      ? outcomeImpactRank[acquireSignalOutcomeImpact]
      : -1

  const requestedSignalMatchesUncertainty = Boolean(
    requestedSignal &&
      consequentialUncertainty &&
      normalizeEvidenceNeed(requestedSignal) ===
        normalizeEvidenceNeed(consequentialUncertainty)
  )
  const comparisonSignalMatchesUncertainty = Boolean(
    comparisonCandidateSignal &&
      consequentialUncertainty &&
      normalizeEvidenceNeed(comparisonCandidateSignal) ===
        normalizeEvidenceNeed(consequentialUncertainty)
  )

  const comparisonMissingDependencyMatchesSignal = Boolean(
    comparisonBestActionMissingDependency &&
      comparisonCandidateSignal &&
      consequentialUncertainty &&
      requestedSignal &&
      normalizeEvidenceNeed(comparisonBestActionMissingDependency) ===
        normalizeEvidenceNeed(comparisonCandidateSignal) &&
      normalizeEvidenceNeed(comparisonBestActionMissingDependency) ===
        normalizeEvidenceNeed(consequentialUncertainty) &&
      normalizeEvidenceNeed(comparisonBestActionMissingDependency) ===
        normalizeEvidenceNeed(requestedSignal)
  )

  const comparisonSupportsActNow = Boolean(
    comparisonPreferredPath === 'act_now' &&
      comparisonBestActionNow &&
      comparisonBestActionExecutableFromKnownEvidence &&
      !comparisonBestActionMissingDependency &&
      actNowImpactRank > 0 &&
      actNowImpactRank >= acquireSignalImpactRank
  )

  const comparisonSupportsSignalFirst = Boolean(
    comparisonPreferredPath === 'acquire_signal' &&
      !comparisonBestActionExecutableFromKnownEvidence &&
      comparisonSignalMatchesUncertainty &&
      comparisonMissingDependencyMatchesSignal &&
      acquireSignalImpactRank > 0 &&
      acquireSignalImpactRank > actNowImpactRank
  )

  const higherPriorityAction =
    input.judgment.action === 'warn_and_move' ||
    input.judgment.action === 'restore_continuity'
  const normalActionSupported = Boolean(
    operationalObjective &&
      georgeCanAdvanceWithoutUserSignal &&
      georgeResolvableWork.length > 0 &&
      strongestNextStep &&
      comparisonSupportsActNow
  )
  const otherActionSupported = Boolean(
    operationalObjective &&
      georgeCanAdvanceWithoutUserSignal &&
      purpose &&
      desiredResult &&
      strongestNextStep
  )
  const activeLivePreparation = input.operationalJudgmentRequest === true
  const liveExecutionReadinessSupported = Boolean(
    operationalObjective &&
      input.providerCapability === 'live' &&
      interaction &&
      purpose &&
      desiredResult &&
      georgeResolvableWork.length > 0 &&
      georgeCanAdvanceWithoutUserSignal &&
      strongestNextStep
  )
  const proactiveLiveRecommendationSupported = Boolean(
    input.capabilityRecommendationMaterial &&
      interactionUseful &&
      liveMateriallyImprovesExecution &&
      materialLiveBenefit
  )
  const liveExecutionSupported = Boolean(
    liveExecutionReadinessSupported &&
      (
        activeLivePreparation ||
        proactiveLiveRecommendationSupported
      )
  )

  let disposition: GeorgeOperationalDisposition = 'unresolved'
  let reason =
    'Provider reasoning did not establish a valid operational disposition.'
  let providerProposalAccepted = false

  if (higherPriorityAction) {
    disposition = 'other_action'
    reason =
      'A higher-priority safety or continuity obligation governs the next action.'
  } else if (
    (proposedDisposition === 'execution_ready' ||
      proposedDisposition === 'execution_opportunity') &&
    liveExecutionSupported
  ) {
    disposition = proposedDisposition
    providerProposalAccepted = true
    reason =
      providerRationale ||
      (activeLivePreparation
        ? 'Provider reasoning established that the user-selected LIVE interaction is ready to advance.'
        : 'Provider reasoning established a material execution use for LIVE.')
  } else if (
    proposedDisposition === 'continue_normal' &&
    !activeLivePreparation &&
    normalActionSupported
  ) {
    disposition = 'continue_normal'
    providerProposalAccepted = true
    reason =
      providerRationale ||
      'Provider reasoning established that continued Normal work is the strongest move.'
  } else if (
    proposedDisposition === 'other_action' &&
    otherActionSupported
  ) {
    disposition = 'other_action'
    providerProposalAccepted = true
    reason =
      providerRationale ||
      'Provider reasoning established a stronger operational action than entering LIVE.'
  } else if (!activeLivePreparation && normalActionSupported) {
    disposition = 'continue_normal'
    reason =
      proposedDisposition === 'execution_ready' ||
      proposedDisposition === 'execution_opportunity'
        ? 'Canonical Operational Judgment did not accept LIVE because a material execution benefit was not established; current Normal work remains actionable.'
        : 'Canonical Operational Judgment established useful Normal work that can advance without another user interruption.'
  } else if (
    proposedDisposition === 'execution_ready' ||
    proposedDisposition === 'execution_opportunity'
  ) {
    reason =
      activeLivePreparation
        ? 'Canonical Operational Judgment did not yet establish the interaction, desired result, or preparation readiness required to advance the user-selected LIVE interaction.'
        : 'Canonical Operational Judgment did not accept LIVE because the interaction, desired result, or material execution benefit was not established.'
  }

  /*
   * When Normal context has been carried into a newly requested LIVE
   * briefing but LIVE scope has not yet been established by definitive
   * LIVE-scoped user evidence, that relationship is itself the governing
   * uncertainty.
   *
   * Do not validate it by vocabulary. The provider owns semantic inference
   * and question selection; canonical Operational Judgment owns whether
   * downstream acquisition may become authoritative.
   *
   * A scope-grounding turn may acquire one user-owned consequential signal,
   * but it may not simultaneously convert a provisional Normal inference
   * into an established LIVE fact.
   */
  const liveScopeGroundingSatisfied = Boolean(
    !input.liveScopeGroundingRequired ||
      (
        operationalJudgmentRequest &&
        signalAcquisitionPurpose === 'live_scope_grounding' &&
        signalAcquisitionSemanticValidation?.purpose ===
          'live_scope_grounding' &&
        signalAcquisitionSemanticValidation.satisfiesPurpose === true &&
        signalAcquisitionSemanticValidation.liveScopeEvidenceIdentity
          ?.anticipatedLiveInteractionAddressed === true &&
        signalAcquisitionSemanticValidation.liveScopeEvidenceIdentity
          .normalContextRelationshipAddressed === true &&
        signalAcquisitionSemanticValidation.liveScopeEvidenceIdentity
          .correctionPathPreserved === true &&
        signalAcquisitionSemanticValidation.liveScopeEvidenceIdentity
          .answerCouldLeaveLiveInteractionUnstated === false &&
        signalAcquisitionSemanticValidation.liveScopeEvidenceIdentity
          .answerCouldBeNormalTaskOrSubjectDetailOnly === false &&
        validatedScopeSpansSatisfied &&
        consequentialUncertainty &&
        requestedSignal &&
        normalizeEvidenceNeed(
          signalAcquisitionSemanticValidation.evidenceNeed
        ) === normalizeEvidenceNeed(requestedSignal) &&
        reasoning?.signalAcquisition?.shouldAcquire === true &&
        reasoning?.signalAcquisition?.evidenceIsUserOwned === true &&
        reasoning?.signalAcquisition?.consequentialToNextAction === true &&
        requestedSignalMatchesUncertainty &&
        comparisonSupportsSignalFirst
      )
  )

  const providerAuthorizesSignalAcquisition = Boolean(
    input.canonicalSignalAcquisition &&
      input.signalAcquisitionAllowed !== false &&
      !higherPriorityAction &&
      disposition === 'unresolved' &&
      reasoning?.signalAcquisition?.shouldAcquire === true &&
      reasoning?.signalAcquisition?.evidenceIsUserOwned === true &&
      reasoning?.signalAcquisition?.consequentialToNextAction === true &&
      !georgeCanAdvanceWithoutUserSignal &&
      requestedSignalMatchesUncertainty &&
      comparisonSupportsSignalFirst &&
      liveScopeGroundingSatisfied
  )
  const signalAcquisition: SignalAcquisitionJudgment =
    input.canonicalSignalAcquisition
      ? providerAuthorizesSignalAcquisition
        ? {
            shouldAcquire: true,
            operationalValue: 'high',
            conversationalCost:
              input.judgment.signalAcquisition.conversationalCost,
            requestedSignal: requestedSignal || undefined,
            ...(signalAcquisitionPurpose
              ? { purpose: signalAcquisitionPurpose }
              : {}),
            reason:
              cleanOptionalText(reasoning?.signalAcquisition?.reason) ||
              providerRationale ||
              'Provider reasoning established that one consequential user-owned signal is necessary before choosing the strongest operational action.',
          }
        : {
            ...input.judgment.signalAcquisition,
            shouldAcquire: false,
            requestedSignal: undefined,
            reason:
              disposition !== 'unresolved'
                ? 'Canonical Operational Judgment established a stronger operational action without another user interruption.'
                : input.signalAcquisitionAllowed === false
                  ? 'Signal acquisition is unavailable on this reassessment; no stale acquisition authority was preserved.'
                  : 'Provider reasoning did not establish a consequential user-owned evidence need tied to the next operational decision.',
          }
      : input.judgment.signalAcquisition

  const liveSupport: LiveSupportJudgment =
    disposition === 'execution_ready' ||
    disposition === 'execution_opportunity'
      ? {
          posture: 'recommend',
          explainOnRequest: true,
          strength: 'recommend',
          reason,
          instruction:
            'Present the operational benefit naturally, preserve the user’s activation authority, and never auto-route or change operating mode.',
        }
      : {
          ...input.judgment.liveSupport,
          posture: 'none',
          strength: 'none',
          reason,
          instruction:
            disposition === 'continue_normal'
              ? 'Continue the strongest useful work in Normal without manufacturing a reason to use LIVE.'
              : disposition === 'other_action'
                ? 'Advance the stronger operational action identified by GEORGE without forcing LIVE.'
                : input.judgment.liveSupport.instruction,
        }

  const providerDecisionAuthoritative = Boolean(
    input.ordinaryNormalRequest || operationalJudgmentRequest
  )
  const ordinaryNormalAction: OperationalJudgmentAction = higherPriorityAction
    ? input.judgment.action
    : providerAuthorizesSignalAcquisition
      ? 'acquire_smallest_signal'
      : disposition === 'continue_normal' ||
          disposition === 'other_action' ||
          disposition === 'execution_ready' ||
          disposition === 'execution_opportunity'
        ? 'advance_outcome'
        : 'clarify_direction'
  const normalLiveJudgmentAction: OperationalJudgmentAction =
    providerAuthorizesSignalAcquisition
      ? 'acquire_smallest_signal'
      : input.judgment.action === 'acquire_smallest_signal'
        ? disposition === 'execution_ready' ||
          disposition === 'execution_opportunity'
          ? 'execute_live_move'
          : disposition === 'continue_normal' || disposition === 'other_action'
            ? 'advance_outcome'
            : 'clarify_direction'
        : input.judgment.action
  const action: OperationalJudgmentAction = input.ordinaryNormalRequest
    ? ordinaryNormalAction
    : operationalJudgmentRequest
      ? normalLiveJudgmentAction
      : input.judgment.action

  const providerActionFieldsAccepted = Boolean(
    providerProposalAccepted && disposition === proposedDisposition
  )
  const canonicalPriorityPurpose = higherPriorityAction
    ? cleanOptionalText(input.judgment.conversationStrategy.purpose)
    : null
  const canonicalPriorityResult = higherPriorityAction
    ? cleanOptionalText(input.judgment.outcomeState.immediateOutcome)
    : null
  const acceptedPurpose = providerActionFieldsAccepted
    ? purpose
    : higherPriorityAction
      ? canonicalPriorityPurpose
      : disposition === 'continue_normal'
        ? 'Advance the operational objective through GEORGE-resolvable work supported by current evidence.'
        : null
  const acceptedDesiredResult = providerActionFieldsAccepted
    ? desiredResult
    : higherPriorityAction
      ? canonicalPriorityResult
      : disposition === 'continue_normal'
        ? operationalObjective
        : null
  const acceptedStrongestNextStep = providerActionFieldsAccepted
    ? strongestNextStep
    : higherPriorityAction
      ? canonicalPriorityResult || canonicalPriorityPurpose
      : disposition === 'continue_normal'
        ? georgeResolvableWork[0] || null
        : null
  const acceptedLiveDisposition =
    disposition === 'execution_ready' ||
    disposition === 'execution_opportunity'
  const acceptedInteraction = acceptedLiveDisposition ? interaction : null
  const acceptedInteractionUseful = acceptedLiveDisposition
    ? interactionUseful
    : false
  const acceptedLiveMateriallyImprovesExecution = acceptedLiveDisposition
    ? liveMateriallyImprovesExecution
    : false
  const acceptedMaterialLiveBenefit = acceptedLiveDisposition
    ? materialLiveBenefit
    : null

  const acceptedPresentation =
    providerActionFieldsAccepted &&
    providerPresentation
      ? providerPresentation
      : buildCanonicalDispositionPresentation({
          disposition,
          operationalObjective,
          consequentialUncertainty,
          interaction: acceptedInteraction,
          desiredResult: acceptedDesiredResult,
          materialLiveBenefit: acceptedMaterialLiveBenefit,
          reason,
          strongestNextStep: acceptedStrongestNextStep,
          georgeResolvableWork,
        })
  const outcomeState = operationalObjective
    ? Object.freeze({
        ...input.judgment.outcomeState,
        primaryOutcome: operationalObjective,
        immediateOutcome:
          acceptedStrongestNextStep ||
          input.judgment.outcomeState.immediateOutcome,
        confidence: Math.max(input.judgment.outcomeState.confidence, 0.72),
        stability: Math.max(
          input.judgment.outcomeState.stability || 0,
          0.72
        ),
      })
    : input.judgment.outcomeState
  const executionGenerationRequired = Boolean(input.ordinaryNormalRequest)
  const directPresentationAllowed = Boolean(
    !executionGenerationRequired &&
      disposition !== 'unresolved' &&
      acceptedPresentation
  )
  const preparationReadiness: OperationalPreparationReadinessJudgment =
    !operationalJudgmentRequest
      ? input.judgment.preparationReadiness
      : disposition === 'execution_ready' && providerProposalAccepted
        ? Object.freeze({
            level: comparisonCandidateSignal
              ? ('supportable' as const)
              : ('sharp' as const),
            minimumLiveSupportEstablished: true,
            furtherBriefingCouldSharpen: Boolean(
              comparisonCandidateSignal
            ),
            sharpeningSignal: comparisonCandidateSignal,
            reason: comparisonCandidateSignal
              ? 'Canonical Operational Judgment established enough evidence for useful LIVE support while preserving one additional user-owned signal that could sharpen execution.'
              : 'Canonical Operational Judgment established useful LIVE support and identified no additional user-owned signal that would materially sharpen execution.',
            source: 'operational_judgment' as const,
          })
        : Object.freeze({
            level:
              providerAuthorizesSignalAcquisition ||
              Boolean(operationalObjective) ||
              knownEvidence.length > 0
                ? ('developing' as const)
                : ('insufficient' as const),
            minimumLiveSupportEstablished: false,
            furtherBriefingCouldSharpen: false,
            sharpeningSignal: null,
            reason: providerAuthorizesSignalAcquisition
              ? 'One consequential user-owned signal is still required before minimum LIVE support can be established.'
              : 'Canonical Operational Judgment has not established enough evidence for useful LIVE support.',
            source: 'operational_judgment' as const,
          })

  const realization: OperationalRealizationJudgment =
    providerDecisionAuthoritative
      ? Object.freeze({
          executionGenerationRequired,
          directPresentationAllowed,
          reason: executionGenerationRequired
            ? providerAuthorizesSignalAcquisition
              ? 'The accepted consequential evidence need requires one execution-generated user question.'
              : disposition === 'unresolved'
                ? 'The accepted unresolved judgment requires provider execution to present its current boundary without inventing an action or evidence need.'
                : 'The accepted operational action requires provider execution to perform or realize the work.'
            : disposition === 'unresolved'
              ? 'The unresolved judgment remains internal until canonical realization produces an authorized user-facing move.'
              : operationalJudgmentRequest
                ? 'The Normal LIVE control-plane judgment is presented directly from the accepted canonical disposition.'
                : 'The accepted judgment itself completes the available response without additional provider execution.',
          source: 'operational_judgment' as const,
        })
      : input.judgment.realization

  return Object.freeze({
    ...input.judgment,
    action,
    outcomeState,
    signalAcquisition,
    smallestSignal: signalAcquisition.shouldAcquire
      ? signalAcquisition.requestedSignal
      : undefined,
    liveSupport,
    preparationTurnClassification,
    preparationTurnRealizationAuthorization,
    preparationReadiness,
    communicationChange,
    speechComposition,
    realization,
    operationalDisposition: Object.freeze({
      disposition,
      operationalObjective,
      knownEvidence,
      consequentialUncertainty,
      georgeResolvableWork,
      georgeCanAdvanceWithoutUserSignal,
      interaction: acceptedInteraction,
      interactionUseful: acceptedInteractionUseful,
      purpose: acceptedPurpose,
      desiredResult: acceptedDesiredResult,
      liveMateriallyImprovesExecution:
        acceptedLiveMateriallyImprovesExecution,
      materialLiveBenefit: acceptedMaterialLiveBenefit,
      strongestNextStep: acceptedStrongestNextStep,
      reason,
      presentation: acceptedPresentation,
      providerProposalAccepted,
      source: 'operational_judgment' as const,
    }),
    rationale: Object.freeze([
      ...input.judgment.rationale,
      `provider-informed disposition: ${disposition}`,
    ]),
  })
}

export function buildNormalOperationalResponseResult(input: {
  operationalJudgment: OperationalJudgment
  executionText?: string | null
  authorizedSignalQuestion?: boolean
  governedProviderExecution?: boolean
}): NormalOperationalResponseResult {
  const executionText = cleanOptionalText(input.executionText)
  const canonicalPresentation = cleanOptionalText(
    input.operationalJudgment.operationalDisposition.presentation
  )
  const preparationRealization =
    input.operationalJudgment.preparationTurnRealizationAuthorization
  const preparationConversationAuthorized = Boolean(
    preparationRealization?.action === 'respond_to_preparation' &&
      preparationRealization.providerExecutionAuthorized
  )
  const executionRequired =
    preparationConversationAuthorized ||
    input.operationalJudgment.realization.executionGenerationRequired
  const executionAccepted = executionRequired
    ? preparationConversationAuthorized
      ? Boolean(executionText && input.governedProviderExecution)
      : executionTextConformsToOperationalJudgment(
          executionText,
          input.operationalJudgment,
          Boolean(input.authorizedSignalQuestion),
          Boolean(input.governedProviderExecution)
        )
    : false
  const message = executionRequired
    ? executionAccepted
      ? executionText
      : null
    : input.operationalJudgment.realization.directPresentationAllowed
      ? canonicalPresentation
      : null

  return Object.freeze({
    operationalJudgment: input.operationalJudgment,
    message,
    executionAccepted,
    realization: message
      ? executionRequired
        ? 'provider_execution'
        : 'canonical_presentation'
      : 'unavailable',
    preAcceptanceProviderTextUsed: false,
    source: 'operational_judgment' as const,
  })
}

const QUESTION_PATTERN = /\?/g

function removeQuotedExecutionContent(value: string) {
  return value
    .replace(/"[^"\\]*(?:\\.[^"\\]*)*"/g, "")
    .replace(/“[^”]*”/g, "")
    .replace(/‘[^’]*’/g, "")
}

const LIVE_ACTION_PATTERN =
  /\b(?:start|enter|launch|open|switch|move|go|begin|activate|use|join)\s+(?:to\s+)?LIVE\b/i
const QUESTION_ARTIFACT_PATTERN =
  /\b(?:draft|write|create|produce|prepare|revise|analyze|compare)\b[^.]{0,80}\b(?:question|questions|questionnaire|survey|interview guide|faq|quiz)\b/i
const AUTHORIZED_QUESTION_WRAPPER_WORDS = new Set([
  'a',
  'an',
  'are',
  'can',
  'confirm',
  'could',
  'do',
  'does',
  'have',
  'is',
  'me',
  'please',
  'provide',
  'share',
  'tell',
  'the',
  'what',
  'which',
  'would',
  'you',
  'your',
])

function normalizeExecutionSignal(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function executionTextConformsToOperationalJudgment(
  executionText: string | null,
  judgment: OperationalJudgment,
  authorizedSignalQuestion = false,
  governedProviderExecution = false
) {
  if (!executionText) return false

  const signalAcquisition = judgment.signalAcquisition
  const disposition = judgment.operationalDisposition
  const acquisitionQuestionSurface =
    removeQuotedExecutionContent(executionText)
  const questions =
    acquisitionQuestionSurface.match(QUESTION_PATTERN) || []

  if (
    !signalAcquisition.shouldAcquire &&
    questions.length > 0
  ) {
    const acceptedWork = [
      ...disposition.georgeResolvableWork,
      disposition.strongestNextStep || '',
    ].join(' ')

    if (!QUESTION_ARTIFACT_PATTERN.test(acceptedWork)) {
      return false
    }
  }

  if (
    governedProviderExecution &&
    disposition.disposition === 'unresolved' &&
    !signalAcquisition.shouldAcquire &&
    !disposition.consequentialUncertainty
  ) {
    return false
  }

  if (signalAcquisition.shouldAcquire) {
    const requestedSignal = normalizeExecutionSignal(
      signalAcquisition.requestedSignal
    )

    if (!requestedSignal || questions.length !== 1) {
      return false
    }

    if (!authorizedSignalQuestion) {
      const executionSignal = normalizeExecutionSignal(executionText)

      const wrapperWords = executionSignal
        .replace(requestedSignal, ' ')
        .split(/\s+/)
        .filter(Boolean)

      if (
        !executionSignal.includes(requestedSignal) ||
        wrapperWords.some(
          (word) => !AUTHORIZED_QUESTION_WRAPPER_WORDS.has(word)
        )
      ) {
        return false
      }
    }
  }

  const liveDisposition =
    disposition.disposition === 'execution_ready' ||
    disposition.disposition === 'execution_opportunity'

  if (!liveDisposition && LIVE_ACTION_PATTERN.test(executionText)) {
    return false
  }

  if (
    liveDisposition &&
    !disposition.liveMateriallyImprovesExecution
  ) {
    return false
  }

  return true
}

export function buildNormalLiveOperationalJudgmentResult(input: {
  operationalJudgment: OperationalJudgment
  executionText?: string | null
  governedProviderExecution?: boolean
  authorizedSignalQuestion?: NormalLiveOperationalJudgmentResult['authorizedSignalQuestion']
}): NormalLiveOperationalJudgmentResult {
  const classification =
    input.operationalJudgment.preparationTurnClassification
  const preparationRealization =
    input.operationalJudgment.preparationTurnRealizationAuthorization
  const preparationResponse =
    preparationRealization?.action === 'respond_to_preparation' &&
    preparationRealization.providerExecutionAuthorized
      ? buildNormalOperationalResponseResult({
          operationalJudgment: input.operationalJudgment,
          executionText: input.executionText,
          governedProviderExecution: input.governedProviderExecution,
        })
      : null
  const message = classification?.clarificationRequired
    ? PREPARATION_TURN_CLARIFICATION
    : preparationResponse?.message
      ? preparationResponse.message
      : !input.operationalJudgment.signalAcquisition.shouldAcquire &&
          input.operationalJudgment.realization.directPresentationAllowed
        ? cleanOptionalText(
            input.operationalJudgment.operationalDisposition.presentation
          )
        : null

  return Object.freeze({
    request: NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST,
    operationalJudgment: input.operationalJudgment,
    message,
    authorizedSignalQuestion: input.authorizedSignalQuestion || null,
    source: 'operational_judgment' as const,
  })
}

function runtimePreparationEvidenceValue(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const evidence = value as Record<string, unknown>
  const normalizedValue = cleanOptionalText(evidence.value)
  const source = cleanOptionalText(evidence.source)
  if (!normalizedValue || !source) return null

  return { value: normalizedValue, source }
}

function normalizeHomepageOperationalPreparationContext(
  transport: Record<string, unknown>
): OperationalPreparationContext | null {
  const input =
    transport.preparationEvidenceProjection &&
    typeof transport.preparationEvidenceProjection === 'object' &&
    !Array.isArray(transport.preparationEvidenceProjection)
      ? (transport.preparationEvidenceProjection as Record<string, unknown>)
      : transport
  const provenance =
    input.provenance &&
    typeof input.provenance === 'object' &&
    !Array.isArray(input.provenance)
      ? (input.provenance as Record<string, unknown>)
      : null

  if (!provenance) return null
  if (provenance.entrySource !== 'homepage') return null

  const preparationSessionId = cleanOptionalText(input.preparationSessionId)
  const createdAt = Number(input.createdAt)
  const preparationUpdatedAt = Number(input.updatedAt)
  const relations =
    input.relations &&
    typeof input.relations === 'object' &&
    !Array.isArray(input.relations)
      ? (input.relations as Record<string, unknown>)
      : null
  const restoredFrom =
    provenance.restoredFrom &&
    typeof provenance.restoredFrom === 'object' &&
    !Array.isArray(provenance.restoredFrom)
      ? (provenance.restoredFrom as Record<string, unknown>)
      : null
  const restoredFromKind = cleanOptionalText(restoredFrom?.kind)
  const restoredFromId = cleanOptionalText(restoredFrom?.id)
  const relatedLiveSessionId = cleanOptionalText(relations?.liveSessionId)
  const restoredFromValid = Boolean(
    !restoredFrom ||
      (
        (restoredFromKind === 'preparation' ||
          restoredFromKind === 'live_session') &&
        restoredFromId &&
        (restoredFromKind !== 'preparation' ||
          restoredFromId === preparationSessionId) &&
        (restoredFromKind !== 'live_session' ||
          !relatedLiveSessionId ||
          restoredFromId === relatedLiveSessionId)
      )
  )
  const evidenceSufficiency =
    transport.evidenceSufficiency === 'unresolved' ||
    transport.evidenceSufficiency === 'sufficient'
      ? transport.evidenceSufficiency
      : null

  if (
    !/^preparation_[A-Za-z0-9-]+$/.test(preparationSessionId || '') ||
    !Number.isFinite(createdAt) ||
    !Number.isFinite(preparationUpdatedAt) ||
    preparationUpdatedAt < createdAt ||
    !evidenceSufficiency ||
    !restoredFromValid ||
    cleanOptionalText(relations?.normalSessionId)
  ) {
    return null
  }

  const knowledge =
    input.knowledge &&
    typeof input.knowledge === 'object' &&
    !Array.isArray(input.knowledge)
      ? (input.knowledge as Record<string, unknown>)
      : null
  const briefing =
    input.briefing &&
    typeof input.briefing === 'object' &&
    !Array.isArray(input.briefing)
      ? (input.briefing as Record<string, unknown>)
      : null
  if (!knowledge || !briefing) return null

  const evidenceValue = (value: unknown) =>
    runtimePreparationEvidenceValue(value)
  const objective = evidenceValue(knowledge.objective)?.value
  const acceptableOutcome = evidenceValue(knowledge.acceptableOutcome)?.value
  const role = evidenceValue(knowledge.role)?.value
  const audience = evidenceValue(knowledge.audience)?.value
  const conversation =
    knowledge.conversation &&
    typeof knowledge.conversation === 'object' &&
    !Array.isArray(knowledge.conversation)
      ? (knowledge.conversation as Record<string, unknown>)
      : null
  const room = evidenceValue(conversation?.title)?.value
  const additionalSignals =
    knowledge.additionalSignals &&
    typeof knowledge.additionalSignals === 'object' &&
    !Array.isArray(knowledge.additionalSignals)
      ? Object.values(knowledge.additionalSignals as Record<string, unknown>)
      : []
  const structuredEvidence = [
    knowledge.objective,
    knowledge.name,
    knowledge.role,
    ...(Array.isArray(knowledge.participants) ? knowledge.participants : []),
    knowledge.audience,
    ...(Array.isArray(knowledge.perspectives) ? knowledge.perspectives : []),
    conversation?.title,
    conversation?.group,
    knowledge.knownContext,
    knowledge.communicationMedium,
    knowledge.receiverEvidence,
    knowledge.acceptableOutcome,
    knowledge.secondaryOutcome,
    knowledge.roomObjective,
    ...additionalSignals,
  ]
    .map(evidenceValue)
    .filter(
      (value): value is NonNullable<ReturnType<typeof evidenceValue>> =>
        Boolean(value)
    )
  const provisionalPreparationEvidence = Array.from(
    new Set(
      structuredEvidence
        .filter((evidence) => evidence.source === 'persisted_preparation')
        .map((evidence) => evidence.value)
    )
  )
  const inferenceEvidence = Array.from(
    new Set(
      [
        ...(Array.isArray(knowledge.baselineAssumptions)
          ? knowledge.baselineAssumptions
          : []),
        ...additionalSignals,
      ]
        .map(evidenceValue)
        .filter(
          (value): value is NonNullable<ReturnType<typeof evidenceValue>> =>
            Boolean(value && value.source === 'inference')
        )
        .map((evidence) => evidence.value)
    )
  )
  const documents = Array.isArray(knowledge.documents)
    ? knowledge.documents
    : []
  const qualifiedDocumentEvidence = documents
    .map((document) => {
      if (!document || typeof document !== 'object' || Array.isArray(document)) {
        return null
      }
      return evidenceValue((document as Record<string, unknown>).evidence)
    })
    .filter(
      (value): value is NonNullable<ReturnType<typeof evidenceValue>> =>
        Boolean(value && value.source === 'qualified_document')
    )
    .map((evidence) => evidence.value)
  const priorInteractions = Array.isArray(briefing.priorInteractions)
    ? briefing.priorInteractions
        .map((candidate) => {
          if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
            return null
          }
          const interaction = candidate as Record<string, unknown>
          const key = cleanOptionalText(interaction.key)
          const question = cleanOptionalText(interaction.question)
          const answer = cleanOptionalText(interaction.answer) || ''
          const status =
            interaction.status === 'answered' ||
            interaction.status === 'skipped' ||
            interaction.status === 'unknown'
              ? interaction.status
              : null
          if (!key || !question || !status) return null

          const presentation =
            interaction.presentation &&
            typeof interaction.presentation === 'object' &&
            !Array.isArray(interaction.presentation)
              ? (interaction.presentation as Record<string, unknown>)
              : null

          return {
            key,
            question,
            ...(cleanOptionalText(presentation?.example)
              ? {
                  example:
                    cleanOptionalText(presentation?.example) || undefined,
                }
              : {}),
            answer,
            status,
            ...(cleanOptionalText(interaction.evidenceNeed)
              ? {
                  evidenceNeed:
                    cleanOptionalText(interaction.evidenceNeed) || undefined,
                }
              : {}),
            ...(interaction.purpose === 'live_scope_grounding' ||
            interaction.purpose === 'qualification'
              ? { purpose: interaction.purpose }
              : {}),
          }
        })
        .filter(
          (
            interaction
          ): interaction is OperationalPreparationContext['priorInteractions'][number] =>
            interaction !== null
        )
        .slice(-24)
    : []
  const confirmedPreparationEvidence = priorInteractions
    .filter(
      (interaction) =>
        interaction.status === 'answered' && Boolean(interaction.answer)
    )
    .map(
      (interaction) =>
        `${interaction.evidenceNeed || interaction.question}: ${interaction.answer}`
    )
  const skippedEvidenceNeeds = priorInteractions
    .filter((interaction) => interaction.status !== 'answered')
    .map(
      (interaction) => interaction.evidenceNeed || interaction.question
    )
  const currentQuestionInput =
    briefing.currentQuestion &&
    typeof briefing.currentQuestion === 'object' &&
    !Array.isArray(briefing.currentQuestion)
      ? (briefing.currentQuestion as Record<string, unknown>)
      : null
  const currentQuestionPresentation =
    currentQuestionInput?.presentation &&
    typeof currentQuestionInput.presentation === 'object' &&
    !Array.isArray(currentQuestionInput.presentation)
      ? (currentQuestionInput.presentation as Record<string, unknown>)
      : null
  const currentQuestionKey = cleanOptionalText(currentQuestionInput?.key)
  const currentQuestionText = cleanOptionalText(currentQuestionInput?.question)

  return Object.freeze({
    preparationSessionId: preparationSessionId!,
    entrySource: 'homepage' as const,
    preparationEvidenceProjection:
      input as unknown as PreparationRuntimeEvidenceProjection,
    preparationProvenance: Object.freeze({
      entrySource: 'homepage' as const,
      ...(restoredFrom && restoredFromKind && restoredFromId
        ? {
            restoredFrom: Object.freeze({
              kind: restoredFromKind as 'preparation' | 'live_session',
              id: restoredFromId,
            }),
          }
        : {}),
    }),
    preparationUpdatedAt,
    ...(objective ? { objective } : {}),
    ...(acceptableOutcome ? { acceptableOutcome } : {}),
    ...(role ? { role } : {}),
    ...(audience ? { audience } : {}),
    ...(room ? { room } : {}),
    knownEvidence: Object.freeze([
      ...confirmedPreparationEvidence,
      ...qualifiedDocumentEvidence,
    ]),
    currentUserEvidence: Object.freeze([]),
    confirmedPreparationEvidence: Object.freeze(
      confirmedPreparationEvidence
    ),
    qualifiedDocumentEvidence: Object.freeze(qualifiedDocumentEvidence),
    provisionalPreparationEvidence: Object.freeze(
      provisionalPreparationEvidence
    ),
    inferenceEvidence: Object.freeze(inferenceEvidence),
    skippedEvidenceNeeds: Object.freeze(skippedEvidenceNeeds),
    ...(currentQuestionKey && currentQuestionText
      ? {
          pendingQuestion: Object.freeze({
            key: currentQuestionKey,
            question: currentQuestionText,
            ...(cleanOptionalText(currentQuestionPresentation?.example)
              ? {
                  example:
                    cleanOptionalText(currentQuestionPresentation?.example) ||
                    undefined,
                }
              : {}),
            ...(cleanOptionalText(currentQuestionInput?.evidenceNeed)
              ? {
                  evidenceNeed:
                    cleanOptionalText(currentQuestionInput?.evidenceNeed) ||
                    undefined,
                }
              : {}),
          }),
        }
      : {}),
    priorInteractions: Object.freeze(priorInteractions),
    sourcePrecedence: Object.freeze(
      NORMAL_PREPARATION_EVIDENCE_PRECEDENCE.filter(
        (precedence) =>
          precedence.source !== 'active_normal_session_metadata'
      )
    ),
    evidenceSufficiency,
    signalAcquisitionAllowed: transport.signalAcquisitionAllowed !== false,
  })
}

export function normalizeOperationalPreparationContext(
  value: unknown
): OperationalPreparationContext | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const input = value as Record<string, unknown>
  if (input.provenance || input.preparationEvidenceProjection) {
    return normalizeHomepageOperationalPreparationContext(input)
  }
  const preparationSessionId = cleanOptionalText(input.preparationSessionId)
  const normalSessionId = cleanOptionalText(input.normalSessionId)
  const objective = cleanOptionalText(input.objective)
  const preparationUpdatedAt = Number(input.preparationUpdatedAt)
  const evidenceSufficiency =
    input.evidenceSufficiency === 'unresolved' ||
    input.evidenceSufficiency === 'sufficient'
      ? input.evidenceSufficiency
      : null

  if (
    input.entrySource !== 'normal' ||
    !preparationSessionId ||
    !normalSessionId ||
    !Number.isFinite(preparationUpdatedAt) ||
    !evidenceSufficiency
  ) {
    return null
  }

  const normalizeEvidenceList = (candidate: unknown, limit = 24) =>
    Array.isArray(candidate)
      ? Array.from(
          new Set(
            candidate
              .map(cleanOptionalText)
              .filter((item): item is string => Boolean(item))
          )
        ).slice(-limit)
      : []
  const currentUserEvidence = normalizeEvidenceList(
    input.currentUserEvidence,
    12
  )
  const confirmedPreparationEvidence = normalizeEvidenceList(
    input.confirmedPreparationEvidence
  )
  const qualifiedDocumentEvidence = normalizeEvidenceList(
    input.qualifiedDocumentEvidence
  )
  const provisionalPreparationEvidence = normalizeEvidenceList(
    input.provisionalPreparationEvidence
  )
  const inferenceEvidence = normalizeEvidenceList(input.inferenceEvidence)
  const skippedEvidenceNeeds = normalizeEvidenceList(
    input.skippedEvidenceNeeds
  )
  const pendingQuestionInput =
    input.pendingQuestion &&
    typeof input.pendingQuestion === 'object' &&
    !Array.isArray(input.pendingQuestion)
      ? (input.pendingQuestion as Record<string, unknown>)
      : null
  const pendingQuestionKey = cleanOptionalText(pendingQuestionInput?.key)
  const pendingQuestionText = cleanOptionalText(
    pendingQuestionInput?.question
  )
  const knownEvidence = normalizeEvidenceList(input.knownEvidence)
  const priorInteractions = Array.isArray(input.priorInteractions)
    ? input.priorInteractions
        .map((value) => {
          if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null
          }
          const interaction = value as Record<string, unknown>
          const status =
            interaction.status === 'answered' ||
            interaction.status === 'skipped' ||
            interaction.status === 'unknown'
              ? interaction.status
              : null
          const key = cleanOptionalText(interaction.key)
          const question = cleanOptionalText(interaction.question)
          if (!status || !key || !question) return null

          return {
            key,
            question,
            ...(cleanOptionalText(interaction.example)
              ? {
                  example:
                    cleanOptionalText(interaction.example) || undefined,
                }
              : {}),
            answer: cleanOptionalText(interaction.answer) || '',
            status,
            ...(cleanOptionalText(interaction.evidenceNeed)
              ? {
                  evidenceNeed:
                    cleanOptionalText(interaction.evidenceNeed) || undefined,
                }
              : {}),
            ...(interaction.purpose === 'live_scope_grounding' ||
            interaction.purpose === 'qualification'
              ? { purpose: interaction.purpose }
              : {}),
          }
        })
        .filter(
          (
            interaction
          ): interaction is OperationalPreparationContext['priorInteractions'][number] =>
            interaction !== null
        )
        .slice(-24)
    : []
  const formulaInput =
    input.formula &&
    typeof input.formula === 'object' &&
    !Array.isArray(input.formula)
      ? (input.formula as Record<string, unknown>)
      : null
  const formulaId = cleanOptionalText(formulaInput?.id)
  const formulaVersion = Number(formulaInput?.version)
  const formulaSource =
    formulaInput?.source === 'george' || formulaInput?.source === 'user'
      ? formulaInput.source
      : null

  return Object.freeze({
    preparationSessionId,
    normalSessionId,
    entrySource: 'normal' as const,
    preparationProvenance: Object.freeze({
      entrySource: 'normal' as const,
      restoredFrom: Object.freeze({
        kind: 'normal_session' as const,
        id: normalSessionId,
      }),
    }),
    preparationUpdatedAt,
    ...(objective ? { objective } : {}),
    ...(cleanOptionalText(input.acceptableOutcome)
      ? { acceptableOutcome: cleanOptionalText(input.acceptableOutcome) || undefined }
      : {}),
    ...(cleanOptionalText(input.role)
      ? { role: cleanOptionalText(input.role) || undefined }
      : {}),
    ...(cleanOptionalText(input.audience)
      ? { audience: cleanOptionalText(input.audience) || undefined }
      : {}),
    ...(cleanOptionalText(input.room)
      ? { room: cleanOptionalText(input.room) || undefined }
      : {}),
    knownEvidence: Object.freeze(knownEvidence),
    currentUserEvidence: Object.freeze(currentUserEvidence),
    confirmedPreparationEvidence: Object.freeze(
      confirmedPreparationEvidence
    ),
    qualifiedDocumentEvidence: Object.freeze(qualifiedDocumentEvidence),
    provisionalPreparationEvidence: Object.freeze(
      provisionalPreparationEvidence
    ),
    inferenceEvidence: Object.freeze(inferenceEvidence),
    skippedEvidenceNeeds: Object.freeze(skippedEvidenceNeeds),
    ...(pendingQuestionKey && pendingQuestionText
      ? {
          pendingQuestion: Object.freeze({
            key: pendingQuestionKey,
            question: pendingQuestionText,
            ...(cleanOptionalText(pendingQuestionInput?.example)
              ? {
                  example:
                    cleanOptionalText(pendingQuestionInput?.example) ||
                    undefined,
                }
              : {}),
            ...(cleanOptionalText(pendingQuestionInput?.evidenceNeed)
              ? {
                  evidenceNeed:
                    cleanOptionalText(
                      pendingQuestionInput?.evidenceNeed
                    ) || undefined,
                }
              : {}),
          }),
        }
      : {}),
    priorInteractions: Object.freeze(priorInteractions),
    sourcePrecedence: NORMAL_PREPARATION_EVIDENCE_PRECEDENCE,
    evidenceSufficiency,
    signalAcquisitionAllowed: input.signalAcquisitionAllowed !== false,
    ...(formulaId && Number.isFinite(formulaVersion) && formulaVersion > 0 && formulaSource
      ? {
          formula: Object.freeze({
            id: formulaId,
            version: formulaVersion,
            source: formulaSource,
          }),
        }
      : {}),
  })
}

export function buildOperationalPreparationContextNote(
  context: OperationalPreparationContext
) {
  const precedence = context.sourcePrecedence
    .map(
      (item) =>
        `- ${item.rank}. ${item.source} (${item.authority})`
    )
    .join('\n')
  const currentUserEvidence = context.currentUserEvidence
    .map((item, index) => `- ${index + 1}. ${item}`)
    .join('\n')
  const confirmedPreparationEvidence = context.confirmedPreparationEvidence
    .map((item) => `- ${item}`)
    .join('\n')
  const qualifiedDocumentEvidence = context.qualifiedDocumentEvidence
    .map((item) => `- ${item}`)
    .join('\n')
  const provisionalPreparationEvidence = context.provisionalPreparationEvidence
    .map((item) => `- ${item}`)
    .join('\n')
  const inferenceEvidence = context.inferenceEvidence
    .map((item) => `- ${item}`)
    .join('\n')
  const skippedEvidenceNeeds = context.skippedEvidenceNeeds
    .map((item) => `- ${item}`)
    .join('\n')
  const interactions = context.priorInteractions
    .map((interaction) =>
      [
        `- Question shown: ${interaction.question}`,
        interaction.example
          ? `  Illustrative example shown (presentation guidance only; not evidence): ${interaction.example}`
          : '',
        `  Authorized evidence need: ${interaction.evidenceNeed || interaction.question}`,
        `  User answer: ${
          interaction.status === 'answered'
            ? interaction.answer
            : `${interaction.status} (unknown; no negative fact established)`
        }`,
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n')
  const sourceIdentity =
    context.entrySource === 'normal'
      ? `- Entry source: normal\n- Parent Normal session: ${context.normalSessionId}`
      : '- Entry source: homepage\n- Homepage Preparation Session is the source identity; no Normal-session relationship is present.'
  const sourceSpecificProvenanceDuty =
    context.entrySource === 'normal'
      ? `- The user chose THIS CONVERSATION as the starting context. That choice establishes provenance only. It does not establish the desired outcome of the anticipated external LIVE interaction.
- Do not spend the first acquisition reconfirming whether the anticipated interaction is "about" the carried Normal subject. Topic adjacency is subordinate to the result the user needs that interaction to produce.`
      : ''

  return `
CURRENT OPERATIONAL PREPARATION EVIDENCE
- Preparation session: ${context.preparationSessionId}
${sourceIdentity}
- Evidence-acquisition state: ${context.evidenceSufficiency}
- Signal acquisition available this pass: ${context.signalAcquisitionAllowed ? 'yes' : 'no'}
${context.formula ? '- A selected Formula is identified in canonical preparation and, when access-valid, appears in Operational Memory Evidence as strategic context.' : '- No Formula is selected in canonical preparation. Do not invent one.'}

EVIDENCE SOURCE PRECEDENCE
${precedence}
- Within current explicit user evidence, later statements supersede older conflicting statements.
- Assistant prose remains conversation context only and is never user-owned evidence.

Current explicit user evidence (highest authority, oldest to newest):
${currentUserEvidence || '- none'}

Confirmed user answers from preparation:
${confirmedPreparationEvidence || '- none'}

Qualified document evidence:
${qualifiedDocumentEvidence || '- none'}

Persisted structured preparation (provisional; may be stale and cannot override newer explicit user evidence):
${provisionalPreparationEvidence || '- none'}

Inference and baseline assumptions (provisional; never user-owned fact):
${inferenceEvidence || '- none'}

Skipped or unknown evidence needs (unknown, not false or negative evidence):
${skippedEvidenceNeeds || '- none'}

Adaptive preparation history:
${interactions || '- none'}

Pending unanswered preparation question:
${context.pendingQuestion ? `- Question shown: ${context.pendingQuestion.question}\n${context.pendingQuestion.example ? `  Illustrative example shown (presentation guidance only; not evidence): ${context.pendingQuestion.example}\n` : ''}  Authorized evidence need: ${context.pendingQuestion.evidenceNeed || context.pendingQuestion.question} (pending only; not evidence and not continuing authorization)` : '- none'}

OPERATIONAL REASONING DUTY
- This is active, user-selected LIVE preparation. Selection authorizes preparation, but it does not establish the desired outcome, missing facts, strategy, or readiness.
${sourceSpecificProvenanceDuty}
- Determine the strongest next preparation move toward the user's desired outcome from this evidence and the full conversation.
- Resolve conflicts using the source precedence above. Newer explicit user evidence outranks richer or older persisted preparation, and user-owned evidence outranks inference.
- Treat the structured objective, role, audience, context, and other persisted preparation fields as provisional unless confirmed by current explicit user evidence or an answered preparation interaction.
- Do not re-evaluate whether LIVE deserves to be offered or recommended. That pre-selection decision ended when the user deliberately selected LIVE.
- Interaction usefulness and material LIVE benefit may still inform how GEORGE prepares, but they are not prerequisites for continuing this selected preparation flow.
- When evidence is unresolved, authorize signal acquisition only if one specific user-owned fact is genuinely necessary to determine or materially improve the strongest operational action.
- When signal acquisition is unavailable this pass, do not preserve or repeat an earlier acquisition decision. Reassess the strongest supported action from current evidence and remain unresolved only if no responsible action is supported.
- When another user interruption is not necessary, choose the supported operational disposition immediately even if preferred preparation fields remain empty.
- Do not formulate a preparation question here. When signal acquisition is authorized, the existing question-formulation owner will acquire exactly the requested signal.
- When evidence is sufficient, do not reopen preparation merely to complete fields.
- Perform professional inference GEORGE can responsibly perform. Do not manufacture user-owned facts.
- Selection does not make the interaction automatically ready. Advance readiness only when the objective, interaction, and supported preparation move are established.
- Formula evidence informs the strategy; it is not a script, response template, or independent authority.
`.trim()
}

export function resolveOperationalPosture(input: {
  currentRuntime: CurrentGeorgeRuntime
  executionImminent: boolean
  action: OperationalJudgmentAction
  conversationStrategy: GeorgeConversationStrategy
}): GeorgeOperationalPosture {
  if (input.action === 'restore_continuity' || input.action === 'warn_and_move') {
    return 'recovering'
  }

  if (input.currentRuntime === 'live_george') {
    return 'executing_live'
  }

  if (input.executionImminent) {
    return 'execution_imminent'
  }

  if (
    input.conversationStrategy.move === 'explore' ||
    input.conversationStrategy.move === 'ask' ||
    input.conversationStrategy.move === 'clarify' ||
    input.conversationStrategy.move === 'probe'
  ) {
    return 'preparing'
  }

  return 'planning'
}

/**
 * Establishes the pre-provider presentation boundary for the LIVE capability.
 * Semantic provider reasoning is applied afterward by
 * resolveProviderOperationalJudgment, which remains the final disposition
 * owner and preserves activation authority.
 */
export function resolveLiveSupportJudgment(
  evidence: LiveRecommendationEvidence
): LiveSupportJudgment {
  if (evidence.alreadyLive) {
    return {
      posture: 'none',
      explainOnRequest: false,
      strength: 'none',
      reason: 'Already in LIVE mode.',
      instruction: '',
    }
  }

  if (evidence.signalUsable && evidence.hasConversationOutcome) {
    return {
      posture: 'surface',
      explainOnRequest: true,
      strength: 'none',
      reason:
        'LIVE remains available while provider reasoning supplies evidence for canonical Operational Judgment.',
      instruction:
        'Keep LIVE available without injecting a recommendation. Canonical Operational Judgment will validate any provider-inferred operational benefit before it is surfaced. Never auto-route or change operating mode.',
    }
  }

  return {
    posture: 'none',
    explainOnRequest: true,
    strength: 'none',
      reason:
        'LIVE remains available, but runtime presentation has no semantic result to surface this turn.',
      instruction:
        'Do not infer capability relevance from keywords, confidence thresholds, or runtime heuristics. Await canonical provider-informed Operational Judgment and leave activation to the user.',
  }
}

function resolveAction(
  input: OperationalJudgmentInput,
  signalAcquisition: SignalAcquisitionJudgment
): OperationalJudgmentAction {
  if (input.runtimeArbitration.winner === 'safety_or_damage_risk') {
    return 'warn_and_move'
  }

  if (
    input.continuityRestoration.active &&
    (input.runtimeArbitration.winner === 'continuity_restoration' ||
      input.intentState.continuityDependency >= 0.6)
  ) {
    return 'restore_continuity'
  }

  if (signalAcquisition.shouldAcquire) {
    return 'acquire_smallest_signal'
  }

  if (input.runtimeArbitration.winner === 'objective_protection') {
    return 'protect_objective'
  }

  if (input.currentRuntime === 'live_george') {
    return 'execute_live_move'
  }

  if (input.intentState.operational || input.intentState.actionable) {
    return 'advance_outcome'
  }

  return 'clarify_direction'
}

function buildRationale(
  input: OperationalJudgmentInput,
  action: OperationalJudgmentAction,
  operationalPosture: GeorgeOperationalPosture
) {
  const rationale = [
    `governing signal: ${input.runtimeArbitration.winner}`,
    `signal sufficiency: ${input.judgmentSurface.signalSufficiency}`,
    `trajectory: ${input.trajectory.currentMove}`,
    `operational posture: ${operationalPosture}`,
  ]

  if (input.continuityRestoration.active) {
    rationale.push(`continuity: ${input.continuityRestoration.confidence}`)
  }

  if (input.outcomeSignals.overloadDetected >= 0.5) {
    rationale.push('outcome evidence: reduce density')
  } else if (input.outcomeSignals.executionLikelihood >= 0.5) {
    rationale.push('outcome evidence: narrow toward action')
  }

  if (input.adaptiveProfile.conciseDeliveryPreference >= 0.6) {
    rationale.push('profile evidence: concise delivery preferred')
  }

  rationale.push(`resolved action: ${action}`)
  return rationale
}

export function buildOperationalJudgmentNote(
  judgment: OperationalJudgment
) {
  return `
OPERATIONAL JUDGMENT
- Governing action: ${judgment.action}
- Operational posture: ${judgment.operationalPosture}
- Decision surface: ${judgment.decisionSurface}
- Delivery policy: ${judgment.delivery}
- Agency policy: ${judgment.agency}
- Confidence: ${judgment.confidence.toFixed(2)}
- Outcome: ${judgment.outcomeState.immediateOutcome}
- Outcome phase: ${judgment.outcomeState.phase}
- Conversation move: ${judgment.conversationStrategy.move}
- Conversation move purpose: ${judgment.conversationStrategy.purpose}
- Signal acquisition: ${judgment.signalAcquisition.shouldAcquire ? 'acquire' : 'do not acquire'}
- Signal operational value: ${judgment.signalAcquisition.operationalValue}
- Signal conversational cost: ${judgment.signalAcquisition.conversationalCost}
${judgment.smallestSignal ? `- Smallest useful signal: ${judgment.smallestSignal}` : ''}
- LIVE capability posture: ${judgment.liveSupport.posture}
- LIVE capability instruction: ${judgment.liveSupport.instruction || 'No LIVE presentation instruction.'}
- Operational disposition: ${judgment.operationalDisposition.disposition}
- Operational objective: ${judgment.operationalDisposition.operationalObjective || 'unresolved'}
- Consequential uncertainty: ${judgment.operationalDisposition.consequentialUncertainty || 'none established'}
- GEORGE-resolvable work: ${judgment.operationalDisposition.georgeResolvableWork.join(' | ') || 'none established'}
- Interaction useful: ${judgment.operationalDisposition.interactionUseful ? 'yes' : 'no'}
- Material LIVE benefit: ${judgment.operationalDisposition.materialLiveBenefit || 'none established'}
- Strongest next step: ${judgment.operationalDisposition.strongestNextStep || 'unresolved'}
- Communication change: ${judgment.communicationChange?.accepted ? `${judgment.communicationChange.kind} accepted for ${judgment.communicationChange.acceptedScope}` : judgment.communicationChange?.clarificationRequired ? 'clarification required' : 'none accepted'}
- Communication effects: objective=${judgment.communicationChange?.effects.activeObjective ? 'change' : 'preserve'}; facts=${judgment.communicationChange?.effects.factualRecord ? 'change' : 'preserve'}; support=${judgment.communicationChange?.effects.supportConfiguration ? 'change' : 'preserve'}; realization=${judgment.communicationChange?.effects.realization ? 'change' : 'preserve'}
${judgment.communicationChange?.clarificationQuestion ? `- Communication clarification: ${judgment.communicationChange.clarificationQuestion}` : ''}
- Durable communication persistence: not authorized
- Rationale: ${judgment.rationale.join(' | ')}
`.trim()
}
