export type SilenceDecisionInput = {
  confidence?: number
  interruptionRisk?: number
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  speaker?: 'other_party' | 'user' | 'george_instruction' | 'unclear'
  deliveryProfile?: 'whisperer' | 'peer' | 'authority' | 'silent'
}

export type SilenceDecision = {
  shouldHold: boolean
  reason: string
}

class GeorgeSilenceIntelligence {
  decide(input: SilenceDecisionInput): SilenceDecision {
    const confidence = input.confidence ?? 0
    const interruptionRisk = input.interruptionRisk ?? 0

    if (input.deliveryProfile === 'silent') {
      return {
        shouldHold: true,
        reason: 'Silent profile active.',
      }
    }

    if (input.roomPressure === 'authority') {
      return {
        shouldHold: false,
        reason: 'Authority context requires timely cue.',
      }
    }

    if (input.speaker === 'user' && interruptionRisk < 0.45) {
      return {
        shouldHold: true,
        reason: 'User has momentum. Hold.',
      }
    }

    if (confidence < 0.5) {
      return {
        shouldHold: true,
        reason: 'Confidence too low. Hold.',
      }
    }

    if (interruptionRisk > 0.78) {
      return {
        shouldHold: true,
        reason: 'High interruption risk. Hold.',
      }
    }

    return {
      shouldHold: false,
      reason: 'Speech window acceptable.',
    }
  }
}

export const georgeSilenceIntelligence =
  new GeorgeSilenceIntelligence()
