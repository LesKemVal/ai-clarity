import type { LiveOverlapRecoveryState } from './live-overlap-recovery'

export type LiveRoomStateKind =
  | 'stable'
  | 'overlap_detected'
  | 'clarification_required'
  | 'contested'
  | 'momentum_positive'

export type LiveRoomState = {
  state: LiveRoomStateKind
  reason: string
  shouldSlowDown: boolean
  shouldSeekConfirmation: boolean
  shouldAvoidLongResponse: boolean
}

export function deriveLiveRoomState(params: {
  overlapRecovery: LiveOverlapRecoveryState
  recentSignals?: string[]
}): LiveRoomState {
  const recent = (params.recentSignals || []).join(' ').toLowerCase()
  const recovery = params.overlapRecovery

  const agreementSignal =
    /\b(yes|right|exactly|agreed|that works|sounds good|okay|ok)\b/.test(recent)

  const contestedSignal =
    /\b(no|but|actually|that's not|that is not|wait|hold on|stop|wrong|concern|problem)\b/.test(recent)

  if (recovery.possibleQuestion && recovery.likelyInterruption) {
    return {
      state: 'clarification_required',
      reason: recovery.summary || 'Overlapping question or objection likely occurred.',
      shouldSlowDown: true,
      shouldSeekConfirmation: true,
      shouldAvoidLongResponse: true,
    }
  }

  if (contestedSignal || recovery.likelyInterruption) {
    return {
      state: 'contested',
      reason: recovery.summary || 'Room signal suggests possible disagreement or interruption.',
      shouldSlowDown: true,
      shouldSeekConfirmation: true,
      shouldAvoidLongResponse: true,
    }
  }

  if (recovery.requiresAttention) {
    return {
      state: 'overlap_detected',
      reason: recovery.summary || 'Recent room context may require attention.',
      shouldSlowDown: true,
      shouldSeekConfirmation: recovery.confidence !== 'high',
      shouldAvoidLongResponse: true,
    }
  }

  if (agreementSignal) {
    return {
      state: 'momentum_positive',
      reason: 'Recent room signal suggests agreement or forward movement.',
      shouldSlowDown: false,
      shouldSeekConfirmation: false,
      shouldAvoidLongResponse: false,
    }
  }

  return {
    state: 'stable',
    reason: 'No unstable room signal detected.',
    shouldSlowDown: false,
    shouldSeekConfirmation: false,
    shouldAvoidLongResponse: false,
  }
}
