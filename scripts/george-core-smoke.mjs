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
import { routeLiveTranscript } from '${process.cwd()}/lib/george/live-runtime/transcript-routing'
import { resolveLiveTranscriptDecision } from '${process.cwd()}/lib/george/live-runtime/live-transcript-controller'
import { authorizeLiveTranscriptAction } from '${process.cwd()}/lib/george/live-runtime/live-action-authority'
import { evaluateSignalSufficiency } from '${process.cwd()}/lib/george/runtime/signal-sufficiency'
import { rankSignals } from '${process.cwd()}/lib/george/runtime/signal-ranking'

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

const routed = routeLiveTranscript({
  text: 'What should I say?',
  lastFinalTranscript: null,
  context: { liveMode: true },
  now: 1000,
})
assert(routed.decision.type === 'send', 'router should send non-steering transcript')

const action = resolveLiveTranscriptDecision({
  decision: routed.decision,
  transcript: 'What should I say?',
  lastSpokenLine: '',
})
assert(action.type === 'send', 'controller should convert send decision to send action')

const authority = authorizeLiveTranscriptAction({
  transcript: 'What should I say?',
  decision: routed.decision,
  action,
  isGeorgeSpeaking: false,
  isThinking: false,
  desiredOutcome: 'get the job offer',
})
assert(authority.verdict === 'allow', 'authority should allow clean send action')
assert(authority.shouldSend === true, 'authority should mark send action')

const sufficiency = evaluateSignalSufficiency({
  transcript: 'The investor challenged our revenue forecast and deadline.',
  outcome: 'raise capital',
})
assert(sufficiency.sufficient === true, 'signal sufficiency should detect enough high-value signal')

const ranked = rankSignals('The board challenged revenue and deadline risk.')
assert(ranked.length > 0, 'signal ranking should identify ranked signals')

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
