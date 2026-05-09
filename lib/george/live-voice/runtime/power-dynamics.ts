export type PowerFrame =
  | 'balanced'
  | 'other_party_controls'
  | 'user_controls'
  | 'authority_controls'
  | 'user_defensive'
  | 'unclear'

export type PowerDynamicsInput = {
  text: string
  speaker?: 'other_party' | 'user' | 'george_instruction' | 'unclear'
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  interruptionRisk?: number
  emotionalVelocity?: 'stable' | 'rising' | 'spiking'
}

export type PowerDynamicsState = {
  frame: PowerFrame
  score: number
  reason: string
}

class GeorgePowerDynamics {
  analyze(input: PowerDynamicsInput): PowerDynamicsState {
    const text = input.text.toLowerCase()
    let score = 0.5

    if (input.roomPressure === 'authority') {
      return {
        frame: 'authority_controls',
        score: 0.92,
        reason: 'Authority figure controls the frame.',
      }
    }

    if (/why should|prove|convince me|what makes you|that's not enough/i.test(text)) {
      return {
        frame: 'other_party_controls',
        score: 0.78,
        reason: 'Other party is testing frame control.',
      }
    }

    if (/sorry|i just|i was only|i don't know|maybe|i guess/i.test(text)) {
      return {
        frame: 'user_defensive',
        score: 0.72,
        reason: 'User language appears defensive.',
      }
    }

    if (/let me be clear|here is what|i need|i want|my position/i.test(text)) {
      return {
        frame: 'user_controls',
        score: 0.68,
        reason: 'User is asserting a frame.',
      }
    }

    if ((input.interruptionRisk || 0) > 0.7 || input.emotionalVelocity === 'spiking') {
      return {
        frame: 'other_party_controls',
        score: 0.7,
        reason: 'Room pressure suggests user may be losing frame.',
      }
    }

    return {
      frame: 'balanced',
      score,
      reason: 'Power frame appears balanced.',
    }
  }
}

export const georgePowerDynamics =
  new GeorgePowerDynamics()
