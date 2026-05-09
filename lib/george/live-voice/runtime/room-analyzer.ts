
export type LiveSpeaker =
  | 'other_party'
  | 'user'
  | 'unclear'

export type SpeakerInference = {
  speaker: LiveSpeaker
  confidence: number
  reason: string
}

const DIRECT_QUESTION_PATTERNS =
  /(\?|do you|can you|could you|would you|where are you|why did you|what did|why do|did you|are you|will you)/i

const AUTHORITY_COMMAND_PATTERNS =
  /(step out|show me|give me|answer me|stop talking|listen|hold on|wait|let me finish)/i

const USER_REQUEST_PATTERNS =
  /(george|help me|what should i say|how do i respond|give me|tell me|coach me)/i

export function inferLiveSpeaker(
  text: string,
  shadowMap = ''
): SpeakerInference {
  const clean = text.trim()

  if (!clean) {
    return {
      speaker: 'unclear',
      confidence: 0,
      reason: 'Empty transcript.',
    }
  }

  if (USER_REQUEST_PATTERNS.test(clean)) {
    return {
      speaker: 'user',
      confidence: 0.86,
      reason: 'User appears to be asking GEORGE for assistance.',
    }
  }

  if (
    AUTHORITY_COMMAND_PATTERNS.test(clean) ||
    DIRECT_QUESTION_PATTERNS.test(clean)
  ) {
    return {
      speaker: 'other_party',
      confidence: 0.78,
      reason: 'Transcript appears directed at the user.',
    }
  }

  const room = analyzeRoom(`${shadowMap}\n${clean}`)

  if (room.likelySpeakerControl === 'other_party') {
    return {
      speaker: 'other_party',
      confidence: 0.62,
      reason: 'Room control appears held by the other party.',
    }
  }

  return {
    speaker: 'unclear',
    confidence: 0.41,
    reason: 'Speaker could not be determined safely.',
  }
}


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
