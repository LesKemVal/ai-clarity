import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'george-core-smoke-'))
const file = join(dir, 'smoke.ts')

writeFileSync(file, `
import { classifyLiveSpeakerIntent } from '${process.cwd()}/lib/george/live-voice/runtime/speaker-intent'
import { buildSteeringContinuation } from '${process.cwd()}/lib/george/live-voice/runtime/steering-continuation'
import { deriveActiveOutcome } from '${process.cwd()}/lib/george/live-voice/runtime/active-outcome'
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
import { evaluateLiveRecommendationEvidence } from '${process.cwd()}/lib/george/runtime/live-recommendation-governor'
import { resolveContextFraming } from '${process.cwd()}/lib/george/runtime/context-framing'
import { buildContextFramingPresentationNote } from '${process.cwd()}/lib/george/chat/presentation-authority'

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
    currentMove: 'advance the stated outcome',
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
})

assert(
  operationalJudgment.action === 'protect_objective',
  'operational judgment should synthesize evidence into one governing action'
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

const governedRuntimeContext = buildGovernedRuntimeContext({
  liveRuntimeContext: 'LIVE CONTEXT',
  runtimeAdapterNote: 'RUNTIME ADAPTER',
  operationalJudgmentNote: 'OPERATIONAL JUDGMENT',
  contextFramingNote: 'CONTEXT FRAMING',
  responseShapeNote: 'RESPONSE SHAPE',
  outputGovernanceNote: 'OUTPUT GOVERNANCE',
})

assert(
  governedRuntimeContext.indexOf('LIVE CONTEXT') < governedRuntimeContext.indexOf('RUNTIME ADAPTER') &&
    governedRuntimeContext.indexOf('RUNTIME ADAPTER') < governedRuntimeContext.indexOf('OPERATIONAL JUDGMENT') &&
    governedRuntimeContext.indexOf('OPERATIONAL JUDGMENT') < governedRuntimeContext.indexOf('CONTEXT FRAMING') &&
    governedRuntimeContext.indexOf('CONTEXT FRAMING') < governedRuntimeContext.indexOf('RESPONSE SHAPE') &&
    governedRuntimeContext.indexOf('RESPONSE SHAPE') < governedRuntimeContext.indexOf('OUTPUT GOVERNANCE'),
  'governed runtime context should preserve canonical composition order'
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
