import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const audioSemantics = read(
  'lib/george/live-delivery/audio-semantics.ts',
)
const deliveryRouter = read('lib/george/live-delivery/delivery-router.ts')
const deliveryBridge = read(
  'components/george/live/LiveHubDeliveryBridge.tsx',
)
const operationalJudgment = read(
  'lib/george/runtime/operational-judgment.ts',
)
const normalRoute = read('app/api/chat/route.ts')
const hubArbitrator = read('live-hub/src/george/cue-arbitrator.ts')
const silenceIntelligence = read(
  'lib/george/live-voice/runtime/silence-intelligence.ts',
)
const legacyOrchestrator = read(
  'lib/george/live-voice/runtime/orchestrator.ts',
)

assert(
  audioSemantics.includes("export type GeorgeAudioPerspective = 'to_user' | 'as_user'") &&
    audioSemantics.includes('GeorgeRepeatableSpeechTransition'),
  'The portable audio perspective and repeatable-speech contract is missing.',
)
assert(
  deliveryRouter.includes('realizeGeorgeAudioDelivery({') &&
    deliveryRouter.includes('resolveGeorgeReceiverDeliveryPolicy({'),
  'The canonical delivery router does not apply audio semantics before receiver shaping.',
)
assert(
  deliveryBridge.includes('INITIAL_GEORGE_AUDIO_DELIVERY_STATE') &&
    deliveryBridge.includes("repeatableSpeechUptake: 'unconfirmed'") &&
    !deliveryBridge.includes('localStorage'),
  'Session delivery state is not conservatively owned by the active bridge.',
)
assert(
  !operationalJudgment.includes('audio-semantics') &&
    !audioSemantics.includes('resolveOperationalJudgment'),
  'Audio realization has acquired or altered strategic judgment authority.',
)
assert(
  !normalRoute.includes('audio-semantics'),
  'LIVE audio realization leaked into Normal GEORGE.',
)
assert(
  hubArbitrator.includes('isFastCueExecutionEquivalent') &&
    hubArbitrator.includes('localCue: input.packet.cue'),
  'The Hub fast path is not bounded by its execution-safe local cue.',
)
assert(
  silenceIntelligence.includes('class GeorgeSilenceIntelligence') &&
    legacyOrchestrator.includes("from './silence-intelligence'") &&
    !deliveryRouter.includes('silence-intelligence') &&
    !deliveryBridge.includes('silence-intelligence'),
  'Dormant silence intelligence was wired into the canonical delivery path.',
)

const directory = mkdtempSync(join(tmpdir(), 'george-live-audio-v1-'))
const qualification = join(directory, 'qualification.ts')

