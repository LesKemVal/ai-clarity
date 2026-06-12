export type LiveRecoveryOptionId =
  | 'repeat_last_question'
  | 'paraphrase_understanding'
  | 'buy_time'
  | 'take_break'
  | 'check_phone'
  | 'ask_clarifying_question'
  | 'step_out'
  | 'ignore_signal'
  | 'none_realistic'

export type LiveRecoveryOption = {
  id: LiveRecoveryOptionId
  label: string
  helper: string
  defaultLine?: string
  safetyRank: number
}

export type LiveRecoveryConstraints = {
  selected: LiveRecoveryOptionId[]
  preferred?: LiveRecoveryOptionId
  notes?: string
}

export type LiveRecoveryRecommendationInput = {
  constraints: LiveRecoveryConstraints
  event:
    | 'context_unclear'
    | 'objective_drift'
    | 'audio_unclear'
    | 'room_pressure_high'
    | 'user_overloaded'
    | 'facts_missing'
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
}

export type LiveRecoveryRecommendation = {
  option: LiveRecoveryOptionId
  line: string
  reason: string
  requiresPhone: boolean
  requiresBreak: boolean
}

export const LIVE_RECOVERY_OPTIONS: LiveRecoveryOption[] = [
  {
    id: 'repeat_last_question',
    label: 'I can ask someone to repeat themselves.',
    helper: 'Safest context recovery. The room hears a normal clarification request.',
    defaultLine: 'Could you repeat that?',
    safetyRank: 1,
  },
  {
    id: 'paraphrase_understanding',
    label: 'I can paraphrase what I understood.',
    helper: 'Safe when you need GEORGE to regain thread without exposing support.',
    defaultLine: 'Let me make sure I understood that.',
    safetyRank: 2,
  },
  {
    id: 'buy_time',
    label: 'I can naturally buy time.',
    helper: 'Useful when pressure rises and GEORGE needs a little more signal.',
    defaultLine: 'Let me think about that for a second.',
    safetyRank: 3,
  },
  {
    id: 'ask_clarifying_question',
    label: 'I can ask clarifying questions.',
    helper: 'Useful when the room allows direct clarification.',
    defaultLine: 'Can you clarify what matters most there?',
    safetyRank: 4,
  },
  {
    id: 'take_break',
    label: 'I can take a short break.',
    helper: 'Best for major objective changes or when private recalibration is needed.',
    defaultLine: 'Can we take a quick break?',
    safetyRank: 5,
  },
  {
    id: 'check_phone',
    label: 'I can discreetly check my phone.',
    helper: 'Allows GEORGE to surface private options without the room hearing strategy.',
    safetyRank: 6,
  },
  {
    id: 'step_out',
    label: 'I can step out briefly.',
    helper: 'Highest-control option when the room permits it.',
    defaultLine: 'Give me one moment. I’ll be right back.',
    safetyRank: 7,
  },
  {
    id: 'ignore_signal',
    label: 'I can ignore GEORGE if the room makes that safest.',
    helper: 'The user remains in control. GEORGE continues tracking silently.',
    safetyRank: 8,
  },
  {
    id: 'none_realistic',
    label: 'None of these are realistic.',
    helper: 'GEORGE should rely on low-exposure diagnostic completions and avoid impossible recovery paths.',
    safetyRank: 9,
  },
]

function has(constraints: LiveRecoveryConstraints, option: LiveRecoveryOptionId) {
  return constraints.selected.includes(option)
}

function optionLine(option: LiveRecoveryOptionId) {
  return LIVE_RECOVERY_OPTIONS.find((item) => item.id === option)?.defaultLine || ''
}

export function recommendLiveRecovery(input: LiveRecoveryRecommendationInput): LiveRecoveryRecommendation {
  const { constraints, event } = input

  if (constraints.preferred && has(constraints, constraints.preferred)) {
    return {
      option: constraints.preferred,
      line: optionLine(constraints.preferred),
      reason: 'User selected this recovery path as preferred for this room.',
      requiresPhone: constraints.preferred === 'check_phone',
      requiresBreak: constraints.preferred === 'take_break' || constraints.preferred === 'step_out',
    }
  }

  if (event === 'objective_drift') {
    if (has(constraints, 'check_phone')) {
      return {
        option: 'check_phone',
        line: '',
        reason: 'Objective may have changed. Private phone confirmation is available.',
        requiresPhone: true,
        requiresBreak: false,
      }
    }

    if (has(constraints, 'take_break')) {
      return {
        option: 'take_break',
        line: optionLine('take_break'),
        reason: 'Objective may have changed and user can safely create room to recalibrate.',
        requiresPhone: false,
        requiresBreak: true,
      }
    }

    if (has(constraints, 'buy_time')) {
      return {
        option: 'buy_time',
        line: optionLine('buy_time'),
        reason: 'Objective may have changed, but only a short time-buying move is available.',
        requiresPhone: false,
        requiresBreak: false,
      }
    }
  }

  if (event === 'context_unclear' || event === 'audio_unclear') {
    if (has(constraints, 'repeat_last_question')) {
      return {
        option: 'repeat_last_question',
        line: optionLine('repeat_last_question'),
        reason: 'Safest recovery path for lost context or unclear audio.',
        requiresPhone: false,
        requiresBreak: false,
      }
    }

    if (has(constraints, 'paraphrase_understanding')) {
      return {
        option: 'paraphrase_understanding',
        line: optionLine('paraphrase_understanding'),
        reason: 'User can safely restate understanding to restore context.',
        requiresPhone: false,
        requiresBreak: false,
      }
    }
  }

  if (event === 'facts_missing') {
    if (has(constraints, 'ask_clarifying_question')) {
      return {
        option: 'ask_clarifying_question',
        line: optionLine('ask_clarifying_question'),
        reason: 'Facts are missing and the room allows direct clarification.',
        requiresPhone: false,
        requiresBreak: false,
      }
    }

    if (has(constraints, 'buy_time')) {
      return {
        option: 'buy_time',
        line: optionLine('buy_time'),
        reason: 'Facts are missing and buying time is safer than inventing facts.',
        requiresPhone: false,
        requiresBreak: false,
      }
    }
  }

  if (has(constraints, 'ignore_signal')) {
    return {
      option: 'ignore_signal',
      line: '',
      reason: 'No safer active recovery path is available; user can ignore GEORGE while GEORGE continues tracking.',
      requiresPhone: false,
      requiresBreak: false,
    }
  }

  return {
    option: 'none_realistic',
    line: '',
    reason: 'No selected recovery path is realistic in this room. GEORGE should rely on low-exposure support.',
    requiresPhone: false,
    requiresBreak: false,
  }
}

export const GEORGE_LIVE_RECOVERY_DOCTRINE = {
  liveEntryQuestion: 'If something changes unexpectedly in this room, what options are available to you?',
  principle: 'GEORGE should not recommend impossible recovery moves. It should reason from what the user can actually do in the room.',
  clarificationSignal: 'If GEORGE needs more signal, it should use a discreet nonverbal signal rather than speaking unrelated instructions into the user’s ear.',
  userAuthority: 'The user determines the safest recovery path. GEORGE adapts to the selected room constraints.',
  safestDefaults: ['repeat_last_question', 'paraphrase_understanding', 'buy_time'],
} as const
