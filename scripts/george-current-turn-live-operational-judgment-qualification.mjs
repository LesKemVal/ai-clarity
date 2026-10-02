import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const route = read('app/api/chat/route.ts')
const page = read('app/george/page.tsx')
const shadowBridge = read('components/george/live/LiveHubShadowBridge.tsx')
const runtimeContextComposer = read(
  'lib/george/runtime/runtime-context-composer.ts',
)
const runtimePipeline = read('lib/george/runtime/runtime-pipeline.ts')
const runtimeAdapter = read('lib/george/live-hub/live-runtime-adapter.ts')
const deliveryBridge = read('components/george/live/LiveHubDeliveryBridge.tsx')
const hubLocalCueEngine = read('live-hub/src/george/local-cue-engine.ts')
const hubCueArbitrator = read('live-hub/src/george/cue-arbitrator.ts')

assert(
  route.includes('CURRENT_TURN_LIVE_OPERATIONAL_JUDGMENT_REQUEST') &&
    route.includes('currentTurnLiveOperationalJudgmentRequested') &&
    route.includes('resolveGeorgeRuntimePipeline(governedInvocation)'),
  'Ordinary LIVE current-turn input does not reach the canonical runtime pipeline.',
)
assert(
  route.includes('normalizeGeorgeLiveSpeakerEvidence(body?.liveSpeakerEvidence)') &&
    route.includes('inputSpeaker: liveSpeakerEvidence.speaker') &&
    !route.includes('userIntentAuthority'),
  'Fail-closed speaker evidence is not carried into governed invocation provenance.',
)
assert(
  runtimeContextComposer.includes('type GeorgeLiveTranscriptSpeaker') &&
    runtimeContextComposer.includes(
      'inputSpeaker?: GeorgeLiveTranscriptSpeaker',
    ) &&
    runtimeContextComposer.includes('normalizeGeorgeLiveSpeakerEvidence({') &&
    !runtimeContextComposer.includes('userIntentAuthority') &&
    runtimePipeline.match(
      /invocation\.provenance\.inputSpeaker === 'user'/g,
    )?.length === 1 &&
    !runtimePipeline.includes('userIntentAuthority') &&
    runtimePipeline.includes('operationalSignals: input.operationalSignals') &&
    runtimePipeline.includes('latestUserText: input.latestUserText'),
  'Canonical speaker provenance is duplicated or the runtime lost ordinary room evidence or primary-outcome replacement safety.',
)
assert(
  shadowBridge.indexOf('.sendTranscript(') <
      shadowBridge.indexOf('onFinalTranscriptForwardedRef.current?.') &&
    !shadowBridge.includes('await onFinalTranscriptForwarded'),
  'Canonical reasoning serialized or replaced the execution-safe Hub path.',
)
assert(
  page.includes('onFinalTranscriptForwarded={(currentTurn) =>') &&
    page.includes('liveCurrentTurnOperationalJudgmentRef.current(currentTurn)') &&
    page.includes('publishActionCue(actionCue)') &&
    page.includes('deliveryStyle: liveDeliveryStyle'),
  'The current-turn result does not enter the existing ACTION_CUE adapter with the selected delivery style.',
)
assert(
  runtimeAdapter.includes('finalizeGeorgeActionCueAuthority({') &&
    deliveryBridge.includes('routeGeorgeDeliveryCues({') &&
    deliveryBridge.includes('resolveGeorgeLiveDeliveryDeadline({') &&
    deliveryBridge.includes('evaluateGeorgeDeliveryCommitment({'),
  'Canonical current-turn delivery bypasses an existing authority, Receiver Policy, deadline, or commitment owner.',
)
assert(
  !hubLocalCueEngine.includes('resolveOperationalJudgment') &&
    !hubCueArbitrator.includes('resolveOperationalJudgment') &&
    !hubLocalCueEngine.includes('evolveGeorgeOutcomeState'),
  'The Hub fallback acquired strategic or outcome authority.',
)

const directory = mkdtempSync(
  join(tmpdir(), 'george-current-turn-live-operational-judgment-'),
)
const qualification = join(directory, 'qualification.ts')

