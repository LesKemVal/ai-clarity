import assert from 'node:assert'
import {
  createConversationPackage,
  prepareConversation,
  updateAfterLive,
} from '../../lib/george/conversation-packages/index.mjs'

export function run() {
  const existing = createConversationPackage(
    {
      id: 'acme-seed',
      desiredOutcome: 'raise seed funding for Acme using traction and customer proof',
      conversationType: 'Investor Meeting',
      conversationContext: 'investor questions about retention runway acquisition cost and valuation',
      relevantDocumentation: ['Pitch deck', 'Financial model'],
    },
    { timestamp: '2026-06-30T12:00:00.000Z' }
  )

  const continued = prepareConversation(
    {
      setup: {
        desiredOutcome: 'raise seed funding for Acme using traction and customer proof',
        conversationType: 'Investor Meeting',
        conversationContext: 'investor questions about retention runway acquisition cost and valuation',
        relevantDocumentation: ['Pitch deck', 'Financial model', 'Customer metrics'],
      },
    },
    [existing],
    { timestamp: '2026-06-30T12:01:00.000Z' }
  )

  assert.equal(
    continued.decision,
    'continue_existing_conversation_package',
    'Runtime should continue the existing Conversation Package when evidence strongly supports continuity.'
  )

  assert.equal(continued.package.id, 'acme-seed')
  assert.deepEqual(
    continued.package.relevantDocumentation,
    ['Pitch deck', 'Financial model', 'Customer metrics'],
    'Runtime should attach new documentation to the continued package.'
  )

  const possible = prepareConversation(
    {
      setup: {
        desiredOutcome: 'prepare for another investor meeting about customer traction',
        conversationType: 'Investor Meeting',
        conversationContext: 'traction and growth questions',
      },
    },
    [existing],
    { timestamp: '2026-06-30T12:02:00.000Z' }
  )

  assert.equal(
    possible.decision,
    'ask_user_to_confirm_related_conversation',
    'Runtime should ask for confirmation when continuity evidence is incomplete.'
  )
  assert.equal(possible.package, null)

  const created = prepareConversation(
    {
      setup: {
        desiredOutcome: 'prepare for a doctor appointment about medication side effects',
        conversationType: 'Doctor Appointment',
        conversationContext: 'medication list symptoms timeline',
        relevantDocumentation: ['Medication list'],
      },
    },
    [existing],
    {
      id: 'doctor-package',
      conversationId: 'doctor-live-entry',
      timestamp: '2026-06-30T12:03:00.000Z',
    }
  )

  assert.equal(
    created.decision,
    'new_conversation_package',
    'Runtime should create a new Conversation Package when evidence does not support continuity.'
  )
  assert.equal(created.package.id, 'doctor-package')

  const afterLive = updateAfterLive(
    created.package,
    {
      summary: { id: 'summary-1', outcome: 'doctor asked for medication timeline' },
      outcomeProgression: { state: 'follow_up_needed', evidence: 'schedule lab work' },
      learning: { id: 'learning-1', evidence: 'timeline helped the doctor clarify next step', confidence: 0.7 },
    },
    { timestamp: '2026-06-30T12:04:00.000Z' }
  )

  assert.equal(afterLive.liveSummaries.length, 1)
  assert.equal(afterLive.outcomeProgression.length, 1)
  assert.equal(afterLive.learning.length, 1)

  assert(
    afterLive.events.some((event) => event.type === 'live_summary_attached'),
    'Runtime should record summary attachment as package history.'
  )

  return true
}
