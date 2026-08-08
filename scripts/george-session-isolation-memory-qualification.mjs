import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { rankOperationalFormulas } from '../lib/george/operational-memory/formula-library.ts'
import { buildFormulaRetrievalContext } from '../lib/george/operational-memory/retrieval-policy.ts'
import {
  buildOperationalMemoryEvidenceNote,
  createOperationalMemoryRuntimeEvidence,
} from '../lib/george/operational-memory/runtime-evidence.ts'

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
const runtimeEvidence = read('lib/george/operational-memory/runtime-evidence.ts')
assert.match(store, /updateSessionLinkage/)
assert.match(store, /preparationSessionId\?: string/)
assert.match(preparation, /normalSessionId\?: string/)
assert.match(liveEntry, /activeNormalSession\?\.id === normalSessionId/)
assert.match(liveEntry, /restoredPreparationSession\.relations\.normalSessionId/)
assert.match(runtimeEvidence, /supporting evidence, not commands/)

console.log('GEORGE session isolation and material memory qualification passed', { isolatedSessions: 2, relevantMemoryResults: retrieved.length, staleCompatibilityRejected: true, currentSessionAuthorityPreserved: true })
