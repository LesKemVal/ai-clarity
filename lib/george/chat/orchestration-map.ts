export const GEORGE_CHAT_ORCHESTRATION_MAP = {
  activeRuntimes: {
    normalGeorge: {
      description: 'Normal GEORGE handles direction, execution, continuity, anti-drift, planning, writing, and practical decision support.',
      primaryModules: [
        'current-runtime-policy',
        'runtime-signals',
        'response-shaping',
        'continuity-governance',
      ],
    },
    liveGeorge: {
      description: 'LIVE GEORGE handles individual real-time conversational support, pressure, timing, cadence, response shaping, and next moves.',
      primaryModules: [
        'current-runtime-policy',
        'live-context',
        'response-shaping',
        'continuity-governance',
      ],
    },
  },
  shelvedRuntimes: {
    proLive: {
      description: 'Pro LIVE campaign/firm-mode logic is shelved. It must not govern current runtime behavior.',
      boundaryModule: 'pro-live-boundary',
      futureUse: [
        'telephone/service operator assistance',
        'professional conversation support',
        'structured team workflows',
        'compliance-aware scripting when deliberately reinstated',
      ],
    },
  },
  moduleResponsibilities: {
    'runtime-signals': [
      'control-state classification',
      'runtime signal scoring',
      'bottleneck detection',
      'builder subtype detection',
      'cadence avoidance',
      'live-scenario detection',
    ],
    'current-runtime-policy': [
      'normalize current mode',
      'prevent shelved campaign logic from governing current runtime',
      'define normal GEORGE vs LIVE GEORGE active runtime',
    ],
    'live-context': [
      'individual LIVE room classification',
      'telephone/service operator support primitives',
      'pressure/context-specific runtime notes',
    ],
    'response-shaping': [
      'sentence compression policy',
      'LIVE vs normal output posture',
      'format preference',
      'avoid/prefer guidance',
    ],
    'continuity-governance': [
      'separate session signal from durable memory',
      'prevent silent goal inference',
      'guard LIVE transcript and third-party speech from becoming durable continuity without explicit action',
    ],
    'pro-live-boundary': [
      'document shelved Pro LIVE doctrine',
      'preserve future resurrection path',
      'block campaign/firm assumptions in current runtime',
    ],
  },
} as const

export function getGeorgeChatOrchestrationMap() {
  return GEORGE_CHAT_ORCHESTRATION_MAP
}
