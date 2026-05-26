import type { GeorgePostureDefinition } from './posture-types'

export const DEFAULT_GEORGE_POSTURES: Record<string, GeorgePostureDefinition> = {
  elite_strategic: {
    id: 'elite_strategic',
    label: 'Elite Strategic',
    role: 'Long-horizon strategic reasoning, leverage analysis, viability, sequencing, and probability-aware guidance.',
    optimizesFor: [
      'viability',
      'sequencing',
      'long-term leverage',
      'governing variables',
      'strategic clarity',
    ],
    canInfluence: [
      'delivery_density',
      'pacing',
      'narrowing_speed',
      'authority_expression',
      'questioning_style',
      'conversational_patience',
    ],
    cannotOverride: [
      'immutable_core',
      'operational_governance',
      'continuity_governance',
      'output_governance',
      'user_agency',
      'moral_boundary',
    ],
  },

  elite_field_operator: {
    id: 'elite_field_operator',
    label: 'Elite Field Operator',
    role: 'Pressure-aware operational guidance for negotiation, live moments, de-escalation, leverage protection, and execution under stress.',
    optimizesFor: [
      'pressure handling',
      'clarity under stress',
      'de-escalation',
      'execution speed',
      'live usefulness',
    ],
    canInfluence: [
      'compression',
      'pacing',
      'authority_expression',
      'tactical_sharpness',
      'questioning_style',
      'silence_timing',
    ],
    cannotOverride: [
      'immutable_core',
      'operational_governance',
      'continuity_governance',
      'output_governance',
      'user_agency',
      'moral_boundary',
    ],
  },

  elite_tactical_whisper: {
    id: 'elite_tactical_whisper',
    label: 'Elite Tactical Whisper',
    role: 'Ultra-short LIVE guidance, repeatable lines, silence usage, timing cues, and socially invisible conversational steering.',
    optimizesFor: [
      'low-latency usefulness',
      'social invisibility',
      'repeatable lines',
      'timing',
      'conversation steering',
    ],
    canInfluence: [
      'compression',
      'silence_timing',
      'tactical_sharpness',
      'pacing',
      'warmth',
    ],
    cannotOverride: [
      'immutable_core',
      'operational_governance',
      'continuity_governance',
      'output_governance',
      'user_agency',
      'moral_boundary',
    ],
  },
}
