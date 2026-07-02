import { prepareConversationFromPackage } from '../lib/george/preparation/runtime.mjs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const preparation = prepareConversationFromPackage({
  conversationPackage: {
    id: 'conversation-package-investor-follow-up',
    desiredOutcome: 'secure investor follow-up',
    conversationType: 'investor meeting',
    conversationContext: 'Seed investor asked for implementation proof.',
    relevantDocumentation: [
      { id: 'implementation-plan', title: 'Implementation Plan', type: 'document' },
    ],
  },
  conversationRecord: {
    source: 'conversation-package-runtime',
    desiredOutcome: 'secure investor follow-up',
    conversationContext: 'Post-LIVE investor conversation record.',
    summary: 'Investor requested implementation material and a concrete next step.',
    learning: [
      {
        source: 'outcome_review',
        learning: 'We can prepare implementation material before the next investor meeting.',
        evidence: 'Implementation detail moved the conversation forward.',
      },
    ],
    latestLearning: {
      source: 'outcome_review',
      learning: 'We can lead with proof before asking for the next commitment.',
      evidence: 'Proof became the decision blocker.',
    },
    futureActions: [
      'Send implementation material before the next investor meeting.',
    ],
    relevantDocumentation: [
      { id: 'investor-deck', title: 'Investor Deck', type: 'document' },
    ],
  },
})

assert(preparation.source === 'preparation-runtime', 'preparation should come from preparation runtime')
assert(preparation.desiredOutcome === 'secure investor follow-up', 'preparation should preserve desired outcome')
assert(
  preparation.knownContext.some((item) => item.includes('Investor requested implementation material')),
  'preparation should consume Conversation Record summary'
)
assert(
  preparation.knownContext.some((item) => item.includes('Proof became the decision blocker')),
  'preparation should consume latest Conversation Record learning evidence'
)
assert(
  preparation.opportunities.some((item) => item.includes('prior post-LIVE action')),
  'preparation should turn Conversation Record future actions into opportunities'
)
assert(
  preparation.reusableDocumentation.some((doc) => doc.title === 'Investor Deck'),
  'preparation should reuse Conversation Record documentation'
)
assert(preparation.confidence >= 0.48, 'Conversation Record evidence should improve preparation confidence')
assert(preparation.sufficientToBegin === true, 'prepared package with record evidence should be sufficient to begin')

console.log('GEORGE preparation smoke passed')
