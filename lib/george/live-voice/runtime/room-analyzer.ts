export type RoomPressure =
  | 'low'
  | 'moderate'
  | 'high'
  | 'authority'

export type RoomAnalysis = {
  pressure: RoomPressure
  interruptionRisk: number
  emotionalTemperature: number
  likelySpeakerControl: 'user' | 'other_party' | 'balanced'
  summary: string
}

const AUTHORITY_PATTERNS =
  /(license|registration|insurance|officer|step out|compliance|policy|security)/i

const PRESSURE_PATTERNS =
  /(why did you|explain|problem|issue|concern|late|deadline|raise|performance|fired|warning)/i

const INTERRUPTION_PATTERNS =
  /(hold on|wait|listen|stop|no|that's not|you're not hearing me)/i

export function analyzeRoom(shadowMap: string): RoomAnalysis {
  const text = shadowMap.toLowerCase()

  const authority = AUTHORITY_PATTERNS.test(text)
  const pressure = PRESSURE_PATTERNS.test(text)
  const interruption = INTERRUPTION_PATTERNS.test(text)

  let pressureLevel: RoomPressure = 'low'

  if (authority) {
    pressureLevel = 'authority'
  } else if (pressure && interruption) {
    pressureLevel = 'high'
  } else if (pressure) {
    pressureLevel = 'moderate'
  }

  return {
    pressure: pressureLevel,
    interruptionRisk: interruption ? 0.82 : pressure ? 0.56 : 0.2,
    emotionalTemperature: pressure ? 0.72 : 0.34,
    likelySpeakerControl: interruption ? 'other_party' : 'balanced',
    summary: authority
      ? 'Authority pressure detected.'
      : pressure
        ? 'Pressure rising in room.'
        : 'Room relatively stable.',
  }
}
