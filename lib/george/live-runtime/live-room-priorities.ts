import type { LiveOverlapRecoveryState } from './live-overlap-recovery'
import type { LiveRoomState } from './live-room-state'

export type LiveRoomPriority =
  | 'protect_outcome'
  | 'recover_question'
  | 'resolve_objection'
  | 'slow_room'
  | 'continue_listening'
  | 'preserve_momentum'

export type LiveRoomPriorityState = {
  highestPriority: LiveRoomPriority
  urgency: 'low' | 'medium' | 'high'
  recommendedBehavior:
    | 'listen'
    | 'brief_confirmation'
    | 'short_answer'
    | 'pause_before_answering'
    | 'return_to_outcome'
  confidence: 'low' | 'medium' | 'high'
  reason: string
}

export function deriveLiveRoomPriorities(params: {
  roomState: LiveRoomState
  overlapRecovery: LiveOverlapRecoveryState
  recentSignals?: string[]
  desiredOutcome?: string
}): LiveRoomPriorityState {
  const recent = (params.recentSignals || []).join(' ').toLowerCase()
  const outcome = String(params.desiredOutcome || '').trim()
  const { roomState, overlapRecovery } = params

  const outcomeThreat =
    Boolean(outcome) &&
    /\b(no|but|actually|concern|problem|risk|cost|price|terms|ownership|percentage|timeline|authority)\b/.test(recent)

  if (overlapRecovery.possibleQuestion) {
    return {
      highestPriority: 'recover_question',
      urgency: roomState.state === 'clarification_required' ? 'high' : 'medium',
      recommendedBehavior: 'brief_confirmation',
      confidence: overlapRecovery.confidence,
      reason: 'A possible question appeared during uncertain or overlapping conversation context.',
    }
  }

  if (outcomeThreat || roomState.state === 'contested') {
    return {
      highestPriority: 'resolve_objection',
      urgency: 'high',
      recommendedBehavior: 'return_to_outcome',
      confidence: overlapRecovery.confidence === 'low' ? 'medium' : overlapRecovery.confidence,
      reason: 'Recent room signal may threaten the desired outcome or indicate objection.',
    }
  }

  if (roomState.shouldSlowDown) {
    return {
      highestPriority: 'slow_room',
      urgency: 'medium',
      recommendedBehavior: 'pause_before_answering',
      confidence: 'medium',
      reason: 'Room state suggests GEORGE should avoid over-talking and preserve context.',
    }
  }

  if (roomState.state === 'momentum_positive') {
    return {
      highestPriority: 'preserve_momentum',
      urgency: 'medium',
      recommendedBehavior: 'short_answer',
      confidence: 'high',
      reason: 'Recent signal suggests forward movement; GEORGE should avoid unnecessary expansion.',
    }
  }

  return {
    highestPriority: 'continue_listening',
    urgency: 'low',
    recommendedBehavior: 'listen',
    confidence: 'high',
    reason: 'No higher-priority room signal detected.',
  }
}
