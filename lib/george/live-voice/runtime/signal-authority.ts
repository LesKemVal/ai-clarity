export type GeorgeRuntimeSignalName =
  | 'objective_stability'
  | 'relationship_pressure'
  | 'leverage_shift'
  | 'user_load'
  | 'room_pressure'
  | 'interruption_risk'
  | 'strategy_fit'
  | 'continuity_drift'

export type GeorgeRuntimeSignal = {
  name: GeorgeRuntimeSignalName
  weight: number
  confidence: number
  polarity: 'stabilizing' | 'destabilizing' | 'neutral'
  reason: string
}

export type GeorgeSignalAuthoritySnapshot = {
  signals: GeorgeRuntimeSignal[]
  prioritySignals: GeorgeRuntimeSignal[]
  dominantSignal: GeorgeRuntimeSignal | null
  objectiveConfidence: number
  relationshipConfidence: number
  strategyConfidence: number
  continuityConfidence: number
  postureShiftRecommended: boolean
  suggestedPosture: 'restore_default' | 'tighten' | 'soften' | 'hold' | 'ask_lightly'
  restoreDefault: boolean
  revealMode: 'three_line_checkpoint' | 'short_live_checkpoint' | 'ask_clarifying_checkpoint'
  checkedAt: number
}

type SignalAuthorityInput = {
  objectiveConfidence?: number
  relationshipConfidence?: number
  strategyConfidence?: number
  continuityConfidence?: number
  roomPressure?: number
  userLoad?: number
  interruptionRisk?: number
  leverageShift?: number
  continuityDrift?: number
  reasons?: Partial<Record<GeorgeRuntimeSignalName, string>>
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

class GeorgeSignalAuthority {
  private snapshot: GeorgeSignalAuthoritySnapshot = this.buildSnapshot({})

  evaluate(input: SignalAuthorityInput = {}) {
    this.snapshot = this.buildSnapshot(input)
    return this.snapshot
  }

  getSnapshot() {
    return this.snapshot
  }

  clear() {
    this.snapshot = this.buildSnapshot({})
    return this.snapshot
  }

  private buildSnapshot(input: SignalAuthorityInput): GeorgeSignalAuthoritySnapshot {
    const objectiveConfidence = clamp01(input.objectiveConfidence ?? 0.62)
    const relationshipConfidence = clamp01(input.relationshipConfidence ?? 0.62)
    const strategyConfidence = clamp01(input.strategyConfidence ?? 0.58)
    const continuityConfidence = clamp01(input.continuityConfidence ?? 0.6)

    const signals: GeorgeRuntimeSignal[] = [
      {
        name: 'objective_stability',
        weight: 1 - objectiveConfidence,
        confidence: objectiveConfidence,
        polarity: objectiveConfidence >= 0.68 ? 'stabilizing' : 'destabilizing',
        reason: input.reasons?.objective_stability || 'Confidence that the user objective still matches the restored room.',
      },
      {
        name: 'relationship_pressure',
        weight: clamp01(input.roomPressure ?? 0.42),
        confidence: relationshipConfidence,
        polarity: (input.roomPressure ?? 0.42) > 0.62 ? 'destabilizing' : 'neutral',
        reason: input.reasons?.relationship_pressure || 'Pressure in the relationship or room may affect posture.',
      },
      {
        name: 'leverage_shift',
        weight: clamp01(Math.abs(input.leverageShift ?? 0.25)),
        confidence: 0.62,
        polarity: (input.leverageShift ?? 0) > 0 ? 'stabilizing' : (input.leverageShift ?? 0) < 0 ? 'destabilizing' : 'neutral',
        reason: input.reasons?.leverage_shift || 'Leverage movement can change the best strategy before the next exchange.',
      },
      {
        name: 'user_load',
        weight: clamp01(input.userLoad ?? 0.34),
        confidence: 0.6,
        polarity: (input.userLoad ?? 0.34) > 0.64 ? 'destabilizing' : 'neutral',
        reason: input.reasons?.user_load || 'User load changes how much GEORGE should reveal or compress.',
      },
      {
        name: 'interruption_risk',
        weight: clamp01(input.interruptionRisk ?? 0.3),
        confidence: 0.58,
        polarity: (input.interruptionRisk ?? 0.3) > 0.62 ? 'destabilizing' : 'neutral',
        reason: input.reasons?.interruption_risk || 'Interruption risk affects whether GEORGE should hold, whisper, or speak.',
      },
      {
        name: 'strategy_fit',
        weight: 1 - strategyConfidence,
        confidence: strategyConfidence,
        polarity: strategyConfidence >= 0.66 ? 'stabilizing' : 'destabilizing',
        reason: input.reasons?.strategy_fit || 'Confidence that the restored strategy still serves the objective.',
      },
      {
        name: 'continuity_drift',
        weight: clamp01(input.continuityDrift ?? (1 - continuityConfidence)),
        confidence: continuityConfidence,
        polarity: continuityConfidence >= 0.66 ? 'stabilizing' : 'destabilizing',
        reason: input.reasons?.continuity_drift || 'Risk that something changed between GEORGE-assisted conversations.',
      },
    ]

    const prioritySignals = [...signals]
      .sort((a, b) => (b.weight * b.confidence) - (a.weight * a.confidence))
      .slice(0, 3)

    const dominantSignal = prioritySignals[0] || null
    const postureShiftRecommended = prioritySignals.some(
      (signal) => signal.polarity === 'destabilizing' && signal.weight >= 0.48
    )

    const suggestedPosture = this.resolvePosture({
      objectiveConfidence,
      relationshipConfidence,
      strategyConfidence,
      continuityConfidence,
      prioritySignals,
      postureShiftRecommended,
    })

    return {
      signals,
      prioritySignals,
      dominantSignal,
      objectiveConfidence,
      relationshipConfidence,
      strategyConfidence,
      continuityConfidence,
      postureShiftRecommended,
      suggestedPosture,
      restoreDefault: !postureShiftRecommended && continuityConfidence >= 0.58,
      revealMode: this.resolveRevealMode({ continuityConfidence, strategyConfidence, postureShiftRecommended }),
      checkedAt: Date.now(),
    }
  }

  private resolvePosture(input: {
    objectiveConfidence: number
    relationshipConfidence: number
    strategyConfidence: number
    continuityConfidence: number
    prioritySignals: GeorgeRuntimeSignal[]
    postureShiftRecommended: boolean
  }): GeorgeSignalAuthoritySnapshot['suggestedPosture'] {
    if (input.continuityConfidence < 0.46 || input.objectiveConfidence < 0.46) return 'ask_lightly'
    if (!input.postureShiftRecommended) return 'restore_default'

    const pressure = input.prioritySignals.find((signal) => signal.name === 'relationship_pressure')
    const userLoad = input.prioritySignals.find((signal) => signal.name === 'user_load')
    const strategyFit = input.prioritySignals.find((signal) => signal.name === 'strategy_fit')

    if (userLoad && userLoad.weight >= 0.62) return 'hold'
    if (pressure && pressure.weight >= 0.62) return 'tighten'
    if (strategyFit && strategyFit.weight >= 0.5) return 'soften'

    return 'tighten'
  }

  private resolveRevealMode(input: {
    continuityConfidence: number
    strategyConfidence: number
    postureShiftRecommended: boolean
  }): GeorgeSignalAuthoritySnapshot['revealMode'] {
    if (input.continuityConfidence < 0.5 || input.strategyConfidence < 0.48) return 'ask_clarifying_checkpoint'
    if (input.postureShiftRecommended) return 'three_line_checkpoint'
    return 'short_live_checkpoint'
  }
}

export const georgeSignalAuthority = new GeorgeSignalAuthority()
