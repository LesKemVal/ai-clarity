import type { LiveRuntimeState } from './live-runtime-state'

export type LiveBehaviorAction =
  | 'none'
  | 'listen'
  | 'wait'
  | 'recover_context'
  | 'ask_brief_confirmation'
  | 'return_to_outcome'
  | 'protect_user'
  | 'answer_briefly'
  | 'slow_down'

export type LiveBehaviorDecision = {
  recommendedAction: LiveBehaviorAction
  safeToSpeak: boolean
  shouldInterruptCurrentSpeech: boolean
  shouldPreserveUserAgency: boolean
  reason: string
}

export function deriveLiveBehaviorDecision(
  runtimeState: LiveRuntimeState
): LiveBehaviorDecision {
  if (runtimeState.recommendedBehavior === 'return_to_outcome') {
    return {
      recommendedAction: 'return_to_outcome',
      safeToSpeak: true,
      shouldInterruptCurrentSpeech: runtimeState.urgency === 'high',
      shouldPreserveUserAgency: true,
      reason: runtimeState.reason,
    }
  }

  if (runtimeState.recommendedBehavior === 'protect_user') {
    return {
      recommendedAction: 'protect_user',
      safeToSpeak: true,
      shouldInterruptCurrentSpeech: runtimeState.urgency === 'high',
      shouldPreserveUserAgency: true,
      reason: runtimeState.reason,
    }
  }

  if (runtimeState.recommendedBehavior === 'recover_context') {
    return {
      recommendedAction: 'recover_context',
      safeToSpeak: runtimeState.urgency !== 'low',
      shouldInterruptCurrentSpeech: false,
      shouldPreserveUserAgency: true,
      reason: runtimeState.reason,
    }
  }

  if (runtimeState.recommendedBehavior === 'brief_confirmation') {
    return {
      recommendedAction: 'ask_brief_confirmation',
      safeToSpeak: true,
      shouldInterruptCurrentSpeech: false,
      shouldPreserveUserAgency: true,
      reason: runtimeState.reason,
    }
  }

  if (runtimeState.recommendedBehavior === 'answer_briefly') {
    return {
      recommendedAction: 'answer_briefly',
      safeToSpeak: true,
      shouldInterruptCurrentSpeech: false,
      shouldPreserveUserAgency: true,
      reason: runtimeState.reason,
    }
  }

  if (runtimeState.recommendedBehavior === 'slow_down') {
    return {
      recommendedAction: 'slow_down',
      safeToSpeak: false,
      shouldInterruptCurrentSpeech: false,
      shouldPreserveUserAgency: true,
      reason: runtimeState.reason,
    }
  }

  if (runtimeState.recommendedBehavior === 'do_not_speak_yet') {
    return {
      recommendedAction: 'wait',
      safeToSpeak: false,
      shouldInterruptCurrentSpeech: false,
      shouldPreserveUserAgency: true,
      reason: runtimeState.reason,
    }
  }

  return {
    recommendedAction: 'none',
    safeToSpeak: false,
    shouldInterruptCurrentSpeech: false,
    shouldPreserveUserAgency: true,
    reason: 'No production behavior adjustment required.',
  }
}
