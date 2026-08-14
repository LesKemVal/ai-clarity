import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const signalRoute = read('app/api/george/live/signal-question/route.ts')
const authorizedSignalQuestionOwner = read(
  'lib/george/live-runtime/authorized-signal-question.ts',
)
const page = read('app/george/page.tsx')
const preparationOwner = read(
  'lib/george/live-runtime/live-preparation-controller.ts',
)
const entryResolution = read('lib/george/live-entry/entry-resolution.ts')
const homepageEntry = read('components/home/HomeConversationTypeSurface.tsx')
const section = (start, end) => {
  const startIndex = page.indexOf(start)
  const endIndex = page.indexOf(end, startIndex + start.length)
  return startIndex >= 0 && endIndex > startIndex
    ? page.slice(startIndex, endIndex)
    : ''
}

const normalLiveControl = page.match(
  /const handleNormalLiveControl = \(\) => \{([\s\S]*?)\n  \};/,
)?.[1] || ''
const normalAdaptiveRequest = section(
  'const requestNormalAdaptiveQuestion = async',
  'const startLiveSignalAcquisition =',
)
const normalAnswerSubmission = section(
  'const submitPreLiveSignalAnswer =',
  'const normalPreparationActions:',
)
const normalResume = section(
  'const resumeNormalPreparationBriefing =',
  'const handleNormalLiveControl =',
)
const normalJudgmentRequest = section(
  'normalOperationalJudgmentRequestRef.current = async',
  'const handleLiveFinalTranscript =',
)

assert(
  normalLiveControl.includes('startLiveSignalAcquisition();') &&
    !normalLiveControl.includes('orientNormalLive'),
  'first Normal LIVE click does not enter adaptive preparation immediately',
)
assert(
  !page.includes('UNIVERSAL_NORMAL_LIVE_ORIENTATION') &&
    !page.includes('buildNormalLiveOrientationMessage') &&
    !page.includes('orientNormalLive') &&
    !page.includes('normalLiveOrientationActive') &&
    !page.includes('normalLiveOrientationSessionId') &&
    !page.includes('Tap LIVE again and we’ll establish') &&
    !page.includes('Tap LIVE again and we’ll determine'),
  'obsolete first-click orientation can still append presentation-owned reasoning',
)
assert(
  page.includes('onPrepare={() => {\n                                              handleNormalLiveControl();') &&
    page.includes('onStart={openLiveEntry}') &&
    !page.includes('? "orientation"'),
  'Normal LIVE control still contains two-click orientation choreography',
)
assert(
  homepageEntry.includes('/george/live-entry?source=start') &&
    entryResolution.includes("input.source === 'start'") &&
    entryResolution.includes("input.source === 'orientation'") &&
    entryResolution.includes("route === 'homepage'") &&
    entryResolution.includes("FRESH_DIRECT_SOURCES.has(input.source)"),
  'Traditional, Homepage, Orientation, or Quick LIVE canonical entry remains coupled to the removed Normal orientation',
)

