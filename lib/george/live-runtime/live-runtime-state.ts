import type { LiveAttentionState } from './live-attention-manager'
import type { LiveAwarenessContinuityState } from './live-awareness-reconciliation'
import type { LiveInfluenceState } from './live-influence-map'
import type { LiveOutcomeDriftState } from './live-outcome-drift'
import type { LiveOverlapRecoveryState } from './live-overlap-recovery'
import type { LiveRoomPriorityState } from './live-room-priorities'
import type { LiveRoomState } from './live-room-state'
import type { LiveSpeakerPersistenceState } from './live-speaker-persistence'

export type LiveRuntimeBehavior =
  | 'listen'
  | 'do_not_speak_yet'
  | 'recover_context'
  | 'brief_confirmation'
  | 'return_to_outcome'
  | 'protect_user'
  | 'answer_briefly'
  | 'slow_down'

export type LiveRuntimeState = {
  recommendedBehavior: LiveRuntimeBehavior
  outcomeUseful: boolean
  urgency: 'low' | 'medium' | 'high'
  reason: string
}

export function composeLiveRuntimeState(params: {
  awarenessState: LiveAwarenessContinuityState
  overlapRecovery: LiveOverlapRecoveryState
  roomState: LiveRoomState
  roomPriorities: LiveRoomPriorityState
  attentionState: LiveAttentionState
  speakerPersistence: LiveSpeakerPersistenceState
  influenceState: LiveInfluenceState
  outcomeDrift: LiveOutcomeDriftState
}): LiveRuntimeState {
  const {
    overlapRecovery,
    roomState,
    roomPriorities,
    attentionState,
    influenceState,
    outcomeDrift,
  } = params

  if (outcomeDrift.interventionRecommended && outcomeDrift.severity === 'high') {
    return {
      recommendedBehavior: 'return_to_outcome',
      outcomeUseful: true,
      urgency: 'high',
      reason: outcomeDrift.reason,
    }
  }

  if (influenceState.trajectoryRisk === 'high') {
    return {
      recommendedBehavior: 'protect_user',
      outcomeUseful: true,
      urgency: 'high',
      reason: influenceState.reason,
    }
  }

  if (overlapRecovery.requiresAttention || roomPriorities.highestPriority === 'recover_question') {
    return {
      recommendedBehavior: 'recover_context',
      outcomeUseful: true,
      urgency: roomPriorities.urgency,
      reason: overlapRecovery.summary || roomPriorities.reason,
    }
  }

  if (roomState.shouldSeekConfirmation || roomPriorities.recommendedBehavior === 'brief_confirmation') {
    return {
      recommendedBehavior: 'brief_confirmation',
      outcomeUseful: true,
      urgency: roomPriorities.urgency,
      reason: roomState.reason,
    }
  }

  if (roomState.shouldSlowDown || attentionState.mode === 'monitor') {
    return {
      recommendedBehavior: 'slow_down',
      outcomeUseful: true,
      urgency: roomPriorities.urgency,
      reason: roomState.reason,
    }
  }

  if (roomPriorities.recommendedBehavior === 'short_answer') {
    return {
      recommendedBehavior: 'answer_briefly',
      outcomeUseful: true,
      urgency: roomPriorities.urgency,
      reason: roomPriorities.reason,
    }
  }

  return {
    recommendedBehavior: 'listen',
    outcomeUseful: false,
    urgency: 'low',
    reason: 'No outcome-directed runtime adjustment required.',
  }
}
