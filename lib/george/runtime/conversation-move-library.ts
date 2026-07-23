export type GeorgeConversationMove =
  | 'answer'
  | 'ask'
  | 'clarify'
  | 'anchor'
  | 'reframe'
  | 'summarize'
  | 'validate'
  | 'challenge'
  | 'redirect'
  | 'slow'
  | 'close'
  | 'explore'
  | 'probe'
  | 'confirm'
  | 'pause'

export type GeorgeConversationMoveDefinition = {
  id: GeorgeConversationMove
  purpose: string
  whenToUse: string
  whenNotToUse: string
  expectedOperationalValue: 'low' | 'medium' | 'high'
  assumptionSensitivity: 'low' | 'medium' | 'high'
  liveCompatibility: boolean
  normalCompatibility: boolean
}

export type SignalAcquisitionMoveNeed =
  | 'desired_outcome'
  | 'audience_decision'
  | 'brief_use'

export type SignalAcquisitionMoveContext = {
  signalNeed: SignalAcquisitionMoveNeed
  phase?: 'early' | 'active' | 'preparation' | 'recovery'
  pressure?: boolean
  executive?: boolean
}

export type SignalAcquisitionMoveVariant = {
  style:
    | 'exploratory'
    | 'clarifying'
    | 'executive'
    | 'recovery'
    | 'preparation'
  question: string
}

const SIGNAL_ACQUISITION_VARIANTS: Record<
  SignalAcquisitionMoveNeed,
  Record<SignalAcquisitionMoveVariant['style'], string>
> = {
  desired_outcome: {
    exploratory: 'What are you hoping comes out of this?',
    clarifying: 'If this goes well, what changes afterward?',
    executive: 'What is the single outcome you want to protect?',
    recovery: 'Before we go further, what result matters most?',
    preparation: 'When you enter that conversation, what will success look like?',
  },
  audience_decision: {
    exploratory: 'Who are you trying to reach, and what matters to them?',
    clarifying: 'Who is this for, and what decision should it make easier?',
    executive: 'Who is the decision-maker, and what must they conclude?',
    recovery: 'Before we build further, who must this move and toward what decision?',
    preparation: 'Who will see this, and what should it help them decide?',
  },
  brief_use: {
    exploratory: 'Who needs this, and what would make it useful?',
    clarifying: 'Who will use it, and what should become clearer afterward?',
    executive: 'Who owns the decision, and what must the brief establish?',
    recovery: 'Before we continue, who is the brief for and what must it resolve?',
    preparation: 'Who will use the brief, and what should it help them understand or decide?',
  },
}

export function resolveSignalAcquisitionMoveVariant(
  context: SignalAcquisitionMoveContext
): SignalAcquisitionMoveVariant {
  const style: SignalAcquisitionMoveVariant['style'] =
    context.phase === 'recovery'
      ? 'recovery'
      : context.executive
        ? 'executive'
        : context.pressure
          ? 'clarifying'
          : context.phase === 'early'
            ? 'exploratory'
            : 'preparation'

  return {
    style,
    question: SIGNAL_ACQUISITION_VARIANTS[context.signalNeed][style],
  }
}


