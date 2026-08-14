import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import type { OperationalSignal } from '@/lib/george/runtime/operational-signals'
import {
  buildContextFramingPresentationNote,
} from '@/lib/george/chat/presentation-authority'
import {
  resolveGeorgeOutcomeState,
  type GeorgeOutcomeState,
} from '@/lib/george/live-voice/runtime/active-outcome'
import {
  buildOperationalMemoryEvidenceNote,
  type OperationalMemoryRuntimeEvidence,
} from '@/lib/george/operational-memory/runtime-evidence'
import type { AdaptiveUserProfile } from '@/lib/george/runtime/adaptive-user-profile'
import {
  buildConversationMoveDefinitionNote,
  type GeorgeConversationMoveDefinition,
} from '@/lib/george/runtime/conversation-move-library'
import {
  buildConversationStrategyNote,
  resolveGeorgeConversationStrategy,
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
import {
  resolveNormalGeorgeReasoning,
  type NormalGeorgeReasoningDecision,
} from '@/lib/george/runtime/normal-reasoning-governor'
import type { LiveRecommendationEvidence } from '@/lib/george/runtime/live-recommendation-governor'
import {
  buildOperationalPreparationContextNote,
  buildOperationalJudgmentNote,
  resolveOperationalPosture,
  resolveProviderOperationalJudgment,
  resolveOperationalJudgment,
  type OperationalJudgment,
  type OperationalPreparationContext,
  type ProviderOperationalReasoning,
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
import {
  buildGovernedRuntimeContext,
  buildNormalLiveOperationalJudgmentRequestNote,
  buildNormalProviderRuntimeContext,
  buildProviderExecutionAuthority,
} from '@/lib/george/runtime/runtime-context-composer'
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
    'provider_resolution',
    'outcome_inference',
    'previous_outcome_inference',
    'outcome_evolution',
    'trajectory_assessment',
    'operational_judgment',
    'conversation_strategy',
    'conversation_move_resolution',
    'context_framing',
    'operational_resource_monitor',
    'execution_policy',
    'runtime_note_assembly',
    'runtime_context_assembly',
    'provider_request_assembly',
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
  imageDataUrls?: readonly string[]
}>

export type GeorgeProviderRequest = Readonly<{
  systemContent: string
  messages: readonly GeorgeProviderMessage[]
}>

export type GeorgeRuntimePipelineStageTiming = Readonly<{
  stage: string
  durationMs: number
}>

export type GeorgeRuntimePipelineTiming = Readonly<{
  totalDurationMs: number
  stages: readonly GeorgeRuntimePipelineStageTiming[]
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
  operationalJudgmentRequest?: boolean
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
  tier: string
  hasImageInput: boolean
  intentState: GeorgeIntentState
  runtimeArbitration: RuntimeSignalArbitration
  judgmentSurface: JudgmentSurfaceState
  continuityRestoration: ContinuityRestorationState
  outcomeSignals: RuntimeOutcomeSignals
  adaptiveProfile: AdaptiveUserProfile
  liveRecommendationEvidence: LiveRecommendationEvidence
  operationalSignals: OperationalSignal[]
  operationalMemoryEvidence?: OperationalMemoryRuntimeEvidence | null
  preparationContext?: OperationalPreparationContext | null
  providerPrompt: GeorgeProviderPromptInput
  onStageTiming?: (timing: GeorgeRuntimePipelineStageTiming) => void
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
  operationalResourceMonitor: OperationalResourceMonitorState
  executionPolicy: GeorgeExecutionPolicy
  runtimeContextBlock: string
  providerRequest: GeorgeProviderRequest
  providerResolution: NormalGeorgeReasoningDecision
  timing: GeorgeRuntimePipelineTiming
  notes: Readonly<{
    operationalMemoryEvidenceNote: string
    operationalJudgmentRequestNote: string
    preparationContextNote: string
    outcomeEvolutionNote: string
    trajectoryNote: string
    operationalJudgmentNote: string
    conversationStrategyNote: string
    conversationMoveDefinitionNote: string
    contextFramingNote: string
    executionPolicyNote: string
    providerExecutionAuthority: string
  }>
  source: 'runtime_pipeline'
}>

export type GeorgeRuntimeAuthoritySnapshot = Readonly<{
  operationalJudgment: GeorgeRuntimePipelineSnapshot['operationalJudgment']
  conversationStrategy: GeorgeRuntimePipelineSnapshot['conversationStrategy']
  conversationMoveDefinition: GeorgeRuntimePipelineSnapshot['conversationMoveDefinition']
  executionPolicy: GeorgeRuntimePipelineSnapshot['executionPolicy']
  operationalResourceMonitor: GeorgeRuntimePipelineSnapshot['operationalResourceMonitor']
  source: 'runtime_pipeline'
}>

export function selectGeorgeRuntimeAuthoritySnapshot(
  snapshot: GeorgeRuntimePipelineSnapshot
): GeorgeRuntimeAuthoritySnapshot {
  return Object.freeze({
    operationalJudgment: snapshot.operationalJudgment,
    conversationStrategy: snapshot.conversationStrategy,
    conversationMoveDefinition: snapshot.conversationMoveDefinition,
    executionPolicy: snapshot.executionPolicy,
    operationalResourceMonitor: snapshot.operationalResourceMonitor,
    source: snapshot.source,
  })
}

export function selectProviderResolvedGeorgeRuntimeAuthoritySnapshot(input: {
  snapshot: GeorgeRuntimePipelineSnapshot
  currentRuntime: CurrentGeorgeRuntime
  latestUserText: string
  voiceMode: boolean
  executionImminent: boolean
  operationalSignals?: OperationalSignal[]
  judgmentSurface: JudgmentSurfaceState
  providerReasoning: ProviderOperationalReasoning | null
  providerCapability: 'normal' | 'live' | null
  capabilityExplicitlyRequested: boolean
  capabilityRecommendationMaterial: boolean
  canonicalSignalAcquisition?: boolean
  signalAcquisitionAllowed?: boolean
  operationalJudgmentRequest?: boolean
  ordinaryNormalRequest?: boolean
}): GeorgeRuntimeAuthoritySnapshot {
  const authority = selectGeorgeRuntimeAuthoritySnapshot(input.snapshot)
  const providerResolvedJudgment = resolveProviderOperationalJudgment({
    judgment: authority.operationalJudgment,
    providerReasoning: input.providerReasoning,
    providerCapability: input.providerCapability,
    capabilityExplicitlyRequested:
      input.capabilityExplicitlyRequested,
    capabilityRecommendationMaterial:
      input.capabilityRecommendationMaterial,
    canonicalSignalAcquisition:
      input.canonicalSignalAcquisition,
    signalAcquisitionAllowed: input.signalAcquisitionAllowed,
    operationalJudgmentRequest: input.operationalJudgmentRequest,
    ordinaryNormalRequest: input.ordinaryNormalRequest,
  })

  const providerDecisionAuthoritative = Boolean(
    input.ordinaryNormalRequest ||
      input.operationalJudgmentRequest === true ||
      (
        input.operationalJudgmentRequest === undefined &&
        input.canonicalSignalAcquisition &&
        !input.ordinaryNormalRequest
      )
  )

  if (
    input.currentRuntime !== 'normal_george' ||
    !providerDecisionAuthoritative
  ) {
    return Object.freeze({
      ...authority,
      operationalJudgment: providerResolvedJudgment,
    })
  }

  const conversationStrategy = resolveGeorgeConversationStrategy({
    action: providerResolvedJudgment.action,
    currentRuntime: input.currentRuntime,
    latestUserText: input.latestUserText,
    operationalSignals: input.operationalSignals,
    judgmentSurface: input.judgmentSurface,
    trajectory: input.snapshot.trajectoryAssessment,
    outcomeState: providerResolvedJudgment.outcomeState,
  })
  const operationalPosture = resolveOperationalPosture({
    currentRuntime: input.currentRuntime,
    executionImminent: input.executionImminent,
    action: providerResolvedJudgment.action,
    conversationStrategy,
  })
  const operationalJudgment = Object.freeze({
    ...providerResolvedJudgment,
    conversationStrategy,
    operationalPosture,
  })
  const operationalResourceMonitor = resolveOperationalResourceMonitor({
    outcomeState: operationalJudgment.outcomeState,
    conversationStrategy,
    operationalJudgment,
    trajectory: input.snapshot.trajectoryAssessment,
  })
  const executionPolicy = resolveGeorgeExecutionPolicy({
    runtime: input.currentRuntime,
    voiceMode: input.voiceMode,
    strategy: conversationStrategy,
    moveDefinition: conversationStrategy.definition,
    operationalJudgment,
    outcomeEvolution: input.snapshot.outcomeEvolution,
    operationalResourceMonitor,
    latestUserText: input.latestUserText,
  })

  return Object.freeze({
    operationalJudgment,
    conversationStrategy,
    conversationMoveDefinition: conversationStrategy.definition,
    executionPolicy,
    operationalResourceMonitor,
    source: authority.source,
  })
}

export function buildProviderResolvedNormalExecutionRequest(input: {
  authority: GeorgeRuntimeAuthoritySnapshot
  latestUserText: string
  hasPreparationContext?: boolean
  prompt: GeorgeProviderPromptInput
}): GeorgeProviderRequest {
  const judgment = input.authority.operationalJudgment
  const disposition = judgment.operationalDisposition
  const executionPolicy = input.authority.executionPolicy
  const executionAuthority = buildProviderExecutionAuthority({
    runtime: 'normal_george',
    action: judgment.action,
    strategyMove: input.authority.conversationStrategy.move,
    strategyPurpose: input.authority.conversationStrategy.purpose,
    executionType: executionPolicy.executionType,
    audience: executionPolicy.audience,
    normalPosture: executionPolicy.normalPosture,
    explanationDepth: executionPolicy.explanationDepth,
    assumptionHandling: executionPolicy.assumptionHandling,
    repetitionPolicy: executionPolicy.repetitionPolicy,
    signalShouldAcquire: judgment.signalAcquisition.shouldAcquire,
    requestedSignal: judgment.signalAcquisition.requestedSignal,
    signalReason: judgment.signalAcquisition.reason,
    signalAssessmentAuthority: 'governing',
    decisionAssessmentAuthority: 'governing',
    authoritySource: 'canonical_operational_judgment',
    operationalDisposition: disposition.disposition,
    operationalObjective: disposition.operationalObjective,
    knownEvidence: disposition.knownEvidence,
    consequentialUncertainty: disposition.consequentialUncertainty,
    georgeResolvableWork: disposition.georgeResolvableWork,
    georgeCanAdvanceWithoutUserSignal:
      disposition.georgeCanAdvanceWithoutUserSignal,
    strongestNextStep: disposition.strongestNextStep,
    interaction: disposition.interaction,
    interactionUseful: disposition.interactionUseful,
    purpose: disposition.purpose,
    desiredResult: disposition.desiredResult,
    liveMateriallyImprovesExecution:
      disposition.liveMateriallyImprovesExecution,
    materialLiveBenefit: disposition.materialLiveBenefit,
  })

  return buildGeorgeProviderRequest({
    currentRuntime: 'normal_george',
    runtimeContextBlock: executionAuthority,
    latestUserText: input.latestUserText,
    hasPreparationContext: input.hasPreparationContext,
    canonicalExecution: true,
    prompt: {
      ...input.prompt,
      operationalJudgmentRequest: false,
    },
  })
}

export function resolveGeorgeRuntimeProvider(input: {
  userText: string
  tier: string
  hasImageInput: boolean
}): NormalGeorgeReasoningDecision {
  return resolveNormalGeorgeReasoning(input)
}

export function resolveGeorgeRuntimePipeline(
  input: GeorgeRuntimePipelineInput
): GeorgeRuntimePipelineSnapshot {
  const pipelineStartedAt = performance.now()
  const stageTimings: GeorgeRuntimePipelineStageTiming[] = []

  const measureStage = <T>(stage: string, work: () => T): T => {
    const startedAt = performance.now()
    const result = work()
    const timing = Object.freeze({
      stage,
      durationMs: Number((performance.now() - startedAt).toFixed(3)),
    })

    stageTimings.push(timing)
    input.onStageTiming?.(timing)

    return result
  }

  const providerResolution = measureStage('provider_resolution', () =>
    resolveGeorgeRuntimeProvider({
      userText: input.latestUserText,
      tier: input.tier,
      hasImageInput: input.hasImageInput,
    })
  )

  const inferredOutcomeState = measureStage('outcome_inference', () =>
    resolveGeorgeOutcomeState({
      transcript: input.latestUserText,
      objectiveKnown: input.objectiveKnown,
      signalUsable: input.signalUsable,
      executionImminent: input.executionImminent,
    })
  )

  const previousOutcomeState = measureStage('previous_outcome_inference', () =>
    input.previousUserText
      ? resolveGeorgeOutcomeState({
          transcript: input.previousUserText,
          objectiveKnown: true,
          signalUsable: true,
          executionImminent: false,
        })
      : null
  )

  const outcomeEvolution = measureStage('outcome_evolution', () =>
    evolveGeorgeOutcomeState({
      previousState: previousOutcomeState,
      inferredState: inferredOutcomeState,
      latestUserText: input.latestUserText,
      previousUserText: input.previousUserText,
    })
  )
  const outcomeState = outcomeEvolution.state

  const trajectoryAssessment = measureStage('trajectory_assessment', () =>
    assessTrajectory({
      latestUserText: input.latestUserText,
      objectiveKnown: input.objectiveKnown,
      signalUsable: input.signalUsable,
      outcomeState,
    })
  )

  const operationalJudgment = measureStage('operational_judgment', () =>
    resolveOperationalJudgment({
      currentRuntime: input.currentRuntime,
      intentState: input.intentState,
      runtimeArbitration: input.runtimeArbitration,
      judgmentSurface: input.judgmentSurface,
      trajectory: trajectoryAssessment,
      continuityRestoration: input.continuityRestoration,
      outcomeSignals: input.outcomeSignals,
      adaptiveProfile: input.adaptiveProfile,
      liveRecommendationEvidence: input.liveRecommendationEvidence,
      operationalSignals: input.operationalSignals,
      outcomeState,
      latestUserText: input.latestUserText,
    })
  )

  const conversationStrategy = measureStage(
    'conversation_strategy',
    () => operationalJudgment.conversationStrategy
  )
  const conversationMoveDefinition = measureStage(
    'conversation_move_resolution',
    () => conversationStrategy.definition
  )

  const contextFraming = measureStage('context_framing', () =>
    resolveContextFraming({
      runtime: input.currentRuntime,
      latestUserText: input.latestUserText,
      voiceMode: input.voiceMode,
      operationalJudgment,
    })
  )

  const operationalResourceMonitor = measureStage(
    'operational_resource_monitor',
    () =>
      resolveOperationalResourceMonitor({
        outcomeState,
        conversationStrategy,
        operationalJudgment,
        trajectory: trajectoryAssessment,
      })
  )

  const executionPolicy = measureStage('execution_policy', () =>
    resolveGeorgeExecutionPolicy({
      runtime: input.currentRuntime,
      voiceMode: input.voiceMode,
      strategy: conversationStrategy,
      moveDefinition: conversationMoveDefinition,
      operationalJudgment,
      outcomeEvolution,
      operationalResourceMonitor,
      latestUserText: input.latestUserText,
    })
  )

  const notes = measureStage('runtime_note_assembly', () =>
    Object.freeze({
      operationalMemoryEvidenceNote: input.operationalMemoryEvidence
        ? buildOperationalMemoryEvidenceNote(input.operationalMemoryEvidence)
        : '',
      operationalJudgmentRequestNote:
        input.providerPrompt.operationalJudgmentRequest
          ? buildNormalLiveOperationalJudgmentRequestNote()
          : '',
      preparationContextNote: input.preparationContext
        ? buildOperationalPreparationContextNote(input.preparationContext)
        : '',
      outcomeEvolutionNote: buildOutcomeEvolutionNote(outcomeEvolution),
      trajectoryNote: buildTrajectoryNote(trajectoryAssessment),
      operationalJudgmentNote: buildOperationalJudgmentNote(operationalJudgment),
      conversationStrategyNote: buildConversationStrategyNote(conversationStrategy),
      conversationMoveDefinitionNote: buildConversationMoveDefinitionNote(
        conversationMoveDefinition,
        conversationStrategy.assumptions
      ),
      contextFramingNote: buildContextFramingPresentationNote(contextFraming),
      executionPolicyNote: buildExecutionPolicyNote(executionPolicy),
      providerExecutionAuthority: buildProviderExecutionAuthority({
        runtime: input.currentRuntime,
        action: operationalJudgment.action,
        strategyMove: conversationStrategy.move,
        strategyPurpose: conversationStrategy.purpose,
        executionType: executionPolicy.executionType,
        audience: executionPolicy.audience,
        normalPosture: executionPolicy.normalPosture,
        explanationDepth: executionPolicy.explanationDepth,
        assumptionHandling: executionPolicy.assumptionHandling,
        repetitionPolicy: executionPolicy.repetitionPolicy,
        signalShouldAcquire:
          operationalJudgment.signalAcquisition.shouldAcquire,
        requestedSignal:
          operationalJudgment.signalAcquisition.requestedSignal,
        signalReason: operationalJudgment.signalAcquisition.reason,
        signalAssessmentAuthority:
          input.currentRuntime === 'normal_george'
            ? 'provisional'
            : 'governing',
        decisionAssessmentAuthority:
          input.currentRuntime === 'normal_george'
            ? 'provisional'
            : 'governing',
        opportunityTitle: operationalResourceMonitor.opportunity?.title,
        opportunityReadiness:
          operationalResourceMonitor.opportunity?.readiness,
        opportunityThresholdMet:
          operationalResourceMonitor.opportunity?.thresholdMet,
      }),
    })
  )

  const runtimeContextBlock = measureStage(
    'runtime_context_assembly',
    () =>
      input.currentRuntime === 'normal_george'
        ? buildNormalProviderRuntimeContext({
            providerExecutionAuthority:
              notes.providerExecutionAuthority,
            operationalJudgmentRequestNote:
              notes.operationalJudgmentRequestNote,
            adaptiveUserProfileNote:
              input.governedContextNotes.adaptiveUserProfileNote,
            durableBehavioralMemoryNote:
              input.governedContextNotes.durableBehavioralMemoryNote,
            operationalMemoryEvidenceNote:
              notes.operationalMemoryEvidenceNote,
            preparationContextNote:
              notes.preparationContextNote,
            runtimeOutcomeLearningNote:
              input.governedContextNotes.runtimeOutcomeLearningNote,
            continuityRestorationNote:
              input.governedContextNotes.continuityRestorationNote,
            continuityGovernanceNote:
              input.governedContextNotes.continuityGovernanceNote,
            presentationAuthorityNote:
              input.governedContextNotes.presentationAuthorityNote,
          })
        : buildGovernedRuntimeContext({
            ...input.governedContextNotes,
            operationalMemoryEvidenceNote:
              notes.operationalMemoryEvidenceNote,
            trajectoryNote: notes.trajectoryNote,
            operationalJudgmentNote:
              notes.operationalJudgmentNote,
            outcomeEvolutionNote: notes.outcomeEvolutionNote,
            conversationStrategyNote:
              notes.conversationStrategyNote,
            conversationMoveDefinitionNote:
              notes.conversationMoveDefinitionNote,
            executionPolicyNote: notes.executionPolicyNote,
            contextFramingNote: notes.contextFramingNote,
          })
  )

  const providerRequest = measureStage('provider_request_assembly', () =>
    buildGeorgeProviderRequest({
      currentRuntime: input.currentRuntime,
      runtimeContextBlock,
      latestUserText: input.latestUserText,
      hasPreparationContext: Boolean(input.preparationContext),
      prompt: input.providerPrompt,
    })
  )

  const timing = Object.freeze({
    totalDurationMs: Number((performance.now() - pipelineStartedAt).toFixed(3)),
    stages: Object.freeze([...stageTimings]),
  })

  console.info('[GEORGE][runtime][latency]', timing)

  return Object.freeze({
    inferredOutcomeState,
    outcomeEvolution,
    outcomeState,
    trajectoryAssessment,
    operationalJudgment,
    conversationStrategy,
    conversationMoveDefinition,
    contextFraming,
    operationalResourceMonitor,
    executionPolicy,
    runtimeContextBlock,
    providerRequest,
    providerResolution,
    timing,
    notes,
    source: 'runtime_pipeline' as const,
  })
}


export function buildGeorgeProviderRequest(input: {
  currentRuntime: CurrentGeorgeRuntime
  runtimeContextBlock: string
  latestUserText: string
  hasPreparationContext?: boolean
  canonicalExecution?: boolean
  prompt: GeorgeProviderPromptInput
}): GeorgeProviderRequest {
  const prompt = input.prompt
  const preserveNormalAmbiguity =
    !input.canonicalExecution &&
    !prompt.includeLiveDiscipline &&
    !input.hasPreparationContext &&
    isStandaloneAmbiguousKnowledgeQuestion(input.latestUserText)
  const liveOpening = prompt.includeLiveDiscipline
    ? prompt.universalLiveOpeningBlock
    : ''
  const liveDiscipline = prompt.includeLiveDiscipline
    ? prompt.liveDisciplineBlock
    : ''
  const runtimeContextBlock = preserveNormalAmbiguity
    ? ''
    : input.runtimeContextBlock
  const hasProviderExecutionAuthority =
    runtimeContextBlock.includes('PROVIDER EXECUTION AUTHORITY')
  const compactNormalProviderBoundary =
    input.currentRuntime === 'normal_george' &&
    hasProviderExecutionAuthority
  const runtimeContextBeforeBase = hasProviderExecutionAuthority
    ? ''
    : runtimeContextBlock
  const runtimeContextAfterDiscipline = hasProviderExecutionAuthority
    ? runtimeContextBlock
    : ''
  const operationalPromptBlocks = preserveNormalAmbiguity
    ? ''
    : `

${prompt.messageSourceBlock}

${prompt.controlStateBlock}

${prompt.runtimeScoresBlock}

${prompt.scoreAwareSteeringBlock}

${prompt.dynamicRuntimeBlocks}`
  const ambiguityAuthority = preserveNormalAmbiguity
    ? `

NORMAL AMBIGUITY AUTHORITY
- The current question has multiple plausible meanings and does not identify a domain.
- Do not inherit a domain from earlier conversation, preparation, projects, or operational context.
- Preserve the ambiguity by briefly distinguishing the most common meanings or asking which meaning the user intends.
- Do not choose one domain merely because it is operationally familiar.`
    : ''

  const systemContent = compactNormalProviderBoundary
    ? prompt.languageRule +
      prompt.modeBlock +
      `

${liveOpening}

${liveDiscipline}

${runtimeContextAfterDiscipline}`
    : prompt.languageRule +
      prompt.modeBlock +
      runtimeContextBeforeBase +
      prompt.baseSystemPrompt +
      operationalPromptBlocks +
      `

${prompt.conversationEngineRulesBlock}

${ambiguityAuthority}

${liveOpening}

${liveDiscipline}

${runtimeContextAfterDiscipline}`

  const contextualMessages = prompt.operationalJudgmentRequest
    ? Object.freeze([
        ...prompt.recentMessages,
        Object.freeze({
          role: 'user' as const,
          content:
            'Apply the Normal LIVE Operational Judgment request to the validated evidence now.',
        }),
      ])
    : resolveProviderConversationMessages(
        input.latestUserText,
        prompt.recentMessages
      )

  return Object.freeze({
    systemContent,
    messages: Object.freeze(
      contextualMessages.map((message) => Object.freeze({ ...message }))
    ),
  })
}

function resolveProviderConversationMessages(
  latestUserText: string,
  recentMessages: readonly GeorgeProviderMessage[]
): readonly GeorgeProviderMessage[] {
  const normalizedLatestUserText = normalizeProviderMessageContent(latestUserText)
  const matchingCurrentTurn = [...recentMessages]
    .map((message, index) => ({ message, index }))
    .reverse()
    .find(
      ({ message }) =>
        message.role === 'user' &&
        normalizeProviderMessageContent(message.content) === normalizedLatestUserText
    )
  const currentUserMessage = Object.freeze({
    role: 'user' as const,
    content: latestUserText,
    ...(matchingCurrentTurn?.message.imageDataUrls?.length
      ? {
          imageDataUrls: Object.freeze([
            ...matchingCurrentTurn.message.imageDataUrls,
          ]),
        }
      : {}),
  })

  if (isStandaloneAmbiguousKnowledgeQuestion(latestUserText)) {
    return Object.freeze([currentUserMessage])
  }

  const matchingCurrentTurnIndex = matchingCurrentTurn?.index

  if (matchingCurrentTurnIndex === undefined) {
    return Object.freeze([...recentMessages, currentUserMessage])
  }

  return Object.freeze([
    ...recentMessages.slice(0, matchingCurrentTurnIndex),
    currentUserMessage,
  ])
}

function normalizeProviderMessageContent(text: string) {
  return text.trim().replace(/\s+/g, ' ')
}

export function isStandaloneAmbiguousKnowledgeQuestion(text: string) {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (!normalized || normalized.length > 120) return false

  const definitional =
    /^(what is|what's|whats|define|what does .+ mean|explain)\b/i.test(normalized)

  if (!definitional) return false

  const explicitlyContextual =
    /\b(this|that|these|those|it|they|them|their|the investor|our company|my company|the meeting|the deal|the round|the valuation)\b/i.test(
      normalized
    )

  return !explicitlyContextual
}
