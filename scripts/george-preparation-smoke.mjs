import { prepareConversationFromPackage, selectRelatedConversationPackages } from '../lib/george/preparation/runtime.mjs'

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
  relatedConversationPackages: [
    {
      id: 'conversation-package-related-investor-proof',
      desiredOutcome: 'secure investor follow-up',
      conversationType: 'investor meeting',
      conversationContext: 'Prior investor meeting to secure investor follow-up stalled on implementation proof and deployment readiness.',
      liveSummaries: [
        { summary: 'Second investor asked for deployment timeline before committing.' },
      ],
      learning: [
        {
          decision: 'promote',
          evidence: 'Deployment readiness repeatedly improved investor confidence.',
        },
      ],
      futureActions: [
        'Prepare deployment timeline before the next investor conversation.',
      ],
      relevantDocumentation: [
        { id: 'deployment-timeline', title: 'Deployment Timeline', type: 'document' },
      ],
    },
  ],
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
  preparation.knownContext.some((item) => item.includes('Prior investor meeting to secure investor follow-up stalled on implementation proof and deployment readiness')),
  'preparation should consume related package context'
)
assert(
  preparation.knownContext.some((item) => item.includes('Second investor asked for deployment timeline')),
  'preparation should consume related package summaries'
)
assert(
  preparation.knownContext.some((item) => item.includes('Deployment readiness repeatedly improved investor confidence')),
  'preparation should consume related package learning'
)
assert(
  preparation.opportunities.some((item) => item.includes('prior post-LIVE action')),
  'preparation should turn Conversation Record future actions into opportunities'
)
assert(
  preparation.opportunities.some((item) => item.includes('deployment timeline')),
  'preparation should turn related package future actions into opportunities'
)
assert(
  preparation.reusableDocumentation.some((doc) => doc.title === 'Investor Deck'),
  'preparation should reuse Conversation Record documentation'
)
assert(
  preparation.reusableDocumentation.some((doc) => doc.title === 'Deployment Timeline'),
  'preparation should reuse related package documentation'
)
assert(
  preparation.relatedConversationPackageSelection?.[0]?.id === 'conversation-package-related-investor-proof',
  'preparation should expose selected related package metadata'
)
assert(preparation.confidence >= 0.48, 'Conversation Record evidence should improve preparation confidence')
assert(preparation.sufficientToBegin === true, 'prepared package with record evidence should be sufficient to begin')

const relatedSelection = selectRelatedConversationPackages({
  conversationPackage: {
    id: 'conversation-package-investor-follow-up',
    desiredOutcome: 'secure investor follow-up',
    conversationType: 'investor meeting',
    conversationContext: 'Investor asked for implementation proof and deployment timeline.',
    relevantDocumentation: [
      { id: 'investor-deck', title: 'Investor Deck', type: 'document' },
    ],
  },
  maxRelatedConversationPackages: 2,
  relatedConversationPackages: [
    {
      id: 'package-driver-license-renewal',
      desiredOutcome: 'renew driver license',
      conversationType: 'appointment',
      conversationContext: 'DMV appointment about proof of residency.',
      relevantDocumentation: [
        { id: 'utility-bill', title: 'Utility Bill', type: 'document' },
      ],
    },
    {
      id: 'package-investor-deployment-proof',
      desiredOutcome: 'secure investor follow-up',
      conversationType: 'investor meeting',
      conversationContext: 'Investor wanted implementation proof, deployment timeline, secure investor follow-up, and next commitment.',
      liveSummaries: [
        { summary: 'Deployment readiness was the reason follow-up stayed open.' },
      ],
      relevantDocumentation: [
        { id: 'deployment-timeline', title: 'Deployment Timeline', type: 'document' },
      ],
    },
    {
      id: 'package-investor-financial-model',
      desiredOutcome: 'support investor follow-up',
      conversationType: 'investor meeting',
      conversationContext: 'Investor asked for financial model only.',
      relevantDocumentation: [
        { id: 'financial-model', title: 'Financial Model', type: 'document' },
      ],
    },
  ],
})

assert(relatedSelection.length === 2, 'related package selection should remain bounded')
assert(
  relatedSelection.some((item) => item.id === 'package-investor-deployment-proof'),
  'deployment proof package should be selected as related investor evidence'
)
assert(
  relatedSelection.some((item) => item.id === 'package-investor-financial-model'),
  'financial model package should be selected as related investor evidence'
)
assert(
  relatedSelection.every((item) => item.id !== 'package-driver-license-renewal'),
  'irrelevant related package should be excluded before preparation reasoning'
)
assert(
  relatedSelection[0].preparationRelevanceScore >= relatedSelection[1].preparationRelevanceScore,
  'related package selection should be ordered by relevance score'
)
assert(
  relatedSelection.every((item) => typeof item.preparationRelevanceScore === 'number'),
  'selected related packages should carry relevance scores'
)

const rankedPreparation = prepareConversationFromPackage({
  conversationPackage: {
    id: 'conversation-package-investor-follow-up',
    desiredOutcome: 'secure investor follow-up',
    conversationType: 'investor meeting',
    conversationContext: 'Investor asked for implementation proof and deployment timeline.',
  },
  maxRelatedConversationPackages: 1,
  relatedConversationPackages: relatedSelection,
})

assert(
  rankedPreparation.knownContext.some((item) => item.includes('financial model')),
  'Preparation should consume the selected high-value related package'
)
assert(
  !rankedPreparation.knownContext.some((item) => item.includes('Deployment readiness')),
  'Preparation should not consume unselected related packages when bounded'
)
assert(
  rankedPreparation.relatedConversationPackageSelection.length === 1,
  'Preparation should expose bounded related package selection'
)

console.log('GEORGE preparation smoke passed')
