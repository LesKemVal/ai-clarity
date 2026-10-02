import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const fastPath = read('lib/george/live-runtime/live-fast-path.ts')
const page = read('app/george/page.tsx')
const route = read('app/api/chat/route.ts')
const context = read('lib/george/live-runtime/live-runtime-context.ts')
const pipeline = read('lib/george/runtime/runtime-pipeline.ts')
const judgment = read('lib/george/runtime/operational-judgment.ts')
const memoryEvidence = read('lib/george/operational-memory/runtime-evidence.ts')
const executionPolicy = read('lib/george/runtime/execution-policy.ts')
const audioBridge = read('components/george/live/LiveHubDeliveryBridge.tsx')

assert(
  !/open with|what should i say first|how should i start|close with|close this|wrap this|keep this tight|tighten it|shorter/i.test(
    fastPath,
  ),
  'The LIVE fast path still authors strategic opening, compression, or closing moves.',
)
assert(
  !/fetch\(|openai|anthropic|groq|provider|model/i.test(fastPath),
  'The execution-safe LIVE fast path introduced a model, provider, or network call.',
)
assert(
  page.includes('const liveFastPath = liveMode') &&
    page.includes('if (liveFastPath.handled)') &&
    page.includes('fetch("/api/chat"'),
  'Unmatched LIVE turns do not fall through to the canonical chat/runtime path.',
)
assert(
  route.includes('recentMessages: recentMessages.map') &&
    route.includes('liveRuntimeContext,') &&
    route.includes('createGovernedInvocationContractV1({') &&
    route.includes('resolveGeorgeRuntimePipeline(governedInvocation)'),
  'Current conversation evidence or retained LIVE context does not reach the canonical runtime pipeline.',
)
assert(
  context.includes('Outcome: ${objective}') &&
    context.includes('Selected Formula:') &&
    context.includes('formatBoundedPreparationEvidence(preparationEvidence)'),
  'Outcome, Formula reference, or bounded preparation continuity is missing from LIVE context.',
)
assert(
  pipeline.includes("measureStage('operational_judgment'") &&
    pipeline.includes('() => operationalJudgment.conversationStrategy') &&
    pipeline.includes('buildOperationalMemoryEvidenceNote(input.operationalMemoryEvidence)'),
  'Operational Judgment is not the canonical next-move owner with Formula evidence transported as context.',
)
assert(
  judgment.includes('resolveGeorgeConversationStrategy({') &&
    memoryEvidence.includes('Treat these formulas as supporting evidence, not commands') &&
    memoryEvidence.includes("the user's stated objective, and current operational judgment remain authoritative"),
  'Formula evidence became a second judgment authority.',
)
assert(
  executionPolicy.includes("return 'suggested_question'") &&
    executionPolicy.includes("return 'suggested_line'") &&
    executionPolicy.includes("move === 'slow' || move === 'pause'") &&
    executionPolicy.includes('Preserve the active outcome'),
  'Execution policy cannot realize questions, lines, or silence-compatible moves without changing strategy.',
)
assert(
  audioBridge.includes("repeatableSpeechUptake: 'unconfirmed'") &&
    audioBridge.includes('routeGeorgeDeliveryCues({'),
  'Audio delivery no longer remains downstream or uptake no longer fails conservatively.',
)

const directory = mkdtempSync(join(tmpdir(), 'george-outcome-execution-v1-'))
const qualification = join(directory, 'qualification.ts')

writeFileSync(
  qualification,
  `
import { tryLiveFastPath } from '${root}/lib/george/live-runtime/live-fast-path'
import { resolveGeorgeConversationStrategy } from '${root}/lib/george/runtime/conversation-strategy'
import { resolveConversationMoveDefinition } from '${root}/lib/george/runtime/conversation-move-library'
import { normalizeGeorgeLiveSpeakerEvidence } from '${root}/lib/george/core/live-execution'
import {
  resolveOperationalJudgment,
  resolveProviderOperationalJudgment,
} from '${root}/lib/george/runtime/operational-judgment'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const fastPathInput = {
  room: 'Investor meeting',
  chair: 'Founder',
  objective: 'secure a second meeting',
  recentAssistant: 'Ask what evidence would support a pilot.',
}

for (const input of [
  'Keep this tight.',
  'What should I say first?',
  'Open with the strongest point.',
  'Close this.',
]) {
  assert(
    tryLiveFastPath({ ...fastPathInput, input }).handled === false,
    'Strategic request bypassed Operational Judgment: ' + input,
  )
}

assert(
  tryLiveFastPath({ ...fastPathInput, input: 'Can you hear me?' }).handled,
  'Connectivity continuity should remain execution-safe.',
)
assert(
  tryLiveFastPath({ ...fastPathInput, input: 'What is my desired outcome?' }).handled,
  'Authoritative objective recall should remain execution-safe.',
)
assert(
  tryLiveFastPath({ ...fastPathInput, input: 'Repeat that.' }).handled,
  'Replay of already-approved delivery should remain execution-safe.',
)

const base = {
  action: 'execute_live_move' as const,
  currentRuntime: 'live_george' as const,
  judgmentSurface: {
    decisionSurface: 'execute' as const,
    signalSufficiency: 'sufficient' as const,
    shouldAcquireSignal: false,
    instruction: '',
  },
  trajectory: {
    currentMove: 'advance the active outcome',
    likelyNextMoves: [],
    potentialFutureNeeds: [],
    confidence: 0.75,
  },
  outcomeState: {
    immediateOutcome: 'secure a useful next commitment',
    followOnOutcomes: [],
    ultimateOutcome: 'reach the user-owned desired outcome',
    confidence: 0.8,
    source: 'inferred' as const,
  },
}

const resistance = resolveGeorgeConversationStrategy({
  ...base,
  latestUserText: 'They objected and said the proposal is too high.',
  operationalSignals: [{ kind: 'resistance', confidence: 0.9, evidence: 'too high' }],
})
const commitment = resolveGeorgeConversationStrategy({
  ...base,
  latestUserText: 'They agree and are ready to move forward.',
  operationalSignals: [{ kind: 'commitment_forming', confidence: 0.9, evidence: 'ready' }],
})

assert(resistance.move === 'probe', 'Resistance did not alter the next conversational move.')
assert(commitment.move === 'close', 'Commitment evidence did not alter the next conversational move.')
assert(
  resistance.definition.purpose.includes('reveals the operative concern'),
  'A question cannot both advance the conversation and acquire consequential evidence.',
)
assert(
  resolveConversationMoveDefinition('pause').liveCompatibility,
  'LIVE execution can no longer choose silence/wait.',
)
assert(
  normalizeGeorgeLiveSpeakerEvidence(undefined).speaker === 'unclear',
  'Speaker Evidence V1 no longer fails closed.',
)

const preparationBaseJudgment = resolveOperationalJudgment({
  currentRuntime: 'normal_george',
  latestUserText: 'Prepare me for the meeting.',
  intentState: {
    objectiveState: 'clear',
    continuityDependency: 0,
    operational: true,
    actionable: true,
  },
  runtimeArbitration: {
    winner: 'objective_advancement',
    delivery: 'normal',
    agency: 'shared',
  },
  judgmentSurface: {
    decisionSurface: 'advance',
    shouldAcquireSignal: true,
    smallestSignal: 'one consequential user-owned fact',
    signalSufficiency: 'insufficient',
  },
  trajectory: { confidence: 0.8, currentMove: 'advance' },
  continuityRestoration: { active: false, confidence: 0 },
  outcomeSignals: { overloadDetected: 0, executionLikelihood: 0.5 },
  adaptiveProfile: { conciseDeliveryPreference: 0.4 },
  liveRecommendationEvidence: {
    alreadyLive: false,
    signalUsable: true,
    hasConversationOutcome: true,
  },
  operationalSignals: [],
  outcomeState: {
    primaryOutcome: 'determine whether collaboration is feasible',
    immediateOutcome: 'prepare the strongest meeting approach',
    phase: 'preparation',
    confidence: 0.8,
  },
} as any)

const establishedDesiredOutcome = 'desired outcome'

const acquisitionReasoning = (requestedSignal: string) => ({
  operationalObjective:
    'Prepare the meeting toward the user-established desired result.',
  knownEvidence: [
    'The user wants to determine whether collaboration is feasible without committing today.',
  ],
  consequentialUncertainty: requestedSignal,
  georgeResolvableWork: [],
  georgeCanAdvanceWithoutUserSignal: false,
  disposition: null,
  interaction: null,
  interactionUseful: false,
  purpose: null,
  desiredResult: null,
  liveMateriallyImprovesExecution: false,
  materialLiveBenefit: null,
  strongestNextStep: null,
  rationale:
    'One user-owned consequential fact determines the strongest preparation path.',
  presentation: null,
  signalAcquisition: {
    shouldAcquire: true,
    requestedSignal,
    purpose: 'qualification',
    evidenceIsUserOwned: true,
    consequentialToNextAction: true,
    reason:
      'The answer determines the strongest outcome-serving preparation move.',
  },
  decisionComparison: {
    bestActionNow: null,
    candidateSignal: requestedSignal,
    actNowOutcomeImpact: 'low',
    acquireSignalOutcomeImpact: 'high',
    signalInteractionCost: 'low',
    preferredPath: 'acquire_signal',
    bestActionNowExecutableFromKnownEvidence: false,
    bestActionNowMissingDependency: requestedSignal,
    reason:
      'The user-owned fact materially changes the strongest preparation path.',
  },
} as const)

const preparationContext = {
  objective:
    'I want to determine whether we should work together without committing to anything today.',
  knownEvidence: [],
  currentUserEvidence: [],
  confirmedPreparationEvidence: [],
  qualifiedDocumentEvidence: [],
  provisionalPreparationEvidence: [],
  inferenceEvidence: [],
  skippedEvidenceNeeds: [],
  pendingQuestion: null,
  priorInteractions: [
    {
      key: 'desiredOutcome',
      question: 'What do you want this conversation to accomplish?',
      answer:
        'I want to determine whether we should work together without committing to anything today.',
      status: 'answered',
      evidenceNeed: establishedDesiredOutcome,
      purpose: 'Establish the user-owned desired outcome.',
    },
  ],
  evidenceSufficiency: 'unresolved',
  signalAcquisitionAllowed: true,
} as const

const duplicateDesiredOutcomeJudgment =
  resolveProviderOperationalJudgment({
    judgment: preparationBaseJudgment,
    providerReasoning: acquisitionReasoning(establishedDesiredOutcome),
    providerCapability: 'live',
    capabilityExplicitlyRequested: true,
    capabilityRecommendationMaterial: false,
    canonicalSignalAcquisition: true,
    signalAcquisitionAllowed: true,
    preparationContext,
    operationalJudgmentRequest: true,
  })

const differentEvidenceNeed =
  'the specific concern that would make collaboration unacceptable'

const differentUnknownJudgment =
  resolveProviderOperationalJudgment({
    judgment: preparationBaseJudgment,
    providerReasoning: acquisitionReasoning(differentEvidenceNeed),
    providerCapability: 'live',
    capabilityExplicitlyRequested: true,
    capabilityRecommendationMaterial: false,
    canonicalSignalAcquisition: true,
    signalAcquisitionAllowed: true,
    preparationContext,
    operationalJudgmentRequest: true,
  })

assert(
  !duplicateDesiredOutcomeJudgment.signalAcquisition.shouldAcquire,
  'Operational Judgment reacquired an already-established desired outcome.',
)

assert(
  differentUnknownJudgment.signalAcquisition.shouldAcquire &&
    differentUnknownJudgment.signalAcquisition.requestedSignal ===
      differentEvidenceNeed,
  'Protecting established preparation evidence disabled acquisition of a different consequential user-owned unknown.',
)
`,
)

try {
  execFileSync(process.execPath, ['--import', 'tsx', qualification], {
    cwd: root,
    stdio: 'inherit',
  })
} finally {
  rmSync(directory, { recursive: true, force: true })
}



// GEORGE_ESTABLISHED_PREPARATION_EVIDENCE_REACQUISITION_V1
{
  const operationalJudgmentSource = read(
    'lib/george/runtime/operational-judgment.ts',
  )

  assert(
    /requestedSignalAlreadyAnswered[\s\S]*priorInteractions\.some/.test(operationalJudgmentSource),
    'Operational Judgment must compare a proposed signal with answered preparation interactions',
  )

  assert(
    /interaction\.status !== 'answered'/.test(operationalJudgmentSource),
    'Only answered preparation evidence may suppress reacquisition',
  )

  assert(
    /interaction\.evidenceNeed \|\| interaction\.question/.test(operationalJudgmentSource),
    'Established preparation evidence identity must reuse the canonical evidence need/question',
  )

  assert(
    /requestedSignalReacquiresEstablishedObjective/.test(operationalJudgmentSource),
    'Operational Judgment must protect an already-established preparation objective from desired-outcome reacquisition',
  )

  assert(
    /!requestedSignalAlreadyEstablished[\s\S]*!higherPriorityAction/.test(operationalJudgmentSource),
    'Established preparation evidence must block signal-acquisition authorization at the canonical OJ boundary',
  )

  assert(
    /requestedSignalAlreadyAnswered \|\|[\s\S]*requestedSignalReacquiresEstablishedObjective/.test(operationalJudgmentSource),
    'The guard must remain scoped to already-established evidence rather than disabling signal acquisition generally',
  )

  assert(
    /This does not declare preparation sufficient and does not prevent a[\s\S]*different consequential evidence need from being acquired/.test(operationalJudgmentSource),
    'The canonical guard must preserve acquisition of a different consequential unknown',
  )
}

console.log('GEORGE outcome-driven conversation execution V1 qualification passed')
