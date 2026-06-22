export type GeorgeCueCategory =
  | 'transportation_constraint'
  | 'budget_constraint'
  | 'authority_constraint'
  | 'timeline_constraint'
  | 'information_gap'
  | 'trust_concern'
  | 'access_constraint'
  | 'resource_constraint'
  | 'pricing'
  | 'objection'
  | 'clarification'
  | 'uncertainty'
  | 'stall'
  | 'timeline'
  | 'agreement'
  | 'pressure'

export type GeorgeOperationalSignal =
  | 'constraint'
  | 'risk'
  | 'opportunity'
  | 'decision'
  | 'information_gap'
  | 'pressure'
  | 'agreement'
  | 'objection'

export type GeorgeLocalCue = {
  cue: string
  reason: string
  category: GeorgeCueCategory
  confidence: number
  priority: number
  operationalSignal?: GeorgeOperationalSignal
  obstacle?: string
  supportStrategy?: string
}
