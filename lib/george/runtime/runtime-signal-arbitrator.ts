export type RuntimeSignalPriority =
  | 'user_explicit_signal'
  | 'safety_or_damage_risk'
  | 'objective_protection'
  | 'earbud_delivery'
  | 'continuity_restoration'
  | 'pressure_response'
  | 'emotional_calibration'
  | 'default_runtime_posture'

export type RuntimeSignalArbitrationInput = {
  explicitUserSignal?: boolean
  safetyOrDamageRisk?: boolean
  objectiveRisk?: boolean
  earbudActive?: boolean
  continuitySensitive?: boolean
  livePressure?: boolean
  emotionalCareNeeded?: boolean
  shouldCompress?: boolean
  shouldNarrow?: boolean
  currentRuntime?: string
}

export type RuntimeSignalArbitration = {
  winner: RuntimeSignalPriority
  posture:
    | 'warn_and_move'
    | 'protect_objective'
    | 'compress'
    | 'restore_context'
    | 'steady'
    | 'direct'
  delivery: 'minimal' | 'short' | 'structured' | 'normal'
  agency: 'user_decides' | 'light_confirmation' | 'strong_warning'
  note: string
}

export function arbitrateRuntimeSignals(
  input: RuntimeSignalArbitrationInput
): RuntimeSignalArbitration {
  const winner = resolveWinner(input)

  const posture =
    winner === 'safety_or_damage_risk'
      ? 'warn_and_move'
      : winner === 'objective_protection'
        ? 'protect_objective'
        : winner === 'earbud_delivery'
          ? 'compress'
          : winner === 'continuity_restoration'
            ? 'restore_context'
            : input.shouldNarrow
              ? 'direct'
              : 'steady'

  const delivery =
    winner === 'earbud_delivery'
      ? 'minimal'
      : input.shouldCompress
        ? 'short'
        : winner === 'objective_protection'
          ? 'structured'
          : 'normal'

  const agency =
    winner === 'safety_or_damage_risk'
      ? 'strong_warning'
      : winner === 'continuity_restoration'
        ? 'light_confirmation'
        : 'user_decides'

  return {
    winner,
    posture,
    delivery,
    agency,
    note: buildRuntimeSignalArbitrationNote(
      winner,
      posture,
      delivery,
      agency
    ),
  }
}

function resolveWinner(
  input: RuntimeSignalArbitrationInput
): RuntimeSignalPriority {
  if (input.explicitUserSignal) return 'user_explicit_signal'
  if (input.safetyOrDamageRisk) return 'safety_or_damage_risk'
  if (input.objectiveRisk) return 'objective_protection'
  if (input.earbudActive) return 'earbud_delivery'
  if (input.continuitySensitive) return 'continuity_restoration'
  if (input.livePressure) return 'pressure_response'
  if (input.emotionalCareNeeded) return 'emotional_calibration'
  return 'default_runtime_posture'
}

function buildRuntimeSignalArbitrationNote(
  winner: RuntimeSignalPriority,
  posture: string,
  delivery: string,
  agency: string
) {
  return `
RUNTIME SIGNAL ARBITRATION
- Final governing signal: ${winner}
- Delivery posture: ${posture}
- Delivery density: ${delivery}
- Agency posture: ${agency}
- Use this as final runtime priority when signals conflict.
- Explicit user signals usually win unless major damage risk exists.
- Warn clearly when necessary, then move with the user.
- Earbud delivery should remain concise and operational.
`.trim()
}
