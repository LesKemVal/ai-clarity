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
import { buildGovernedRuntimeContext } from '${process.cwd()}/lib/george/runtime/runtime-context-composer'
import { buildOperationalJudgmentNote, resolveOperationalJudgment } from '${process.cwd()}/lib/george/runtime/operational-judgment'
import { buildConversationStrategyNote, resolveGeorgeConversationStrategy } from '${process.cwd()}/lib/george/runtime/conversation-strategy'
import { buildConversationMoveDefinitionNote, listConversationMoveDefinitions, resolveConversationMoveDefinition } from '${process.cwd()}/lib/george/runtime/conversation-move-library'
import { evaluateLiveRecommendationEvidence } from '${process.cwd()}/lib/george/runtime/live-recommendation-governor'
import { resolveContextFraming } from '${process.cwd()}/lib/george/runtime/context-framing'
import { resolveOperationalResourceMonitor } from '${process.cwd()}/lib/george/runtime/operational-resource-monitor'
import { buildExecutionPolicyNote, resolveGeorgeExecutionPolicy } from '${process.cwd()}/lib/george/runtime/execution-policy'
import { buildContextFramingPresentationNote, buildLiveRecommendationPresentationNote, enforceLiveRecommendationPresentation, resolveLiveRecommendationPresentation } from '${process.cwd()}/lib/george/chat/presentation-authority'
import { renderOperationalExcellenceOutput } from '${process.cwd()}/lib/george/chat/operational-excellence'
import { buildGeorgeProviderRequest, GEORGE_RUNTIME_PIPELINE, resolveGeorgeRuntimePipeline, resolveGeorgeRuntimeProvider } from '${process.cwd()}/lib/george/runtime/runtime-pipeline'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

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

const operationalJudgment = resolveOperationalJudgment({
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
})

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
  conversationStrategyNote.includes('Selected move:') &&
    conversationStrategyNote.includes('Operational purpose:') &&
    conversationStrategyNote.includes('Strategy confidence:') &&
    !conversationStrategyNote.includes('Move definition:') &&
    !conversationStrategyNote.includes('Use when:') &&
    !conversationStrategyNote.includes('User discretion is required:'),
  'conversation strategy note should remain concise and defer move semantics to canonical owners'
)

assert(
  operationalJudgment.liveSupport.posture === 'recommend',
  'operational judgment should own the LIVE recommendation decision'
)

const operationalJudgmentNote = buildOperationalJudgmentNote(operationalJudgment)

assert(
  operationalJudgmentNote.includes('single operational synthesis'),
  'operational judgment note should declare one governing synthesis'
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
assert(contextFramingNote.includes('Current Situation'), 'presentation authority should render the selected framing title')
assert(contextFramingNote.includes('Objective, Pressure, Priority, Avoid'), 'presentation authority should preserve framing item order')
assert(
  contextFramingNote.includes('Investor confidence in execution may determine how much governance control they seek.'),
  'presentation authority should render resolved context framing statements'
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
assert(operationalResourceMonitor.source === 'operational_resource_monitor', 'operational resource monitor should expose canonical ownership')

const normalExecutionPolicy = resolveGeorgeExecutionPolicy({
  runtime: 'normal_george',
  voiceMode: false,
  strategy: operationalJudgment.conversationStrategy,
  moveDefinition: operationalJudgment.conversationStrategy.definition,
  operationalJudgment,
  outcomeEvolution: phaseEvolution,
  operationalResourceMonitor,
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
})
assert(normalQuestionPolicy.executionType === 'direct_question', 'Normal question moves should ask the user directly rather than generate room scripts')
assert(buildExecutionPolicyNote(normalQuestionPolicy).includes('speak directly with the user'), 'Normal execution note should preserve user-facing conversation')

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
  runtimeContextBlock: 'RUNTIME CONTEXT',
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
assert(providerRequest.systemContent.includes('LIVE OPENING'), 'provider request should include LIVE opening guidance when enabled')
assert(providerRequest.messages.length === 1, 'provider request should preserve recent provider messages')
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
