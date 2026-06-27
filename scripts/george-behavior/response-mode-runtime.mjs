import { governLiveVoice } from '../../lib/george/live-voice/governor.ts'

export function run() {
  const packet = governLiveVoice({
    transcript: 'They asked why our timeline is credible.',
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome: 'secure investor follow-up',
    activeOutcome: '',
    shadowMap: 'Investor is evaluating execution risk and wants proof.',
    lastFiveSeconds: '',
    supportStyle: 'response',
    runtimeIntent: 'ANSWER_QUESTION',
    liveAssistMode: 'cues',
    deliveryStyle: 'response',
  })

  const failed = []

  if (!packet.shouldSpeak) {
    failed.push('Response mode did not speak.')
  }

  if (packet.responseForm === 'silence') {
    failed.push('Response mode collapsed into silence.')
  }

  if (!packet.volley && !packet.cue) {
    failed.push('Response mode produced no usable support.')
  }

  if (packet.responseForm === 'cue' && String(packet.volley || packet.cue || '').split(/\s+/).length <= 8) {
    failed.push('Response mode collapsed into cue-only behavior.')
  }

  if (failed.length) {
    throw new Error(failed.join(' '))
  }

  return true
}
