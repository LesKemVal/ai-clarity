import type { LiveAwarenessContinuityState } from './live-awareness-reconciliation'

export type LiveOverlapRecoveryState = {
  requiresAttention: boolean
  likelyInterruption: boolean
  possibleQuestion: boolean
  confidence: 'low' | 'medium' | 'high'
  summary: string
}

export function recoverLiveOverlapContext(
  awareness: LiveAwarenessContinuityState
): LiveOverlapRecoveryState {
  const text = awareness.recentSignals.join(' ').toLowerCase()

  const possibleQuestion =
    /\b(who|what|when|where|why|how|which|can you|could you|are you|do you|does|is it|what about)\b/.test(text) ||
    text.includes('?')

  const likelyInterruption =
    awareness.overlapDetected ||
    /\b(wait|hold on|stop|no|but|actually|listen|that's not|that is not)\b/.test(text)

  const requiresAttention =
    awareness.hasRecentContext &&
    (awareness.uncertainty !== 'low' || likelyInterruption || possibleQuestion)

  const confidence: LiveOverlapRecoveryState['confidence'] =
    awareness.uncertainty === 'high'
      ? 'low'
      : awareness.uncertainty === 'medium'
        ? 'medium'
        : 'high'

  const summary = !requiresAttention
    ? ''
    : possibleQuestion && likelyInterruption
      ? 'Possible overlapping question or objection occurred while GEORGE was maintaining the room.'
      : possibleQuestion
        ? 'Possible question detected in recent conversation context.'
        : likelyInterruption
          ? 'Possible interruption or objection detected in recent conversation context.'
          : 'Recent conversation context may need confirmation before GEORGE continues.'

  return {
    requiresAttention,
    likelyInterruption,
    possibleQuestion,
    confidence,
    summary,
  }
}
