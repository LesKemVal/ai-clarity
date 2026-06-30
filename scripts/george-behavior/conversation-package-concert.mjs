import assert from 'node:assert'
import {
  prepareConversation,
  updateAfterLive,
} from '../../lib/george/conversation-packages/index.mjs'

export function run() {
  const prepared = prepareConversation(
    {
      setup: {
        objective: 'secure a second investor meeting',
        room: 'Investor Meeting',
        knownContext: 'The investor will likely ask about retention, customer acquisition cost, and proof of traction.',
        responsibility: 'Founder presenting traction and asking for follow-up.',
        conversationWith: 'Investor partner',
        supportStyle: 'cue',
        steeringPhrases: ['anchor value', 'ask why'],
        resources: [
          { id: 'deck', title: 'Pitch deck', type: 'pdf' },
          { id: 'metrics', title: 'Retention metrics', type: 'spreadsheet' },
        ],
      },
    },
    [],
    {
      id: 'acme-investor-package',
      conversationId: 'live-entry-investor-1',
      timestamp: '2026-06-30T12:00:00.000Z',
    }
  )

  assert.equal(
    prepared.decision,
    'new_conversation_package',
    'Concert flow should create a package when no prior package exists.'
  )

  assert.equal(
    prepared.package.id,
    'acme-investor-package',
    'LIVE Entry setup should resolve into a Conversation Package.'
  )

  assert.equal(
    prepared.package.conversations[0].source,
    'live-entry',
    'LIVE Entry should become the first conversation event in the package.'
  )

  assert.deepEqual(
    prepared.package.relevantDocumentation.map((item) => item.title),
    ['Pitch deck', 'Retention metrics'],
    'Relevant Documentation should attach during preparation.'
  )

  const afterLive = updateAfterLive(
    prepared.package,
    {
      summary: {
        id: 'summary-investor-1',
        outcome: 'Investor asked for retention proof and agreed to review follow-up materials.',
        nextSuggestedAction: 'Send retention metrics and ask for a second meeting.',
      },
      outcomeProgression: {
        state: 'follow_up_materials_requested',
        evidence: 'Investor requested retention proof.',
      },
      learning: {
        id: 'learning-investor-1',
        evidence: 'Anchoring retention before acquisition cost improved investor confidence.',
        confidence: 0.72,
        candidate: true,
      },
    },
    { timestamp: '2026-06-30T12:10:00.000Z' }
  )

  assert.equal(
    afterLive.liveSummaries.length,
    1,
    'LIVE summary should attach to the package after LIVE.'
  )

  assert.equal(
    afterLive.outcomeProgression[0].state,
    'follow_up_materials_requested',
    'Outcome progression should attach to the same package.'
  )

  assert.equal(
    afterLive.learning[0].candidate,
    true,
    'Learning should enter the package as evidence-backed candidate state.'
  )

  assert.deepEqual(
    afterLive.relevantDocumentation.map((item) => item.title),
    ['Pitch deck', 'Retention metrics'],
    'Documentation should remain attached without duplication after LIVE updates.'
  )

  const eventTypes = afterLive.events.map((event) => event.type)

  assert(
    eventTypes.includes('conversation_package_created'),
    'Concert flow should preserve package creation history.'
  )

  assert(
    eventTypes.includes('documentation_attached'),
    'Concert flow should preserve documentation attachment history.'
  )

  assert(
    eventTypes.includes('live_summary_attached'),
    'Concert flow should record summary attachment history.'
  )

  assert(
    eventTypes.includes('outcome_progress_recorded'),
    'Concert flow should record outcome progression history.'
  )

  assert(
    eventTypes.includes('learning_attached'),
    'Concert flow should record learning attachment history.'
  )

  return true
}
