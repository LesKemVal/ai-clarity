export type OutcomeGovernorMove =
  | 'direct_response'
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

    const move = this.resolveMove({
      ...input,
      confidence,
      consequence,
      opportunityCost,
      objectivePressure,
    })

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
        'GEORGE chooses the safest useful move available.',
      ],
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
      input.userHasRequestedHelp ? 'User requested help.' : 'No direct help request.',
      input.missingCriticalSignal ? 'Critical signal missing.' : 'Critical signal not missing.',
      input.canAcquireContextNaturally ? 'Natural context recovery available.' : 'Natural context recovery unavailable.',
    ].join(' | ')
  }
}

export const georgeOutcomeGovernor = new GeorgeOutcomeGovernor()
