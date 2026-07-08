export type GeorgeSupportBehavior =
  | 'cue'
  | 'bridge'
  | 'completion'
  | 'sentence_recovery'
  | 'repeat_tail'
  | 'full_response'
  | 'silence'

export type GeorgeSupportBehaviorComposerInput = {
  desiredOutcome?: string
  deliveryStyle?: string
  userSpeaking?: boolean
  userAppearsToBeShadowing?: boolean
  userMissedEnding?: boolean
  userTookOverNaturally?: boolean
  roomPressure?: 'low' | 'medium' | 'high'
  hasSafeResponse?: boolean
  hasHighConfidenceCompletion?: boolean
}

export type GeorgeSupportBehaviorDecision = {
  behaviors: GeorgeSupportBehavior[]
  temporary: true
  reason: string
}

export function composeGeorgeSupportBehavior(
  input: GeorgeSupportBehaviorComposerInput
): GeorgeSupportBehaviorDecision {
  if (input.userTookOverNaturally && !input.hasHighConfidenceCompletion) {
    return {
      behaviors: ['silence'],
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
      behaviors: ['repeat_tail'],
      temporary: true,
      reason: 'User appears synchronized but missed the sentence ending; provide only the missing tail.',
    }
  }

  if (input.hasHighConfidenceCompletion && input.userSpeaking) {
    return {
      behaviors: ['completion'],
      temporary: true,
      reason: 'High-confidence completion may preserve momentum without changing support mode.',
    }
  }

  if (!input.hasSafeResponse) {
    return {
      behaviors: ['bridge', 'cue'],
      temporary: true,
      reason: 'Full response is not safe or ready; provide useful support instead of silence.',
    }
  }

  if (input.deliveryStyle === 'response') {
    return {
      behaviors: ['full_response'],
      temporary: true,
      reason: 'Response support is available and safe.',
    }
  }

  return {
    behaviors: ['cue'],
    temporary: true,
    reason: 'Default to minimum useful support.',
  }
}
