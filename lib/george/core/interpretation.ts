import type { LiveSpeakerIntentResult } from '@/lib/george/live-voice/runtime/speaker-intent'
import type { ConversationSignalState } from '@/lib/george/live-voice/runtime/conversation-signals'
import type { RoomAnalysis } from '@/lib/george/live-voice/runtime/room-analyzer'
import type { LiveObjectiveHypothesis, LiveObjectiveId } from '@/lib/george/live-voice/runtime/objective-engine'
import type { TrajectoryState } from '@/lib/george/live-voice/runtime/trajectory-engine'
import type { OutcomeGovernorSnapshot } from '@/lib/george/live-voice/runtime/outcome-governor'
import type { SignalSufficiencyResult } from '@/lib/george/runtime/signal-sufficiency'
import type { RankedSignal } from '@/lib/george/runtime/signal-ranking'
import type { RuntimeSignalArbitration } from '@/lib/george/runtime/runtime-signal-arbitrator'
import type { OperationalSignal } from '@/lib/george/runtime/operational-signals'

export type GeorgeCoreInterpretation = {
  speakerIntent?: LiveSpeakerIntentResult
  conversationSignals?: ConversationSignalState
  roomAnalysis?: RoomAnalysis
  objective?: LiveObjectiveId
  objectiveHypothesis?: LiveObjectiveHypothesis
  trajectory?: TrajectoryState
  activeOutcome?: string
  outcomeGovernor?: OutcomeGovernorSnapshot
  signalSufficiency?: SignalSufficiencyResult
  rankedSignals?: RankedSignal[]
  signalArbitration?: RuntimeSignalArbitration
  operationalSignals?: OperationalSignal[]
  operationalReadiness?: 'sufficient' | 'needs_signal'
  operationalConfidence?: number
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
