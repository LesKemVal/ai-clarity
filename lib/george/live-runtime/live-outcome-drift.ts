import type { LiveInfluenceState } from './live-influence-map'
import type { LiveRoomPriorityState } from './live-room-priorities'
import type { LiveRoomState } from './live-room-state'

export type LiveOutcomeDriftState = {
  aligned: boolean
  severity: 'low' | 'medium' | 'high'
  reason: string
  interventionRecommended: boolean
}

export function deriveLiveOutcomeDrift(params: {
  desiredOutcome: string
  roomState: LiveRoomState
  roomPriorities: LiveRoomPriorityState
  influenceState: LiveInfluenceState
}) : LiveOutcomeDriftState {

  const outcome = String(params.desiredOutcome || '').trim()

  if (!outcome) {
    return {
      aligned: true,
      severity: 'low',
      reason: 'No desired outcome provided.',
      interventionRecommended: false,
    }
  }

  if (
    params.influenceState.trajectoryRisk === 'high' &&
    params.roomPriorities.urgency === 'high'
  ) {
    return {
      aligned: false,
      severity: 'high',
      reason: 'Room trajectory may be diverging from the intended outcome.',
      interventionRecommended: true,
    }
  }

  if (
    params.roomState.state === 'contested' ||
    params.roomState.state === 'clarification_required' ||
    params.roomState.state === 'overlap_detected'
  ) {
    return {
      aligned: false,
      severity: 'medium',
      reason: 'Conversation structure may threaten the desired outcome.',
      interventionRecommended: true,
    }
  }

  return {
    aligned: true,
    severity: 'low',
    reason: 'Conversation appears aligned with the desired outcome.',
    interventionRecommended: false,
  }
}
