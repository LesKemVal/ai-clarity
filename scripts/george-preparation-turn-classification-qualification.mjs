import { execFileSync } from 'node:child_process'
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const judgment = read('lib/george/runtime/operational-judgment.ts')
const provider = read('lib/george/runtime/provider/normal-provider.ts')
const pipeline = read('lib/george/runtime/runtime-pipeline.ts')
const chatRoute = read('app/api/chat/route.ts')
const signalRoute = read('app/api/george/live/signal-question/route.ts')
const homepage = read('components/home/HomeConversationTypeSurface.tsx')
const liveEntry = read('app/george/live-entry/LiveEntryClient.tsx')

if (!provider.includes('Do not use keyword matching.')) {
  throw new Error('Provider classification proposal is not semantic-first.')
}
if (!chatRoute.includes("'preparationTurnIntent'")) {
  throw new Error('Preparation-turn intent is not transported by /api/chat.')
}
if (
  !pipeline.includes(
    'providerResolvedJudgment.preparationTurnClassification',
  )
) {
  throw new Error('Runtime authority does not gate non-LIVE classifications.')
}
if (
  signalRoute.includes('PreparationTurnClassification') ||
  signalRoute.includes('preparationTurnIntent')
) {
  throw new Error('Signal-question became a preparation-turn classifier.')
}
if (homepage.includes('interactionMode: "ask_george"')) {
  throw new Error('The migrated homepage still bypasses canonical classification.')
}
if (!liveEntry.includes('interactionMode: "ask_george"')) {
  throw new Error('Traditional/LIVE Entry lost its active Ask GEORGE branch.')
}
if (
  !provider.includes(
    'a user question is not automatically a factual answer',
  )
) {
  throw new Error('User questions can be automatically promoted to evidence.')
}

const ownerMatches = [
  judgment,
  provider,
  pipeline,
  chatRoute,
  signalRoute,
].filter((source) =>
  source.includes('export function resolvePreparationTurnClassification'),
)
if (ownerMatches.length !== 1) {
  throw new Error('Duplicate preparation-turn classification owner detected.')
}

const dir = mkdtempSync(join(tmpdir(), 'george-preparation-classification-'))
const file = join(dir, 'qualification.ts')

