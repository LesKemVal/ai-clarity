import type { GeorgeActionCue } from '@/lib/george/live-hub/types'
import { DEFAULT_GEORGE_LIVE_DELIVERY_STYLE, type GeorgeDeliveryContext, type GeorgeDeliveryCue } from './types'
import { violatesEvidenceAuthority } from '@/lib/george/core/verification/evidence-gate'
import { safeContinuationReplacement } from '@/lib/george/core/verification/continuation-replacement'

function buildContinuationEvidence(input: {
  actionCue: GeorgeActionCue
  context?: GeorgeDeliveryContext
}) {
  return [
    input.actionCue.evidence?.transcript,
    input.actionCue.evidence?.room,
    input.actionCue.evidence?.objective,
    input.actionCue.evidence?.knownContext,
    input.actionCue.evidence?.secondaryOutcome,
    input.actionCue.evidence?.secondaryObjective,
    input.actionCue.evidence?.intangibleObjective,
    input.actionCue.evidence?.userPosition,
    input.actionCue.evidence?.deliveryStyle,
    input.actionCue.evidence?.runtimeIntent,
    input.context?.room,
    input.context?.objective,
    input.context?.knownContext,
  ].join(' ')
}

export function routeGeorgeDeliveryCue(input: {
  actionCue: GeorgeActionCue
  context?: GeorgeDeliveryContext
}): GeorgeDeliveryCue {
  const voiceEnabled = Boolean(input.context?.voiceEnabled)
  const deliveryStyle = input.context?.deliveryStyle || DEFAULT_GEORGE_LIVE_DELIVERY_STYLE
  const rawCue = String(input.actionCue.cue || '').trim()

  if (!rawCue) {
    return {
      turnId: input.actionCue.turnId,
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

  let text =
    deliveryStyle === 'continue'
      ? continuationText
      : cleanGenerated

  if (deliveryStyle === 'continue' && text) {
    const evidence = buildContinuationEvidence(input)

    const authority = violatesEvidenceAuthority(text, evidence)

    console.info('[GEORGE][delivery][authority-check]', {
      deliveryStyle,
      rawCue,
      cleanGenerated,
      text,
      evidence,
      evidenceFromActionCue: input.actionCue.evidence,
      context: input.context,
      violates: authority.violates,
      reason: authority.reason,
      unsupportedTerms: authority.unsupportedTerms,
    })

    if (authority.violates) {
      console.warn('[GEORGE][delivery][authority-replaced]', {
        reason: authority.reason,
        unsupportedTerms: authority.unsupportedTerms,
        originalText: text,
      })

      text = safeContinuationReplacement({
        fallback: text,
        transcript: input.actionCue.evidence?.transcript || text,
        lastFiveSeconds: input.actionCue.evidence?.room || input.context?.room,
        desiredOutcome: input.actionCue.evidence?.objective || input.context?.objective,
        activeOutcome:
          input.actionCue.evidence?.secondaryOutcome ||
          input.actionCue.evidence?.secondaryObjective ||
          input.actionCue.evidence?.intangibleObjective,
        shadowMap: [
          input.actionCue.evidence?.knownContext,
          input.actionCue.evidence?.userPosition,
          input.actionCue.evidence?.deliveryStyle,
          input.actionCue.evidence?.runtimeIntent,
          input.context?.knownContext,
        ].join(' '),
      })
    }
  }

  if (!voiceEnabled) {
    return {
      turnId: input.actionCue.turnId,
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
      turnId: input.actionCue.turnId,
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
    turnId: input.actionCue.turnId,
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
