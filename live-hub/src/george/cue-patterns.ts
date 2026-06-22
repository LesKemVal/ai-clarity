import type { GeorgeCueCategory, GeorgeLocalCue } from './cue-types.js'

type CuePattern = {
  category: GeorgeCueCategory
  pattern: RegExp
  cue: string
  reason: string
  confidence: number
  priority: number
}

export const GEORGE_CUE_PATTERNS: CuePattern[] = [
  {
    category: 'transportation_constraint',
    pattern: /\b(no|without|need|needs|missing|lost|lack|don't have|do not have|dont have|can't get|cannot get|can't reach|cannot reach)\b.{0,28}\b(vehicle|car|ride|transportation|transport|bus|train|uber|lyft|driver)\b|\b(vehicle|car|ride|transportation|transport|bus|train|uber|lyft|driver)\b.{0,28}\b(unavailable|missing|broke|broken|gone|late|delayed|cancelled|needed|blocked)\b/i,
    cue: 'Transportation is the constraint.',
    reason: 'Transportation or mobility blocker detected.',
    confidence: 0.88,
    priority: 92,
  },
  {
    category: 'budget_constraint',
    pattern: /\b(can't afford|cannot afford|too expensive|not enough money|short on cash|budget is tight|funding gap|no funding|need funding|need money|cash flow|cashflow)\b/i,
    cue: 'Clarify the budget constraint.',
    reason: 'Budget or funding blocker detected.',
    confidence: 0.86,
    priority: 90,
  },
  {
    category: 'authority_constraint',
    pattern: /\b(need approval|needs approval|approval first|sign off|sign-off|authorize|authorized|decision maker|decision-maker|permission|board approval|manager approval)\b/i,
    cue: 'Find who can approve this.',
    reason: 'Authority or approval blocker detected.',
    confidence: 0.86,
    priority: 88,
  },
  {
    category: 'timeline_constraint',
    pattern: /\b(deadline|running out of time|out of time|too late|delay|delayed|behind schedule|need it by|due today|due tomorrow|time-sensitive|time sensitive)\b/i,
    cue: 'Separate deadline from priority.',
    reason: 'Timeline constraint detected.',
    confidence: 0.84,
    priority: 86,
  },
  {
    category: 'information_gap',
    pattern: /\b(don't know|do not know|dont know|missing information|need more information|need more details|unclear|not clear|unknown|not enough detail|not enough information)\b/i,
    cue: 'Identify the missing fact.',
    reason: 'Information gap detected.',
    confidence: 0.82,
    priority: 82,
  },
  {
    category: 'trust_concern',
    pattern: /\b(don't trust|do not trust|dont trust|skeptical|hesitant|concerned|not comfortable|lack of trust|credibility|prove it|proof)\b/i,
    cue: 'Build trust before pushing.',
    reason: 'Trust or credibility concern detected.',
    confidence: 0.84,
    priority: 86,
  },
  {
    category: 'access_constraint',
    pattern: /\b(can't access|cannot access|locked out|no access|access denied|credentials|password|account locked|not available|unavailable|blocked from)\b/i,
    cue: 'Restore access before advancing.',
    reason: 'Access blocker detected.',
    confidence: 0.84,
    priority: 86,
  },
  {
    category: 'resource_constraint',
    pattern: /\b(we don't have|we do not have|we dont have|i don't have|i do not have|i dont have|lack|missing|short on|not enough)\b.{0,34}\b(people|staff|team|materials|equipment|tools|resources|support|space|inventory|supply|supplies)\b/i,
    cue: 'Name the resource gap.',
    reason: 'Resource constraint detected.',
    confidence: 0.82,
    priority: 84,
  },
  {
    category: 'pricing',
    pattern: /\b(price|cost|budget|expensive|fee|valuation|money|worth)\b/i,
    cue: 'Anchor value first.',
    reason: 'Money pressure detected.',
    confidence: 0.86,
    priority: 90,
  },
  {
    category: 'objection',
    pattern: /\b(not interested|concern|problem|issue|risk|disagree|pushback)\b/i,
    cue: 'Ask what changed.',
    reason: 'Objection or resistance detected.',
    confidence: 0.82,
    priority: 80,
  },
  {
    category: 'clarification',
    pattern: /\b(why|how|what do you mean|explain|clarify)\b/i,
    cue: 'Clarify before answering.',
    reason: 'Question pressure detected.',
    confidence: 0.74,
    priority: 50,
  },
  {
    category: 'uncertainty',
    pattern: /\b(not sure|maybe|i think|i guess|unclear|confused)\b/i,
    cue: 'Narrow the choice.',
    reason: 'Uncertainty detected.',
    confidence: 0.78,
    priority: 65,
  },
  {
    category: 'stall',
    pattern: /\b(wait|hold on|give me a second|pause|slow down)\b/i,
    cue: 'Slow the room.',
    reason: 'Stall or pacing signal detected.',
    confidence: 0.84,
    priority: 75,
  },
  {
    category: 'timeline',
    pattern: /\b(when|deadline|timeline|schedule|launch|deliver|ship)\b/i,
    cue: 'Ask for timing.',
    reason: 'Timeline pressure detected.',
    confidence: 0.78,
    priority: 70,
  },
  {
    category: 'agreement',
    pattern: /\b(yes|agree|that works|sounds good|okay|deal)\b/i,
    cue: 'Confirm the next step.',
    reason: 'Agreement signal detected.',
    confidence: 0.72,
    priority: 55,
  },
  {
    category: 'pressure',
    pattern: /\b(now|urgent|immediately|today|need this|must)\b/i,
    cue: 'Control the pace.',
    reason: 'Urgency pressure detected.',
    confidence: 0.8,
    priority: 85,
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
        priority: item.priority,
      }
    }
  }

  return null
}
