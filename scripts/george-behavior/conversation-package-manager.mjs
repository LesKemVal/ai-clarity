import assert from 'node:assert'
import {
  attachDocumentation,
  attachLearning,
  attachLiveSummary,
  completeConversationPackage,
  CONVERSATION_PACKAGE_STATUS,
  createConversationPackage,
  mergeConversationPackages,
  trackOutcomeProgression,
  updateConversationPackage,
} from '../../lib/george/conversation-packages/index.mjs'

export function run() {
  const pkg = createConversationPackage(
    {
      id: 'acme-series-a',
      desiredOutcome: 'secure investor follow-up for Acme Series A',
      conversationType: 'Investor Meeting',
      conversationContext: 'partner meeting about traction and retention',
      relevantDocumentation: ['Pitch deck'],
    },
    { timestamp: '2026-06-30T12:00:00.000Z' }
  )

  assert.equal(pkg.status, CONVERSATION_PACKAGE_STATUS.ACTIVE)
  assert.equal(pkg.events[0].type, 'conversation_package_created')

  const withDocumentation = attachDocumentation(
    pkg,
    ['Pitch deck', 'Retention metrics'],
    { timestamp: '2026-06-30T12:01:00.000Z' }
  )

  assert.deepEqual(
    withDocumentation.relevantDocumentation,
    ['Pitch deck', 'Retention metrics'],
    'Documentation should attach to the same Conversation Package without duplicating existing documents.'
  )

  const withSummary = attachLiveSummary(
    withDocumentation,
    { id: 'live-1', outcome: 'investor requested retention proof' },
    { timestamp: '2026-06-30T12:02:00.000Z' }
  )

  assert.equal(
    withSummary.liveSummaries.length,
    1,
    'LIVE summaries should attach to the Conversation Package as operational assets.'
  )

  const withLearning = attachLearning(
    withSummary,
    { id: 'learning-1', evidence: 'retention proof improved investor confidence', confidence: 0.74 },
    { timestamp: '2026-06-30T12:03:00.000Z' }
  )

  assert.equal(
    withLearning.learning.length,
    1,
    'Learning should attach to the package rather than becoming independent operational state.'
  )

  const withProgress = trackOutcomeProgression(
    withLearning,
    { state: 'follow_up_requested', evidence: 'investor asked for retention metrics' },
    { timestamp: '2026-06-30T12:04:00.000Z' }
  )

  assert.equal(
    withProgress.outcomeProgression[0].state,
    'follow_up_requested',
    'Outcome progression should remain attached to the Conversation Package.'
  )

  const updated = updateConversationPackage(
    withProgress,
    { conversationWith: 'Acme Ventures partner' },
    { timestamp: '2026-06-30T12:05:00.000Z' }
  )

  assert.equal(updated.conversationWith, 'Acme Ventures partner')

  const related = createConversationPackage(
    {
      id: 'acme-diligence',
      desiredOutcome: 'answer investor diligence questions',
      relevantDocumentation: ['Diligence checklist'],
      liveSummaries: [{ id: 'live-2', outcome: 'diligence questions collected' }],
    },
    { timestamp: '2026-06-30T12:06:00.000Z' }
  )

  const merged = mergeConversationPackages(
    updated,
    [related],
    { timestamp: '2026-06-30T12:07:00.000Z' }
  )

  assert.deepEqual(
    merged.relevantDocumentation,
    ['Pitch deck', 'Retention metrics', 'Diligence checklist'],
    'Merged packages should preserve documentation on the primary package without duplicate operational containers.'
  )

  assert.deepEqual(
    merged.mergedPackageIds,
    ['acme-diligence'],
    'Related packages should be tracked by id after merge.'
  )

  const completed = completeConversationPackage(
    merged,
    { result: 'follow-up secured' },
    { timestamp: '2026-06-30T12:08:00.000Z' }
  )

  assert.equal(completed.status, CONVERSATION_PACKAGE_STATUS.COMPLETED)
  assert.equal(completed.completion.result, 'follow-up secured')

  return true
}
