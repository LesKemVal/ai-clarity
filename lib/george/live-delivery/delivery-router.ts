import type { GeorgeActionCue } from '@/lib/george/live-hub/types'
import {
  composeGeorgeOperationalCueText,
  resolveGeorgeOperationalAssessment,
} from '@/lib/george/live-runtime/operational-assessment'
import {
  DEFAULT_GEORGE_LIVE_DELIVERY_STYLE,
  type GeorgeDeliveryContext,
  type GeorgeDeliveryCue,
  type GeorgeDeliveryMode,
  type GeorgeLiveDeliveryStyle,
} from './types'
import { resolveGeorgeReceiverDeliveryPolicy } from './receiver-policy'

function composeBaseDeliveryText(input: {
  actionCue: GeorgeActionCue
  deliveryStyle: GeorgeLiveDeliveryStyle
}) {
  const rawCue = String(input.actionCue.cue || '').trim()
  if (!rawCue) return ''

  const cleanGenerated = rawCue
    .replace(/^(cue|advice|response|presentation):\s*/i, '')
    .replace(/^["“”]+|["“”]+$/g, '')
    .trim()

  const imperativeCuePattern =
    /^(ask|clarify|maintain|reassess|pause|control|anchor|focus|lead|return|listen|confirm|probe|surface|verify|build|find|did|try)\b/i

  const continuationText = (() => {
    if (cleanGenerated.startsWith('...')) return cleanGenerated

    const withoutCueOpening = cleanGenerated
      .replace(/^good[—,\-\s]+then\s+/i, '')
      .replace(/^good[—,\-\s]+/i, '')
      .replace(/^then\s+/i, '')
      .trim()

    if (!withoutCueOpening) return ''
    if (imperativeCuePattern.test(withoutCueOpening)) return ''

    const startsLikeSentence =
      /^(whether|because|that|so|if|when|while|without|with|by|to|as|and|but|or|which|who|what|where|why|how)\b/i.test(withoutCueOpening)

    if (startsLikeSentence || withoutCueOpening.length > 90) {
      return `...${withoutCueOpening.replace(/^[.,;:!?\s]+/, '')}`
    }

    return ''
  })()

  return input.deliveryStyle === 'continue'
    ? continuationText
    : cleanGenerated
}

function buildDeliveryCue(input: {
  actionCue: GeorgeActionCue
  deliveryStyle: GeorgeLiveDeliveryStyle
  mode: GeorgeDeliveryMode
  text: string
  reason: string
}): GeorgeDeliveryCue {
  return {
    turnId: input.actionCue.turnId,
    mode: input.mode,
    text: input.text,
    reason: input.reason,
    operationalAssessment: input.actionCue.operationalAssessment,
    source: input.actionCue.source,
    category: input.actionCue.category,
    deliveryStyle: input.deliveryStyle,
    confidence: input.actionCue.confidence,
    priority: input.actionCue.priority,
    at: Date.now(),
  }
}

export function routeGeorgeDeliveryCues(input: {
  actionCue: GeorgeActionCue
  context?: GeorgeDeliveryContext
}): GeorgeDeliveryCue[] {
  const voiceEnabled = Boolean(input.context?.voiceEnabled)
  const deliveryStyle = input.context?.deliveryStyle || DEFAULT_GEORGE_LIVE_DELIVERY_STYLE
  const baseText = composeBaseDeliveryText({ actionCue: input.actionCue, deliveryStyle })
  const operationalAssessment = resolveGeorgeOperationalAssessment({
    actionCue: input.actionCue,
    actionText: baseText,
  })
  const explanatoryText = composeGeorgeOperationalCueText({
    assessment: operationalAssessment,
    deliveryStyle,
  })

  if (!explanatoryText) {
    return [
      buildDeliveryCue({
        actionCue: input.actionCue,
        deliveryStyle,
        mode: 'silent',
        text: '',
        reason: 'Dropped empty LIVE action cue.',
      }),
    ]
  }

  return resolveGeorgeReceiverDeliveryPolicy({
    text: explanatoryText,
    voiceEnabled,
    deliveryStyle,
    receiverProfile: input.context?.receiverProfile,
  }).map((delivery) =>
    buildDeliveryCue({
      actionCue: {
        ...input.actionCue,
        operationalAssessment,
      },
      deliveryStyle,
      mode: delivery.mode,
      text: delivery.text,
      reason: delivery.reason,
    })
  )
}

export function routeGeorgeDeliveryCue(input: {
  actionCue: GeorgeActionCue
  context?: GeorgeDeliveryContext
}): GeorgeDeliveryCue {
  return routeGeorgeDeliveryCues(input)[0]
}
