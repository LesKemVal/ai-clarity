export type SalvageObjectiveId =
  | 'none'
  | 'preserve_access'
  | 'secure_next_step'
  | 'discover_objection'
  | 'identify_decision_maker'
  | 'reduce_resistance'
  | 'improve_perception'
  | 'exit_cleanly'
  | 'create_reconsideration'

export type SalvageObjective = {
  id: SalvageObjectiveId
  label: string
  cue: string
  reason: string
}

export function selectSalvageObjective(input: {
  text: string
  trajectory?: string
  powerFrame?: string
  roomPressure?: string
  emotionalVelocity?: string
  objectiveId?: string
}): SalvageObjective {
  const text = input.text.toLowerCase()

  if (/decision maker|owner|manager|boss|board|committee|not here|not available|isn't here|is not here/i.test(text)) {
    return {
      id: 'identify_decision_maker',
      label: 'Identify Decision Maker',
      cue: 'Find the real decision path.',
      reason: 'The current room may not contain final authority.',
    }
  }

  if (/send|follow up|circle back|next week|later|email me|call me/i.test(text)) {
    return {
      id: 'secure_next_step',
      label: 'Secure Next Step',
      cue: 'Get a clear next step.',
      reason: 'The room is offering continuation instead of final decision.',
    }
  }

  if (
    input.trajectory === 'resistance_hardening' ||
    /not interested|no budget|too expensive|not now|already have|doesn't work/i.test(text)
  ) {
    return {
      id: 'discover_objection',
      label: 'Discover Objection',
      cue: 'Learn the real objection.',
      reason: 'The original ask is meeting resistance; information is the available gain.',
    }
  }

  if (
    input.trajectory === 'escalating_conflict' ||
    input.emotionalVelocity === 'spiking'
  ) {
    return {
      id: 'exit_cleanly',
      label: 'Exit Cleanly',
      cue: 'Preserve dignity and future access.',
      reason: 'The room is too hot to force the original outcome safely.',
    }
  }

  if (
    input.roomPressure === 'authority' ||
    input.powerFrame === 'authority_controls'
  ) {
    return {
      id: 'improve_perception',
      label: 'Improve Perception',
      cue: 'Leave composed and credible.',
      reason: 'Authority topology favors perception and future leverage over forcing the outcome.',
    }
  }

  if (input.trajectory === 'drifting') {
    return {
      id: 'reduce_resistance',
      label: 'Reduce Resistance',
      cue: 'Make the room easier to re-enter.',
      reason: 'Momentum is drifting; lower friction before pushing again.',
    }
  }

  return {
    id: 'none',
    label: 'Primary Objective',
    cue: '',
    reason: 'Primary objective remains viable.',
  }
}