writeFileSync(
  qualification,
  `
import {
  INITIAL_GEORGE_AUDIO_DELIVERY_STATE,
  realizeGeorgeAudioDelivery,
} from '${root}/lib/george/live-delivery/audio-semantics'
import { routeGeorgeDeliveryCues } from '${root}/lib/george/live-delivery/delivery-router'
import {
  evaluateGeorgeDeliveryCommitment,
} from '${root}/lib/george/live-delivery/delivery-commitment'
import { determineLiveVoiceSpeed } from '${root}/lib/george/live-delivery/voice-speed-policy'
import {
  clearGeorgeApprovedLiveDelivery,
  commitGeorgeApprovedLiveDelivery,
  replayLastGeorgeApprovedLiveDelivery,
} from '${root}/lib/george/live-runtime/approved-delivery-history'
import { buildGeorgeApprovedDeliveryRewordRequest } from '${root}/lib/george/live-runtime/approved-delivery-transform'
import { resolveGeorgeLiveDeliveryDeadline } from '${root}/lib/george/live-metrics/latency-budgets.mjs'
import { arbitrateCue } from '${root}/live-hub/src/george/cue-arbitrator'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const advice = realizeGeorgeAudioDelivery({
  text: 'Hold.',
  deliveryStyle: 'advice',
})
assert(advice.semantics.perspective === 'to_user', 'Advice must be TO_USER.')
assert(advice.text === 'My advice? Hold.', 'Advice needs minimum audible perspective framing.')

const firstLine = realizeGeorgeAudioDelivery({
  text: 'What number would make this workable for you?',
  deliveryStyle: 'response',
  previousState: advice.semantics.nextState,
})
assert(firstLine.semantics.perspective === 'as_user', 'Repeatable language must be AS_USER.')
assert(firstLine.semantics.repeatableSpeechTransition === 'enter', 'First repeatable line must enter repeatable speech.')
assert(firstLine.text.startsWith('Say: '), 'First repeatable line after advice needs transition framing.')

const maintainedLine = realizeGeorgeAudioDelivery({
  text: 'If I can get it under $40,000, are you prepared to approve it today?',
  deliveryStyle: 'response',
  previousState: firstLine.semantics.nextState,
  repeatableSpeechUptake: 'confirmed',
})
assert(maintainedLine.semantics.repeatableSpeechTransition === 'maintain', 'Confirmed uptake must maintain repeatable speech.')
assert(!maintainedLine.text.startsWith('Say:'), 'Maintained repeatable speech must not repeat the marker.')

const returnedAdvice = realizeGeorgeAudioDelivery({
  text: 'Get the commitment first.',
  deliveryStyle: 'cue',
  previousState: maintainedLine.semantics.nextState,
})
assert(returnedAdvice.semantics.repeatableSpeechTransition === 'exit', 'Advice must exit repeatable speech.')
assert(returnedAdvice.text === 'My advice? Get the commitment first.', 'Returned advice must be audibly identifiable.')

const reenteredLine = realizeGeorgeAudioDelivery({
  text: 'If we agree on price, are you ready to sign?',
  deliveryStyle: 'line',
  previousState: returnedAdvice.semantics.nextState,
})
assert(reenteredLine.semantics.repeatableSpeechTransition === 'enter', 'AS_USER speech must re-enter after advice.')
assert(reenteredLine.text.startsWith('Say: '), 'Re-entry must restore transition framing.')

const conservativeLine = realizeGeorgeAudioDelivery({
  text: 'Are you prepared to approve it today?',
  deliveryStyle: 'response',
  previousState: firstLine.semantics.nextState,
  repeatableSpeechUptake: 'unconfirmed',
})
assert(conservativeLine.text.startsWith('Say: '), 'Ambiguous uptake must fail conservatively.')

const continuation = realizeGeorgeAudioDelivery({
  text: '...the projections do not include the contracts expected next quarter.',
  deliveryStyle: 'continue',
  previousState: INITIAL_GEORGE_AUDIO_DELIVERY_STATE,
})
assert(continuation.semantics.perspective === 'as_user', 'Continuation must be AS_USER.')
assert(!continuation.text.startsWith('Say:'), 'User-initiated continuation must remain direct speech.')
assert(continuation.text.startsWith('...the projections'), 'Continuation must preserve direct first-person flow.')

const actionCue = {
  turnId: 'audio-v1-turn',
  cue: "Don't concede exclusivity yet.",
  reason: 'Preserve leverage.',
  operationalAssessment: {
    action: "Don't concede exclusivity yet.",
    evidence: "They haven't offered anything for it.",
    outcomeImpact: '',
    confidence: 0.91,
  },
  source: 'groq' as const,
  localCue: 'Pause.',
  category: 'operational_guidance',
  confidence: 0.91,
  priority: 90,
  at: 1_000,
}

const routed = routeGeorgeDeliveryCues({
  actionCue,
  context: {
    voiceEnabled: true,
    receiverProfile: 'audio_visual',
    deliveryStyle: 'advice',
    audioDeliveryState: INITIAL_GEORGE_AUDIO_DELIVERY_STATE,
    repeatableSpeechUptake: 'unconfirmed',
  },
})
const voice = routed.find((cue) => cue.mode === 'voice')
const visual = routed.find((cue) => cue.mode === 'visual')
assert(voice?.text.startsWith('My advice? '), 'Voice surface did not receive TO_USER framing.')
assert(voice?.text.includes("haven't offered anything"), 'Audio ceiling removed minimum sufficient operational meaning.')
assert(!visual?.text.startsWith('My advice? '), 'Audio framing leaked into the visual surface.')
assert(routed.length === 2, 'Audio/visual receiver routing changed unexpectedly.')

const silent = routeGeorgeDeliveryCues({
  actionCue,
  context: {
    voiceEnabled: false,
    receiverProfile: 'audio_only',
    deliveryStyle: 'advice',
  },
})
assert(silent.length === 1 && silent[0]?.mode === 'silent', 'Silent receiver policy changed unexpectedly.')

const duplicate = evaluateGeorgeDeliveryCommitment({
  current: { text: 'Hold.', armedAt: 1_000 },
  candidate: { text: 'Hold.', now: 1_100 },
})
assert(duplicate.action === 'suppress_duplicate', 'Duplicate suppression regressed.')

const committed = evaluateGeorgeDeliveryCommitment({
  current: { text: 'Hold.', armedAt: 1_000, committed: true, deliveryStarted: true },
  candidate: { text: 'Ask why.', now: 1_100, materiallyBetter: true },
})
assert(committed.action === 'keep_committed', 'Committed delivery protection regressed.')

const stale = resolveGeorgeLiveDeliveryDeadline({
  generatedAt: 1_000,
  now: 4_000,
  modes: ['voice'],
})
assert(stale.action === 'suppress', 'Expired audio delivery was not suppressed.')

const speed = determineLiveVoiceSpeed({
  deliveryStyle: 'continue',
  text: continuation.text,
})
assert(speed.speed === 1.08, 'Voice-speed policy changed unexpectedly.')

clearGeorgeApprovedLiveDelivery()
const approved = commitGeorgeApprovedLiveDelivery({
  ...actionCue,
  mode: 'voice',
  text: firstLine.text,
  deliveryStyle: 'response',
})
const replayed = replayLastGeorgeApprovedLiveDelivery('repeat')
assert(replayed?.text === approved?.text, 'Repeat altered already-approved delivery meaning.')
const reword = approved
  ? buildGeorgeApprovedDeliveryRewordRequest({ delivery: approved, choice: 'natural' })
  : null
assert(reword?.includes('Do not add a new recommendation, assumption, or unsupported claim.'), 'Approved reword lost its no-new-meaning boundary.')
clearGeorgeApprovedLiveDelivery()

const packet = {
  transcript: 'I need a moment.',
  isFinal: true,
  signal: 'stall',
  pressure: 'stall',
  objective: 'Preserve the current objective.',
  deliveryStyle: 'cue' as const,
  runtimeIntent: 'TACTICAL_CUE' as const,
  cue: 'Pause.',
  reason: 'Execution-safe pacing support.',
  category: 'stall',
  confidence: 0.84,
  priority: 75,
  source: 'local' as const,
  at: 1_000,
}

const prohibitedFastCues = [
  'Concede exclusivity.',
  'Promise delivery today.',
  'Revenue is $10 million.',
  'Change the objective to closing today.',
  'Reverse the strategy and accept their terms.',
  'Disclose the confidential evidence.',
  'Offer a 50 percent discount now.',
]
const unsafeFastCues = prohibitedFastCues.map((fastCue) =>
  arbitrateCue({ packet, fastCue }),
)
assert(
  unsafeFastCues.every(
    (result) => result.source === 'local' && result.cue === 'Pause.',
  ),
  'Hub fast path created concessions, commitments, facts, objectives, reversals, disclosures, or high-leverage moves.',
)

const equivalentFastCue = arbitrateCue({ packet, fastCue: 'Pause' })
assert(equivalentFastCue.source === 'groq' && equivalentFastCue.cue === 'Pause', 'Execution-equivalent fast realization was rejected.')

console.log(JSON.stringify({
  advicePerspective: advice.semantics.perspective,
  firstTransition: firstLine.semantics.repeatableSpeechTransition,
  maintainedTransition: maintainedLine.semantics.repeatableSpeechTransition,
  exitTransition: returnedAdvice.semantics.repeatableSpeechTransition,
  reentryTransition: reenteredLine.semantics.repeatableSpeechTransition,
  continuationPerspective: continuation.semantics.perspective,
  staleAction: stale.action,
  committedAction: committed.action,
  duplicateAction: duplicate.action,
  prohibitedFastCueCount: unsafeFastCues.length,
  hubUnsafeFastCueSources: [...new Set(unsafeFastCues.map((result) => result.source))],
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

console.log('GEORGE LIVE Audio Delivery Semantics + Usefulness Contract V1: PASS')
