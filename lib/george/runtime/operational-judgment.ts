import type { GeorgeOutcomeState } from '@/lib/george/live-voice/runtime/active-outcome'
import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import type { AdaptiveUserProfile } from '@/lib/george/runtime/adaptive-user-profile'
import type { ContinuityRestorationState } from '@/lib/george/runtime/continuity-restoration'
import type { GeorgeIntentState } from '@/lib/george/runtime/intent-state'
import type { JudgmentSurfaceState } from '@/lib/george/runtime/judgment-surface'
import type { LiveRecommendationEvidence } from '@/lib/george/runtime/live-recommendation-governor'
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

export type LiveSupportJudgment = {
  posture: 'none' | 'surface' | 'recommend'
  explainOnRequest: boolean
  strength: 'none' | 'soft' | 'recommend' | 'strong'
  reason: string
  instruction: string
}

export type OperationalJudgment = {
  action: OperationalJudgmentAction
  decisionSurface: JudgmentSurfaceState['decisionSurface']
  delivery: RuntimeSignalArbitration['delivery']
  agency: RuntimeSignalArbitration['agency']
  confidence: number
  outcomeState: GeorgeOutcomeState
  conversationStrategy: GeorgeConversationStrategy
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
  outcomeState: GeorgeOutcomeState
  latestUserText: string
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export function resolveOperationalJudgment(
  input: OperationalJudgmentInput
): OperationalJudgment {
  const action = resolveAction(input)
  const confidence = clamp01(
    input.trajectory.confidence * 0.45 +
      (input.judgmentSurface.signalSufficiency === 'sufficient' ? 0.35 : 0.12) +
      (input.intentState.objectiveState === 'clear' ? 0.2 : 0.08)
  )

  const conversationStrategy = resolveGeorgeConversationStrategy({
    action,
    currentRuntime: input.currentRuntime,
    latestUserText: input.latestUserText,
    judgmentSurface: input.judgmentSurface,
    trajectory: input.trajectory,
    outcomeState: input.outcomeState,
  })

  return {
    action,
    decisionSurface: input.judgmentSurface.decisionSurface,
    delivery:
      action === 'acquire_smallest_signal' && input.runtimeArbitration.delivery === 'normal'
        ? 'short'
        : input.runtimeArbitration.delivery,
    agency: input.runtimeArbitration.agency,
    confidence,
    outcomeState: input.outcomeState,
    conversationStrategy,
    smallestSignal:
      action === 'acquire_smallest_signal'
        ? input.judgmentSurface.smallestSignal
        : undefined,
    liveSupport: resolveLiveSupportJudgment(input.liveRecommendationEvidence, input.judgmentSurface.signalSufficiency),
    rationale: buildRationale(input, action),
    source: 'operational_judgment',
  }
}


export function resolveLiveSupportJudgment(
  evidence: LiveRecommendationEvidence,
  signalSufficiency: JudgmentSurfaceState['signalSufficiency']
): LiveSupportJudgment {
  const shouldRecommend =
    !evidence.alreadyLive &&
    evidence.signalUsable &&
    evidence.executionImminent &&
    evidence.conversationPressure

  const shouldSurface =
    !evidence.alreadyLive &&
    evidence.signalUsable &&
    evidence.hasConversationOutcome

  if (shouldRecommend) {
    const strength =
      signalSufficiency === 'sufficient' && evidence.pressureHigh
        ? 'strong'
        : signalSufficiency === 'sufficient'
          ? 'recommend'
          : 'soft'

    return {
      posture: 'recommend',
      explainOnRequest: false,
      strength,
      reason:
        'The situation appears to be moving from planning into real-time human execution pressure.',
      instruction:
        strength === 'strong'
          ? 'The user appears to be entering real-time execution pressure. Offer LIVE as available support without selling it. Ask simply if they want GEORGE in the room.'
          : 'Offer LIVE as optional execution support only if the user is about to enter the room. Do not upsell and do not auto-route.',
    }
  }

  if (shouldSurface) {
    return {
      posture: 'surface',
      explainOnRequest: true,
      strength: 'none',
      reason:
        'GEORGE has enough outcome and conversation signal to understand that LIVE may help if this moves into the room.',
      instruction:
        'LIVE may be surfaced as a quiet execution capability marker. Explain LIVE only once when the user taps or asks. Frame it as support for a specific conversation or desired outcome, not as the next required move.',
    }
  }

  return {
    posture: 'none',
    explainOnRequest: false,
    strength: 'none',
    reason: evidence.alreadyLive
      ? 'Already in LIVE mode.'
      : !evidence.signalUsable
        ? 'Signal is not sufficient enough to explain LIVE usefully yet.'
        : !evidence.trajectorySignal && !evidence.conversationPressure
          ? 'Trajectory does not yet indicate a realistic future live benefit.'
          : 'LIVE recommendation threshold not met.',
    instruction: 'Do not recommend LIVE. Continue normal GEORGE support.',
  }
}

function resolveAction(
  input: OperationalJudgmentInput
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

  if (input.judgmentSurface.shouldAcquireSignal) {
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
  action: OperationalJudgmentAction
) {
  const rationale = [
    `governing signal: ${input.runtimeArbitration.winner}`,
    `signal sufficiency: ${input.judgmentSurface.signalSufficiency}`,
    `trajectory: ${input.trajectory.currentMove}`,
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
- Decision surface: ${judgment.decisionSurface}
- Delivery density: ${judgment.delivery}
- Agency posture: ${judgment.agency}
- Judgment confidence: ${judgment.confidence.toFixed(2)}
- Primary outcome: ${judgment.outcomeState.primaryOutcome}
- Immediate outcome: ${judgment.outcomeState.immediateOutcome}
- Outcome phase: ${judgment.outcomeState.phase}
- Outcome confidence: ${judgment.outcomeState.confidence.toFixed(2)}
- Conversation move: ${judgment.conversationStrategy.move}
- Conversation purpose: ${judgment.conversationStrategy.purpose}
- Conversation strategy confidence: ${judgment.conversationStrategy.confidence.toFixed(2)}
- User retains final in-room discretion: yes
- LIVE support posture: ${judgment.liveSupport.posture}
- LIVE recommendation strength: ${judgment.liveSupport.strength}
- Explain LIVE on request: ${judgment.liveSupport.explainOnRequest ? 'yes' : 'no'}
- LIVE support reason: ${judgment.liveSupport.reason}
- LIVE support instruction: ${judgment.liveSupport.instruction}
${judgment.smallestSignal ? `- Acquire only this signal: ${judgment.smallestSignal}` : '- Additional signal is not required before the first useful move.'}
- Evidence: ${judgment.rationale.join('; ')}
- This is the single operational synthesis for the current turn.
- Evidence producers inform this judgment; they do not independently govern the response.
- Response shaping and output governance must execute this judgment without creating a competing posture.
- LIVE may be surfaced quietly when outcome and conversation signal are present. Recommend it only when execution pressure is imminent. Never upsell or auto-route.
- Preserve explicit user direction, safety boundaries, and LIVE authority.
`.trim()
}
