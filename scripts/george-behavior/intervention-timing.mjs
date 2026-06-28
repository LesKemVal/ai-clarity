import { governLiveVoice } from '../../lib/george/live-voice/governor.ts'
import { determineCueDepth } from '../../lib/george/live-runtime/cue-depth.ts'

export function run() {
  const failed = []

  const desiredOutcome = 'secure an investor follow-up meeting'

  const cuePacket = governLiveVoice({
    transcript: "I'm concerned about your timeline.",
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome,
    shadowMap: 'Investor is evaluating execution risk.',
    lastFiveSeconds: "I'm concerned about your timeline.",
    supportStyle: 'cue',
    runtimeIntent: 'OBJECTION_RESPONSE',
    liveAssistMode: 'cues',
    deliveryStyle: 'cue',
  })

  if (cuePacket.supportStyle !== 'cue') {
    failed.push('Cue support style changed.')
  }

  if (cuePacket.responseForm === 'line' && String(cuePacket.volley || '').split(/\s+/).length > 24) {
    failed.push('Cue became too much like Response.')
  }

  const lowDepth = determineCueDepth({
    supportStyle: 'cue',
    runtimeIntent: 'TACTICAL_CUE',
    roomPressure: 'low',
    confidence: 0.86,
    audio: true,
  })

  const authorityDepth = determineCueDepth({
    supportStyle: 'cue',
    runtimeIntent: 'OBJECTION_RESPONSE',
    roomPressure: 'authority',
    confidence: 0.72,
    audio: false,
  })

  if (!lowDepth) {
    failed.push('Cue did not produce default/adaptive depth.')
  }

  if (authorityDepth !== 'extended') {
    failed.push('Cue depth did not adapt under authority pressure.')
  }

  const continuationPacket = governLiveVoice({
    transcript: 'What I want to separate here is...',
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome,
    shadowMap: 'User paused during an unfinished explanation.',
    lastFiveSeconds: 'What I want to separate here is...',
    supportStyle: 'continue',
    runtimeIntent: 'CONTINUATION',
    liveAssistMode: 'completion',
    deliveryStyle: 'continue',
  })

  if (continuationPacket.supportStyle !== 'continue') {
    failed.push('Continuation support style changed.')
  }

  if (!continuationPacket.volley && !continuationPacket.cue) {
    failed.push('Continuation opportunity produced no usable continuation.')
  }

  const responsePacket = governLiveVoice({
    transcript: 'They asked why our timeline is credible.',
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome,
    shadowMap: 'Investor wants a complete answer supported by proof.',
    lastFiveSeconds: 'They asked why our timeline is credible.',
    supportStyle: 'response',
    runtimeIntent: 'ANSWER_QUESTION',
    liveAssistMode: 'response',
    deliveryStyle: 'response',
  })

  if (responsePacket.supportStyle !== 'response') {
    failed.push('Response support style changed.')
  }

  if (responsePacket.responseForm === 'silence') {
    failed.push('Response went silent when complete answer was warranted.')
  }

  const silencePacket = governLiveVoice({
    transcript: 'Hold',
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome,
    shadowMap: 'User explicitly told GEORGE to hold.',
    lastFiveSeconds: 'Hold',
    supportStyle: 'cue',
    runtimeIntent: 'TACTICAL_CUE',
    liveAssistMode: 'cues',
    deliveryStyle: 'cue',
  })

  if (silencePacket.shouldSpeak) {
    failed.push('GEORGE spoke when user agency required silence.')
  }

  const presentationPacket = governLiveVoice({
    transcript: 'They asked for the full explanation.',
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome,
    shadowMap: 'Investor has invited a longer structured explanation.',
    lastFiveSeconds: 'They asked for the full explanation.',
    supportStyle: 'presentation',
    runtimeIntent: 'PRESENTATION',
    liveAssistMode: 'presentation',
    deliveryStyle: 'presentation',
  })

  if (presentationPacket.supportStyle !== 'presentation') {
    failed.push('Presentation should only occur under selected Presentation support style.')
  }

  if (failed.length) {
    throw new Error(failed.join(' '))
  }

  return true
}
