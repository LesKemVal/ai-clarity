import type { GeorgeActionCue } from '@/lib/george/live-hub/types'
import { DEFAULT_GEORGE_LIVE_DELIVERY_STYLE, type GeorgeDeliveryContext, type GeorgeDeliveryCue } from './types'

export function routeGeorgeDeliveryCue(input: {
  actionCue: GeorgeActionCue
  context?: GeorgeDeliveryContext
}): GeorgeDeliveryCue {
  const voiceEnabled = Boolean(input.context?.voiceEnabled)
  const deliveryStyle = input.context?.deliveryStyle || DEFAULT_GEORGE_LIVE_DELIVERY_STYLE
  const rawCue = String(input.actionCue.cue || '').trim()

  if (!rawCue) {
    return {
      mode: 'silent',
      text: '',
      reason: 'Dropped empty LIVE action cue.',
      source: input.actionCue.source,
      category: input.actionCue.category,
      deliveryStyle,
      confidence: input.actionCue.confidence,
      priority: input.actionCue.priority,
      at: Date.now(),
    }
  }

  const cleanGenerated = rawCue
    .replace(/^(cue|advice|say|ask|response|presentation):\s*/i, '')
    .replace(/^["“”]+|["“”]+$/g, '')
    .trim()

  const imperativeCuePattern =
    /^(ask|clarify|maintain|reassess|slow|pause|control|anchor|focus|lead|return|listen|confirm|probe|surface|verify|build)\b/i

  const continuationText = (() => {
    if (cleanGenerated.startsWith('...')) return cleanGenerated

    const withoutCueOpening = cleanGenerated
      .replace(/^good[—,\-\s]+then\s+/i, '')
      .replace(/^good[—,\-\s]+/i, '')
      .replace(/^then\s+/i, '')
      .trim()

    if (!withoutCueOpening) return ''

    if (imperativeCuePattern.test(withoutCueOpening)) {
      return ''
    }

    const startsLikeSentence =
      /^(whether|because|that|so|if|when|while|without|with|by|to|as|and|but|or|which|who|what|where|why|how)\b/i.test(withoutCueOpening)

    if (startsLikeSentence || withoutCueOpening.length > 90) {
      return `...${withoutCueOpening.replace(/^[.,;:!?\s]+/, '')}`
    }

    return ''
  })()

  const text =
    deliveryStyle === 'continue'
      ? continuationText
      : cleanGenerated

  if (!voiceEnabled) {
    return {
      mode: 'visual',
      text,
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
      text,
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
    text,
    reason: 'Default LIVE delivery route.',
    source: input.actionCue.source,
    category: input.actionCue.category,
    deliveryStyle,
    confidence: input.actionCue.confidence,
    priority: input.actionCue.priority,
    at: Date.now(),
  }
}
