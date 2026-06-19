import type { GeorgeActionCue } from '@/lib/george/live-hub/types'
import { DEFAULT_GEORGE_LIVE_DELIVERY_STYLE, type GeorgeDeliveryContext, type GeorgeDeliveryCue } from './types'

export function routeGeorgeDeliveryCue(input: {
  actionCue: GeorgeActionCue
  context?: GeorgeDeliveryContext
}): GeorgeDeliveryCue {
  const voiceEnabled = Boolean(input.context?.voiceEnabled)
  const deliveryStyle = input.context?.deliveryStyle || DEFAULT_GEORGE_LIVE_DELIVERY_STYLE

  if (!voiceEnabled) {
    return {
      mode: 'visual',
      text: input.actionCue.cue,
      reason: 'Voice is disabled; route action cue visually.',
      source: input.actionCue.source,
      category: input.actionCue.category,
      deliveryStyle,
      confidence: input.actionCue.confidence,
      priority: input.actionCue.priority,
      at: Date.now(),
    }
  }

  if (input.actionCue.category === 'pricing') {
    return {
      mode: 'voice',
      text: input.actionCue.cue,
      reason: 'Pricing pressure benefits from immediate spoken cue.',
      source: input.actionCue.source,
      category: input.actionCue.category,
      deliveryStyle,
      confidence: input.actionCue.confidence,
      priority: input.actionCue.priority,
      at: Date.now(),
    }
  }

  return {
    mode: 'voice',
    text: input.actionCue.cue,
    reason: 'Default LIVE delivery route.',
    source: input.actionCue.source,
    category: input.actionCue.category,
    deliveryStyle,
    confidence: input.actionCue.confidence,
    priority: input.actionCue.priority,
    at: Date.now(),
  }
}
