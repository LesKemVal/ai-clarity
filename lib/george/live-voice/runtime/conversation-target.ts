export type ConversationTarget =
  | 'george'
  | 'room'
  | 'unknown'

export type ConversationTargetResult = {
  target: ConversationTarget
  confidence: number
  reason: string
}

const GEORGE_GUIDANCE_PATTERNS = [
  /\bhelp me\b/i,
  /\bwhat should i do\b/i,
  /\bwhat do i do\b/i,
  /\bwhat do you need from me\b/i,
  /\bwhat am i missing\b/i,
  /\bhow do i answer\b/i,
  /\bhow do i respond\b/i,
  /\bthoughts\b/i,
  /\bany ideas\b/i,
  /\bi'?m stuck\b/i,
  /\bgive me a line\b/i,
  /\bcoach me\b/i,
  /\bgeorge\b/i,
]

const ROOM_PATTERNS = [
  /\btell me about yourself\b/i,
  /\bwhy should we hire you\b/i,
  /\bwhat are your strengths\b/i,
  /\bwhat are your weaknesses\b/i,
  /\bcan you explain\b/i,
  /\bwhy did you\b/i,
]

export function detectConversationTarget(
  text: string
): ConversationTargetResult {
  const clean = text.trim()

  if (!clean) {
    return {
      target: 'unknown',
      confidence: 0,
      reason: 'Empty transcript.',
    }
  }

  if (GEORGE_GUIDANCE_PATTERNS.some((p) => p.test(clean))) {
    return {
      target: 'george',
      confidence: 0.9,
      reason: 'User appears to be seeking guidance from GEORGE.',
    }
  }

  if (ROOM_PATTERNS.some((p) => p.test(clean))) {
    return {
      target: 'room',
      confidence: 0.85,
      reason: 'Transcript appears directed at the user.',
    }
  }

  return {
    target: 'unknown',
    confidence: 0.4,
    reason: 'Target could not be determined.',
  }
}