assert(
  signalRoute.includes('resolveAdaptivePreparationTransition') &&
    preparationOwner.includes(
      'export function resolveAdaptivePreparationTransition',
    ),
  'adaptive transition is not owned by the canonical preparation controller',
)
assert(
  normalAdaptiveRequest.indexOf(
    'normalOperationalJudgmentRequestRef.current',
  ) >= 0 &&
    normalAdaptiveRequest.indexOf(
      'normalOperationalJudgmentRequestRef.current',
    ) < normalAdaptiveRequest.indexOf(
      'fetch("/api/george/live/signal-question"',
    ),
  'Normal preparation can reach signal-question before canonical Operational Judgment',
)
assert(
  normalAdaptiveRequest.includes('signalAcquisitionAuthorized') &&
    normalAdaptiveRequest.includes('authorizedEvidenceNeed') &&
    normalAdaptiveRequest.includes('authorizationReason') &&
    signalRoute.includes('if (authorizedEvidenceNeed)') &&
    signalRoute.includes('formulateAuthorizedSignalQuestion') &&
    authorizedSignalQuestionOwner.includes(
      'export async function formulateAuthorizedSignalQuestion',
    ) &&
    authorizedSignalQuestionOwner.includes(
      'acquires exactly the authorized evidence need',
    ) &&
    authorizedSignalQuestionOwner.includes(
      'You may not replace the question',
    ) &&
    preparationOwner.includes('authorizedEvidenceNeed?: string | null'),
  'canonical signal authorization is not enforced through shared question formulation ownership',
)
assert(
  !signalRoute.includes("interactionKeys.has('outcomesuccess')") &&
    !signalRoute.includes("interactionKeys.has('desiredoutcome')") &&
    !signalRoute.includes("interactionKeys.has('intent')"),
  'signal-question still contains the fixed fallback questionnaire',
)
assert(
  page.includes('normalPreparationContext: {') &&
    signalRoute.includes(
      'normalPreparationProjection?.pendingQuestion',
    ) &&
    page.includes('payload?.nextAction !== "ask_question"') &&
    page.includes('submitPreLiveSignalAnswer("Skip", "skipped")'),
  'Normal preparation does not revalidate pending questions or still gives skip progression authority',
)
assert(
  normalAnswerSubmission.includes(
    'void requestNormalAdaptiveQuestion(nextPreparationSession)',
  ) &&
    normalResume.includes(
      'void requestNormalAdaptiveQuestion(preparationSession)',
    ) &&
    page.includes('submitPreLiveSignalAnswer("Skip", "skipped")'),
  'answer, skip, or resume can bypass the shared judgment-first reassessment path',
)
assert(
  normalJudgmentRequest.includes(
    'Apply the Normal LIVE Operational Judgment request',
  ) &&
    normalJudgmentRequest.includes(
      'requestPurpose: NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST',
    ),
  'a first Normal LIVE click without prior conversation evidence cannot reach Operational Judgment',
)
assert(
  normalAdaptiveRequest.indexOf('signalAcquisitionAuthorized') <
      normalAdaptiveRequest.indexOf(
        'fetch("/api/george/live/signal-question"',
      ) &&
    normalAdaptiveRequest.includes(
      'if (!signalAcquisitionAuthorized)',
    ),
  'a Normal question can be formulated without fresh canonical authorization',
)

const dir = mkdtempSync(join(tmpdir(), 'george-adaptive-sequencing-'))
const file = join(dir, 'qualification.ts')

