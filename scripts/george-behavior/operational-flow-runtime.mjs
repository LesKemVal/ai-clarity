import { governLiveVoice } from '../../lib/george/live-voice/governor.ts'

export function run() {
  const supportStyle = 'cue'
  const desiredOutcome = 'secure an investor follow-up meeting'

  const firstPacket = governLiveVoice({
    transcript: "I'm still not convinced about your timeline.",
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome,
    activeOutcome: '',
    shadowMap: 'Investor is evaluating execution risk. User wants follow-up, not an argument.',
    lastFiveSeconds: '',
    supportStyle,
    runtimeIntent: 'OBJECTION_RESPONSE',
    liveAssistMode: 'cues',
    deliveryStyle: supportStyle,
  })

  const shiftPacket = governLiveVoice({
    transcript: 'Actually, what matters now is whether they will agree to a pilot before we discuss investment.',
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome,
    activeOutcome: 'explore pilot agreement before investment discussion',
    shadowMap: 'The user is signaling a possible outcome shift from follow-up to pilot agreement.',
    lastFiveSeconds: 'What matters now is whether they will agree to a pilot.',
    supportStyle,
    runtimeIntent: 'TACTICAL_CUE',
    liveAssistMode: 'cues',
    deliveryStyle: supportStyle,
  })

  const firstText = `${firstPacket.volley || ''} ${firstPacket.cue || ''} ${firstPacket.status || ''}`.toLowerCase()
  const shiftText = `${shiftPacket.volley || ''} ${shiftPacket.cue || ''} ${shiftPacket.status || ''}`.toLowerCase()
  const failed = []

  if (!firstPacket.shouldSpeak) {
    failed.push('Initial investor objection did not receive support.')
  }

  if (firstPacket.supportStyle !== supportStyle) {
    failed.push('Initial packet changed support style.')
  }

  if (!/follow|next conversation|confidence|uncertainty|concern/i.test(firstText)) {
    failed.push('Initial packet did not preserve investor follow-up outcome.')
  }

  if (!shiftPacket.shouldSpeak) {
    failed.push('Outcome shift did not receive support.')
  }

  if (shiftPacket.supportStyle !== supportStyle) {
    failed.push('Outcome shift changed support style.')
  }

  if (!/pilot|shift|outcome|confirm|new target|parked|investment/i.test(shiftText)) {
    failed.push('Outcome shift packet did not stay close to the possible new outcome.')
  }

  if (/abandon|forget|ignore/i.test(shiftText)) {
    failed.push('Outcome shift abandoned prior outcome too aggressively.')
  }

  if (failed.length) {
    throw new Error(failed.join(' '))
  }

  return true
}
