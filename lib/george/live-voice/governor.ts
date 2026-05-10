import type { LiveSpeakerRole, LiveVoiceGovernorInput, LiveVoicePacket } from './types'
import { analyzeRoom, inferLiveSpeaker } from './runtime/room-analyzer'
import { detectConversationSignals } from './runtime/conversation-signals'
import { selectLiveResponsePolicy } from './runtime/response-policy'

const TEACHER_LANGUAGE =
  /(try saying|you should|it might be helpful|consider|the best approach|what you want to do|proof points|target number|schedule a meeting|book time)/i


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
  const signals = detectConversationSignals(`${shadowMap}\n${lastFiveSeconds}\n${transcript}`)

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

  const policy = selectLiveResponsePolicy({
    speaker,
    signals,
    roomPressure: room.pressure,
  })

  packet = {
    speaker,
    shouldSpeak: true,
    volley: policy.volley,
    cue: policy.cue,
    status: policy.status,
    confidence: policy.confidence ?? Math.max(0.7, speakerInference.confidence || 0),
    shadowUsed: hasShadow,
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
