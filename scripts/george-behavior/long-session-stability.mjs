import { governLiveVoice } from '../../lib/george/live-voice/governor.ts'

export function run() {
  const supportStyle = 'cue'
  const desiredOutcome = 'secure an investor follow-up meeting'

  const turns = [
    ["I'm still not convinced about your timeline.", 'OBJECTION_RESPONSE', 'Investor is evaluating execution risk.'],
    ['What proof do you have that this can actually happen?', 'ANSWER_QUESTION', 'Investor wants proof.'],
    ['Actually, what matters now is whether they will agree to a pilot before we discuss investment.', 'TACTICAL_CUE', 'Possible outcome shift toward pilot.'],
    ['Before we go further, clarify what the pilot would prove.', 'TACTICAL_CUE', 'Pilot proof is now the active thread.'],
    ['I need to understand why this deserves a second meeting.', 'OBJECTION_RESPONSE', 'Investor is testing follow-up value.'],
  ]

  const outputs = []
  const failed = []

  for (const [transcript, runtimeIntent, shadowMap] of turns) {
    const packet = governLiveVoice({
      transcript,
      mode: 'text_test',
      audio: false,
      contextHint: 'investor meeting',
      desiredOutcome,
      activeOutcome: transcript.includes('pilot')
        ? 'confirm pilot before investment discussion'
        : '',
      shadowMap,
      lastFiveSeconds: transcript,
      supportStyle,
      runtimeIntent,
      liveAssistMode: 'cues',
      deliveryStyle: supportStyle,
    })

    const text = `${packet.volley || ''} ${packet.cue || ''} ${packet.status || ''}`.toLowerCase()
    outputs.push(text)

    if (packet.supportStyle !== supportStyle) {
      failed.push('Support style changed during long session.')
    }

    if (/abandon|forget|ignore/i.test(text)) {
      failed.push('GEORGE abandoned prior objective too aggressively.')
    }

    if (/close the sale|win the argument|prove them wrong|sound impressive/i.test(text)) {
      failed.push('GEORGE optimized for a local win instead of the desired outcome.')
    }

    if (packet.shouldSpeak && !text.trim()) {
      failed.push('GEORGE chose to speak but produced no usable support.')
    }
  }

  const combined = outputs.join(' ')

  if (!/follow|next conversation|second meeting|next meeting|investor/i.test(combined)) {
    failed.push('Desired outcome disappeared across the long session.')
  }

  if (!/pilot|outcome|shift|confirm|investment/i.test(combined)) {
    failed.push('Possible outcome shift was not preserved across the long session.')
  }

  for (let i = 1; i < outputs.length; i++) {
    if (outputs[i] && outputs[i] === outputs[i - 1]) {
      failed.push('Repetitive degradation detected across adjacent turns.')
    }
  }

  if (failed.length) {
    throw new Error(failed.join(' '))
  }

  return true
}
