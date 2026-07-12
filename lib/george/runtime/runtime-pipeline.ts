import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import {
  buildContextFramingPresentationNote,
  buildLiveRecommendationPresentationNote,
  resolveLiveRecommendationPresentation,
  type LiveRecommendationPresentation,
} from '@/lib/george/chat/presentation-authority'
import {
  resolveGeorgeOutcomeState,
  type GeorgeOutcomeState,
} from '@/lib/george/live-voice/runtime/active-outcome'
import type { AdaptiveUserProfile } from '@/lib/george/runtime/adaptive-user-profile'
import {
  buildConversationMoveDefinitionNote,
  type GeorgeConversationMoveDefinition,
} from '@/lib/george/runtime/conversation-move-library'
import {
  buildConversationStrategyNote,
  type GeorgeConversationStrategy,
} from '@/lib/george/runtime/conversation-strategy'
import { resolveContextFraming, type ContextFraming } from '@/lib/george/runtime/context-framing'
import type { ContinuityRestorationState } from '@/lib/george/runtime/continuity-restoration'
import {
  buildExecutionPolicyNote,
  resolveGeorgeExecutionPolicy,
  type GeorgeExecutionPolicy,
} from '@/lib/george/runtime/execution-policy'
import type { GeorgeIntentState } from '@/lib/george/runtime/intent-state'
import type { JudgmentSurfaceState } from '@/lib/george/runtime/judgment-surface'
import type { LiveRecommendationEvidence } from '@/lib/george/runtime/live-recommendation-governor'
import {
  buildOperationalJudgmentNote,
  resolveOperationalJudgment,
  type OperationalJudgment,
} from '@/lib/george/runtime/operational-judgment'
import {
  resolveOperationalResourceMonitor,
  type OperationalResourceMonitorState,
} from '@/lib/george/runtime/operational-resource-monitor'
import {
  buildOutcomeEvolutionNote,
  evolveGeorgeOutcomeState,
  type OutcomeEvolution,
} from '@/lib/george/runtime/outcome-evolution'
import type { RuntimeOutcomeSignals } from '@/lib/george/runtime/outcome-learning'
import type { RuntimeSignalArbitration } from '@/lib/george/runtime/runtime-signal-arbitrator'
import { buildGovernedRuntimeContext } from '@/lib/george/runtime/runtime-context-composer'
import {
  assessTrajectory,
  buildTrajectoryNote,
  type TrajectoryAssessment,
} from '@/lib/george/runtime/trajectory-engine'

export const GEORGE_RUNTIME_PIPELINE = {
  purpose:
    'Active canonical coordinator for GEORGE runtime decisions. It sequences existing owners without absorbing their business logic.',
  status: 'active',
  stages: [
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
  ],
  ownershipPrinciple:
    'The pipeline coordinates. Each stage remains owned by its canonical module and may not be reimplemented here or downstream.',
  integrationRule:
    'Route and UI consumers use the pipeline snapshot instead of independently recomputing runtime decisions.',
} as const

export type GeorgeRuntimePipeline = typeof GEORGE_RUNTIME_PIPELINE

export type GeorgeProviderMessage = Readonly<{
  role: 'user' | 'assistant'
  content: string
}>

export type GeorgeProviderRequest = Readonly<{
  systemContent: string
  messages: readonly GeorgeProviderMessage[]
}>

export type GeorgeProviderPromptInput = Readonly<{
  languageRule: string
  modeBlock: string
  baseSystemPrompt: string
  messageSourceBlock: string
  controlStateBlock: string
  runtimeScoresBlock: string
  scoreAwareSteeringBlock: string
  conversationEngineRulesBlock: string
  universalLiveOpeningBlock: string
  liveDisciplineBlock: string
  dynamicRuntimeBlocks: string
  includeLiveDiscipline: boolean
  recentMessages: readonly GeorgeProviderMessage[]
}>

