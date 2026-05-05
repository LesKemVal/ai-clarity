export type Tier = 'smart' | 'intelligent' | 'brilliant'

export type ConversationProfile =
  | 'study'
  | 'speech'
  | 'negotiation'
  | 'everyday'

export type LiveGuidance = {
  signal: string
  say: string
}

export type UserDeliveryLevel = 'simple' | 'standard' | 'sharp'

export function detectUserDeliveryLevel(input: string, interimTranscript: string): UserDeliveryLevel {
  const text = `${input} ${interimTranscript}`.toLowerCase()

  if (/simplify|simple|plain english|plain language|break it down|i don't understand|i dont understand|confused/.test(text)) {
    return 'simple'
  }

  if (/be direct|be sharp|pressure|close|negotiate|objection|firm|boss|client/.test(text)) {
    return 'sharp'
  }

  return 'standard'
}

export function adaptCueForUser(cue: string, level: UserDeliveryLevel): string {
  if (level === 'simple') {
    return cue
      .replace("Cue: You’re conceding. Reset your position.", "Cue: You’re giving in. Start over.")
      .replace("Cue: Stop explaining. Control the next sentence.", "Cue: Stop explaining. Say one clear thing.")
      .replace("Cue: Pause. Ask a question.", "Cue: Pause. Ask one question.")
  }

  if (level === 'sharp') {
    return cue
      .replace("Cue: You’re conceding. Reset your position.", "Cue: You’re giving ground. Take control.")
      .replace("Cue: Stop explaining. Control the next sentence.", "Cue: Stop explaining. Lead the next sentence.")
      .replace("Cue: Pause. Ask a question.", "Cue: Pause. Make them answer.")
  }

  return cue
}

export type ConversationPersonProfile = {
  role: 'doctor' | 'lawyer' | 'authority' | 'gatekeeper' | 'buyer' | 'client' | 'family' | 'unknown'
  posture: 'helpful' | 'neutral' | 'resistant' | 'rushed' | 'confused' | 'pressuring'
  guidance: string
  confidence: number
  signals: string[]
}

export function detectConversationPersonProfile(input: string, interimTranscript: string): ConversationPersonProfile {
  const text = `${input} ${interimTranscript}`.toLowerCase().replace(/[’]/g, "'")

  let role: ConversationPersonProfile['role'] = 'unknown'
  let posture: ConversationPersonProfile['posture'] = 'neutral'

  if (/doctor|physician|nurse|clinic|hospital|symptom|pain|medication|prescription|diagnosis/.test(text)) {
    role = 'doctor'
  } else if (/lawyer|attorney|court|case|contract|legal|rights|document|lease|police/.test(text)) {
    role = 'lawyer'
  } else if (/manager|supervisor|officer|case worker|caseworker|agency|authority|official/.test(text)) {
    role = 'authority'
  } else if (/he's not available|she's not available|who is this|what is this regarding|send an email|gatekeeper/.test(text)) {
    role = 'gatekeeper'
  } else if (/price|cost|budget|not interested|buyer|purchase|deal|offer/.test(text)) {
    role = 'buyer'
  } else if (/client|customer|prospect|lead/.test(text)) {
    role = 'client'
  } else if (/mom|dad|son|daughter|wife|husband|family/.test(text)) {
    role = 'family'
  }

  if (/not interested|no thanks|don't need|dont need|already have|have someone/.test(text)) {
    posture = 'resistant'
  } else if (/hurry|quickly|i don't have time|dont have time|rushed|busy/.test(text)) {
    posture = 'rushed'
  } else if (/i don't understand|i dont understand|confused|what do you mean|say that again/.test(text)) {
    posture = 'confused'
  } else if (/today|right now|must|have to|deadline|pressure/.test(text)) {
    posture = 'pressuring'
  } else if (/yes|okay|sure|i can help|tell me more/.test(text)) {
    posture = 'helpful'
  }

  const guidance =
    role === 'doctor'
      ? 'State symptoms clearly. Keep it factual. Ask what matters most next.'
      : role === 'lawyer'
      ? 'Ask for plain-language meaning. Do not agree to what you do not understand.'
      : role === 'authority'
      ? 'Stay calm. Ask for the exact requirement and next step.'
      : role === 'gatekeeper'
      ? 'Keep it short. Earn permission for the next 20 seconds.'
      : role === 'buyer' || role === 'client'
      ? 'Clarify value before defending price.'
      : role === 'family'
      ? 'Say the point without escalating the emotion.'
      : 'Clarify who they are, what they need, and what outcome matters.'

  const signals: string[] = []

  if (/price|cost|budget/.test(text)) signals.push("price objection")
  if (/not interested|no thanks/.test(text)) signals.push("rejection")
  if (/maybe|not sure|i guess/.test(text)) signals.push("hesitation")
  if (/call me|later|next week/.test(text)) signals.push("delay")

  const roleBoost = role !== 'unknown' ? 0.15 : 0
  const postureBoost = posture !== 'neutral' ? 0.15 : 0
  const signalBoost = Math.min(signals.length * 0.15, 0.45)

  const confidence = Math.min(0.95, 0.35 + roleBoost + postureBoost + signalBoost)

  return {
    role,
    posture,
    guidance,
    confidence,
    signals
  }
}

