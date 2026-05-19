export type InterventionEffectiveness =
  | 'helpful'
  | 'neutral'
  | 'overload'
  | 'destabilizing'
  | 'stabilizing'

export function classifyInterventionEffect(input: {
  perception?: string
  trustMovement?: string
  interruptionRisk?: number
  emotionalVelocity?: string
  recovery?: string
}): InterventionEffectiveness {
  if (
    input.perception === 'strengthening' &&
    input.trustMovement === 'rising'
  ) {
    return 'helpful'
  }

  if (
    input.recovery === 'defensive_spiral' ||
    input.interruptionRisk && input.interruptionRisk > 0.82
  ) {
    return 'overload'
  }

  if (
    input.emotionalVelocity === 'spiking' &&
    input.perception === 'weakening'
  ) {
    return 'destabilizing'
  }

  if (
    input.emotionalVelocity === 'rising' &&
    input.perception === 'stable'
  ) {
    return 'stabilizing'
  }

  return 'neutral'
}
