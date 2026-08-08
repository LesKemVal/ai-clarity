import assert from 'node:assert/strict'
import { prepareConversationFromPackage } from '../lib/george/preparation/runtime.mjs'

const existing = prepareConversationFromPackage({
  desiredOutcome: 'win the interview',
  conversationPackage: {
    desiredOutcome: 'win the interview',
    conversationType: 'interview',
    relevantDocumentation: [{ id: 'resume-v3', title: 'Software Engineering resume', type: 'resume' }],
    formulaSelection: { formulaId: 'interview-formula', formulaVersion: 2 },
    scripts: [{ id: 'opening-script', name: 'Interview opening' }],
  },
})
assert.equal(existing.assetDiscovery.confirmationRequired, true)
assert.deepEqual(existing.assetDiscovery.missing, ['Job description'])
assert.deepEqual(
  existing.assetDiscovery.existing.map((item) => item.type),
  ['resume'],
)
assert.match(existing.optionalQuestion || '', /document|proof|stronger|outcome|conversation/i)

const missing = prepareConversationFromPackage({
  desiredOutcome: 'raise capital',
  conversationPackage: {
    desiredOutcome: 'raise capital',
    conversationType: 'investor meeting',
    relevantDocumentation: [],
  },
})
assert.equal(missing.assetDiscovery.confirmationRequired, false)
assert.equal(missing.assetDiscovery.existing.length, 0)
assert.equal(missing.assetDiscovery.missing.length, 3)
assert.ok(missing.optionalQuestion, 'Missing operational signal should produce a truthful next question.')

const update = prepareConversationFromPackage({
  desiredOutcome: 'improve the proposal',
  conversationPackage: {
    desiredOutcome: 'improve the proposal',
    relevantDocumentation: [{ id: 'proposal-v1', title: 'Proposal v1' }],
  },
  relevantDocumentation: [{ id: 'proposal-v2', title: 'Proposal v2' }],
})
assert.equal(update.assetDiscovery.confirmationRequired, true)
assert.equal(update.assetDiscovery.existing.length, 2)
assert.deepEqual(
  update.assetDiscovery.existing.map((item) => item.id),
  ['proposal-v2', 'proposal-v1'],
  'The relevant current asset is presented without overwriting it silently.',
)

console.log('GEORGE operational asset discovery qualification passed', {
  existingAssetsPresented: existing.assetDiscovery.existing.length,
  missingSignalRequest: missing.assetDiscovery.missing.length === 3,
  updateVersionsPresented: update.assetDiscovery.existing.length,
})
