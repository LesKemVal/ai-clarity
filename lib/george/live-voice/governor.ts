import type { LiveSpeakerRole, LiveVoiceGovernorInput, LiveVoicePacket } from './types'
import { analyzeRoom, inferLiveSpeaker } from './runtime/room-analyzer'
import { detectConversationSignals } from './runtime/conversation-signals'
import { selectLiveResponsePolicy } from './runtime/response-policy'
import { classifyLiveSpeakerIntent } from './runtime/speaker-intent'

const TEACHER_LANGUAGE =
  /(try saying|you should|it might be helpful|consider|the best approach|what you want to do|proof points|target number|schedule a meeting|book time)/i

const USER_AGENCY_OVERRIDE =
  /^(ok|okay|got it|i got it|i've got it|ive got it|hold|pause|wait|one second|give me a second|let me think|stop)$/i

function cleanLine(value: string, maxWords: number) {
  const words = value
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return words.slice(0, maxWords).join(' ').replace(/[,:;.-]*$/, '')
}

function hasUserAgencyOverride(transcript: string) {
  return USER_AGENCY_OVERRIDE.test(transcript.trim().toLowerCase())
}

function shouldRescueUser(input: {
  roomPressure?: string
  interruptionRisk?: number
  speakerIntentConfidence?: number
  speakerIntent?: string
}) {
  const pressureHigh =
    input.roomPressure === 'high' || input.roomPressure === 'authority'

  const interruptionHigh = Number(input.interruptionRisk || 0) >= 0.78
  const intentWeakOrAmbiguous =
    input.speakerIntent === 'ambiguous' ||
    Number(input.speakerIntentConfidence || 0) < 0.58

  return pressureHigh || interruptionHigh || intentWeakOrAmbiguous
}

function applySpeakerIntentAuthority(
  packet: LiveVoicePacket,
  transcript: string
): LiveVoicePacket {
  if (hasUserAgencyOverride(transcript)) {
    return {
      ...packet,
      shouldSpeak: false,
      volley: '',
      cue: '',
      status: `${packet.status} User agency override: GEORGE yields.`.trim(),
      confidence: Math.max(packet.confidence || 0, 0.82),
    }
  }

  if (packet.speakerIntentShouldSpeak) return packet
  if (!packet.speakerIntentShouldHold) return packet

  const rescue = shouldRescueUser({
    roomPressure: packet.roomPressure,
    interruptionRisk: packet.interruptionRisk,
    speakerIntent: packet.speakerIntent,
    speakerIntentConfidence: packet.speakerIntentConfidence,
  })

  if (rescue) {
    return {
      ...packet,
      shouldSpeak: true,
      status: `${packet.status} Runtime rescue: user may be losing control; GEORGE may steer unless overridden.`.trim(),
      confidence: Math.max(packet.confidence || 0, 0.76),
    }
  }

  return {
    ...packet,
    shouldSpeak: false,
    volley: '',
    cue: '',
    status: `${packet.status} Speaker intent gate: hold. ${packet.speakerIntentReason || ''}`.trim(),
    confidence: Math.max(packet.confidence || 0, 0.72),
  }
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

  const speakerIntent = classifyLiveSpeakerIntent({
    transcript,
    knownUserSpeaking: speakerInference.speaker === 'user',
  })

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
    speakerIntent: speakerIntent.intent,
    speakerIntentConfidence: speakerIntent.confidence,
    speakerIntentReason: speakerIntent.reason,
    speakerIntentShouldSpeak: speakerIntent.shouldSpeak,
    speakerIntentShouldHold: speakerIntent.shouldHold,
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
      speakerIntent: speakerIntent.intent,
      speakerIntentConfidence: speakerIntent.confidence,
      speakerIntentReason: speakerIntent.reason,
      speakerIntentShouldSpeak: speakerIntent.shouldSpeak,
      speakerIntentShouldHold: speakerIntent.shouldHold,
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
    responseMode: policy.mode,
    responseTone: policy.tone,
    responseCompression: policy.compression,
    deliveryStyle: policy.deliveryStyle,
    intervention: policy.intervention,
    speakerIntent: speakerIntent.intent,
    speakerIntentConfidence: speakerIntent.confidence,
    speakerIntentReason: speakerIntent.reason,
    speakerIntentShouldSpeak: speakerIntent.shouldSpeak,
    speakerIntentShouldHold: speakerIntent.shouldHold,
  }

  packet.volley = cleanLine(packet.volley, input.audio ? 7 : 12)
  packet.cue = cleanLine(packet.cue, input.audio ? 7 : 10)
  packet.liveAssistMode = input.liveAssistMode || 'cues'

  if (packet.speakerIntent === 'assisted_continuation' && !packet.cue) {
    packet.cue = input.audio ? 'Finish clean. Goal first.' : 'Continue cleanly toward the goal.'
  }

  if (input.audio && packet.speakerIntent !== 'addressed_to_george') {
    if (packet.liveAssistMode === 'lines') {
      packet.cue = ''
      packet.status = `${packet.status} Audio mode: repeatable-line only.`.trim()
    } else {
      packet.volley = ''
      packet.status = `${packet.status} Audio mode: cue-only.`.trim()
    }
  }

  if (TEACHER_LANGUAGE.test(packet.volley)) {
    packet.volley = 'Say it plainly.'
    packet.cue = 'Short. Calm. Direct.'
    packet.status = 'Teacher language blocked.'
  }

  return applySpeakerIntentAuthority(packet, transcript)
}
