export type OutcomeGovernorMove =
  | 'direct_response'
  | 'signal_acquisition'
  | 'context_recovery'
  | 'buy_time'
  | 'protect_position'
  | 'clarify'
  | 'summarize'
  | 'observe'
  | 'hold'

export type OutcomeGovernorInput = {
  objectiveKnown?: boolean
  objectivePressure?: 'low' | 'moderate' | 'high'
  confidence?: number
  consequence?: 'low' | 'moderate' | 'high'
  opportunityCost?: 'low' | 'moderate' | 'high'
  userPosition?: string
  knownContextAvailable?: boolean
  userHasRequestedHelp?: boolean
  roomHasRecentSignal?: boolean
  missingCriticalSignal?: boolean
  userPositionAtRisk?: boolean
  canAcquireContextNaturally?: boolean
}

export type OutcomeGovernorSnapshot = {
  move: OutcomeGovernorMove
  confidence: number
  reason: string
  doctrine: string[]
  missingSignal: string | null
  missingSignalReason: string
  checkedAt: number
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

class GeorgeOutcomeGovernor {
  private snapshot: OutcomeGovernorSnapshot | null = null

  evaluate(input: OutcomeGovernorInput = {}): OutcomeGovernorSnapshot {
    const confidence = clamp01(input.confidence ?? 0.58)
    const consequence = input.consequence ?? 'moderate'
    const opportunityCost = input.opportunityCost ?? 'moderate'
    const objectivePressure = input.objectivePressure ?? 'moderate'

    const normalizedInput = {
      ...input,
      confidence,
      consequence,
      opportunityCost,
      objectivePressure,
    }

    const move = this.resolveMove(normalizedInput)
    const missingSignal = this.resolveMissingSignal(normalizedInput)

    this.snapshot = {
      move,
      confidence,
      reason: this.resolveReason({
        ...input,
        confidence,
        consequence,
        opportunityCost,
        objectivePressure,
        move,
      }),
      doctrine: [
        'GEORGE optimizes for user success, not response generation.',
        'GEORGE considers factors only insofar as they affect outcome.',
        'GEORGE does not abandon the user.',
        'GEORGE does not pretend certainty.',
        'GEORGE uses uncertainty to change action, not usefulness.',
        'GEORGE asks the smallest question that produces the strongest signal and materially improves the next decision.',
        'GEORGE chooses the most intelligent useful move available in service of the desired outcome.',
      ],
      missingSignal: missingSignal.signal,
      missingSignalReason: missingSignal.reason,
      checkedAt: Date.now(),
    }

    return this.snapshot
  }

  getSnapshot() {
    return this.snapshot
  }

  clear() {
    this.snapshot = null
  }

  private resolveMove(input: Required<Pick<OutcomeGovernorInput, 'confidence' | 'consequence' | 'opportunityCost' | 'objectivePressure'>> & OutcomeGovernorInput): OutcomeGovernorMove {
    const highConsequence =
      input.consequence === 'high' ||
      input.opportunityCost === 'high' ||
      input.userPositionAtRisk === true

    const lowConfidence = input.confidence < 0.46
    const moderateConfidence = input.confidence >= 0.46 && input.confidence < 0.68

    if (input.userHasRequestedHelp && lowConfidence && highConsequence) {
      if (input.canAcquireContextNaturally) return 'context_recovery'
      return 'protect_position'
    }

    if (input.userHasRequestedHelp && input.missingCriticalSignal && highConsequence) {
      if (input.canAcquireContextNaturally) return 'context_recovery'
      return 'buy_time'
    }

    if (input.userHasRequestedHelp && lowConfidence && !highConsequence) {
      return 'clarify'
    }

    if (input.userHasRequestedHelp && moderateConfidence && highConsequence) {
      return 'protect_position'
    }

    if (
      input.userHasRequestedHelp &&
      input.roomHasRecentSignal &&
      !input.knownContextAvailable
    ) {
      return 'signal_acquisition'
    }

    if (input.userHasRequestedHelp && input.roomHasRecentSignal) {
      return 'direct_response'
    }

    if (input.missingCriticalSignal && input.canAcquireContextNaturally) {
      return 'context_recovery'
    }

    if (input.objectivePressure === 'high' && highConsequence) {
      return 'protect_position'
    }

    if (input.roomHasRecentSignal && input.objectiveKnown) {
      return 'summarize'
    }

    return 'observe'
  }


  private resolveMissingSignal(input: Required<Pick<OutcomeGovernorInput, 'confidence' | 'consequence' | 'opportunityCost' | 'objectivePressure'>> & OutcomeGovernorInput) {
    const position = String(input.userPosition || '').toLowerCase()
    const highConsequence =
      input.consequence === 'high' ||
      input.opportunityCost === 'high' ||
      input.userPositionAtRisk === true

    if (input.confidence >= 0.68 && input.knownContextAvailable) {
      return {
        signal: null,
        reason: 'Known context and confidence are sufficient for the current decision.',
      }
    }

    if (!input.objectiveKnown) {
      return {
        signal: 'desired_outcome',
        reason: 'Desired outcome is the highest-value missing signal.',
      }
    }

    if (!input.knownContextAvailable && highConsequence) {
      return {
        signal: 'known_context',
        reason: 'High-consequence outcome needs user-known context before stronger recommendations.',
      }
    }

    if (
      input.userHasRequestedHelp &&
      !input.knownContextAvailable
    ) {
      return {
        signal: 'next_room_signal',
        reason:
          'User requested guidance but the room signal is incomplete. Acquire the next meaningful signal before attempting stronger intervention.',
      }
    }

    if (position === 'evaluating' || position === 'deciding') {
      return {
        signal: 'decision_criteria',
        reason: 'Evaluating or deciding requires criteria before GEORGE can judge acceptable risk and reward.',
      }
    }

    if (position === 'negotiating') {
      return {
        signal: 'non_negotiable_or_tradeoff',
        reason: 'Negotiation requires knowing what cannot be lost versus what can be traded.',
      }
    }

    if (position === 'seeking' && highConsequence) {
      return {
        signal: 'acceptable_fallback',
        reason: 'Seeking a high-consequence outcome requires knowing whether any fallback outcome is acceptable.',
      }
    }

    if (input.missingCriticalSignal) {
      return {
        signal: 'critical_room_signal',
        reason: 'A critical room signal is missing and may materially change the next move.',
      }
    }

    return {
      signal: null,
      reason: 'No missing signal currently rises above action threshold.',
    }
  }

  private resolveReason(input: OutcomeGovernorInput & {
    confidence: number
    consequence: 'low' | 'moderate' | 'high'
    opportunityCost: 'low' | 'moderate' | 'high'
    objectivePressure: 'low' | 'moderate' | 'high'
    move: OutcomeGovernorMove
  }) {
    return [
      `Move: ${input.move}`,
      `Confidence: ${input.confidence.toFixed(2)}`,
      `Consequence: ${input.consequence}`,
      `Opportunity cost: ${input.opportunityCost}`,
      `Objective pressure: ${input.objectivePressure}`,
      `User position: ${input.userPosition || 'unknown'}`,
      input.knownContextAvailable ? 'Known context available.' : 'Known context unavailable.',
      input.userHasRequestedHelp ? 'User requested help.' : 'No direct help request.',
      input.missingCriticalSignal ? 'Critical signal missing.' : 'Critical signal not missing.',
      input.canAcquireContextNaturally ? 'Natural context recovery available.' : 'Natural context recovery unavailable.',
    ].join(' | ')
  }
}

export const georgeOutcomeGovernor = new GeorgeOutcomeGovernor()
