import type { GeorgeActionCue } from '@/lib/george/live-hub/types'
import {
  DEFAULT_GEORGE_LIVE_DELIVERY_STYLE,
  DEFAULT_GEORGE_LIVE_RECEIVER_PROFILE,
  type GeorgeDeliveryContext,
  type GeorgeDeliveryCue,
  type GeorgeDeliveryMode,
  type GeorgeLiveDeliveryStyle,
  type GeorgeLiveReceiverProfile,
} from './types'

const AUDIO_MAX_CHARS: Record<GeorgeLiveDeliveryStyle, number> = {
  silent: 0,
  cue: 72,
  advice: 120,
  line: 140,
  response: 180,
  expandedLine: 180,
  continue: 150,
}

const VISUAL_MAX_CHARS: Record<GeorgeLiveDeliveryStyle, number> = {
  silent: 0,
  cue: 220,
  advice: 420,
  line: 420,
  response: 720,
  expandedLine: 720,
  continue: 420,
}

function normalizeSupportText(text: string) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function flattenForAudio(text: string) {
  return normalizeSupportText(text)
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function limitForSurface(text: string, maxChars: number, preserveLines = false) {
  const clean = preserveLines
    ? normalizeSupportText(text)
    : normalizeSupportText(text).replace(/\s+/g, ' ')

  if (!maxChars || clean.length <= maxChars) return clean

  const sentenceBoundary = clean.slice(0, maxChars).search(/[.!?](\s|$)(?!.*[.!?](\s|$))/)
  if (sentenceBoundary > 48) return clean.slice(0, sentenceBoundary + 1).trim()

  const commaBoundary = clean.slice(0, maxChars).lastIndexOf(',')
  if (commaBoundary > 48) return clean.slice(0, commaBoundary).trim()

  return clean.slice(0, maxChars).replace(/\s+\S*$/, '').trim()
}

function splitVisualSupport(text: string, maxParts = 4) {
  return normalizeSupportText(text)
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, maxParts)
}

function isAlreadyStructuredVisual(text: string) {
  return /(^|\n)\s*(•|-|\d+[.)])\s+/.test(text) || text.includes('\n')
}

function shapeAudioText(text: string, deliveryStyle: GeorgeLiveDeliveryStyle) {
  const clean = flattenForAudio(text)
    .replace(/^[-•]\s*/gm, '')
    .replace(/^\d+[.)]\s*/gm, '')

  return limitForSurface(clean, AUDIO_MAX_CHARS[deliveryStyle])
}

function shapeVisualOnlyText(text: string, deliveryStyle: GeorgeLiveDeliveryStyle) {
  const clean = limitForSurface(text, VISUAL_MAX_CHARS[deliveryStyle], true)

  if (!clean) return clean
  if (isAlreadyStructuredVisual(clean)) return clean

  const shouldStructure =
    deliveryStyle === 'response' ||
    deliveryStyle === 'expandedLine' ||
    deliveryStyle === 'advice' ||
    (deliveryStyle === 'line' && clean.length > 160)

  if (!shouldStructure || clean.length < 120) return clean

  const parts = splitVisualSupport(clean)
  if (parts.length <= 1) return clean

  return parts.map((part) => `• ${part}`).join('\n')
}

function shapeVisualReferenceText(text: string, deliveryStyle: GeorgeLiveDeliveryStyle) {
  const clean = limitForSurface(text, Math.min(VISUAL_MAX_CHARS[deliveryStyle], 360), true)

  if (!clean) return clean
  if (isAlreadyStructuredVisual(clean)) return clean

  if (
    (deliveryStyle === 'response' || deliveryStyle === 'expandedLine') &&
    clean.length > 180
  ) {
    const parts = splitVisualSupport(clean, 3)
    if (parts.length > 1) return parts.map((part) => `• ${part}`).join('\n')
  }

  return clean
}

function resolveReceiverProfile(context?: GeorgeDeliveryContext): GeorgeLiveReceiverProfile {
  return context?.receiverProfile || DEFAULT_GEORGE_LIVE_RECEIVER_PROFILE
}

function resolveDeliveryModes(input: {
  voiceEnabled: boolean
  receiverProfile: GeorgeLiveReceiverProfile
}): GeorgeDeliveryMode[] {
  if (input.receiverProfile === 'visual_only') return ['visual']
  if (input.receiverProfile === 'audio_only') return input.voiceEnabled ? ['voice'] : ['silent']
  return input.voiceEnabled ? ['voice', 'visual'] : ['visual']
}

function shapeForDeliverySurface(input: {
  text: string
  mode: GeorgeDeliveryMode
  deliveryStyle: GeorgeLiveDeliveryStyle
  receiverProfile: GeorgeLiveReceiverProfile
}) {
  if (input.mode === 'voice') return shapeAudioText(input.text, input.deliveryStyle)

  if (input.mode === 'visual') {
    return input.receiverProfile === 'visual_only'
      ? shapeVisualOnlyText(input.text, input.deliveryStyle)
      : shapeVisualReferenceText(input.text, input.deliveryStyle)
  }

  return ''
}

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
  const receiverProfile = resolveReceiverProfile(input.context)
  const deliveryStyle = input.context?.deliveryStyle || DEFAULT_GEORGE_LIVE_DELIVERY_STYLE
  const baseText = composeBaseDeliveryText({ actionCue: input.actionCue, deliveryStyle })

  if (!baseText) {
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

  return resolveDeliveryModes({ voiceEnabled, receiverProfile }).map((mode) => {
    const text = shapeForDeliverySurface({
      text: baseText,
      mode,
      deliveryStyle,
      receiverProfile,
    })

    const reason =
      mode === 'voice'
        ? 'Receiver policy routed support as spoken audio optimized for the current outcome.'
        : mode === 'visual'
          ? receiverProfile === 'audio_visual'
            ? 'Receiver policy routed support as persistent visual reference.'
            : 'Receiver policy routed support as readable visual-only guidance.'
          : 'Receiver policy suppressed unavailable delivery surface.'

    return buildDeliveryCue({
      actionCue: input.actionCue,
      deliveryStyle,
      mode,
      text,
      reason,
    })
  })
}

export function routeGeorgeDeliveryCue(input: {
  actionCue: GeorgeActionCue
  context?: GeorgeDeliveryContext
}): GeorgeDeliveryCue {
  return routeGeorgeDeliveryCues(input)[0]
}
