export type EmotionalVelocityInput = {
  text: string
  roomPressure?: 'low' | 'moderate' | 'high' | 'authority'
  interruptionRisk?: number
  timestamp?: number
}

export type EmotionalVelocityState = {
  velocity: 'stable' | 'rising' | 'spiking'
  score: number
  reason: string
}

class GeorgeEmotionalVelocity {
  private samples: { score: number; timestamp: number }[] = []
  private maxSamples = 6

  private scoreInput(input: EmotionalVelocityInput) {
    const text = input.text.toLowerCase()
    let score = 0.2

    if (input.roomPressure === 'moderate') score += 0.18
    if (input.roomPressure === 'high') score += 0.35
    if (input.roomPressure === 'authority') score += 0.45

    score += Math.min(0.3, input.interruptionRisk || 0)

    if (/wait|stop|hold on|listen|no\b|why did|explain|problem|concern/i.test(text)) {
      score += 0.2
    }

    return Math.max(0, Math.min(1, Number(score.toFixed(2))))
  }

  update(input: EmotionalVelocityInput): EmotionalVelocityState {
    const now = input.timestamp || Date.now()
    const score = this.scoreInput(input)

    this.samples.unshift({ score, timestamp: now })
    this.samples = this.samples.slice(0, this.maxSamples)

    const previous = this.samples[1]?.score ?? score
    const delta = score - previous

    if (delta >= 0.22 || score >= 0.82) {
      return {
        velocity: 'spiking',
        score,
        reason: 'Emotional speed spiking. Compress hard.',
      }
    }

    if (delta >= 0.1 || score >= 0.62) {
      return {
        velocity: 'rising',
        score,
        reason: 'Emotional speed rising. Reduce complexity.',
      }
    }

    return {
      velocity: 'stable',
      score,
      reason: 'Emotional speed stable.',
    }
  }

  clear() {
    this.samples = []
  }
}

export const georgeEmotionalVelocity =
  new GeorgeEmotionalVelocity()
