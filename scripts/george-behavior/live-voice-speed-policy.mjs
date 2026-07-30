import assert from 'node:assert/strict'
import { determineLiveVoiceSpeed } from '../../lib/george/live-delivery/voice-speed-policy.ts'

export function run() {
  const response = determineLiveVoiceSpeed({
    deliveryStyle: 'response',
    text: 'GEORGE is not another AI assistant. It helps the user prepare, respond, decide, and execute in the room.',
  })

  assert(response.speed > 1, 'Response mode should support faster repeatable delivery.')

  const longResponse = determineLiveVoiceSpeed({
    deliveryStyle: 'response',
    text: 'GEORGE is not another AI assistant. It is an operational intelligence runtime that helps people prepare for, perform in, and learn from high-stakes conversations where timing, judgment, and communication affect the outcome.',
  })

  assert(longResponse.speed <= response.speed, 'Long response should not outrun user synchronization.')

  const repeat = determineLiveVoiceSpeed({
    deliveryStyle: 'response',
    text: 'Repeat this.',
    userRequestedRepeat: true,
  })

  assert(repeat.speed < response.speed, 'Repeat behavior should slow down for synchronization.')

  const cue = determineLiveVoiceSpeed({
    deliveryStyle: 'advice',
    text: 'Ask why.',
  })

  assert(cue.speed >= 1.08, 'Cue delivery should remain quick and low burden.')

  console.log('GEORGE live voice speed policy passed')
}
