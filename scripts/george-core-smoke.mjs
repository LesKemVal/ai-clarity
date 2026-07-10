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
