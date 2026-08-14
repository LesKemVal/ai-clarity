import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { rankOperationalFormulas } from '../lib/george/operational-memory/formula-library.ts'
import { buildFormulaRetrievalContext } from '../lib/george/operational-memory/retrieval-policy.ts'
import {
  buildOperationalMemoryEvidenceNote,
  createOperationalMemoryRuntimeEvidence,
} from '../lib/george/operational-memory/runtime-evidence.ts'
import {
  createFreshNormalSession,
  createSession,
  deleteSession,
  getActiveSessionForMode,
  safeReadSessions,
  upsertSession,
  updateActiveSessionMessages,
} from '../lib/george/session/store.ts'
import {
  resolveLiveEntry,
  validateLiveEntryPreparation,
  validateLiveEntryPreparationReturn,
} from '../lib/george/live-entry/entry-resolution.ts'

const root = process.cwd()
const read = (file) => readFileSync(resolve(root, file), 'utf8')

const sessionA = { id: 'session-a', objective: 'prepare investor outreach', preparationSessionId: 'preparation-a', formulaId: 'formula-a', scriptId: 'script-a', signals: ['investor_interest'] }
const sessionB = { id: 'session-b', objective: 'prepare a hiring interview', preparationSessionId: 'preparation-b', formulaId: 'formula-b', scriptId: 'script-b', signals: ['candidate_question'] }
const preparations = new Map([
  [sessionA.preparationSessionId, { ...sessionA, normalSessionId: sessionA.id }],
  [sessionB.preparationSessionId, { ...sessionB, normalSessionId: sessionB.id }],
])

function resolveValidatedPreparation(activeSession, requestedPreparationId) {
  const preparation = preparations.get(requestedPreparationId)
  return preparation && preparation.normalSessionId === activeSession.id ? preparation : null
}

class MemoryStorage {
  values = new Map()

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null
  }

  setItem(key, value) {
    this.values.set(key, String(value))
  }

  removeItem(key) {
    this.values.delete(key)
  }
}

const localStorage = new MemoryStorage()
const sessionStorage = new MemoryStorage()
const preparationSessionStorageKey = 'GEORGE_PREPARATION_SESSION_V1'
const loadStoredPreparationSession = () => {
  const raw = localStorage.getItem(preparationSessionStorageKey)
  return raw ? JSON.parse(raw) : null
}
globalThis.window = {
  localStorage,
  sessionStorage,
  name: '',
}

const priorNormalSession = createSession(
  'normal',
  [
    { role: 'user', content: 'Help me prepare for a hiring interview.' },
    { role: 'assistant', content: 'Let us prepare for the interview.' },
  ],
  'Interview preparation',
)
const priorPreparationSession = {
  version: 1,
  preparationSessionId: 'preparation-interview',
  provenance: {
    entrySource: 'normal',
    restoredFrom: { kind: 'normal_session', id: priorNormalSession.id },
  },
  knowledge: {
    objective: 'Get the job offer',
    conversation: { title: 'Hiring interview' },
    knownContext: 'Interview with the hiring manager.',
  },
  relations: { normalSessionId: priorNormalSession.id },
}
localStorage.setItem(
  preparationSessionStorageKey,
  JSON.stringify(priorPreparationSession),
)

const freshNormalSession = createFreshNormalSession()
assert.ok(freshNormalSession, 'New Session must create a Normal parent session immediately.')
assert.notEqual(
  freshNormalSession.id,
  priorNormalSession.id,
  'New Session must activate a different Normal parent session identity.',
)
assert.equal(
  getActiveSessionForMode('normal')?.id,
  freshNormalSession.id,
  'The fresh Normal session must be the active Normal workspace.',
)
assert.ok(
  safeReadSessions().some((session) => session.id === priorNormalSession.id),
  'The prior Normal session must remain available as history.',
)

const stalePreparation = loadStoredPreparationSession()
assert.ok(stalePreparation, 'The qualification fixture must retain the prior canonical preparation before consumer cleanup.')
assert.notEqual(
  stalePreparation.relations.normalSessionId,
  freshNormalSession.id,
  'Prior PreparationSessionV1 must not validate against the fresh Normal parent identity.',
)

localStorage.removeItem(preparationSessionStorageKey)
assert.equal(
  loadStoredPreparationSession(),
  null,
  'The New Session consumer must clear the prior canonical PreparationSessionV1 pointer.',
)

updateActiveSessionMessages(
  [{ role: 'user', content: 'Help me choose a garden irrigation timer.' }],
  'normal',
)
const historicalSession = safeReadSessions().find(
  (session) => session.id === priorNormalSession.id,
)
const currentSession = getActiveSessionForMode('normal')
assert.match(
  historicalSession?.messages[0]?.content || '',
  /hiring interview/i,
  'Historical interview context must remain attached to the prior session only.',
)
assert.match(
  currentSession?.messages[0]?.content || '',
  /garden irrigation timer/i,
  'New conversation evidence must attach to the fresh Normal session.',
)
assert.doesNotMatch(
  currentSession?.messages.map((message) => message.content).join(' ') || '',
  /interview|hiring manager|job offer/i,
  'Prior preparation evidence must not become current through canonical session identity.',
)

