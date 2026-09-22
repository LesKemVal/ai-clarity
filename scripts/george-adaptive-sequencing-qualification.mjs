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
const normalProviderOwner = read(
  'lib/george/runtime/provider/normal-provider.ts',
)
const chatRoute = read('app/api/chat/route.ts')
const operationalJudgmentOwner = read(
  'lib/george/runtime/operational-judgment.ts',
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
const normalJudgmentPresentation = section(
  'const presentNormalOperationalJudgmentResponse =',
  'const consumeNormalOperationalJudgment =',
)

assert(
  normalLiveControl.includes('normalLiveOrientationArmed') &&
    normalLiveControl.includes('continueCurrentConversationIntoLive();') &&
    normalLiveControl.includes('presentNormalLiveOrientation();'),
  'first Normal LIVE click must orient before adaptive preparation',
)
assert(
  page.includes(
    "LIVE lets me support you while another conversation is happening.",
  ) &&
    page.includes(
      "We can continue with THIS CONVERSATION, or use LIVE for SOMETHING ELSE.",
    ) &&
    page.includes(
      "Tap LIVE again to continue with this conversation.",
    ),
  "Normal LIVE first tap must explain LIVE and preserve context choice",
)
assert(
  page.includes('const continueCurrentConversationIntoLive = () => {') &&
    page.includes('startLiveSignalAcquisition();'),
  'second Normal LIVE tap must enter adaptive preparation',
)
assert(
  page.includes('normalLiveOrientationArmed') &&
    page.includes('? "orientation"') &&
    page.includes('continueCurrentConversationIntoLive'),
  'Normal LIVE control must preserve two-tap orientation choreography',
)
assert(
  homepageEntry.includes('requestHomepageOperationalJudgment(seed)') &&
    !homepageEntry.includes('requestHomepageOptionalQuestion({}, [], nextSignals)') &&
    !homepageEntry.includes('Continue to preparation →') &&
    !homepageEntry.includes('Start Briefing →') &&
    !homepageEntry.includes('/george/live-entry?source=start') &&
    entryResolution.includes("input.source === 'start'") &&
    entryResolution.includes("input.source === 'orientation'") &&
    entryResolution.includes("route === 'homepage'") &&
    entryResolution.includes("FRESH_DIRECT_SOURCES.has(input.source)"),
  'outcome-led Homepage, Traditional, Orientation, or signal-triggered LIVE entry contracts are coupled incorrectly',
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
assert(
  normalProviderOwner.includes(
    'GEORGE LIVE DESIRED-OUTCOME EVIDENCE BOUNDARY',
  ) &&
    normalProviderOwner.includes(
      'userEstablishedDesiredLiveOutcome',
    ) &&
    normalProviderOwner.includes(
      'the subject or topic of the anticipated interaction by itself',
    ) &&
    normalProviderOwner.includes(
      'Interpret every answer together with the exact question GEORGE presented',
    ),
  'LIVE candidate discovery can infer an outcome from topic-only or context-free answer evidence',
)
assert(
  authorizedSignalQuestionOwner.includes(
    "'What do you want from this conversation?' as const",
  ) &&
    authorizedSignalQuestionOwner.includes(
      'Do not add "or something else?" or any equivalent correction-path alternative to this direct outcome question.',
    ) &&
    authorizedSignalQuestionOwner.includes(
      "' — or something else?' as const",
    ),
  'authorized question realization does not distinguish direct outcome acquisition from inference testing',
)
assert(
  chatRoute.includes(
    'requiredSignalAcquisitionPurpose: operationalJudgmentRequest',
  ) &&
    chatRoute.includes("? 'qualification'") &&
    !chatRoute.includes("? 'live_scope_grounding'") &&
    !chatRoute.includes('const liveScopeGrounded') &&
    normalProviderOwner.includes(
      'The governed LIVE desired-outcome boundary controls this pass',
    ) &&
    normalProviderOwner.includes(
      'outcome is missing, its direct acquisition outranks scope or topic adjacency',
    ),
  'second-tap THIS CONVERSATION does not prioritize LIVE desired-outcome acquisition',
)
assert(
  preparationOwner.includes('example?: string') &&
    operationalJudgmentOwner.includes(
      'Illustrative example shown (presentation guidance only; not evidence)',
    ) &&
    operationalJudgmentOwner.includes('Question shown:') &&
    operationalJudgmentOwner.includes('User answer:'),
  'realized question/example/answer continuity is not explicit in canonical preparation evidence',
)
assert(
  operationalJudgmentOwner.includes(
    "if (input.disposition === 'unresolved') {\n    return null",
  ) &&
    operationalJudgmentOwner.includes(
      'input.operationalJudgment.realization.directPresentationAllowed',
    ) &&
    normalJudgmentPresentation.includes(
      'const normalizedContent = String(content || "").trim()',
    ) &&
    normalJudgmentPresentation.includes('if (!normalizedContent) return'),
  'unresolved Operational Judgment can still cross the canonical user-facing realization boundary',
)
assert(
  normalProviderOwner.includes(
    'Before the user selects LIVE, material execution usefulness governs whether GEORGE should proactively recommend or offer LIVE.',
  ) &&
    normalProviderOwner.includes(
      'active user-selected Normal LIVE qualification pass',
    ) &&
    normalProviderOwner.includes(
      'Do not reconsider whether LIVE deserves to exist',
    ) &&
    normalProviderOwner.includes(
      'selection alone is never readiness',
    ) &&
    normalProviderOwner.includes(
      'do not select continue_normal merely because material LIVE benefit is absent',
    ),
  'provider doctrine does not distinguish pre-selection recommendation from active LIVE preparation',
)

const dir = mkdtempSync(join(tmpdir(), 'george-adaptive-sequencing-'))
const file = join(dir, 'qualification.ts')

writeFileSync(file, `
import {
  createPreparationSession,
  normalizePreparationInteractions,
  projectNormalPreparationEvidence,
  resolveAdaptivePreparationTransition,
} from '${root}/lib/george/live-runtime/live-preparation-controller'
import { resolveSelectedOperationalFormula } from '${root}/lib/george/operational-memory/formula-library'
import { buildOperationalMemoryEvidenceNote, createOperationalMemoryRuntimeEvidence } from '${root}/lib/george/operational-memory/runtime-evidence'
import { buildNormalLiveOperationalJudgmentResult, buildNormalOperationalResponseResult, buildOperationalPreparationContextNote, registerProviderSignalAcquisitionSemanticValidation, resolveOperationalJudgment, resolveProviderOperationalJudgment, type ProviderOperationalReasoning } from '${root}/lib/george/runtime/operational-judgment'
import { normalizeProviderReasoningSignalAcquisitionPurpose } from '${root}/lib/george/runtime/provider/normal-provider'
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
      purpose: null,
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
const signalLiveEntry = resolveLiveEntry({ ...routeInput, source: 'signal' })
assert(
  traditionalEntry.route === 'direct' &&
    traditionalEntry.firstStep === 'questions' &&
    homepageRouteEntry.route === 'homepage' &&
    homepageRouteEntry.firstStep === 'prep' &&
    orientationEntry.route === 'direct' &&
    orientationEntry.firstStep === 'orientation' &&
    signalLiveEntry.route === 'normal' &&
    signalLiveEntry.firstStep === 'mechanics' &&
    signalLiveEntry.isFreshLiveStart,
  'an existing non-Normal LIVE entry contract changed',
)

const normalSessionId = 'normal-private-investment-platform'
const freshProvenanceSession = createPreparationSession({
  preparationSessionId: 'preparation-private-investment-platform',
  provenance: {
    entrySource: 'normal',
    restoredFrom: {
      kind: 'normal_session',
      id: normalSessionId,
    },
  },
  relations: { normalSessionId },
  knowledge: {
    conversation: { id: normalSessionId },
  },
  briefing: { priorInteractions: [] },
})
const freshProvenanceProjection = projectNormalPreparationEvidence({
  session: freshProvenanceSession,
  activeNormalSessionId: normalSessionId,
  linkedPreparationSessionId:
    freshProvenanceSession.preparationSessionId,
  currentConversation: [
    {
      role: 'user',
      content: "I'm thinking of building a private investment platform.",
      source: 'user_input',
    },
  ],
  evidenceSufficiency: 'unresolved',
  signalAcquisitionAllowed: true,
})
assert(
  freshProvenanceProjection?.entrySource === 'normal' &&
    !freshProvenanceProjection.objective &&
    freshProvenanceProjection.priorInteractions.length === 0,
  'selecting THIS CONVERSATION incorrectly established the external LIVE desired outcome',
)

const contextualExample =
  'I want to find potential investors for my platform.'
const userEstablishedLiveOutcome =
  'I want to discuss issuance with a broker-dealer.'
const answeredOutcomeSession = createPreparationSession({
  preparationSessionId: 'preparation-private-investment-answered',
  provenance: {
    entrySource: 'normal',
    restoredFrom: {
      kind: 'normal_session',
      id: normalSessionId,
    },
  },
  relations: { normalSessionId },
  knowledge: {
    objective: userEstablishedLiveOutcome,
    conversation: { id: normalSessionId },
  },
  briefing: {
    priorInteractions: [
      {
        key: 'desiredOutcome',
        question: 'What do you want from this conversation?',
        example: contextualExample,
        answer: userEstablishedLiveOutcome,
        status: 'answered',
        evidenceNeed:
          'the concrete result the user wants from the anticipated LIVE interaction',
        purpose: 'qualification',
      },
    ],
  },
})
const answeredOutcomeProjection = projectNormalPreparationEvidence({
  session: answeredOutcomeSession,
  activeNormalSessionId: normalSessionId,
  linkedPreparationSessionId:
    answeredOutcomeSession.preparationSessionId,
  currentConversation: [
    {
      role: 'user',
      content: "I'm thinking of building a private investment platform.",
      source: 'user_input',
    },
  ],
  evidenceSufficiency: 'unresolved',
  signalAcquisitionAllowed: true,
})
assert(answeredOutcomeProjection, 'answered LIVE outcome projection was rejected')
const answeredOutcomeNote = buildOperationalPreparationContextNote(
  answeredOutcomeProjection!,
)
assert(
  answeredOutcomeProjection?.priorInteractions[0]?.question ===
      'What do you want from this conversation?' &&
    answeredOutcomeProjection.priorInteractions[0]?.example ===
      contextualExample &&
    answeredOutcomeProjection.priorInteractions[0]?.answer ===
      userEstablishedLiveOutcome &&
    answeredOutcomeProjection.confirmedPreparationEvidence.some((value) =>
      value.includes(userEstablishedLiveOutcome),
    ) &&
    !answeredOutcomeProjection.knownEvidence.some((value) =>
      value.includes('potential investors'),
    ) &&
    answeredOutcomeNote.includes(
      'Question shown: What do you want from this conversation?',
    ) &&
    answeredOutcomeNote.includes(
      'Illustrative example shown (presentation guidance only; not evidence): ' +
        contextualExample,
    ) &&
    answeredOutcomeNote.includes('User answer: ' + userEstablishedLiveOutcome),
  'the next reasoning turn lost the realized question/example/answer boundary or promoted illustration to evidence',
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
const selectedLivePreparationReasoning = reasoning({
  operationalObjective:
    'Prepare the issuance discussion with the broker-dealer.',
  knownEvidence: [
    'Question shown: What do you want from this conversation?',
    'User answer: I want to discuss issuance with a broker-dealer.',
  ],
  georgeResolvableWork: [
    'prepare the outcome-serving structure for the issuance discussion',
  ],
  georgeCanAdvanceWithoutUserSignal: true,
  disposition: 'execution_ready',
  interaction: 'the user-selected issuance discussion with a broker-dealer',
  interactionUseful: false,
  purpose: 'prepare the selected issuance discussion toward the user outcome',
  desiredResult: 'advance the user-established issuance objective',
  liveMateriallyImprovesExecution: false,
  materialLiveBenefit: null,
  strongestNextStep: 'advance the prepared interaction when the user chooses',
  rationale:
    'Current evidence supports advancing preparation for the selected interaction.',
  presentation:
    'I have enough to advance preparation for the issuance discussion.',
})
const selectedLivePreparationReady = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: selectedLivePreparationReasoning,
  providerCapability: 'live',
  capabilityExplicitlyRequested: true,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
  operationalJudgmentRequest: true,
})
const preSelectionLiveRecommendationRejected =
  resolveProviderOperationalJudgment({
    judgment: base,
    providerReasoning: selectedLivePreparationReasoning,
    providerCapability: 'live',
    capabilityExplicitlyRequested: false,
    capabilityRecommendationMaterial: false,
    canonicalSignalAcquisition: true,
    operationalJudgmentRequest: false,
  })
const selectionWithoutReadiness = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    knownEvidence: ['The user selected LIVE.'],
    disposition: 'execution_ready',
    rationale: 'The user selected LIVE.',
    presentation: 'LIVE is ready because the user selected it.',
  }),
  providerCapability: 'live',
  capabilityExplicitlyRequested: true,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
  operationalJudgmentRequest: true,
})
const unresolvedInternalEvidenceNeed =
  'what the user needs the broker-dealer to agree to, decide, provide, or do'
const failedQuestionRealizationJudgment =
  resolveProviderOperationalJudgment({
    judgment: base,
    providerReasoning: reasoning({
      operationalObjective:
        'Prepare the issuance discussion with the broker-dealer.',
      knownEvidence: [
        'Question shown: What do you want from this conversation?',
        'User answer: I want to discuss issuance with a broker-dealer.',
      ],
      consequentialUncertainty: unresolvedInternalEvidenceNeed,
      georgeCanAdvanceWithoutUserSignal: false,
      rationale:
        'The requested result remains user-owned and consequential to preparation.',
      signalAcquisition: {
        shouldAcquire: true,
        requestedSignal: unresolvedInternalEvidenceNeed,
        purpose: 'qualification',
        evidenceIsUserOwned: true,
        consequentialToNextAction: true,
        reason:
          'The answer determines the strongest outcome-serving preparation move.',
      },
      decisionComparison: {
        bestActionNow:
          'prepare only the established portions of the issuance discussion',
        candidateSignal: unresolvedInternalEvidenceNeed,
        actNowOutcomeImpact: 'low',
        acquireSignalOutcomeImpact: 'high',
        signalInteractionCost: 'low',
        preferredPath: 'acquire_signal',
        bestActionNowExecutableFromKnownEvidence: false,
        bestActionNowMissingDependency: unresolvedInternalEvidenceNeed,
        reason:
          'The user-owned result materially changes preparation strategy.',
      },
    }),
    providerCapability: 'live',
    capabilityExplicitlyRequested: true,
    capabilityRecommendationMaterial: false,
    canonicalSignalAcquisition: true,
    signalAcquisitionAllowed: false,
    operationalJudgmentRequest: true,
  })
const failedQuestionRealizationResult =
  buildNormalLiveOperationalJudgmentResult({
    operationalJudgment: failedQuestionRealizationJudgment,
  })
const selectedLivePreparationResult =
  buildNormalLiveOperationalJudgmentResult({
    operationalJudgment: selectedLivePreparationReady,
  })
const selectionWithoutReadinessResult =
  buildNormalLiveOperationalJudgmentResult({
    operationalJudgment: selectionWithoutReadiness,
  })
assert(
  selectedLivePreparationReady.operationalDisposition.disposition ===
      'execution_ready' &&
    selectedLivePreparationReady.operationalDisposition
      .providerProposalAccepted &&
    !selectedLivePreparationReady.operationalDisposition
      .liveMateriallyImprovesExecution &&
    selectedLivePreparationReady.operationalDisposition
      .materialLiveBenefit === null &&
    selectedLivePreparationResult.message ===
      'I have enough to advance preparation for the issuance discussion.' &&
    preSelectionLiveRecommendationRejected.operationalDisposition
      .disposition !== 'execution_ready' &&
    preSelectionLiveRecommendationRejected.operationalDisposition
      .disposition !== 'execution_opportunity' &&
    !preSelectionLiveRecommendationRejected.operationalDisposition
      .providerProposalAccepted,
  'post-selection readiness remained gated by pre-selection LIVE recommendation materiality',
)
assert(
  selectionWithoutReadiness.operationalDisposition.disposition ===
      'unresolved' &&
    !selectionWithoutReadiness.operationalDisposition
      .providerProposalAccepted &&
    selectionWithoutReadiness.operationalDisposition.presentation === null &&
    !selectionWithoutReadiness.realization.directPresentationAllowed &&
    selectionWithoutReadinessResult.message === null,
  'selecting LIVE manufactured readiness or promoted unresolved internal judgment to user copy',
)
assert(
  failedQuestionRealizationJudgment.operationalDisposition.disposition ===
      'unresolved' &&
    !failedQuestionRealizationJudgment.signalAcquisition.shouldAcquire &&
    failedQuestionRealizationJudgment.operationalDisposition.presentation ===
      null &&
    !failedQuestionRealizationJudgment.realization
      .directPresentationAllowed &&
    failedQuestionRealizationResult.message === null,
  'failed question realization exposed internal judgment or became a post-selection LIVE-materiality rejection',
)
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
const contextualIntentEvidenceNeed =
  'the operational move the user wants to make with the private investment platform context'
const contextualStatementReasoning = reasoning({
  operationalObjective:
    'Establish the intended operational move without assuming a downstream platform task.',
  knownEvidence: [
    'The user is thinking of building a private investment platform.',
  ],
  consequentialUncertainty: contextualIntentEvidenceNeed,
  georgeResolvableWork: [],
  georgeCanAdvanceWithoutUserSignal: false,
  disposition: null,
  strongestNextStep: null,
  rationale:
    'The supplied subject context does not establish what the user wants GEORGE to do with it.',
  signalAcquisition: {
    shouldAcquire: true,
    requestedSignal: contextualIntentEvidenceNeed,
    purpose: null,
    evidenceIsUserOwned: true,
    consequentialToNextAction: true,
    reason:
      'Materially different next moves depend on the user-owned intended move.',
  },
  decisionComparison: {
    bestActionNow:
      'Acknowledge the supplied context without assuming a downstream task.',
    candidateSignal: contextualIntentEvidenceNeed,
    actNowOutcomeImpact: 'low',
    acquireSignalOutcomeImpact: 'high',
    signalInteractionCost: 'low',
    preferredPath: 'acquire_signal',
    bestActionNowExecutableFromKnownEvidence: false,
    bestActionNowMissingDependency: contextualIntentEvidenceNeed,
    reason:
      'The intended move determines which objective-advancing action is responsible.',
  },
})
const contextualStatementJudgment = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: contextualStatementReasoning,
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
  ordinaryNormalRequest: true,
})
const contextualStatementRealization = buildNormalOperationalResponseResult({
  operationalJudgment: contextualStatementJudgment,
  executionText:
    'What would you like to do with the private investment platform idea?',
  authorizedSignalQuestion: true,
})
const assumedAdviceReasoning = reasoning({
  operationalObjective: 'Provide private investment platform-building advice.',
  knownEvidence: [
    'The user is thinking of building a private investment platform.',
  ],
  consequentialUncertainty: null,
  georgeResolvableWork: [],
  georgeCanAdvanceWithoutUserSignal: false,
  disposition: 'continue_normal',
  strongestNextStep: null,
  rationale:
    'The provider inferred a downstream advisory task that the user did not request.',
  signalAcquisition: {
    shouldAcquire: true,
    requestedSignal: 'the platform target audience and priority features',
    purpose: null,
    evidenceIsUserOwned: true,
    consequentialToNextAction: true,
    reason: 'Those details would tailor platform-building advice.',
  },
  decisionComparison: {
    bestActionNow: 'Provide platform-building advice.',
    candidateSignal: 'the platform target audience and priority features',
    actNowOutcomeImpact: 'low',
    acquireSignalOutcomeImpact: 'high',
    signalInteractionCost: 'low',
    preferredPath: 'acquire_signal',
    bestActionNowExecutableFromKnownEvidence: false,
    bestActionNowMissingDependency:
      'the platform target audience and priority features',
    reason: 'The downstream details would change the assumed advice.',
  },
})
const assumedAdviceJudgment = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: assumedAdviceReasoning,
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
  ordinaryNormalRequest: true,
})
const assumedAdviceRealization = buildNormalOperationalResponseResult({
  operationalJudgment: assumedAdviceJudgment,
  executionText:
    'Start by defining demographics, features, compliance, security, and UX. What specific feature should the platform address?',
  governedProviderExecution: true,
})
assert(
  contextualStatementJudgment.operationalDisposition
      .consequentialUncertainty === contextualIntentEvidenceNeed &&
    contextualStatementJudgment.signalAcquisition.shouldAcquire &&
    contextualStatementRealization.executionAccepted &&
    assumedAdviceJudgment.operationalDisposition.disposition ===
      'unresolved' &&
    !assumedAdviceJudgment.signalAcquisition.shouldAcquire &&
    !assumedAdviceRealization.executionAccepted &&
    assumedAdviceRealization.message === null,
  'a contextual Normal statement became an assumed downstream task or lost its canonical uncertainty boundary',
)

const downstreamLiveEvidenceNeed =
  'the target audience and priority feature for the private investment platform'
const downstreamLiveReasoningWithoutPurpose = reasoning({
  operationalObjective:
    'Prepare downstream details about the private investment platform.',
  knownEvidence: [
    'The user is thinking of building a private investment platform.',
  ],
  consequentialUncertainty: downstreamLiveEvidenceNeed,
  georgeResolvableWork: [],
  georgeCanAdvanceWithoutUserSignal: false,
  disposition: null,
  strongestNextStep: null,
  signalAcquisition: {
    shouldAcquire: true,
    requestedSignal: downstreamLiveEvidenceNeed,
    purpose: null,
    evidenceIsUserOwned: true,
    consequentialToNextAction: true,
    reason: 'The downstream detail would shape later platform preparation.',
  },
})
const explicitlyMislabeledDownstreamReasoning = reasoning({
  ...downstreamLiveReasoningWithoutPurpose,
  signalAcquisition: {
    ...downstreamLiveReasoningWithoutPurpose.signalAcquisition,
    purpose: 'live_scope_grounding',
  },
})
const mislabeledSemanticValidationRejected =
  !registerProviderSignalAcquisitionSemanticValidation(
    explicitlyMislabeledDownstreamReasoning,
    {
      purpose: 'live_scope_grounding',
      evidenceNeed: downstreamLiveEvidenceNeed,
      satisfiesPurpose: true,
      source: 'provider_semantic_validation',
      liveScopeEvidenceIdentity: {
        anticipatedLiveInteractionAddressed: false,
        normalContextRelationshipAddressed: false,
        correctionPathPreserved: false,
        answerCouldLeaveLiveInteractionUnstated: true,
        answerCouldBeNormalTaskOrSubjectDetailOnly: true,
        provisionalHypothesisSpan: '',
        alternativeScopeSpan: '',
      },
    },
  )
assert(
  normalizeProviderReasoningSignalAcquisitionPurpose(
    downstreamLiveReasoningWithoutPurpose,
    'live_scope_grounding',
  ) === null,
  'a null-purpose downstream signal was normalized into LIVE scope authority',
)
const explicitlyMislabeledDownstreamJudgment =
  resolveProviderOperationalJudgment({
    judgment: base,
    providerReasoning: explicitlyMislabeledDownstreamReasoning,
    providerCapability: 'normal',
    capabilityExplicitlyRequested: false,
    capabilityRecommendationMaterial: false,
    canonicalSignalAcquisition: true,
    operationalJudgmentRequest: true,
    liveScopeGroundingRequired: true,
  })

const liveScopeEvidenceNeed =
  'Whether the anticipated LIVE interaction is about the private investment platform, something related to it, or something else.'
const liveScopeReasoning = reasoning({
  operationalObjective:
    'Ground the relationship between the current Normal conversation and the anticipated LIVE interaction.',
  knownEvidence: [
    'The user is considering building a private investment platform.',
  ],
  consequentialUncertainty: liveScopeEvidenceNeed,
  georgeResolvableWork: [],
  georgeCanAdvanceWithoutUserSignal: false,
  disposition: null,
  interaction: null,
  purpose: null,
  desiredResult: null,
  strongestNextStep: null,
  rationale:
    'The relationship must be established before dependent LIVE preparation.',
  signalAcquisition: {
    shouldAcquire: true,
    requestedSignal: liveScopeEvidenceNeed,
    purpose: 'live_scope_grounding',
    evidenceIsUserOwned: true,
    consequentialToNextAction: true,
    reason:
      'The user owns the definitive relationship between the two contexts.',
  },
  decisionComparison: {
    bestActionNow: null,
    candidateSignal: liveScopeEvidenceNeed,
    actNowOutcomeImpact: 'low',
    acquireSignalOutcomeImpact: 'high',
    signalInteractionCost: 'low',
    preferredPath: 'acquire_signal',
    bestActionNowExecutableFromKnownEvidence: false,
    bestActionNowMissingDependency: liveScopeEvidenceNeed,
    reason:
      'Grounding LIVE scope prevents preparation against an unconfirmed subject.',
  },
})
assert(
  normalizeProviderReasoningSignalAcquisitionPurpose(
    liveScopeReasoning,
    'live_scope_grounding',
  ) === liveScopeReasoning &&
    registerProviderSignalAcquisitionSemanticValidation(
      liveScopeReasoning,
      {
        purpose: 'live_scope_grounding',
        evidenceNeed: liveScopeEvidenceNeed,
        satisfiesPurpose: true,
        source: 'provider_semantic_validation',
        liveScopeEvidenceIdentity: {
          anticipatedLiveInteractionAddressed: true,
          normalContextRelationshipAddressed: true,
          correctionPathPreserved: true,
          answerCouldLeaveLiveInteractionUnstated: false,
          answerCouldBeNormalTaskOrSubjectDetailOnly: false,
          provisionalHypothesisSpan:
            'about the private investment platform',
          alternativeScopeSpan:
            'something related to it, or something else',
        },
      },
    ),
  'a valid explicit LIVE-scope signal did not satisfy the provider semantic contract',
)
const liveScopeGroundingAuthorized = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: liveScopeReasoning,
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
  operationalJudgmentRequest: true,
  liveScopeGroundingRequired: true,
})
const liveScopeGroundingResult =
  buildNormalLiveOperationalJudgmentResult({
    operationalJudgment: liveScopeGroundingAuthorized,
  })
const liveOutcomeEvidenceNeed =
  'the concrete result the user wants to accomplish in or through the anticipated LIVE interaction'
const liveOutcomeReasoningBeforeScope = reasoning({
  operationalObjective: null,
  knownEvidence: [
    'The current Normal conversation concerns a private investment platform and was selected as provenance.',
  ],
  consequentialUncertainty: liveOutcomeEvidenceNeed,
  georgeResolvableWork: [],
  georgeCanAdvanceWithoutUserSignal: false,
  disposition: null,
  interaction: null,
  purpose: null,
  desiredResult: null,
  strongestNextStep: null,
  rationale:
    'Provenance does not establish the execution-grade result; acquiring that result outranks topic adjacency.',
  signalAcquisition: {
    shouldAcquire: true,
    requestedSignal: liveOutcomeEvidenceNeed,
    purpose: 'qualification',
    evidenceIsUserOwned: true,
    consequentialToNextAction: true,
    reason:
      'The user must directly establish the result before LIVE strategy can optimize for it.',
  },
  decisionComparison: {
    bestActionNow: null,
    candidateSignal: liveOutcomeEvidenceNeed,
    actNowOutcomeImpact: 'low',
    acquireSignalOutcomeImpact: 'high',
    signalInteractionCost: 'low',
    preferredPath: 'acquire_signal',
    bestActionNowExecutableFromKnownEvidence: false,
    bestActionNowMissingDependency: liveOutcomeEvidenceNeed,
    reason:
      'Outcome certainty governs the strongest LIVE preparation move.',
  },
})
const liveOutcomeAcquisitionBeforeScope =
  resolveProviderOperationalJudgment({
    judgment: base,
    providerReasoning: liveOutcomeReasoningBeforeScope,
    providerCapability: 'normal',
    capabilityExplicitlyRequested: false,
    capabilityRecommendationMaterial: false,
    canonicalSignalAcquisition: true,
    operationalJudgmentRequest: true,
    liveScopeGroundingRequired: false,
  })
const downstreamQualificationReasoning = reasoning({
  ...downstreamLiveReasoningWithoutPurpose,
  operationalObjective:
    'Prepare toward the user-established result of securing agreement to a pilot.',
  knownEvidence: [
    'The anticipated LIVE interaction concerns the private investment platform context.',
    'The user explicitly wants the interaction to secure agreement to a pilot.',
  ],
  signalAcquisition: {
    ...downstreamLiveReasoningWithoutPurpose.signalAcquisition,
    purpose: 'qualification',
  },
})
const downstreamQualificationAfterOutcome =
  resolveProviderOperationalJudgment({
    judgment: base,
    providerReasoning: downstreamQualificationReasoning,
    providerCapability: 'normal',
    capabilityExplicitlyRequested: false,
    capabilityRecommendationMaterial: false,
    canonicalSignalAcquisition: true,
    operationalJudgmentRequest: true,
    liveScopeGroundingRequired: false,
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
      'the governing boundary only the user can establish' &&
    mislabeledSemanticValidationRejected &&
    !explicitlyMislabeledDownstreamJudgment.signalAcquisition
      .shouldAcquire &&
    explicitlyMislabeledDownstreamJudgment.action !==
      'acquire_smallest_signal' &&
    liveScopeGroundingAuthorized.action === 'acquire_smallest_signal' &&
    liveScopeGroundingAuthorized.signalAcquisition.shouldAcquire &&
    liveScopeGroundingAuthorized.signalAcquisition.purpose ===
      'live_scope_grounding' &&
    liveScopeGroundingAuthorized.signalAcquisition.requestedSignal ===
      liveScopeEvidenceNeed &&
    liveScopeGroundingResult.message === null &&
    liveOutcomeAcquisitionBeforeScope.action === 'acquire_smallest_signal' &&
    liveOutcomeAcquisitionBeforeScope.signalAcquisition.shouldAcquire &&
    liveOutcomeAcquisitionBeforeScope.signalAcquisition.purpose ===
      'qualification' &&
    liveOutcomeAcquisitionBeforeScope.signalAcquisition.requestedSignal ===
      liveOutcomeEvidenceNeed &&
    downstreamQualificationAfterOutcome.signalAcquisition
      .shouldAcquire &&
    downstreamQualificationAfterOutcome.signalAcquisition.purpose ===
      'qualification' &&
    downstreamQualificationAfterOutcome.signalAcquisition
      .requestedSignal === downstreamLiveEvidenceNeed,
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
  normalContextualStatement: {
    consequentialUncertainty:
      contextualStatementJudgment.operationalDisposition
        .consequentialUncertainty,
    assumedAdviceRejected: !assumedAdviceRealization.executionAccepted,
  },
  liveScopeGrounding: {
    missingPurposeRejected:
      normalizeProviderReasoningSignalAcquisitionPurpose(
        downstreamLiveReasoningWithoutPurpose,
        'live_scope_grounding',
      ) === null,
    mislabeledDownstreamRejected:
      mislabeledSemanticValidationRejected &&
      !explicitlyMislabeledDownstreamJudgment.signalAcquisition
        .shouldAcquire,
    canonicalPurpose:
      liveScopeGroundingAuthorized.signalAcquisition.purpose,
    internalJudgmentPresented: liveScopeGroundingResult.message !== null,
  },
  liveOutcomeCertainty: {
    provenanceDoesNotSatisfyOutcome:
      freshProvenanceProjection?.entrySource === 'normal' &&
      !freshProvenanceProjection.objective,
    unknownOutcomeAcquisition:
      liveOutcomeAcquisitionBeforeScope.signalAcquisition.requestedSignal,
    unknownOutcomePurpose:
      liveOutcomeAcquisitionBeforeScope.signalAcquisition.purpose,
    topicOnlyIsNotOutcome: true,
    freshQualificationAfterOutcome:
      downstreamQualificationAfterOutcome.signalAcquisition.purpose,
    realizedContextPreserved:
      answeredOutcomeProjection?.priorInteractions[0]?.question ===
        'What do you want from this conversation?' &&
      answeredOutcomeProjection.priorInteractions[0]?.example ===
        contextualExample,
    illustrationIsEvidence:
      answeredOutcomeProjection?.knownEvidence.some((value) =>
        value.includes('potential investors'),
      ) || false,
    predeterminedSequence: false,
  },
  selectedLivePreparation: {
    materialityGateRemoved:
      selectedLivePreparationReady.operationalDisposition.disposition ===
        'execution_ready' &&
      preSelectionLiveRecommendationRejected.operationalDisposition
        .disposition !== 'execution_ready' &&
      preSelectionLiveRecommendationRejected.operationalDisposition
        .disposition !== 'execution_opportunity',
    selectionIsNotReadiness:
      selectionWithoutReadiness.operationalDisposition.disposition ===
        'unresolved',
    unresolvedInternalMessage:
      selectionWithoutReadinessResult.message,
    failedQuestionRealizationMessage:
      failedQuestionRealizationResult.message,
  },
  routeContracts: {
    traditional: traditionalEntry.firstStep,
    homepage: homepageRouteEntry.firstStep,
    orientation: orientationEntry.firstStep,
    signalEntry: signalLiveEntry.firstStep,
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
