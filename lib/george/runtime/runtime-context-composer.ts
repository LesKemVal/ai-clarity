export type GovernedRuntimeContextInput = {
  liveRuntimeContext?: string | null
  shelvedCampaignRuntimeNote?: string | null
  individualLiveContextNote?: string | null
  runtimeAdapterNote?: string | null
  earbudRuntimeNote?: string | null
  runtimeSignalArbitrationNote?: string | null
  arbitrationResponseShapeNote?: string | null
  adaptiveUserProfileNote?: string | null
  durableBehavioralMemoryNote?: string | null
  runtimeOutcomeLearningNote?: string | null
  continuityRestorationNote?: string | null
  judgmentSurfaceNote?: string | null
  trajectoryNote?: string | null
  operationalJudgmentNote?: string | null
  outcomeEvolutionNote?: string | null
  conversationStrategyNote?: string | null
  conversationMoveDefinitionNote?: string | null
  executionPolicyNote?: string | null
  contextFramingNote?: string | null
  liveRecommendationPresentationNote?: string | null
  responseShapeNote?: string | null
  continuityGovernanceNote?: string | null
  outputGovernanceNote?: string | null
  presentationAuthorityNote?: string | null
}

export type ProviderExecutionAuthorityInput = {
  runtime: 'normal_george' | 'live_george'
  action: string
  strategyMove: string
  strategyPurpose: string
  executionType: string
  audience: string
  normalPosture?: string
  explanationDepth: string
  assumptionHandling: string
  repetitionPolicy: string
  signalShouldAcquire: boolean
  requestedSignal?: string
  signalReason: string
  opportunityTitle?: string
  opportunityReadiness?: number
  opportunityThresholdMet?: boolean
}

export function buildProviderExecutionAuthority(
  input: ProviderExecutionAuthorityInput
) {
  const opportunity = input.opportunityTitle
    ? `${input.opportunityTitle} (${input.opportunityReadiness ?? 0}% ready${
        input.opportunityThresholdMet ? ', threshold met' : ''
      })`
    : 'none'

  return `
PROVIDER EXECUTION AUTHORITY
- Runtime: ${input.runtime}
- Audience: ${input.audience}
- Operational action: ${input.action}
- Selected conversational move: ${input.strategyMove}
- Purpose: ${input.strategyPurpose}
- Execution type: ${input.executionType}
- Normal execution posture: ${input.normalPosture || 'not applicable'}
- Explanation depth: ${input.explanationDepth}
- Assumption handling: ${input.assumptionHandling}
- Repetition policy: ${input.repetitionPolicy}
- Signal acquisition warranted: ${input.signalShouldAcquire ? 'yes' : 'no'}
- Smallest useful signal: ${input.requestedSignal || 'none'}
- Signal judgment: ${input.signalReason}
- Highest-value opportunity: ${opportunity}
- This block is the final realization authority at the provider boundary.
- Obey the current user utterance and this operational conclusion over broader or older prompt guidance when realization instructions compete.
- The selected conversational move defines the maximum allowable scope of this response.
- Advancement means completing the smallest move that improves the operational state, not completing the entire likely project.
- Do not replace the selected move with a generic consultant package, checklist, briefing framework, objection bundle, script, or multi-part plan unless the user explicitly asks for that form or the execution type requires it.
- When signal acquisition is warranted, ask one natural question that earns only the smallest useful signal. Do not add a preparation package around it.
- When signal acquisition is not warranted, do not ask merely to complete fields.
- For Normal GEORGE, speak to the user. Never adopt LIVE room-facing response style, cue compression, receiver delivery, or through-the-user phrasing.
- In Normal execution-imminent posture, acknowledge the governing outcome or constraint, provide the smallest immediately useful tactical preparation, and ask at most one materially valuable question.
- Keep internal runtime labels, scores, confidence, and authority language hidden from the user.
`.trim()
}

export function buildNormalProviderRuntimeContext(input: {
  providerExecutionAuthority: string
  adaptiveUserProfileNote?: string | null
  durableBehavioralMemoryNote?: string | null
  runtimeOutcomeLearningNote?: string | null
  continuityRestorationNote?: string | null
  continuityGovernanceNote?: string | null
  presentationAuthorityNote?: string | null
}) {
  return composeRuntimeContext([
    input.adaptiveUserProfileNote,
    input.durableBehavioralMemoryNote,
    input.runtimeOutcomeLearningNote,
    input.continuityRestorationNote,
    input.continuityGovernanceNote,
    input.presentationAuthorityNote,
    input.providerExecutionAuthority,
  ])
}

export function composeRuntimeContext(blocks: Array<string | null | undefined>) {
  return blocks
    .map((block) => String(block || '').trim())
    .filter(Boolean)
    .map((block) => `

${block}

`)
    .join('')
}

export function buildGovernedRuntimeContext(input: GovernedRuntimeContextInput) {
  return composeRuntimeContext([
    input.liveRuntimeContext,
    input.shelvedCampaignRuntimeNote,
    input.individualLiveContextNote,
    input.runtimeAdapterNote,
    input.earbudRuntimeNote,
    input.runtimeSignalArbitrationNote,
    input.arbitrationResponseShapeNote,
    input.adaptiveUserProfileNote,
    input.durableBehavioralMemoryNote,
    input.runtimeOutcomeLearningNote,
    input.continuityRestorationNote,
    input.judgmentSurfaceNote,
    input.trajectoryNote,
    input.operationalJudgmentNote,
    input.outcomeEvolutionNote,
    input.conversationStrategyNote,
    input.conversationMoveDefinitionNote,
    input.executionPolicyNote,
    input.contextFramingNote,
    input.liveRecommendationPresentationNote,
    input.responseShapeNote,
    input.continuityGovernanceNote,
    input.outputGovernanceNote,
    input.presentationAuthorityNote,
  ])
}
