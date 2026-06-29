import assert from 'node:assert/strict'
import { detectObjectiveShift } from '../../lib/george/live-voice/runtime/objective-shift.ts'
import { governLiveVoice } from '../../lib/george/live-voice/governor.ts'

export function run() {
  const weakShift = detectObjectiveShift({
    transcript: 'Maybe the goal is to test a pilot first.',
    currentObjective: 'Earn a second investor meeting.',
    speaker: 'user',
  })

  assert.equal(weakShift.detected, true)
  assert(weakShift.confidence < 0.75)
  assert.equal(weakShift.visibility, 'needs_phone_update')

  const packet = governLiveVoice({
    transcript: 'Actually, what matters now is whether they will agree to a pilot before we discuss investment.',
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome: 'Earn a second investor meeting.',
    activeOutcome: 'Explore pilot agreement before investment discussion.',
    shadowMap: 'The user is signaling a possible outcome shift from second investor meeting to pilot agreement.',
    lastFiveSeconds: 'What matters now is whether they will agree to a pilot.',
    supportStyle: 'cue',
    runtimeIntent: 'TACTICAL_CUE',
    liveAssistMode: 'cues',
    deliveryStyle: 'cue',
  })

  const combined = `${packet.volley || ''} ${packet.cue || ''} ${packet.status || ''}`.toLowerCase()

  assert.equal(packet.supportStyle, 'cue')

  assert(
    /pilot|investment|before|confirm|shift|outcome|agree|next/.test(combined),
    'GEORGE should stay close to the candidate new outcome.'
  )

  assert(
    !/forget|abandon|ignore/.test(combined),
    'GEORGE must not aggressively abandon the previous outcome.'
  )

  return true
}