export type ConversationTriggerCode = {
  phrase: string
  profile: ConversationProfile
  signal?: string
}

const DEFAULT_TRIGGER_CODES: ConversationTriggerCode[] = [
  { phrase: 'maybe i’ll ask', profile: 'negotiation', signal: 'NEGOTIATION CODE' },
  { phrase: 'maybe ill ask', profile: 'negotiation', signal: 'NEGOTIATION CODE' },
  { phrase: 'let me think on that', profile: 'negotiation', signal: 'HOLD POSITION CODE' },
  { phrase: 'say that one more time', profile: 'everyday', signal: 'CLARITY CODE' },
]

export function detectConversationTriggerCode(
  input: string,
  interimTranscript: string,
  codes: ConversationTriggerCode[] = DEFAULT_TRIGGER_CODES
): ConversationProfile | null {
  const text = `${input} ${interimTranscript}`.toLowerCase().replace(/[’]/g, "'")

  const match = codes.find((code) => {
    const phrase = code.phrase.toLowerCase().replace(/[’]/g, "'")
    return phrase.length > 0 && text.includes(phrase)
  })

  return match?.profile ?? null
}

export function detectConversationProfile(input: string, interimTranscript: string): ConversationProfile {
  const triggerProfile = detectConversationTriggerCode(input, interimTranscript)
  if (triggerProfile) return triggerProfile

  const profileSource = `${input} ${interimTranscript}`.toLowerCase()

  if (/drivers? license|permit|road test|ged|cna|exam|test|quiz|study|certification|license prep/.test(profileSource)) {
    return 'study'
  }

  if (/speech|lecture|presentation|audience|stage|podium|talk/.test(profileSource)) {
    return 'speech'
  }

  if (/price|cost|deal|offer|terms|contract|negotiat|counter|close|buyer|seller/.test(profileSource)) {
    return 'negotiation'
  }

  return 'everyday'
}

