export type SteeringContinuationStyle = 'cue' | 'repeatable_line'

export type SteeringContinuationInput = {
  phrase: string
  room?: string | null
  objective?: string | null
  preference?: SteeringContinuationStyle
}

export type SteeringContinuationResult = {
  matched: boolean
  phrase: string
  direction:
    | 'hold'
    | 'soften'
    | 'firm'
    | 'negotiate'
    | 'clarify'
    | 'compress'
    | 'redirect'
    | 'buy_time'
    | 'scan_options'
    | 'reframe'
    | 'next_move'
  style: SteeringContinuationStyle
  continuation: string
  cue: string
  reason: string
}

function clean(value: string) {
  return value.trim().toLowerCase().replace(/[“”]/g, '"').replace(/['']/g, "'").replace(/\s+/g, ' ')
}

function objectiveHint(objective?: string | null) {
  const value = String(objective || '').trim()
  return value ? value : ''
}

export function buildSteeringContinuation(input: SteeringContinuationInput): SteeringContinuationResult {
  const phrase = clean(input.phrase)
  const room = String(input.room || '').trim()
  const objective = objectiveHint(input.objective)
  const style = input.preference || 'repeatable_line'

  const negotiationContext = /negotiation|deal|settlement|offer|price|salary|contract|split|amount/i.test(
    `${room} ${objective}`
  )

  if (phrase === 'hmm' || phrase === 'hmmm' || phrase === 'one second' || phrase === 'give me a second' || phrase === 'let me think') {
    return {
      matched: true,
      phrase,
      direction: 'buy_time',
      style,
      continuation: negotiationContext
        ? '...before I answer, let’s make sure we are solving the same problem.'
        : '...let me make sure I answer the right question.',
      cue: 'Take the pause. Do not rush.',
      reason: 'User is buying time without exposing GEORGE.',
    }
  }

  if (phrase === 'ok and' || phrase === 'okay and' || phrase === 'ok, and' || phrase === 'okay, and') {
    return {
      matched: true,
      phrase,
      direction: 'next_move',
      style,
      continuation: negotiationContext
        ? '...then the next question is what actually moves this forward.'
        : '...then the next useful thing is to narrow the choice.',
      cue: 'Continue. Move to the next useful step.',
      reason: 'Continuation phrase asks GEORGE to carry the user into the next move.',
    }
  }

  if (phrase === 'let me see' || phrase === "let's see" || phrase === 'lets see') {
    return {
      matched: true,
      phrase,
      direction: 'scan_options',
      style,
      continuation: '...there are really two things to separate here.',
      cue: 'Scan options. Separate the real issue.',
      reason: 'User is asking for a room-safe scan before speaking.',
    }
  }

  if (phrase === 'fair point' || phrase === "that's fair" || phrase === 'thats fair') {
    return {
      matched: true,
      phrase,
      direction: 'soften',
      style,
      continuation: '...and I think the fair way to look at it is this.',
      cue: 'Acknowledge first. Then pivot.',
      reason: 'User needs to preserve trust while redirecting.',
    }
  }

  if (phrase === 'what i mean is') {
    return {
      matched: true,
      phrase,
      direction: 'reframe',
      style,
      continuation: '...the cleaner way to say it is this.',
      cue: 'Reframe. Clean the point.',
      reason: 'User is asking GEORGE to reshape the sentence naturally.',
    }
  }

  if (phrase === "let's be clear" || phrase === 'lets be clear') {
    return {
      matched: true,
      phrase,
      direction: 'firm',
      style,
      continuation: '...the point I want to be clear about is this.',
      cue: 'Firm posture. Say it plainly.',
      reason: 'User wants a stronger, clearer frame.',
    }
  }

  if (phrase === 'ok' || phrase === 'okay' || phrase === 'right') {
    return {
      matched: true,
      phrase,
      direction: negotiationContext ? 'negotiate' : 'clarify',
      style,
      continuation: negotiationContext
        ? '...let’s assume both sides are trying to land somewhere fair.'
        : '...so the real question is what matters most right now.',
      cue: negotiationContext
        ? 'Reset the frame. Fairness first.'
        : 'Clarify the frame.',
      reason: 'Acknowledgment phrase can safely bridge into a stronger frame.',
    }
  }

  if (phrase === 'shorter') {
    return {
      matched: true,
      phrase,
      direction: 'compress',
      style,
      continuation: '...the short version is this.',
      cue: 'Compress. One point.',
      reason: 'User requested compression.',
    }
  }

  if (phrase === 'pause' || phrase === 'hold' || phrase === 'stop') {
    return {
      matched: true,
      phrase,
      direction: 'hold',
      style,
      continuation: '',
      cue: 'Hold. Let silence work.',
      reason: 'User requested silence or stop.',
    }
  }

  return {
    matched: false,
    phrase,
    direction: 'hold',
    style,
    continuation: '',
    cue: 'Hold until the room gives a cleaner signal.',
    reason: 'No steering continuation matched.',
  }
}
