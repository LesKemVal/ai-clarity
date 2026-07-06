export type OperationalSignalKind =
  | 'hesitation'
  | 'pressure_rising'
  | 'trust_rising'
  | 'trust_declining'
  | 'resistance'
  | 'decision_readiness'
  | 'objective_threatened'
  | 'information_missing'
  | 'commitment_forming'
  | 'interruption_attempt'
  | 'authority_pressure'
  | 'proof_challenge'

export type OperationalSignalStrength = 'weak' | 'moderate' | 'strong'

export type OperationalSignalSource =
  | 'conversation'
  | 'room'
  | 'objective'
  | 'preparation'
  | 'runtime'
  | 'user'

export type OperationalSignal = {
  kind: OperationalSignalKind
  strength: OperationalSignalStrength
  source: OperationalSignalSource
  confidence: number
  evidence?: string
}


export function hasOperationalSignal(
  signals: OperationalSignal[] | null | undefined,
  kind: OperationalSignalKind
) {
  return Boolean(signals?.some((signal) => signal.kind === kind))
}

export function getOperationalSignal(
  signals: OperationalSignal[] | null | undefined,
  kind: OperationalSignalKind
) {
  return signals?.find((signal) => signal.kind === kind) || null
}

export function strongestOperationalSignal(
  signals: OperationalSignal[] | null | undefined
) {
  if (!signals?.length) return null

  return [...signals].sort((a, b) => b.confidence - a.confidence)[0] || null
}
