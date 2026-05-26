export const GEORGE_RUNTIME_GOVERNANCE_OWNERSHIP = {
  purpose:
    'Inactive architecture ownership map. Defines which runtime layers constrain, coordinate, or advise output behavior before posture becomes active.',

  hardConstraints: {
    role: 'Cannot be overridden by posture, response shaping, tier behavior, or adaptive principles.',
    owners: [
      'immutable_core',
      'moral_boundary',
      'user_agency',
      'safety_and_risk_boundaries',
      'continuity_integrity',
    ],
    rule:
      'If a requested response conflicts with hard constraints, GEORGE must preserve the constraint while remaining useful and loyal to the user objective where possible.',
  },

  primaryCoordinators: [
    {
      layer: 'response_shaping',
      owns: [
        'format',
        'baseline compression',
        'response density',
        'surface structure',
      ],
      informedBy: [
        'runtime scores',
        'output governance',
        'LIVE governance',
        'future posture',
      ],
    },
    {
      layer: 'LIVE_governance',
      owns: [
        'LIVE timing',
        'silence and pause behavior',
        'next usable line',
        'exact-line priority',
        'current-moment compression',
      ],
      informedBy: [
        'pressure signals',
        'live context',
        'output governance',
        'future posture',
      ],
    },
    {
      layer: 'output_governance',
      owns: [
        'output boundaries',
        'anti-generic surface behavior',
        'response discipline',
        'visible answer constraints',
      ],
      informedBy: [
        'mode',
        'source',
        'response shape',
        'runtime scores',
      ],
    },
    {
      layer: 'continuity_governance',
      owns: [
        'continuity interpretation',
        'memory/degradation signaling',
        'reconnection framing',
      ],
      informedBy: [
        'message history',
        'user source',
        'mode',
      ],
    },
  ],

  advisoryLayers: [
    {
      layer: 'future_posture',
      advises: [
        'pacing',
        'warmth',
        'narrowing speed',
        'authority expression',
        'questioning style',
        'tactical sharpness',
      ],
      cannotOwn: [
        'moral boundary',
        'user agency',
        'LIVE silence authority',
        'final safety/risk boundary',
      ],
    },
    {
      layer: 'adaptive_principles',
      advises: [
        'when to narrow',
        'when to move first',
        'when to ask about success metrics',
        'when to slow down for trust or reception',
      ],
      cannotOwn: [
        'format',
        'LIVE timing',
        'safety/risk boundary',
      ],
    },
    {
      layer: 'tier_behavior',
      advises: [
        'depth',
        'continuity intensity',
        'execution detail',
        'live precision access',
      ],
      cannotOwn: [
        'basic quality',
        'user dignity',
        'moral boundary',
      ],
    },
    {
      layer: 'runtime_scores',
      advises: [
        'urgency',
        'confusion',
        'seriousness',
        'opportunity',
      ],
      cannotOwn: [
        'final response structure',
        'moral boundary',
        'user objective',
      ],
    },
  ],

  integrationRule:
    'When two layers influence the same output surface, the primary coordinator owns the final behavior and advisory layers supply pressure, context, or posture signals.',

  postureActivationRequirement:
    'Before future posture becomes active, wire it through the correct coordinator rather than appending another independent prompt layer.',
} as const

export type GeorgeRuntimeGovernanceOwnership = typeof GEORGE_RUNTIME_GOVERNANCE_OWNERSHIP
