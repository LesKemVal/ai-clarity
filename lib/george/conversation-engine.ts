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
