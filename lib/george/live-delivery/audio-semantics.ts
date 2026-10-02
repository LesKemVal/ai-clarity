import type { GeorgeLiveDeliveryStyle } from '@/lib/george/live-contracts'

export type GeorgeAudioPerspective = 'to_user' | 'as_user'

export type GeorgeRepeatableSpeechTransition =
  | 'enter'
  | 'maintain'
  | 'exit'
  | 'none'

export type GeorgeRepeatableSpeechUptake = 'confirmed' | 'unconfirmed'

export type GeorgeAudioDeliveryState = Readonly<{
  perspective: GeorgeAudioPerspective | null
  repeatableSpeechActive: boolean
  awaitingUserUptake: boolean
}>

export type GeorgeAudioDeliverySemantics = Readonly<{
  perspective: GeorgeAudioPerspective
  repeatableSpeechTransition: GeorgeRepeatableSpeechTransition
  transitionMarkerApplied: boolean
  nextState: GeorgeAudioDeliveryState
  reason: string
}>

export type GeorgeAudioDeliveryRealization = Readonly<{
  text: string
  semantics: GeorgeAudioDeliverySemantics
}>

export const INITIAL_GEORGE_AUDIO_DELIVERY_STATE: GeorgeAudioDeliveryState =
  Object.freeze({
    perspective: null,
    repeatableSpeechActive: false,
    awaitingUserUptake: false,
  })

function cleanAudioText(value: string) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function withoutAdviceMarker(value: string) {
  return cleanAudioText(value).replace(/^my advice\?\s*/i, '').trim()
}

function withoutRepeatableSpeechMarker(value: string) {
  return cleanAudioText(value).replace(/^say:\s*/i, '').trim()
}

export function resolveGeorgeAudioPerspective(
  deliveryStyle: GeorgeLiveDeliveryStyle
): GeorgeAudioPerspective {
  return deliveryStyle === 'line' ||
    deliveryStyle === 'response' ||
    deliveryStyle === 'expandedLine' ||
    deliveryStyle === 'continue'
    ? 'as_user'
    : 'to_user'
}

/**
 * Realizes delivery semantics that have already been strategically approved.
 * This owner may add or remove only audible perspective markers; it may not
 * invent operational meaning, recommendations, claims, or commitments.
 */
export function realizeGeorgeAudioDelivery(input: {
  text: string
  deliveryStyle: GeorgeLiveDeliveryStyle
  previousState?: GeorgeAudioDeliveryState | null
  repeatableSpeechUptake?: GeorgeRepeatableSpeechUptake
}): GeorgeAudioDeliveryRealization {
  const previousState =
    input.previousState || INITIAL_GEORGE_AUDIO_DELIVERY_STATE
  const perspective = resolveGeorgeAudioPerspective(input.deliveryStyle)

  if (input.deliveryStyle === 'silent') {
    return Object.freeze({
      text: '',
      semantics: Object.freeze({
        perspective,
        repeatableSpeechTransition: 'none' as const,
        transitionMarkerApplied: false,
        nextState: previousState,
        reason: 'Silent delivery does not change audible perspective state.',
      }),
    })
  }

  if (perspective === 'to_user') {
    const text = withoutAdviceMarker(input.text)
    const nextState = Object.freeze({
      perspective: 'to_user' as const,
      repeatableSpeechActive: false,
      awaitingUserUptake: false,
    })

    return Object.freeze({
      text: text ? `My advice? ${text}` : '',
      semantics: Object.freeze({
        perspective,
        repeatableSpeechTransition: previousState.repeatableSpeechActive
          ? 'exit' as const
          : 'none' as const,
        transitionMarkerApplied: Boolean(text),
        nextState,
        reason: previousState.repeatableSpeechActive
          ? 'Advice returns to TO_USER and exits repeatable speech.'
          : 'Minimum audible framing identifies TO_USER advice.',
      }),
    })
  }

  const directText = withoutRepeatableSpeechMarker(input.text)
  const continuation = input.deliveryStyle === 'continue'
  const establishedRepeatableSpeech =
    previousState.repeatableSpeechActive &&
    (
      !previousState.awaitingUserUptake ||
      input.repeatableSpeechUptake === 'confirmed'
    )
  const transition = establishedRepeatableSpeech
    ? 'maintain' as const
    : 'enter' as const
  const transitionMarkerApplied =
    Boolean(directText) && !continuation && !establishedRepeatableSpeech
  const nextState = Object.freeze({
    perspective: 'as_user' as const,
    repeatableSpeechActive: true,
    awaitingUserUptake: continuation ? false : true,
  })

  return Object.freeze({
    text: transitionMarkerApplied ? `Say: ${directText}` : directText,
    semantics: Object.freeze({
      perspective,
      repeatableSpeechTransition: transition,
      transitionMarkerApplied,
      nextState,
      reason: continuation
        ? 'User-initiated continuation is already self-identifying AS_USER speech.'
        : establishedRepeatableSpeech
          ? 'Confirmed uptake maintains repeatable speech without redundant framing.'
          : 'Ambiguous or new AS_USER speech requires an explicit transition marker.',
    }),
  })
}
