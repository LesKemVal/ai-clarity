import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
const section = (source, start, end) => {
  const startIndex = source.indexOf(start)
  const endIndex = source.indexOf(end, startIndex + start.length)
  return startIndex >= 0 && endIndex > startIndex
    ? source.slice(startIndex, endIndex)
    : ''
}

const homeSurface = read(
  'components/home/HomeConversationTypeSurface.tsx'
)

assert(
  /\/api\/george\/operational-memory\/recommend/.test(homeSurface),
  'Homepage Formula review must consume the canonical operational-memory recommendation endpoint.'
)

assert(
  /recommendedFormula/.test(homeSurface),
  'Homepage Formula review must consume the canonical recommended Formula.'
)

assert(
  /alternativeFormulas/.test(homeSurface),
  'Homepage Formula review must preserve canonical ranked alternatives for user review.'
)

assert(
  !/\/api\/george\/operational-memory\/formulas/.test(homeSurface),
  'Homepage Formula review must not rank the raw Formula collection locally.'
)

assert(
  !/roomTypes\.includes\(conversationId\)|score \+= 4/.test(homeSurface),
  'Homepage must not own a competing Formula scoring algorithm.'
)

const homepage = read('components/home/HomeConversationTypeSurface.tsx')
const judgment = read('lib/george/runtime/operational-judgment.ts')
const provider = read('lib/george/runtime/provider/normal-provider.ts')
const pipeline = read('lib/george/runtime/runtime-pipeline.ts')
const chatRoute = read('app/api/chat/route.ts')
const signalRoute = read('app/api/george/live/signal-question/route.ts')
const liveEntry = read('app/george/live-entry/LiveEntryClient.tsx')
const conversationTypes = read('lib/george/live-entry/conversation-types.ts')
const preparationController = read('lib/george/live-runtime/live-preparation-controller.ts')

const submit = section(
  homepage,
  'async function submitHomepagePreparationTurn(',
  'async function submitHomepageOptionalAnswer(',
)
const mandatoryOutcomeCapture = section(
  homepage,
  'function captureDesiredOutcome()',
  'function submitMandatoryLiveCommunicationMedium()',
)
const mandatoryOutcomeCommit = section(
  homepage,
  'function commitMandatoryDesiredOutcome(',
  'function commitMandatoryLiveCommunicationMedium(',
)
const mandatoryMediumCommit = section(
  homepage,
  'function commitMandatoryLiveCommunicationMedium(',
  'function resetSelection()',
)
const selectMode = section(
  homepage,
  'function selectHomepageConversationMode(',
  'function skipHomepageOptionalQuestion()',
)
const acceptedEvidence = section(
  homepage,
  'function applyAcceptedLiveBriefingTurn(',
  'async function requestHomepageOperationalJudgment(',
)
const optionalSurface = section(
  homepage,
  '{phase === "optional" && (',
  '{phase === "decision" && (',
)
const currentUnderstandingProjection = section(
  homepage,
  'const supportedCurrentUnderstanding = useMemo(',
  'const currentOperationalPromise = homepageOperationalPromise(',
)
const currentUnderstandingCorrection = section(
  homepage,
  'function preserveCurrentUnderstanding()',
  'async function submitHomepagePreparationTurn(',
)
const preparationSessionProjection = section(
  homepage,
  'const homepagePreparationSession = useMemo(() =>',
  'useEffect(() => {\n    if (!homepagePreparationSession)',
)

/*
 * Homepage Final Review owns presentation of the user's delivery choice,
 * while the canonical receiver vocabulary and PreparationSession remain
 * the semantic owners.
 */
assert(
  homepage.includes('LIVE_RECEIVER_PROFILE_PANELS') &&
    homepage.includes('type LiveReceiverProfilePanelId'),
  'Homepage Final Review must reuse the canonical LIVE receiver vocabulary.',
)

assert(
  homepage.includes('setHomepageReceiverProfile(panel.id);') &&
    homepage.includes('setHomepageReceiverConfirmed(true);'),
  'Homepage receiver recommendation/availability must not count as confirmation; explicit user selection must confirm it.',
)

