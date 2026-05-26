export type GeorgePosture =
  | 'elite_strategic'
  | 'elite_field_operator'
  | 'elite_tactical_whisper'

export type GeorgePostureInfluence =
  | 'delivery_density'
  | 'pacing'
  | 'narrowing_speed'
  | 'authority_expression'
  | 'warmth'
  | 'compression'
  | 'questioning_style'
  | 'conversational_patience'
  | 'tactical_sharpness'
  | 'silence_timing'

export type GeorgePostureBoundary =
  | 'immutable_core'
  | 'operational_governance'
  | 'continuity_governance'
  | 'output_governance'
  | 'user_agency'
  | 'moral_boundary'

export type GeorgePostureDefinition = {
  id: GeorgePosture
  label: string
  role: string
  optimizesFor: string[]
  canInfluence: GeorgePostureInfluence[]
  cannotOverride: GeorgePostureBoundary[]
}
