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
const rootPage = read('app/page.tsx')
const compatibilityRoute = read('app/george/live-home/page.tsx')
const proxy = read('proxy.ts')
const manifest = read('app/manifest.ts')
const layout = read('app/layout.tsx')
const liveEntry = read('app/george/live-entry/LiveEntryClient.tsx')
const runtimeSupport = read('lib/george/live-runtime/prep-runtime.ts')

const outcomeCapture = section(homepage, 'function captureDesiredOutcome()', 'function submitMandatoryLiveCommunicationMedium()')
const outcomeCommit = section(homepage, 'function commitMandatoryDesiredOutcome(', 'function commitMandatoryLiveCommunicationMedium(')
const mediumCommit = section(homepage, 'function commitMandatoryLiveCommunicationMedium(', 'function resetSelection()')
const turnAssessment = section(homepage, 'async function submitHomepagePreparationTurn(', 'async function submitHomepageOptionalAnswer(')
const roleSelection = section(homepage, 'function selectRole(role: HomepageRole)', 'function captureDesiredOutcome()')
const questionRequest = section(homepage, 'async function requestHomepageOperationalJudgment(', 'function editCurrentUnderstanding()')
const understandingProjection = section(homepage, 'const supportedCurrentUnderstanding = useMemo(() =>', 'const currentOperationalPromise =')
const understandingEdit = section(homepage, 'function editCurrentUnderstanding()', 'function cancelCurrentUnderstandingEdit()')
const understandingPreservation = section(homepage, 'function preserveCurrentUnderstanding()', 'async function submitHomepagePreparationTurn(')
const sessionProjection = section(homepage, 'const homepagePreparationSession = useMemo(() =>', 'useEffect(() => {\n    if (!homepagePreparationSession)')
const handoff = section(homepage, 'function preserveHomepageHandoff(', 'function approveAndContinueToLive()')
const renderedSurface = section(homepage, '  return (\n    <section', '\n  );\n}')
const desiredOutcomeQuestion = section(
  homepage,
  'const MANDATORY_DESIRED_OUTCOME_QUESTION:',
  'const HOMEPAGE_QUESTION_TYPEWRITER_SPEED_MS',
)
const questionTypewriters = section(
  homepage,
  'const optionalQuestionText = useTypewriter(',
  'const visibleConversationMode =',
)

assert(
  rootPage.includes('COMMUNICATION INTELLIGENCE') &&
    rootPage.includes('Answer in your own words. GEORGE can determine the next best question') &&
    rootPage.includes('to materially improve the likelihood of a successful conclusion.') &&
    !rootPage.includes('Start with the result.') &&
    rootPage.includes('<HomeConversationTypeSurface />') &&
    !rootPage.includes('useTypewriter') &&
    !rootPage.includes('router.push') &&
    !rootPage.includes('redirect('),
  'the domain root is not the stable canonical GEORGE front door',
)
assert(
  rootPage.indexOf('COMMUNICATION INTELLIGENCE') <
      rootPage.indexOf('Answer in your own words. GEORGE can determine the next best question') &&
    !homepage.includes('Describe the outcome you want') &&
    !homepage.includes('placeholder="Describe the outcome you want"'),
  'the opening still contains redundant hierarchy or outcome instructions',
)
assert(
  compatibilityRoute.trim() === 'export { default } from "../../page";' &&
    !compatibilityRoute.includes('HomeConversationTypeSurface'),
  '/george/live-home still owns an independent homepage implementation',
)
assert(
  proxy.includes("'/api/chat'") &&
    proxy.includes("'/api/founder-code'") &&
    proxy.includes("'/api/continuity/request-link'") &&
    !proxy.includes("matcher: ['/:") &&
    !rootPage.includes('/api/') &&
    !rootPage.includes('/_next/') &&
    !rootPage.includes('live-hub'),
  'root routing can capture API, Next asset, or LIVE Hub/service traffic',
)
assert(
  manifest.includes("start_url: '/'") &&
    layout.includes("canonical: '/'") &&
    layout.includes("url: 'https://www.branesx.com/'"),
  'project-side application or canonical metadata still starts away from the domain root',
)

