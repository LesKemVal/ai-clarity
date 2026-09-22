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
  dominantRole?: string | null
  dominantRoleScore?: number
  dominantRoleEvidenceCount?: number
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
    const roleEvidenceSupported = Boolean(
      input.dominantRole &&
      (input.dominantRoleScore || 0) >= 1 &&
      (input.dominantRoleEvidenceCount || 0) >= 2
    )

    if (roleEvidenceSupported && input.dominantRole === 'authority') {
      return {
        posture: 'deferential',
        cuePrefix: 'Respect the role. Keep your position.',
        reason: 'Repeated role evidence supports authority-aware etiquette for this room moment; it does not define a permanent tone.',
      }
    }

    if (roleEvidenceSupported && input.dominantRole === 'skeptic') {
      return {
        posture: 'directing',
        cuePrefix: 'Answer with proof.',
        reason: 'Skeptic pressure is dominating the room.',
      }
    }

    if (roleEvidenceSupported && input.dominantRole === 'gatekeeper') {
      return {
        posture: 'calming',
        cuePrefix: 'Reduce friction.',
        reason: 'Gatekeeper pressure is controlling access.',
      }
    }

    if (roleEvidenceSupported && input.dominantRole === 'ally') {
      return {
        posture: 'directing',
        cuePrefix: 'Use the opening.',
        reason: 'Ally signal detected. Move cleanly.',
      }
    }

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
