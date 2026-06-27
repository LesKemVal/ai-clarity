import { governLiveVoice } from '../../lib/george/live-voice/governor.ts'

export function run() {
  const desiredOutcome = 'secure an investor follow-up meeting'

  const packet = governLiveVoice({
    transcript: "I'm still not convinced about your timeline.",
    mode: 'text_test',
    audio: false,
    contextHint: 'investor meeting',
    desiredOutcome,
    activeOutcome: '',
    shadowMap: 'Investor is evaluating execution risk. User wants follow-up, not an argument.',
    lastFiveSeconds: '',
    supportStyle: 'cue',
    runtimeIntent: 'OBJECTION_RESPONSE',
    liveAssistMode: 'cues',
    deliveryStyle: 'cue',
  })

  const text = `${packet.volley || ''} ${packet.cue || ''} ${packet.status || ''}`.toLowerCase()
  const failed = []

  if (!packet.shouldSpeak) {
    failed.push('GEORGE did not support the user when the objection threatened the desired outcome.')
  }

  if (!text.trim()) {
    failed.push('GEORGE produced no usable guidance.')
  }

  if (/\b(win the argument|prove them wrong|close the sale|push harder|sound impressive)\b/i.test(text)) {
    failed.push('GEORGE optimized for a local conversational win instead of the desired outcome.')
  }

  if (!/\b(follow|next|proof|timeline|risk|clarify|specific|credible|confidence|address)\b/i.test(text)) {
    failed.push('GEORGE did not stay close to the investor follow-up / timeline credibility outcome.')
  }

  if (packet.responseForm === 'silence') {
    failed.push('GEORGE went silent when outcome-preserving support was needed.')
  }

  if (failed.length) {
    throw new Error(failed.join(' '))
  }

  return true
}
