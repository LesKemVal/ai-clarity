import type { GeorgeLiveDeliveryStyle } from '@/lib/george/live-delivery/types'

export type GeorgeActionCueEvidence = {
  // transcript is the latest/governing utterance.
  transcript?: string
  // recentTranscript is continuity evidence only; it may clarify premise, not override transcript.
  recentTranscript?: string
  room?: string
  objective?: string
  knownContext?: string
  briefingKnowledge?: string
  secondaryOutcome?: string
  secondaryObjective?: string
  intangibleObjective?: string
  userPosition?: string
  deliveryStyle?: GeorgeLiveDeliveryStyle
  runtimeIntent?: string
}

export type GeorgeActionCue = {
  turnId?: string
  cue: string
  reason: string
  source: 'local' | 'groq'
  localCue: string
  fastCue?: string
  evidence?: GeorgeActionCueEvidence
  category: string
  confidence: number
  priority: number
  at: number
}

export type GeorgeLiveHubContext = {
  room?: string
  chair?: string
  objective?: string
  knownContext?: string
  briefingKnowledge?: string
  secondaryOutcome?: string
  secondaryObjective?: string
  intangibleObjective?: string
  userPosition?: string
  deliveryStyle?: GeorgeLiveDeliveryStyle
}

export type GeorgeLiveHubEvent =
  | ({ type: 'ACTION_CUE' } & GeorgeActionCue)
  | { type: 'READY'; at: number }
  | { type: 'ERROR'; error: string; at: number }
  | Record<string, unknown>
