import type { GeorgeCueCategory, GeorgeLocalCue } from './cue-types.js'

type CuePattern = {
  category: GeorgeCueCategory
  pattern: RegExp
  cue: string
  reason: string
  confidence: number
}

export const GEORGE_CUE_PATTERNS: CuePattern[] = [
  {
    category: 'pricing',
    pattern: /\b(price|cost|budget|expensive|fee|valuation|money|worth)\b/i,
    cue: 'Anchor value first.',
    reason: 'Money pressure detected.',
    confidence: 0.86,
  },
  {
    category: 'objection',
    pattern: /\b(not interested|concern|problem|issue|risk|disagree|pushback)\b/i,
    cue: 'Ask what changed.',
    reason: 'Objection or resistance detected.',
    confidence: 0.82,
  },
  {
    category: 'clarification',
    pattern: /\b(why|how|what do you mean|explain|clarify)\b/i,
    cue: 'Clarify before answering.',
    reason: 'Question pressure detected.',
    confidence: 0.74,
  },
  {
    category: 'uncertainty',
    pattern: /\b(not sure|maybe|i think|i guess|unclear|confused)\b/i,
    cue: 'Narrow the choice.',
    reason: 'Uncertainty detected.',
    confidence: 0.78,
  },
  {
    category: 'stall',
    pattern: /\b(wait|hold on|give me a second|pause|slow down)\b/i,
    cue: 'Slow the room.',
    reason: 'Stall or pacing signal detected.',
    confidence: 0.84,
  },
  {
    category: 'timeline',
    pattern: /\b(when|deadline|timeline|schedule|launch|deliver|ship)\b/i,
    cue: 'Ask for timing.',
    reason: 'Timeline pressure detected.',
    confidence: 0.78,
  },
  {
    category: 'agreement',
    pattern: /\b(yes|agree|that works|sounds good|okay|deal)\b/i,
    cue: 'Confirm the next step.',
    reason: 'Agreement signal detected.',
    confidence: 0.72,
  },
  {
    category: 'pressure',
    pattern: /\b(now|urgent|immediately|today|need this|must)\b/i,
    cue: 'Control the pace.',
    reason: 'Urgency pressure detected.',
    confidence: 0.8,
  },
]

export function matchCuePattern(text: string): GeorgeLocalCue | null {
  for (const item of GEORGE_CUE_PATTERNS) {
    if (item.pattern.test(text)) {
      return {
        category: item.category,
        cue: item.cue,
        reason: item.reason,
        confidence: item.confidence,
      }
    }
  }

  return null
}
