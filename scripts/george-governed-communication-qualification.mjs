import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const judgmentSource = read('lib/george/runtime/operational-judgment.ts')
const providerSource = read('lib/george/runtime/provider/normal-provider.ts')
const pipelineSource = read('lib/george/runtime/runtime-pipeline.ts')
const executionSource = read('lib/george/runtime/execution-policy.ts')

const acceptanceOwners = [
  judgmentSource,
  providerSource,
  pipelineSource,
  executionSource,
].filter((source) =>
  source.includes('export function resolveCommunicationChangeJudgment'),
)

if (acceptanceOwners.length !== 1) {
  throw new Error('Communication-change scope must have exactly one acceptance owner.')
}

if (
  !providerSource.includes(
    'communicationChange: parseCommunicationChangeProposal',
  ) ||
  /export async function run\w*CommunicationChange/i.test(providerSource)
) {
  throw new Error(
    'Communication interpretation must travel in the existing semantic proposal without another provider call.',
  )
}

const dir = mkdtempSync(join(tmpdir(), 'george-governed-communication-'))
const file = join(dir, 'qualification.ts')

writeFileSync(
  file,
  `
import { deriveAdaptiveUserProfileFromSession } from '${root}/lib/george/runtime/adaptive-user-profile'
import {
  resolveCommunicationChangeJudgment,
  resolveSpeechCompositionJudgment,
  type ProviderCommunicationChangeProposal,
  type ProviderSpeechCompositionProposal,
} from '${root}/lib/george/runtime/operational-judgment'
import { buildLiveRuntimeContext } from '${root}/lib/george/live-runtime/live-runtime-context'
import { resolveGeorgeReceiverDeliveryPolicy } from '${root}/lib/george/live-delivery/receiver-policy'
import { transcriptBuffer } from '${root}/lib/george/live-voice/runtime/transcript-buffer'
import { georgePostureEngine } from '${root}/lib/george/live-voice/runtime/posture-engine'
import { resolveGeorgeExecutionPolicy } from '${root}/lib/george/runtime/execution-policy'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function proposal(
  overrides: Partial<ProviderCommunicationChangeProposal>,
): ProviderCommunicationChangeProposal {
  return {
    kind: 'wording',
    requestedScope: 'turn',
    signalSource: 'user_edit',
    confidence: 0.9,
    evidence: ['Use the revised sentence.'],
    clarificationRequired: false,
    effects: {
      activeObjective: false,
      factualRecord: false,
      supportConfiguration: false,
      realization: true,
    },
    reason: 'The user revised expression only.',
    ...overrides,
  }
}

const wording = resolveCommunicationChangeJudgment({ proposal: proposal({}) })!
assert(wording.accepted, 'Wording-only edit was not accepted.')
assert(
  wording.effects.realization &&
    !wording.effects.factualRecord &&
    !wording.effects.activeObjective &&
    !wording.effects.supportConfiguration,
  'Wording-only edit changed meaning or broader preferences.',
)

const fact = resolveCommunicationChangeJudgment({
  proposal: proposal({
    kind: 'fact',
    evidence: ['Change the meeting from Tuesday to Thursday.'],
    effects: {
      activeObjective: false,
      factualRecord: true,
      supportConfiguration: false,
      realization: false,
    },
  }),
})!
assert(
  fact.accepted && fact.effects.factualRecord && !fact.effects.realization,
  'Factual edit did not update only the factual record.',
)

const oneTerse = deriveAdaptiveUserProfileFromSession({
  turns: [{ userText: 'Okay.' }],
})
assert(
  oneTerse.profile.conciseDeliveryPreference === 0.5 &&
    !oneTerse.evidence.conciseSessionTendencyQualified,
  'One inferred terse response established a concise session preference.',
)

const repeatedConcise = deriveAdaptiveUserProfileFromSession({
  turns: [{ userText: 'Okay.' }, { userText: 'Got it.' }],
})
assert(
  repeatedConcise.profile.conciseDeliveryPreference > 0.5 &&
    repeatedConcise.evidence.conciseSessionTendencyQualified,
  'Repeated independent concise signals did not strengthen a session tendency.',
)

const contradictedConcise = deriveAdaptiveUserProfileFromSession({
  turns: [
    { userText: 'Okay.' },
    { userText: 'Got it.' },
    { userText: 'Please explain more detail.' },
  ],
})
assert(
  contradictedConcise.profile.conciseDeliveryPreference <
    repeatedConcise.profile.conciseDeliveryPreference &&
    contradictedConcise.evidence.conciseContradictions === 1,
  'Contradictory evidence did not weaken the concise tendency.',
)

const softerLine = resolveCommunicationChangeJudgment({
  proposal: proposal({
    kind: 'tone',
    requestedScope: 'line',
    signalSource: 'explicit_user_instruction',
    evidence: ['Make this line softer.'],
  }),
})!
assert(
  softerLine.accepted && softerLine.acceptedScope === 'line',
  'Explicit softer-line direction was not line-scoped.',
)

const calmerRoom = resolveCommunicationChangeJudgment({
  proposal: proposal({
    kind: 'tone',
    requestedScope: 'live_room',
    signalSource: 'explicit_user_instruction',
    evidence: ['Use a calmer style throughout this LIVE conversation.'],
  }),
})!
assert(
  calmerRoom.accepted && calmerRoom.acceptedScope === 'live_room',
  'Explicit calmer LIVE direction was not room-scoped.',
)
assert(
  !calmerRoom.durablePersistenceAuthorized &&
    calmerRoom.acceptedScope !== 'durable_candidate',
  'Room-scoped correction became durable.',
)

const ambiguousMaterialChange = resolveCommunicationChangeJudgment({
  proposal: proposal({
    kind: 'mixed',
    requestedScope: 'preparation_session',
    signalSource: 'runtime_inference',
    confidence: 0.8,
    evidence: ['The revision changes a date and also sounds less forceful.'],
    effects: {
      activeObjective: false,
      factualRecord: true,
      supportConfiguration: false,
      realization: true,
    },
  }),
})!
assert(
  !ambiguousMaterialChange.accepted &&
    ambiguousMaterialChange.clarificationRequired &&
    Boolean(ambiguousMaterialChange.clarificationQuestion),
  'Ambiguous material change did not produce one governed clarification.',
)

const compositionProposal = (
  overrides: Partial<ProviderSpeechCompositionProposal> = {},
): ProviderSpeechCompositionProposal => ({
  dimensions: {
    perspective: 'Use inclusive we where shared responsibility is established.',
    nounSelection: 'Prefer concrete, specific nouns.',
    verbConstruction: 'Use active, present-tense, moderately decisive verbs.',
    modifierDensity: 'Keep modifiers restrained.',
    syntax: 'Lead with the main point and use two short supporting clauses.',
    rhythm: 'Use balanced cadence with one purposeful repetition.',
    figurativeLanguage: 'Use one brief visual comparison only when it improves understanding.',
    implication: 'Be tactfully direct.',
  },
  requestedScope: 'turn',
  signalSource: 'runtime_inference',
  confidence: 0.84,
  evidence: [
    'The desired outcome requires a clear commitment.',
    'The counterpart responded better to concrete language.',
  ],
  decisionFactors: ['desired_outcome', 'counterpart_evidence'],
  protectedMeaning: {
    objective: true,
    facts: true,
    commitments: true,
    boundaries: true,
  },
  reason: 'This composition best serves the outcome in the present exchange.',
  ...overrides,
})

const qualifiedComposition = resolveSpeechCompositionJudgment({
  proposal: compositionProposal(),
})!
assert(
  qualifiedComposition.accepted &&
    qualifiedComposition.acceptedScope === 'turn' &&
    qualifiedComposition.dimensions.figurativeLanguage?.includes('visual comparison') &&
    !qualifiedComposition.durablePersistenceAuthorized,
  'Qualified contextual composition was not accepted as bounded expression.',
)

const isolatedComposition = resolveSpeechCompositionJudgment({
  proposal: compositionProposal({
    confidence: 0.92,
    evidence: ['One sentence was unusually terse.'],
    decisionFactors: ['current_moment'],
  }),
})!
assert(
  !isolatedComposition.accepted,
  'One isolated signal established an automatic speaking style.',
)

const editedComposition = resolveSpeechCompositionJudgment({
  proposal: compositionProposal({
    requestedScope: 'live_room',
    signalSource: 'user_edit',
    evidence: ['The user rewrote this sentence with stronger verbs.'],
    decisionFactors: ['demonstrated_user_fit'],
  }),
})!
assert(
  editedComposition.accepted &&
    editedComposition.acceptedScope === 'turn',
  'One user edit established a room-wide speaking style.',
)

const unsafeComposition = resolveSpeechCompositionJudgment({
  proposal: compositionProposal({
    signalSource: 'explicit_user_instruction',
    evidence: ['Make this sound stronger.'],
    decisionFactors: ['desired_outcome'],
    protectedMeaning: {
      objective: true,
      facts: true,
      commitments: false,
      boundaries: true,
    },
  }),
})!
assert(
  !unsafeComposition.accepted &&
    unsafeComposition.clarificationRequired &&
    Boolean(unsafeComposition.clarificationQuestion),
  'Expression authority was allowed to alter a protected commitment.',
)

const durableComposition = resolveSpeechCompositionJudgment({
  proposal: compositionProposal({
    requestedScope: 'durable_candidate',
    signalSource: 'repeated_behavior',
    evidence: [
      'Concrete comparisons improved recall in one completed interaction.',
      'Concrete comparisons improved comprehension in a separate interaction.',
    ],
    decisionFactors: [
      'desired_outcome',
      'demonstrated_user_fit',
    ],
  }),
})!
assert(
  durableComposition.accepted &&
    durableComposition.acceptedScope === 'durable_candidate' &&
    !durableComposition.durablePersistenceAuthorized,
  'A qualified durable candidate either failed or persisted without memory authority.',
)

const liveCommunicationExecution = resolveGeorgeExecutionPolicy({
  runtime: 'live_george',
  voiceMode: true,
  strategy: { move: 'anchor', purpose: 'Preserve the objective.' } as never,
  moveDefinition: { assumptionSensitivity: 'low' } as never,
  operationalJudgment: {
    communicationChange: calmerRoom,
    liveSupport: { posture: 'hold' },
  } as never,
  outcomeEvolution: {} as never,
  operationalResourceMonitor: { resources: [] } as never,
  latestUserText: 'Use a calmer style throughout this LIVE conversation.',
})
assert(
  liveCommunicationExecution.communicationRealization?.scope === 'live_room' &&
    liveCommunicationExecution.communicationRealization.kind === 'tone',
  'Accepted LIVE communication scope did not reach canonical Execution Policy.',
)

const executiveContext = buildLiveRuntimeContext({
  liveMode: true,
  runtimeSupport: { objective: 'Reach a clear next-step agreement.' },
  setup: {
    room: 'Executive review',
    objective: 'Reach a clear next-step agreement.',
    communicationStyle: 'Executive',
    communicationStyleConfirmed: true,
  },
  steeringLabels: [],
})
assert(
  executiveContext.includes(
    'Speaking style realization: executive (confirmed preparation preference)',
  ) &&
    executiveContext.includes('not a persona or reasoning authority') &&
    executiveContext.includes('Explicit current-turn direction'),
  'Confirmed speaking style did not reach governed LIVE realization context.',
)

const unconfirmedContext = buildLiveRuntimeContext({
  liveMode: true,
  runtimeSupport: null,
  setup: {
    communicationStyle: 'Executive',
    communicationStyleConfirmed: false,
  },
  steeringLabels: [],
})
assert(
  unconfirmedContext.includes('Speaking style realization: adaptive'),
  'Unconfirmed speaking style acquired realization authority.',
)

const receiverDelivery = resolveGeorgeReceiverDeliveryPolicy({
  text: 'A sufficiently long response that receiver policy may shape for audio delivery without deciding its meaning or preference authority.',
  voiceEnabled: true,
  deliveryStyle: 'response',
  receiverProfile: 'audio_only',
})
assert(
  receiverDelivery.length === 1 &&
    receiverDelivery[0].mode === 'voice' &&
    Object.keys(receiverDelivery[0]).sort().join(',') === 'mode,reason,text',
  'Receiver shaping acquired reasoning or preference authority.',
)

transcriptBuffer.clear()
transcriptBuffer.add({
  id: 'role-1',
  text: 'This is the policy.',
  speaker: 'other_party',
  role: 'authority',
  roleConfidence: 0.95,
  createdAt: 1,
})
const weakRole = transcriptBuffer.getDominantRole()
const weakPosture = georgePostureEngine.decide({
  dominantRole: 'authority',
  dominantRoleScore: weakRole.score,
  dominantRoleEvidenceCount: weakRole.evidenceCount,
})
assert(
  weakRole.role === null && weakPosture.posture !== 'deferential',
  'One weak role signal created an enduring role posture.',
)

transcriptBuffer.add({
  id: 'role-2',
  text: 'Compliance requires this review.',
  speaker: 'other_party',
  role: 'authority',
  roleConfidence: 0.9,
  createdAt: 2,
})
const supportedRole = transcriptBuffer.getDominantRole()
const supportedPosture = georgePostureEngine.decide({
  dominantRole: supportedRole.role,
  dominantRoleScore: supportedRole.score,
  dominantRoleEvidenceCount: supportedRole.evidenceCount,
})
assert(
  supportedRole.sufficientlySupported &&
    supportedPosture.posture === 'deferential' &&
    supportedPosture.cuePrefix.includes('Keep your position'),
  'Sufficient role evidence did not affect bounded etiquette.',
)
transcriptBuffer.clear()

console.log(JSON.stringify({
  wordingPreservesMeaning: true,
  factUpdatesRecordOnly: true,
  isolatedTersePreference: oneTerse.profile.conciseDeliveryPreference,
  repeatedConcisePreference: repeatedConcise.profile.conciseDeliveryPreference,
  contradictedConcisePreference: contradictedConcise.profile.conciseDeliveryPreference,
  softerLineScope: softerLine.acceptedScope,
  calmerRoomScope: calmerRoom.acceptedScope,
  roomDurable: calmerRoom.durablePersistenceAuthorized,
  ambiguousMaterialClarification: ambiguousMaterialChange.clarificationQuestion,
  liveExecutionScope: liveCommunicationExecution.communicationRealization?.scope,
  speakingStyleRealized: 'executive',
  receiverAuthority: 'shaping_only',
  weakRoleAccepted: weakRole.role !== null,
  supportedRolePosture: supportedPosture.posture,
  scopeOwner: softerLine.authority,
  ordinaryTurnAdditionalProviderCall: false,
  speechCompositionOwner: qualifiedComposition.authority,
  speechCompositionScope: qualifiedComposition.acceptedScope,
  isolatedCompositionAccepted: isolatedComposition.accepted,
  editedCompositionScope: editedComposition.acceptedScope,
  protectedMeaningClarification: unsafeComposition.clarificationQuestion,
  durableCompositionPersisted: durableComposition.durablePersistenceAuthorized,
  result: 'PASS',
}, null, 2))
`,
)

try {
  execFileSync('npx', ['tsx', file], {
    cwd: root,
    stdio: 'inherit',
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}

console.log('GEORGE LH-3A3e governed communication qualification: PASS')
