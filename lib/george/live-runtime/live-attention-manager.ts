import type { LiveAwarenessContinuityState } from './live-awareness-reconciliation'
import type { LiveOverlapRecoveryState } from './live-overlap-recovery'
import type { LiveRoomPriorityState } from './live-room-priorities'
import type { LiveRoomState } from './live-room-state'

export type LiveAttentionFocus =
  | 'user'
  | 'decision_maker'
  | 'objector'
  | 'room'
  | 'unknown'

export type LiveAttentionMode =
  | 'monitor'
  | 'support'
  | 'intervene'
  | 'recover'

export type LiveAttentionState = {
  focus: LiveAttentionFocus
  mode: LiveAttentionMode
  confidence: 'low' | 'medium' | 'high'
  explanation: string
}

export function deriveLiveAttentionState(params: {
  awarenessState: LiveAwarenessContinuityState
  overlapRecovery: LiveOverlapRecoveryState
  roomState: LiveRoomState
  roomPriorities: LiveRoomPriorityState
}): LiveAttentionState {
  const recent = params.awarenessState.recentSignals.join(' ').toLowerCase()
  const { overlapRecovery, roomState, roomPriorities } = params

  const decisionMakerSignal =
    /\b(investor|buyer|client|doctor|recruiter|hiring manager|partner|attorney|judge|manager)\b/.test(recent)

  const objectorSignal =
    /\b(no|but|actually|concern|problem|risk|wrong|doesn't work|does not work|hold on|wait)\b/.test(recent)

  if (roomPriorities.highestPriority === 'recover_question') {
    return {
      focus: decisionMakerSignal ? 'decision_maker' : 'unknown',
      mode: 'recover',
      confidence: overlapRecovery.confidence,
      explanation: 'A possible question needs recovery before GEORGE continues.',
    }
  }

  if (roomPriorities.highestPriority === 'resolve_objection' || roomState.state === 'contested') {
    return {
      focus: objectorSignal ? 'objector' : 'room',
      mode: 'intervene',
      confidence: roomPriorities.confidence,
      explanation: 'Room signal suggests objection or disagreement deserves attention.',
    }
  }

  if (roomPriorities.highestPriority === 'protect_outcome') {
    return {
      focus: 'user',
      mode: 'support',
      confidence: roomPriorities.confidence,
      explanation: 'The user outcome may need protection.',
    }
  }

  if (roomPriorities.highestPriority === 'slow_room' || roomState.shouldSlowDown) {
    return {
      focus: 'room',
      mode: 'monitor',
      confidence: roomPriorities.confidence,
      explanation: 'The room should slow down while GEORGE preserves context.',
    }
  }

  if (roomPriorities.highestPriority === 'preserve_momentum') {
    return {
      focus: decisionMakerSignal ? 'decision_maker' : 'room',
      mode: 'support',
      confidence: 'high',
      explanation: 'The room appears to have forward movement that should be preserved.',
    }
  }

  return {
    focus: 'room',
    mode: 'monitor',
    confidence: 'high',
    explanation: 'No special attention shift is required.',
  }
}
