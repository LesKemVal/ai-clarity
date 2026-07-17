import {
  DEFAULT_GEORGE_LIVE_RECEIVER_PROFILE,
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

export type GeorgeReceiverDeliveryPolicyResult = {
  mode: GeorgeDeliveryMode
  text: string
  reason: string
}

export function resolveGeorgeReceiverDeliveryPolicy(input: {
  text: string
  voiceEnabled: boolean
  deliveryStyle: GeorgeLiveDeliveryStyle
  receiverProfile?: GeorgeLiveReceiverProfile
}): GeorgeReceiverDeliveryPolicyResult[] {
  const receiverProfile =
    input.receiverProfile || DEFAULT_GEORGE_LIVE_RECEIVER_PROFILE

  return resolveDeliveryModes({
    voiceEnabled: input.voiceEnabled,
    receiverProfile,
  }).map((mode) => {
    const text = shapeForDeliverySurface({
      text: input.text,
      mode,
      deliveryStyle: input.deliveryStyle,
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

    return { mode, text, reason }
  })
}
