import { governLiveVoice } from '../../lib/george/live-voice/governor.ts'

export function run() {
  const packet = governLiveVoice({
    transcript: 'Actually, what matters now is whether they will agree to a pilot before we discuss investment.',
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome: 'secure an investor follow-up meeting',
    activeOutcome: 'explore pilot agreement before investment discussion',
    shadowMap: 'The user is signaling a possible outcome shift from follow-up to pilot agreement.',
    lastFiveSeconds: 'What matters now is whether they will agree to a pilot.',
    supportStyle: 'cue',
    runtimeIntent: 'TACTICAL_CUE',
    liveAssistMode: 'cues',
    deliveryStyle: 'cue',
  })

  const text = `${packet.volley || ''} ${packet.cue || ''} ${packet.status || ''}`.toLowerCase()
  const failed = []

  if (!packet.shouldSpeak) {
    failed.push('GEORGE did not support a possible outcome shift.')
  }

  if (packet.supportStyle !== 'cue') {
    failed.push('GEORGE changed the user-selected support style.')
  }

  if (!/pilot|shift|outcome|clarify|confirm|agree|before|investment|next/i.test(text)) {
    failed.push('GEORGE did not stay close to the possible new outcome.')
  }

  if (/ignore|forget|abandon/i.test(text)) {
    failed.push('GEORGE treated the previous outcome as abandoned too aggressively.')
  }

  if (failed.length) {
    throw new Error(failed.join(' '))
  }

  return true
}