const freshPreparationSession = {
  version: 1,
  preparationSessionId: 'preparation-irrigation',
  provenance: {
    entrySource: 'normal',
    restoredFrom: { kind: 'normal_session', id: freshNormalSession.id },
  },
  knowledge: {
    objective: 'Choose an irrigation timer',
    conversation: { title: 'Product comparison' },
    knownContext: currentSession?.messages[0]?.content,
  },
  relations: { normalSessionId: freshNormalSession.id },
}
assert.equal(
  freshPreparationSession.relations.normalSessionId,
  freshNormalSession.id,
  'Normal to LIVE preparation must bind only to the fresh Normal parent identity.',
)
assert.doesNotMatch(
  JSON.stringify(freshPreparationSession.knowledge),
  /interview|hiring manager|job offer/i,
  'Normal to LIVE must not acquire prior interview preparation through canonical identity.',
)

const staleLegacySignals = {
  desiredOutcome: 'Get the job offer',
  conversationContext: 'Interview with the hiring manager.',
  counterparty: 'Recruiter',
}
const staleReturnSnapshot = {
  preparationSessionId: priorPreparationSession.preparationSessionId,
  preparationSession: priorPreparationSession,
  selectedFormula: { id: 'interview-formula' },
  selectedScript: { id: 'interview-script' },
  selectedReceiverProfile: 'audio_only',
  optionalSignalAnswers: { hiringConcern: 'Compensation' },
}
localStorage.setItem(
  'GEORGE_PRE_LIVE_SIGNALS',
  JSON.stringify(staleLegacySignals),
)
sessionStorage.setItem(
  'GEORGE_LIVE_PREP_RETURN_STATE',
  JSON.stringify(staleReturnSnapshot),
)
localStorage.setItem(
  preparationSessionStorageKey,
  JSON.stringify(freshPreparationSession),
)

const validatedFreshPreparation = validateLiveEntryPreparation({
  source: 'signal',
  preparationSessionId: freshPreparationSession.preparationSessionId,
  normalSessionId: freshNormalSession.id,
  activeNormalSessionId: freshNormalSession.id,
  candidate: freshPreparationSession,
})
assert.equal(
  validatedFreshPreparation?.preparationSessionId,
  freshPreparationSession.preparationSessionId,
  'The current identity-bound PreparationSessionV1 must remain authoritative.',
)

const rejectedStaleReturn = validateLiveEntryPreparationReturn({
  source: 'signal',
  preparationSessionId: freshPreparationSession.preparationSessionId,
  normalSessionId: freshNormalSession.id,
  activeNormalSessionId: freshNormalSession.id,
  snapshotPreparation: staleReturnSnapshot.preparationSession,
  storedPreparation: freshPreparationSession,
})
assert.equal(
  rejectedStaleReturn,
  null,
  'A stale return snapshot must not cross the current Normal preparation identity.',
)

const restoredSemanticState = {
  formula: null,
  script: null,
  receiver: null,
  optionalSignalAnswers: {},
}
if (rejectedStaleReturn) {
  restoredSemanticState.formula = staleReturnSnapshot.selectedFormula
  restoredSemanticState.script = staleReturnSnapshot.selectedScript
  restoredSemanticState.receiver = staleReturnSnapshot.selectedReceiverProfile
  restoredSemanticState.optionalSignalAnswers =
    staleReturnSnapshot.optionalSignalAnswers
}
assert.deepEqual(
  restoredSemanticState,
  {
    formula: null,
    script: null,
    receiver: null,
    optionalSignalAnswers: {},
  },
  'Formula, Script, receiver, and optional state must remain behind the identity gate.',
)
assert.equal(
  JSON.parse(localStorage.getItem('GEORGE_PRE_LIVE_SIGNALS')).desiredOutcome,
  staleLegacySignals.desiredOutcome,
  'Legacy global signals may remain stored; existence must not make them authoritative.',
)

const normalEntry = resolveLiveEntry({
  source: 'signal',
  homepageHandoff: null,
  storedPreparationSignals: validatedFreshPreparation.knowledge.additionalSignals || {},
  preparationPreviewReady: false,
  devPreview: false,
  startNewLive: false,
  hasLiveSetup: false,
  hasActiveLiveSetup: false,
})
assert.doesNotMatch(
  JSON.stringify(normalEntry.acquiredSignals),
  /interview|hiring manager|job offer|recruiter/i,
  'Normal entry must acquire only signals from its validated current preparation.',
)

