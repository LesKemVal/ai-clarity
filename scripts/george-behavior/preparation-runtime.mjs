import assert from 'node:assert'
import { prepareConversationFromPackage } from '../../lib/george/preparation/runtime.mjs'

export function run() {
  const preparation = prepareConversationFromPackage({
    conversationPackage: {
      id: 'acme-investor-package',
      desiredOutcome: 'secure a second investor meeting',
      conversationContext: 'Investor asked about retention and acquisition cost.',
      conversationWith: 'Jordan at Acme Ventures',
      role: 'Founder presenting traction.',
      relevantDocumentation: [
        { id: 'deck', title: 'Pitch deck' },
      ],
      liveSummaries: [
        {
          id: 'summary-1',
          outcome: 'Investor requested retention proof and agreed to review follow-up materials.',
        },
      ],
      learning: [
        {
          id: 'learning-1',
          type: 'communication_pattern',
          evidence: 'Lead with retention proof before discussing acquisition cost.',
          decision: 'hold_for_more_evidence',
        },
        {
          id: 'person-1',
          type: 'person',
          evidence: 'Jordan at Acme Ventures asked for retention metrics.',
          decision: 'promote',
        },
      ],
    },
  })

  assert.equal(preparation.source, 'preparation-runtime')
  assert.equal(preparation.desiredOutcome, 'secure a second investor meeting')

  assert(
    preparation.preparationBrief.includes('Prepare toward: secure a second investor meeting'),
    'Preparation Runtime should produce a brief tied to the desired outcome.'
  )

  assert(
    preparation.knownContext.some((item) => item.includes('Jordan at Acme Ventures')),
    'Preparation Runtime should apply person-specific package context.'
  )

  assert(
    preparation.knownContext.some((item) => item.includes('Lead with retention proof')),
    'Preparation Runtime should apply held or promoted learning that may improve execution.'
  )

  assert(
    preparation.documentationSuggestions.includes('Retention metrics'),
    'Preparation Runtime should recommend missing documentation based on outcome and context.'
  )


  assert.deepEqual(
    preparation.reusableDocumentation.map((doc) => doc.title),
    ['Pitch deck'],
    'Preparation Runtime should surface prior package documentation as reusable context.'
  )

  assert.equal(
    preparation.reusableDocumentation[0].reusable,
    true,
    'Relevant Documentation already attached to a package should be reusable when it may improve the next preparation.'
  )

  assert(
    preparation.risks.some((risk) => risk.includes('proof')),
    'Preparation Runtime should identify operational risk from package context.'
  )

  assert(
    preparation.opportunities.some((opportunity) => opportunity.includes('specific next step')),
    'Preparation Runtime should identify opportunities tied to outcome progression.'
  )

  assert.equal(
    preparation.sufficientToBegin,
    true,
    'Sufficiency Doctrine: GEORGE should begin when enough context exists, not wait for complete context.'
  )

  assert(
    preparation.confidence >= 0.42,
    'Preparation Runtime should compute a usable readiness confidence.'
  )

  return true
}
