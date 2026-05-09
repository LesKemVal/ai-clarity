export type DecisionWindowAction =
  | 'speak_now'
  | 'hold'
  | 'redirect'
  | 'close'
  | 'soften'
  | 'exit'
  | 'reframe'
  | 'wait'

export type DecisionWindowInput = {
  text: string
  confidence?: number
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  interruptionRisk?: number
  trajectory?: string
  recovery?: string
  powerFrame?: string
  emotionalVelocity?: 'stable' | 'rising' | 'spiking'
}

export type DecisionWindow = {
  action: DecisionWindowAction
  openness: number
  reason: string
}

class GeorgeDecisionWindow {
  evaluate(input: DecisionWindowInput): DecisionWindow {
    const text = input.text.toLowerCase()
    const confidence = input.confidence ?? 0.5
    const interruptionRisk = input.interruptionRisk ?? 0

    if (input.roomPressure === 'authority') {
      return {
        action: 'speak_now',
        openness: 0.72,
        reason: 'Authority window. Short, compliant cue only.',
      }
    }

    if (
      input.emotionalVelocity === 'spiking' ||
      interruptionRisk > 0.82 ||
      input.trajectory === 'escalating_conflict'
    ) {
      return {
        action: 'hold',
        openness: 0.18,
        reason: 'Room is hot. Hold speech.',
      }
    }

    if (
      input.trajectory === 'decision_ready' ||
      /when|what time|next step|sounds good|send me/i.test(text)
    ) {
      return {
        action: 'close',
        openness: 0.86,
        reason: 'Decision window open. Close cleanly.',
      }
    }

    if (
      input.trajectory === 'resistance_hardening' ||
      /not interested|too busy|no budget|send an email/i.test(text)
    ) {
      return {
        action: 'redirect',
        openness: 0.42,
        reason: 'Resistance hardening. Redirect, do not push.',
      }
    }

    if (
      input.recovery &&
      input.recovery !== 'stable'
    ) {
      return {
        action: 'reframe',
        openness: 0.48,
        reason: 'Recovery needed. Reframe before continuing.',
      }
    }

    if (
      input.powerFrame === 'user_defensive'
    ) {
      return {
        action: 'soften',
        openness: 0.52,
        reason: 'User defensive. Soften and stabilize.',
      }
    }

    if (confidence < 0.46) {
      return {
        action: 'wait',
        openness: 0.3,
        reason: 'Confidence low. Wait for more signal.',
      }
    }

    return {
      action: 'speak_now',
      openness: 0.64,
      reason: 'Window acceptable. Speak briefly.',
    }
  }
}

export const georgeDecisionWindow =
  new GeorgeDecisionWindow()
