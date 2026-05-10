import type { LiveSpeakerRole, LiveVoiceGovernorInput, LiveVoicePacket } from './types'
import { analyzeRoom, inferLiveSpeaker } from './runtime/room-analyzer'

const TEACHER_LANGUAGE =
  /(try saying|you should|it might be helpful|consider|the best approach|what you want to do|proof points|target number|schedule a meeting|book time)/i

const AUTHORITY_QUESTION =
  /(do you have (an )?id|license|registration|insurance|step out|where are you going|where are you coming from)/i

function cleanLine(value: string, maxWords: number) {
  const words = value
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return words.slice(0, maxWords).join(' ').replace(/[,:;.-]*$/, '')
}

export function governLiveVoice(input: LiveVoiceGovernorInput): LiveVoicePacket {
  const transcript = String(input.transcript || '').trim()

  const shadowMap = String(input.shadowMap || '').trim()

  const speakerInference = inferLiveSpeaker(
    transcript,
    shadowMap
  )

  const speaker =
    speakerInference.speaker === 'user'
      ? 'george_instruction'
      : speakerInference.speaker

  const lastFiveSeconds = String(input.lastFiveSeconds || transcript).trim()
  const hasShadow = shadowMap.length > 0 || lastFiveSeconds.length > 0
  const room = analyzeRoom(`${shadowMap}\n${lastFiveSeconds}\n${transcript}`)


  let packet: LiveVoicePacket = {
    speaker,
    shouldSpeak: true,
    volley: '',
    cue: '',
    status: hasShadow ? 'Using room-state shadow.' : 'Reading the room.',
    confidence: 0.62,
    shadowUsed: hasShadow,
    roomPressure: room.pressure,
    interruptionRisk: room.interruptionRisk,
  }

  if (!transcript) {
    return {
      speaker: 'unclear',
      shouldSpeak: false,
      volley: '',
      cue: '',
      status: 'No live signal.',
      confidence: 0,
      shadowUsed: false,
    }
  }

  if (speaker === 'other_party' && AUTHORITY_QUESTION.test(transcript)) {
    packet = {
      speaker,
      shouldSpeak: true,
      volley:
        room.pressure === 'authority'
          ? 'Yes, officer. May I reach for it?'
          : 'Let me answer that carefully.',
      cue: 'Hands visible. Move slowly.',
      status: 'Authority context. Stay calm.',
      confidence: 0.86,
      shadowUsed: hasShadow,
    }
  } else if (speaker === 'other_party') {
    const lowerTranscript = transcript.toLowerCase()

    packet = {
      speaker,
      shouldSpeak: true,
      volley: /hold on|wait|let me finish|stop/i.test(lowerTranscript)
        ? ''
        : /why should i believe|prove|evidence|that does not sound right|that doesn't sound right/i.test(lowerTranscript)
          ? 'The clearest proof is this.'
          : /okay,? go ahead|go ahead|you can answer|your turn|i'?m listening/i.test(lowerTranscript)
            ? 'Here is the point.'
            : 'Let me answer that directly.',
      cue: /hold on|wait|let me finish|stop/i.test(lowerTranscript)
        ? 'Do not speak. Let them finish.'
        : /why should i believe|prove|evidence|that does not sound right|that doesn't sound right/i.test(lowerTranscript)
          ? 'Proof first. No extra words.'
          : /okay,? go ahead|go ahead|you can answer|your turn|i'?m listening/i.test(lowerTranscript)
            ? 'Use the opening.'
            : 'Slow down. Do not rush.',
      status: /hold on|wait|let me finish|stop/i.test(lowerTranscript)
        ? 'Other party holding the floor.'
        : /why should i believe|prove|evidence|that does not sound right|that doesn't sound right/i.test(lowerTranscript)
          ? 'Proof challenge detected.'
          : /okay,? go ahead|go ahead|you can answer|your turn|i'?m listening/i.test(lowerTranscript)
            ? 'Opening detected.'
            : 'They asked for a response.',
      confidence: Math.max(0.7, speakerInference.confidence || 0),
      shadowUsed: hasShadow,
    }
  } else {
    packet = {
      speaker,
      shouldSpeak: true,
      volley: 'Say it plainly.',
      cue: 'Short. Calm. Direct.',
      status: 'Instruction received.',
      confidence: 0.6,
      shadowUsed: hasShadow,
    }
  }

  packet.volley = cleanLine(packet.volley, input.audio ? 7 : 12)
  packet.cue = cleanLine(packet.cue, input.audio ? 7 : 10)

  if (TEACHER_LANGUAGE.test(packet.volley)) {
    packet.volley = 'Say it plainly.'
    packet.cue = 'Short. Calm. Direct.'
    packet.status = 'Teacher language blocked.'
  }

  return packet
}