writeFileSync(file, `
import {
  normalizePreparationInteractions,
  resolveAdaptivePreparationTransition,
} from '${root}/lib/george/live-runtime/live-preparation-controller'
import { resolveSelectedOperationalFormula } from '${root}/lib/george/operational-memory/formula-library'
import { buildOperationalMemoryEvidenceNote, createOperationalMemoryRuntimeEvidence } from '${root}/lib/george/operational-memory/runtime-evidence'
import { resolveOperationalJudgment, resolveProviderOperationalJudgment, type ProviderOperationalReasoning } from '${root}/lib/george/runtime/operational-judgment'
import { resolveLiveEntry } from '${root}/lib/george/live-entry/entry-resolution'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function reasoning(
  input: Partial<ProviderOperationalReasoning>,
): ProviderOperationalReasoning {
  const merged = {
    operationalObjective: null,
    knownEvidence: [],
    consequentialUncertainty: null,
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
    rationale: null,
    presentation: null,
    signalAcquisition: {
      shouldAcquire: false,
      requestedSignal: null,
      evidenceIsUserOwned: false,
      consequentialToNextAction: false,
      reason: null,
    },
    ...input,
  } satisfies ProviderOperationalReasoning

  const acquisitionRequested =
    merged.signalAcquisition?.shouldAcquire === true

  return {
    ...merged,
    decisionComparison:
      input.decisionComparison ||
      (
        acquisitionRequested
          ? {
              bestActionNow: null,
              candidateSignal:
                merged.signalAcquisition?.requestedSignal ||
                merged.consequentialUncertainty,
              actNowOutcomeImpact: 'low',
              acquireSignalOutcomeImpact: 'high',
              signalInteractionCost: 'low',
              preferredPath: 'acquire_signal',
              bestActionNowExecutableFromKnownEvidence: false,
              bestActionNowMissingDependency:
                merged.signalAcquisition?.requestedSignal ||
                merged.consequentialUncertainty,
              reason:
                'The consequential signal materially improves the strongest next action.',
            }
          : {
              bestActionNow: merged.strongestNextStep,
              candidateSignal: null,
              actNowOutcomeImpact: merged.strongestNextStep
                ? 'high'
                : 'none',
              acquireSignalOutcomeImpact: 'none',
              signalInteractionCost: 'none',
              preferredPath: 'act_now',
              bestActionNowExecutableFromKnownEvidence: Boolean(
                merged.strongestNextStep
              ),
              bestActionNowMissingDependency: null,
              reason:
                'Current evidence supports the strongest objective-advancing action now.',
            }
      ),
  }
}

async function qualify() {

const sufficient = resolveAdaptivePreparationTransition({
  assessment: { status: 'sufficient' },
  priorInteractions: [],
})
assert(
  sufficient.nextAction === 'invoke_operational_judgment',
  'zero-question preparation did not terminate acquisition',
)

const routeInput = {
  homepageHandoff: null,
  storedPreparationSignals: {},
  preparationPreviewReady: false,
  devPreview: false,
  startNewLive: false,
  hasLiveSetup: false,
  hasActiveLiveSetup: false,
}
const traditionalEntry = resolveLiveEntry({ ...routeInput, source: 'start' })
const homepageRouteEntry = resolveLiveEntry({
  ...routeInput,
  source: 'homepage',
  homepageHandoff: { signals: { desiredOutcome: 'Reach the defined outcome' } },
})
const orientationEntry = resolveLiveEntry({ ...routeInput, source: 'orientation' })
const quickLiveEntry = resolveLiveEntry({ ...routeInput, source: 'signal' })
assert(
  traditionalEntry.route === 'direct' &&
    traditionalEntry.firstStep === 'questions' &&
    homepageRouteEntry.route === 'homepage' &&
    homepageRouteEntry.firstStep === 'prep' &&
    orientationEntry.route === 'direct' &&
    orientationEntry.firstStep === 'orientation' &&
    quickLiveEntry.route === 'normal' &&
    quickLiveEntry.firstStep === 'mechanics' &&
    quickLiveEntry.isFreshLiveStart,
  'an existing non-Normal LIVE entry contract changed',
)

const firstQuestion = resolveAdaptivePreparationTransition({
  assessment: {
    status: 'question',
    key: 'decision_constraint',
    label: 'Decision constraint',
    question: 'Which constraint can only you establish?',
    why: 'It materially changes the next move.',
    example: 'The deadline cannot move.',
    evidenceNeed: 'user owned governing constraint',
    eligibility: 'eligible',
  },
  priorInteractions: [],
  authorizedEvidenceNeed: 'user owned governing constraint',
})
assert(
  firstQuestion.nextAction === 'ask_question' &&
    firstQuestion.question.evidenceNeed === 'user owned governing constraint',
  'a material first gap did not produce one justified question',
)

const answeredHistory = normalizePreparationInteractions([
  {
    key: 'decision_constraint',
    question: 'Which constraint can only you establish?',
    answer: 'The deadline cannot move, and approval is already secured.',
    status: 'answered',
    evidenceNeed: 'user owned governing constraint',
  },
])

const oneQuestionEnough = resolveAdaptivePreparationTransition({
  assessment: { status: 'sufficient' },
  priorInteractions: answeredHistory,
})
assert(
  oneQuestionEnough.nextAction === 'invoke_operational_judgment',
  'one material answer could not terminate acquisition',
)

const updatedGap = resolveAdaptivePreparationTransition({
  assessment: {
    status: 'question',
    key: 'decision_authority',
    label: 'Decision authority',
    question: 'Who has final authority over the remaining commitment?',
    why: 'The previous answer made authority the consequential unknown.',
    example: 'The steering group has final authority.',
    evidenceNeed: 'user known final decision authority',
    eligibility: 'eligible',
  },
  priorInteractions: answeredHistory,
  authorizedEvidenceNeed: 'user known final decision authority',
})
assert(
  updatedGap.nextAction === 'ask_question' &&
    updatedGap.question.evidenceNeed === 'user known final decision authority',
  'updated evidence could not produce a newly material gap',
)

const resolvedMultipleGaps = resolveAdaptivePreparationTransition({
  assessment: { status: 'sufficient' },
  priorInteractions: answeredHistory,
})
assert(
  resolvedMultipleGaps.nextAction === 'invoke_operational_judgment',
  'an answer resolving multiple gaps still forced a follow-up',
)

const exactDuplicate = resolveAdaptivePreparationTransition({
  assessment: {
    status: 'question',
    key: 'constraint_reworded',
    question: 'What limitation governs the choice?',
    evidenceNeed: 'USER-owned governing constraint',
    eligibility: 'eligible',
  },
  priorInteractions: answeredHistory,
})
assert(
  exactDuplicate.nextAction === 'invoke_operational_judgment' &&
    exactDuplicate.reason === 'duplicate_evidence_request',
  'normalized evidence-need history did not stop a duplicate request',
)

const semanticDuplicate = resolveAdaptivePreparationTransition({
  assessment: {
    status: 'question',
    key: 'different_key_and_words',
    question: 'What factor cannot be changed?',
    evidenceNeed: 'immutable factor known by the participant',
    eligibility: 'duplicate',
  },
  priorInteractions: answeredHistory,
})
assert(
  semanticDuplicate.nextAction === 'invoke_operational_judgment' &&
    semanticDuplicate.reason === 'duplicate_evidence_request',
  'semantic eligibility could be bypassed by different wording and keys',
)

const consequentialClarification = resolveAdaptivePreparationTransition({
  assessment: {
    status: 'question',
    key: 'clarify_constraint',
    question: 'Does the stated deadline apply to the decision or delivery?',
    evidenceNeed: 'user owned governing constraint',
    eligibility: 'clarification',
  },
  priorInteractions: answeredHistory,
  authorizedEvidenceNeed: 'user owned governing constraint',
})
assert(
  consequentialClarification.nextAction === 'ask_question' &&
    consequentialClarification.reason === 'consequential_clarification',
  'a necessary clarification of incomplete evidence was incorrectly blocked',
)

const authorizedQuestion = resolveAdaptivePreparationTransition({
  assessment: {
    status: 'question',
    key: 'authorized_constraint',
    question: 'Which boundary can only you establish?',
    evidenceNeed: 'user owned governing boundary',
    eligibility: 'eligible',
  },
  priorInteractions: [],
  authorizedEvidenceNeed: 'user owned governing boundary',
})
const broadenedQuestion = resolveAdaptivePreparationTransition({
  assessment: {
    status: 'question',
    key: 'broader_context',
    question: 'Describe the broader situation and everyone involved.',
    evidenceNeed: 'role audience and broader context',
    eligibility: 'eligible',
  },
  priorInteractions: [],
  authorizedEvidenceNeed: 'user owned governing boundary',
})
assert(
  authorizedQuestion.nextAction === 'ask_question' &&
    broadenedQuestion.nextAction === 'invoke_operational_judgment' &&
    broadenedQuestion.reason === 'unauthorized_evidence_request',
  'question formulation could broaden canonical signal authorization',
)

const skippedHistory = normalizePreparationInteractions([
  {
    key: 'risk_boundary',
    question: 'Which boundary cannot be crossed?',
    answer: '',
    status: 'skipped',
    evidenceNeed: 'user owned risk boundary',
  },
])
const skipThenSufficient = resolveAdaptivePreparationTransition({
  assessment: { status: 'sufficient' },
  priorInteractions: skippedHistory,
})
const skipThenDifferentGap = resolveAdaptivePreparationTransition({
  assessment: {
    status: 'question',
    key: 'observable_commitment',
    question: 'What commitment has already been made?',
    evidenceNeed: 'user known existing commitment',
    eligibility: 'eligible',
  },
  priorInteractions: skippedHistory,
  authorizedEvidenceNeed: 'user known existing commitment',
})
const skipThenSameGap = resolveAdaptivePreparationTransition({
  assessment: {
    status: 'question',
    key: 'risk_boundary_again',
    question: 'What limit must remain protected?',
    evidenceNeed: 'user owned risk boundary',
    eligibility: 'eligible',
  },
  priorInteractions: skippedHistory,
  authorizedEvidenceNeed: 'user owned risk boundary',
})
const repeatedWithoutMatchingAuthorization =
  resolveAdaptivePreparationTransition({
    assessment: {
      status: 'question',
      key: 'observable_commitment_without_authorization',
      question: 'What commitment has already been made?',
      evidenceNeed: 'user known existing commitment',
      eligibility: 'eligible',
    },
    priorInteractions: skippedHistory,
    authorizedEvidenceNeed: 'a different previously authorized evidence need',
  })
assert(
  skipThenSufficient.nextAction === 'invoke_operational_judgment' &&
    skipThenDifferentGap.nextAction === 'ask_question' &&
    skipThenSameGap.nextAction === 'invoke_operational_judgment' &&
    repeatedWithoutMatchingAuthorization.nextAction ===
      'invoke_operational_judgment' &&
    repeatedWithoutMatchingAuthorization.reason ===
      'unauthorized_evidence_request',
  'skip implied a fixed next action instead of neutral reassessment',
)

const formula = {
  id: 'formula-neutral',
  version: 2,
  scope: 'general',
  visibility: 'public',
  roomTypes: [],
  objectiveTypes: [],
  prerequisites: ['constraint_known'],
  steps: [
    {
      signalType: 'constraint_known',
      actionType: 'test strongest move',
      expectedTransition: 'consequential next state',
    },
  ],
  failureConditions: [],
  confidence: 0.8,
  sampleCount: 4,
  successCount: 3,
  contradictionCount: 0,
  unknownCount: 1,
  reuseCount: 0,
  evidence: [],
  createdAt: 1,
  updatedAt: 2,
} as any
const formulaLibrary = {
  retrieve: async () => [],
  getById: async (id: string) => id === formula.id ? formula : null,
  save: async () => {},
  delete: async () => {},
  listByOwner: async () => [],
  listAccessible: async () => [],
}
const selectedFormula = await resolveSelectedOperationalFormula(formulaLibrary, {
  selection: { id: formula.id, version: formula.version },
  userId: 'participant@example.com',
})
const wrongFormulaVersion = await resolveSelectedOperationalFormula(formulaLibrary, {
  selection: { id: formula.id, version: formula.version + 1 },
  userId: 'participant@example.com',
})
const formulaNote = selectedFormula
  ? buildOperationalMemoryEvidenceNote(
      createOperationalMemoryRuntimeEvidence([selectedFormula]),
    )
  : ''
assert(
  selectedFormula !== null &&
    wrongFormulaVersion === null &&
    formulaNote.includes('test strongest move') &&
    !formulaNote.includes('Question 1'),
  'validated Formula did not inform reasoning as evidence or became a questionnaire',
)

const base = resolveOperationalJudgment({
  currentRuntime: 'normal_george',
  latestUserText: 'Use the evidence we have.',
  intentState: { objectiveState: 'clear', continuityDependency: 0, operational: true, actionable: true },
  runtimeArbitration: { winner: 'objective_advancement', delivery: 'normal', agency: 'shared' },
  judgmentSurface: { decisionSurface: 'advance', shouldAcquireSignal: true, smallestSignal: 'legacy preferred preparation field', signalSufficiency: 'insufficient' },
  trajectory: { confidence: 0.8, currentMove: 'advance' },
  continuityRestoration: { active: false, confidence: 0 },
  outcomeSignals: { overloadDetected: 0, executionLikelihood: 0.5 },
  adaptiveProfile: { conciseDeliveryPreference: 0.4 },
  liveRecommendationEvidence: { alreadyLive: false, signalUsable: true, hasConversationOutcome: true },
  operationalSignals: [],
  outcomeState: { primaryOutcome: 'advance the objective', immediateOutcome: 'choose the strongest action', phase: 'preparation', confidence: 0.8 },
} as any)
const continueNormal = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'advance the objective from current evidence',
    knownEvidence: ['Current evidence is sufficient for useful analysis.'],
    georgeResolvableWork: ['perform the analysis now'],
    georgeCanAdvanceWithoutUserSignal: true,
    disposition: 'continue_normal',
    interaction: null,
    purpose: 'complete the analysis',
    desiredResult: 'a defensible analysis',
    strongestNextStep: 'perform the analysis now',
    rationale: 'Normal reasoning is stronger than LIVE.',
    presentation: 'I can perform the analysis now without another interruption.',
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
})
const otherAction = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'establish the governing fact',
    knownEvidence: ['A governing record is available.'],
    georgeResolvableWork: ['inspect the available record'],
    georgeCanAdvanceWithoutUserSignal: true,
    disposition: 'other_action',
    interaction: null,
    purpose: 'verify the governing fact',
    desiredResult: 'the governing fact established',
    strongestNextStep: 'verify the available record',
    rationale: 'Verification is stronger than entering LIVE.',
    presentation: 'Verifying the available record is the stronger action.',
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
})
const executionOpportunity = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'obtain external validation',
    knownEvidence: ['The external decision-maker holds material evidence.'],
    georgeResolvableWork: ['structure and adapt the validation sequence'],
    georgeCanAdvanceWithoutUserSignal: true,
    disposition: 'execution_opportunity',
    interaction: 'a consequential validation conversation',
    interactionUseful: true,
    purpose: 'establish the external evidence needed to advance the objective',
    desiredResult: 'a concrete validation decision',
    liveMateriallyImprovesExecution: true,
    materialLiveBenefit:
      'real-time adaptation improves how the external evidence is tested',
    strongestNextStep: 'identify and prepare for the right source conversation',
    rationale: 'A specific interaction would materially advance the objective.',
    presentation:
      'I can structure the validation conversation and adapt the evidence test in real time.',
    signalAcquisition: {
      shouldAcquire: false,
      requestedSignal: null,
      evidenceIsUserOwned: false,
      consequentialToNextAction: false,
      reason: null,
    },
  }),
  providerCapability: 'live',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: true,
  canonicalSignalAcquisition: true,
})
const acquisitionAuthorized = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'choose the strongest operational path',
    knownEvidence: ['Current evidence supports materially different paths.'],
    consequentialUncertainty:
      'the governing boundary only the user can establish',
    georgeCanAdvanceWithoutUserSignal: false,
    disposition: null,
    interaction: null,
    purpose: null,
    strongestNextStep: null,
    rationale: 'One user-owned boundary changes which operational path is strongest.',
    signalAcquisition: {
      shouldAcquire: true,
      requestedSignal: 'the governing boundary only the user can establish',
      evidenceIsUserOwned: true,
      consequentialToNextAction: true,
      reason: 'Without this boundary, materially different operational paths remain viable.',
    },
    decisionComparison: {
      bestActionNow: null,
      candidateSignal: 'the governing boundary only the user can establish',
      actNowOutcomeImpact: 'low',
      acquireSignalOutcomeImpact: 'high',
      signalInteractionCost: 'low',
      preferredPath: 'acquire_signal',
      bestActionNowExecutableFromKnownEvidence: false,
      bestActionNowMissingDependency:
        'the governing boundary only the user can establish',
    },
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
})
assert(
  continueNormal.operationalDisposition.disposition === 'continue_normal' &&
    !continueNormal.signalAcquisition.shouldAcquire &&
    continueNormal.action !== 'acquire_smallest_signal' &&
    otherAction.operationalDisposition.disposition === 'other_action' &&
    !otherAction.signalAcquisition.shouldAcquire &&
    executionOpportunity.operationalDisposition.disposition ===
      'execution_opportunity' &&
    !executionOpportunity.signalAcquisition.shouldAcquire &&
    acquisitionAuthorized.operationalDisposition.disposition === 'unresolved' &&
    acquisitionAuthorized.signalAcquisition.shouldAcquire &&
    acquisitionAuthorized.signalAcquisition.requestedSignal ===
      'the governing boundary only the user can establish',
  'canonical judgment did not govern incomplete-evidence disposition and acquisition authority',
)

console.log(JSON.stringify({
  zeroQuestions: sufficient.nextAction,
  oneQuestion: oneQuestionEnough.nextAction,
  multipleQuestions: updatedGap.nextAction,
  duplicateProtection: {
    exact: exactDuplicate.reason,
    semantic: semanticDuplicate.reason,
    clarification: consequentialClarification.reason,
  },
  authorizationBoundary: {
    authorized: authorizedQuestion.nextAction,
    broadened: broadenedQuestion.reason,
  },
  skip: {
    sufficient: skipThenSufficient.nextAction,
    differentGap: skipThenDifferentGap.nextAction,
    sameGap: skipThenSameGap.nextAction,
    repeatedWithoutMatchingAuthorization:
      repeatedWithoutMatchingAuthorization.reason,
  },
  formulaEvidence: Boolean(selectedFormula),
  canonicalDispositions: [
    continueNormal.operationalDisposition.disposition,
    otherAction.operationalDisposition.disposition,
    executionOpportunity.operationalDisposition.disposition,
    acquisitionAuthorized.signalAcquisition.shouldAcquire
      ? 'signal_authorized'
      : 'signal_not_authorized',
  ],
  firstNormalLiveClick: 'operational_judgment_before_acquisition',
  routeContracts: {
    traditional: traditionalEntry.firstStep,
    homepage: homepageRouteEntry.firstStep,
    orientation: orientationEntry.firstStep,
    quickLive: quickLiveEntry.firstStep,
  },
  result: 'PASS',
}, null, 2))

}

qualify().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
`)

try {
  execFileSync('npx', ['tsx', file], {
    cwd: root,
    stdio: 'inherit',
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}
