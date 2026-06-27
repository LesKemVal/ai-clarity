import type { LiveSpeakerRole, LiveVoiceGovernorInput, LiveVoicePacket } from './types'
import { analyzeRoom, inferLiveSpeaker } from './runtime/room-analyzer'
import { detectConversationSignals } from './runtime/conversation-signals'
import { selectLiveResponsePolicy } from './runtime/response-policy'
import { classifyLiveSpeakerIntent } from './runtime/speaker-intent'
import { buildSteeringContinuation } from './runtime/steering-continuation'
import { evaluateContinuationCandidate } from './runtime/continuation-intelligence'
import { generateContinuation } from './runtime/continuation-generator'
import { legacyAssistModeFromSupportStyle, normalizeLiveSupportStyle } from '../live-runtime/support-style'
import { determineCueDepth } from '../live-runtime/cue-depth'

const TEACHER_LANGUAGE =
  /(try saying|you should|it might be helpful|consider|the best approach|what you want to do|proof points|target number|schedule a meeting|book time)/i

const USER_AGENCY_OVERRIDE =
  /^(got it|i got it|i've got it|ive got it|hold|pause|wait|stop)$/i

function cleanLine(value: string, maxWords: number) {
  const clean = value
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()

  const words = clean.split(/\s+/).filter(Boolean)

  if (words.length <= maxWords) {
    return clean.replace(/[,:;.-]*$/, '')
  }

  const sentenceBoundary = clean.match(/^(.+?[.!?])\s+/)

  if (sentenceBoundary) {
    const sentenceWords = sentenceBoundary[1]
      .split(/\s+/)
      .filter(Boolean)

    if (sentenceWords.length <= maxWords + 4) {
      return sentenceBoundary[1].replace(/[,:;.-]*$/, '')
    }
  }

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

function applySteeringContinuationAuthority(
  packet: LiveVoicePacket,
  input: LiveVoiceGovernorInput,
  transcript: string
): LiveVoicePacket {
  const phrase = transcript.trim()
  const continuation = buildSteeringContinuation({
    phrase,
    room: input.contextHint || '',
    objective: input.lastFiveSeconds || input.shadowMap || '',
    preference: packet.supportStyle === 'continue' ? 'repeatable_line' : 'cue',
  })

  if (!continuation.matched) return packet

  if (packet.supportStyle === 'continue') {
    return {
      ...packet,
      shouldSpeak: true,
      volley: cleanLine(`${phrase} ${continuation.continuation}`, input.audio ? 18 : 28),
      cue: '',
      intervention:
        continuation.direction === 'buy_time' || continuation.direction === 'hold'
          ? 'hold'
          : continuation.direction === 'reframe'
            ? 'redirect'
            : 'speak',
      deliveryBehavior:
        continuation.direction === 'buy_time' || continuation.direction === 'hold'
          ? 'silence'
          : continuation.direction === 'soften'
            ? 'calm_operational'
            : continuation.direction === 'firm'
              ? 'direct'
              : 'compressed_operational',
      responseCompression:
        continuation.direction === 'compress' || input.audio ? 'tight' : packet.responseCompression,
      status: `${packet.status} Steering continuation: ${continuation.reason}`.trim(),
      confidence: Math.max(packet.confidence || 0, 0.82),
      speakerIntentShouldHold: false,
      speakerIntentShouldSpeak: true,
    }
  }

  return {
    ...packet,
    shouldSpeak: true,
    volley: input.audio ? '' : packet.volley,
    cue: cleanLine(continuation.cue, input.audio ? 8 : 14),
    intervention:
      continuation.direction === 'buy_time' || continuation.direction === 'hold'
        ? 'hold'
        : continuation.direction === 'reframe'
          ? 'redirect'
          : 'speak',
    deliveryBehavior:
      continuation.direction === 'buy_time' || continuation.direction === 'hold'
        ? 'silence'
        : continuation.direction === 'soften'
          ? 'calm_operational'
          : continuation.direction === 'firm'
            ? 'direct'
            : 'compressed_operational',
    responseCompression:
      continuation.direction === 'compress' || input.audio ? 'tight' : packet.responseCompression,
    status: `${packet.status} Steering cue: ${continuation.reason}`.trim(),
    confidence: Math.max(packet.confidence || 0, 0.82),
    speakerIntentShouldHold: false,
    speakerIntentShouldSpeak: true,
  }
}

function applyRuntimeMemory(packet: LiveVoicePacket, input: LiveVoiceGovernorInput) {
  const memory = input.runtimeMemory
  if (!memory) return packet

  let runtimeForce: 'light' | 'balanced' | 'strong' = 'balanced'

  if ((memory.acceptedCarryCount || 0) >= 3) {
    runtimeForce = 'strong'
  }

  if ((memory.overrideCount || 0) >= 3) {
    runtimeForce = 'light'
  }

  if (runtimeForce === 'strong' && packet.supportStyle === 'cue' && packet.cue) {
    packet.cue = packet.cue
      ? `${packet.cue.replace(/[.\s]*$/, '')}. Keep moving.`
      : 'Keep moving.'
  }

  if (runtimeForce === 'light') {
    packet.confidence = Math.min(packet.confidence, 0.74)
  }

  if (memory.communicationBaseline === 'executive') {
    packet.responseTone = packet.responseTone || 'executive'
    packet.responseCompression = packet.responseCompression || 'measured'
    packet.deliveryBehavior = packet.deliveryBehavior || 'structured_operational'
    packet.status = `${packet.status} Communication baseline: executive.`.trim()
  }

  if (memory.communicationBaseline === 'conversational') {
    packet.responseTone = packet.responseTone || 'conversational'
    packet.responseCompression = packet.responseCompression || 'natural'
    packet.deliveryBehavior = packet.deliveryBehavior || 'natural_operational'
    packet.status = `${packet.status} Communication baseline: conversational.`.trim()
  }

  if (memory.communicationBaseline === 'adaptive' || !memory.communicationBaseline) {
    packet.status = `${packet.status} Communication baseline: adaptive.`.trim()
  }

  if (memory.roomCommunicationNotes?.length) {
    packet.runtimeSupportSummary = [
      packet.runtimeSupportSummary,
      `Room communication: ${memory.roomCommunicationNotes.slice(-2).join(' / ')}`,
    ].filter(Boolean).join(' ')
  }

  return {
    ...packet,
    runtimeForce,
    runtimeMemoryApplied: true,
  }
}

function applyRuntimeSupport(packet: LiveVoicePacket, input: LiveVoiceGovernorInput) {
  const runtimeSupport = input.runtimeSupport

  if (!runtimeSupport) return packet

  const capabilityIds = runtimeSupport.selectedCapabilityIds || []
  const overlay = runtimeSupport.deliveryOverlay || null
  const resourceEstimate = runtimeSupport.resourceEstimate || null

  let nextPacket = {
    ...packet,
    runtimeSupportApplied: true,
  }

  if (overlay?.cadenceProfile === 'Sharp') {
    nextPacket.responseCompression = 'tight'
    nextPacket.deliveryBehavior = 'compressed_operational'
  }

  if (overlay?.cadenceProfile === 'Measured') {
    nextPacket.responseCompression = 'measured'
    nextPacket.deliveryBehavior = 'calm_operational'
  }

  if (overlay?.qualificationStyle === 'Direct') {
    nextPacket.responseTone = 'firm'
  }

  if (overlay?.silenceTolerance === 'High') {
    nextPacket.intervention = 'hold_unless_necessary'
  }

  if (capabilityIds.includes('pressure_management')) {
    nextPacket.roomPressure = nextPacket.roomPressure === 'authority'
      ? 'authority'
      : 'high'

    nextPacket.confidence = Math.max(nextPacket.confidence, 0.82)
  }

  if (capabilityIds.includes('negotiation_support')) {
    nextPacket.responseTone = 'negotiation'
  }

  if (capabilityIds.includes('decision_support')) {
    nextPacket.status = `${nextPacket.status} Decision-support runtime active.`.trim()
  }

  if (resourceEstimate?.totalCents) {
    nextPacket.runtimeSupportSummary = `Estimated runtime cost ~${resourceEstimate.totalCents}¢`
  }

  return nextPacket
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
  const supportStyle = normalizeLiveSupportStyle(
    input.supportStyle || input.deliveryStyle || input.liveAssistMode
  )

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
    supportStyle,
    runtimeIntent: input.runtimeIntent,
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
    room: input.contextHint || '',
    desiredOutcome: input.desiredOutcome || '',
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
    responseForm: policy.responseForm,
    responseTone: policy.tone,
    responseCompression: policy.compression,
    deliveryBehavior: policy.deliveryBehavior,
    intervention: policy.intervention,
    speakerIntent: speakerIntent.intent,
    speakerIntentConfidence: speakerIntent.confidence,
    speakerIntentReason: speakerIntent.reason,
    speakerIntentShouldSpeak: speakerIntent.shouldSpeak,
    speakerIntentShouldHold: speakerIntent.shouldHold,
  }

  packet.volley = cleanLine(packet.volley, input.audio ? 14 : 22)
  packet.cue = cleanLine(packet.cue, input.audio ? 12 : 18)
  packet.supportStyle = supportStyle
  packet.runtimeIntent = input.runtimeIntent
  packet.cueDepth = input.cueDepth || determineCueDepth({
    supportStyle,
    runtimeIntent: input.runtimeIntent,
    roomPressure: packet.roomPressure,
    interruptionRisk: packet.interruptionRisk,
    confidence: packet.confidence,
    responseForm: packet.responseForm,
    audio: input.audio,
  })
  packet.liveAssistMode = input.liveAssistMode || legacyAssistModeFromSupportStyle(supportStyle)

  const possibleOutcomeShift =
    speakerIntent.intent === 'correction_signal' &&
    /\b(what matters now|now is|instead|before we|before i|shift|different outcome|new outcome|pilot|investment)\b/i.test(
      `${transcript} ${input.activeOutcome || ''} ${shadowMap}`
    )

  if (possibleOutcomeShift) {
    packet.shouldSpeak = true
    packet.volley = 'Confirm the outcome shift before moving forward'
    packet.cue = 'Name the new target. Keep the old one parked.'
    packet.status = `${packet.status} Possible outcome shift detected; preserve user agency before switching objectives.`.trim()
    packet.responseForm = 'direction'
    packet.deliveryBehavior = 'direct'
    packet.intervention = 'speak'
    packet.speakerIntentShouldSpeak = true
    packet.speakerIntentShouldHold = false
  }

  const continuationCandidate = evaluateContinuationCandidate({
    transcript,
    deliveryStyle: packet.supportStyle,
    speakerIntent: packet.speakerIntent,
  })

  if (continuationCandidate.candidate) {
    packet.speakerIntent = 'assisted_continuation'
    packet.speakerIntentConfidence = continuationCandidate.confidence
    packet.speakerIntentReason = continuationCandidate.reason
    packet.speakerIntentShouldSpeak = true
    packet.speakerIntentShouldHold = false
    packet.status = `${packet.status} Continuation candidate: ${continuationCandidate.reason}`.trim()
  } else if (continuationCandidate.reason !== 'Continuation mode is not active.') {
    packet.status = `${packet.status} Continuation held: ${continuationCandidate.reason}`.trim()
  }

  if (packet.speakerIntent === 'assisted_continuation') {
    const generatedContinuation = generateContinuation({
      transcript,
      objective:
        (input.runtimeSupport as { objective?: string } | null | undefined)?.objective ||
        input.lastFiveSeconds ||
        input.contextHint ||
        '',
      room: input.contextHint || '',
      audio: input.audio,
      assessment: {
        state: continuationCandidate.explicitTrigger ? 'unfinished' : 'unfinished',
        confidence: continuationCandidate.confidence,
        likelyMissing: continuationCandidate.explicitTrigger
          ? ['completion of unfinished thought']
          : ['meaningful completion'],
        preservedObjective: Boolean(input.lastFiveSeconds || input.contextHint),
        interrupted: !continuationCandidate.explicitTrigger,
        reason: continuationCandidate.reason,
      },
    })

    if (generatedContinuation.continuation) {
      packet.volley = cleanLine(
        generatedContinuation.continuation,
        input.audio ? 14 : 24
      )
      packet.cue = ''
      packet.shouldSpeak = true
      packet.confidence = Math.max(packet.confidence || 0, generatedContinuation.confidence)
      packet.status = `${packet.status} ${generatedContinuation.reason}`.trim()
    } else if (!packet.cue) {
      packet.cue = input.audio ? 'Finish clean. Goal first.' : 'Continue cleanly toward the goal.'
    }
  }

  if (input.audio && packet.speakerIntent !== 'addressed_to_george') {
    if (packet.supportStyle === 'continue') {
      packet.cue = ''
      packet.status = `${packet.status} Audio mode: repeatable-line only.`.trim()
    } else if (packet.shouldSpeak && packet.volley) {
      packet.status = `${packet.status} Audio mode: cue-supported line.`.trim()
    } else {
      packet.volley = ''
      packet.status = `${packet.status} Audio mode: cue-only.`.trim()
    }
  }

  packet = applyRuntimeMemory(packet, input)
  packet = applyRuntimeSupport(packet, input)

  if (
    TEACHER_LANGUAGE.test(packet.volley) &&
    packet.speakerIntent !== 'addressed_to_george'
  ) {
    packet.volley = 'Answer directly.'
    packet.cue = 'Give the user a usable line, not a coaching label.'
    packet.status = 'Teacher language compressed into direct instruction.'
  }

  packet = applySteeringContinuationAuthority(packet, input, transcript)

  return applySpeakerIntentAuthority(packet, transcript)
}
