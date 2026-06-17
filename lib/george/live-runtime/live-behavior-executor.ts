import type { LiveBehaviorDecision } from './live-behavior-engine'

export type LiveBehaviorExecutionIntent =
  | 'no_op'
  | 'keep_listening'
  | 'hold_response'
  | 'recover_context'
  | 'ask_confirmation'
  | 'return_to_outcome'
  | 'protect_user'
  | 'answer_briefly'
  | 'slow_down'

export type LiveBehaviorExecutionPlan = {
  intent: LiveBehaviorExecutionIntent
  maySpeak: boolean
  interruptSpeech: boolean
  requiresUserAgency: boolean
  reason: string
}

export function planLiveBehaviorExecution(
  decision: LiveBehaviorDecision
): LiveBehaviorExecutionPlan {
  if (decision.recommendedAction === 'listen') {
    return {
      intent: 'keep_listening',
      maySpeak: false,
      interruptSpeech: false,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'wait') {
    return {
      intent: 'hold_response',
      maySpeak: false,
      interruptSpeech: false,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'recover_context') {
    return {
      intent: 'recover_context',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'ask_brief_confirmation') {
    return {
      intent: 'ask_confirmation',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'return_to_outcome') {
    return {
      intent: 'return_to_outcome',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'protect_user') {
    return {
      intent: 'protect_user',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'answer_briefly') {
    return {
      intent: 'answer_briefly',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'slow_down') {
    return {
      intent: 'slow_down',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  return {
    intent: 'no_op',
    maySpeak: false,
    interruptSpeech: false,
    requiresUserAgency: true,
    reason: decision.reason,
  }
}
