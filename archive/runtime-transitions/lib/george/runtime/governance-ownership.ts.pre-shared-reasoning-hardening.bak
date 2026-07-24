export const GEORGE_RUNTIME_GOVERNANCE_OWNERSHIP = {
  purpose:
    'Active ownership map for GEORGE runtime constraints, decisions, coordination, presentation, and delivery.',
  status: 'active',
  hardConstraints: {
    owners: [
      'immutable_core',
      'moral_boundary',
      'user_agency',
      'safety_and_risk_boundaries',
      'continuity_integrity',
    ],
    rule:
      'Hard constraints cannot be overridden by outcome, strategy, execution, presentation, delivery, tier, or posture layers.',
  },
  canonicalOwners: [
    { layer: 'active_outcome', owns: ['initial outcome inference'] },
    { layer: 'outcome_evolution', owns: ['outcome continuity', 'phase transitions', 'constraint and preference preservation'] },
    { layer: 'trajectory_engine', owns: ['likely next moves', 'future operational needs'] },
    { layer: 'operational_judgment', owns: ['governing operational action', 'LIVE recommendation posture'] },
    { layer: 'conversation_strategy', owns: ['highest-value conversational move selection'] },
    { layer: 'conversation_move_library', owns: ['move semantics', 'assumption sensitivity', 'compatibility'] },
    { layer: 'execution_policy', owns: ['realization mode', 'depth', 'repetition', 'resource usage'] },
    { layer: 'operational_resource_monitor', owns: ['ranked operational resources'] },
    { layer: 'context_framing', owns: ['user-facing situational orientation'] },
    { layer: 'response_shaping', owns: ['format', 'baseline compression', 'response density'] },
    { layer: 'output_governance', owns: ['visible output boundaries and discipline'] },
    { layer: 'presentation_authority', owns: ['semantic rendering and enforced presentation placement'] },
    { layer: 'LIVE_governance', owns: ['LIVE timing', 'silence', 'support behavior', 'delivery constraints'] },
    { layer: 'continuity_governance', owns: ['continuity interpretation and restoration framing'] },
  ],
  coordinators: [
    {
      layer: 'runtime_pipeline',
      owns: ['canonical decision sequence', 'immutable runtime snapshot'],
      cannotOwn: ['stage business logic', 'provider language', 'UI rendering'],
    },
    {
      layer: 'runtime_context_composer',
      owns: ['ordered prompt-context assembly'],
      cannotOwn: ['runtime decisions', 'strategy selection', 'execution policy'],
    },
  ],
  integrationRule:
    'When multiple layers influence the same surface, the canonical owner decides, coordinators sequence, and downstream consumers render without recomputation.',
} as const

export type GeorgeRuntimeGovernanceOwnership = typeof GEORGE_RUNTIME_GOVERNANCE_OWNERSHIP
