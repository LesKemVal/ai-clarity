import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'george-working-formula-hypothesis-')
)

const serverOnlyStub = path.join(directory, 'server-only.ts')
const qualification = path.join(directory, 'qualification.mts')
const tsconfig = path.join(directory, 'tsconfig.json')

fs.writeFileSync(serverOnlyStub, 'export {}' + String.fromCharCode(10))

fs.writeFileSync(
  tsconfig,
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        allowImportingTsExtensions: true,
        paths: {
          'server-only': [serverOnlyStub],
        },
      },
    },
    null,
    2
  )
)

fs.writeFileSync(
  qualification,
  `
import { createOperationalMemory } from '${path.resolve(
    'lib/george/operational-memory/operational-memory.ts'
  )}'

import assert from 'node:assert/strict'


function makeFormulaLibrary(retrieved = []) {
  const saved = []

  return {
    saved,

    library: {
      async retrieve() {
        return retrieved
      },

      async getById() {
        return null
      },

      async save(formula) {
        saved.push(formula)
      },

      async delete() {},

      async listByOwner() {
        return []
      },

      async listAccessible() {
        return []
      },
    },
  }
}

const existingFormula = {
  id: 'existing-relevant-formula',
  version: 1,
  scope: 'personal',
  ownerId: 'user@example.com',
  name: 'Existing relevant strategy',
  visibility: 'private',
  status: 'validated',
  origin: 'observed',
  roomTypes: ['job_interview'],
  objectiveTypes: ['secure_offer'],
  prerequisites: [],
  steps: [
    {
      signalType: 'experience_question',
      actionType: 'connect_relevant_experience',
      expectedTransition: 'fit_understood',
    },
  ],
  failureConditions: [],
  confidence: 0.9,
  sampleCount: 4,
  successCount: 3,
  contradictionCount: 0,
  unknownCount: 1,
  reuseCount: 2,
  evidence: [],
  createdAt: 1,
  updatedAt: 1,
}

{
  const store = makeFormulaLibrary([
    {
      formula: existingFormula,
      score: 0.82,
      reasons: ['strong_existing_match'],
    },
  ])

  let synthesisCount = 0

  const memory = createOperationalMemory({
    formulaLibrary: store.library,
    strategySynthesizer: async () => {
      synthesisCount += 1
      return {
        name: 'Should never be created',
        steps: [
          {
            signalType: 'unused',
            actionType: 'unused',
            expectedTransition: 'unused',
          },
        ],
      }
    },
  })

  const result = await memory.recommend({
    userId: 'user@example.com',
    roomType: 'job_interview',
    objectiveType: 'secure_offer',
    observedSignalTypes: ['experience_question'],
    briefingComplete: true,
    preparationContext: {
      desiredOutcome: 'Secure the stocking position',
    },
  })

  assert.equal(
    result.recommendedFormula?.formula.id,
    existingFormula.id,
    'A sufficiently relevant existing Formula must remain authoritative over hypothesis creation.',
  )

  assert.equal(
    synthesisCount,
    0,
    'Strategy synthesis must not run when a sufficiently relevant Formula exists.',
  )

  assert.equal(
    store.saved.length,
    0,
    'No hypothesis Formula may be persisted when an existing Formula qualifies.',
  )
}

{
  const store = makeFormulaLibrary([])

  let synthesisCount = 0

  const memory = createOperationalMemory({
    formulaLibrary: store.library,
    strategySynthesizer: async () => {
      synthesisCount += 1

      return {
        name: 'Premature strategy',
        steps: [
          {
            signalType: 'partial_context',
            actionType: 'act_too_early',
            expectedTransition: 'premature_commitment',
          },
        ],
      }
    },
  })

  const result = await memory.recommend({
    userId: 'user@example.com',
    roomType: 'job_interview',
    objectiveType: 'secure_offer',
    observedSignalTypes: [],
    briefingComplete: false,
    preparationContext: {
      desiredOutcome: 'Secure the stocking position',
    },
  })

  assert.equal(
    synthesisCount,
    0,
    'An incomplete briefing must not synthesize a persisted Formula hypothesis.',
  )

  assert.equal(
    store.saved.length,
    0,
    'An incomplete briefing must not persist a Formula hypothesis.',
  )

  assert.equal(
    result.recommendedFormula,
    null,
    'An incomplete briefing with no qualifying Formula must remain unresolved.',
  )
}

{
  const weakFormula = {
    ...existingFormula,
    id: 'weak-existing-formula',
  }

  const store = makeFormulaLibrary([
    {
      formula: weakFormula,
      score: 0.49,
      reasons: ['below_policy_threshold'],
    },
  ])

  let synthesisCount = 0

  const memory = createOperationalMemory({
    formulaLibrary: store.library,
    strategySynthesizer: async () => {
      synthesisCount += 1

      return {
        name: 'Demonstrate stocking fit through relevant execution evidence',
        bestUsedFor: ['Stocking position interview'],
        prerequisites: ['Role expectations are understood'],
        steps: [
          {
            signalType: 'experience_question',
            actionType: 'connect_relevant_experience',
            expectedTransition: 'fit_understood',
          },
          {
            signalType: 'reliability_question',
            actionType: 'demonstrate_reliability',
            expectedTransition: 'execution_confidence_increased',
          },
        ],
        failureConditions: [
          'The employer signals a materially different role requirement',
        ],
      }
    },
  })

  const result = await memory.recommend({
    userId: 'user@example.com',
    roomType: 'job_interview',
    objectiveType: 'secure_offer',
    observedSignalTypes: ['experience_question'],
    briefingComplete: true,
    preparationContext: {
      role: 'candidate',
      desiredOutcome: 'Secure the stocking position',
      conversationContext: 'Interview for a stocking role',
      audience: 'Hiring manager',
      knownFacts: [
        'The position involves stocking responsibilities',
      ],
    },
  })

  assert.equal(
    synthesisCount,
    1,
    'A genuine retrieval miss must request exactly one working strategy synthesis.',
  )

  assert.equal(
    store.saved.length,
    1,
    'A synthesized working strategy must persist exactly one Formula hypothesis.',
  )

  const formula = store.saved[0]

  assert.equal(formula.scope, 'personal')
  assert.equal(formula.ownerId, 'user@example.com')
  assert.equal(formula.visibility, 'private')
  assert.equal(formula.status, 'candidate')
  assert.equal(formula.origin, 'hypothesis')
  assert.equal(formula.sampleCount, 0)
  assert.equal(formula.successCount, 0)
  assert.deepEqual(formula.evidence, [])

  assert.equal(
    result.recommendedFormula?.formula.id,
    formula.id,
    'The newly persisted hypothesis must become the working recommendation.',
  )

  assert.deepEqual(
    result.recommendedFormula?.reasons,
    ['working_hypothesis'],
  )

  assert.equal(
    result.recommendedScript,
    null,
    'Pre-execution hypothesis creation must not generate a Script.',
  )
}

{
  const store = makeFormulaLibrary([])

  let synthesisCount = 0

  const memory = createOperationalMemory({
    formulaLibrary: store.library,
    strategySynthesizer: async () => {
      synthesisCount += 1
      return null
    },
  })

  const result = await memory.recommend({
    userId: 'user@example.com',
    roomType: 'job_interview',
    objectiveType: 'secure_offer',
    observedSignalTypes: [],
    briefingComplete: true,
    preparationContext: {
      desiredOutcome: 'Secure the stocking position',
    },
  })

  assert.equal(
    synthesisCount,
    1,
    'A completed briefing with no qualifying Formula must attempt strategy synthesis.',
  )

  assert.equal(
    store.saved.length,
    0,
    'Null strategy synthesis must not persist a Formula hypothesis.',
  )

  assert.equal(
    result.recommendedFormula,
    null,
    'Null strategy synthesis must preserve the no-recommendation degradation state.',
  )

  assert.equal(
    result.recommendedScript,
    null,
    'Null strategy synthesis must not create or select a Script.',
  )

  assert.equal(
    result.recommendationSummary,
    'GEORGE is preparing the strongest strategy from the briefing.',
    'Null strategy synthesis must preserve the completed-briefing degradation message.',
  )

  assert.equal(
    result.reviewRequired,
    false,
    'Null strategy synthesis must not require Formula review when no Formula exists.',
  )
}


console.log('GEORGE working Formula hypothesis qualification passed', {
  existingRelevantFormulaSuppressesSynthesis: true,
  incompleteBriefingSuppressesSynthesis: true,
  belowThresholdTriggersSynthesis: true,
  privateCandidatePersisted: true,
  scriptCreationSuppressed: true,
  synthesisNullDegradesWithoutPersistence: true,
})

`
)

try {
  execFileSync(
    'npx',
    [
      'tsx',
      '--tsconfig',
      tsconfig,
      qualification,
    ],
    {
      cwd: process.cwd(),
      stdio: 'inherit',
    }
  )
} finally {
  fs.rmSync(directory, {
    recursive: true,
    force: true,
  })
}
