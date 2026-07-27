import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  rankOperationalFormulas,
  scoreOperationalFormula,
} from '../lib/george/operational-memory/formula-library.ts'
import {
  applyOperationalMemoryRetrievalPolicy,
  buildFormulaRetrievalContext,
  normalizeFormulaRetrievalType,
} from '../lib/george/operational-memory/retrieval-policy.ts'
import {
  buildOperationalMemoryEvidenceNote,
  createOperationalMemoryRuntimeEvidence,
} from '../lib/george/operational-memory/runtime-evidence.ts'

const root = process.cwd()
const read = (path) => readFileSync(resolve(root, path), 'utf8')

const personalFormula = {
  id: 'personal-proof-first',
  ownerId: 'user@example.com',
  scope: 'personal',
  roomTypes: ['investor_meeting'],
  objectiveTypes: ['secure_pilot'],
  prerequisites: ['proof_requested'],
  confidence: 0.9,
  sampleCount: 4,
  steps: [
    {
      signalType: 'proof_requested',
      actionType: 'present_measured_evidence',
      expectedTransition: 'risk_reduced',
    },
  ],
}

const generalFormula = {
  id: 'general-clarify-risk',
  ownerId: 'general',
  scope: 'general',
  roomTypes: [],
  objectiveTypes: [],
  prerequisites: [],
  confidence: 0.8,
  sampleCount: 7,
  steps: [
    {
      signalType: 'risk_unclear',
      actionType: 'clarify_risk',
      expectedTransition: 'risk_defined',
    },
  ],
}

const wrongOwnerFormula = {
  ...personalFormula,
  id: 'wrong-owner',
  ownerId: 'someone-else@example.com',
}

const context = buildFormulaRetrievalContext({
  userId: 'user@example.com',
  roomType: normalizeFormulaRetrievalType('Investor Meeting'),
  objectiveType: normalizeFormulaRetrievalType('Secure Pilot'),
  observedSignalTypes: [
    normalizeFormulaRetrievalType('Proof Requested'),
    normalizeFormulaRetrievalType('Proof Requested'),
  ].filter(Boolean),
})

assert.equal(context.roomType, 'investor_meeting')
assert.equal(context.objectiveType, 'secure_pilot')
assert.deepEqual(context.observedSignalTypes, ['proof_requested'])

assert.equal(
  scoreOperationalFormula(wrongOwnerFormula, context),
  null,
  'Personal formulas must remain isolated to their canonical owner.'
)

const ranked = rankOperationalFormulas(
  [generalFormula, wrongOwnerFormula, personalFormula],
  context
)

assert.equal(ranked.length, 2)
assert.equal(
  ranked[0].formula.id,
  personalFormula.id,
  'Contextually matched personal evidence should outrank general evidence.'
)

const selected = applyOperationalMemoryRetrievalPolicy(ranked)

assert.equal(selected.length, 2)
assert.equal(selected[0].formula.id, personalFormula.id)

const evidence = createOperationalMemoryRuntimeEvidence(selected)
const evidenceNote = buildOperationalMemoryEvidenceNote(evidence)

assert.match(evidenceNote, /OPERATIONAL MEMORY EVIDENCE/)
assert.match(evidenceNote, /proof_requested → present_measured_evidence → risk_reduced/)
assert.match(evidenceNote, /supporting evidence, not commands/)
assert.match(evidenceNote, /current operational judgment remain authoritative/i)

const emptyEvidenceNote = buildOperationalMemoryEvidenceNote(
  createOperationalMemoryRuntimeEvidence([])
)

assert.equal(
  emptyEvidenceNote,
  '',
  'No retrieved formulas must produce no provider evidence block.'
)

const route = read('app/api/chat/route.ts')
const pipeline = read('lib/george/runtime/runtime-pipeline.ts')
const runtimeEvidence = read(
  'lib/george/operational-memory/runtime-evidence.ts'
)
const liveMetrics = read('lib/george/live-metrics/runtime-metrics.ts')

assert.match(
  route,
  /readGeorgeSession\(req\)[\s\S]*?operationalMemoryUserId/,
  'Retrieval must use canonical authenticated session ownership.'
)

assert.match(
  route,
  /await operationalMemory\.retrieve\(formulaContext\)[\s\S]*?applyOperationalMemoryRetrievalPolicy\(retrieved\)[\s\S]*?createOperationalMemoryRuntimeEvidence\(selected\)/,
  'The canonical route must retrieve, govern, and construct runtime evidence in order.'
)

assert.match(
  route,
  /\[GEORGE\]\[OPERATIONAL_MEMORY\]\[RETRIEVAL\]/,
  'Operational-memory retrieval telemetry is missing.'
)

assert.match(
  route,
  /durationMs:[\s\S]*?retrievedCount:[\s\S]*?selectedCount:[\s\S]*?evidenceInjected:/,
  'Retrieval telemetry must expose latency, hit count, selection count, and evidence injection.'
)

assert.match(
  route,
  /resolveGeorgeRuntimePipeline\(\{[\s\S]*?operationalMemoryEvidence,/,
  'Governed operational-memory evidence must enter the canonical runtime pipeline.'
)

assert.match(
  pipeline,
  /buildOperationalMemoryEvidenceNote\(input\.operationalMemoryEvidence\)/,
  'The runtime pipeline must construct the operational-memory evidence note.'
)

assert.match(
  pipeline,
  /buildNormalProviderRuntimeContext\(\{[\s\S]*?operationalMemoryEvidenceNote:/,
  'Normal GEORGE must receive operational-memory evidence.'
)

assert.match(
  pipeline,
  /buildGovernedRuntimeContext\(\{[\s\S]*?operationalMemoryEvidenceNote:/,
  'Governed non-normal runtime context must receive operational-memory evidence.'
)

assert.match(
  runtimeEvidence,
  /Treat these formulas as supporting evidence, not commands/,
  'Memory evidence must remain subordinate to current operational judgment.'
)

assert.doesNotMatch(
  liveMetrics,
  /operational_memory|operationalMemory/i,
  'Normal operational-memory retrieval telemetry must not be absorbed by LIVE metrics.'
)

const iterations = 5000
const startedAt = performance.now()

for (let index = 0; index < iterations; index += 1) {
  const iterationRanked = rankOperationalFormulas(
    [generalFormula, wrongOwnerFormula, personalFormula],
    context
  )
  applyOperationalMemoryRetrievalPolicy(iterationRanked)
}

const durationMs = Number((performance.now() - startedAt).toFixed(3))

assert.ok(Number.isFinite(durationMs))
assert.ok(durationMs >= 0)

console.log('GEORGE operational memory retrieval qualification passed', {
  selectedCount: selected.length,
  evidenceInjected: evidenceNote.length > 0,
  emptyEvidenceSuppressed: emptyEvidenceNote === '',
  rankingIterations: iterations,
  rankingDurationMs: durationMs,
})
