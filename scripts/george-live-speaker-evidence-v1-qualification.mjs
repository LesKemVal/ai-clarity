import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const coreExecution = read('lib/george/core/live-execution.ts')
const adapter = read(
  'lib/george/live-runtime/live-final-transcript-adapter.ts',
)
const productionCaller = read('app/george/page.tsx')
const audioBridge = read(
  'components/george/live/LiveHubDeliveryBridge.tsx',
)
const operationalJudgment = read(
  'lib/george/runtime/operational-judgment.ts',
)

assert(
  coreExecution.includes(
    "export type GeorgeLiveTranscriptSpeaker = 'user' | 'other_party' | 'unclear'",
  ) &&
    coreExecution.includes('normalizeGeorgeLiveSpeakerEvidence') &&
    coreExecution.includes(
      'isKnownUserSpeakingFromGeorgeLiveSpeakerEvidence(speakerEvidence)',
    ),
  'The canonical core boundary does not own normalized speaker evidence.',
)
assert(
  adapter.includes('speakerEvidence: input.speakerEvidence') &&
    productionCaller.includes('resolveLiveFinalTranscriptAction({'),
  'The website final-transcript adapter does not transport speaker evidence through the canonical execution path.',
)
assert(
  productionCaller.includes(
    'speakerEvidence: UNCLEAR_GEORGE_LIVE_SPEAKER_EVIDENCE',
  ) &&
    productionCaller.includes('liveSpeakerEvidence: speakerEvidence') &&
    audioBridge.includes("repeatableSpeechUptake: 'unconfirmed'"),
  'Current production did not preserve fail-closed speaker transport or conservatively unconfirmed repeatable-speech uptake.',
)
assert(
  !coreExecution.includes('fetch(') &&
    !adapter.includes('fetch(') &&
    !coreExecution.includes('openai') &&
    !coreExecution.includes('groq') &&
    !coreExecution.includes('anthropic'),
  'Speaker evidence introduced an additional model or network call.',
)
assert(
  !operationalJudgment.includes('GeorgeLiveSpeakerEvidence') &&
    !coreExecution.includes('resolveOperationalJudgment'),
  'Speaker evidence acquired or modified strategic judgment authority.',
)

const directory = mkdtempSync(join(tmpdir(), 'george-live-speaker-evidence-v1-'))
const qualification = join(directory, 'qualification.ts')

writeFileSync(
  qualification,
  `
import {
  isKnownUserSpeakingFromGeorgeLiveSpeakerEvidence,
  normalizeGeorgeLiveSpeakerEvidence,
  resolveGeorgeCoreLiveExecution,
} from '${root}/lib/george/core/live-execution'
import { resolveLiveFinalTranscriptAction } from '${root}/lib/george/live-runtime/live-final-transcript-adapter'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const absent = normalizeGeorgeLiveSpeakerEvidence(undefined)
const malformedValues = [
  null,
  'user',
  1,
  {},
  { speaker: 'george' },
  { speaker: true },
]
const malformed = malformedValues.map(normalizeGeorgeLiveSpeakerEvidence)
const user = normalizeGeorgeLiveSpeakerEvidence({ speaker: 'user' })
const otherParty = normalizeGeorgeLiveSpeakerEvidence({ speaker: 'other_party' })
const unclear = normalizeGeorgeLiveSpeakerEvidence({ speaker: 'unclear' })

assert(absent.speaker === 'unclear', 'Absent speaker evidence did not fail closed.')
assert(
  malformed.every((evidence) => evidence.speaker === 'unclear'),
  'Malformed or unsupported speaker evidence did not fail closed.',
)
assert(
  isKnownUserSpeakingFromGeorgeLiveSpeakerEvidence(user),
  'Proven user evidence did not derive knownUserSpeaking=true.',
)
assert(
  !isKnownUserSpeakingFromGeorgeLiveSpeakerEvidence(otherParty),
  'Other-party evidence derived knownUserSpeaking=true.',
)
assert(
  !isKnownUserSpeakingFromGeorgeLiveSpeakerEvidence(unclear),
  'Unclear evidence derived knownUserSpeaking=true.',
)

const bounded = normalizeGeorgeLiveSpeakerEvidence({
  speaker: 'user',
  strategy: 'concede',
  recommendation: 'offer a discount',
  claim: 'unsupported fact',
  commitment: 'promise delivery',
  objective: 'replace the objective',
  highLeverageMove: 'disclose evidence',
})
assert(
  Object.keys(bounded).length === 1 && bounded.speaker === 'user',
  'Speaker evidence retained strategic or semantic payload.',
)

const baseInput = {
  transcript: 'Thank you for asking about my experience.',
  lastFinalTranscript: null,
  routingContext: { liveMode: true },
  lastSpokenLine: '',
  isGeorgeSpeaking: false,
  isThinking: false,
  desiredOutcome: 'answer the interview question',
  now: 2_000,
}

const coreUser = resolveGeorgeCoreLiveExecution({
  ...baseInput,
  speakerEvidence: { speaker: 'user' },
})
const coreOtherParty = resolveGeorgeCoreLiveExecution({
  ...baseInput,
  speakerEvidence: { speaker: 'other_party' },
})
const coreUnclear = resolveGeorgeCoreLiveExecution(baseInput)

assert(coreUser.speakerEvidence.speaker === 'user', 'Core execution lost user speaker evidence.')
assert(coreOtherParty.speakerEvidence.speaker === 'other_party', 'Core execution lost other-party speaker evidence.')
assert(coreUnclear.speakerEvidence.speaker === 'unclear', 'Core execution did not default speaker evidence to unclear.')

const adapterUnclear = resolveLiveFinalTranscriptAction({
  transcript: 'What are your priorities?',
  lastFinalTranscript: null,
  isThinking: false,
  isSpeaking: false,
  liveMode: true,
  buyTimeUntil: 0,
  lastSpokenLine: '',
  overlapDetected: false,
  desiredOutcome: 'understand the priorities',
})
const adapterUser = resolveLiveFinalTranscriptAction({
  transcript: 'Thank you for asking about my experience.',
  speakerEvidence: { speaker: 'user' },
  lastFinalTranscript: null,
  isThinking: false,
  isSpeaking: false,
  liveMode: true,
  buyTimeUntil: 0,
  lastSpokenLine: '',
  overlapDetected: false,
  desiredOutcome: 'answer the interview question',
})

assert(adapterUnclear?.speakerEvidence.speaker === 'unclear', 'Adapter absence did not normalize to unclear.')
assert(adapterUser?.speakerEvidence.speaker === 'user', 'Adapter did not transport proven user evidence.')

console.log(JSON.stringify({
  absentSpeaker: absent.speaker,
  malformedSpeakers: [...new Set(malformed.map((evidence) => evidence.speaker))],
  userKnown: isKnownUserSpeakingFromGeorgeLiveSpeakerEvidence(user),
  otherPartyKnown: isKnownUserSpeakingFromGeorgeLiveSpeakerEvidence(otherParty),
  unclearKnown: isKnownUserSpeakingFromGeorgeLiveSpeakerEvidence(unclear),
  currentProductionDefault: adapterUnclear?.speakerEvidence.speaker,
  boundedKeys: Object.keys(bounded),
  result: 'PASS',
}, null, 2))
`,
)

try {
  execFileSync(join(root, 'node_modules', '.bin', 'tsx'), [qualification], {
    cwd: root,
    stdio: 'inherit',
  })
} finally {
  rmSync(directory, { recursive: true, force: true })
}

console.log('GEORGE LIVE Speaker Evidence Contract V1: PASS')
