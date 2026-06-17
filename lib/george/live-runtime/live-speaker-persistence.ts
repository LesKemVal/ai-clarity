import type { LiveAttentionState } from './live-attention-manager'
import type { LiveRoomPriorityState } from './live-room-priorities'
import type { LiveRoomState } from './live-room-state'

export type LiveSpeakerRole =
  | 'user'
  | 'decision_maker'
  | 'objector'
  | 'ally'
  | 'room'
  | 'unknown'

export type LiveSpeakerPersistenceState = {
  likelyRole: LiveSpeakerRole
  roleConfidence: 'low' | 'medium' | 'high'
  reason: string
  shouldTrackRole: boolean
}

export function deriveLiveSpeakerPersistence(params: {
  text: string
  attentionState: LiveAttentionState
  roomPriorities: LiveRoomPriorityState
  roomState: LiveRoomState
}): LiveSpeakerPersistenceState {
  const text = String(params.text || '').toLowerCase()
  const { attentionState, roomPriorities, roomState } = params

  const decisionMakerSignal =
    /\b(investor|buyer|client|doctor|recruiter|hiring manager|partner|manager|judge|customer)\b/.test(text) ||
    /\b(revenue|margin|cost|price|terms|timeline|approval|authority|decision|budget)\b/.test(text)

  const objectorSignal =
    /\b(no|but|actually|concern|problem|risk|wrong|doesn't work|does not work|hold on|wait|not comfortable)\b/.test(text)

  const allySignal =
    /\b(yes|right|exactly|agreed|that works|sounds good|we can|we should|i agree)\b/.test(text)

  if (attentionState.focus === 'decision_maker' || decisionMakerSignal) {
    return {
      likelyRole: 'decision_maker',
      roleConfidence: decisionMakerSignal ? 'high' : 'medium',
      reason: 'Recent signal appears tied to authority, buying, evaluation, or decision-making.',
      shouldTrackRole: true,
    }
  }

  if (attentionState.focus === 'objector' || objectorSignal || roomState.state === 'contested') {
    return {
      likelyRole: 'objector',
      roleConfidence: objectorSignal ? 'high' : 'medium',
      reason: 'Recent signal appears to contain objection, resistance, or disagreement.',
      shouldTrackRole: true,
    }
  }

  if (allySignal || roomPriorities.highestPriority === 'preserve_momentum') {
    return {
      likelyRole: 'ally',
      roleConfidence: allySignal ? 'high' : 'medium',
      reason: 'Recent signal appears supportive or momentum-positive.',
      shouldTrackRole: true,
    }
  }

  if (attentionState.focus === 'user') {
    return {
      likelyRole: 'user',
      roleConfidence: attentionState.confidence,
      reason: 'Attention is currently allocated toward protecting or supporting the user.',
      shouldTrackRole: true,
    }
  }

  if (attentionState.focus === 'room') {
    return {
      likelyRole: 'room',
      roleConfidence: 'medium',
      reason: 'Recent signal is room-level rather than attributable to a clear role.',
      shouldTrackRole: false,
    }
  }

  return {
    likelyRole: 'unknown',
    roleConfidence: 'low',
    reason: 'No durable speaker role signal detected.',
    shouldTrackRole: false,
  }
}
