import type { GeorgeLocalCue } from './cue-types.js'
import type { LiveHubContext } from '../types/protocol.js'

export type GeorgeRuntimePacket = {
  transcript: string
  isFinal: boolean
  signal: string
  pressure: string
  objective: string
  cue: string
  reason: string
  category: string
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
    cue: input.cue.cue,
    reason: input.cue.reason,
    category: input.cue.category,
    confidence: input.cue.confidence,
    priority: input.cue.priority,
    source: 'local',
    at: Date.now(),
  }
}
