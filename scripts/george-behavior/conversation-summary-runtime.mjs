import assert from 'node:assert'
import { summarizeConversation } from '../../lib/george/conversation-summary/runtime.mjs'

export function run() {
  const summary = summarizeConversation(
    {
      conversationPackage: {
        id: 'acme-investor-package',
        desiredOutcome: 'secure a second investor meeting',
        relevantDocumentation: [
          { id: 'deck', title: 'Pitch deck' },
          { id: 'metrics', title: 'Retention metrics' },
        ],
      },
      liveResult: {
        outcome: 'Investor requested retention proof and agreed to review follow-up materials.',
        transcript: 'The investor asked about retention and customer acquisition cost. The founder anchored value first and offered retention metrics.',
        signals: [
          'Investor concern focused on retention risk.',
          'Follow-up materials requested.',
        ],
        nextSuggestedAction: 'Follow up with the materials or confirmation needed to keep the outcome moving.',
      },
    },
    {
      id: 'summary-acme-1',
      timestamp: '2026-06-30T13:00:00.000Z',
    }
  )

  assert.equal(summary.id, 'summary-acme-1')
  assert.equal(summary.source, 'conversation-summary-runtime')
  assert.equal(summary.desiredOutcome, 'secure a second investor meeting')
  assert.equal(
    summary.outcome,
    'Investor requested retention proof and agreed to review follow-up materials.'
  )

  assert(
    summary.summary.includes('Desired outcome: secure a second investor meeting'),
    'Summary should preserve desired outcome.'
  )

  assert(
    summary.evidenceCandidates.some((candidate) => candidate.type === 'outcome'),
    'Summary Runtime should produce outcome evidence candidates.'
  )

  assert(
    summary.evidenceCandidates.some((candidate) => candidate.type === 'signal'),
    'Summary Runtime should produce signal evidence candidates.'
  )

  assert(
    summary.evidenceCandidates.some((candidate) => candidate.type === 'documentation'),
    'Summary Runtime should preserve documentation as evidence candidates.'
  )

  assert.equal(
    summary.suggestedNextAction,
    'Follow up with the materials or confirmation needed to keep the outcome moving.'
  )

  assert.equal(summary.createdAt, '2026-06-30T13:00:00.000Z')

  return true
}
