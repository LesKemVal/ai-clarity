import assert from 'node:assert/strict'
import { buildPreparationVoiceCommunication, createConversationalBriefingTurn } from '../lib/george/preparation/runtime.mjs'

const draft = createConversationalBriefingTurn({
  modality: 'voice',
  transcript: 'I am interviewing tomorrow.',
  desiredOutcome: 'win the interview',
  conversationPackage: {
    conversationType: 'interview',
    relevantDocumentation: [{ id: 'resume', title: 'Software resume', type: 'resume' }],
  },
}).briefingDraft

const high = buildPreparationVoiceCommunication({ speechConfidence: 0.94, transcript: 'I am interviewing tomorrow.', briefingDraft: draft })
assert.equal(high.confidence, 'high')
assert.equal(high.shouldClarify, false)
assert.match(high.message, /found|missing/i)

const medium = buildPreparationVoiceCommunication({ speechConfidence: 0.64, transcript: 'meeting Acme tomorrow', briefingDraft: draft })
assert.equal(medium.confidence, 'medium')
assert.equal(medium.shouldClarify, true)
assert.match(medium.message, /Is that right/i)

const low = buildPreparationVoiceCommunication({ speechConfidence: 0.22, backgroundNoise: true, transcript: 'Acme', briefingDraft: draft })
assert.equal(low.confidence, 'low')
assert.equal(low.shouldClarify, true)
assert.match(low.message, /background noise/i)

const compensated = buildPreparationVoiceCommunication({ speechConfidence: 0.95, transcript: 'I do not remember the revenue numbers', assessment: { informationUnavailable: true }, briefingDraft: { assets: [], missingSignals: [] } })
assert.equal(compensated.shouldClarify, false)
assert.match(compensated.message, /prepare around|information/i)
assert.doesNotMatch(compensated.message, /revenue|\$[0-9]/i)

console.log('GEORGE preparation voice communication qualification passed', {
  sharedPreparationRuntime: true,
  conciseExplanation: true,
  highConfidenceProceed: true,
  mediumConfidenceConfirmation: true,
  lowConfidenceClarification: true,
  missingInformationCompensated: true,
  liveBehaviorUntouched: true,
})
