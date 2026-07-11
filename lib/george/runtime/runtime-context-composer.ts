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
  contextFramingNote?: string | null
  liveRecommendationPresentationNote?: string | null
  responseShapeNote?: string | null
  continuityGovernanceNote?: string | null
  outputGovernanceNote?: string | null
  presentationAuthorityNote?: string | null
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
    input.contextFramingNote,
    input.liveRecommendationPresentationNote,
    input.responseShapeNote,
    input.continuityGovernanceNote,
    input.outputGovernanceNote,
    input.presentationAuthorityNote,
  ])
}