writeFileSync(
  qualification,
  `
import {
  normalizeGovernedInvocationContractV1,
  GOVERNED_INVOCATION_CONTRACT_VERSION,
} from '${root}/lib/george/runtime/runtime-context-composer'
import {
  evolveGeorgeOutcomeState,
} from '${root}/lib/george/runtime/outcome-evolution'
import {
  resolveGeorgeOutcomeState,
} from '${root}/lib/george/live-voice/runtime/active-outcome'
import {
  buildGeorgeCurrentTurnOperationalActionCue,
} from '${root}/lib/george/live-hub/live-runtime-adapter'
import type {
  GeorgeRuntimeAuthoritySnapshot,
} from '${root}/lib/george/runtime/runtime-pipeline'
import {
  GEORGE_LIVE_DELIVERY_USEFULNESS_DEADLINES_MS,
  resolveGeorgeLiveDeliveryDeadline,
} from '${root}/lib/george/live-metrics/latency-budgets.mjs'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const prior = resolveGeorgeOutcomeState({
  desiredOutcome: 'secure approval without surrendering pricing authority',
  transcript: 'The governing outcome is approval without surrendering pricing authority.',
  objectiveKnown: true,
  signalUsable: true,
})
const proposedReplacement = resolveGeorgeOutcomeState({
  desiredOutcome: 'preserve the relationship and leave without approval',
  transcript: 'Actually, I want to preserve the relationship and leave without approval.',
  objectiveKnown: true,
  signalUsable: true,
})

const userAuthorized = evolveGeorgeOutcomeState({
  previousState: prior,
  inferredState: proposedReplacement,
  latestUserText: 'Actually, I want to preserve the relationship and leave without approval.',
  primaryOutcomeReplacementAuthorized: true,
})
const otherPartyEvidence = evolveGeorgeOutcomeState({
  previousState: prior,
  inferredState: proposedReplacement,
  latestUserText: 'Actually, I want to preserve the relationship and leave without approval.',
  primaryOutcomeReplacementAuthorized: false,
})
const unclearEvidence = evolveGeorgeOutcomeState({
  previousState: prior,
  inferredState: proposedReplacement,
  latestUserText: 'Actually, I want to preserve the relationship and leave without approval.',
})

assert(userAuthorized.kind === 'primary_replaced', 'Established user authority could not evolve the primary outcome.')
assert(userAuthorized.state.primaryOutcome === proposedReplacement.primaryOutcome, 'Established user authority did not adopt the explicit replacement.')
assert(otherPartyEvidence.state.primaryOutcome === prior.primaryOutcome, 'Other-party evidence replaced the user governing outcome.')
assert(unclearEvidence.state.primaryOutcome === prior.primaryOutcome, 'Unclear evidence replaced the user governing outcome.')
assert(otherPartyEvidence.kind === 'contradiction_detected', 'Other-party outcome pressure became operationally useless instead of conflict evidence.')
assert(unclearEvidence.kind === 'contradiction_detected', 'Unclear compromise evidence became operationally useless instead of conflict evidence.')

const invocationBase = {
  version: GOVERNED_INVOCATION_CONTRACT_VERSION,
  source: 'website_adapter',
  provenance: {
    adapter: 'app_api_chat',
    userInput: 'current_conversation',
    sessionAuthority: 'authenticated_session',
    preparationEvidence: 'none',
    operationalMemoryEvidence: 'none',
    runtimeInference: 'bounded_runtime_evidence',
    providerProposal: 'excluded_from_invocation_authority',
  },
  input: {
    currentRuntime: 'live_george',
    latestUserText: 'That will not work for us unless you concede pricing authority.',
    voiceMode: true,
    objectiveKnown: true,
    signalUsable: true,
    executionImminent: true,
    tier: 'brilliant',
    hasImageInput: false,
    intentState: {},
    runtimeArbitration: {},
    judgmentSurface: {},
    continuityRestoration: {},
    outcomeSignals: {},
    adaptiveProfile: {},
    liveRecommendationEvidence: {},
    operationalSignals: [],
    providerPrompt: {
      languageRule: '', modeBlock: '', baseSystemPrompt: '',
      messageSourceBlock: '', controlStateBlock: '', runtimeScoresBlock: '',
      scoreAwareSteeringBlock: '', conversationEngineRulesBlock: '',
      universalLiveOpeningBlock: '', liveDisciplineBlock: '',
      dynamicRuntimeBlocks: '', includeLiveDiscipline: true,
      recentMessages: [],
    },
    governedContextNotes: {},
  },
} as const

const missingAuthority = normalizeGovernedInvocationContractV1(invocationBase)
const establishedUser = normalizeGovernedInvocationContractV1({
  ...invocationBase,
  provenance: {
    ...invocationBase.provenance,
    inputSpeaker: 'user',
  },
})
const otherParty = normalizeGovernedInvocationContractV1({
  ...invocationBase,
  provenance: {
    ...invocationBase.provenance,
    inputSpeaker: 'other_party',
  },
})
const malformedSpeaker = normalizeGovernedInvocationContractV1({
  ...invocationBase,
  provenance: {
    ...invocationBase.provenance,
    inputSpeaker: 'provider',
  },
})

assert(missingAuthority?.provenance.inputSpeaker === 'unclear', 'Absent speaker provenance did not fail closed.')
assert(malformedSpeaker?.provenance.inputSpeaker === 'unclear', 'Malformed speaker provenance did not fail closed.')
assert(establishedUser?.provenance.inputSpeaker === 'user', 'Proven user speaker evidence did not survive normalization.')
assert(otherParty?.provenance.inputSpeaker === 'other_party', 'Other-party speaker evidence did not survive normalization.')

const runtimeSnapshot = {
  source: 'runtime_pipeline',
  operationalJudgment: {
    source: 'operational_judgment',
    action: 'act_now',
    confidence: 0.88,
    outcomeState: {
      primaryOutcome: prior.primaryOutcome,
      immediateOutcome: 'resolve the pricing-authority threat before proceeding',
    },
  },
  conversationStrategy: { move: 'clarify_decision_authority' },
} as unknown as GeorgeRuntimeAuthoritySnapshot
const canonicalCue = buildGeorgeCurrentTurnOperationalActionCue({
  turnId: 'live-turn-7',
  transcript: 'That will not work unless you concede pricing authority.',
  cue: 'What would approval require if pricing authority stays unchanged?',
  generatedAt: 1_100,
  deliveryStyle: 'response',
  runtimeSnapshot,
  responseAuthority: {
    source: 'operational_judgment',
    realization: 'provider_execution',
    executionAccepted: true,
    preAcceptanceProviderTextUsed: false,
  },
})
const providerOnlyCue = buildGeorgeCurrentTurnOperationalActionCue({
  turnId: 'live-turn-8',
  transcript: 'We can approve today.',
  cue: 'Concede now.',
  generatedAt: 1_100,
  deliveryStyle: 'response',
  runtimeSnapshot,
  responseAuthority: {
    source: 'provider',
    realization: 'provider_execution',
    executionAccepted: true,
    preAcceptanceProviderTextUsed: false,
  },
})
const unacceptedProviderCue = buildGeorgeCurrentTurnOperationalActionCue({
  turnId: 'live-turn-9',
  transcript: 'We can approve today.',
  cue: 'Concede now.',
  generatedAt: 1_100,
  deliveryStyle: 'response',
  runtimeSnapshot,
  responseAuthority: {
    source: 'operational_judgment',
    realization: 'provider_execution',
    executionAccepted: false,
    preAcceptanceProviderTextUsed: false,
  },
})

assert(canonicalCue?.source === 'operational_judgment', 'Accepted canonical result did not become an Operational Judgment ACTION_CUE.')
assert(canonicalCue?.turnId === 'live-turn-7' && canonicalCue.at === 1_100, 'Current-turn identity or timing was lost.')
assert(canonicalCue?.evidence?.deliveryStyle === 'response', 'User-selected support style was replaced or forced to Cue.')
assert(canonicalCue?.evidence?.runtimeSnapshot === runtimeSnapshot, 'Canonical authority snapshot was not transported unchanged.')
assert(providerOnlyCue === null, 'Provider output independently became a strategic ACTION_CUE.')
assert(unacceptedProviderCue === null, 'Unaccepted provider execution became a strategic ACTION_CUE.')

const records = [{ event: 'transcript_input', at: 1_000 }]
const current = resolveGeorgeLiveDeliveryDeadline({
  records,
  generatedAt: canonicalCue?.at,
  now: 1_200,
  modes: ['voice', 'visual'],
})
const compressed = resolveGeorgeLiveDeliveryDeadline({
  records,
  generatedAt: canonicalCue?.at,
  now: 1_000 + GEORGE_LIVE_DELIVERY_USEFULNESS_DEADLINES_MS.visualPreferred + 1,
  modes: ['voice', 'visual'],
})
const stale = resolveGeorgeLiveDeliveryDeadline({
  records,
  generatedAt: canonicalCue?.at,
  now: 1_000 + GEORGE_LIVE_DELIVERY_USEFULNESS_DEADLINES_MS.visualExpires + 1,
  modes: ['voice', 'visual'],
})

assert(current.action === 'deliver', 'Current strategic result was not deliverable.')
assert(compressed.action === 'compress' && !compressed.deliverModes.includes('voice'), 'Late strategic result was not compressed by the existing deadline owner.')
assert(stale.action === 'suppress', 'Stale strategic result was deliverable merely because reasoning completed.')

console.log(JSON.stringify({
  userOutcome: userAuthorized.kind,
  otherPartyOutcome: otherPartyEvidence.kind,
  unclearOutcome: unclearEvidence.kind,
  canonicalCueSource: canonicalCue?.source,
  selectedStyle: canonicalCue?.evidence?.deliveryStyle,
  deadlineActions: [current.action, compressed.action, stale.action],
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

console.log('GEORGE current-turn LIVE Operational Judgment connection: PASS')
