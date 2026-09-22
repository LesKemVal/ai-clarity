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

const authorizationOwners = [
  judgment,
  provider,
  pipeline,
  chatRoute,
  signalRoute,
].filter((source) =>
  source.includes('function resolvePreparationTurnRealizationAuthorization('),
)

if (authorizationOwners.length !== 1) {
  throw new Error(
    'Operational Judgment is not the sole preparation-turn realization authorization owner.',
  )
}

const classificationAcceptance = chatRoute.indexOf(
  'const runtimeAuthoritySnapshot =',
)
const preparationExecution = chatRoute.indexOf(
  'const preparationTurnRealization =',
)
if (
  classificationAcceptance < 0 ||
  preparationExecution <= classificationAcceptance ||
  !chatRoute.includes(
    "preparationTurnRealization?.action === 'respond_to_preparation'",
  ) ||
  !chatRoute.includes('runNormalExecutionCompletion({')
) {
  throw new Error(
    'Preparation conversational execution is not strictly post-classification.',
  )
}

if (
  !chatRoute.includes('latestUserText: latestUserRaw') ||
  !pipeline.includes(
    'resolveProviderConversationMessages(\n        input.latestUserText,',
  ) ||
  !provider.includes(
    "Respond directly and helpfully to the user's current Preparation submission",
  )
) {
  throw new Error(
    'Authorized Preparation realization is not grounded in the current user turn.',
  )
}

if (
  !chatRoute.includes(
    'operationalJudgmentResult?.message || \'\'',
  ) ||
  chatRoute.includes('preparationTurnResponse:') ||
  chatRoute.includes('preparationResponse:')
) {
  throw new Error(
    'Preparation response is not transported through the existing Operational Judgment result.',
  )
}

if (
  signalRoute.includes('PreparationTurnClassification') ||
  signalRoute.includes('preparationTurnIntent') ||
  signalRoute.includes('preparationTurnRealizationAuthorization')
) {
  throw new Error(
    'Signal-question acquired preparation classification or conversational-realization authority.',
  )
}

const dir = mkdtempSync(join(tmpdir(), 'george-preparation-realization-'))
const file = join(dir, 'qualification.ts')

