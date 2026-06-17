import type { LiveSpeakerIntentResult } from '@/lib/george/live-voice/runtime/speaker-intent'
import type { ConversationSignalState } from '@/lib/george/live-voice/runtime/conversation-signals'
import type { RoomAnalysis } from '@/lib/george/live-voice/runtime/room-analyzer'
import type { LiveObjectiveId } from '@/lib/george/live-voice/runtime/objective-engine'
import type { TrajectoryState } from '@/lib/george/live-voice/runtime/trajectory-engine'
import type { OutcomeGovernorSnapshot } from '@/lib/george/live-voice/runtime/outcome-governor'

export type GeorgeCoreInterpretation = {
  speakerIntent?: LiveSpeakerIntentResult
  conversationSignals?: ConversationSignalState
  roomAnalysis?: RoomAnalysis
  objective?: LiveObjectiveId
  trajectory?: TrajectoryState
  activeOutcome?: string
  outcomeGovernor?: OutcomeGovernorSnapshot
  source: 'george_core_interpretation'
  createdAt: number
}

export function createGeorgeCoreInterpretation(
  input: Omit<GeorgeCoreInterpretation, 'source' | 'createdAt'>
): GeorgeCoreInterpretation {
  return {
    ...input,
    source: 'george_core_interpretation',
    createdAt: Date.now(),
  }
}
