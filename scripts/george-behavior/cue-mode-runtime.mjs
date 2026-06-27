import { governLiveVoice } from '../../lib/george/live-voice/governor.ts'

export function run() {
  const packet = governLiveVoice({
    transcript: "I think they're worried about the timeline.",
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome: 'secure investor follow-up',
    activeOutcome: '',
    shadowMap: 'They are evaluating execution risk.',
    lastFiveSeconds: '',
    supportStyle: 'cue',
    runtimeIntent: '',
    liveAssistMode: 'cues',
    deliveryStyle: 'cue',
  })

  const failed = []

  if (packet.responseForm === 'line') {
    failed.push('Cue mode produced a line.')
  }

  if (packet.responseForm === 'silence') {
    failed.push('Cue mode went silent instead of supporting the user.')
  }

  if (!packet.cue && !packet.volley) {
    failed.push('Cue mode produced no usable support.')
  }

  if (String(packet.volley || '').split(/\s+/).length > 24) {
    failed.push('Cue mode produced an overly long response.')
  }

  if (failed.length) {
    throw new Error(failed.join(' '))
  }

  return true
}
