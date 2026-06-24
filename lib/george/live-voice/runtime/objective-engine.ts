import { detectConversationSignals } from './conversation-signals'

export type LiveObjectiveId =
  | 'stay_safe'
  | 'secure_raise'
  | 'book_appointment'
  | 'deescalate'
  | 'hold_frame'
  | 'advance_outcome'
  | 'clarify'

export type LiveObjective = {
  id: LiveObjectiveId
  label: string
  anchor: string
  failureMode: string
}

export const LIVE_OBJECTIVES: Record<LiveObjectiveId, LiveObjective> = {
  stay_safe: {
    id: 'stay_safe',
    label: 'Stay Safe',
    anchor: 'Keep the user calm, compliant, and physically safe.',
    failureMode: 'arguing, sudden movement, overexplaining',
  },
  secure_raise: {
    id: 'secure_raise',
    label: 'Secure Raise',
    anchor: 'Keep the conversation on compensation and value.',
    failureMode: 'apologizing, rambling, retreating from the ask',
  },
  book_appointment: {
    id: 'book_appointment',
    label: 'Book Appointment',
    anchor: 'Move toward a clear next scheduled step.',
    failureMode: 'pitching too long or accepting a vague no',
  },
  deescalate: {
    id: 'deescalate',
    label: 'De-escalate',
    anchor: 'Lower tension and preserve control.',
    failureMode: 'matching heat or defending too much',
  },
  hold_frame: {
    id: 'hold_frame',
    label: 'Hold Frame',
    anchor: 'Keep the user composed and centered on their position.',
    failureMode: 'chasing approval or surrendering the frame',
  },
  advance_outcome: {
    id: 'advance_outcome',
    label: 'Advance Outcome',
    anchor: 'Move the current room signal toward the user’s desired outcome.',
    failureMode: 'collecting information when the next useful move is already available',
  },
  clarify: {
    id: 'clarify',
    label: 'Clarify',
    anchor: 'Get the room clear enough for the next move.',
    failureMode: 'guessing, overcommitting, or answering the wrong issue',
  },
}

export type LiveObjectiveHypothesis = {
  objective: LiveObjectiveId
  confidence: number
  reason: string
  source: 'keyword_signal' | 'conversation_signal' | 'fallback'
}

export function inferObjectiveHypothesis(text: string): LiveObjectiveHypothesis {
  const clean = text.toLowerCase()
  const signals = detectConversationSignals(clean)

  if (/officer|license|registration|insurance|pulled you over|id\b/.test(clean)) {
    return {
      objective: 'stay_safe',
      confidence: 0.78,
      reason: 'Authority-safety language detected.',
      source: 'keyword_signal',
    }
  }

  if (/raise|salary|compensation|pay/.test(clean)) {
    return {
      objective: 'secure_raise',
      confidence: 0.64,
      reason: 'Compensation language detected.',
      source: 'keyword_signal',
    }
  }

  if (/\bappointment\b|\bschedule\b|\bcalendar\b|\bbook\b/.test(clean)) {
    return {
      objective: 'book_appointment',
      confidence: 0.62,
      reason: 'Scheduling language detected.',
      source: 'keyword_signal',
    }
  }

  if (/angry|argument|calm|tension|hostile|upset/.test(clean)) {
    return {
      objective: 'deescalate',
      confidence: 0.66,
      reason: 'Conflict or emotional pressure language detected.',
      source: 'keyword_signal',
    }
  }

  if (signals.has('proof_challenge')) {
    return {
      objective: 'hold_frame',
      confidence: 0.6,
      reason: 'Proof challenge signal detected.',
      source: 'conversation_signal',
    }
  }

  if (/interview|leadership|experience|hiring|job|role|candidate|resume/.test(clean)) {
    return {
      objective: 'advance_outcome',
      confidence: 0.58,
      reason: 'Interview or role language detected.',
      source: 'keyword_signal',
    }
  }

  return {
    objective: 'clarify',
    confidence: 0.35,
    reason: 'No strong objective signal detected; clarify remains a fallback hypothesis.',
    source: 'fallback',
  }
}

export function inferObjectiveFromText(text: string): LiveObjectiveId {
  return inferObjectiveHypothesis(text).objective
}

export function reinforceObjective(
  volley: string,
  objective: LiveObjective
) {
  const clean = volley.trim()

  if (!clean) return clean

  if (objective.id === 'secure_raise' && !/compensation|raise|value|pay/i.test(clean)) {
    return 'Bring it back to compensation.'
  }

  if (objective.id === 'stay_safe' && /argue|challenge|refuse/i.test(clean)) {
    return 'Stay calm. Comply safely.'
  }

  if (objective.id === 'book_appointment' && !/time|schedule|appointment|when/i.test(clean)) {
    return 'Ask for the best time.'
  }

  return clean
}