export function buildLiveGuidance({
  liveMode,
  currentTier,
  isListening,
  interimTranscript,
  input,
  profile,
}: {
  liveMode: boolean
  currentTier: Tier
  isListening: boolean
  interimTranscript: string
  input: string
  profile: ConversationProfile
}): LiveGuidance | null {
  if (!liveMode || currentTier !== 'brilliant') return null

  if (profile === 'study') {
    if (isListening) {
      return {
        signal: 'LISTEN FOR THE GAP',
        say: 'Say: “Break that down one step at a time.”',
      }
    }

    if (interimTranscript.trim()) {
      return {
        signal: 'TEACH TO CLARITY',
        say: 'Say: “Let’s slow that down and make it plain.”',
      }
    }

    if (input.trim()) {
      return {
        signal: 'CHECK UNDERSTANDING',
        say: 'Say: “Here’s what I think it means.”',
      }
    }

    return {
      signal: 'HOLD THE LESSON',
      say: 'Say: “Give me a second to think it through.”',
    }
  }

  if (profile === 'speech') {
    if (isListening) {
      return {
        signal: 'COMMAND THE ROOM',
        say: 'Say: “Let me make this plain.”',
      }
    }

    if (interimTranscript.trim()) {
      return {
        signal: 'LAND THE POINT',
        say: 'Say: “Here’s the point that matters.”',
      }
    }

    if (input.trim()) {
      return {
        signal: 'SPEAK CLEANLY',
        say: 'Say: “Let me say this directly.”',
      }
    }

    return {
      signal: 'HOLD THE FLOOR',
      say: 'Say: “Give me a second.”',
    }
  }

  if (profile === 'negotiation') {
    const transcript = interimTranscript.toLowerCase()

    if (isListening) {
      return {
        signal: 'READ THE ROOM',
        say: 'Say: “Hold on—walk me through that.”',
      }
    }

    if (transcript.includes('price') || transcript.includes('cost')) {
      return {
        signal: 'FOCUS ON TERMS',
        say: 'Say: “What exactly are you offering?”',
      }
    }

    if (transcript.includes('now') || transcript.includes('today')) {
      return {
        signal: 'PRESSURE DETECTED',
        say: 'Say: “I’m not rushing this.”',
      }
    }

    if (interimTranscript.trim()) {
      return {
        signal: 'CLARITY GAP',
        say: 'Say: “Be more specific.”',
      }
    }

    if (input.trim()) {
      return {
        signal: 'STATE YOUR POSITION',
        say: 'Say: “Here’s what I need.”',
      }
    }

    return {
      signal: 'HOLD POSITION',
      say: 'Say: “Give me a second.”',
    }
  }

  if (isListening) {
    return {
      signal: 'STAY PRESENT',
      say: 'Say: “Hold on—say that again.”',
    }
  }

  if (interimTranscript.trim()) {
    return {
      signal: 'GET CLEAR',
      say: 'Say: “Tell me exactly what you mean.”',
    }
  }

  if (input.trim()) {
    return {
      signal: 'SAY IT CLEAN',
      say: 'Say: “Here’s what I mean.”',
    }
  }

  return {
    signal: 'HOLD POSITION',
    say: 'Say: “Give me a second.”',
  }
}

export function buildBrilliantLiveTriggerResponse(
  raw: string,
  currentTier: Tier,
  activePromptContext: string | null,
  conversationMode: string | null
) {
  if (currentTier !== 'brilliant') return null

  const brilliantContextActive =
    (activePromptContext && activePromptContext.startsWith('brilliant_')) ||
    (conversationMode && conversationMode.startsWith('brilliant_'))

  if (!brilliantContextActive) return null

  const text = raw.trim().toLowerCase()
  if (!text) return null

  const triggerMap: Record<string, string> = {
    hmm: 'Let me think about that for a second.',
    'i see': 'I hear you. Keep going.',
    next: 'Here’s the next clean line: let’s slow this down and separate the numbers.',
    reset: 'Let’s reset for a second. I want to make sure we’re being precise.',
    pressure: 'They’re trying to speed the decision up. Slow the room down and get clarity first.',
  }

  return triggerMap[text] ?? null
}


export type VocalState =
  | 'calm'
  | 'rushed'
  | 'dismissive'
  | 'pressuring'
  | 'uncertain'

export function detectVocalState(interimTranscript: string): VocalState {
  const text = interimTranscript.toLowerCase()

  if (/right now|today|hurry|quick|asap/.test(text)) return 'pressuring'

  if (/not interested|just send|whatever|fine/.test(text)) return 'dismissive'

  if (/uh|um|i guess|maybe|not sure/.test(text)) return 'uncertain'

  if (interimTranscript.length > 0 && interimTranscript.length < 25) return 'rushed'

  return 'calm'
}


export function decideNextMove({
  vocalState,
  posture,
  signals,
}: {
  vocalState: string
  posture: string
  signals: string[]
}) {
  // highest priority — loss of control
  if (signals.includes('conceding')) {
    return "Cue: You’re conceding. Reset your position."
  }

  // voice pressure
  if (vocalState === 'pressuring') {
    return "Cue: They’re rushing you. Slow this down."
  }

  // dismissal
  if (vocalState === 'dismissive') {
    return "Cue: They’re brushing you off. Regain control."
  }

  // over-explaining
  if (signals.includes('overexplaining')) {
    return "Cue: Stop explaining. Control the next sentence."
  }

  // fallback
  return null
}
