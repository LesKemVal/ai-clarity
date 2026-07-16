export type GeorgeAdaptiveSupportPreference =
  | 'cue'
  | 'response'

export type GeorgeSupportBehaviorComposerInput = {
  desiredOutcome?: string
  deliveryStyle?: string
  adaptivePreference?: GeorgeAdaptiveSupportPreference
  currentSupportWorking?: boolean
  userComfortableWithCurrentSupport?: boolean
  userNeedsMoreDirectSupport?: boolean
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
  const adaptivePreference: GeorgeAdaptiveSupportPreference =
    input.adaptivePreference ||
    (input.deliveryStyle === 'response' || input.deliveryStyle === 'line'
      ? 'response'
      : 'cue')

  /*
   * Natural user control remains authoritative.
   *
   * This is not a fallback decision. GEORGE temporarily yields because
   * the user is already executing successfully and support would compete
   * with the user's voice.
   */
  if (input.userTookOverNaturally && !input.hasHighConfidenceCompletion) {
    return {
      operationalResource: 'silence',
      temporary: true,
      reason:
        'User has taken the floor naturally; temporarily yield rather than competing with successful execution.',
    }
  }

  /*
   * Repeat and recovery preserve an answer already in queue.
   * GEORGE should restore the user's place instead of generating a new idea.
   */
  if (
    input.userAppearsToBeShadowing &&
    input.userMissedEnding &&
    input.hasHighConfidenceCompletion
  ) {
    return {
      operationalResource: 'repeat',
      temporary: true,
      reason:
        'User missed the ending of established language; provide only the missing tail.',
    }
  }

  if (
    input.userAppearsToBeShadowing &&
    input.userLostPlace &&
    input.hasCurrentSentence
  ) {
    return {
      operationalResource: 'recovery',
      temporary: true,
      reason:
        'User lost place in the current line; restore the sentence already in queue.',
    }
  }

  /*
   * Continuation is an operational behavior, not a user-selected mode.
   * Use it when GEORGE has strong evidence of the intended thought.
   */
  if (input.hasHighConfidenceCompletion && input.userSpeaking) {
    return {
      operationalResource: 'continuation',
      temporary: true,
      reason:
        'High-confidence continuation can preserve the user’s intended thought and conversational momentum.',
    }
  }

  /*
   * Preserve the selected starting preference while it is working.
   * Adaptation is evidence-driven, not compression-driven.
   */
  if (
    input.currentSupportWorking ||
    input.userComfortableWithCurrentSupport
  ) {
    return {
      operationalResource:
        adaptivePreference === 'response' ? 'response' : 'cue',
      temporary: true,
      reason:
        adaptivePreference === 'response'
          ? 'The user is successfully executing from concise complete responses; preserve Adaptive Response.'
          : 'The user is successfully executing from concise cues; preserve Adaptive Cue.',
    }
  }

  /*
   * Adaptive Response begins from the shortest complete, speakable
   * response likely to improve execution. It does not become verbose.
   */
  if (
    adaptivePreference === 'response' &&
    input.hasSafeResponse
  ) {
    return {
      operationalResource: 'response',
      temporary: true,
      reason:
        input.userNeedsMoreDirectSupport
          ? 'The user needs directly usable language; provide the shortest complete response likely to improve execution.'
          : 'Adaptive Response is the selected starting preference; provide a concise complete response.',
    }
  }

  /*
   * When a safe complete response is unavailable, GEORGE still supports
   * the user. It falls back to the default Adaptive Cue posture rather
   * than treating silence as the terminal option.
   */
  if (!input.hasSafeResponse) {
    return {
      operationalResource: 'cue',
      temporary: true,
      reason:
        'A safe complete response is not ready; fall back to the shortest useful cue.',
    }
  }

  return {
    operationalResource: 'cue',
    temporary: true,
    reason:
      input.userNeedsMoreDirectSupport
        ? 'Begin with Adaptive Cue, but allow the runtime to expand support when the cue is not sufficiently usable.'
        : 'Adaptive Cue is the default starting preference; provide the shortest useful support likely to improve the desired outcome.',
  }
}
