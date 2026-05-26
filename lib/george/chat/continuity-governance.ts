export type ContinuityClassification =
  | 'session_signal'
  | 'explicit_goal'
  | 'memory_candidate'
  | 'runtime_context'
  | 'unknown'

export type ContinuityGovernanceDecision = {
  classification: ContinuityClassification
  mayPersistAsGoal: boolean
  mayPersistAsMemory: boolean
  requiresExplicitUserAction: boolean
  note: string
}

export function classifyContinuitySignal(input: {
  text?: string | null
  source?: string | null
  explicitSaveRequested?: boolean
  explicitGoalRequested?: boolean
}): ContinuityGovernanceDecision {
  const text = String(input.text || '').trim()
  const source = String(input.source || 'user_input')

  if (input.explicitGoalRequested) {
    return {
      classification: 'explicit_goal',
      mayPersistAsGoal: true,
      mayPersistAsMemory: false,
      requiresExplicitUserAction: false,
      note: 'User explicitly classified this as a goal. It may enter goal/trajectory continuity.',
    }
  }

  if (input.explicitSaveRequested) {
    return {
      classification: 'memory_candidate',
      mayPersistAsGoal: false,
      mayPersistAsMemory: true,
      requiresExplicitUserAction: false,
      note: 'User explicitly requested save/keep. It may enter memory continuity but not goal continuity unless classified as a goal.',
    }
  }

  if (source === 'live_transcript' || source === 'third_party_speech') {
    return {
      classification: 'runtime_context',
      mayPersistAsGoal: false,
      mayPersistAsMemory: false,
      requiresExplicitUserAction: true,
      note: 'LIVE transcript or third-party speech can inform the current room but must not silently become memory or goal continuity.',
    }
  }

  if (!text) {
    return {
      classification: 'unknown',
      mayPersistAsGoal: false,
      mayPersistAsMemory: false,
      requiresExplicitUserAction: true,
      note: 'No meaningful continuity signal detected.',
    }
  }

  return {
    classification: 'session_signal',
    mayPersistAsGoal: false,
    mayPersistAsMemory: false,
    requiresExplicitUserAction: true,
    note: 'User text can guide the current session, but must not silently become a saved goal or durable memory.',
  }
}

export function buildContinuityGovernanceNote(decision: ContinuityGovernanceDecision) {
  return `
CONTINUITY GOVERNANCE
- Classification: ${decision.classification}
- May persist as goal: ${decision.mayPersistAsGoal ? 'yes' : 'no'}
- May persist as memory: ${decision.mayPersistAsMemory ? 'yes' : 'no'}
- Explicit action required: ${decision.requiresExplicitUserAction ? 'yes' : 'no'}
- Rule: ${decision.note}
`.trim()
}
