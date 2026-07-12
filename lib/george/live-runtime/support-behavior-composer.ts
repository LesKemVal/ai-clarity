export type GeorgeSupportBehaviorComposerInput = {
  desiredOutcome?: string
  deliveryStyle?: string
  userSpeaking?: boolean
  userAppearsToBeShadowing?: boolean
  userMissedEnding?: boolean
  userLostPlace?: boolean
  userTookOverNaturally?: boolean
  roomPressure?: 'low' | 'medium' | 'high'
  hasSafeResponse?: boolean
  hasHighConfidenceCompletion?: boolean
  hasCurrentSentence?: boolean
}

export type GeorgeOperationalResource =
  | 'cue'
  | 'line'
  | 'continuation'
  | 'response'
  | 'recovery'
  | 'repeat'
  | 'silence'

export type GeorgeSupportBehaviorDecision = {
  operationalResource: GeorgeOperationalResource
  temporary: true
  reason: string
}

export function composeGeorgeSupportBehavior(
  input: GeorgeSupportBehaviorComposerInput
): GeorgeSupportBehaviorDecision {
  if (input.userTookOverNaturally && !input.hasHighConfidenceCompletion) {
    return {
      operationalResource: 'silence',
      temporary: true,
      reason: 'User has taken the floor naturally; GEORGE should not compete for control.',
    }
  }

  if (
    input.userAppearsToBeShadowing &&
    input.userMissedEnding &&
    input.hasHighConfidenceCompletion
  ) {
    return {
      operationalResource: 'repeat',
      temporary: true,
      reason: 'User appears synchronized but missed the sentence ending; provide only the missing tail.',
    }
  }

  if (input.userAppearsToBeShadowing && input.userLostPlace && input.hasCurrentSentence) {
    return {
      operationalResource: 'recovery',
      temporary: true,
      reason: 'User appears to have lost place while shadowing; repeat the current sentence before resuming support.',
    }
  }

  if (input.hasHighConfidenceCompletion && input.userSpeaking) {
    return {
      operationalResource: 'continuation',
      temporary: true,
      reason: 'High-confidence completion may preserve momentum without changing support mode.',
    }
  }

  if (!input.hasSafeResponse) {
    return {
      operationalResource: 'cue',
      temporary: true,
      reason: 'Full response is not safe or ready; provide useful support instead of silence.',
    }
  }

  if (input.deliveryStyle === 'response') {
    return {
      operationalResource: 'response',
      temporary: true,
      reason: 'Response support is available and safe.',
    }
  }

  return {
    operationalResource: 'cue',
    temporary: true,
    reason: 'Default to minimum useful support.',
  }
}