assert(
  desiredOutcomeQuestion.includes('question: "What would you like to accomplish today?"') &&
    renderedSurface.includes('{openingQuestionText}') &&
    renderedSurface.includes('htmlFor="homepage-desired-outcome"') &&
    renderedSurface.indexOf('{openingQuestionText}') < renderedSurface.indexOf('{optionalQuestionText}'),
  'the root front door does not begin with the required conversational question',
)
assert(
  homepage.includes('const HOMEPAGE_QUESTION_TYPEWRITER_SPEED_MS = 10;') &&
    questionTypewriters.includes('HOMEPAGE_QUESTION_TYPEWRITER_SPEED_MS') &&
    questionTypewriters.includes('phase === "selection"') &&
    questionTypewriters.includes('MANDATORY_DESIRED_OUTCOME_QUESTION.question'),
  'opening and subsequent canonical questions do not share the faster question-only typewriter',
)
assert(
  renderedSurface.includes('aria-busy={optionalQuestionLoading}') &&
    renderedSurface.includes('{optionalQuestion?.question || "GEORGE"}') &&
    !renderedSurface.includes('min-h-[172px] opacity-0'),
  'the active question disappears into a dead blank state while canonical reasoning is pending',
)
assert(
  outcomeCapture.includes('if (!exactOutcome.trim()) return;') &&
    outcomeCapture.includes('currentQuestion: MANDATORY_DESIRED_OUTCOME_QUESTION') &&
    outcomeCapture.includes('submitHomepagePreparationTurn({') &&
    !outcomeCapture.includes('objective: exactOutcome') &&
    !outcomeCapture.includes('setSelectedGoal(exactOutcome)') &&
    outcomeCapture.includes('setPhase("optional")'),
  'Q1 does not remain uncommitted while canonical turn assessment begins',
)
assert(
  turnAssessment.includes('fetch("/api/chat"') &&
    turnAssessment.includes('preparationTurnIntent: {') &&
    turnAssessment.includes('classification.providerProposalAccepted === true') &&
    turnAssessment.includes('classification.preservePendingQuestion === false') &&
    turnAssessment.indexOf('if (!mandatoryEvidenceEstablished)') <
      turnAssessment.indexOf('commitMandatoryDesiredOutcome(seed, exactSubmission)'),
  'mandatory opening evidence is not gated by canonical provider and Operational Judgment authority',
)
assert(
  outcomeCommit.includes('objective: exactOutcome') &&
    outcomeCommit.includes('desiredOutcome: exactOutcome') &&
    outcomeCommit.includes('answer: exactOutcome') &&
    outcomeCommit.includes('status: "answered" as const') &&
    outcomeCommit.includes('currentQuestion: MANDATORY_COMMUNICATION_MEDIUM_QUESTION'),
  'accepted Q1 evidence does not establish the outcome before Q2 becomes pending',
)
assert(
  mediumCommit.includes('communicationMedium: exactMedium') &&
    mediumCommit.includes('currentQuestion: null') &&
    turnAssessment.indexOf('commitMandatoryLiveCommunicationMedium(seed, exactSubmission)') <
      turnAssessment.indexOf('requestHomepageOperationalJudgment(nextSession)'),
  'accepted Q2 evidence does not commit before canonical Operational Judgment continues',
)
assert(
  !renderedSurface.includes('Start Briefing') &&
    !renderedSurface.includes('Continue to preparation') &&
    !renderedSurface.includes('Outcome-led preparation') &&
    !renderedSurface.includes('Working assumptions') &&
    !renderedSurface.includes('<BxPageHeader') &&
    !renderedSurface.includes('Change outcome') &&
    !homepage.includes('phase === "selected"'),
  'the rejected dashboard or post-outcome briefing gate remains rendered',
)
assert(
  questionRequest.includes('fetch("/api/chat"') &&
    questionRequest.includes('"/api/george/live/signal-question"') &&
    questionRequest.includes('setOptionalQuestion(nextQuestion)') &&
    questionRequest.indexOf('fetch("/api/chat"') < questionRequest.indexOf('"/api/george/live/signal-question"') &&
    renderedSurface.indexOf('{optionalQuestionText}') < renderedSurface.indexOf('HOMEPAGE_INTELLIGENCE_TIERS.map') &&
    renderedSurface.indexOf('HOMEPAGE_INTELLIGENCE_TIERS.map') < renderedSurface.indexOf('data-current-understanding="compact"'),
  'the authorized active question is not primary on the single post-outcome surface',
)
assert(
  renderedSurface.includes('grid h-11 w-11 place-items-center rounded-[11px]') &&
    renderedSurface.includes('grid h-8 w-8 place-items-center rounded-[8px] border') &&
    renderedSurface.includes('{tier.shortLabel}') &&
    renderedSurface.includes('aria-pressed={selected}') &&
    renderedSurface.includes('disabled={!tierAuthorityResolved || !missionTier}') &&
    renderedSurface.includes('selectHomepageMissionTier(tier.id)') &&
    renderedSurface.includes('opacity-55'),
  'compact S, I, and B authority-preserving tier controls are missing',
)
assert(
  homepage.includes('id: "smart",') &&
    homepage.includes('shortLabel: "S",') &&
    homepage.includes('id: "intelligent",') &&
    homepage.includes('shortLabel: "I",') &&
    homepage.includes('id: "brilliant",') &&
    homepage.includes('shortLabel: "B",') &&
    homepage.includes('fetch("/api/session", { cache: "no-store" })') &&
    homepage.includes('setEntitledMissionTier(grantedTier)') &&
    homepage.includes('setMissionTier(selectedTier)') &&
    homepage.includes('window.localStorage.setItem("george_tier", grantedTier)') &&
    homepage.includes('homepageTierRank(persistedSelection) <= homepageTierRank(grantedTier)') &&
    !homepage.includes('.catch(() => {\n        if (!cancelled) setMissionTier("smart")'),
  'the tier presentation can manufacture access authority',
)
assert(
  !renderedSurface.includes('Keep {homepageTierLabel(missionTier)}') &&
    !renderedSurface.includes('Upgrade') &&
    !renderedSurface.includes('Your briefing will remain here.') &&
    !homepage.includes('requestedMissionTier') &&
    homepage.includes('window.location.assign(`/activate?tier=${tier}&intent=be-${tier}`)'),
  'the redundant persistent tier-upgrade panel remains or locked access lost its existing route',
)
assert(
  homepage.includes('const supportedCurrentUnderstanding = useMemo(() =>') &&
    homepage.includes('String(answers.desiredOutcome || "").trim()') &&
    homepage.includes('String(answer || "").trim()') &&
    understandingProjection.includes('answers.role ? `Your role: ${answers.role}` : ""') &&
    !understandingProjection.includes('selectedRole?.label') &&
    renderedSurface.includes('Current understanding') &&
    !renderedSurface.includes("the people and context matter") &&
    !renderedSurface.includes("I'm still learning the situation"),
  'Current Understanding is missing or contains manufactured generic assumptions',
)
assert(
  renderedSurface.includes('{editingCurrentUnderstanding ? (') &&
    renderedSurface.includes('Continue editing from here.') &&
    renderedSurface.includes('Correct anything I misunderstood, remove what no longer applies, or add what I should know.') &&
    understandingEdit.includes('setCurrentUnderstandingDraft(supportedCurrentUnderstanding)') &&
    !understandingEdit.includes('setOptionalQuestion(null)') &&
    !understandingEdit.includes('skipHomepageOptionalQuestion'),
  'editing Current Understanding does not safely replace the active question position',
)
assert(
  understandingPreservation.includes('const exactRevision = currentUnderstandingDraft') &&
    understandingPreservation.includes('answer: exactRevision') &&
    understandingPreservation.includes('status: "answered" as const') &&
    understandingPreservation.includes('preparationSessionId: seed.preparationSessionId') &&
    understandingPreservation.includes('currentQuestion: seed.briefing.currentQuestion') &&
    understandingPreservation.indexOf('savePreparationSession(nextSession)') < understandingPreservation.indexOf('setEditingCurrentUnderstanding(false)') &&
    !understandingPreservation.includes('fetch('),
  'exact understanding edits are not preserved before the unresolved question returns',
)
assert(
  renderedSurface.includes('setCurrentUnderstandingDraft(event.target.value)') &&
    !understandingEdit.includes('setInterval') &&
    !understandingEdit.includes('setTimeout'),
  'understanding editing invokes model or timer authority on each keystroke',
)
assert(
  outcomeCapture.includes('preparationSessionId: existingSeed?.preparationSessionId') &&
    sessionProjection.includes('preparationSessionId: seed.preparationSessionId') &&
    !roleSelection.includes('clearPreparationSession()') &&
    !handoff.includes('!selectedType') &&
    !homepage.includes('if (!selectedRole) return;'),
  'session identity, optional role, or optional conversation type regressed',
)
assert(
  roleSelection.includes('status: "answered" as const') &&
    roleSelection.includes('answer: role.label') &&
    !roleSelection.includes('setSelectedType('),
  'explicit role evidence is no longer distinguishable from inference',
)
assert(
  handoff.includes('homepagePreparationSession.knowledge.conversation.id') &&
    handoff.includes('preparationSession: readyRoomPreparationSession') &&
    handoff.includes('...preparationReadiness') &&
    !handoff.includes('resolveLivePreparationReadiness(signals)') &&
    homepage.includes('provenance: existingSeed?.provenance || { entrySource: "homepage" }') &&
    runtimeSupport.includes('preparationEvidence?: PreparationRuntimeEvidenceProjection') &&
    liveEntry.includes('...(preparationEvidence ? { preparationEvidence } : {}),'),
  'access, provenance, preparation evidence, or LIVE handoff transport regressed',
)
assert(
  renderedSurface.includes('w-full max-w-3xl min-w-0') &&
    renderedSurface.includes('w-full min-w-0 resize-y') &&
    renderedSurface.includes('flex min-w-0 items-center justify-between gap-3') &&
    renderedSurface.includes('grid h-11 w-11 place-items-center') &&
    renderedSurface.includes('grid h-8 w-8 place-items-center') &&
    renderedSurface.includes('min-w-[92px]'),
  'the conversational surface lost its narrow-width overflow protections',
)

console.log('GEORGE root front-door and live-home compatibility qualification: PASS')
