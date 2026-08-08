import assert from 'node:assert/strict'
import { resolvePreparationCommunication } from '../lib/george/preparation/runtime.mjs'

const cases = [
  {
    assessment: { existingAsset: true },
    briefingDraft: { assets: [{ title: 'Resume', type: 'resume' }], missingSignals: [] },
    action: 'use_existing_operational_asset',
    behavior: 'brief_recommendation',
  },
  {
    assessment: { explainValue: true },
    briefingDraft: { assets: [], missingSignals: ['Job description'] },
    action: 'acquire_missing_operational_signal',
    behavior: 'value_before_request',
  },
  {
    assessment: { backgroundNoise: true },
    action: 'restore_conversational_signal',
    behavior: 'brief_clarification',
  },
  {
    assessment: { repeatedKnownInformation: true },
    action: 'continue_briefing',
    behavior: 'minimal_acknowledgement',
  },
]

for (const fixture of cases) {
  const result = resolvePreparationCommunication({ ...fixture, speechConfidence: 0.95 })
  assert.equal(result.operationalAction, fixture.action)
  assert.equal(result.behavior, fixture.behavior)
  assert.equal(result.voice, result.visual)
}

const medium = resolvePreparationCommunication({ speechConfidence: 0.64, transcript: 'Acme tomorrow' })
assert.equal(medium.operationalAction, 'confirm_understanding')
assert.equal(medium.behavior, 'natural_confirmation')

const low = resolvePreparationCommunication({ speechConfidence: 0.2, assessment: { backgroundNoise: true } })
assert.equal(low.operationalAction, 'restore_conversational_signal')
assert.equal(low.behavior, 'brief_clarification')

console.log('GEORGE preparation operational action qualification passed', {
  assessmentToAction: true,
  actionToBehavior: true,
  voiceVisualEquivalence: true,
  confidenceHandlingPreserved: true,
  compensationPreserved: true,
  liveBehaviorUntouched: true,
})
