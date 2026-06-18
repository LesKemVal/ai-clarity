import type { GeorgeRuntimePacket } from './runtime-packet.js'

export type ActionCue = {
  cue: string
  reason: string
  source: 'local' | 'groq'
  localCue: string
  fastCue?: string
  category: string
  confidence: number
  priority: number
  at: number
}

export function arbitrateCue(input: {
  packet: GeorgeRuntimePacket
  fastCue?: string | null
}): ActionCue {
  const fastCue = input.fastCue?.trim()

  if (fastCue && fastCue.length <= 80) {
    return {
      cue: fastCue,
      reason: `Fast cue refined local cue: ${input.packet.cue}`,
      source: 'groq',
      localCue: input.packet.cue,
      fastCue,
      category: input.packet.category,
      confidence: Math.min(1, input.packet.confidence + 0.04),
      priority: input.packet.priority + 5,
      at: Date.now(),
    }
  }

  return {
    cue: input.packet.cue,
    reason: input.packet.reason,
    source: 'local',
    localCue: input.packet.cue,
    category: input.packet.category,
    confidence: input.packet.confidence,
    priority: input.packet.priority,
    at: Date.now(),
  }
}
