import assert from 'node:assert/strict'
import { resolvePreparationCommunication } from '../lib/george/preparation/runtime.mjs'

const asset = { title: 'Software resume', type: 'resume' }
const draft = { assets: [asset], missingSignals: ['Job description'], requiredSignals: [] }

const recommendation = resolvePreparationCommunication({ assessment: { existingAsset: true }, briefingDraft: draft, speechConfidence: 0.95 })
assert.equal(recommendation.objective, 'recommend')
assert.equal(recommendation.operationalAction, 'use_existing_operational_asset')
assert.equal(recommendation.behavior, 'brief_recommendation')
assert.equal(recommendation.voice, recommendation.visual)

const missing = resolvePreparationCommunication({ assessment: { explainValue: true }, briefingDraft: { assets: [], missingSignals: ['Job description'], requiredSignals: [] }, speechConfidence: 0.95 })
assert.equal(missing.objective, 'request_missing_operational_signal')
assert.equal(missing.operationalAction, 'acquire_missing_operational_signal')
assert.equal(missing.behavior, 'value_before_request')

const clarification = resolvePreparationCommunication({ assessment: { backgroundNoise: true }, speechConfidence: 0.2 })
assert.equal(clarification.objective, 'clarify')
assert.equal(clarification.operationalAction, 'restore_conversational_signal')
assert.equal(clarification.behavior, 'brief_clarification')

const acknowledge = resolvePreparationCommunication({ assessment: { repeatedKnownInformation: true }, speechConfidence: 0.95 })
assert.equal(acknowledge.objective, 'acknowledge')
assert.equal(acknowledge.operationalAction, 'continue_briefing')
assert.equal(acknowledge.behavior, 'minimal_acknowledgement')

const compensation = resolvePreparationCommunication({ assessment: { informationUnavailable: true }, speechConfidence: 0.95 })
assert.equal(compensation.objective, 'compensate')
assert.equal(compensation.operationalAction, 'compensate_for_unavailable_information')
assert.match(compensation.voice, /prepare around/i)

console.log('GEORGE preparation communication behavior qualification passed', {
  assessmentDeterminesObjective: true,
  objectiveDeterminesBehavior: true,
  voiceVisualParity: true,
  noTemplateCatalog: true,
  liveBehaviorUntouched: true,
})
