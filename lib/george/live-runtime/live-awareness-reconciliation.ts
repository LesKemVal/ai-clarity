import type { LiveAwarenessFragment } from './live-awareness-buffer'

export type LiveAwarenessContinuityState = {
  hasRecentContext: boolean
  recentSignals: string[]
  overlapDetected: boolean
  uncertainty: 'low' | 'medium' | 'high'
  continuityNote: string
}

export function reconcileLiveAwareness(
  buffer: LiveAwarenessFragment[]
): LiveAwarenessContinuityState {
  const recent = buffer.slice(-12)
  const meaningful = recent
    .map((item) => item.text.trim())
    .filter(Boolean)

  const overlapDetected = recent.some(
    (item) => item.overlapLikely || item.whileGeorgeSpeaking
  )

  const uncertainty: LiveAwarenessContinuityState['uncertainty'] =
    recent.some((item) => item.uncertainty === 'high')
      ? 'high'
      : recent.some((item) => item.uncertainty === 'medium')
        ? 'medium'
        : 'low'

  const recentSignals = Array.from(new Set(meaningful)).slice(-6)

  const continuityNote = !recentSignals.length
    ? ''
    : overlapDetected
      ? 'Recent room context includes overlap or speech while GEORGE was speaking. Treat this as useful but uncertain signal.'
      : 'Recent room context appears stable enough to preserve as continuity signal.'

  return {
    hasRecentContext: recentSignals.length > 0,
    recentSignals,
    overlapDetected,
    uncertainty,
    continuityNote,
  }
}
