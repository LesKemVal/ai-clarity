export type OpportunityState =
  | 'open_now'
  | 'open_later'
  | 'pivot_to_secondary'
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
  primaryOutcome?: string
  secondaryOutcome?: string
}

export type OpportunityStateDecision = {
  state: OpportunityState
  label: string
  cue: string
  reason: string
  primaryOutcome: string
  secondaryOutcome: string | null
  doctrine: string[]
}

function clean(value: unknown) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

export function determineOpportunityState(input: OpportunityStateInput): OpportunityStateDecision {
  const trajectory = clean(input.trajectory)
  const salvageObjectiveId = clean(input.salvageObjectiveId)
  const movementState = clean(input.movementState)
  const confidence = Number(input.confidence ?? 0.5)
  const primaryOutcome = clean(input.primaryOutcome) || 'the desired outcome'
  const secondaryOutcome = clean(input.secondaryOutcome) || null

  const doctrine = [
    'GEORGE listens continuously to assess whether the desired outcome remains viable.',
    'GEORGE changes strategy before changing destination.',
    'If the primary outcome is not achievable now, GEORGE seeks another meaningful chance to pursue it later.',
    'If that path fails and the user supplied a secondary outcome, GEORGE may pivot to it.',
    'The user retains agency and responsibility in the room.',
    'GEORGE may advise, complete, or warn, but the user decides what to use.',
    'Trust improves signal; signal improves adaptation.',
  ]

  if (salvageObjectiveId === 'exit_cleanly' || trajectory === 'escalating_conflict') {
    return {
      state: 'exit_cleanly',
      label: 'Exit Cleanly',
      cue: 'Preserve dignity and future options.',
      reason: 'The room is too hot to force the desired outcome safely.',
      primaryOutcome,
      secondaryOutcome,
      doctrine,
    }
  }

  if (salvageObjectiveId === 'identify_decision_maker' || movementState === 'blocked') {
    return {
      state: 'blocked_for_now',
      label: 'Blocked For Now',
      cue: 'Find the real decision path.',
      reason: 'The desired outcome may not be achievable in this moment with the current authority or signal.',
      primaryOutcome,
      secondaryOutcome,
      doctrine,
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
      reason: 'The best move is another meaningful opportunity to pursue the primary outcome later.',
      primaryOutcome,
      secondaryOutcome,
      doctrine,
    }
  }

  if (
    secondaryOutcome &&
    (
      salvageObjectiveId === 'discover_objection' ||
      salvageObjectiveId === 'reduce_resistance' ||
      trajectory === 'resistance_hardening' ||
      trajectory === 'drifting'
    )
  ) {
    return {
      state: 'pivot_to_secondary',
      label: 'Pivot To Secondary',
      cue: `Shift toward ${secondaryOutcome}.`,
      reason: 'The primary outcome is meeting resistance; the known secondary outcome may now be the best useful gain.',
      primaryOutcome,
      secondaryOutcome,
      doctrine,
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
      primaryOutcome,
      secondaryOutcome,
      doctrine,
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
      primaryOutcome,
      secondaryOutcome,
      doctrine,
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
      primaryOutcome,
      secondaryOutcome,
      doctrine,
    }
  }

  return {
    state: 'open_later',
    label: 'Open Later',
    cue: 'Keep the path alive.',
    reason: 'The desired outcome remains possible, but the room does not yet show enough signal to force closure.',
    primaryOutcome,
    secondaryOutcome,
    doctrine,
  }
}
