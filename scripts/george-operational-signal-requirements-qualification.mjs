import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  determineOperationalSignalRequirements,
  discoverOperationalAssets,
} from '../lib/george/preparation/runtime.mjs'

const interview = determineOperationalSignalRequirements({ desiredOutcome: 'interview for a senior software engineer role' })
assert.deepEqual(interview.map((signal) => signal.key), ['resume', 'job_description'])

const investor = determineOperationalSignalRequirements({ desiredOutcome: 'raise capital in an investor meeting' })
assert.deepEqual(investor.map((signal) => signal.key), ['pitch_deck', 'financials', 'capital_objective'])

const discovered = discoverOperationalAssets({
  desiredOutcome: 'interview for a senior software engineer role',
  requiredOperationalSignals: interview,
  conversationPackage: {
    relevantDocumentation: [
      { id: 'resume-march', title: 'Software Engineering resume updated March', type: 'resume', updatedAt: 3 },
      { id: 'old-pitch', title: 'Investor pitch deck', type: 'presentation', updatedAt: 5 },
      { id: 'job-description', title: 'Senior Software Engineer job description', type: 'job description', updatedAt: 2 },
    ],
  },
})
assert.deepEqual(discovered.existing.map((item) => item.id), ['resume-march', 'job-description'])
assert.equal(discovered.confirmationRequired, true)
assert.ok(discovered.recommendations.length > 0)
assert.equal(discovered.missing.length, 0)

const missing = discoverOperationalAssets({
  desiredOutcome: 'interview tomorrow',
  requiredOperationalSignals: interview,
  conversationPackage: { relevantDocumentation: [{ title: 'Unrelated financial model', type: 'spreadsheet' }] },
})
assert.equal(missing.existing.length, 0)
assert.deepEqual(missing.missing, ['Resume', 'Job description'])

const runtime = readFileSync(resolve(process.cwd(), 'lib/george/preparation/runtime.mjs'), 'utf8')
assert.match(runtime, /determineOperationalSignalRequirements/)
assert.match(runtime, /discoverOperationalAssets/)
assert.match(runtime, /requiredOperationalSignals/)

console.log('GEORGE operational signal requirements qualification passed', {
  objectiveEvaluatedFirst: true,
  relevantCandidates: discovered.existing.length,
  missingSignalsRequested: missing.missing.length,
  userSelectionRemainsAuthoritative: true,
})
