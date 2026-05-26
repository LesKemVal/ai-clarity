export const GEORGE_RUNTIME_GOVERNANCE_MAP = {
  purpose:
    'Inactive architecture map. Documents current runtime assembly order and governance collision boundaries before posture wiring.',

  currentAssemblyOrder: [
    'languageRule',
    'modeBlock',
    'shelvedCampaignRuntimeNote',
    'individualLiveContextNote',
    'responseShapeNote',
    'continuityGovernanceNote',
    'outputGovernanceNote',
    'SYSTEM_PROMPT',
    'messageSourceBlock',
    'controlStateBlock',
    'runtimeScoresBlock',
    'scoreAwareSteeringBlock',
    'conversationEngineRulesBlock',
    'universalLiveOpeningBlock',
    'liveDisciplineBlock',
    'dynamicRuntimeBlocks',
  ],

  collisionZones: [
    {
      zone: 'length_and_compression',
      influencedBy: [
        'responseShapeNote',
        'outputGovernanceNote',
        'scoreAwareSteeringBlock',
        'conversationEngineRulesBlock',
        'liveDisciplineBlock',
        'dynamicRuntimeBlocks',
      ],
      rule: 'Future posture must coordinate compression here, not add another independent compression layer.',
    },
    {
      zone: 'next_move_priority',
      influencedBy: [
        'SYSTEM_PROMPT',
        'scoreAwareSteeringBlock',
        'conversationEngineRulesBlock',
        'liveDisciplineBlock',
        'dynamicRuntimeBlocks',
      ],
      rule: 'Posture may shape next-move expression but should not override operational governance.',
    },
    {
      zone: 'continuity_and_memory',
      influencedBy: [
        'continuityGovernanceNote',
        'postResponseCapacityNotice',
      ],
      rule: 'Future continuity changes should avoid duplicate warnings or degraded-memory language.',
    },
    {
      zone: 'risk_disclaimer_surface',
      influencedBy: ['postResponseRiskDisclaimer'],
      rule: 'Legal and medical safety notices are appended after generation. If rewritten later, preserve safety while fitting GEORGE tone.',
    },
    {
      zone: 'live_behavior',
      influencedBy: [
        'individualLiveContextNote',
        'conversationEngineRulesBlock',
        'universalLiveOpeningBlock',
        'liveDisciplineBlock',
        'dynamicRuntimeBlocks',
      ],
      rule: 'Do not wire posture into LIVE until it respects existing LIVE compression, silence, exact-line, and next-signal behavior.',
    },
  ],

  postureIntegrationRule:
    'Posture should become a coordinator over delivery, pacing, narrowing speed, warmth, compression, questioning style, and tactical sharpness. It should not become a parallel system fighting response shaping, output governance, or LIVE governance.',

  activeRule:
    'Before adding posture to runtime, identify which existing governance layer owns each output decision. One owner should coordinate; other layers should inform.',
} as const

export type GeorgeRuntimeGovernanceMap = typeof GEORGE_RUNTIME_GOVERNANCE_MAP
