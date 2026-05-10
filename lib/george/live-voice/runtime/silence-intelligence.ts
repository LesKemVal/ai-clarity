export type SilenceDecisionInput = {
  confidence?: number
  interruptionRisk?: number
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  speaker?: 'other_party' | 'user' | 'george_instruction' | 'unclear'
  deliveryProfile?: 'whisperer' | 'peer' | 'authority' | 'silent'
  controlOwner?: 'other_party' | 'user' | 'balanced' | 'unclear'
  msSinceSpeech?: number
  forcedIntervention?: boolean
  strongestRolePressure?: [string, number]
  trajectory?: string
  decisionAction?: string
}

export type SilenceDecision = {
  shouldHold: boolean
  reason: string
  silenceType:
    | 'none'
    | 'thinking_silence'
    | 'dead_silence'
    | 'processing_silence'
    | 'forced_intervention'
    | 'profile_silence'
  pauseType?:
    | 'none'
    | 'hesitation'
    | 'authority_hold'
    | 'processing'
    | 'invitation'
    | 'trap_pause'
    | 'overlap_risk'
}

class GeorgeSilenceIntelligence {
  decide(input: SilenceDecisionInput): SilenceDecision {
    const confidence = input.confidence ?? 0
    const interruptionRisk = input.interruptionRisk ?? 0
    const msSinceSpeech = input.msSinceSpeech ?? 0
    const [role, rolePressure] = input.strongestRolePressure ?? ['neutral', 0]
    const pauseType = this.classifyPause(input, role, rolePressure)

    if (input.forcedIntervention) {
      return {
        shouldHold: false,
        reason: 'User directly requested intervention.',
        silenceType: 'forced_intervention',
        pauseType,
      }
    }

    if (
      role === 'authority' &&
      rolePressure > 1.2 &&
      input.controlOwner === 'other_party' &&
      msSinceSpeech < 2400
    ) {
      return {
        shouldHold: true,
        reason: 'Authority pressure persists. Do not interrupt the floor.',
        silenceType: 'processing_silence',
        pauseType,
      }
    }

    if (
      role === 'skeptic' &&
      rolePressure > 1.4 &&
      input.controlOwner === 'other_party' &&
      msSinceSpeech < 2000
    ) {
      return {
        shouldHold: true,
        reason: 'Skeptic pressure persists. Wait for a cleaner proof window.',
        silenceType: 'processing_silence',
        pauseType,
      }
    }

    if (
      role === 'gatekeeper' &&
      rolePressure > 1.4 &&
      input.controlOwner === 'other_party' &&
      msSinceSpeech < 2200
    ) {
      return {
        shouldHold: true,
        reason: 'Gatekeeper pressure persists. Hold for an access gap.',
        silenceType: 'processing_silence',
        pauseType,
      }
    }

    if (
      role === 'ally' &&
      rolePressure > 1.2 &&
      input.controlOwner !== 'other_party' &&
      confidence >= 0.5
    ) {
      return {
        shouldHold: false,
        reason: 'Ally opening present. Use the window.',
        silenceType: 'none',
        pauseType,
      }
    }

    if (input.deliveryProfile === 'silent') {
      return {
        shouldHold: true,
        reason: 'Silent profile active.',
        silenceType: 'profile_silence',
        pauseType,
      }
    }

    if (
      input.controlOwner === 'user' &&
      input.speaker === 'user' &&
      msSinceSpeech > 1800 &&
      interruptionRisk < 0.55
    ) {
      return {
        shouldHold: false,
        reason: 'User appears stuck after holding the floor.',
        silenceType: 'dead_silence',
        pauseType,
      }
    }

    if (
      input.controlOwner === 'other_party' &&
      msSinceSpeech < 1800
    ) {
      return {
        shouldHold: true,
        reason: 'Other party appears to be processing or holding the floor.',
        silenceType: 'processing_silence',
        pauseType,
      }
    }

    if (pauseType === 'invitation') {
      return {
        shouldHold: false,
        reason: 'Invitation gap detected. Take the opening.',
        silenceType: 'none',
        pauseType,
      }
    }

    if (pauseType === 'trap_pause') {
      return {
        shouldHold: true,
        reason: 'Trap pause detected. Do not fill the silence.',
        silenceType: 'processing_silence',
        pauseType,
      }
    }

    if (input.roomPressure === 'authority') {
      return {
        shouldHold: false,
        reason: 'Authority context requires timely cue.',
        silenceType: 'none',
        pauseType,
      }
    }

    if (
      input.speaker === 'user' &&
      interruptionRisk < 0.45 &&
      msSinceSpeech < 2200
    ) {
      return {
        shouldHold: true,
        reason: 'User has momentum. Hold.',
        silenceType: 'thinking_silence',
        pauseType,
      }
    }

    if (confidence < 0.5) {
      return {
        shouldHold: true,
        reason: 'Confidence too low. Hold.',
        silenceType: 'thinking_silence',
        pauseType,
      }
    }

    if (interruptionRisk > 0.78) {
      return {
        shouldHold: true,
        reason: 'High interruption risk. Hold.',
        silenceType: 'processing_silence',
        pauseType,
      }
    }

    return {
      shouldHold: false,
      reason: 'Speech window acceptable.',
      silenceType: 'none',
      pauseType,
    }
  }

  private classifyPause(
    input: SilenceDecisionInput,
    role: string,
    rolePressure: number
  ): SilenceDecision['pauseType'] {
    const msSinceSpeech = input.msSinceSpeech ?? 0
    const interruptionRisk = input.interruptionRisk ?? 0

    if (
      role === 'authority' &&
      rolePressure > 1.2 &&
      input.controlOwner === 'other_party'
    ) {
      return 'authority_hold'
    }

    if (
      role === 'skeptic' &&
      rolePressure > 1.4 &&
      (
        input.trajectory === 'resistance_hardening' ||
        input.decisionAction === 'redirect'
      )
    ) {
      return 'trap_pause'
    }

    if (
      input.controlOwner === 'other_party' &&
      msSinceSpeech < 1800
    ) {
      return 'processing'
    }

    if (
      input.controlOwner !== 'other_party' &&
      (
        input.decisionAction === 'close' ||
        input.trajectory === 'decision_ready' ||
        role === 'ally'
      ) &&
      msSinceSpeech >= 700
    ) {
      return 'invitation'
    }

    if (
      input.speaker === 'user' &&
      msSinceSpeech > 1600 &&
      interruptionRisk < 0.55
    ) {
      return 'hesitation'
    }

    if (interruptionRisk > 0.78) {
      return 'overlap_risk'
    }

    return 'none'
  }
}

export const georgeSilenceIntelligence =
  new GeorgeSilenceIntelligence()
