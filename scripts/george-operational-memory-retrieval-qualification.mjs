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
  sampleCount: 12,
  successCount: 9,
  contradictionCount: 1,
  unknownCount: 2,
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
  sampleCount: 10,
  successCount: 5,
  contradictionCount: 2,
  unknownCount: 3,
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

assert.equal(
  scoreOperationalFormula(
    {
      ...generalFormula,
      id: 'retired-formula',
      status: 'retired',
    },
    context
  ),
  null,
  'Retired formulas must remain outside operational-memory retrieval.'
)

const lifecycleRanked = rankOperationalFormulas(
  [
    {
      ...generalFormula,
      id: 'candidate-formula',
      status: 'candidate',
    },
    {
      ...generalFormula,
      id: 'contested-formula',
      status: 'contested',
    },
    {
      ...generalFormula,
      id: 'validated-formula',
      status: 'validated',
    },
  ],
  context
)

assert.deepEqual(
  lifecycleRanked.map((result) => result.formula.id),
  ['validated-formula', 'candidate-formula', 'contested-formula'],
  'Validated formulas must outrank candidates, and contested formulas must remain subordinate.'
)

const ranked = rankOperationalFormulas(
  [generalFormula, wrongOwnerFormula, personalFormula],
  context
)

assert.equal(ranked.length, 2)
assert.equal(
  ranked[0].formula.id,
  personalFormula.id,
  'Contextual fit and execution evidence should outrank weaker general evidence; personal scope alone must not determine success rank.'
)

const scopeNeutralPersonal = {
  ...generalFormula,
  id: 'scope-neutral-personal',
  ownerId: 'user@example.com',
  scope: 'personal',
}

const scopeNeutralGeneral = {
  ...generalFormula,
  id: 'scope-neutral-general',
  scope: 'general',
}

const scopeNeutralRanked = rankOperationalFormulas(
  [scopeNeutralPersonal, scopeNeutralGeneral],
  context
)

assert.equal(
  scopeNeutralRanked[0].score,
  scopeNeutralRanked[1].score,
  'Scope may govern access but must not independently increase contextual success rank.'
)

const tinyPerfectSample = {
  ...generalFormula,
  id: 'tiny-perfect-sample',
  confidence: 0.7,
  sampleCount: 1,
  successCount: 1,
  contradictionCount: 0,
}

const establishedStrongSample = {
  ...generalFormula,
  id: 'established-strong-sample',
  confidence: 0.7,
  sampleCount: 20,
  successCount: 16,
  contradictionCount: 0,
}

const evidenceRanked = rankOperationalFormulas(
  [tinyPerfectSample, establishedStrongSample],
  context
)

assert.equal(
  evidenceRanked[0].formula.id,
  establishedStrongSample.id,
  'One successful execution must not automatically outrank a strong, substantially better-established execution record.'
)

const contradictionLight = {
  ...generalFormula,
  id: 'contradiction-light',
  confidence: 0.8,
  sampleCount: 12,
  successCount: 8,
  contradictionCount: 0,
}

const contradictionHeavy = {
  ...contradictionLight,
  id: 'contradiction-heavy',
  contradictionCount: 6,
}

const contradictionRanked = rankOperationalFormulas(
  [contradictionHeavy, contradictionLight],
  context
)

assert.equal(
  contradictionRanked[0].formula.id,
  contradictionLight.id,
  'Repeated contradictions should exert bounded downward pressure without invalidating the Formula.'
)

assert.ok(
  contradictionRanked[1].score > 0,
  'Contradictions must weaken contextual rank rather than automatically declare a Formula unusable.'
)

const selected = applyOperationalMemoryRetrievalPolicy(ranked)

assert.equal(
  selected.length,
  1,
  'Runtime evidence policy may narrow canonically ranked formulas using its independent evidence-injection threshold.'
)
assert.equal(selected[0].formula.id, personalFormula.id)

assert.equal(
  ranked.length,
  2,
  'Canonical contextual-success ranking must retain eligible alternatives independently of runtime evidence filtering.'
)

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
  /createGovernedInvocationContractV1\(\{[\s\S]*?operationalMemoryEvidence,/,
  'Governed operational-memory evidence must enter the canonical invocation contract.'
)

assert.match(
  route,
  /resolveGeorgeRuntimePipeline\(governedInvocation\)/,
  'The canonical invocation contract must transport operational-memory evidence into the runtime pipeline.'
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
