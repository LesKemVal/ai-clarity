export type LoadState = 'low' | 'managed' | 'high' | 'overload'

export type LoadInput = {
  confidence?: number
  interruptionRisk?: number
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  speaker?: 'other_party' | 'user' | 'george_instruction' | 'unclear'
  strongestRolePressure?: [string, number]
}

export type LoadDecision = {
  state: LoadState
  maxWords: number
  cadence: 'normal' | 'slow' | 'minimal'
  reason: string
}

class GeorgeLoadManager {
  decide(input: LoadInput): LoadDecision {
    const confidence = input.confidence ?? 0.5
    const interruptionRisk = input.interruptionRisk ?? 0
    const [role, rolePressure] = input.strongestRolePressure ?? ['neutral', 0]

    if (role === 'authority' && rolePressure > 1.2) {
      return {
        state: 'overload',
        maxWords: 5,
        cadence: 'minimal',
        reason: 'Authority pressure persisting. Minimal cue.',
      }
    }

    if (role === 'skeptic' && rolePressure > 1.4) {
      return {
        state: 'high',
        maxWords: 6,
        cadence: 'minimal',
        reason: 'Skeptic pressure persisting. Proof must be compressed.',
      }
    }

    if (role === 'gatekeeper' && rolePressure > 1.4) {
      return {
        state: 'high',
        maxWords: 7,
        cadence: 'minimal',
        reason: 'Gatekeeper pressure persisting. Reduce friction.',
      }
    }

    if (role === 'ally' && rolePressure > 1.2 && interruptionRisk < 0.55) {
      return {
        state: 'managed',
        maxWords: 10,
        cadence: 'normal',
        reason: 'Ally opening detected. Use room without crowding.',
      }
    }

    if (input.roomPressure === 'authority') {
      return {
        state: 'high',
        maxWords: 7,
        cadence: 'minimal',
        reason: 'Authority pressure. Compress.',
      }
    }

    if (interruptionRisk > 0.78 || confidence < 0.42) {
      return {
        state: 'overload',
        maxWords: 5,
        cadence: 'minimal',
        reason: 'User bandwidth likely low.',
      }
    }

    if (input.roomPressure === 'high' || interruptionRisk > 0.58) {
      return {
        state: 'high',
        maxWords: 7,
        cadence: 'slow',
        reason: 'Pressure rising. Reduce load.',
      }
    }

    if (input.roomPressure === 'moderate') {
      return {
        state: 'managed',
        maxWords: 9,
        cadence: 'slow',
        reason: 'Moderate pressure. Keep it simple.',
      }
    }

    return {
      state: 'low',
      maxWords: 12,
      cadence: 'normal',
      reason: 'Load stable.',
    }
  }

  compress(text: string, maxWords: number) {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, maxWords)
      .join(' ')
  }
}

export const georgeLoadManager =
  new GeorgeLoadManager()
