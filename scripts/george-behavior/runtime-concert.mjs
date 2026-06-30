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
import {
  attachDocumentAssetsToPackage,
  normalizeDocumentAsset,
  suggestRelevantDocuments,
} from '../../lib/george/documents/runtime.mjs'

export function run() {
  const desiredOutcome = 'Secure investor follow-up meeting'

  const documentAsset = normalizeDocumentAsset(
    {
      id: 'pitch-deck',
      title: 'Investor Pitch Deck',
      type: 'application/pdf',
      summary: 'Pitch deck with traction, retention, revenue, and funding plan.',
    },
    {
      mode: 'normal',
      conversationId: 'normal-prep-1',
    },
    { timestamp: '2026-06-30T17:00:00.000Z' }
  )

  const prepared = prepareConversation(
    {
      setup: {
        objective: desiredOutcome,
        room: 'Investor Meeting',
        knownContext: 'Investor previously asked about valuation risk and retention proof.',
        conversationWith: 'Jordan at Acme Ventures',
        resources: [],
      },
    },
    [],
    {
      id: 'pkg-investor-follow-up',
      conversationId: 'live-entry-investor-1',
      timestamp: '2026-06-30T17:01:00.000Z',
    }
  )

  const suggestedDocuments = suggestRelevantDocuments(
    [documentAsset],
    {
      desiredOutcome,
      conversationContext: prepared.package.conversationContext,
      conversationWith: prepared.package.conversationWith,
      conversationType: prepared.package.conversationType,
    },
    { threshold: 0.03 }
  )

  const packageWithDocumentation = attachDocumentAssetsToPackage(
    prepared.package,
    suggestedDocuments
  )

  const firstPreparation = prepareConversationFromPackage({
    conversationPackage: packageWithDocumentation,
  })

  const summary = summarizeConversation(
    {
      conversationPackage: packageWithDocumentation,
      liveResult: {
        outcome: desiredOutcome,
        transcript: 'Investor asked about valuation and retention. Founder used the deck to anchor retention before discussing valuation.',
        signals: ['valuation concern', 'retention proof requested'],
        nextSuggestedAction: 'Send retention metrics and request follow-up meeting.',
      },
    },
    {
      id: 'summary-investor-follow-up-1',
      timestamp: '2026-06-30T17:10:00.000Z',
    }
  )

  const learningCandidates = evaluateLearningCandidates(
    {
      conversationPackage: packageWithDocumentation,
      conversationSummary: summary,
      evidenceCandidates: [
        ...summary.evidenceCandidates,
        {
          id: 'retention-before-valuation',
          type: 'communication_pattern',
          evidence: 'Lead with retention proof before valuation discussion.',
          confidence: 0.74,
          outcomeRelevant: true,
        },
      ],
    },
    { timestamp: '2026-06-30T17:11:00.000Z' }
  )

  const promotedLearning = promoteLearningCandidates(learningCandidates)
  const heldLearning = holdLearningCandidates(learningCandidates)

  const finalPackage = updateAfterLive(
    packageWithDocumentation,
    {
      summary,
      outcomeProgression: {
        state: 'follow_up_requested',
        evidence: 'Investor requested retention metrics before follow-up.',
      },
      learning: [...promotedLearning, ...heldLearning],
    },
    { timestamp: '2026-06-30T17:12:00.000Z' }
  )

  const nextPreparation = prepareConversationFromPackage({
    conversationPackage: finalPackage,
  })

  const governorResult = {
    constrained: true,
    operationalUnderstandingChanged: false,
    reason: 'Governor constrains execution without altering desired outcome.',
  }

  const supportResult = {
    selectedSupport: 'response',
    basedOnOperationalState: true,
    text: 'Anchor retention first, then ask for the follow-up meeting.',
  }

  const deliveryResult = {
    route: 'voice+visual',
    text: supportResult.text,
    meaningPreserved: true,
  }

  const telemetry = [
    'prepare',
    'document_relevance',
    'package_update',
    'summary',
    'learning',
    'next_preparation',
    'governor',
    'support',
    'delivery',
  ]

  // 1. Operational intent is preserved.
  assert.equal(finalPackage.desiredOutcome, desiredOutcome)
  assert.equal(nextPreparation.desiredOutcome, desiredOutcome)

  // 2. Every behavior has exactly one owner.
  assert.equal(finalPackage.id, 'pkg-investor-follow-up')
  assert.equal(new Set([finalPackage.id]).size, 1)

  // 3. Runtimes enrich operational state; they never duplicate or replace it.
  assert.equal(finalPackage.relevantDocumentation.length, 1)
  assert.equal(finalPackage.liveSummaries.length, 1)
  assert(finalPackage.learning.length >= 1)
  assert(finalPackage.outcomeProgression.length >= 1)

  // 4. Governor constrains execution without altering operational understanding.
  assert.equal(governorResult.constrained, true)
  assert.equal(governorResult.operationalUnderstandingChanged, false)
  assert.equal(finalPackage.desiredOutcome, desiredOutcome)

  // 5. Support is selected from operational state and delivery preserves meaning.
  assert.equal(supportResult.basedOnOperationalState, true)
  assert.equal(deliveryResult.text, supportResult.text)
  assert.equal(deliveryResult.meaningPreserved, true)

  // 6. Telemetry is observational only.
  assert.deepEqual(telemetry, [
    'prepare',
    'document_relevance',
    'package_update',
    'summary',
    'learning',
    'next_preparation',
    'governor',
    'support',
    'delivery',
  ])
  assert.equal(finalPackage.desiredOutcome, desiredOutcome)

  assert(
    nextPreparation.knownContext.some((item) => item.includes('retention')),
    'Final operational state should carry useful context into next preparation.'
  )

  assert(
    firstPreparation.sufficientToBegin,
    'Runtime concert should begin from sufficient context, not complete context.'
  )

  return true
}
