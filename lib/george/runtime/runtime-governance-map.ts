export const GEORGE_RUNTIME_GOVERNANCE_MAP = {
  purpose:
    'Active architecture map for canonical GEORGE runtime decision assembly and collision boundaries.',
  status: 'active',
  sharedIntelligenceDoctrine: {
    rule:
      'GEORGE is one operational intelligence. Normal and LIVE use the same canonical reasoning chain and do not own separate intelligence, judgment, strategy, or user understanding.',
    executionBoundary:
      'Normal and LIVE diverge at execution realization. Operating mode changes constraints, timing, interaction, and delivery; it does not create a second reasoning pipeline.',
    downstreamRule:
      'Presentation, delivery, receiver policy, and rendering consume resolved execution authority and may not reinterpret or replace upstream reasoning.',
  },
  canonicalDecisionOrder: [
    'outcome_inference',
    'outcome_evolution',
    'trajectory_assessment',
    'operational_judgment',
    'conversation_strategy',
    'conversation_move_resolution',
    'context_framing',
    'live_recommendation_presentation',
    'operational_resource_monitor',
    'execution_policy',
    'runtime_context_composition',
    'model_generation',
    'post_response_governance',
  ],
  collisionZones: [
    {
      zone: 'shared_reasoning_ownership',
      owner: 'canonical_runtime_pipeline_and_stage_owners',
      rule:
        'Normal and LIVE may apply operating constraints and recommendation thresholds, but may not create parallel outcome, judgment, strategy, or user-understanding ownership.',
    },
    {
      zone: 'mode_execution_boundary',
      owner: 'execution_policy',
      rule:
        'Execution policy is the canonical branch point between shared reasoning and mode-specific realization. Normal and LIVE execute the same resolved intelligence under different operating constraints.',
    },
    {
      zone: 'outcome_ownership',
      owner: 'active_outcome_and_outcome_evolution',
      rule: 'Downstream systems consume canonical outcome state and may not independently replace it.',
    },
    {
      zone: 'conversational_move',
      owner: 'conversation_strategy_and_move_library',
      rule: 'OpenAI realizes the selected move contextually but may not silently substitute another strategy.',
    },
    {
      zone: 'execution_realization',
      owner: 'execution_policy',
      rule: 'Presentation and delivery render the policy; they do not recompute it.',
    },
    {
      zone: 'operational_resources',
      owner: 'operational_resource_monitor',
      rule: 'The UI renders ranked resources and does not create independent readiness or recommendation logic.',
    },
    {
      zone: 'runtime_coordination',
      owner: 'runtime_pipeline',
      rule: 'Routes coordinate upstream signal collection and consume one pipeline snapshot rather than reproducing the decision sequence.',
    },
  ],
  activeRule:
    'One GEORGE reasons through one canonical chain. One canonical owner decides each runtime surface. Coordinators sequence owners; mode-specific executors apply operating constraints; consumers render resolved outputs.',
} as const

export type GeorgeRuntimeGovernanceMap = typeof GEORGE_RUNTIME_GOVERNANCE_MAP
