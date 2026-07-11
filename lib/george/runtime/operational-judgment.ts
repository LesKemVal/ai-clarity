import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import type { AdaptiveUserProfile } from '@/lib/george/runtime/adaptive-user-profile'
import type { ContinuityRestorationState } from '@/lib/george/runtime/continuity-restoration'
import type { GeorgeIntentState } from '@/lib/george/runtime/intent-state'
import type { JudgmentSurfaceState } from '@/lib/george/runtime/judgment-surface'
import type { RuntimeOutcomeSignals } from '@/lib/george/runtime/outcome-learning'
import type { RuntimeSignalArbitration } from '@/lib/george/runtime/runtime-signal-arbitrator'
import type { TrajectoryAssessment } from '@/lib/george/runtime/trajectory-engine'

export type OperationalJudgmentAction =
  | 'warn_and_move'
  | 'restore_continuity'
  | 'acquire_smallest_signal'
  | 'protect_objective'
  | 'execute_live_move'
  | 'advance_outcome'
  | 'clarify_direction'

export type OperationalJudgment = {
  action: OperationalJudgmentAction
  decisionSurface: JudgmentSurfaceState['decisionSurface']
  delivery: RuntimeSignalArbitration['delivery']
  agency: RuntimeSignalArbitration['agency']
  confidence: number
  smallestSignal?: string
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

  return {
    action,
    decisionSurface: input.judgmentSurface.decisionSurface,
    delivery:
      action === 'acquire_smallest_signal' && input.runtimeArbitration.delivery === 'normal'
        ? 'short'
        : input.runtimeArbitration.delivery,
    agency: input.runtimeArbitration.agency,
    confidence,
    smallestSignal:
      action === 'acquire_smallest_signal'
        ? input.judgmentSurface.smallestSignal
        : undefined,
    rationale: buildRationale(input, action),
    source: 'operational_judgment',
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
${judgment.smallestSignal ? `- Acquire only this signal: ${judgment.smallestSignal}` : '- Additional signal is not required before the first useful move.'}
- Evidence: ${judgment.rationale.join('; ')}
- This is the single operational synthesis for the current turn.
- Evidence producers inform this judgment; they do not independently govern the response.
- Response shaping and output governance must execute this judgment without creating a competing posture.
- Preserve explicit user direction, safety boundaries, and LIVE authority.
`.trim()
}
