import assert from 'node:assert/strict'
import { summarizeConversationIntelligence } from '../../lib/george/post-conversation/post-conversation-intelligence.ts'

export function run() {
  const report = summarizeConversationIntelligence({
    desiredOutcome: 'Earn a second investor meeting.',
    transcript: [
      { speaker: 'other_party', text: 'I like the concept but I need proof customers will actually use it.' },
      { speaker: 'user', text: 'We have several pilot opportunities beginning next month.' },
      { speaker: 'other_party', text: 'Send me the pilot results once you have them.' },
      { speaker: 'other_party', text: "Let's schedule another discussion after that." }
    ],
  })

  assert(report.summary.length > 0)
  assert(report.commitments.length >= 1)
  assert(report.evidenceRequested.length >= 1)
  assert(report.opportunities.length >= 1)
  assert(report.nextConversation.length > 0)
  assert(/second investor meeting/i.test(report.desiredOutcome))

  return true
}
