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
