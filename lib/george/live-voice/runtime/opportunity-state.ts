export type OpportunityState =
  | 'open_now'
  | 'open_later'
  | 'preserve_access'
  | 'blocked_for_now'
  | 'closed_for_now'
  | 'exit_cleanly'

export type OpportunityStateInput = {
  trajectory?: string
  salvageObjectiveId?: string
  movementState?: string
  roomPressure?: string
  confidence?: number
}

export type OpportunityStateDecision = {
  state: OpportunityState
  label: string
  cue: string
  reason: string
}

export function determineOpportunityState(input: OpportunityStateInput): OpportunityStateDecision {
  const trajectory = String(input.trajectory || '')
  const salvageObjectiveId = String(input.salvageObjectiveId || '')
  const movementState = String(input.movementState || '')
  const confidence = Number(input.confidence ?? 0.5)

  if (salvageObjectiveId === 'exit_cleanly' || trajectory === 'escalating_conflict') {
    return {
      state: 'exit_cleanly',
      label: 'Exit Cleanly',
      cue: 'Preserve dignity and future options.',
      reason: 'The room is too hot to force the desired outcome safely.',
    }
  }

  if (salvageObjectiveId === 'identify_decision_maker' || movementState === 'blocked') {
    return {
      state: 'blocked_for_now',
      label: 'Blocked For Now',
      cue: 'Find the real decision path.',
      reason: 'The desired outcome may not be achievable in this moment with the current room authority or signal.',
    }
  }

  if (
    salvageObjectiveId === 'secure_next_step' ||
    salvageObjectiveId === 'create_reconsideration'
  ) {
    return {
      state: 'open_later',
      label: 'Open Later',
      cue: 'Secure the next useful chance.',
      reason: 'The room is offering continuation instead of final resolution.',
    }
  }

  if (
    salvageObjectiveId === 'preserve_access' ||
    salvageObjectiveId === 'improve_perception' ||
    input.roomPressure === 'authority' ||
    trajectory === 'authority_risk'
  ) {
    return {
      state: 'preserve_access',
      label: 'Preserve Access',
      cue: 'Leave composed and credible.',
      reason: 'Preserving access and perception is more valuable than forcing the outcome now.',
    }
  }

  if (
    salvageObjectiveId === 'discover_objection' ||
    salvageObjectiveId === 'reduce_resistance' ||
    trajectory === 'resistance_hardening' ||
    trajectory === 'drifting'
  ) {
    return {
      state: 'closed_for_now',
      label: 'Closed For Now',
      cue: 'Learn what would need to change.',
      reason: 'The original outcome is meeting resistance; the available gain is information or reduced friction.',
    }
  }

  if (
    trajectory === 'decision_ready' ||
    movementState === 'closing' ||
    (movementState === 'advancing' && confidence >= 0.62)
  ) {
    return {
      state: 'open_now',
      label: 'Open Now',
      cue: 'Move toward the next decision.',
      reason: 'The room appears ready for a useful step toward the desired outcome.',
    }
  }

  return {
    state: 'open_later',
    label: 'Open Later',
    cue: 'Keep the path alive.',
    reason: 'The desired outcome remains possible, but the room does not yet show enough signal to force closure.',
  }
}
