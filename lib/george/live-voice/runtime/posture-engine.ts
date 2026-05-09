export type ConversationalPosture =
  | 'neutral'
  | 'calming'
  | 'directing'
  | 'deescalating'
  | 'deferential'
  | 'silent'

export type PostureInput = {
  speaker?: 'other_party' | 'user' | 'george_instruction' | 'unclear'
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  interruptionRisk?: number
  confidence?: number
  emotionalVelocity?: 'stable' | 'rising' | 'spiking'
}

export type PostureDecision = {
  posture: ConversationalPosture
  cuePrefix: string
  reason: string
}

class GeorgePostureEngine {
  decide(input: PostureInput): PostureDecision {
    const interruptionRisk = input.interruptionRisk ?? 0
    const confidence = input.confidence ?? 0.5

    if (input.roomPressure === 'authority') {
      return {
        posture: 'deferential',
        cuePrefix: 'Respectfully.',
        reason: 'Authority room. Keep user safe and controlled.',
      }
    }

    if (input.emotionalVelocity === 'spiking') {
      return {
        posture: 'deescalating',
        cuePrefix: 'Lower the temperature.',
        reason: 'Escalation spike. De-escalate.',
      }
    }

    if (interruptionRisk > 0.76) {
      return {
        posture: 'silent',
        cuePrefix: 'Hold.',
        reason: 'High interruption risk. Silence has leverage.',
      }
    }

    if (input.speaker === 'user' && confidence >= 0.55) {
      return {
        posture: 'calming',
        cuePrefix: 'Slow down.',
        reason: 'User has momentum. Stabilize, do not crowd.',
      }
    }

    if (input.speaker === 'other_party') {
      return {
        posture: 'directing',
        cuePrefix: 'Answer cleanly.',
        reason: 'Other party is asking. Direct the next move.',
      }
    }

    return {
      posture: 'neutral',
      cuePrefix: 'Stay composed.',
      reason: 'Room posture neutral.',
    }
  }
}

export const georgePostureEngine =
  new GeorgePostureEngine()