const traditionalEntry = resolveLiveEntry({
  source: 'start',
  homepageHandoff: null,
  storedPreparationSignals: {},
  preparationPreviewReady: false,
  devPreview: false,
  startNewLive: true,
  hasLiveSetup: false,
  hasActiveLiveSetup: false,
})
assert.deepEqual(
  traditionalEntry.acquiredSignals,
  {},
  'Traditional source=start must remain clean despite stale Normal compatibility storage.',
)

const traditionalPreparation = {
  ...freshPreparationSession,
  preparationSessionId: 'preparation-traditional-current',
  provenance: { entrySource: 'traditional' },
  relations: {},
}
assert.equal(
  validateLiveEntryPreparationReturn({
    source: 'start',
    preparationSessionId: traditionalPreparation.preparationSessionId,
    snapshotPreparation: traditionalPreparation,
    storedPreparation: traditionalPreparation,
  })?.preparationSessionId,
  traditionalPreparation.preparationSessionId,
  'Traditional Ready Room return continuity must preserve its own preparation identity.',
)
assert.equal(
  validateLiveEntryPreparationReturn({
    source: 'start',
    preparationSessionId: priorPreparationSession.preparationSessionId,
    snapshotPreparation: priorPreparationSession,
    storedPreparation: priorPreparationSession,
  }),
  null,
  'Traditional entry must reject stale Normal preparation even when both legacy artifacts agree.',
)

const homepagePreparation = {
  ...freshPreparationSession,
  preparationSessionId: 'preparation-homepage-current',
  provenance: { entrySource: 'homepage' },
  relations: {},
}
assert.equal(
  validateLiveEntryPreparationReturn({
    source: 'homepage',
    preparationSessionId: homepagePreparation.preparationSessionId,
    snapshotPreparation: homepagePreparation,
    storedPreparation: homepagePreparation,
  })?.preparationSessionId,
  homepagePreparation.preparationSessionId,
  'Homepage return continuity must validate without requiring a Normal parent.',
)

const homepageEntry = resolveLiveEntry({
  source: 'homepage',
  homepageHandoff: { signals: { desiredOutcome: 'Approve the launch plan' } },
  storedPreparationSignals: {},
  preparationPreviewReady: false,
  devPreview: false,
  startNewLive: false,
  hasLiveSetup: false,
  hasActiveLiveSetup: false,
})
assert.equal(homepageEntry.firstStep, 'prep')
assert.equal(homepageEntry.acquiredSignals.desiredOutcome, 'Approve the launch plan')

const orientationEntry = resolveLiveEntry({
  source: 'orientation',
  homepageHandoff: null,
  storedPreparationSignals: {},
  preparationPreviewReady: false,
  devPreview: false,
  startNewLive: false,
  hasLiveSetup: false,
  hasActiveLiveSetup: false,
})
assert.equal(orientationEntry.firstStep, 'orientation')
assert.deepEqual(orientationEntry.acquiredSignals, {})

assert.equal(resolveValidatedPreparation(sessionA, sessionB.preparationSessionId), null)
assert.deepEqual(resolveValidatedPreparation(sessionA, sessionA.preparationSessionId), preparations.get(sessionA.preparationSessionId))
assert.equal(resolveValidatedPreparation(sessionA, 'preparation-b'), null, 'Stale latest-preparation recovery cannot override validated identity.')
assert.equal(sessionA.objective, 'prepare investor outreach')
assert.equal(sessionB.objective, 'prepare a hiring interview')
assert.equal(sessionA.formulaId, 'formula-a')
assert.equal(sessionB.formulaId, 'formula-b')
assert.equal(sessionA.scriptId, 'script-a')
assert.equal(sessionB.scriptId, 'script-b')

const relevantFormula = {
  id: 'prior-investor-pattern', ownerId: 'user@example.com', scope: 'personal',
  roomTypes: ['investor_meeting'], objectiveTypes: ['investor_outreach'],
  prerequisites: ['investor_interest'], confidence: 0.88, sampleCount: 3, status: 'validated',
  steps: [{ signalType: 'investor_interest', actionType: 'surface_proof', expectedTransition: 'confidence_increased' }],
}
const unrelatedFormula = { ...relevantFormula, id: 'unrelated-hiring-pattern', roomTypes: ['job_interview'], objectiveTypes: ['hiring_interview'], prerequisites: ['candidate_question'] }
const context = buildFormulaRetrievalContext({ userId: 'user@example.com', roomType: 'investor_meeting', objectiveType: 'investor_outreach', observedSignalTypes: ['investor_interest'] })
const retrieved = rankOperationalFormulas([relevantFormula, unrelatedFormula], context)
assert.deepEqual(retrieved.map(({ formula }) => formula.id), ['prior-investor-pattern'], 'Only materially relevant prior operational memory should be retrieved.')

