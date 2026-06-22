import type { GeorgeLocalCue } from './cue-types.js'
import type { LiveHubContext, LiveHubDeliveryStyle } from '../types/protocol.js'

export type GeorgeRuntimePacket = {
  transcript: string
  isFinal: boolean
  signal: string
  pressure: string
  objective: string
  deliveryStyle: LiveHubDeliveryStyle
  cue: string
  reason: string
  category: string
  operationalSignal?: string
  obstacle?: string
  outcomeImpact?: string
  supportStrategy?: string
  confidence: number
  priority: number
  source: 'local'
  at: number
}

export function buildRuntimePacket(input: {
  transcript: string
  isFinal: boolean
  context: LiveHubContext
  cue: GeorgeLocalCue
}): GeorgeRuntimePacket {
  return {
    transcript: input.transcript,
    isFinal: input.isFinal,
    signal: input.cue.category,
    pressure: input.cue.category,
    objective: input.context.objective || '',
    deliveryStyle: input.context.deliveryStyle || 'cue',
    cue: input.cue.cue,
    reason: input.cue.reason,
    category: input.cue.category,
    operationalSignal: input.cue.operationalSignal,
    obstacle: input.cue.obstacle,
    outcomeImpact: input.cue.outcomeImpact,
    supportStrategy: input.cue.supportStrategy,
    confidence: input.cue.confidence,
    priority: input.cue.priority,
    source: 'local',
    at: Date.now(),
  }
}
