import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'george-executed-formula-learning-')
)

const serverOnlyStub = path.join(directory, 'server-only.ts')
const qualification = path.join(directory, 'qualification.mts')
const tsconfig = path.join(directory, 'tsconfig.json')

fs.writeFileSync(serverOnlyStub, 'export {}\n')

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
import assert from 'node:assert/strict'
import {
  createDefaultOperationalFormulaReassessmentEngine,
} from '${path.resolve(
    'lib/george/operational-memory/default-formula-reassessment-engine.ts'
  )}'

const engine = createDefaultOperationalFormulaReassessmentEngine()

const formula = {
  id: 'formula-executed',
  version: 1,
  scope: 'personal',
  ownerId: 'user-1',
  roomTypes: ['LIVE'],
  objectiveTypes: ['close'],
  prerequisites: [],
  steps: [],
  failureConditions: [],
  confidence: 0.7,
  sampleCount: 1,
  successCount: 0,
  contradictionCount: 0,
  unknownCount: 0,
  reuseCount: 1,
  evidence: [],
  createdAt: 1,
  updatedAt: 1,
} as const

function conversation(achieved?: boolean) {
  return {
    id: 'conversation-1',
    userId: 'user-1',
    startedAt: 1,
    participants: [],
    signals: [],
    interventions: [],
    outcomes:
      achieved === undefined
        ? []
        : [
            {
              type: 'desired_outcome',
              achieved,
              confidence: 0.9,
            },
          ],
    formulaExecution: {
      formulaId: formula.id,
      formulaVersion: formula.version,
      source: 'george',
    },
  }
}

const confirmed = await engine.reassess({
  formula,
  conversation: conversation(true),
})

assert.equal(
  confirmed.decision,
  'confirm',
  'successful recorded outcome must confirm the matching executed formula'
)

const weakened = await engine.reassess({
  formula,
  conversation: conversation(false),
})

assert.equal(
  weakened.decision,
  'weaken',
  'unsuccessful recorded outcome must weaken the matching executed formula'
)

const insufficient = await engine.reassess({
  formula,
  conversation: conversation(),
})

assert.equal(
  insufficient.decision,
  'insufficient_evidence',
  'matching execution without outcomes must remain insufficient evidence'
)

const mismatch = await engine.reassess({
  formula,
  conversation: {
    ...conversation(true),
    formulaExecution: {
      formulaId: formula.id,
      formulaVersion: 2,
      source: 'george',
    },
  },
})

assert.equal(
  mismatch.decision,
  'insufficient_evidence',
  'a mismatched formula version must not be reassessed as executed'
)

console.log('GEORGE executed formula learning qualification passed')
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
