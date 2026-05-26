export const GEORGE_RUNTIME_PIPELINE = {
  purpose:
    'Inactive architecture model. Defines the future canonical GEORGE runtime flow before active integration.',

  stages: [
    {
      id: 'signal_intake',
      role: 'Read user message, source, mode, prompt context, tier, message history, and live state.',
      may: ['observe', 'classify raw inputs'],
      mayNot: ['decide final tone', 'override user agency', 'apply final output constraints'],
      currentExamples: [
        'latestUserRaw',
        'latestUserSource',
        'promptContext',
        'tier',
        'messages',
      ],
    },
    {
      id: 'intent_interpretation',
      role: 'Translate raw signals into shared intent signals such as operational, exploratory, actionable, pressure_present, or objective_emerging.',
      may: ['advise coordinators', 'reduce duplicate detection'],
      mayNot: ['generate final behavior independently', 'replace runtime governance'],
      currentExamples: [
        'classifyControlState',
        'scoreRuntimeSignals',
        'detectLikelyBottleneck',
        'detectLiveScenario',
      ],
    },
    {
      id: 'governance_coordination',
      role: 'Apply immutable boundaries, operational ownership, continuity governance, output governance, and LIVE governance.',
      may: ['constrain', 'coordinate', 'prioritize competing signals'],
      mayNot: ['be bypassed by posture', 'be duplicated by downstream prompt layers'],
      currentExamples: [
        'continuityGovernanceNote',
        'outputGovernanceNote',
        'liveDisciplineBlock',
        'runtime governance ownership map',
      ],
    },
    {
      id: 'posture_adaptation',
      role: 'Select or blend elite posture expression based on intent, pressure, user readiness, and context.',
      may: ['shape pacing', 'shape warmth', 'shape narrowing speed', 'shape authority expression', 'shape tactical density'],
      mayNot: ['override immutable core', 'override LIVE timing', 'own safety boundaries', 'confiscate user agency'],
      currentExamples: [
        'future posture scaffolding',
        'elite strategic',
        'elite field operator',
        'elite tactical whisper',
      ],
    },
    {
      id: 'response_shaping',
      role: 'Decide surface format, density, compression, structure, and final delivery shape.',
      may: ['coordinate final expression', 'apply compression', 'choose structure'],
      mayNot: ['violate governance boundaries', 'ignore LIVE constraints'],
      currentExamples: [
        'getCurrentResponseShape',
        'buildResponseShapeNote',
        'delivery-foresight-block',
      ],
    },
    {
      id: 'model_generation',
      role: 'Generate the actual assistant reply from the assembled system content and recent messages.',
      may: ['produce answer', 'adapt language naturally'],
      mayNot: ['invent authority over immutable core', 'ignore system constraints'],
      currentExamples: [
        'OpenAI chat completions',
        'OpenAI responses for image input',
      ],
    },
    {
      id: 'post_response_governance',
      role: 'Append capacity notices and intent-aware risk notices after generation when needed.',
      may: ['append limited notices', 'protect users from high-risk misuse', 'signal continuity limits'],
      mayNot: ['fire on mere keyword mentions', 'overwhelm ordinary answers', 'replace GEORGE tone with generic disclaimer tone'],
      currentExamples: [
        'appendPostResponseNotices',
        'buildCapacityNotice',
        'buildRiskNotice',
      ],
    },
  ],

  ownershipPrinciple:
    'One layer should coordinate a behavioral surface; other layers should inform. Avoid governance collisions.',

  posturePrinciple:
    'Posture is an adaptive expression layer, not a constitutional authority.',

  integrationRule:
    'Do not activate new runtime stages until the owning coordinator and downstream effects are explicit and tested.',
} as const

export type GeorgeRuntimePipeline = typeof GEORGE_RUNTIME_PIPELINE
