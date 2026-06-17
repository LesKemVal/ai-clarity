import type { LiveSpeakerPersistenceState } from './live-speaker-persistence'
import type { LiveRoomPriorityState } from './live-room-priorities'
import type { LiveAttentionState } from './live-attention-manager'

export type LiveInfluenceState = {
  influence:
    | 'concentrated'
    | 'contested'
    | 'fragmented'
    | 'user_led'
    | 'unknown'
  dominantRole: string
  trajectoryRisk: 'low' | 'medium' | 'high'
  reason: string
}

export function deriveLiveInfluenceState(params: {
  speakerPersistence: LiveSpeakerPersistenceState
  roomPriorities: LiveRoomPriorityState
  attentionState: LiveAttentionState
}): LiveInfluenceState {
  const { speakerPersistence, roomPriorities, attentionState } = params

  if (
    speakerPersistence.likelyRole === 'objector' &&
    roomPriorities.urgency === 'high'
  ) {
    return {
      influence: 'contested',
      dominantRole: 'objector',
      trajectoryRisk: 'high',
      reason: 'An objector appears to be shaping the room and may threaten the user outcome.',
    }
  }

  if (
    speakerPersistence.likelyRole === 'decision_maker' &&
    roomPriorities.highestPriority === 'recover_question'
  ) {
    return {
      influence: 'concentrated',
      dominantRole: 'decision_maker',
      trajectoryRisk: 'medium',
      reason: 'A likely decision-maker is generating priority signals.',
    }
  }

  if (attentionState.focus === 'user') {
    return {
      influence: 'user_led',
      dominantRole: 'user',
      trajectoryRisk: 'low',
      reason: 'Attention is currently centered on supporting the user outcome.',
    }
  }

  if (roomPriorities.highestPriority === 'slow_room') {
    return {
      influence: 'fragmented',
      dominantRole: 'room',
      trajectoryRisk: 'medium',
      reason: 'Room influence appears distributed or unclear; GEORGE should preserve context.',
    }
  }

  return {
    influence: 'unknown',
    dominantRole: speakerPersistence.likelyRole,
    trajectoryRisk: 'low',
    reason: 'No dominant room influence detected.',
  }
}