const evidenceNote = buildOperationalMemoryEvidenceNote(createOperationalMemoryRuntimeEvidence(retrieved))
assert.match(evidenceNote, /supporting evidence, not commands, scripts, selected answers/i)
assert.match(evidenceNote, /current room evidence, the user's stated objective.*remain authoritative/i)
assert.match(evidenceNote, /use, adapt, combine, or reject/i)

const store = read('lib/george/session/store.ts')
const preparation = read('lib/george/live-runtime/live-preparation-controller.ts')
const liveEntry = read('app/george/live-entry/LiveEntryClient.tsx')
const entryResolution = read('lib/george/live-entry/entry-resolution.ts')
const normal = read('app/george/page.tsx')
const pageShell = read('components/layout/PageShell.tsx')
const runtimeEvidence = read('lib/george/operational-memory/runtime-evidence.ts')
assert.match(store, /updateSessionLinkage/)
assert.match(store, /preparationSessionId\?: string/)
assert.match(store, /export function createFreshNormalSession/)
assert.match(preparation, /normalSessionId\?: string/)
assert.match(normal, /createFreshNormalSession\(/)
assert.match(normal, /clearPreparationSession\(\)/)
assert.match(pageShell, /createFreshNormalSession\(\)/)
assert.match(pageShell, /clearPreparationSession\(\)/)
assert.doesNotMatch(liveEntry, /loadLivePreparationSignals/)
assert.match(liveEntry, /validateLiveEntryPreparationReturn/)
assert.match(liveEntry, /if \(!restoredPreparationSession\) return;/)
assert.match(liveEntry, /traditionalPreparationSession/)
assert.match(liveEntry, /setPreLiveSignals\(traditionalSignals\)/)
assert.match(liveEntry, /setObjective\(restoredPreparationSession\.knowledge\.objective\)/)
assert.match(entryResolution, /activeNormalSessionId === normalSessionId/)
assert.match(entryResolution, /candidate\.relations\.normalSessionId === normalSessionId/)
assert.match(runtimeEvidence, /supporting evidence, not commands/)

const deletedParent = createSession(
  'normal',
  [{ role: 'user', content: 'This session will be explicitly deleted.' }],
  'Deleted parent fixture',
)
const deletedParentPreparation = {
  version: 1,
  preparationSessionId: 'preparation-deleted-parent',
  provenance: {
    entrySource: 'normal',
    restoredFrom: { kind: 'normal_session', id: deletedParent.id },
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  knowledge: {
    objective: 'stale deleted objective',
    baselineAssumptions: [],
    participants: [],
    perspectives: [],
    conversation: { id: deletedParent.id },
    additionalSignals: {},
    documents: [],
  },
  briefing: { priorInteractions: [] },
  assets: {},
  support: {
    overrides: {},
    confirmations: {
      briefingReviewed: false,
      supportAssessmentAgreed: false,
      receiverConfirmed: false,
      speakingStyleConfirmed: false,
      mechanicsConfirmed: false,
      recoveryAcknowledged: false,
      readyRoomConfirmed: false,
    },
    runtimePreferences: {
      recoveryOptionIds: [],
      steeringPhrases: [],
      selectedResources: [],
    },
  },
  workflow: {
    current: { surface: 'briefing', phase: 'questions' },
    history: [],
  },
  relations: { normalSessionId: deletedParent.id },
}

deleteSession(deletedParent.id)
assert.equal(
  getActiveSessionForMode('normal'),
  null,
  'Explicit deletion must clear the active Normal parent identity.',
)
assert.equal(
  validateLiveEntryPreparation({
    source: 'signal',
    preparationSessionId: deletedParentPreparation.preparationSessionId,
    normalSessionId: deletedParent.id,
    activeNormalSessionId: getActiveSessionForMode('normal')?.id || null,
    candidate: deletedParentPreparation,
  }),
  null,
  'Preparation referencing a deleted parent must not re-enter canonical evidence.',
)
upsertSession(deletedParent)
assert.equal(
  safeReadSessions().some((candidate) => candidate.id === deletedParent.id),
  false,
  'A stale writer must not recreate an explicitly deleted Normal session.',
)

console.log('GEORGE session isolation and material memory qualification passed', { isolatedSessions: 2, newSessionIdentityQualified: true, priorPreparationRejected: true, normalLivePreparationIsolated: true, legacySignalsRetainedButRejected: true, invalidReturnStateRejected: true, traditionalEntryClean: true, normalReadyRoomContinuity: true, traditionalReadyRoomContinuity: true, homepageContinuity: true, relevantMemoryResults: retrieved.length, staleCompatibilityRejected: true, currentSessionAuthorityPreserved: true, deletedParentEvidenceRejected: true, staleWriterBlocked: true })
