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

const homepage = read('components/home/HomeConversationTypeSurface.tsx')
const judgment = read('lib/george/runtime/operational-judgment.ts')
const provider = read('lib/george/runtime/provider/normal-provider.ts')
const pipeline = read('lib/george/runtime/runtime-pipeline.ts')
const chatRoute = read('app/api/chat/route.ts')
const signalRoute = read('app/api/george/live/signal-question/route.ts')
const liveEntry = read('app/george/live-entry/LiveEntryClient.tsx')

const submit = section(
  homepage,
  'async function submitHomepageOptionalAnswer(',
  'function selectHomepageConversationMode(',
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

assert(submit && selectMode && acceptedEvidence && optionalSurface,
  'Homepage conversational consumer boundaries are incomplete.')

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
      currentUnderstanding: 'accepted_evidence_only',
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