assert(
  preparationSessionProjection.includes(
    'homepageReceiverConfirmed && homepageReceiverProfile',
  ) &&
    preparationSessionProjection.includes(
      '? { receiver: homepageReceiverProfile }',
    ) &&
    preparationSessionProjection.includes(
      'receiverConfirmed: homepageReceiverConfirmed',
    ),
  'Homepage PreparationSession must carry a receiver override only after explicit confirmation.',
)

assert(
  homepage.includes(
    '!briefingSufficient || !homepageReceiverConfirmed',
  ),
  'Homepage Final Review must not continue to LIVE until the user confirms a delivery receiver.',
)

assert(
  submit &&
    selectMode &&
    acceptedEvidence &&
    optionalSurface &&
    currentUnderstandingProjection &&
    currentUnderstandingCorrection &&
    preparationSessionProjection &&
    mandatoryOutcomeCapture &&
    mandatoryOutcomeCommit &&
    mandatoryMediumCommit,
  'Homepage conversational consumer boundaries are incomplete.')

assert(
  mandatoryOutcomeCapture.includes(
    'currentQuestion: MANDATORY_DESIRED_OUTCOME_QUESTION',
  ) &&
    mandatoryOutcomeCapture.includes('submitHomepagePreparationTurn({') &&
    !mandatoryOutcomeCapture.includes('objective: exactOutcome') &&
    !mandatoryOutcomeCapture.includes('setSelectedGoal(exactOutcome)') &&
    !mandatoryOutcomeCapture.includes('setSelectedMissions([exactOutcome])'),
  'Q1 can still commit desired-outcome evidence before canonical turn assessment.',
)
assert(
  submit.includes('const mandatoryEvidenceEstablished =') &&
    submit.includes('classification.providerProposalAccepted === true') &&
    submit.includes('classification.preservePendingQuestion === false') &&
    submit.includes('preserveHomepagePendingQuestion(seed, pendingQuestion)') &&
    submit.indexOf('if (!mandatoryEvidenceEstablished)') <
      submit.indexOf('commitMandatoryDesiredOutcome(seed, exactSubmission)'),
  'Mandatory Q1/Q2 evidence is not fail-closed behind accepted canonical question satisfaction.',
)
assert(
  mandatoryOutcomeCommit.includes('objective: exactOutcome') &&
    mandatoryOutcomeCommit.includes('desiredOutcome: exactOutcome') &&
    mandatoryOutcomeCommit.includes('broadGoal: exactOutcome') &&
    mandatoryOutcomeCommit.includes(
      'currentQuestion: MANDATORY_COMMUNICATION_MEDIUM_QUESTION',
    ),
  'A canonically accepted Q1 answer does not establish the outcome and advance to Q2.',
)
assert(
  mandatoryMediumCommit.includes('communicationMedium: exactMedium') &&
    mandatoryMediumCommit.includes('currentQuestion: null') &&
    submit.indexOf('commitMandatoryLiveCommunicationMedium(seed, exactSubmission)') <
      submit.indexOf('requestHomepageOperationalJudgment(nextSession)'),
  'A canonically accepted Q2 answer does not commit before normal Operational Judgment continues.',
)

