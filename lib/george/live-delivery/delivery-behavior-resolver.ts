import type { GeorgeActionCue } from '@/lib/george/live-hub/types'
import { composeGeorgeSupportBehavior } from '@/lib/george/live-runtime/support-behavior-composer'
import type { GeorgeLiveDeliveryStyle } from './types'

export type GeorgeDeliveryBehaviorResolution = {
  actionCue: GeorgeActionCue
  behaviorReason?: string
  fallbackApplied: boolean
}

function isResponseModePlaceholder(input: {
  actionCue: GeorgeActionCue
  deliveryStyle: GeorgeLiveDeliveryStyle
}) {
  return (
    input.deliveryStyle === 'response' &&
    input.actionCue.source === 'local' &&
    /^(clarify before answering\.?|ask for clarification\.?|clarify\.?)/i.test(
      String(input.actionCue.cue || '').trim()
    )
  )
}

/**
 * Resolves operational behavior before receiver routing.
 *
 * This function is intentionally independent of React and browser delivery
 * surfaces. Any web, mobile, wearable, or service client can prepare the same
 * ACTION_CUE before the delivery router shapes it for audio or visual output.
 */
export function resolveGeorgeDeliveryBehavior(input: {
  actionCue: GeorgeActionCue
  deliveryStyle: GeorgeLiveDeliveryStyle
  desiredOutcome?: string
}): GeorgeDeliveryBehaviorResolution {
  if (!isResponseModePlaceholder(input)) {
    return {
      actionCue: input.actionCue,
      fallbackApplied: false,
    }
  }

  const behaviorDecision = composeGeorgeSupportBehavior({
    desiredOutcome: input.desiredOutcome,
    deliveryStyle: input.deliveryStyle,
    hasSafeResponse: false,
  })

  const fallbackText =
    behaviorDecision.operationalResource === 'silence'
      ? ''
      : behaviorDecision.operationalResource === 'cue'
        ? 'Buy a second. Ask them to clarify what they mean.'
        : 'Clarify before answering.'

  return {
    actionCue: {
      ...input.actionCue,
      cue: fallbackText,
      category: 'operational_guidance',
      confidence: Math.max(input.actionCue.confidence || 0, 0.7),
      priority: Math.max(input.actionCue.priority || 0, 7),
    },
    behaviorReason: behaviorDecision.reason,
    fallbackApplied: true,
  }
}
