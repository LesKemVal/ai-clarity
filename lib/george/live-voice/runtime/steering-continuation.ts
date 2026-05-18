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
  direction: 'hold' | 'soften' | 'negotiate' | 'clarify' | 'compress' | 'redirect' | 'buy_time'
  style: SteeringContinuationStyle
  continuation: string
  cue: string
  reason: string
}

function clean(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
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

  if (phrase === 'hmm' || phrase === 'hmmm' || phrase === 'one second' || phrase === 'let me think') {
    return {
      matched: true,
      phrase,
      direction: 'buy_time',
      style,
      continuation: negotiationContext
        ? '...before I answer, let’s make sure we are solving the same problem.'
        : '...let me make sure I answer the right question.',
      cue: 'Buy time. Do not rush.',
      reason: 'User is buying time without exposing GEORGE.',
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
