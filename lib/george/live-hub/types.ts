import type { GeorgeLiveDeliveryStyle } from '@/lib/george/live-delivery/types'

export type GeorgeRuntimeAuthoritySnapshot = Readonly<Record<string, unknown>>

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
  /**
   * Canonical decision already produced by resolveGeorgeRuntimePipeline().
   * LIVE carries this snapshot unchanged and must not recompute its strategy.
   */
  runtimeSnapshot?: GeorgeRuntimeAuthoritySnapshot
}

export type GeorgeOperationalAssessment = {
  action: string
  evidence?: string
  outcomeImpact?: string
  confidence: number
}

export type GeorgeActionCue = {
  turnId?: string
  cue: string
  reason: string
  operationalAssessment?: GeorgeOperationalAssessment
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
  /**
   * Existing canonical runtime snapshot for the governing turn.
   * This is a transport carrier, not a second reasoning contract.
   */
  runtimeSnapshot?: GeorgeRuntimeAuthoritySnapshot
}

export type GeorgeLiveHubEvent =
  | ({ type: 'ACTION_CUE' } & GeorgeActionCue)
  | { type: 'READY'; at: number }
  | { type: 'ERROR'; error: string; at: number }
  | Record<string, unknown>