const liveLabel = optionalSurface.indexOf('["live_briefing", "LIVE briefing"]')
const preparationLabel = optionalSurface.indexOf('["preparation", "Preparation"]')
assert(
  liveLabel >= 0 && preparationLabel > liveLabel,
  'Visible mode order is not LIVE briefing followed by Preparation.',
)
assert(
  homepage.includes(
    'useState<HomepageConversationMode>("live_briefing")',
  ),
  'LIVE briefing is not the initial visible mode.',
)
assert(
  !homepage.includes('optionalInteractionMode') &&
    !homepage.includes('interactionMode: "ask_george"') &&
    !homepage.includes('>\n                            Answer\n') &&
    !homepage.includes('Ask GEORGE'),
  'Legacy homepage Answer or Ask GEORGE behavior remains.',
)
assert(
  !submit.includes('/api/george/live/signal-question') &&
    submit.includes('fetch("/api/chat"'),
  'Homepage conversational submissions still bypass /api/chat.',
)
assert(
  submit.includes('currentClassification,') &&
    submit.includes('explicitSelection: explicitSelection ?? null'),
  'Inferred turns do not send the current classification with explicit null.',
)
assert(
  selectMode.includes('setPendingExplicitConversationMode(mode)') &&
    submit.includes('options?.explicitSelection ?? pendingExplicitConversationMode') &&
    submit.includes('setPendingExplicitConversationMode(null)') &&
    submit.indexOf('setPendingExplicitConversationMode(null)') >
      submit.indexOf('classification?.authority !== "operational_judgment"'),
  'Manual mode selection is not explicit for exactly one successful submission.',
)
assert(
  submit.includes('setAcceptedConversationMode(acceptedMode)') &&
    submit.includes('classification.inferredModeTransition === "switched"') &&
    submit.includes('classification.acknowledgment'),
  'Accepted inferred classification does not govern the visible mode and acknowledgment.',
)
assert(
  submit.includes('judgmentResult.message || ""') &&
    submit.includes('realization.action !== "respond_to_preparation"') &&
    submit.includes('stage: "response", message: preparationResponse'),
  'Preparation does not render the accepted Operational Judgment result message.',
)
assert(
  submit.indexOf('if (acceptedMode === "preparation")') >= 0 &&
    submit.indexOf('applyAcceptedLiveBriefingTurn(') >
      submit.indexOf('if (acceptedMode === "preparation")') &&
    acceptedEvidence.includes('acceptedDisposition.providerProposalAccepted') &&
    acceptedEvidence.includes('acceptedDisposition.knownEvidence') &&
    !acceptedEvidence.includes('exactSubmission'),
  'Preparation or raw turn text can mutate accepted homepage evidence.',
)
assert(
  submit.includes('realization.preservePendingQuestion') &&
    acceptedEvidence.includes('classification.preservePendingQuestion') &&
    acceptedEvidence.includes(
      'currentQuestion: preservePendingQuestion ? pendingQuestion : null',
    ),
  'The operational pending question is not preserved by canonical authority.',
)
assert(
  acceptedEvidence.includes(
    'const preservePendingQuestion = classification.preservePendingQuestion',
  ) &&
    !submit.includes('exactSubmission,\n          status: "answered"'),
  'A user question can be treated automatically as an answer.',
)
assert(
  submit.includes('classification.classification === "clarification_required"') &&
    submit.includes('stage: "clarification"') &&
    submit.includes('message: clarificationMessage') &&
    optionalSurface.includes('homepageConversationSequenceText'),
  'Canonical clarification does not immediately replace the visible question.',
)
assert(
  submit.includes('setHeldAmbiguousTurn({') &&
    submit.includes('submission: exactSubmission') &&
    submit.indexOf('setHeldAmbiguousTurn({') <
      submit.indexOf('applyAcceptedLiveBriefingTurn('),
  'Ambiguous original text is not held outside evidence before commitment.',
)
assert(
  selectMode.includes('if (heldAmbiguousTurn)') &&
    selectMode.includes('submitHomepageOptionalAnswer({') &&
    selectMode.includes('heldTurn: heldAmbiguousTurn') &&
    optionalSurface.includes('onClick={() => selectHomepageConversationMode(mode)}'),
  'Clarification choice does not automatically resubmit the held turn.',
)
assert(
  submit.includes('Your text and briefing are still here—try again.') &&
    submit.indexOf('setOptionalAnswer("")') >
      submit.indexOf('if (acceptedMode === "preparation")') &&
    !submit.includes('setOptionalAnswer(exactSubmission)'),
  'Failed submission does not preserve exact composer text for retry.',
)
assert(
  homepage.includes('...Object.entries(optionalAnswers)') &&
    acceptedEvidence.includes('acceptedDisposition.knownEvidence') &&
    !acceptedEvidence.includes('[acceptedInteraction.key]: exactSubmission'),
  'Current Understanding can consume unaccepted raw turn text.',
)
assert(
  !currentUnderstandingProjection.includes('baselineAssumptions') &&
    !currentUnderstandingProjection.includes('Working assumption:') &&
    currentUnderstandingProjection.includes(
      'authority: "user_owned" as const',
    ),
  'Generic conversation-type assumptions can still render as Current Understanding.',
)
assert(
  homepage.includes('getConversationTypeBaselineAssumptions(selectedType.id)') &&
    preparationSessionProjection.includes(
      'baselineAssumptions: [...baselineAssumptions]',
    ) &&
    conversationTypes.includes(
      'export function getConversationTypeBaselineAssumptions(',
    ) &&
    preparationController.includes(
      "preparationRuntimeEvidenceValue(assumption, 'inference')",
    ),
  'Conversation-type assumptions no longer remain internal provisional preparation evidence.',
)
assert(
  currentUnderstandingProjection.includes(
    'if (explicitRevision) return explicitRevision',
  ) &&
    currentUnderstandingProjection.includes('if (revision)') &&
    currentUnderstandingCorrection.includes(
      'preparationSessionId: seed.preparationSessionId',
    ) &&
    currentUnderstandingCorrection.includes(
      'status: "answered" as const',
    ) &&
    currentUnderstandingCorrection.includes(
      'void requestHomepageOperationalJudgment(',
    ) &&
    currentUnderstandingCorrection.includes('"current_understanding"'),
  'A user correction does not supersede provisional display in the same PreparationSession and reassessment path.',
)
assert(
  !currentUnderstandingProjection.includes('fetch(') &&
    !currentUnderstandingProjection.includes('providerSemantic') &&
    !currentUnderstandingProjection.includes('knownEvidence') &&
    !currentUnderstandingProjection.includes('consequentialUncertainty') &&
    !currentUnderstandingProjection.includes('operationalMemory') &&
    !currentUnderstandingProjection.includes('priorSession'),
  'Current Understanding acquired a provider, judgment, or question-ranking authority.',
)
assert(
  !signalRoute.includes('PreparationTurnClassification') &&
    !signalRoute.includes('preparationTurnIntent') &&
    !signalRoute.includes('preparationTurnRealizationAuthorization'),
  'Signal-question gained classification or realization authority.',
)
assert(
  liveEntry.includes('interactionMode: "ask_george"') &&
    signalRoute.includes("interactionMode === 'ask_george' && userTurn"),
  'Traditional/LIVE Entry active ask_george behavior was removed.',
)

