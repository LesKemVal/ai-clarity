import assert from 'node:assert'
import {
  identifyConversationPackage,
  scoreConversationPackage,
} from '../../lib/george/conversation-packages/identity.mjs'

export function run() {
  const existing = [
    {
      id: 'acme-seed',
      desiredOutcome: 'raise seed funding for Acme using traction and customer proof',
      conversationType: 'Investor Meeting',
      conversationContext: 'investor questions about retention runway acquisition cost and valuation',
      relevantDocumentation: ['Pitch deck', 'Financial model', 'Customer metrics'],
    },
    {
      id: 'google-interview',
      desiredOutcome: 'prepare for software engineering interview',
      conversationType: 'Interview',
      conversationContext: 'technical interview behavioral examples recruiter email',
      relevantDocumentation: ['Resume', 'Job description'],
    },
  ]

  const continuation = identifyConversationPackage(
    {
      desiredOutcome: 'help me prepare for Acme seed funding investor conversation',
      conversationType: 'Investor Meeting',
      conversationContext: 'they may ask about traction runway and customer acquisition',
      relevantDocumentation: ['Pitch deck', 'Financial model'],
    },
    existing
  )

  assert.equal(
    continuation.decision,
    'continue_existing_conversation_package',
    'GEORGE should continue an existing package when objective, type, context, and documentation strongly overlap.'
  )

  assert.equal(
    continuation.candidate.id,
    'acme-seed',
    'GEORGE should attach related work to the matching conversation package.'
  )

  const possible = identifyConversationPackage(
    {
      desiredOutcome: 'prepare for another investor meeting about customer traction',
      conversationType: 'Investor Meeting',
      conversationContext: 'traction and growth questions',
      relevantDocumentation: [],
    },
    existing
  )

  assert.equal(
    possible.decision,
    'ask_user_to_confirm_related_conversation',
    'GEORGE should ask for confirmation when a conversation appears related but evidence is incomplete.'
  )

  const newConversation = identifyConversationPackage(
    {
      desiredOutcome: 'prepare for a doctor appointment about medication side effects',
      conversationType: 'Doctor Appointment',
      conversationContext: 'medication list symptoms timeline',
      relevantDocumentation: ['Medication list'],
    },
    existing
  )

  assert.equal(
    newConversation.decision,
    'new_conversation_package',
    'GEORGE should create a new package when evidence does not support continuity.'
  )

  assert(
    scoreConversationPackage(
      { desiredOutcome: 'raise seed funding with Acme traction' },
      existing[0]
    ) > scoreConversationPackage(
      { desiredOutcome: 'raise seed funding with Acme traction' },
      existing[1]
    ),
    'Conversation identification should prioritize outcome and context continuity over generic recency.'
  )

  return true
}
