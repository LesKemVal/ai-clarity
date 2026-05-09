export type LiveObjectiveId =
  | 'stay_safe'
  | 'secure_raise'
  | 'book_appointment'
  | 'deescalate'
  | 'hold_frame'
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
  clarify: {
    id: 'clarify',
    label: 'Clarify',
    anchor: 'Get the room clear enough for the next move.',
    failureMode: 'guessing, overcommitting, or answering the wrong issue',
  },
}

export function inferObjectiveFromText(text: string): LiveObjectiveId {
  const clean = text.toLowerCase()

  if (/officer|license|registration|insurance|pulled you over|id\b/.test(clean)) {
    return 'stay_safe'
  }

  if (/raise|salary|compensation|pay/.test(clean)) {
    return 'secure_raise'
  }

  if (/appointment|schedule|book|calendar|meet/.test(clean)) {
    return 'book_appointment'
  }

  if (/angry|argument|calm|tension|hostile|upset/.test(clean)) {
    return 'deescalate'
  }

  if (/prove|why should|convince|not enough|boundary/.test(clean)) {
    return 'hold_frame'
  }

  return 'clarify'
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
