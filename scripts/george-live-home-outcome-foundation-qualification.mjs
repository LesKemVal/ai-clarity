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
const liveEntry = read('app/george/live-entry/LiveEntryClient.tsx')
const runtimeSupport = read('lib/george/live-runtime/prep-runtime.ts')

const outcomeCapture = section(homepage, 'function captureDesiredOutcome()', 'function resetSelection()')
const roleSelection = section(homepage, 'function selectRole(role: HomepageRole)', 'function captureDesiredOutcome()')
const questionRequest = section(homepage, 'async function requestHomepageOperationalJudgment(', 'function editCurrentUnderstanding()')
const understandingProjection = section(homepage, 'const supportedCurrentUnderstanding = useMemo(() =>', 'const currentOperationalPromise =')
const understandingEdit = section(homepage, 'function editCurrentUnderstanding()', 'function cancelCurrentUnderstandingEdit()')
const understandingPreservation = section(homepage, 'function preserveCurrentUnderstanding()', 'async function submitHomepageOptionalAnswer(')
const sessionProjection = section(homepage, 'const homepagePreparationSession = useMemo(() =>', 'useEffect(() => {\n    if (!homepagePreparationSession)')
const handoff = section(homepage, 'function preserveHomepageHandoff(', 'function approveAndContinueToLive()')
const renderedSurface = section(homepage, '  return (\n    <section', '\n  );\n}')

assert(
  renderedSurface.includes('What do you want this conversation to accomplish?') &&
    renderedSurface.indexOf('What do you want this conversation to accomplish?') < renderedSurface.indexOf('{optionalQuestionText}'),
  '/george/live-home does not begin outcome-first before the preparation question',
)
assert(
  outcomeCapture.includes('if (!exactOutcome.trim()) return;') &&
    outcomeCapture.includes('objective: exactOutcome') &&
    outcomeCapture.includes('desiredOutcome: exactOutcome') &&
    outcomeCapture.includes('answer: exactOutcome') &&
    outcomeCapture.includes('status: "answered" as const') &&
    outcomeCapture.indexOf('savePreparationSession(seed)') < outcomeCapture.indexOf('requestHomepageOperationalJudgment(seed)') &&
    outcomeCapture.includes('setPhase("optional")'),
  'the exact outcome is not preserved before the existing question path begins',
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

console.log('GEORGE live-home LH-1/LH-1C qualification: PASS')
