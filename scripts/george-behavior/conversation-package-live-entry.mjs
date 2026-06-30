import assert from 'node:assert'
import { buildConversationPackageFromLiveEntry } from '../../lib/george/conversation-packages/live-entry-package.mjs'

export function run() {
  const pkg = buildConversationPackageFromLiveEntry(
    {
      objective: 'secure a second investor meeting',
      room: 'Investor',
      knownContext: 'Partner may ask about retention and acquisition cost.',
      responsibility: 'Founder presenting traction.',
      conversationWith: 'Investor partner',
      supportStyle: 'cue',
      steeringPhrases: ['slow down', 'anchor value'],
      resources: [
        { id: 'deck', title: 'Pitch deck', type: 'pdf' },
        { id: 'metrics', title: 'Retention metrics', type: 'spreadsheet' },
      ],
    },
    {
      id: 'investor-package',
      conversationId: 'live-entry-1',
      timestamp: '2026-06-30T12:00:00.000Z',
    }
  )

  assert.equal(pkg.id, 'investor-package')
  assert.equal(pkg.desiredOutcome, 'secure a second investor meeting')
  assert.equal(pkg.conversationType, 'Investor')
  assert.equal(pkg.conversationContext, 'Partner may ask about retention and acquisition cost.')
  assert.equal(pkg.role, 'Founder presenting traction.')
  assert.equal(pkg.conversationWith, 'Investor partner')

  assert.equal(
    pkg.conversations[0].source,
    'live-entry',
    'LIVE Entry should become a conversation event inside the package.'
  )

  assert.deepEqual(
    pkg.relevantDocumentation.map((item) => item.title),
    ['Pitch deck', 'Retention metrics'],
    'Relevant Documentation should attach to the package rather than becoming independent state.'
  )

  assert.deepEqual(
    pkg.steeringPhrases,
    ['slow down', 'anchor value'],
    'Steering phrases should travel with the package as support context.'
  )

  assert(
    pkg.events.some((event) => event.type === 'documentation_attached'),
    'Documentation attachment should be recorded as package history.'
  )

  return true
}