writeFileSync(
  file,
  `
import {
  PREPARATION_TURN_CLARIFICATION,
  buildNormalLiveOperationalJudgmentResult,
  normalizePreparationTurnClassificationRequest,
  resolveOperationalJudgment,
  resolvePreparationTurnClassification,
  resolveProviderOperationalJudgment,
  type ProviderOperationalReasoning,
  type ProviderPreparationTurnClassificationProposal,
} from '${root}/lib/george/runtime/operational-judgment'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function proposal(
  classification: 'live_briefing' | 'preparation' | 'clarification_required',
  preservePendingQuestion = true,
): ProviderPreparationTurnClassificationProposal {
  return {
    classification,
    clarificationRequired: classification === 'clarification_required',
    mayAffectLivePreparation: classification === 'live_briefing',
    preservePendingQuestion:
      classification === 'live_briefing' ? preservePendingQuestion : true,
    reason: 'The complete turn semantics establish the intended use.',
    acknowledgment:
      classification === 'preparation'
        ? 'I will keep this in Preparation.'
        : null,
  }
}

function liveReasoning(): ProviderOperationalReasoning {
  return {
    operationalObjective: 'secure agreement in the anticipated conversation',
    knownEvidence: ['The user explicitly established the desired agreement.'],
    consequentialUncertainty: null,
    georgeResolvableWork: ['prepare the strongest agreement sequence'],
    georgeCanAdvanceWithoutUserSignal: true,
    disposition: 'execution_ready',
    interaction: 'the anticipated agreement conversation',
    interactionUseful: true,
    purpose: 'secure agreement',
    desiredResult: 'a clear agreement',
    liveMateriallyImprovesExecution: true,
    materialLiveBenefit: 'real-time response to resistance',
    strongestNextStep: 'prepare the agreement sequence',
    rationale: 'The interaction and desired result are established.',
    presentation: 'We can prepare this conversation for LIVE support.',
    decisionComparison: {
      bestActionNow: 'prepare the agreement sequence',
      candidateSignal: null,
      actNowOutcomeImpact: 'high',
      acquireSignalOutcomeImpact: 'low',
      signalInteractionCost: 'low',
      preferredPath: 'act_now',
      bestActionNowExecutableFromKnownEvidence: true,
      bestActionNowMissingDependency: null,
      reason: 'Current evidence supports preparation now.',
    },
    signalAcquisition: {
      shouldAcquire: false,
      requestedSignal: null,
      purpose: null,
      evidenceIsUserOwned: false,
      consequentialToNextAction: false,
      reason: null,
    },
  }
}

const base = resolveOperationalJudgment({
  currentRuntime: 'normal_george',
  latestUserText: 'Use the current evidence.',
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
    shouldAcquireSignal: false,
    signalSufficiency: 'sufficient',
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
    primaryOutcome: 'preserved prior outcome',
    immediateOutcome: 'preserved prior move',
    phase: 'preparation',
    confidence: 0.8,
  },
} as any)

const establishedBase = Object.freeze({
  ...base,
  preparationReadiness: Object.freeze({
    level: 'supportable' as const,
    minimumLiveSupportEstablished: true,
    furtherBriefingCouldSharpen: true,
    sharpeningSignal: 'the preserved pending evidence need',
    reason: 'Previously accepted readiness.',
    source: 'operational_judgment' as const,
  }),
})

const explicitLiveRequest = normalizePreparationTurnClassificationRequest({
  currentClassification: 'preparation',
  explicitSelection: 'live_briefing',
})
const explicitLive = resolvePreparationTurnClassification({
  request: explicitLiveRequest,
  providerProposal: null,
})
assert(
  explicitLive.classification === 'live_briefing' &&
    explicitLive.classificationSource === 'explicit' &&
    explicitLive.mayAffectLivePreparation,
  'Explicit LIVE-briefing selection was not accepted.',
)

const explicitPreparationRequest =
  normalizePreparationTurnClassificationRequest({
    currentClassification: 'live_briefing',
    explicitSelection: 'preparation',
  })
const explicitPreparation = resolvePreparationTurnClassification({
  request: explicitPreparationRequest,
  providerProposal: proposal('live_briefing'),
})
assert(
  explicitPreparation.classification === 'preparation' &&
    explicitPreparation.classificationSource === 'explicit' &&
    !explicitPreparation.mayAffectLivePreparation &&
    explicitPreparation.preservePendingQuestion,
  'Explicit Preparation selection was reversed by the provider proposal.',
)

const malformedExplicitRequest =
  normalizePreparationTurnClassificationRequest({
    currentClassification: 'live_briefing',
    explicitSelection: 'ask_george',
  })
const malformedExplicit = resolvePreparationTurnClassification({
  request: malformedExplicitRequest,
  providerProposal: proposal('live_briefing'),
})
assert(
  malformedExplicit.classification === 'clarification_required' &&
    malformedExplicit.classificationSource === 'explicit' &&
    !malformedExplicit.mayAffectLivePreparation,
  'Malformed explicit intent did not fail closed.',
)

const excludedPreparation = resolveProviderOperationalJudgment({
  judgment: establishedBase,
  providerReasoning: liveReasoning(),
  providerPreparationTurnClassification: proposal('preparation'),
  preparationTurnClassificationRequest: explicitPreparationRequest,
  providerCapability: 'live',
  capabilityExplicitlyRequested: true,
  capabilityRecommendationMaterial: true,
  canonicalSignalAcquisition: true,
  operationalJudgmentRequest: true,
})
assert(
  excludedPreparation.outcomeState === establishedBase.outcomeState &&
    excludedPreparation.preparationReadiness ===
      establishedBase.preparationReadiness &&
    !excludedPreparation.signalAcquisition.shouldAcquire,
  'Preparation changed accepted outcome/readiness or authorized signal acquisition.',
)

const inferredRequest = normalizePreparationTurnClassificationRequest({
  currentClassification: 'live_briefing',
  explicitSelection: null,
})
assert(
  !inferredRequest.explicitSelectionProvided &&
    !inferredRequest.malformed,
  'An explicit null inference marker was treated as an explicit or malformed selection.',
)
const missingProposal = resolvePreparationTurnClassification({
  request: inferredRequest,
  providerProposal: null,
})
assert(
  missingProposal.classification === 'clarification_required' &&
    !missingProposal.providerProposalAccepted &&
    !missingProposal.mayAffectLivePreparation &&
    missingProposal.preservePendingQuestion,
  'Missing inferred proposal did not fail closed.',
)
const ambiguous = resolveProviderOperationalJudgment({
  judgment: establishedBase,
  providerReasoning: liveReasoning(),
  providerPreparationTurnClassification: proposal(
    'clarification_required',
  ),
  preparationTurnClassificationRequest: inferredRequest,
  providerCapability: 'live',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: true,
  canonicalSignalAcquisition: true,
  operationalJudgmentRequest: true,
})
assert(
  ambiguous.preparationTurnClassification?.classification ===
    'clarification_required' &&
    ambiguous.preparationTurnClassification.preservePendingQuestion &&
    ambiguous.preparationTurnClassification.acknowledgment === null &&
    ambiguous.preparationReadiness === establishedBase.preparationReadiness &&
    ambiguous.outcomeState === establishedBase.outcomeState &&
    !ambiguous.signalAcquisition.shouldAcquire,
  'Clarification did not preserve the pending state and prior assessments.',
)
assert(
  buildNormalLiveOperationalJudgmentResult({
    operationalJudgment: ambiguous,
  }).message === PREPARATION_TURN_CLARIFICATION,
  'Clarification did not return the canonical immediate question.',
)

const inferredLive = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: liveReasoning(),
  providerPreparationTurnClassification: proposal('live_briefing', false),
  preparationTurnClassificationRequest: inferredRequest,
  providerCapability: 'live',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: true,
  canonicalSignalAcquisition: true,
  operationalJudgmentRequest: true,
})
assert(
  inferredLive.preparationTurnClassification?.classification ===
    'live_briefing' &&
    inferredLive.operationalDisposition.providerProposalAccepted &&
    inferredLive.preparationReadiness.minimumLiveSupportEstablished &&
    (inferredLive.preparationReadiness.level === 'supportable' ||
      inferredLive.preparationReadiness.level === 'sharp'),
  'Inferred LIVE briefing did not proceed through canonical assessment.',
)

const inferredPreparation = resolvePreparationTurnClassification({
  request: inferredRequest,
  providerProposal: proposal('preparation'),
})
assert(
  inferredPreparation.classification === 'preparation' &&
    inferredPreparation.inferredModeTransition === 'switched' &&
    inferredPreparation.acknowledgment ===
      'I’ll keep this in Preparation.' &&
    !inferredPreparation.mayAffectLivePreparation &&
    inferredPreparation.preservePendingQuestion,
  'Inferred Preparation was not conversationally separated from briefing.',
)

const retainedLive = resolvePreparationTurnClassification({
  request: inferredRequest,
  providerProposal: proposal('live_briefing', true),
})
assert(
  retainedLive.inferredModeTransition === 'retained' &&
    retainedLive.acknowledgment === null,
  'Retained inferred mode produced switch acknowledgment metadata.',
)

const malformed = resolvePreparationTurnClassification({
  request: inferredRequest,
  providerProposal: {
    ...proposal('preparation'),
    mayAffectLivePreparation: true,
  },
})
assert(
  malformed.classification === 'clarification_required' &&
    !malformed.providerProposalAccepted &&
    !malformed.mayAffectLivePreparation,
  'Contradictory provider proposal did not fail closed.',
)

console.log(JSON.stringify({
  explicitLive: explicitLive.classification,
  explicitPreparation: explicitPreparation.classification,
  malformedExplicit: malformedExplicit.classification,
  ambiguous: ambiguous.preparationTurnClassification?.classification,
  missingProposal: missingProposal.classification,
  inferredLiveReadiness: inferredLive.preparationReadiness.level,
  inferredPreparation: inferredPreparation.inferredModeTransition,
  pendingQuestionPreserved:
    ambiguous.preparationTurnClassification?.preservePendingQuestion,
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

console.log('GEORGE canonical preparation-turn classification qualification: PASS')
