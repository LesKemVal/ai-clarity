export type LiveSpeakerIntent =
  | 'addressed_to_george'
  | 'addressed_to_room'
  | 'steering_signal'
  | 'assisted_continuation'
  | 'confirmation_signal'
  | 'correction_signal'
  | 'room_speaker'
  | 'ambiguous'

export type LiveSpeakerIntentInput = {
  transcript: string
  knownUserSpeaking?: boolean
  previousIntent?: LiveSpeakerIntent | null
  activeRoom?: string | null
  objective?: string | null
}

export type LiveSpeakerIntentResult = {
  intent: LiveSpeakerIntent
  confidence: number
  shouldSpeak: boolean
  shouldHold: boolean
  shouldRemember: boolean
  reason: string
}

const GEORGE_ADDRESS_PATTERNS = [
  /^george[,.\s]/i,
  /\bhey george\b/i,
  /\bok george\b/i,
  /\bgeorge what\b/i,
  /\bgeorge help\b/i,
  /\bhelp me respond\b/i,
  /\bgive me (a )?(line|response|answer)\b/i,
  /\bwhat (do|should) i say\b/i,
  /\bwhat now\b/i,
  /\bcoach me\b/i,
]

const ASSISTED_CONTINUATION_PATTERNS = [
  /^hmm+[,\.\s]+\S+/i,
  /^ok(?:ay)?[,\.\s]+\S+/i,
  /^right[,\.\s]+\S+/i,
  /^maybe\s+(we|i|this|that)\b/i,
  /^i\s+(don’t|don't|dont)\s+know\b/i,
  /^i\s+guess\b/i,
]

const CONFIRMATION_PATTERNS = [
  /^m+\s*h+mm+$/i,
  /^mm+\s*hmm+$/i,
  /^uh\s*huh$/i,
  /^yes$/i,
  /^yeah$/i,
  /^that’s right$/i,
  /^thats right$/i,
]

const CORRECTION_PATTERNS = [
  /^actually\b/i,
  /^not that\b/i,
  /^not quite\b/i,
  /^different angle\b/i,
  /^different frame\b/i,
]

const STEERING_PATTERNS = [
  /^hmm+$/i,
  /^right$/i,
  /^ok(ay)?$/i,
  /^shorter$/i,
  /^more$/i,
  /^now$/i,
  /^soft$/i,
  /^firm$/i,
  /^say that simpler$/i,
]

const ROOM_RESPONSE_PATTERNS = [
  /\bthank you for (asking|having me|the time)\b/i,
  /\bmy experience\b/i,
  /\bwhat i would say is\b/i,
  /\bfrom my perspective\b/i,
  /\bi think we should\b/i,
  /\bthe reason is\b/i,
  /\bto answer your question\b/i,
]

const ROOM_SPEAKER_PATTERNS = [
  /\bdo you have\b/i,
  /\btell me about\b/i,
  /\bwhy should we\b/i,
  /\bwhat makes you\b/i,
  /\bcan you explain\b/i,
  /\bwhere do you see\b/i,
  /\bwhat are your\b/i,
  /\bhow would you\b/i,
]

function normalizeTranscript(transcript: string) {
  return transcript.trim().replace(/\s+/g, ' ')
}

function matchesAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text))
}

export function classifyLiveSpeakerIntent(input: LiveSpeakerIntentInput): LiveSpeakerIntentResult {
  const transcript = normalizeTranscript(input.transcript)

  if (!transcript) {
    return {
      intent: 'ambiguous',
      confidence: 0,
      shouldSpeak: false,
      shouldHold: true,
      shouldRemember: false,
      reason: 'No transcript content.',
    }
  }

  const lower = transcript.toLowerCase()
  const wordCount = lower.split(' ').filter(Boolean).length

  if (matchesAny(lower, GEORGE_ADDRESS_PATTERNS)) {
    return {
      intent: 'addressed_to_george',
      confidence: 0.92,
      shouldSpeak: true,
      shouldHold: false,
      shouldRemember: true,
      reason: 'Direct GEORGE address or explicit request for help.',
    }
  }

  if (matchesAny(lower, ASSISTED_CONTINUATION_PATTERNS)) {
    return {
      intent: 'assisted_continuation',
      confidence: wordCount <= 8 ? 0.78 : 0.66,
      shouldSpeak: true,
      shouldHold: false,
      shouldRemember: true,
      reason: 'Natural cadence continuation. User is carrying the floor and may need GEORGE to shape the next words toward the objective.',
    }
  }

  if (matchesAny(lower, CONFIRMATION_PATTERNS)) {
    return {
      intent: 'confirmation_signal',
      confidence: 0.86,
      shouldSpeak: false,
      shouldHold: true,
      shouldRemember: true,
      reason: 'User confirmed GEORGE is tracking the room correctly.',
    }
  }

  if (matchesAny(lower, CORRECTION_PATTERNS)) {
    return {
      intent: 'correction_signal',
      confidence: 0.84,
      shouldSpeak: false,
      shouldHold: true,
      shouldRemember: true,
      reason: 'User corrected GEORGE posture, frame, or room interpretation.',
    }
  }

  if (matchesAny(lower, STEERING_PATTERNS)) {
    return {
      intent: 'steering_signal',
      confidence: wordCount <= 4 ? 0.82 : 0.66,
      shouldSpeak: false,
      shouldHold: true,
      shouldRemember: true,
      reason: 'Short steering phrase. Hold by default unless runtime context asks for a cue.',
    }
  }

  if (!input.knownUserSpeaking && matchesAny(lower, ROOM_SPEAKER_PATTERNS)) {
    return {
      intent: 'room_speaker',
      confidence: 0.74,
      shouldSpeak: false,
      shouldHold: true,
      shouldRemember: true,
      reason: 'Likely other party speaking or asking the user a question.',
    }
  }

  if (input.knownUserSpeaking && matchesAny(lower, ROOM_RESPONSE_PATTERNS)) {
    return {
      intent: 'addressed_to_room',
      confidence: 0.74,
      shouldSpeak: false,
      shouldHold: true,
      shouldRemember: true,
      reason: 'Likely user speaking to the room, not GEORGE.',
    }
  }

  if (input.knownUserSpeaking && wordCount >= 7) {
    return {
      intent: 'addressed_to_room',
      confidence: 0.58,
      shouldSpeak: false,
      shouldHold: true,
      shouldRemember: true,
      reason: 'Longer user utterance without GEORGE address is likely room-directed speech.',
    }
  }

  if (!input.knownUserSpeaking && wordCount >= 5) {
    return {
      intent: 'room_speaker',
      confidence: 0.54,
      shouldSpeak: false,
      shouldHold: true,
      shouldRemember: true,
      reason: 'Likely room audio without a direct GEORGE request.',
    }
  }

  return {
    intent: 'ambiguous',
    confidence: 0.42,
    shouldSpeak: false,
    shouldHold: true,
    shouldRemember: true,
    reason: 'Insufficient signal. Preserve context and avoid unnecessary interruption.',
  }
}
