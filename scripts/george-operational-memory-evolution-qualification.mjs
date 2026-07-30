import assert from 'node:assert/strict'
import {
  createDefaultOperationalFormulaEvolutionEngine,
} from '../lib/george/operational-memory/default-formula-evolution-engine.ts'

const engine = createDefaultOperationalFormulaEvolutionEngine()

const formula = {
  id: 'formula-1',
  version: 1,
  confidence: 0.64,
  evidence: [],
}

const conversation = {
  id: 'conversation-1',
}

function reassessment(decision) {
  return {
    id: `reassessment-${decision}`,
    formulaId: formula.id,
    formulaVersion: formula.version,
    conversationId: conversation.id,
    decision,
    confidenceBefore: formula.confidence,
    confidenceAfter: formula.confidence,
    evidence: formula.evidence,
    reasons: [`decision:${decision}`],
    assessedAt: Date.now(),
  }
}

for (const decision of [
  'confirm',
  'insufficient_evidence',
  'weaken',
]) {
  const result = await engine.evolve({
    formula,
    conversation,
    reassessment: reassessment(decision),
  })

  assert.deepEqual(
    result,
    {},
    `${decision} must not create a structurally unchanged derived formula.`
  )
}

console.log(
  'GEORGE operational memory evolution qualification passed',
  {
    passiveDecisions: [
      'confirm',
      'insufficient_evidence',
      'weaken',
    ],
    derivationAuthority: 'structural_evolution_only',
  }
)
