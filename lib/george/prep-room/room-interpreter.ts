export type RoomPressure = 'low' | 'medium' | 'high'
export type RoomAltitude = 'casual' | 'professional' | 'executive' | 'high_stakes'

export type RoomInterpretation = {
  roomType: string
  pressure: RoomPressure
  altitude: RoomAltitude
  defensiveness: number
  interruptionRisk: number
  emotionalVolatility: number
  requiresCompression: boolean
  recommendedStrategy: string
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term))
}

export function interpretRoom(contextText?: string | null): RoomInterpretation {
  const text = String(contextText || '').toLowerCase()

  const professionalSignals = hasAny(text, [
    'meeting',
    'executive',
    'budget',
    'numbers',
    'stakeholder',
    'client',
    'presentation',
    'deck',
    'board',
  ])

  const negotiationSignals = hasAny(text, [
    'deal',
    'offer',
    'price',
    'counter',
    'terms',
    'negotiat',
  ])

  const pressureSignals = hasAny(text, [
    'challenged',
    'pushback',
    'tense',
    'pressure',
    'urgent',
    'angry',
    'defensive',
    'heated',
  ])

  if (negotiationSignals) {
    return {
      roomType: 'negotiation',
      pressure: pressureSignals ? 'high' : 'medium',
      altitude: 'high_stakes',
      defensiveness: 0.7,
      interruptionRisk: 0.6,
      emotionalVolatility: 0.55,
      requiresCompression: true,
      recommendedStrategy: 'slow urgency, clarify leverage, and protect optionality',
    }
  }

  if (professionalSignals) {
    return {
      roomType: 'professional meeting',
      pressure: pressureSignals ? 'medium' : 'low',
      altitude: 'executive',
      defensiveness: pressureSignals ? 0.65 : 0.3,
      interruptionRisk: 0.45,
      emotionalVolatility: 0.25,
      requiresCompression: true,
      recommendedStrategy: 'identify disagreement source before defending conclusions',
    }
  }

  return {
    roomType: 'general conversation',
    pressure: pressureSignals ? 'medium' : 'low',
    altitude: 'casual',
    defensiveness: pressureSignals ? 0.45 : 0.15,
    interruptionRisk: 0.2,
    emotionalVolatility: 0.2,
    requiresCompression: false,
    recommendedStrategy: 'understand the room before steering the conversation',
  }
}
