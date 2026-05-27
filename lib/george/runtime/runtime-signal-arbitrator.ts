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
  posture: 'warn_and_move' | 'protect_objective' | 'compress' | 'restore_context' | 'steady' | 'direct'
  delivery: 'minimal' | 'short' | 'structured' | 'normal'
  agency: 'user_decides' | 'light_confirmation' | 'strong_warning'
  note: string
}

export function arbitrateRuntimeSignals(
  input: RuntimeSignalArbitrationInput
): RuntimeSignalArbitration {
  const winner = resolveWinner(input)
  const arbitration = buildArbitration(winner, input)

  return {
    ...arbitration,
    note: buildRuntimeSignalArbitrationNote(winner, arbitration),
  }
}

function resolveWinner(input: RuntimeSignalArbitrationInput): RuntimeSignalPriority {
  if (input.explicitUserSignal) return 'user_explicit_signal'
  if (input.safetyOrDamageRisk) return 'safety_or_damage_risk'
  if (input.objectiveRisk) return 'objective_protection'
  if (input.earbudActive) return 'earbud_delivery'
  if (input.continuitySensitive) return 'continuity_restoration'
  if (input.livePressure) return 'pressure_response'
  if (input.emotionalCareNeeded) return 'emotional_calibration'
  return 'default_runtime_posture'
}

function buildArbitration(
  winner: RuntimeSignalPriority,
  input: RuntimeSignalArbitrationInput
): Omit<RuntimeSignalArbitration, 'note'> {
  switch (winner) {
    case 'user_explicit_signal':
      return {
        winner,
        posture: input.shouldNarrow ? 'direct' : 'steady',
        delivery: input.earbudActive ? 'minimal' : input.shouldCompress ? 'short' : 'normal',
        agency: 'user_decides',
      }
    case 'safety_or_damage_risk':
      return {
        winner,
        posture: 'warn_and_move',
        delivery: input.earbudActive ? 'minimal' : 'short',
        agency: 'strong_warning',
      }
    case 'objective_protection':
      return {
        winner,
        posture: 'protect_objective',
        delivery: input.shouldCompress || input.earbudActive ? 'short' : 'structured',
        agency: 'light_confirmation',
      }
    case 'earbud_delivery':
      return {
        winner,
        posture: 'compress',
        delivery: 'minimal',
        agency: 'user_decides',
      }
    case 'continuity_restoration':
      return {
        winner,
        posture: 'restore_context',
        delivery: input.earbudActive ? 'minimal' : 'short',
        agency: 'light_confirmation',
      }
    case 'pressure_response':
      return {
        winner,
        posture: 'direct',
        delivery: input.shouldCompress ? 'short' : 'structured',
        agency: 'user_decides',
      }
    case 'emotional_calibration':
      return {
        winner,
        posture: 'steady',
        delivery: input.shouldCompress ? 'short' : 'normal',
        agency: 'user_decides',
      }
    default:
      return {
        winner,
        posture: input.shouldNarrow ? 'direct' : 'steady',
        delivery: input.shouldCompress ? 'short' : 'normal',
        agency: 'user_decides',
      }
  }
}

function buildRuntimeSignalArbitrationNote(
  winner: RuntimeSignalPriority,
  arbitration: Omit<RuntimeSignalArbitration, 'note'>
) {
  return `
RUNTIME SIGNAL ARBITRATION
- Final winning signal: ${winner}.
- Posture: ${arbitration.posture}.
- Delivery: ${arbitration.delivery}.
- Agency mode: ${arbitration.agency}.
- Use this as the final runtime priority when other guidance conflicts.
- Explicit user signal usually wins, unless safety, legal, reputational, or severe leverage damage requires a warning.
- GEORGE may warn strongly, but should not countermand the user. Warn, orient, then move with the user.
- If earbud delivery wins, keep phrasing short enough to understand in motion or pressure.
- If continuity restoration wins, restore the room briefly; do not recap the transcript.
`.trim()
}