export type GeorgeRuntimePipelineInput = {
  currentRuntime: CurrentGeorgeRuntime
  latestUserText: string
  previousUserText?: string
  voiceMode: boolean
  objectiveKnown: boolean
  signalUsable: boolean
  executionImminent: boolean
  intentState: GeorgeIntentState
  runtimeArbitration: RuntimeSignalArbitration
  judgmentSurface: JudgmentSurfaceState
  continuityRestoration: ContinuityRestorationState
  outcomeSignals: RuntimeOutcomeSignals
  adaptiveProfile: AdaptiveUserProfile
  liveRecommendationEvidence: LiveRecommendationEvidence
  providerPrompt: GeorgeProviderPromptInput
  governedContextNotes: Readonly<{
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
    responseShapeNote?: string | null
    continuityGovernanceNote?: string | null
    outputGovernanceNote?: string | null
    presentationAuthorityNote?: string | null
  }>
}

export type GeorgeRuntimePipelineSnapshot = Readonly<{
  inferredOutcomeState: GeorgeOutcomeState
  outcomeEvolution: OutcomeEvolution
  outcomeState: GeorgeOutcomeState
  trajectoryAssessment: TrajectoryAssessment
  operationalJudgment: OperationalJudgment
  conversationStrategy: GeorgeConversationStrategy
  conversationMoveDefinition: GeorgeConversationMoveDefinition
  contextFraming: ContextFraming
  liveRecommendationPresentation: LiveRecommendationPresentation
  operationalResourceMonitor: OperationalResourceMonitorState
  executionPolicy: GeorgeExecutionPolicy
  runtimeContextBlock: string
  providerRequest: GeorgeProviderRequest
  notes: Readonly<{
    outcomeEvolutionNote: string
    trajectoryNote: string
    operationalJudgmentNote: string
    conversationStrategyNote: string
    conversationMoveDefinitionNote: string
    contextFramingNote: string
    liveRecommendationPresentationNote: string
    executionPolicyNote: string
  }>
  source: 'runtime_pipeline'
}>

