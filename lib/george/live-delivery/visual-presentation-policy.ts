import type { GeorgeLiveReceiverProfile } from './types'

const VISUAL_INTERRUPTION_WINDOW_MS = 2600
const VISUAL_PRIORITY_INTERRUPT_DELTA = 18
const AUDIO_VISUAL_HOLD_MS = 12000
const VISUAL_ONLY_HOLD_MS = 20000

function normalizeVisualCueText(value: unknown) {
  return String(value || '')
    .trim()
    .replace(/^[“”"'’]+|[“”"'’]+$/g, '')
}

export type GeorgeVisualPresentationDecision =
  | {
      action: 'present'
      text: string
      now: number
      reason: string
    }
  | {
      action: 'suppress'
      text: string
      now: number
      reason:
        | 'empty'
        | 'duplicate'
        | 'current_cue_hold'
        | 'lower_priority'
    }

export function resolveGeorgeVisualPresentationDecision(input: {
  text: unknown
  candidatePriority: number
  currentText?: string
  currentPriority?: number
  hasCurrentCue: boolean
  lastRenderedAt?: number
  now?: number
}): GeorgeVisualPresentationDecision {
  const text = normalizeVisualCueText(input.text)
  const now = input.now ?? Date.now()
  const currentText = String(input.currentText || '')
  const currentPriority = Number(input.currentPriority || 0)
  const lastRenderedAt = Number(input.lastRenderedAt || 0)

  if (!text) {
    return {
      action: 'suppress',
      text,
      now,
      reason: 'empty',
    }
  }

  if (currentText === text) {
    return {
      action: 'suppress',
      text,
      now,
      reason: 'duplicate',
    }
  }

  const cueAgeMs = Math.max(0, now - lastRenderedAt)
  const canInterruptCurrentCue =
    !input.hasCurrentCue ||
    cueAgeMs > VISUAL_INTERRUPTION_WINDOW_MS ||
    input.candidatePriority >
      currentPriority + VISUAL_PRIORITY_INTERRUPT_DELTA

  if (!canInterruptCurrentCue) {
    return {
      action: 'suppress',
      text,
      now,
      reason: 'current_cue_hold',
    }
  }

  if (
    input.hasCurrentCue &&
    input.candidatePriority < currentPriority
  ) {
    return {
      action: 'suppress',
      text,
      now,
      reason: 'lower_priority',
    }
  }

  return {
    action: 'present',
    text,
    now,
    reason: 'Visual cue satisfies presentation policy.',
  }
}

export function resolveGeorgeVisualPresentationHoldMs(
  receiverProfile: GeorgeLiveReceiverProfile
) {
  if (receiverProfile === 'audio_only') return 0
  if (receiverProfile === 'visual_only') return VISUAL_ONLY_HOLD_MS
  return AUDIO_VISUAL_HOLD_MS
}