writeFileSync(
  file,
  `
import {
  PREPARATION_TURN_CLARIFICATION,
  buildNormalLiveOperationalJudgmentResult,
  normalizePreparationTurnClassificationRequest,
  resolveOperationalJudgment,
  resolveProviderOperationalJudgment,
  type ProviderOperationalReasoning,
  type ProviderPreparationTurnClassificationProposal,
} from '${root}/lib/george/runtime/operational-judgment'
import {
  buildNormalExecutionInstruction,
  parseNormalExecutionResult,
} from '${root}/lib/george/runtime/provider/normal-provider'

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
    acknowledgment: null,
  }
}

function liveReasoning(): ProviderOperationalReasoning {
  return {
    operationalObjective: 'secure agreement in the anticipated conversation',
    knownEvidence: ['The user established the desired agreement.'],
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
  latestUserText: 'Help me articulate the opening.',
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

const preparationRequest = normalizePreparationTurnClassificationRequest({
  currentClassification: 'live_briefing',
  explicitSelection: 'preparation',
})
const preparation = resolveProviderOperationalJudgment({
  judgment: establishedBase,
  providerReasoning: liveReasoning(),
  providerPreparationTurnClassification: proposal('preparation'),
  preparationTurnClassificationRequest: preparationRequest,
  providerCapability: 'live',
  capabilityExplicitlyRequested: true,
  capabilityRecommendationMaterial: true,
  canonicalSignalAcquisition: true,
  operationalJudgmentRequest: true,
})

assert(
  preparation.preparationTurnRealizationAuthorization?.action ===
    'respond_to_preparation' &&
    preparation.preparationTurnRealizationAuthorization
      .providerExecutionAuthorized &&
    !preparation.preparationTurnRealizationAuthorization
      .mayAffectLivePreparation,
  'Preparation did not authorize exactly one conversation-only realization.',
)
assert(
  preparation.outcomeState === establishedBase.outcomeState &&
    preparation.preparationReadiness === establishedBase.preparationReadiness &&
    !preparation.signalAcquisition.shouldAcquire &&
    preparation.preparationTurnClassification?.preservePendingQuestion &&
    preparation.preparationTurnRealizationAuthorization
      ?.preservePendingQuestion,
  'Preparation changed accepted operational state or consumed the pending question.',
)
assert(
  preparation.operationalDisposition !==
    establishedBase.operationalDisposition &&
    preparation.operationalDisposition.disposition === 'unresolved',
  'Preparation conversational realization reused the prior operational disposition.',
)

const instruction = buildNormalExecutionInstruction(preparation)
assert(
  instruction.includes('current Preparation submission') &&
    instruction.includes('current user turn') &&
    instruction.includes('Do not perform another classification') &&
    instruction.includes('Preserve the unresolved operational question'),
  'Provider realization is not constrained to the current Preparation turn.',
)

const realizedText =
  'We can make the opening clearer by leading with the decision you want and then giving the strongest supporting reason.'
const providerExecution = parseNormalExecutionResult(
  JSON.stringify({ text: realizedText }),
  preparation,
)
const preparationResult = buildNormalLiveOperationalJudgmentResult({
  operationalJudgment: preparation,
  executionText: providerExecution?.text,
  governedProviderExecution:
    providerExecution?.source === 'normal_provider_execution',
})
assert(
  preparationResult.message === realizedText,
  'The relevant Preparation response did not pass through the existing Operational Judgment result.',
)
assert(
  buildNormalLiveOperationalJudgmentResult({
    operationalJudgment: preparation,
    executionText: realizedText,
    governedProviderExecution: false,
  }).message === null,
  'Pre-acceptance or ungoverned provider text can be surfaced.',
)

const clarificationRequest =
  normalizePreparationTurnClassificationRequest({
    currentClassification: 'live_briefing',
  })
const clarification = resolveProviderOperationalJudgment({
  judgment: establishedBase,
  providerReasoning: liveReasoning(),
  providerPreparationTurnClassification: proposal(
    'clarification_required',
  ),
  preparationTurnClassificationRequest: clarificationRequest,
  providerCapability: 'live',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: true,
  canonicalSignalAcquisition: true,
  operationalJudgmentRequest: true,
})
assert(
  clarification.preparationTurnRealizationAuthorization?.action ===
    'direct_canonical_clarification' &&
    !clarification.preparationTurnRealizationAuthorization
      .providerExecutionAuthorized &&
    clarification.preparationTurnRealizationAuthorization
      .directCanonicalPresentationAuthorized,
  'Clarification did not remain direct canonical presentation.',
)
assert(
  buildNormalLiveOperationalJudgmentResult({
    operationalJudgment: clarification,
    executionText: 'This substantive provider response must not surface.',
    governedProviderExecution: true,
  }).message === PREPARATION_TURN_CLARIFICATION,
  'Clarification surfaced substantive provider execution.',
)

const liveRequest = normalizePreparationTurnClassificationRequest({
  currentClassification: 'live_briefing',
})
const live = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: liveReasoning(),
  providerPreparationTurnClassification: proposal('live_briefing', false),
  preparationTurnClassificationRequest: liveRequest,
  providerCapability: 'live',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: true,
  canonicalSignalAcquisition: true,
  operationalJudgmentRequest: true,
})
assert(
  live.preparationTurnRealizationAuthorization?.action ===
    'assess_live_briefing' &&
    live.preparationTurnRealizationAuthorization.assessLiveBriefing &&
    !live.preparationTurnRealizationAuthorization
      .providerExecutionAuthorized &&
    live.operationalDisposition.providerProposalAccepted &&
    live.preparationReadiness.minimumLiveSupportEstablished,
  'LIVE-briefing turn did not continue through canonical assessment.',
)

console.log(JSON.stringify({
  preparationAuthorization:
    preparation.preparationTurnRealizationAuthorization?.action,
  preparationResponse: preparationResult.message,
  preparationReadinessPreserved:
    preparation.preparationReadiness === establishedBase.preparationReadiness,
  pendingQuestionPreserved:
    preparation.preparationTurnClassification?.preservePendingQuestion,
  clarificationAuthorization:
    clarification.preparationTurnRealizationAuthorization?.action,
  clarificationMessage: PREPARATION_TURN_CLARIFICATION,
  liveAuthorization: live.preparationTurnRealizationAuthorization?.action,
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

console.log(
  'GEORGE post-classification Preparation realization qualification: PASS',
)
