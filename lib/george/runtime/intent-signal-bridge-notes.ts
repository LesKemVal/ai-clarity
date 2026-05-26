export const GEORGE_INTENT_SIGNAL_BRIDGE_NOTES = {
  purpose:
    'Inactive mapping notes. Documents how existing runtime heuristics may eventually produce shared intent signals without changing current behavior.',

  existingHeuristicMap: [
    {
      source: 'classifyControlState',
      currentRole: 'Classifies userState, objectiveMode, and pressureLevel from latest user text.',
      futureIntentSignals: [
        'pressure_present',
        'objective_emerging',
        'operational',
        'information_gathering',
      ],
      warning:
        'Do not let control state become the sole source of truth. It should inform coordinators, not override user agency or governance.',
    },
    {
      source: 'scoreRuntimeSignals',
      currentRole: 'Scores seriousness, opportunity, confusion, and urgency.',
      futureIntentSignals: [
        'high_urgency',
        'pressure_present',
        'narrowing_ready',
        'exploratory',
      ],
      warning:
        'Scores should pressure response shaping and posture, but should not independently force tone or format.',
    },
    {
      source: 'detectLikelyBottleneck',
      currentRole: 'Finds likely governing constraint such as profile strength, conversion bottleneck, cashflow pressure, decision fog, or execution clarity.',
      futureIntentSignals: ['narrowing_ready', 'operational'],
      warning:
        'High-confidence bottlenecks can lead, but low-confidence bottlenecks should be tested lightly and never overrule user framing.',
    },
    {
      source: 'detectCadenceAvoidance',
      currentRole: 'Prevents repetitive openings and repeated GEORGE phrasing.',
      futureIntentSignals: [],
      warning:
        'This belongs to response shaping, not intent authority. It should not change meaning or objective interpretation.',
    },
    {
      source: 'detectLiveScenario',
      currentRole: 'Detects immediate LIVE or conversation-assist context.',
      futureIntentSignals: [
        'live_risk_escalation',
        'pressure_present',
        'actionable',
      ],
      warning:
        'LIVE detection should coordinate with LIVE governance. Do not let posture override silence, timing, or next-signal behavior.',
    },
  ],

  integrationRule:
    'When activated, intent signals should be produced once, then consumed by coordinators. Avoid each layer re-detecting the same condition independently.',

  noBehaviorChange:
    'This file is documentation only and is not imported into runtime.',
} as const

export type GeorgeIntentSignalBridgeNotes = typeof GEORGE_INTENT_SIGNAL_BRIDGE_NOTES
