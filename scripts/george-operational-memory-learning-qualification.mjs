import assert from 'node:assert/strict'
import {
  createDefaultOperationalFormulaReassessmentEngine,
} from '../lib/george/operational-memory/default-formula-reassessment-engine.ts'

const engine = createDefaultOperationalFormulaReassessmentEngine()

const conversation = {
  id: 'conversation-1',
}

const formula = {
  id: 'formula-1',
  version: 1,
  confidence: 0.76,
  evidence: [],
}

function execution(overrides = {}) {
  return {
    id: 'execution-1',
    outcomes: [],
    deviations: [],
    ...overrides,
  }
}

async function reassess(scriptExecution, formulaOverrides = {}) {
  return engine.reassess({
    formula: {
      ...formula,
      ...formulaOverrides,
    },
    conversation,
    scriptExecution,
  })
}

const withoutExecution = await reassess(undefined)

assert.equal(
  withoutExecution.decision,
  'insufficient_evidence',
  'Missing execution evidence must not confirm or weaken a formula.'
)
assert.equal(withoutExecution.confidenceBefore, formula.confidence)
assert.equal(
  withoutExecution.confidenceAfter,
  withoutExecution.confidenceBefore,
  'Reassessment must not duplicate validator-owned confidence evolution.'
)

const completedWithoutSignals = await reassess(execution())

assert.equal(
  completedWithoutSignals.decision,
  'confirm',
  'An execution without outcomes or deviations should remain confirmable.'
)
assert.equal(
  completedWithoutSignals.confidenceAfter,
  completedWithoutSignals.confidenceBefore,
  'Confirmation must record the decision without recalculating confidence.'
)

const positiveExecution = await reassess(
  execution({
    outcomes: [{ id: 'outcome-1' }],
    deviations: [],
  })
)

assert.equal(
  positiveExecution.decision,
  'confirm',
  'Outcomes meeting or exceeding deviations must confirm the formula.'
)
assert.equal(
  positiveExecution.confidenceAfter,
  positiveExecution.confidenceBefore,
  'Positive reassessment must preserve validator-owned confidence.'
)

const negativeExecution = await reassess(
  execution({
    outcomes: [],
    deviations: [{ id: 'deviation-1' }],
  })
)

assert.equal(
  negativeExecution.decision,
  'weaken',
  'Deviations exceeding outcomes must weaken the formula.'
)
assert.equal(
  negativeExecution.confidenceAfter,
  negativeExecution.confidenceBefore,
  'Negative reassessment must preserve validator-owned confidence.'
)

const upperBoundary = await reassess(
  execution({
    outcomes: [{ id: 'outcome-upper' }],
  }),
  {
    confidence: 1,
  }
)

const lowerBoundary = await reassess(
  execution({
    deviations: [{ id: 'deviation-lower' }],
  }),
  {
    confidence: 0,
  }
)

for (const reassessment of [
  withoutExecution,
  completedWithoutSignals,
  positiveExecution,
  negativeExecution,
  upperBoundary,
  lowerBoundary,
]) {
  assert.ok(
    reassessment.confidenceAfter >= 0 &&
      reassessment.confidenceAfter <= 1,
    'Recorded confidence must remain inside the canonical 0..1 range.'
  )

  assert.ok(
    [
      'confirm',
      'weaken',
      'insufficient_evidence',
    ].includes(reassessment.decision),
    'The default engine must generate only decisions supported by current evidence rules.'
  )
}

console.log(
  'GEORGE operational memory learning qualification passed',
  {
    insufficientEvidenceDecision: withoutExecution.decision,
    confirmationDecision: positiveExecution.decision,
    weakeningDecision: negativeExecution.decision,
    confidenceAuthority: 'formula_validator',
  }
)
