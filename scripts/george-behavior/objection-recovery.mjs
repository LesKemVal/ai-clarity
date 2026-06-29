import assert from 'node:assert/strict'
import { selectLiveResponsePolicy } from '../../lib/george/live-voice/runtime/response-policy.ts'
import { detectConversationSignals } from '../../lib/george/live-voice/runtime/conversation-signals.ts'

export function run() {
  const transcript = 'I still do not believe customers will pay for this.'
  const signals = detectConversationSignals(transcript)

  const result = selectLiveResponsePolicy({
    desiredOutcome: 'Earn a second investor meeting.',
    room: 'investor meeting',
    speaker: 'other_party',
    signals,
    roomPressure: 'moderate',
  })

  const combined = JSON.stringify(result).toLowerCase()

  assert(result, 'GEORGE should produce an operational intervention.')

  assert(
    /proof|evidence|customer|concern|risk|confidence|follow-up|follow up|next/.test(combined),
    'GEORGE should address the objection rather than ignore it.'
  )

  assert(
    /investor|follow|next|outcome|confidence|uncertainty|meeting/.test(combined),
    'GEORGE must preserve the higher-priority desired outcome.'
  )

  assert(
    !/change objective|new objective|presentation mode|response mode/.test(combined),
    'GEORGE must recover without changing support style or objective.'
  )

  return true
}