export function resolveGeorgeRuntimePipeline(
  input: GeorgeRuntimePipelineInput
): GeorgeRuntimePipelineSnapshot {
  const inferredOutcomeState = resolveGeorgeOutcomeState({
    transcript: input.latestUserText,
    objectiveKnown: input.objectiveKnown,
    signalUsable: input.signalUsable,
    executionImminent: input.executionImminent,
  })

  const previousOutcomeState = input.previousUserText
    ? resolveGeorgeOutcomeState({
        transcript: input.previousUserText,
        objectiveKnown: true,
        signalUsable: true,
        executionImminent: false,
      })
    : null

  const outcomeEvolution = evolveGeorgeOutcomeState({
    previousState: previousOutcomeState,
    inferredState: inferredOutcomeState,
    latestUserText: input.latestUserText,
    previousUserText: input.previousUserText,
  })
  const outcomeState = outcomeEvolution.state

  const trajectoryAssessment = assessTrajectory({
    latestUserText: input.latestUserText,
    objectiveKnown: input.objectiveKnown,
    signalUsable: input.signalUsable,
    outcomeState,
  })

  const operationalJudgment = resolveOperationalJudgment({
    currentRuntime: input.currentRuntime,
    intentState: input.intentState,
    runtimeArbitration: input.runtimeArbitration,
    judgmentSurface: input.judgmentSurface,
    trajectory: trajectoryAssessment,
    continuityRestoration: input.continuityRestoration,
    outcomeSignals: input.outcomeSignals,
    adaptiveProfile: input.adaptiveProfile,
    liveRecommendationEvidence: input.liveRecommendationEvidence,
    outcomeState,
    latestUserText: input.latestUserText,
  })

  const conversationStrategy = operationalJudgment.conversationStrategy
  const conversationMoveDefinition = conversationStrategy.definition

  const contextFraming = resolveContextFraming({
    runtime: input.currentRuntime,
    latestUserText: input.latestUserText,
    voiceMode: input.voiceMode,
    operationalJudgment,
  })

  const liveRecommendationPresentation = resolveLiveRecommendationPresentation({
    liveSupport: operationalJudgment.liveSupport,
    latestUserText: input.latestUserText,
    voiceMode: input.voiceMode,
  })

  const operationalResourceMonitor = resolveOperationalResourceMonitor({
    outcomeState,
    conversationStrategy,
    operationalJudgment,
    trajectory: trajectoryAssessment,
    liveRecommendationPresentation,
  })

  const executionPolicy = resolveGeorgeExecutionPolicy({
    runtime: input.currentRuntime,
    voiceMode: input.voiceMode,
    strategy: conversationStrategy,
    moveDefinition: conversationMoveDefinition,
    operationalJudgment,
    outcomeEvolution,
    operationalResourceMonitor,
  })

  const notes = Object.freeze({
    outcomeEvolutionNote: buildOutcomeEvolutionNote(outcomeEvolution),
    trajectoryNote: buildTrajectoryNote(trajectoryAssessment),
    operationalJudgmentNote: buildOperationalJudgmentNote(operationalJudgment),
    conversationStrategyNote: buildConversationStrategyNote(conversationStrategy),
    conversationMoveDefinitionNote: buildConversationMoveDefinitionNote(
      conversationMoveDefinition,
      conversationStrategy.assumptions
    ),
    contextFramingNote: buildContextFramingPresentationNote(contextFraming),
    liveRecommendationPresentationNote: buildLiveRecommendationPresentationNote(
      liveRecommendationPresentation
    ),
    executionPolicyNote: buildExecutionPolicyNote(executionPolicy),
  })

  const runtimeContextBlock = buildGovernedRuntimeContext({
    ...input.governedContextNotes,
    trajectoryNote: notes.trajectoryNote,
    operationalJudgmentNote: notes.operationalJudgmentNote,
    outcomeEvolutionNote: notes.outcomeEvolutionNote,
    conversationStrategyNote: notes.conversationStrategyNote,
    conversationMoveDefinitionNote: notes.conversationMoveDefinitionNote,
    executionPolicyNote: notes.executionPolicyNote,
    contextFramingNote: notes.contextFramingNote,
    liveRecommendationPresentationNote: notes.liveRecommendationPresentationNote,
  })

  const providerRequest = buildGeorgeProviderRequest({
    runtimeContextBlock,
    prompt: input.providerPrompt,
  })

  return Object.freeze({
    inferredOutcomeState,
    outcomeEvolution,
    outcomeState,
    trajectoryAssessment,
    operationalJudgment,
    conversationStrategy,
    conversationMoveDefinition,
    contextFraming,
    liveRecommendationPresentation,
    operationalResourceMonitor,
    executionPolicy,
    runtimeContextBlock,
    providerRequest,
    notes,
    source: 'runtime_pipeline' as const,
  })
}


export function buildGeorgeProviderRequest(input: {
  runtimeContextBlock: string
  prompt: GeorgeProviderPromptInput
}): GeorgeProviderRequest {
  const prompt = input.prompt
  const liveOpening = prompt.includeLiveDiscipline
    ? prompt.universalLiveOpeningBlock
    : ''
  const liveDiscipline = prompt.includeLiveDiscipline
    ? prompt.liveDisciplineBlock
    : ''

  const systemContent =
    prompt.languageRule +
    prompt.modeBlock +
    input.runtimeContextBlock +
    prompt.baseSystemPrompt +
    `

${prompt.messageSourceBlock}

${prompt.controlStateBlock}

${prompt.runtimeScoresBlock}

${prompt.scoreAwareSteeringBlock}

${prompt.conversationEngineRulesBlock}



${liveOpening}

${liveDiscipline}



${prompt.dynamicRuntimeBlocks}`

  return Object.freeze({
    systemContent,
    messages: Object.freeze(
      prompt.recentMessages.map((message) => Object.freeze({ ...message }))
    ),
  })
}
