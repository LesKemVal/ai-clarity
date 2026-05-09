export type ConfidenceInput = {
  interruptionRisk?: number
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  usedPrewarm?: boolean
  partialFresh?: boolean
}

class GeorgeConfidenceEngine {
  compute(input: ConfidenceInput) {
    let confidence = 0.58

    if (input.partialFresh) {
      confidence += 0.08
    }

    if (input.usedPrewarm) {
      confidence += 0.12
    }

    switch (input.roomPressure) {
      case 'moderate':
        confidence += 0.04
        break

      case 'high':
        confidence += 0.06
        break

      case 'authority':
        confidence += 0.09
        break
    }

    if ((input.interruptionRisk || 0) > 0.7) {
      confidence -= 0.05
    }

    return Math.max(0.12, Math.min(0.96, Number(confidence.toFixed(2))))
  }

  shouldSpeak(confidence: number) {
    return confidence >= 0.46
  }
}

export const georgeConfidenceEngine =
  new GeorgeConfidenceEngine()
