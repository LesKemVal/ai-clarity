import type { GeorgeLocalCue } from './cue-types.js'
import type { LiveHubContext, LiveHubDeliveryStyle } from '../types/protocol.js'
import { classifyRuntimeIntent, type GeorgeRuntimeIntent } from './runtime-intent.js'

export type GeorgeRuntimePacket = {
  transcript: string
  recentTranscript?: string
  isFinal: boolean
  signal: string
  pressure: string
  objective: string
  room?: string
  chair?: string
  knownContext?: string
  secondaryOutcome?: string
  secondaryObjective?: string
  intangibleObjective?: string
  userPosition?: string
  deliveryStyle: LiveHubDeliveryStyle
  runtimeIntent: GeorgeRuntimeIntent
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
  recentTranscript?: string
  isFinal: boolean
  context: LiveHubContext
  cue: GeorgeLocalCue
}): GeorgeRuntimePacket {
  return {
    transcript: input.transcript,
    recentTranscript: input.recentTranscript,
    isFinal: input.isFinal,
    signal: input.cue.category,
    pressure: input.cue.category,
    objective: input.context.objective || '',
    room: input.context.room || '',
    chair: input.context.chair || '',
    knownContext: input.context.knownContext || '',
    secondaryOutcome: input.context.secondaryOutcome || '',
    secondaryObjective: input.context.secondaryObjective || '',
    intangibleObjective: input.context.intangibleObjective || '',
    userPosition: input.context.userPosition || '',
    deliveryStyle: input.context.deliveryStyle || 'cue',
    runtimeIntent: classifyRuntimeIntent({
      transcript: input.transcript,
      deliveryStyle: input.context.deliveryStyle || 'cue',
      category: input.cue.category,
    }),
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
