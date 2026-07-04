import type { LiveAwarenessFragment } from './live-awareness-buffer'

export type LiveAwarenessContinuityState = {
  hasRecentContext: boolean
  recentSignals: string[]
  persistentSignals: string[]
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

  const signalTerms = meaningful
    .join(' ')
    .toLowerCase()
    .match(/\b(investor|partner|licensing|investment|proof|evidence|risk|concern|price|pricing|timeline|decision|pilot|customer|revenue|security|privacy|integration|scale|deployment|objection|confidence)\b/g) || []

  const signalCounts = signalTerms.reduce<Record<string, number>>((counts, signal) => {
    counts[signal] = (counts[signal] || 0) + 1
    return counts
  }, {})

  const persistentSignals = Object.entries(signalCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([signal]) => signal)
    .slice(0, 6)

  const continuityNote = !recentSignals.length
    ? ''
    : overlapDetected
      ? 'Recent room context includes overlap or speech while GEORGE was speaking. Treat this as useful but uncertain signal.'
      : 'Recent room context appears stable enough to preserve as continuity signal.'

  return {
    hasRecentContext: recentSignals.length > 0,
    recentSignals,
    persistentSignals,
    overlapDetected,
    uncertainty,
    continuityNote,
  }
}
