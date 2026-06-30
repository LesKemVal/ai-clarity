import assert from 'node:assert'
import {
  prepareConversation,
  updateAfterLive,
} from '../../lib/george/conversation-packages/index.mjs'
import { summarizeConversation } from '../../lib/george/conversation-summary/runtime.mjs'
import {
  evaluateLearningCandidates,
  holdLearningCandidates,
  promoteLearningCandidates,
} from '../../lib/george/learning/runtime.mjs'
import { prepareConversationFromPackage } from '../../lib/george/preparation/runtime.mjs'

export function run() {
  const resolved = prepareConversation(
    {
      setup: {
        objective: 'secure a second investor meeting',
        room: 'Investor Meeting',
        knownContext: 'Investor may ask about retention and acquisition cost.',
        conversationWith: 'Jordan at Acme Ventures',
        resources: [{ id: 'deck', title: 'Pitch deck', type: 'pdf' }],
      },
    },
    [],
    {
      id: 'acme-investor-package',
      conversationId: 'live-entry-1',
      timestamp: '2026-06-30T15:00:00.000Z',
    }
  )

  const firstPreparation = prepareConversationFromPackage({
    conversationPackage: resolved.package,
  })

  assert.equal(firstPreparation.sufficientToBegin, true)
  assert(
    firstPreparation.documentationSuggestions.includes('Retention metrics'),
    'First preparation should identify missing documentation.'
  )

  const summary = summarizeConversation(
    {
      conversationPackage: resolved.package,
      liveResult: {
        outcome: 'Investor requested retention proof before agreeing to a second meeting.',
        transcript: 'The investor focused on retention. The founder offered to send retention metrics.',
        signals: ['Retention proof became the decision point.'],
        nextSuggestedAction: 'Send retention metrics and request the second meeting.',
      },
    },
    {
      id: 'summary-1',
      timestamp: '2026-06-30T15:10:00.000Z',
    }
  )

  const learningCandidates = evaluateLearningCandidates(
    {
      conversationPackage: resolved.package,
      conversationSummary: summary,
      evidenceCandidates: [
        ...summary.evidenceCandidates,
        {
          id: 'retention-proof-first',
          type: 'communication_pattern',
          evidence: 'Lead with retention proof before discussing acquisition cost.',
          confidence: 0.74,
          outcomeRelevant: true,
        },
      ],
    },
    { timestamp: '2026-06-30T15:11:00.000Z' }
  )

  const updatedPackage = updateAfterLive(
    resolved.package,
    {
      summary,
      outcomeProgression: {
        state: 'retention_proof_requested',
        evidence: 'Investor requested retention metrics before second meeting.',
      },
      learning: [
        ...promoteLearningCandidates(learningCandidates),
        ...holdLearningCandidates(learningCandidates),
      ],
    },
    { timestamp: '2026-06-30T15:12:00.000Z' }
  )

  const nextPreparation = prepareConversationFromPackage({
    conversationPackage: updatedPackage,
  })

  assert(
    nextPreparation.knownContext.some((item) => item.includes('Lead with retention proof')),
    'Next preparation should use learning from the prior conversation.'
  )

  assert(
    nextPreparation.knownContext.some((item) => item.includes('requested retention proof')),
    'Next preparation should use summary/outcome evidence from the prior conversation.'
  )

  assert(
    nextPreparation.opportunities.length > 0,
    'Next preparation should produce a stronger opportunity from accumulated package intelligence.'
  )

  assert(
    nextPreparation.confidence >= firstPreparation.confidence,
    'Preparation confidence should not fall after useful summary and learning have been attached.'
  )

  return true
}
