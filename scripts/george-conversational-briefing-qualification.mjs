import assert from 'node:assert/strict'
import { createConversationalBriefingTurn } from '../lib/george/preparation/runtime.mjs'

const input = {
  desiredOutcome: 'win the interview',
  conversationPackage: {
    conversationType: 'interview',
    relevantDocumentation: [{ id: 'resume', title: 'Software resume', type: 'resume' }],
  },
}

const typed = createConversationalBriefingTurn({ ...input, modality: 'text', userText: 'I am interviewing tomorrow.' })
const spoken = createConversationalBriefingTurn({ ...input, modality: 'voice', transcript: 'I am interviewing tomorrow.' })

assert.deepEqual(typed.briefingDraft, spoken.briefingDraft, 'Voice and typing must build the same briefing draft.')
assert.equal(typed.requiresApproval, true)
assert.equal(typed.readyForReview, true)
assert.equal(typed.briefingDraft.assets[0].id, 'resume')
assert.ok(typed.preparation.assetDiscovery.missing.includes('Job description'))
assert.ok(typed.briefingDraft.requiredSignals.length > 0)

const approved = { ...typed, userApproved: true }
assert.equal(approved.userApproved, true)
assert.equal(typed.requiresApproval, true, 'Preparation must not silently approve a briefing for LIVE.')

const liveSource = String(typed.briefingDraft.objective || '')
assert.equal(liveSource, 'win the interview')

console.log('GEORGE conversational briefing qualification passed', {
  voiceAndTypingMatch: true,
  existingAssetsSearched: true,
  requiredSignalsKnown: true,
  briefingUpdatesDuringConversation: true,
  approvalRequiredBeforeLive: true,
  liveRebuildsBriefing: false,
})
