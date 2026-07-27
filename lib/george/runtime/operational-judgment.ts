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
  rationale: string[]
  source: 'operational_judgment'
}

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
    input,
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
    rationale: buildRationale(input, action, operationalPosture),
    source: 'operational_judgment',
  }
}

export function resolveOperationalPosture(input: {
  input: OperationalJudgmentInput
  action: OperationalJudgmentAction
  conversationStrategy: GeorgeConversationStrategy
}): GeorgeOperationalPosture {
  if (input.action === 'restore_continuity' || input.action === 'warn_and_move') {
    return 'recovering'
  }

  if (input.input.currentRuntime === 'live_george') {
    return 'executing_live'
  }

  if (input.input.intentState.executionImminent) {
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
 * Governs only the presentation policy for the LIVE capability.
 *
 * It does not determine whether LIVE is relevant or beneficial and it does not
 * reinterpret the user's language. The provider owns semantic understanding
 * and may naturally recommend a capability when that capability best serves
 * the user's desired outcome. Runtime judgment preserves activation authority,
 * prevents automatic mode changes, and keeps passive availability unobtrusive.
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
        'LIVE remains an available capability; semantic relevance is owned by provider reasoning.',
      instruction:
        'Keep LIVE available without injecting a recommendation. If the provider determines LIVE materially improves the desired outcome, preserve that recommendation and present activation as the user’s choice. Never auto-route or change operating mode.',
    }
  }

  return {
    posture: 'none',
    explainOnRequest: true,
    strength: 'none',
    reason:
      'LIVE remains available, but runtime presentation has no semantic result to surface this turn.',
    instruction:
      'Do not infer capability relevance from keywords, confidence thresholds, or runtime heuristics. Preserve any explicit user request or provider capability recommendation and leave activation to the user.',
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
- Rationale: ${judgment.rationale.join(' | ')}
`.trim()
}
