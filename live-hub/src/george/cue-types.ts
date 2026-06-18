export type GeorgeCueCategory =
  | 'pricing'
  | 'objection'
  | 'clarification'
  | 'uncertainty'
  | 'stall'
  | 'timeline'
  | 'agreement'
  | 'pressure'

export type GeorgeLocalCue = {
  cue: string
  reason: string
  category: GeorgeCueCategory
  confidence: number
  priority: number
}
