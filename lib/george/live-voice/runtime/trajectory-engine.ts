export type Trajectory =
  | 'positive'
  | 'neutral'
  | 'drifting'
  | 'resistance_hardening'
  | 'escalating_conflict'
  | 'decision_ready'
  | 'authority_risk'

export type TrajectoryInput = {
  text: string
  objectiveId: string
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  interruptionRisk?: number
  emotionalVelocity?: 'stable' | 'rising' | 'spiking'
  powerFrame?: string
}

export type TrajectoryState = {
  trajectory: Trajectory
  score: number
  reason: string
  recommendedAction: 'continue' | 'compress' | 'hold' | 'redirect' | 'close'
}

class GeorgeTrajectoryEngine {
  evaluate(input: TrajectoryInput): TrajectoryState {
    const text = input.text.toLowerCase()

    if (input.roomPressure === 'authority') {
      return {
        trajectory: 'authority_risk',
        score: 0.9,
        reason: 'Authority risk present. Preserve safety and compliance.',
        recommendedAction: 'compress',
      }
    }

    if (
      input.emotionalVelocity === 'spiking' ||
      (input.interruptionRisk || 0) > 0.78 ||
      /stop|wait|hold on|listen|no\b|not hearing/i.test(text)
    ) {
      return {
        trajectory: 'escalating_conflict',
        score: 0.84,
        reason: 'Interaction is accelerating toward conflict.',
        recommendedAction: 'hold',
      }
    }

    if (/not interested|send an email|too busy|no budget|not now/i.test(text)) {
      return {
        trajectory: 'resistance_hardening',
        score: 0.72,
        reason: 'Resistance is hardening.',
        recommendedAction: 'redirect',
      }
    }

    if (/when|what time|next step|send me|follow up|sounds good/i.test(text)) {
      return {
        trajectory: 'decision_ready',
        score: 0.76,
        reason: 'Room is near a decision point.',
        recommendedAction: 'close',
      }
    }

    if (/maybe|i guess|not sure|we will see|later/i.test(text)) {
      return {
        trajectory: 'drifting',
        score: 0.62,
        reason: 'Momentum is drifting.',
        recommendedAction: 'redirect',
      }
    }

    if (/yes|okay|fair|that makes sense|i understand/i.test(text)) {
      return {
        trajectory: 'positive',
        score: 0.66,
        reason: 'Trust or agreement is improving.',
        recommendedAction: 'continue',
      }
    }

    return {
      trajectory: 'neutral',
      score: 0.5,
      reason: 'Trajectory is neutral.',
      recommendedAction: 'continue',
    }
  }
}

export const georgeTrajectoryEngine =
  new GeorgeTrajectoryEngine()