const MOVE_LIBRARY: Record<GeorgeConversationMove, GeorgeConversationMoveDefinition> = {
  answer: {
    id: 'answer',
    purpose: 'Answer the immediate request with the minimum sufficient response that advances the active outcome without exceeding the selected move.',
    whenToUse: 'The request is sufficiently clear and a direct response has more value than delaying for clarification.',
    whenNotToUse: 'A material ambiguity, contradiction, or room risk makes a direct answer likely to mislead or concede too much.',
    expectedOperationalValue: 'high',
    assumptionSensitivity: 'medium',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  ask: {
    id: 'ask',
    purpose: 'Use a question as a conversational move when the answer materially improves the next decision or changes the interaction.',
    whenToUse: 'One focused question can resolve a decision, expose a constraint, shift burden, or improve the probability of the outcome.',
    whenNotToUse: 'The room has already supplied the answer, the user likely knows it is established, or the question merely satisfies curiosity.',
    expectedOperationalValue: 'high',
    assumptionSensitivity: 'high',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  clarify: {
    id: 'clarify',
    purpose: 'Narrow the operative issue before the user answers, defends, commits, or concedes.',
    whenToUse: 'The objection, request, or decision standard remains materially ambiguous.',
    whenNotToUse: 'The operative issue is already explicit in the room or in the established conversation context.',
    expectedOperationalValue: 'high',
    assumptionSensitivity: 'high',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  anchor: {
    id: 'anchor',
    purpose: 'Reconnect the conversation to the active outcome, constraint, evidence, or standard that should govern the next move.',
    whenToUse: 'The conversation is drifting, pressure is pulling away from the objective, or a tradeoff must remain visible.',
    whenNotToUse: 'The current topic already advances the outcome and restating the anchor would sound repetitive or defensive.',
    expectedOperationalValue: 'high',
    assumptionSensitivity: 'low',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  reframe: {
    id: 'reframe',
    purpose: 'Change the governing frame without changing the active outcome.',
    whenToUse: 'The current framing disadvantages the user, obscures the real issue, or creates a false tradeoff.',
    whenNotToUse: 'The other party has not accepted the current frame or the reframe would evade a legitimate question.',
    expectedOperationalValue: 'high',
    assumptionSensitivity: 'medium',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  summarize: {
    id: 'summarize',
    purpose: 'Restore shared understanding and continuity before the next substantive move.',
    whenToUse: 'The conversation has become fragmented, interrupted, complex, or uncertain about what has been established.',
    whenNotToUse: 'The room is moving cleanly and a summary would slow momentum without adding clarity.',
    expectedOperationalValue: 'medium',
    assumptionSensitivity: 'low',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  validate: {
    id: 'validate',
    purpose: 'Acknowledge a legitimate concern or contribution without surrendering the active objective.',
    whenToUse: 'Recognition can reduce resistance, preserve trust, or make the next move easier to hear.',
    whenNotToUse: 'Validation would imply agreement with a false premise, unwanted concession, or unverified claim.',
    expectedOperationalValue: 'medium',
    assumptionSensitivity: 'medium',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  challenge: {
    id: 'challenge',
    purpose: 'Test a premise, standard, inconsistency, or proposed tradeoff that threatens the outcome.',
    whenToUse: 'The available evidence supports pushback and the cost of accepting the premise is materially higher than the cost of challenging it.',
    whenNotToUse: 'The user lacks enough signal, the room is not ready, or challenge would create avoidable resistance without improving position.',
    expectedOperationalValue: 'high',
    assumptionSensitivity: 'high',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  redirect: {
    id: 'redirect',
    purpose: 'Move attention from a low-value or harmful branch back toward the outcome-relevant issue.',
    whenToUse: 'The room is spending time on a branch that does not improve the user’s position or decision quality.',
    whenNotToUse: 'The current branch contains unresolved information the room reasonably needs before moving on.',
    expectedOperationalValue: 'medium',
    assumptionSensitivity: 'medium',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  slow: {
    id: 'slow',
    purpose: 'Protect execution quality by reducing pace before another substantive move.',
    whenToUse: 'Rushing, interruption, pressure, or cognitive overload is degrading the user’s delivery or judgment.',
    whenNotToUse: 'Momentum is productive and slowing would weaken urgency, confidence, or a closing opportunity.',
    expectedOperationalValue: 'high',
    assumptionSensitivity: 'low',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  close: {
    id: 'close',
    purpose: 'Convert sufficient positive movement into a commitment, decision, or explicit next step.',
    whenToUse: 'The room has supplied enough agreement, readiness, or decision signal to make a close useful.',
    whenNotToUse: 'Material objections remain unresolved or the apparent agreement is too weak to support commitment.',
    expectedOperationalValue: 'high',
    assumptionSensitivity: 'medium',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  explore: {
    id: 'explore',
    purpose: 'Expand the user’s understanding or available paths without inventing an outcome.',
    whenToUse: 'Direction is not yet clear and several plausible paths remain operationally relevant.',
    whenNotToUse: 'The user has already stated a clear objective and additional exploration would delay useful action.',
    expectedOperationalValue: 'medium',
    assumptionSensitivity: 'medium',
    liveCompatibility: false,
    normalCompatibility: true,
  },
  probe: {
    id: 'probe',
    purpose: 'Use a conversational move that both advances the interaction and reveals the operative concern, motive, commitment, or constraint.',
    whenToUse: 'The response to a focused move is likely to reduce material uncertainty without sacrificing position.',
    whenNotToUse: 'The information is already known, the probe would appear evasive, or the room lacks enough trust for the move.',
    expectedOperationalValue: 'high',
    assumptionSensitivity: 'high',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  confirm: {
    id: 'confirm',
    purpose: 'Lock shared understanding of an established fact, constraint, decision, or next step.',
    whenToUse: 'A brief confirmation prevents drift, repetition, or later disagreement about what was established.',
    whenNotToUse: 'The point is not actually settled or confirmation would prematurely imply agreement.',
    expectedOperationalValue: 'medium',
    assumptionSensitivity: 'low',
    liveCompatibility: true,
    normalCompatibility: true,
  },
  pause: {
    id: 'pause',
    purpose: 'Create useful silence so the user can think, let the other party continue, or avoid weakening a completed point.',
    whenToUse: 'Additional words are more likely to reduce leverage, interrupt disclosure, or create avoidable error.',
    whenNotToUse: 'The room requires a direct answer, silence would appear evasive, or the user needs immediate recovery support.',
    expectedOperationalValue: 'high',
    assumptionSensitivity: 'medium',
    liveCompatibility: true,
    normalCompatibility: false,
  },
}

export function resolveConversationMoveDefinition(
  move: GeorgeConversationMove
): GeorgeConversationMoveDefinition {
  const definition = MOVE_LIBRARY[move]
  if (!definition) {
    throw new Error(`Unsupported GEORGE conversation move: ${String(move)}`)
  }
  return definition
}

export function listConversationMoveDefinitions() {
  return Object.values(MOVE_LIBRARY)
}

export function buildConversationMoveDefinitionNote(
  definition: GeorgeConversationMoveDefinition,
  assumptions: string[]
) {
  return `
CONVERSATION MOVE KNOWLEDGE
- Candidate move: ${definition.id}
- Purpose: ${definition.purpose}
- Use when: ${definition.whenToUse}
- Do not use when: ${definition.whenNotToUse}
- Expected operational value: ${definition.expectedOperationalValue}
- Assumption sensitivity: ${definition.assumptionSensitivity}
- Current assumptions: ${assumptions.length > 0 ? assumptions.join('; ') : 'none'}
- Use this definition as reasoning support, not as a response template or instruction to force the candidate move.
- Prefer the response that best fits the current utterance, active objective, evidence, and user authority.
- Do not expose this runtime vocabulary to the user.
`.trim()
}
