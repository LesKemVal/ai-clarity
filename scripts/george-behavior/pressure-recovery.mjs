import assert from 'node:assert/strict'
import { governLiveVoice } from '../../lib/george/live-voice/governor.ts'

export function run() {
  const packet = governLiveVoice({
    transcript: 'Answer directly. Why should we believe this will work?',
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting under pressure',
    desiredOutcome: 'Earn a second investor meeting.',
    activeOutcome: 'Answer pressure without losing the second meeting objective.',
    shadowMap: 'Other party is challenging proof and applying pressure.',
    lastFiveSeconds: 'Answer directly. Why should we believe this will work?',
    supportStyle: 'cue',
    runtimeIntent: 'TACTICAL_CUE',
    liveAssistMode: 'cues',
    deliveryStyle: 'cue',
  })

  const combined = `${packet.volley || ''} ${packet.cue || ''} ${packet.status || ''}`.toLowerCase()

  assert(packet.shouldSpeak, 'GEORGE should support the user under direct pressure.')

  assert.equal(
    packet.supportStyle,
    'cue',
    'Pressure recovery must preserve the selected support style.'
  )

  assert(
    /proof|direct|evidence|customer|pilot|confidence|answer|believe|second|meeting|outcome|objective/i.test(combined),
    'GEORGE should recover pressure by protecting outcome and addressing proof.'
  )

  assert(
    !/panic|apologize|change objective|new mode|presentation mode/i.test(combined),
    'GEORGE must not escalate, panic, or change modes under pressure.'
  )

  return true
}
