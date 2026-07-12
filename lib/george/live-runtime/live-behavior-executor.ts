import type { LiveBehaviorDecision } from './live-behavior-engine'
import type {
  GeorgeOperationalResource,
  GeorgeSupportBehaviorDecision,
} from './support-behavior-composer'

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
  operationalResource: GeorgeOperationalResource
  intent: LiveBehaviorExecutionIntent
  maySpeak: boolean
  interruptSpeech: boolean
  requiresUserAgency: boolean
  reason: string
}

export function planLiveBehaviorExecution(
  decision: LiveBehaviorDecision,
  supportDecision?: GeorgeSupportBehaviorDecision
): LiveBehaviorExecutionPlan {
  const operationalResource = resolveOperationalResource(supportDecision)

  if (operationalResource === 'silence') {
    return {
      operationalResource,
      intent: 'hold_response',
      maySpeak: false,
      interruptSpeech: false,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: supportDecision?.reason || decision.reason,
    }
  }

  if (operationalResource === 'recovery') {
    return {
      operationalResource,
      intent: 'recover_context',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: supportDecision?.reason || decision.reason,
    }
  }
  if (decision.recommendedAction === 'listen') {
    return {
      operationalResource,
      intent: 'keep_listening',
      maySpeak: false,
      interruptSpeech: false,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'wait') {
    return {
      operationalResource,
      intent: 'hold_response',
      maySpeak: false,
      interruptSpeech: false,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'recover_context') {
    return {
      operationalResource,
      intent: 'recover_context',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'ask_brief_confirmation') {
    return {
      operationalResource,
      intent: 'ask_confirmation',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'return_to_outcome') {
    return {
      operationalResource,
      intent: 'return_to_outcome',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'protect_user') {
    return {
      operationalResource,
      intent: 'protect_user',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'answer_briefly') {
    return {
      operationalResource,
      intent: 'answer_briefly',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  if (decision.recommendedAction === 'slow_down') {
    return {
      operationalResource,
      intent: 'slow_down',
      maySpeak: decision.safeToSpeak,
      interruptSpeech: decision.shouldInterruptCurrentSpeech,
      requiresUserAgency: decision.shouldPreserveUserAgency,
      reason: decision.reason,
    }
  }

  return {
    operationalResource,
    intent: 'no_op',
    maySpeak: false,
    interruptSpeech: false,
    requiresUserAgency: true,
    reason: decision.reason,
  }
}


function resolveOperationalResource(
  supportDecision?: GeorgeSupportBehaviorDecision
): GeorgeOperationalResource {
  if (supportDecision?.operationalResource) {
    return supportDecision.operationalResource
  }

  const behaviors = supportDecision?.behaviors || []

  if (behaviors.includes('silence')) return 'silence'
  if (behaviors.includes('repeat_tail')) return 'repeat'
  if (behaviors.includes('sentence_recovery')) return 'recovery'
  if (behaviors.includes('completion')) return 'continuation'
  if (behaviors.includes('full_response')) return 'response'
  if (behaviors.includes('cue')) return 'cue'

  return 'cue'
}
