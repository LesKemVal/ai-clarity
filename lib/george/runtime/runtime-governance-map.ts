export const GEORGE_RUNTIME_GOVERNANCE_MAP = {
  purpose:
    'Active architecture map for canonical GEORGE runtime decision assembly and collision boundaries.',
  status: 'active',
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
    'One canonical owner decides each runtime surface. Coordinators sequence owners; consumers render their outputs.',
} as const

export type GeorgeRuntimeGovernanceMap = typeof GEORGE_RUNTIME_GOVERNANCE_MAP
