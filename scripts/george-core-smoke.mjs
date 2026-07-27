import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'george-core-smoke-'))
const file = join(dir, 'smoke.ts')

writeFileSync(file, `
import { classifyLiveSpeakerIntent } from '${process.cwd()}/lib/george/live-voice/runtime/speaker-intent'
import { buildSteeringContinuation } from '${process.cwd()}/lib/george/live-voice/runtime/steering-continuation'
import { deriveActiveOutcome, resolveGeorgeOutcomeState } from '${process.cwd()}/lib/george/live-voice/runtime/active-outcome'
import { buildOutcomeEvolutionNote, evolveGeorgeOutcomeState } from '${process.cwd()}/lib/george/runtime/outcome-evolution'
import { georgeOutcomeGovernor } from '${process.cwd()}/lib/george/live-voice/runtime/outcome-governor'
import { evaluateSignalSufficiency } from '${process.cwd()}/lib/george/runtime/signal-sufficiency'
import { rankSignals } from '${process.cwd()}/lib/george/runtime/signal-ranking'
import { inferObjectiveFromText, LIVE_OBJECTIVES } from '${process.cwd()}/lib/george/live-voice/runtime/objective-engine'
import { georgeTrajectoryEngine } from '${process.cwd()}/lib/george/live-voice/runtime/trajectory-engine'
import { buildGeorgeCoreInterpretation } from '${process.cwd()}/lib/george/core/build-interpretation'
import { resolveGeorgeCoreLiveExecution } from '${process.cwd()}/lib/george/core/live-execution'
import { resolveNormalGeorgeReasoning } from '${process.cwd()}/lib/george/runtime/normal-reasoning-governor'
import { resolvePreProviderSend } from '${process.cwd()}/lib/george/runtime/pre-provider-send-resolution'
import { resolveCoursesExpandResponse } from '${process.cwd()}/lib/george/runtime/training-runtime'
import { buildGovernedRuntimeContext, buildNormalProviderRuntimeContext, buildProviderExecutionAuthority } from '${process.cwd()}/lib/george/runtime/runtime-context-composer'
import { buildOperationalJudgmentNote, resolveOperationalJudgment, resolveSignalAcquisitionJudgment } from '${process.cwd()}/lib/george/runtime/operational-judgment'
import { buildConversationStrategyNote, resolveGeorgeConversationStrategy } from '${process.cwd()}/lib/george/runtime/conversation-strategy'
import { buildConversationMoveDefinitionNote, listConversationMoveDefinitions, resolveConversationMoveDefinition, resolveSignalAcquisitionMoveVariant } from '${process.cwd()}/lib/george/runtime/conversation-move-library'
import { evaluateLiveRecommendationEvidence } from '${process.cwd()}/lib/george/runtime/live-recommendation-governor'
import { resolveContextFraming } from '${process.cwd()}/lib/george/runtime/context-framing'
import { OPPORTUNITY_READINESS_REGISTRY, resolveOperationalResourceMonitor } from '${process.cwd()}/lib/george/runtime/operational-resource-monitor'
import { buildOpportunitySignalAcquisitionMessage } from '${process.cwd()}/lib/george/runtime/conversation-strategy'
import { buildExecutionPolicyNote, resolveGeorgeExecutionPolicy, resolveNormalExecutionPosture } from '${process.cwd()}/lib/george/runtime/execution-policy'
import { buildContextFramingPresentationNote, buildLiveRecommendationPresentationNote, enforceLiveRecommendationPresentation, resolveLiveRecommendationPresentation } from '${process.cwd()}/lib/george/chat/presentation-authority'
import { renderOperationalExcellenceOutput } from '${process.cwd()}/lib/george/chat/operational-excellence'
import { buildGeorgeProviderRequest, GEORGE_RUNTIME_PIPELINE, isStandaloneAmbiguousKnowledgeQuestion, resolveGeorgeRuntimePipeline, resolveGeorgeRuntimeProvider } from '${process.cwd()}/lib/george/runtime/runtime-pipeline'
import { buildNormalKnowledgeCoreBlock } from '${process.cwd()}/lib/george/chat/system-blocks'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const normalKnowledgeCore = buildNormalKnowledgeCoreBlock({
  isFirstSession: true,
})

assert(
  isStandaloneAmbiguousKnowledgeQuestion('What is dilution?') === true,
  'standalone definitional knowledge questions should qualify for compact Normal knowledge reasoning'
)
assert(
  isStandaloneAmbiguousKnowledgeQuestion('What is dilution in our company?') === false,
  'explicitly contextual knowledge questions should remain on the full Normal reasoning path'
)
assert(
  normalKnowledgeCore.includes('NORMAL KNOWLEDGE REASONING') &&
    normalKnowledgeCore.includes('The audience is the user') &&
    normalKnowledgeCore.includes('preserve that ambiguity') &&
    normalKnowledgeCore.includes('Do not invent operational facts') &&
    !normalKnowledgeCore.includes('LIVE guidance') &&
    !normalKnowledgeCore.includes('Pro mode') &&
    !normalKnowledgeCore.includes('RUNTIME SCORES'),
  'compact Normal knowledge reasoning should preserve uncertainty without importing LIVE, Pro, or runtime steering doctrine'
)

const intent = classifyLiveSpeakerIntent({
  transcript: 'George, help me respond to that.',
  knownUserSpeaking: true,
})
assert(intent.intent === 'addressed_to_george', 'speaker intent should detect GEORGE address')
assert(intent.shouldSpeak === true, 'speaker intent should allow speaking for direct request')

const steering = buildSteeringContinuation({
  phrase: 'let me think',
  room: 'negotiation',
  objective: 'protect leverage',
})
assert(steering.matched === true, 'steering continuation should match let me think')
assert(steering.direction === 'buy_time', 'let me think should buy time')


const outcomeState = resolveGeorgeOutcomeState({
  transcript: 'I have an investor meeting tomorrow and need to preserve founder control.',
  objectiveKnown: true,
  signalUsable: true,
})

assert(
  outcomeState.primaryOutcome.includes('financing') && outcomeState.immediateOutcome.length > 0,
  'active outcome should own the canonical primary and immediate outcome state'
)

assert(
  outcomeState.phase === 'preparation' && outcomeState.confidence >= 0.68,
  'active outcome should own phase and confidence for downstream consumers'
)

const activeOutcome = deriveActiveOutcome({
  desiredOutcome: 'get the job offer',
  room: 'interview',
  transcript: 'Tell me about your leadership experience.',
})
assert(activeOutcome.includes('role') || activeOutcome.includes('leadership'), 'active outcome should infer interview outcome')

const governor = georgeOutcomeGovernor.evaluate({
  objectiveKnown: true,
  desiredOutcome: 'get the job offer',
  activeOutcome,
  confidence: 0.72,
  knownContextAvailable: true,
  roomHasRecentSignal: true,
  userHasRequestedHelp: true,
})
assert(governor.move === 'direct_response', 'governor should direct respond when advancing and help requested')
assert(governor.movementState === 'advancing', 'governor should mark advancing with signal and objective')

const sufficiency = evaluateSignalSufficiency({
  transcript: 'The investor challenged our revenue forecast and deadline.',
  outcome: 'raise capital',
})
assert(sufficiency.sufficient === true, 'signal sufficiency should detect enough high-value signal')

const ranked = rankSignals('The board challenged revenue and deadline risk.')
assert(ranked.length > 0, 'signal ranking should identify ranked signals')

const objectiveId = inferObjectiveFromText('The manager challenged my raise and compensation value.')
assert(objectiveId === 'secure_raise', 'objective engine should infer compensation objective')
assert(LIVE_OBJECTIVES[objectiveId].label === 'Secure Raise', 'objective engine should expose objective definition')

const trajectory = georgeTrajectoryEngine.evaluate({
  text: 'Sounds good, send me the next step and we can follow up.',
  objectiveId,
  roomPressure: 'low',
  interruptionRisk: 0.1,
  emotionalVelocity: 'stable',
})
assert(trajectory.trajectory === 'decision_ready', 'trajectory engine should detect decision-ready movement')
assert(trajectory.recommendedAction === 'close', 'trajectory engine should recommend close on decision-ready movement')

const interpretation = buildGeorgeCoreInterpretation({
  transcript: 'George, what should I say? They challenged my leadership experience.',
  room: 'interview',
  desiredOutcome: 'get the job offer',
  knownUserSpeaking: true,
  knownContext: 'The user is interviewing for an operations role.',
  userPosition: 'seeking',
})
assert(interpretation.source === 'george_core_interpretation', 'core interpretation should identify source')
assert(interpretation.speakerIntent?.intent === 'addressed_to_george', 'core interpretation should include speaker intent')
assert(Boolean(interpretation.activeOutcome), 'core interpretation should include active outcome')
assert(Boolean(interpretation.outcomeGovernor?.move), 'core interpretation should include outcome governor move')

const execution = resolveGeorgeCoreLiveExecution({
  transcript: 'What should I say?',
  lastFinalTranscript: null,
  routingContext: { liveMode: true },
  lastSpokenLine: '',
  isGeorgeSpeaking: false,
  isThinking: false,
  desiredOutcome: 'get the job offer',
  now: 2000,
})
assert(execution.authority.verdict === 'allow', 'core execution should allow clean transcript action')
assert(execution.authority.action.type === 'send', 'core execution should produce send action')

const smartStrategic = resolveNormalGeorgeReasoning({
  userText: 'Build a crowdfunding strategy using my broker dealer to reach non-accredited investors.',
  tier: 'smart',
  hasImageInput: false,
})

const intelligentStrategic = resolveNormalGeorgeReasoning({
  userText: 'Build a crowdfunding strategy using my broker dealer to reach non-accredited investors.',
  tier: 'intelligent',
  hasImageInput: false,
})

const brilliantStrategic = resolveNormalGeorgeReasoning({
  userText: 'Build a crowdfunding strategy using my broker dealer to reach non-accredited investors.',
  tier: 'brilliant',
  hasImageInput: false,
})

assert(smartStrategic.lane === 'strategic', 'consequential crowdfunding work should use strategic reasoning')
assert(
  smartStrategic.model === intelligentStrategic.model,
  'Smart and Intelligent must share the same competent baseline model'
)
assert(!/mini/i.test(smartStrategic.model), 'Smart must not use a mini competence floor')
assert(
  brilliantStrategic.model !== '' &&
  brilliantStrategic.lane === 'strategic',
  'Brilliant strategic work must resolve through the latest-model policy'
)

const smartImmediate = resolveNormalGeorgeReasoning({
  userText: 'Fix this typo.',
  tier: 'smart',
  hasImageInput: false,
})

const intelligentImmediate = resolveNormalGeorgeReasoning({
  userText: 'Fix this typo.',
  tier: 'intelligent',
  hasImageInput: false,
})

assert(smartImmediate.lane === 'immediate', 'simple work should retain the immediate lane')
assert(
  smartImmediate.model === intelligentImmediate.model,
  'Smart and Intelligent immediate work must share the same provider policy'
)

const contextualShortQuestion = resolveNormalGeorgeReasoning({
  userText: 'Am I wrong?',
  tier: 'smart',
  hasImageInput: false,
})

assert(
  contextualShortQuestion.provider === 'openai',
  'short context-dependent questions must not automatically enter the Groq fast lane'
)

const safeRewrite = resolveNormalGeorgeReasoning({
  userText: 'Rewrite this sentence and make it clearer.',
  tier: 'smart',
  hasImageInput: false,
})

if (process.env.GROQ_API_KEY) {
  assert(
    safeRewrite.provider === 'groq',
    'safe transformations should use Groq when configured'
  )
} else {
  assert(
    safeRewrite.provider === 'openai',
    'Normal reasoning should remain on OpenAI when Groq is unavailable'
  )
}

assert(
  smartStrategic.provider === 'openai',
  'strategic work must remain on OpenAI'
)

const ordinarySend = resolvePreProviderSend({
  text: 'Help me think through this decision.',
  activePromptContext: null,
  activeMemoryFolder: null,
  previousUserMessages: [],
})

assert(
  ordinarySend.mode === 'provider',
  'ordinary Normal work should continue to provider generation'
)

const creditContextSend = resolvePreProviderSend({
  text: 'How can I improve my credit score?',
  activePromptContext: null,
  activeMemoryFolder: null,
  previousUserMessages: [],
})

assert(
  creditContextSend.mode === 'provider_with_context',
  'credit work without an authoritative override should attach domain context'
)

assert(
  Boolean(creditContextSend.systemContext),
  'provider-with-context resolution should include domain context'
)

assert(
  creditContextSend.metadata.detectedDomain === 'credit',
  'pre-provider resolution should preserve detected domain metadata'
)

const domainDirectSend = resolvePreProviderSend({
  text: 'My credit cards are maxed out and I was thinking about tradelines.',
  activePromptContext: null,
  activeMemoryFolder: null,
  previousUserMessages: [],
})

assert(
  domainDirectSend.mode === 'direct',
  'authoritative domain guidance should resolve as a direct response'
)

assert(
  domainDirectSend.mode !== 'direct' || domainDirectSend.authority === 'domain',
  'domain direct response should identify domain authority'
)

const liveRecommendationEvidence = evaluateLiveRecommendationEvidence({
  latestUserText: 'I am walking into an investor meeting right now.',
  signalSufficiency: 'sufficient',
  currentRuntime: 'normal_george',
  pressureHigh: true,
  objectiveKnown: true,
})

const operationalJudgmentInput = {
  currentRuntime: 'normal_george',
  intentState: {
    operational: true,
    exploratory: false,
    actionable: true,
    pressureLevel: 'medium',
    objectiveState: 'clear',
    narrowingReadiness: 0.7,
    continuityDependency: 0.1,
    liveRisk: false,
    emotionalLoad: 0.1,
    cadenceAvoid: [],
    bottleneck: { label: 'execution', confidence: 'high' },
    liveScenario: { active: false, type: 'none' },
    source: 'passive_aggregator',
  },
  runtimeArbitration: {
    winner: 'objective_protection',
    posture: 'protect_objective',
    delivery: 'structured',
    agency: 'user_decides',
    note: '',
  },
  judgmentSurface: {
    decisionSurface: 'execute',
    signalSufficiency: 'sufficient',
    shouldAcquireSignal: false,
    instruction: '',
  },
  trajectory: {
    currentMove: outcomeState.immediateOutcome,
    likelyNextMoves: ['execute'],
    potentialFutureNeeds: [],
    confidence: 0.68,
  },
  continuityRestoration: {
    active: false,
    confidence: 'low',
    revealStyle: 'none',
    instruction: '',
  },
  outcomeSignals: {
    clarityImproved: 0.4,
    overloadDetected: 0.1,
    userConfidenceImproved: 0.4,
    pressureReduced: 0.4,
    leverageImproved: 0.4,
    executionLikelihood: 0.7,
  },
  adaptiveProfile: {
    conciseDeliveryPreference: 0.5,
    repeatableLineAffinity: 0.5,
    abstractReasoningTolerance: 0.5,
    calmPressurePreference: 0.5,
    leverageProtectionPreference: 0.5,
    tacticalCueRetention: 0.5,
    layeredExplanationTolerance: 0.5,
  },
  liveRecommendationEvidence,
  outcomeState,
  latestUserText: 'The investor is pushing for more control before committing.',
}

const operationalJudgment = resolveOperationalJudgment(
  operationalJudgmentInput
)

assert(
  operationalJudgment.action === 'protect_objective',
  'operational judgment should synthesize evidence into one governing action'
)

assert(
  operationalJudgment.outcomeState === outcomeState,
  'operational judgment should consume the canonical outcome state without reconstructing it'
)

assert(
  operationalJudgment.conversationStrategy.move === 'anchor',
  'objective protection should select an outcome-preserving conversational move'
)

assert(
  operationalJudgment.conversationStrategy.userDiscretionRequired,
  'conversation strategy should preserve the user as the final in-room authority'
)

assert(
  !operationalJudgment.signalAcquisition.shouldAcquire &&
    operationalJudgment.signalAcquisition.operationalValue === 'none',
  'operational judgment should avoid unnecessary signal acquisition when current evidence is sufficient'
)

const materialSignalJudgment = resolveSignalAcquisitionJudgment({
  currentRuntime: 'normal_george',
  intentState: {
    ...operationalJudgmentInput.intentState,
    objectiveState: 'partial',
  },
  runtimeArbitration: {
    ...operationalJudgmentInput.runtimeArbitration,
    winner: 'objective_protection',
    delivery: 'short',
  },
  judgmentSurface: {
    decisionSurface: 'acquire_signal',
    signalSufficiency: 'insufficient',
    shouldAcquireSignal: true,
    smallestSignal: 'the outcome that would make this conversation successful',
    instruction: '',
  },
  trajectory: {
    ...operationalJudgmentInput.trajectory,
    confidence: 0.52,
  },
  continuityRestoration: operationalJudgmentInput.continuityRestoration,
  outcomeSignals: {
    ...operationalJudgmentInput.outcomeSignals,
    overloadDetected: 0.1,
  },
  adaptiveProfile: operationalJudgmentInput.adaptiveProfile,
  liveRecommendationEvidence,
  outcomeState,
  latestUserText: 'I need to prepare, but I have not said what success looks like.',
})

assert(
  materialSignalJudgment.shouldAcquire &&
    materialSignalJudgment.operationalValue === 'high' &&
    materialSignalJudgment.conversationalCost === 'low',
  'operational judgment should acquire a specific signal only when its expected value exceeds conversational cost'
)

const smallestMoveStrategy = resolveGeorgeConversationStrategy({
  action: 'advance_outcome',
  currentRuntime: 'normal_george',
  latestUserText: 'Help me move this forward.',
  judgmentSurface: {
    decisionSurface: 'first_useful_move',
    signalSufficiency: 'sufficient',
    shouldAcquireSignal: false,
    instruction: '',
  },
  trajectory: {
    currentMove: 'advance the active outcome',
    likelyNextMoves: ['continue'],
    potentialFutureNeeds: [],
    confidence: 0.8,
  },
  outcomeState: {
    immediateOutcome: 'Move the active objective forward',
    followOnOutcomes: [],
    ultimateOutcome: 'Complete the objective',
    confidence: 0.8,
    source: 'inferred',
  },
})

assert(
  smallestMoveStrategy.move === 'answer' &&
    smallestMoveStrategy.purpose.includes(
      'smallest state-improving step'
    ),
  'Conversation Strategy should define default advancement as a proportionate state-improving move'
)

const clarificationStrategy = resolveGeorgeConversationStrategy({
  action: 'execute_live_move',
  currentRuntime: 'live_george',
  latestUserText: 'They say the valuation is too high, but they may already have explained why.',
  judgmentSurface: {
    decisionSurface: 'execute',
    signalSufficiency: 'sufficient',
    shouldAcquireSignal: false,
    instruction: '',
  },
  trajectory: {
    currentMove: outcomeState.immediateOutcome,
    likelyNextMoves: [],
    potentialFutureNeeds: [],
    confidence: 0.68,
  },
  outcomeState,
})

assert(
  clarificationStrategy.move === 'probe',
  'a live objection should permit a diagnostic conversational move without mandating a line'
)

const moveDefinitions = listConversationMoveDefinitions()
assert(moveDefinitions.length === 15, 'conversation move library should define every supported move')
assert(
  moveDefinitions.every((definition) => definition.liveCompatibility || definition.normalCompatibility),
  'every conversational move should be compatible with at least one operating mode'
)
assert(
  clarificationStrategy.definition.id === clarificationStrategy.move,
  'conversation strategy should resolve its selected move through the canonical move library'
)
assert(
  clarificationStrategy.definition.assumptionSensitivity === 'high',
  'clarification should expose its high assumption sensitivity'
)
const clarificationMoveNote = buildConversationMoveDefinitionNote(
  clarificationStrategy.definition,
  clarificationStrategy.assumptions
)
assert(
  clarificationMoveNote.includes('Do not use when') && clarificationMoveNote.includes('Current assumptions'),
  'move definition notes should expose constraints and assumptions to the provider'
)
assert(
  resolveConversationMoveDefinition('pause').liveCompatibility &&
    !resolveConversationMoveDefinition('pause').normalCompatibility,
  'pause should remain a LIVE-compatible move rather than a Normal default'
)

const conversationStrategyNote = buildConversationStrategyNote(clarificationStrategy)
assert(
  conversationStrategyNote.includes('Candidate move:') &&
    conversationStrategyNote.includes('Operational purpose:') &&
    conversationStrategyNote.includes('Strategy confidence:') &&
    conversationStrategyNote.includes('supporting operational knowledge') &&
    conversationStrategyNote.includes('Use, adapt, or reject') &&
    conversationStrategyNote.includes('current user utterance') &&
    !conversationStrategyNote.includes('Selected move:') &&
    !conversationStrategyNote.includes('do not replace it with a different move') &&
    !conversationStrategyNote.includes('Move definition:') &&
    !conversationStrategyNote.includes('Use when:') &&
    !conversationStrategyNote.includes('User discretion is required:'),
  'conversation strategy note should provide supporting reasoning knowledge rather than mandate a selected response move'
)

assert(
  clarificationMoveNote.includes('CONVERSATION MOVE KNOWLEDGE') &&
    clarificationMoveNote.includes('reasoning support') &&
    clarificationMoveNote.includes('not as a response template') &&
    !clarificationMoveNote.includes('CONVERSATION MOVE\\n- Move:'),
  'conversation move definitions should support reasoning without becoming retrieved response templates'
)

const exploratoryOutcomeSignal = resolveSignalAcquisitionMoveVariant({
  signalNeed: 'desired_outcome',
  phase: 'early',
})
const executiveOutcomeSignal = resolveSignalAcquisitionMoveVariant({
  signalNeed: 'desired_outcome',
  phase: 'active',
  executive: true,
})
const recoveryOutcomeSignal = resolveSignalAcquisitionMoveVariant({
  signalNeed: 'desired_outcome',
  phase: 'recovery',
})

assert(
  exploratoryOutcomeSignal.style === 'exploratory' &&
    executiveOutcomeSignal.style === 'executive' &&
    recoveryOutcomeSignal.style === 'recovery' &&
    new Set([
      exploratoryOutcomeSignal.question,
      executiveOutcomeSignal.question,
      recoveryOutcomeSignal.question,
    ]).size === 3,
  'one semantic signal should support multiple context-sensitive conversational realizations'
)

assert(
  buildOpportunitySignalAcquisitionMessage({
    sessionActivation: 'Let’s prepare LIVE support for this session.',
    signalNeed: 'desired_outcome',
    phase: 'recovery',
  }).includes('Before we go further') &&
    buildOpportunitySignalAcquisitionMessage({
      sessionActivation: 'Let’s prepare LIVE support for this session.',
      signalNeed: 'desired_outcome',
      executive: true,
    }).includes('single outcome'),
  'Conversation Strategy should select the lowest-cost signal move while the move library owns the wording variants'
)

assert(
  operationalJudgment.liveSupport.posture === 'surface' &&
    operationalJudgment.liveSupport.instruction.includes(
      'provider determines LIVE materially improves the desired outcome'
    ) &&
    operationalJudgment.liveSupport.instruction.includes(
      'Never auto-route or change operating mode'
    ),
  'operational judgment should govern LIVE presentation without recreating semantic recommendation ownership'
)

const operationalJudgmentNote = buildOperationalJudgmentNote(operationalJudgment)

assert(
  operationalJudgmentNote.includes('OPERATIONAL JUDGMENT') &&
    operationalJudgmentNote.includes(
      'Governing action: ' + operationalJudgment.action
    ) &&
    operationalJudgmentNote.includes(
      'Operational posture: ' + operationalJudgment.operationalPosture
    ) &&
    operationalJudgmentNote.includes(
      'Agency policy: ' + operationalJudgment.agency
    ) &&
    operationalJudgmentNote.includes(
      'LIVE capability posture: ' + operationalJudgment.liveSupport.posture
    ),
  'operational judgment note should expose one governing operational synthesis without recreating semantic ownership'
)

const preparationFraming = resolveContextFraming({
  runtime: 'normal_george',
  latestUserText: 'I have an investor meeting tomorrow and need to preserve control.',
  voiceMode: false,
  operationalJudgment,
})

assert(preparationFraming.show, 'high-value preparation should show context framing')
assert(preparationFraming.title === 'Current Situation', 'Normal preparation should use Current Situation')
assert(preparationFraming.items.length === 4, 'context framing should contain exactly four orientation items')
assert(
  preparationFraming.items[0]?.value === outcomeState.immediateOutcome,
  'context framing should present the canonical outcome instead of inferring a competing objective'
)
assert(
  preparationFraming.items.some((item) => item.label === 'Pressure' && item.value.includes('execution') && item.value.includes('governance')),
  'context framing pressure should describe the external room dynamic'
)
assert(
  preparationFraming.items.some((item) => item.label === 'Priority' && item.value.includes('execution confidence') && !item.value.includes('Acquire')),
  'context framing priority should state the governing objective rather than a follow-up question'
)
assert(
  preparationFraming.items.every((item) => !/^(State|Name|Acquire|Do not invent context)/.test(item.value)),
  'context framing should contain resolved situational statements rather than writing instructions'
)

const investorUnknownFraming = resolveContextFraming({
  runtime: 'normal_george',
  latestUserText: 'I have an investor meeting tomorrow and need to preserve control.',
  voiceMode: false,
  operationalJudgment: {
    ...operationalJudgment,
    action: 'acquire_smallest_signal',
    smallestSignal: 'the one fact that would change the next move',
  },
})

assert(
  investorUnknownFraming.items.some(
    (item) => item.label === 'Unknown' && item.value.includes('pre-term-sheet')
  ),
  'context framing should resolve a generic investor unknown into the actual missing fact'
)

const liveFraming = resolveContextFraming({
  runtime: 'live_george',
  latestUserText: 'They are pushing for a second board seat right now.',
  voiceMode: false,
  operationalJudgment,
})

assert(liveFraming.title === 'What Matters Now', 'LIVE visual framing should use What Matters Now')

const audioLiveFraming = resolveContextFraming({
  runtime: 'live_george',
  latestUserText: 'They are pushing for a second board seat right now.',
  voiceMode: true,
  operationalJudgment,
})

assert(!audioLiveFraming.show, 'LIVE audio should suppress visual context framing')

const simpleFraming = resolveContextFraming({
  runtime: 'normal_george',
  latestUserText: 'Fix this typo.',
  voiceMode: false,
  operationalJudgment,
})

assert(!simpleFraming.show, 'simple tasks should suppress context framing')

const contextFramingNote = buildContextFramingPresentationNote(preparationFraming)
assert(
  contextFramingNote.includes('CONTEXT FRAMING — INTERNAL'),
  'Normal context framing should remain internal'
)
assert(
  contextFramingNote.includes('Do not render the heading or item labels to the user.'),
  'Normal context framing should guide reasoning without forcing user-facing scaffolding'
)

const liveRecommendationPresentation = resolveLiveRecommendationPresentation({
  liveSupport: operationalJudgment.liveSupport,
  latestUserText: 'The meeting starts in five minutes. I have my audio glasses with me.',
  voiceMode: false,
})

assert(liveRecommendationPresentation.show, 'imminent execution should surface the LIVE presentation notice')
assert(
  liveRecommendationPresentation.receiverLabel === 'audio glasses',
  'LIVE presentation should use the known receiver profile'
)
assert(
  liveRecommendationPresentation.contextLabel === 'Your meeting',
  'LIVE presentation should preserve the current execution context'
)

const liveRecommendationPresentationNote = buildLiveRecommendationPresentationNote(
  liveRecommendationPresentation
)

assert(
  liveRecommendationPresentationNote.includes('After Context Framing and before preparation guidance'),
  'presentation authority should place the LIVE notice after context framing'
)

const presentedLiveRecommendation = enforceLiveRecommendationPresentation({
  reply:
    'Current Situation\\n' +
    'Objective: Engage the investor with confidence and clarity.\\n' +
    'Pressure: Real-time pressure now as the meeting is imminent.\\n' +
    'Priority: Deliver a compelling opener to capture interest quickly.\\n' +
    'Unknown: How familiar the investor is with your business details.\\n\\n' +
    'Preparation\\n' +
    'Open with the strongest proof.',
  presentation: liveRecommendationPresentation,
  contextFraming: preparationFraming,
})

assert(
  presentedLiveRecommendation.indexOf('Current Situation') < presentedLiveRecommendation.indexOf('LIVE Available') &&
    presentedLiveRecommendation.indexOf('LIVE Available') < presentedLiveRecommendation.indexOf('Preparation'),
  'LIVE notice should render between context framing and preparation'
)
assert(
  presentedLiveRecommendation.includes('audio glasses') && presentedLiveRecommendation.includes('Your meeting is imminent'),
  'LIVE notice should preserve receiver and room context'
)

const governedRuntimeContext = buildGovernedRuntimeContext({
  liveRuntimeContext: 'LIVE CONTEXT',
  runtimeAdapterNote: 'RUNTIME ADAPTER',
  operationalJudgmentNote: 'OPERATIONAL JUDGMENT',
  outcomeEvolutionNote: 'OUTCOME EVOLUTION',
  conversationStrategyNote: 'CONVERSATION STRATEGY',
  conversationMoveDefinitionNote: 'CONVERSATION MOVE',
  executionPolicyNote: 'EXECUTION POLICY',
  contextFramingNote: 'CONTEXT FRAMING',
  liveRecommendationPresentationNote: 'LIVE RECOMMENDATION PRESENTATION',
  responseShapeNote: 'RESPONSE SHAPE',
  outputGovernanceNote: 'OUTPUT GOVERNANCE',
})

assert(
  governedRuntimeContext.indexOf('LIVE CONTEXT') < governedRuntimeContext.indexOf('RUNTIME ADAPTER') &&
    governedRuntimeContext.indexOf('RUNTIME ADAPTER') < governedRuntimeContext.indexOf('OPERATIONAL JUDGMENT') &&
    governedRuntimeContext.indexOf('OPERATIONAL JUDGMENT') < governedRuntimeContext.indexOf('OUTCOME EVOLUTION') &&
    governedRuntimeContext.indexOf('OUTCOME EVOLUTION') < governedRuntimeContext.indexOf('CONVERSATION STRATEGY') &&
    governedRuntimeContext.indexOf('CONVERSATION STRATEGY') < governedRuntimeContext.indexOf('CONVERSATION MOVE') &&
    governedRuntimeContext.indexOf('CONVERSATION MOVE') < governedRuntimeContext.indexOf('EXECUTION POLICY') &&
    governedRuntimeContext.indexOf('EXECUTION POLICY') < governedRuntimeContext.indexOf('CONTEXT FRAMING') &&
    governedRuntimeContext.indexOf('CONTEXT FRAMING') < governedRuntimeContext.indexOf('LIVE RECOMMENDATION PRESENTATION') &&
    governedRuntimeContext.indexOf('LIVE RECOMMENDATION PRESENTATION') < governedRuntimeContext.indexOf('RESPONSE SHAPE') &&
    governedRuntimeContext.indexOf('RESPONSE SHAPE') < governedRuntimeContext.indexOf('OUTPUT GOVERNANCE'),
  'governed runtime context should preserve canonical composition order'
)

for (const canonicalNote of [
  'OPERATIONAL JUDGMENT',
  'OUTCOME EVOLUTION',
  'CONVERSATION STRATEGY',
  'CONVERSATION MOVE',
  'EXECUTION POLICY',
  'CONTEXT FRAMING',
  'LIVE RECOMMENDATION PRESENTATION',
]) {
  assert(
    governedRuntimeContext.split(canonicalNote).length - 1 === 1,
    'governed runtime context should include ' + canonicalNote + ' exactly once'
  )
}

const providerExecutionAuthority = buildProviderExecutionAuthority({
  runtime: 'normal_george',
  action: 'protect_objective',
  strategyMove: 'anchor',
  strategyPurpose: 'Protect the active outcome.',
  executionType: 'answer',
  audience: 'user',
  normalPosture: 'execution_imminent',
  explanationDepth: 'minimal',
  assumptionHandling: 'brief_dependency',
  repetitionPolicy: 'avoid_restatement',
  signalShouldAcquire: false,
  signalReason: 'Current evidence is sufficient.',
  opportunityTitle: 'LIVE',
  opportunityReadiness: 84,
  opportunityThresholdMet: true,
})

const normalProviderRuntimeContext = buildNormalProviderRuntimeContext({
  providerExecutionAuthority,
  adaptiveUserProfileNote: 'ADAPTIVE PROFILE',
  durableBehavioralMemoryNote: 'DURABLE MEMORY',
  runtimeOutcomeLearningNote: 'OUTCOME LEARNING',
  continuityRestorationNote: 'CONTINUITY RESTORATION',
  presentationAuthorityNote: 'PRESENTATION AUTHORITY',
})

assert(
  normalProviderRuntimeContext.includes('PROVIDER EXECUTION AUTHORITY') &&
    normalProviderRuntimeContext.includes('Audience: user') &&
    normalProviderRuntimeContext.includes(
      'Never adopt LIVE room-facing response style'
    ) &&
    normalProviderRuntimeContext.includes('ADAPTIVE PROFILE') &&
    !normalProviderRuntimeContext.includes('CONVERSATION STRATEGY KNOWLEDGE') &&
    !normalProviderRuntimeContext.includes('EXECUTION POLICY'),
  'Normal provider context should consolidate runtime conclusions into one authoritative realization brief while preserving durable context'
)

assert(
  providerExecutionAuthority.includes(
    'selected conversational move defines the maximum allowable scope'
  ) &&
    providerExecutionAuthority.includes(
      'smallest move that improves the operational state'
    ) &&
    !providerExecutionAuthority.includes(
      'complete the entire likely project on every turn'
    ),
  'provider authority should constrain outcome advancement to the smallest selected move rather than maximum helpfulness'
)

const conversationalInvestorBridge = renderOperationalExcellenceOutput({
  reply:
    '"Lead with the traction milestone."\\n' +
    '"Then explain the use of funds."\\n' +
    '"If they push on governance, return to execution proof."',
  presentationMode: 'conversational',
  latestUserText: 'What should I say in the investor meeting?',
})

assert(
  conversationalInvestorBridge.includes('most directly advances the outcome'),
  'conversational bridge should adapt to the current human context'
)
assert(
  !conversationalInvestorBridge.includes('compare the two numbers'),
  'non-numeric conversations must not inherit the numeric dispute bridge'
)

const naturalNormalRealization = renderOperationalExcellenceOutput({
  reply:
    'Current Situation\\n' +
    'Objective: Identify the concern and protect the desired outcome.\\n' +
    'Pressure: Investor confidence matters.\\n' +
    'Priority: Strengthen execution confidence.\\n' +
    'Avoid: Do not negotiate governance before establishing confidence.\\n' +
    'Do not drop price yet. Open with: "Help me understand what is driving the concern."\\n' +
    'Leverage question: Is this about ownership or execution risk?',
  presentationMode: 'conversational',
  latestUserText: 'The investor challenged our valuation. What should I do next?',
})

assert(
  !/^\s*(Current Situation|Objective:|Pressure:|Priority:|Unknown:|Avoid:|LIVE Available|Strong path:|Meeting flow:|Quick signal:|Leverage question:)\s*/im.test(
    naturalNormalRealization
  ),
  'Normal realization should not expose internal briefing scaffolding'
)

assert(
  naturalNormalRealization.includes('Do not drop price yet.') &&
    naturalNormalRealization.includes('Open with:') &&
    naturalNormalRealization.includes('Is this about ownership or execution risk?'),
  'Normal realization should preserve useful guidance without exposing internal framing'
)

const conversationalNumbersBridge = renderOperationalExcellenceOutput({
  reply:
    '"Let us compare the forecast assumptions."\\n' +
    '"The source period is different."\\n' +
    '"That does not change the decision."',
  presentationMode: 'conversational',
  latestUserText: 'What should I say when they challenge the revenue numbers?',
})

assert(
  conversationalNumbersBridge.includes('source, timeframe, or assumption'),
  'numeric disputes should preserve the evidence-focused conversational bridge'
)

const coursesExpandResponse = resolveCoursesExpandResponse()

assert(
  coursesExpandResponse.includes('Tell me what you want to earn'),
  'courses_expand response should remain owned by the training runtime'
)

const trainingSend = resolvePreProviderSend({
  text: 'I need help preparing for my GED.',
  activePromptContext: 'training_ged',
  activeMemoryFolder: null,
  previousUserMessages: [],
})

assert(
  trainingSend.metadata.activeDomain === 'ged',
  'training and domain evidence should remain available in one portable result'
)

if (trainingSend.mode === 'direct') {
  assert(
    trainingSend.authority === 'training',
    'training override must retain precedence over a domain override'
  )
}



const previousFinancingOutcome = resolveGeorgeOutcomeState({
  desiredOutcome: 'Raise this round without giving up operational control',
  transcript: 'I am preparing for an investor meeting.',
  objectiveKnown: true,
  signalUsable: true,
})

const executionOutcome = resolveGeorgeOutcomeState({
  transcript: 'The meeting starts in five minutes and they may ask about board control.',
  objectiveKnown: true,
  signalUsable: true,
  executionImminent: true,
})

const phaseEvolution = evolveGeorgeOutcomeState({
  previousState: previousFinancingOutcome,
  inferredState: executionOutcome,
  latestUserText: 'The meeting starts in five minutes and they may ask about board control.',
})
assert(phaseEvolution.state.primaryOutcome === previousFinancingOutcome.primaryOutcome, 'phase evolution must preserve the primary outcome')
assert(phaseEvolution.state.phase === 'execution', 'phase evolution should allow preparation to become execution')

const constrainedEvolution = evolveGeorgeOutcomeState({
  previousState: previousFinancingOutcome,
  inferredState: executionOutcome,
  latestUserText: 'I want to close this round without giving up operational control.',
})
assert((constrainedEvolution.state.constraints || []).some((item) => item.includes('without giving up operational control')), 'outcome evolution should preserve explicit constraints')

const contradictionEvolution = evolveGeorgeOutcomeState({
  previousState: constrainedEvolution.state,
  inferredState: executionOutcome,
  latestUserText: 'But I may agree to broad operational vetoes.',
})
assert(contradictionEvolution.kind === 'contradiction_detected', 'outcome evolution should detect a possible contradiction')
assert(contradictionEvolution.state.primaryOutcome === constrainedEvolution.state.primaryOutcome, 'contradiction must not automatically replace the primary outcome')

const replacementOutcome = resolveGeorgeOutcomeState({
  desiredOutcome: 'Preserve the relationship and secure a second meeting',
  transcript: 'My goal is now to preserve the relationship and secure a second meeting.',
  objectiveKnown: true,
  signalUsable: true,
})
const explicitReplacement = evolveGeorgeOutcomeState({
  previousState: constrainedEvolution.state,
  inferredState: replacementOutcome,
  latestUserText: 'My goal is now to preserve the relationship and secure a second meeting.',
})
assert(explicitReplacement.kind === 'primary_replaced', 'explicit user direction should permit primary outcome replacement')
assert(explicitReplacement.state.primaryOutcome === replacementOutcome.primaryOutcome, 'explicit replacement should adopt the new primary outcome')
assert(buildOutcomeEvolutionNote(explicitReplacement).includes('OUTCOME EVOLUTION'), 'outcome evolution should expose a governed runtime note')

const operationalResourceMonitor = resolveOperationalResourceMonitor({
  outcomeState,
  conversationStrategy: operationalJudgment.conversationStrategy,
  operationalJudgment,
  trajectory: {
    currentMove: outcomeState.immediateOutcome,
    likelyNextMoves: ['execute'],
    potentialFutureNeeds: ['live'],
    confidence: 0.68,
  },
  liveRecommendationPresentation,
})
assert(operationalResourceMonitor.resources.length > 0, 'operational resource monitor should surface at least one high-value resource')
assert(operationalResourceMonitor.resources.length <= 3, 'operational resource monitor should remain bounded')
assert(
  OPPORTUNITY_READINESS_REGISTRY.length === 3 &&
    new Set(OPPORTUNITY_READINESS_REGISTRY.map((item) => item.kind)).size ===
      OPPORTUNITY_READINESS_REGISTRY.length &&
    OPPORTUNITY_READINESS_REGISTRY.every(
      (item) =>
        item.tapAction === 'continue_preparation' ||
        item.tapAction === 'open_execution_gateway'
    ),
  'opportunity readiness should be registered once per capability with a declarative consumer action'
)
assert(
  operationalResourceMonitor.opportunity?.kind === 'live_support' &&
    operationalResourceMonitor.opportunity.readiness >= 68 &&
    operationalResourceMonitor.opportunity.thresholdMet,
  'operational resource monitor should expose the highest-confidence readiness opportunity'
)

const pitchDeckOpportunityMonitor = resolveOperationalResourceMonitor({
  outcomeState,
  conversationStrategy: operationalJudgment.conversationStrategy,
  operationalJudgment,
  trajectory: {
    currentMove: outcomeState.immediateOutcome,
    likelyNextMoves: ['prepare'],
    potentialFutureNeeds: ['deck', 'brief'],
    confidence: 0.82,
  },
  liveRecommendationPresentation: {
    ...liveRecommendationPresentation,
    show: false,
  },
})

assert(
  pitchDeckOpportunityMonitor.opportunity?.kind === 'pitch_deck' &&
    pitchDeckOpportunityMonitor.opportunity.thresholdMet,
  'opportunity registry should prefer the more specific pitch deck capability over a generic brief'
)
assert(
  pitchDeckOpportunityMonitor.opportunity &&
    pitchDeckOpportunityMonitor.opportunity.signalNeed ===
      'audience_decision' &&
    buildOpportunitySignalAcquisitionMessage({
      sessionActivation:
        pitchDeckOpportunityMonitor.opportunity.sessionActivation,
      signalNeed: pitchDeckOpportunityMonitor.opportunity.signalNeed,
    }).includes('for this session') &&
    buildOpportunitySignalAcquisitionMessage({
      sessionActivation:
        pitchDeckOpportunityMonitor.opportunity.sessionActivation,
      signalNeed: pitchDeckOpportunityMonitor.opportunity.signalNeed,
    }).includes('what should it help them decide'),
  'Opportunity Readiness should declare the missing signal while Conversation Strategy realizes the question conversationally'
)
assert(operationalResourceMonitor.source === 'operational_resource_monitor', 'operational resource monitor should expose canonical ownership')

const normalExecutionPolicy = resolveGeorgeExecutionPolicy({
  runtime: 'normal_george',
  voiceMode: false,
  strategy: operationalJudgment.conversationStrategy,
  moveDefinition: operationalJudgment.conversationStrategy.definition,
  operationalJudgment,
  outcomeEvolution: phaseEvolution,
  operationalResourceMonitor,
  latestUserText: 'Help me prepare for the investor conversation.',
})
assert(normalExecutionPolicy.source === 'execution_policy', 'execution policy should expose canonical ownership')
assert(normalExecutionPolicy.deliveryPreference === 'text', 'Normal execution policy should preserve text delivery')
assert(normalExecutionPolicy.audience === 'user', 'Normal execution policy should address the user')
assert(buildExecutionPolicyNote(normalExecutionPolicy).includes('EXECUTION POLICY'), 'execution policy should expose a governed runtime note')
const normalExecutionPolicyNote = buildExecutionPolicyNote(normalExecutionPolicy)
assert(
  !normalExecutionPolicyNote.includes('Selected conversational move:') &&
    !normalExecutionPolicyNote.includes('\\n- Purpose:'),
  'execution policy note should not duplicate Conversation Strategy move or purpose'
)

const normalQuestionStrategy = resolveGeorgeConversationStrategy({
  action: 'acquire_smallest_signal',
  currentRuntime: 'normal_george',
  latestUserText: 'Help me prepare for the investor conversation.',
  judgmentSurface: {
    decisionSurface: 'acquire_signal',
    signalSufficiency: 'insufficient',
    shouldAcquireSignal: true,
    instruction: '',
  },
  trajectory: {
    currentMove: outcomeState.immediateOutcome,
    likelyNextMoves: ['prepare'],
    potentialFutureNeeds: ['live'],
    confidence: 0.72,
  },
  outcomeState,
})
const normalQuestionPolicy = resolveGeorgeExecutionPolicy({
  runtime: 'normal_george',
  voiceMode: false,
  strategy: normalQuestionStrategy,
  moveDefinition: normalQuestionStrategy.definition,
  operationalJudgment: { ...operationalJudgment, conversationStrategy: normalQuestionStrategy },
  outcomeEvolution: phaseEvolution,
  operationalResourceMonitor,
  latestUserText: 'Help me prepare for the investor conversation.',
})
assert(normalQuestionPolicy.executionType === 'direct_question', 'Normal question moves should ask the user directly rather than generate room scripts')
assert(buildExecutionPolicyNote(normalQuestionPolicy).includes('speak directly with the user'), 'Normal execution note should preserve user-facing conversation')

assert(
  buildExecutionPolicyNote(normalExecutionPolicy).includes(
    'selected conversational move defines the maximum response scope'
  ),
  'Execution Policy should preserve move-bounded response scope as a universal realization invariant'
)

const imminentOperationalJudgment = {
  ...operationalJudgment,
  operationalPosture: 'execution_imminent' as const,
}

const imminentNormalPolicy = resolveGeorgeExecutionPolicy({
  runtime: 'normal_george',
  voiceMode: false,
  strategy: imminentOperationalJudgment.conversationStrategy,
  moveDefinition: imminentOperationalJudgment.conversationStrategy.definition,
  operationalJudgment: imminentOperationalJudgment,
  outcomeEvolution: phaseEvolution,
  operationalResourceMonitor,
  latestUserText:
    'They are pushing for more governance rights than I am comfortable with, and the meeting is tomorrow.',
})

assert(
  imminentNormalPolicy.normalPosture === 'execution_imminent' &&
    imminentNormalPolicy.audience === 'user' &&
    imminentNormalPolicy.explanationDepth === 'minimal',
  'Normal execution-imminent posture should become tactical for the user without adopting LIVE room-facing behavior'
)
assert(
  buildExecutionPolicyNote(imminentNormalPolicy).includes(
    'stop broad planning'
  ) &&
    buildExecutionPolicyNote(imminentNormalPolicy).includes(
      'never changes LIVE response shaping'
    ),
  'Normal execution posture should explicitly preserve the Normal/LIVE realization boundary'
)

const livePostureIsolation = resolveNormalExecutionPosture({
  runtime: 'normal_george',
  voiceMode: false,
  strategy: operationalJudgment.conversationStrategy,
  moveDefinition: operationalJudgment.conversationStrategy.definition,
  operationalJudgment,
  outcomeEvolution: phaseEvolution,
  operationalResourceMonitor,
  latestUserText: 'The meeting starts in five minutes.',
})

assert(
  livePostureIsolation === operationalJudgment.operationalPosture,
  'Normal posture resolver should preserve canonical Operational Judgment posture instead of reinterpreting current-turn language'
)

const liveQuestionStrategy = resolveGeorgeConversationStrategy({
  action: 'execute_live_move',
  currentRuntime: 'live_george',
  latestUserText: 'They raised a concern but the specific issue is unclear.',
  judgmentSurface: {
    decisionSurface: 'execute',
    signalSufficiency: 'sufficient',
    shouldAcquireSignal: false,
    instruction: '',
  },
  trajectory: {
    currentMove: outcomeState.immediateOutcome,
    likelyNextMoves: ['execute'],
    potentialFutureNeeds: ['live'],
    confidence: 0.72,
  },
  outcomeState,
})
const liveQuestionPolicy = resolveGeorgeExecutionPolicy({
  runtime: 'live_george',
  voiceMode: true,
  strategy: liveQuestionStrategy,
  moveDefinition: liveQuestionStrategy.definition,
  operationalJudgment: { ...operationalJudgment, conversationStrategy: liveQuestionStrategy },
  outcomeEvolution: phaseEvolution,
  operationalResourceMonitor,
  latestUserText: 'They raised a concern but the specific issue is unclear.',
})
assert(liveQuestionPolicy.executionType === 'suggested_question', 'question moves should resolve to suggested-question execution')
assert(liveQuestionPolicy.audience === 'room_through_user', 'LIVE execution should produce room-ready support through the user')
assert(liveQuestionPolicy.explanationDepth === 'minimal', 'LIVE execution should remain minimal')
assert(liveQuestionPolicy.deliveryPreference === 'audio_visual', 'LIVE voice execution should support audio and visual delivery')
assert(liveQuestionPolicy.assumptionHandling === 'offer_adaptable_alternative', 'assumption-sensitive moves should expose adaptable execution')
assert(liveQuestionPolicy.repetitionPolicy === 'suppress_duplicate_live_recommendation', 'execution policy should suppress repeated LIVE recommendations')


const strategicProviderResolution = resolveGeorgeRuntimeProvider({
  userText: 'Help me negotiate investor governance without losing operational control.',
  tier: 'brilliant',
  hasImageInput: false,
})
assert(
  strategicProviderResolution.lane === 'strategic' &&
    strategicProviderResolution.provider === 'openai',
  'runtime pipeline should own strategic provider resolution'
)

const imageProviderResolution = resolveGeorgeRuntimeProvider({
  userText: 'Analyze this image.',
  tier: 'smart',
  hasImageInput: true,
})
assert(
  imageProviderResolution.provider === 'openai' &&
    imageProviderResolution.lane === 'strategic',
  'runtime pipeline should keep image requests on the vision-capable provider path'
)



const qualifiedRuntimePipeline = resolveGeorgeRuntimePipeline({
  currentRuntime: 'normal_george',
  latestUserText: 'I am walking into an investor meeting right now.',
  previousUserText: 'Help me prepare for an investor meeting while preserving founder control.',
  voiceMode: false,
  objectiveKnown: true,
  signalUsable: true,
  executionImminent: true,
  tier: 'brilliant',
  hasImageInput: false,
  intentState: {
    operational: true,
    exploratory: false,
    actionable: true,
    pressureLevel: 'medium',
    objectiveState: 'clear',
    narrowingReadiness: 0.7,
    continuityDependency: 0.1,
    liveRisk: false,
    emotionalLoad: 0.1,
    cadenceAvoid: [],
    bottleneck: { label: 'execution', confidence: 'high' },
    liveScenario: { active: false, type: 'none' },
    source: 'passive_aggregator',
  },
  runtimeArbitration: {
    winner: 'objective_protection',
    posture: 'protect_objective',
    delivery: 'structured',
    agency: 'user_decides',
    note: '',
  },
  judgmentSurface: {
    decisionSurface: 'execute',
    signalSufficiency: 'sufficient',
    shouldAcquireSignal: false,
    instruction: '',
  },
  continuityRestoration: {
    active: false,
    confidence: 'low',
    revealStyle: 'none',
    instruction: '',
  },
  outcomeSignals: {
    clarityImproved: 0.4,
    overloadDetected: 0.1,
    userConfidenceImproved: 0.4,
    pressureReduced: 0.4,
    leverageImproved: 0.4,
    executionLikelihood: 0.7,
  },
  adaptiveProfile: {
    conciseDeliveryPreference: 0.5,
    repeatableLineAffinity: 0.5,
    abstractReasoningTolerance: 0.5,
    calmPressurePreference: 0.5,
    leverageProtectionPreference: 0.5,
    tacticalCueRetention: 0.5,
    layeredExplanationTolerance: 0.5,
  },
  liveRecommendationEvidence,
  providerPrompt: {
    languageRule: 'LANGUAGE',
    modeBlock: 'MODE',
    baseSystemPrompt: 'BASE',
    messageSourceBlock: 'SOURCE',
    controlStateBlock: 'CONTROL',
    runtimeScoresBlock: 'SCORES',
    scoreAwareSteeringBlock: 'STEERING',
    conversationEngineRulesBlock: 'ENGINE',
    universalLiveOpeningBlock: 'LIVE OPENING',
    liveDisciplineBlock: 'LIVE DISCIPLINE',
    dynamicRuntimeBlocks: 'DYNAMIC',
    includeLiveDiscipline: true,
    recentMessages: [{ role: 'user', content: 'Help me prepare.' }],
  },
  governedContextNotes: {
    liveRuntimeContext: 'LIVE CONTEXT',
    runtimeAdapterNote: 'RUNTIME ADAPTER',
    responseShapeNote: 'RESPONSE SHAPE',
    outputGovernanceNote: 'OUTPUT GOVERNANCE',
  },
})

assert(qualifiedRuntimePipeline.source === 'runtime_pipeline', 'full runtime qualification should use the canonical pipeline')
assert(Object.isFrozen(qualifiedRuntimePipeline), 'runtime pipeline snapshot should be immutable')
assert(
  qualifiedRuntimePipeline.operationalJudgment.outcomeState === qualifiedRuntimePipeline.outcomeState,
  'Operational Judgment should consume the evolved canonical outcome state'
)
assert(
  qualifiedRuntimePipeline.conversationStrategy === qualifiedRuntimePipeline.operationalJudgment.conversationStrategy,
  'Conversation Strategy should be the strategy selected by Operational Judgment'
)
assert(
  qualifiedRuntimePipeline.conversationMoveDefinition === qualifiedRuntimePipeline.conversationStrategy.definition,
  'Conversation Move should resolve from the selected Conversation Strategy'
)
assert(
  qualifiedRuntimePipeline.executionPolicy.strategyMove === qualifiedRuntimePipeline.conversationStrategy.move,
  'Execution Policy should preserve the selected conversational move'
)
assert(
  qualifiedRuntimePipeline.operationalResourceMonitor.source === 'operational_resource_monitor',
  'Operational Resource Monitor should participate in the canonical pipeline'
)
assert(
  qualifiedRuntimePipeline.providerRequest.systemContent.includes(qualifiedRuntimePipeline.runtimeContextBlock),
  'Provider request should consume the canonical governed runtime context'
)
assert(
  qualifiedRuntimePipeline.runtimeContextBlock.includes(
    'PROVIDER EXECUTION AUTHORITY'
  ) &&
    !qualifiedRuntimePipeline.runtimeContextBlock.includes(
      'CONVERSATION STRATEGY KNOWLEDGE'
    ) &&
    !qualifiedRuntimePipeline.runtimeContextBlock.includes(
      'EXECUTION POLICY'
    ),
  'Normal pipeline should send one consolidated runtime authority instead of overlapping reasoning notes'
)
assert(
  qualifiedRuntimePipeline.providerRequest.systemContent.lastIndexOf(
    'PROVIDER EXECUTION AUTHORITY'
  ) >
    qualifiedRuntimePipeline.providerRequest.systemContent.lastIndexOf(
      'LIVE DISCIPLINE'
    ),
  'Normal provider execution authority should remain final even when LIVE availability is surfaced during Normal preparation'
)
assert(
  !qualifiedRuntimePipeline.providerRequest.systemContent.includes('BASE') &&
    !qualifiedRuntimePipeline.providerRequest.systemContent.includes('SOURCE') &&
    !qualifiedRuntimePipeline.providerRequest.systemContent.includes('CONTROL') &&
    !qualifiedRuntimePipeline.providerRequest.systemContent.includes('SCORES') &&
    !qualifiedRuntimePipeline.providerRequest.systemContent.includes('STEERING') &&
    !qualifiedRuntimePipeline.providerRequest.systemContent.includes('DYNAMIC') &&
    !qualifiedRuntimePipeline.providerRequest.systemContent.includes('ENGINE'),
  'Normal consolidated provider authority should replace redundant legacy provider guidance'
)
assert(
  GEORGE_RUNTIME_PIPELINE.stages.length === new Set(GEORGE_RUNTIME_PIPELINE.stages).size,
  'canonical pipeline stage declarations should be unique'
)

assert(
  qualifiedRuntimePipeline.timing.stages.length === GEORGE_RUNTIME_PIPELINE.stages.length,
  'runtime latency qualification should record every declared pipeline stage'
)
assert(
  qualifiedRuntimePipeline.timing.totalDurationMs >= 0,
  'runtime latency qualification should expose total pipeline duration'
)
assert(
  qualifiedRuntimePipeline.timing.stages.every(
    (timing) => timing.durationMs >= 0 && GEORGE_RUNTIME_PIPELINE.stages.includes(timing.stage as any)
  ),
  'runtime latency qualification should expose valid non-negative stage timings'
)
assert(
  Object.isFrozen(qualifiedRuntimePipeline.timing) &&
    Object.isFrozen(qualifiedRuntimePipeline.timing.stages),
  'runtime latency snapshot should remain immutable'
)

const providerRequest = buildGeorgeProviderRequest({
  currentRuntime: 'live_george',
  runtimeContextBlock: 'RUNTIME CONTEXT',
  latestUserText: 'Continue the current request.',
  prompt: {
    languageRule: 'LANGUAGE',
    modeBlock: 'MODE',
    baseSystemPrompt: 'BASE',
    messageSourceBlock: 'SOURCE',
    controlStateBlock: 'CONTROL',
    runtimeScoresBlock: 'SCORES',
    scoreAwareSteeringBlock: 'STEERING',
    conversationEngineRulesBlock: 'ENGINE',
    universalLiveOpeningBlock: 'LIVE OPENING',
    liveDisciplineBlock: 'LIVE DISCIPLINE',
    dynamicRuntimeBlocks: 'DYNAMIC',
    includeLiveDiscipline: true,
    recentMessages: [{ role: 'user', content: 'Help me prepare.' }],
  },
})
assert(providerRequest.systemContent.indexOf('RUNTIME CONTEXT') < providerRequest.systemContent.indexOf('BASE'), 'provider request should place governed runtime context before the base system prompt')
assert(
  providerRequest.systemContent.split('RUNTIME CONTEXT').length - 1 === 1,
  'provider request should include governed runtime context exactly once'
)

const ambiguousKnowledgeRequest = buildGeorgeProviderRequest({
  currentRuntime: 'normal_george',
  runtimeContextBlock: governedRuntimeContext,
  latestUserText: 'What is dilution?',
  prompt: {
    languageRule: 'LANGUAGE',
    modeBlock: 'MODE',
    baseSystemPrompt: 'BASE',
    messageSourceBlock: 'SOURCE',
    controlStateBlock: 'CONTROL',
    runtimeScoresBlock: 'SCORES',
    scoreAwareSteeringBlock: 'STEERING',
    conversationEngineRulesBlock: 'ENGINE',
    universalLiveOpeningBlock: 'LIVE OPENING',
    liveDisciplineBlock: 'LIVE DISCIPLINE',
    dynamicRuntimeBlocks: 'DYNAMIC',
    includeLiveDiscipline: false,
    recentMessages: [
      { role: 'user', content: 'Help me negotiate investor governance.' },
      { role: 'assistant', content: 'Let us protect founder control.' },
    ],
  },
})

assert(
  ambiguousKnowledgeRequest.messages.length === 1 &&
    ambiguousKnowledgeRequest.messages[0]?.role === 'user' &&
    ambiguousKnowledgeRequest.messages[0]?.content === 'What is dilution?',
  'standalone ambiguous knowledge questions should not inherit a forced interpretation from prior conversation'
)
assert(
  ambiguousKnowledgeRequest.systemContent.includes('NORMAL AMBIGUITY AUTHORITY') &&
    !ambiguousKnowledgeRequest.systemContent.includes(governedRuntimeContext) &&
    !ambiguousKnowledgeRequest.systemContent.includes('SOURCE') &&
    !ambiguousKnowledgeRequest.systemContent.includes('CONTROL') &&
    !ambiguousKnowledgeRequest.systemContent.includes('SCORES') &&
    !ambiguousKnowledgeRequest.systemContent.includes('STEERING') &&
    !ambiguousKnowledgeRequest.systemContent.includes('DYNAMIC'),
  'Normal ambiguous knowledge questions should suppress inherited operational context before provider reasoning'
)

const liveAmbiguousKnowledgeRequest = buildGeorgeProviderRequest({
  currentRuntime: 'live_george',
  runtimeContextBlock: governedRuntimeContext,
  latestUserText: 'What is dilution?',
  prompt: {
    languageRule: 'LANGUAGE',
    modeBlock: 'LIVE MODE',
    baseSystemPrompt: 'BASE',
    messageSourceBlock: 'SOURCE',
    controlStateBlock: 'CONTROL',
    runtimeScoresBlock: 'SCORES',
    scoreAwareSteeringBlock: 'STEERING',
    conversationEngineRulesBlock: 'ENGINE',
    universalLiveOpeningBlock: 'LIVE OPENING',
    liveDisciplineBlock: 'LIVE DISCIPLINE',
    dynamicRuntimeBlocks: 'DYNAMIC',
    includeLiveDiscipline: true,
    recentMessages: [{ role: 'user', content: 'What is dilution?' }],
  },
})

assert(
  liveAmbiguousKnowledgeRequest.systemContent.includes(governedRuntimeContext) &&
    liveAmbiguousKnowledgeRequest.systemContent.includes('BASE') &&
    liveAmbiguousKnowledgeRequest.systemContent.includes('ENGINE') &&
    liveAmbiguousKnowledgeRequest.systemContent.includes('LIVE DISCIPLINE') &&
    !liveAmbiguousKnowledgeRequest.systemContent.includes('NORMAL AMBIGUITY AUTHORITY'),
  'Normal provider compaction and ambiguity isolation must not alter LIVE provider guidance'
)

const contextualKnowledgeRequest = buildGeorgeProviderRequest({
  currentRuntime: 'normal_george',
  runtimeContextBlock: governedRuntimeContext,
  latestUserText: 'What does that dilution mean for my company?',
  prompt: {
    languageRule: 'LANGUAGE',
    modeBlock: 'MODE',
    baseSystemPrompt: 'BASE',
    messageSourceBlock: 'SOURCE',
    controlStateBlock: 'CONTROL',
    runtimeScoresBlock: 'SCORES',
    scoreAwareSteeringBlock: 'STEERING',
    conversationEngineRulesBlock: 'ENGINE',
    universalLiveOpeningBlock: 'LIVE OPENING',
    liveDisciplineBlock: 'LIVE DISCIPLINE',
    dynamicRuntimeBlocks: 'DYNAMIC',
    includeLiveDiscipline: false,
    recentMessages: [
      { role: 'user', content: 'The investor proposed issuing more shares.' },
      { role: 'assistant', content: 'That could dilute existing holders.' },
      { role: 'user', content: 'What does that dilution mean for my company?' },
    ],
  },
})

assert(
  contextualKnowledgeRequest.messages.length === 3,
  'explicitly contextual knowledge questions should preserve relevant conversation history'
)

assert(providerRequest.systemContent.includes('LIVE OPENING'), 'provider request should include LIVE opening guidance when enabled')
assert(
  providerRequest.messages.length === 2 &&
    providerRequest.messages.at(-1)?.role === 'user' &&
    providerRequest.messages.at(-1)?.content === 'Continue the current request.',
  'provider request should append the authoritative current user utterance when recent history does not contain it'
)
assert(Object.isFrozen(providerRequest), 'provider request should be immutable')
assert(Object.isFrozen(providerRequest.messages), 'provider message collection should be immutable')

console.log('GEORGE core smoke passed')
`)

try {
  execFileSync('npx', ['tsx', file], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}
