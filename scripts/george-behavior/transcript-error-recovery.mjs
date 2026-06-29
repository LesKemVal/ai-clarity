import assert from 'node:assert/strict'
import { governLiveVoice } from '../../lib/george/live-voice/governor.ts'

export function run() {

  const packet = governLiveVoice({

    transcript:
      'I think we should celery the pilot before discussing investment.',

    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',

    desiredOutcome:
      'Earn a second investor meeting.',

    activeOutcome:
      'Validate customer demand before investment discussion.',

    shadowMap:
      'Likely transcript corruption. User probably meant "celebrate" or "accelerate" the pilot. Room context remains pilot validation.',

    lastFiveSeconds:
      '...pilot before discussing investment.',

    supportStyle: 'cue',
    runtimeIntent: 'TACTICAL_CUE',
    liveAssistMode: 'cues',
    deliveryStyle: 'cue',
  })

  const combined =
    `${packet.volley || ''} ${packet.cue || ''} ${packet.status || ''}`.toLowerCase()

  assert(packet.shouldSpeak)

  assert(
    !/celery/.test(combined),
    'GEORGE should not anchor on an obvious transcript error.'
  )

  assert(
    /outcome|objective|signal|cue|support|investor|meeting|pilot|investment|customer|proof|validation|next|uncertainty/i.test(combined),
    'GEORGE should recover using accumulated room signal.'
  )

  return true
}