const classificationOwners = [
  judgment,
  provider,
  pipeline,
  chatRoute,
  signalRoute,
  homepage,
].filter((source) =>
  source.includes('export function resolvePreparationTurnClassification'),
)
const realizationOwners = [
  judgment,
  provider,
  pipeline,
  chatRoute,
  signalRoute,
  homepage,
].filter((source) =>
  source.includes('function resolvePreparationTurnRealizationAuthorization('),
)
assert(
  classificationOwners.length === 1 && realizationOwners.length === 1,
  'Duplicate preparation classification or realization owner detected.',
)
assert(
  homepage.includes('readinessJudgment.minimumLiveSupportEstablished === true') &&
    homepage.includes('readinessJudgment.level === "supportable"') &&
    homepage.includes('readinessJudgment.level === "sharp"') &&
    homepage.includes('Another answer could sharpen my support.'),
  'Supportable readiness no longer enables LIVE while preserving sharpening.',
)
assert(
  judgment.includes('explicitSelectionFieldPresent') &&
    judgment.includes('input?.explicitSelection !== null'),
  'Canonical intent normalization does not accept explicit null as inference.',
)

console.log(
  JSON.stringify(
    {
      visibleModes: ['LIVE briefing', 'Preparation'],
      initialMode: 'live_briefing',
      inferredExplicitSelection: null,
      preparationResponse: 'operationalJudgmentResult.message',
      clarificationResubmission: 'automatic',
      currentUnderstanding: 'conversation_specific_accepted_evidence_only',
      baselineAssumptions: 'internal_provisional_preparation_evidence_only',
      currentUnderstandingCorrection: 'same_preparation_session_then_operational_judgment',
      remainingAskGeorgeConsumer: 'Traditional/LIVE Entry',
      duplicateClassificationOwners: classificationOwners.length - 1,
      duplicateRealizationOwners: realizationOwners.length - 1,
      result: 'PASS',
    },
    null,
    2,
  ),
)
console.log('GEORGE homepage conversational consumer qualification: PASS')
