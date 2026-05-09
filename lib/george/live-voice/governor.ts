import type { LiveSpeakerRole, LiveVoiceGovernorInput, LiveVoicePacket } from './types'

const TEACHER_LANGUAGE =
  /(try saying|you should|it might be helpful|consider|the best approach|what you want to do|proof points|target number|schedule a meeting|book time)/i

const AUTHORITY_QUESTION =
  /(do you have (an )?id|license|registration|insurance|step out|where are you going|where are you coming from)/i

const DIRECT_QUESTION =
  /(\?|^(do|did|can|could|would|will|are|is|was|were|have|has|why|what|where|when|who|how)\b)/i

function inferSpeaker(transcript: string): LiveSpeakerRole {
  const text = transcript.trim().toLowerCase()

  if (!text) return 'unclear'

  if (/^(george|g\?|cue me|help me|what do i say|give me|respond|reword)/i.test(text)) {
    return 'george_instruction'
  }

  if (AUTHORITY_QUESTION.test(text)) return 'other_party'

  if (DIRECT_QUESTION.test(text) && !/\b(i|me|my|we|our)\b/i.test(text)) {
    return 'other_party'
  }

  if (/\b(i said|i told|i need to say|i want to ask|my boss|my doctor|the officer)\b/i.test(text)) {
    return 'george_instruction'
  }

  return 'user'
}

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
  const speaker = inferSpeaker(transcript)

  const shadowMap = String(input.shadowMap || '').trim()
  const lastFiveSeconds = String(input.lastFiveSeconds || transcript).trim()
  const hasShadow = shadowMap.length > 0 || lastFiveSeconds.length > 0

  let packet: LiveVoicePacket = {
    speaker,
    shouldSpeak: true,
    volley: '',
    cue: '',
    status: hasShadow ? 'Using room-state shadow.' : 'Reading the room.',
    confidence: 0.62,
    shadowUsed: hasShadow,
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
      volley: 'Yes, officer. May I reach for it?',
      cue: 'Hands visible. Move slowly.',
      status: 'Authority context. Stay calm.',
      confidence: 0.86,
      shadowUsed: hasShadow,
    }
  } else if (speaker === 'other_party') {
    packet = {
      speaker,
      shouldSpeak: true,
      volley: 'Let me answer that directly.',
      cue: 'Slow down. Do not rush.',
      status: 'They asked for a response.',
      confidence: 0.7,
      shadowUsed: hasShadow,
    }
  } else if (speaker === 'user') {
    packet = {
      speaker,
      shouldSpeak: true,
      volley: 'Pause. Let them answer.',
      cue: 'Hold eye contact.',
      status: 'User already spoke. Preserve momentum.',
      confidence: 0.68,
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
