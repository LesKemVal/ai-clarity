export type GeorgeIntentSignal =
  | 'exploratory'
  | 'operational'
  | 'actionable'
  | 'decision_proximate'
  | 'pressure_present'
  | 'high_urgency'
  | 'continuity_dependent'
  | 'objective_emerging'
  | 'narrowing_ready'
  | 'emotionally_loaded'
  | 'live_risk_escalation'
  | 'information_gathering'

export type GeorgeIntentOwnership =
  | 'runtime_signals'
  | 'response_shaping'
  | 'live_governance'
  | 'continuity_governance'
  | 'future_posture'
  | 'output_governance'

export type GeorgeIntentSignalDefinition = {
  id: GeorgeIntentSignal
  description: string
  informs: GeorgeIntentOwnership[]
  cannotOverride?: string[]
}

export const GEORGE_INTENT_SIGNAL_MAP: Record<
  GeorgeIntentSignal,
  GeorgeIntentSignalDefinition
> = {
  exploratory: {
    id: 'exploratory',
    description:
      'User is exploring possibilities, understanding, or options without immediate execution pressure.',
    informs: ['response_shaping', 'future_posture'],
  },

  operational: {
    id: 'operational',
    description:
      'User wants movement, execution, sequencing, or a usable next move.',
    informs: [
      'runtime_signals',
      'response_shaping',
      'future_posture',
    ],
  },

  actionable: {
    id: 'actionable',
    description:
      'User is close enough to execution that precision, warnings, timing, or next actions matter.',
    informs: [
      'runtime_signals',
      'output_governance',
      'response_shaping',
    ],
  },

  decision_proximate: {
    id: 'decision_proximate',
    description:
      'A real decision appears near. Consequences, tradeoffs, or commitment are likely imminent.',
    informs: [
      'runtime_signals',
      'response_shaping',
      'future_posture',
    ],
  },

  pressure_present: {
    id: 'pressure_present',
    description:
      'User is operating under emotional, financial, relational, social, or situational pressure.',
    informs: [
      'runtime_signals',
      'future_posture',
      'live_governance',
    ],
  },

  high_urgency: {
    id: 'high_urgency',
    description:
      'The situation appears time-sensitive or rapidly escalating.',
    informs: [
      'runtime_signals',
      'live_governance',
      'response_shaping',
    ],
  },

  continuity_dependent: {
    id: 'continuity_dependent',
    description:
      'Good guidance depends heavily on prior context or persistent thread memory.',
    informs: [
      'continuity_governance',
      'response_shaping',
    ],
  },

  objective_emerging: {
    id: 'objective_emerging',
    description:
      'The user objective exists but has not fully surfaced yet.',
    informs: [
      'future_posture',
      'response_shaping',
    ],
  },

  narrowing_ready: {
    id: 'narrowing_ready',
    description:
      'The user appears ready for stronger narrowing, prioritization, or commitment.',
    informs: [
      'future_posture',
      'response_shaping',
      'runtime_signals',
    ],
  },

  emotionally_loaded: {
    id: 'emotionally_loaded',
    description:
      'Emotion is materially affecting interpretation, pacing, risk, or communication.',
    informs: [
      'future_posture',
      'live_governance',
      'response_shaping',
    ],
  },

  live_risk_escalation: {
    id: 'live_risk_escalation',
    description:
      'LIVE conversation conditions may escalate consequences or interpersonal risk.',
    informs: [
      'live_governance',
      'runtime_signals',
      'output_governance',
    ],
  },

  information_gathering: {
    id: 'information_gathering',
    description:
      'The user is primarily collecting understanding before action.',
    informs: [
      'response_shaping',
      'future_posture',
    ],
  },
} as const

export const GEORGE_INTENT_SIGNAL_RULES = {
  purpose:
    'Inactive architecture scaffold. This file defines future intent-signal vocabulary and governance ownership boundaries before runtime integration.',

  ownershipRule:
    'Intent signals should inform governance layers, not independently generate behavior.',

  postureRule:
    'Future posture may adapt delivery based on intent signals, but posture should not become the source of truth for operational risk.',

  integrationRule:
    'Before runtime integration, define which coordinator owns each downstream behavioral adjustment.',
} as const
