import type { GeorgeRuntimePacket } from './runtime-packet.js'
import type { GeorgeActionCueEvidence } from '../types/protocol.js'

export type ActionCue = {
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

function buildActionCueEvidence(packet: GeorgeRuntimePacket): GeorgeActionCueEvidence {
  return {
    transcript: packet.transcript,
    room: packet.room,
    objective: packet.objective,
    knownContext: packet.knownContext,
    secondaryOutcome: packet.secondaryOutcome,
    secondaryObjective: packet.secondaryObjective,
    intangibleObjective: packet.intangibleObjective,
    userPosition: packet.userPosition,
    deliveryStyle: packet.deliveryStyle,
    runtimeIntent: packet.runtimeIntent,
  }
}

function enforceModeContract(cue: string, deliveryStyle: GeorgeRuntimePacket['deliveryStyle']) {
  const clean = cue.trim()
  if (!clean) return clean

  if (deliveryStyle === 'continue') {
    let next = clean.replace(/^GEORGE:\s*/i, '').trim()
    if (!next.startsWith('...')) next = `...${next.replace(/^[.,;:\s]+/, '')}`
    return next
  }

  if (deliveryStyle === 'response') {
    return clean
      .replace(/^Start by\s+/i, '')
      .replace(/^Ask them to\s+/i, '')
      .replace(/^You should\s+/i, '')
      .trim()
  }

  if (deliveryStyle === 'expandedLine') {
    const lines = clean
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length >= 3) return lines.slice(0, 4).join('\n')

    return clean
  }

  return clean
}

export function arbitrateCue(input: {
  packet: GeorgeRuntimePacket
  fastCue?: string | null
}): ActionCue {
  const fastCue = input.fastCue?.trim()
  const evidence = buildActionCueEvidence(input.packet)

  const maxFastCueLength =
    input.packet.deliveryStyle === 'expandedLine'
      ? 900
      : input.packet.deliveryStyle === 'response'
        ? 520
        : input.packet.deliveryStyle === 'line'
          ? 220
          : input.packet.deliveryStyle === 'continue'
            ? 220
            : 80

  const isGenericLocalCue =
    input.packet.cue.trim().toLowerCase() === 'give a useful response.'

  if (fastCue && fastCue.length <= maxFastCueLength) {
    return {
      cue: enforceModeContract(fastCue, input.packet.deliveryStyle),
      reason: `Fast cue refined local cue: ${input.packet.cue}`,
      source: 'groq',
      localCue: input.packet.cue,
      fastCue,
      evidence,
      category: input.packet.category,
      confidence: Math.min(1, input.packet.confidence + 0.04),
      priority: input.packet.priority + 5,
      at: Date.now(),
    }
  }

  return {
    cue: isGenericLocalCue ? '' : input.packet.cue,
    reason: input.packet.reason,
    source: 'local',
    localCue: input.packet.cue,
    evidence,
    category: input.packet.category,
    confidence: input.packet.confidence,
    priority: isGenericLocalCue ? 0 : input.packet.priority,
    at: Date.now(),
  }
}
