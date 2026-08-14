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

export type SignalAcquisitionJudgment = {
  shouldAcquire: boolean
  operationalValue: 'none' | 'low' | 'medium' | 'high'
  conversationalCost: 'low' | 'medium' | 'high'
  requestedSignal?: string
  reason: string
}

export type GeorgeOperationalDisposition =
  | 'execution_ready'
  | 'execution_opportunity'
  | 'continue_normal'
  | 'other_action'
  | 'unresolved'

export const NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST =
  'normal_live_operational_judgment' as const

export type OperationalPreparationContext = Readonly<{
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
    evidenceNeed?: string
  }>
  priorInteractions: readonly Readonly<{
    key: string
    question: string
    answer: string
    status: 'answered' | 'skipped' | 'unknown'
    evidenceNeed?: string
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
    evidenceIsUserOwned: boolean
    consequentialToNextAction: boolean
    reason: string | null
  }>
}>

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
  operationalDisposition: OperationalDispositionJudgment
  realization: OperationalRealizationJudgment
  rationale: readonly string[]
  source: 'operational_judgment'
}

export type NormalLiveOperationalJudgmentResult = Readonly<{
  request: typeof NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST
  operationalJudgment: OperationalJudgment
  message: string | null
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
    return cleanOptionalText(
      input.consequentialUncertainty
        ? `The consequential uncertainty is ${input.consequentialUncertainty}. The current evidence does not yet support a responsible strongest action or a material use for LIVE.`
        : input.operationalObjective
          ? `The current evidence does not yet establish a responsible strongest action or a material use for LIVE toward ${input.operationalObjective}.`
          : 'The current evidence does not yet establish a responsible strongest action or a material use for LIVE.'
    )
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
  providerCapability: 'normal' | 'live' | null
  capabilityExplicitlyRequested: boolean
  capabilityRecommendationMaterial: boolean
  canonicalSignalAcquisition?: boolean
  signalAcquisitionAllowed?: boolean
  operationalJudgmentRequest?: boolean
  ordinaryNormalRequest?: boolean
}): OperationalJudgment {
  const reasoning = input.providerReasoning
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
  const liveExecutionSupported = Boolean(
    operationalObjective &&
      input.providerCapability === 'live' &&
      input.capabilityRecommendationMaterial &&
      interactionUseful &&
      interaction &&
      purpose &&
      desiredResult &&
      liveMateriallyImprovesExecution &&
      materialLiveBenefit &&
      georgeResolvableWork.length > 0 &&
      georgeCanAdvanceWithoutUserSignal &&
      strongestNextStep
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
      'Provider reasoning established a material execution use for LIVE.'
  } else if (
    proposedDisposition === 'continue_normal' &&
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
  } else if (normalActionSupported) {
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
      'Canonical Operational Judgment did not accept LIVE because the interaction, desired result, or material execution benefit was not established.'
  }

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
      comparisonSupportsSignalFirst
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
  const realization: OperationalRealizationJudgment =
    providerDecisionAuthoritative
      ? Object.freeze({
          executionGenerationRequired,
          directPresentationAllowed: !executionGenerationRequired,
          reason: executionGenerationRequired
            ? providerAuthorizesSignalAcquisition
              ? 'The accepted consequential evidence need requires one execution-generated user question.'
              : disposition === 'unresolved'
                ? 'The accepted unresolved judgment requires provider execution to present its current boundary without inventing an action or evidence need.'
                : 'The accepted operational action requires provider execution to perform or realize the work.'
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
  const executionRequired =
    input.operationalJudgment.realization.executionGenerationRequired
  const executionAccepted = executionRequired
    ? executionTextConformsToOperationalJudgment(
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
    questions.length > 0 &&
    !governedProviderExecution
  ) {
    const acceptedWork = [
      ...disposition.georgeResolvableWork,
      disposition.strongestNextStep || '',
    ].join(' ')

    if (!QUESTION_ARTIFACT_PATTERN.test(acceptedWork)) {
      return false
    }
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
}): NormalLiveOperationalJudgmentResult {
  const message =
    !input.operationalJudgment.signalAcquisition.shouldAcquire
      ? cleanOptionalText(
          input.operationalJudgment.operationalDisposition.presentation
        )
      : null

  return Object.freeze({
    request: NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST,
    operationalJudgment: input.operationalJudgment,
    message,
    source: 'operational_judgment' as const,
  })
}

export function normalizeOperationalPreparationContext(
  value: unknown
): OperationalPreparationContext | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const input = value as Record<string, unknown>
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
            answer: cleanOptionalText(interaction.answer) || '',
            status,
            ...(cleanOptionalText(interaction.evidenceNeed)
              ? {
                  evidenceNeed:
                    cleanOptionalText(interaction.evidenceNeed) || undefined,
                }
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
    .map(
      (interaction) =>
        `- ${interaction.evidenceNeed || interaction.question}: ${
          interaction.status === 'answered'
            ? interaction.answer
            : `${interaction.status} (unknown; no negative fact established)`
        }`
    )
    .join('\n')

  return `
CURRENT NORMAL PREPARATION EVIDENCE
- Preparation session: ${context.preparationSessionId}
- Parent Normal session: ${context.normalSessionId}
- Evidence-acquisition state: ${context.evidenceSufficiency}
- Signal acquisition available this pass: ${context.signalAcquisitionAllowed ? 'yes' : 'no'}
${context.formula ? '- A selected Formula is identified in canonical preparation and, when access-valid, appears in Operational Memory Evidence as strategic context.' : '- No Formula is selected in canonical preparation. Do not invent one.'}

EVIDENCE SOURCE PRECEDENCE
${precedence}
- Within current explicit user evidence, later statements supersede older conflicting statements.
- Assistant prose remains conversation context only and is never user-owned evidence.

Current explicit Normal-session user evidence (highest authority, oldest to newest):
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
${context.pendingQuestion ? `- ${context.pendingQuestion.evidenceNeed || context.pendingQuestion.question} (pending only; not evidence and not continuing authorization)` : '- none'}

OPERATIONAL REASONING DUTY
- Determine the strongest next step toward the objective from this evidence and the full conversation.
- Resolve conflicts using the source precedence above. Newer explicit user evidence outranks richer or older persisted preparation, and user-owned evidence outranks inference.
- Treat the structured objective, role, audience, context, and other persisted preparation fields as provisional unless confirmed by current explicit user evidence or an answered preparation interaction.
- Decide whether LIVE materially improves execution, whether Normal work is stronger, or whether another concrete operational action should come first.
- The user invoking LIVE is a request for this judgment, not proof that LIVE preparation is the strongest move.
- When evidence is unresolved, authorize signal acquisition only if one specific user-owned fact is genuinely necessary to determine or materially improve the strongest operational action.
- When signal acquisition is unavailable this pass, do not preserve or repeat an earlier acquisition decision. Reassess the strongest supported action from current evidence and remain unresolved only if no responsible action is supported.
- When another user interruption is not necessary, choose the supported operational disposition immediately even if preferred preparation fields remain empty.
- Do not formulate a preparation question here. When signal acquisition is authorized, the existing question-formulation owner will acquire exactly the requested signal.
- When evidence is sufficient, do not reopen preparation merely to complete fields.
- Perform professional inference GEORGE can responsibly perform. Do not manufacture user-owned facts.
- If LIVE is useful, explain its interaction-specific execution value naturally. Do not advertise it or force activation.
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
- Rationale: ${judgment.rationale.join(' | ')}
`.trim()
}
