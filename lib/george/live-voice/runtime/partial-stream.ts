export type PartialForecast =
  | 'none'
  | 'interruption_likely'
  | 'authority_takeover'
  | 'hesitation_detected'
  | 'objection_forming'
  | 'close_window_forming'

type PartialSignal = {
  text: string
  receivedAt: number
  speaker: 'other_party' | 'user' | 'unclear'
  forecast?: PartialForecast
  forecastConfidence?: number
}

class PartialTranscriptRuntime {
  private latestPartial: PartialSignal | null = null
  private lastStableText = ''
  private lastPrewarmText = ''
  private lastPrewarmAt = 0
  private predictionWindowMs = 900
  private prewarmCooldownMs = 900

  private forecast(text: string): { forecast: PartialForecast; confidence: number } {
    const clean = this.normalize(text)

    if (/\b(wait|hold on|stop|listen|let me finish)\b/i.test(clean)) {
      return { forecast: 'interruption_likely', confidence: 0.82 }
    }

    if (/\b(officer|license|registration|step out|policy|security|compliance)\b/i.test(clean)) {
      return { forecast: 'authority_takeover', confidence: 0.78 }
    }

    if (/^(uh|um|well|i mean|i guess|maybe)\b/i.test(clean)) {
      return { forecast: 'hesitation_detected', confidence: 0.66 }
    }

    if (/\b(but|problem is|concern|issue|doesn't make sense|not sure|why would)\b/i.test(clean)) {
      return { forecast: 'objection_forming', confidence: 0.7 }
    }

    if (/\b(next step|what time|send me|sounds good|follow up|when can)\b/i.test(clean)) {
      return { forecast: 'close_window_forming', confidence: 0.72 }
    }

    return { forecast: 'none', confidence: 0 }
  }

  normalize(text: string) {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[.,!?]+$/g, '')
  }

  update(signal: PartialSignal) {
    const clean = this.normalize(signal.text)

    if (!clean) return false

    if (
      this.latestPartial &&
      this.normalize(this.latestPartial.text) === clean
    ) {
      return false
    }

    const forecast = this.forecast(clean)

    this.latestPartial = {
      ...signal,
      text: clean,
      forecast: forecast.forecast,
      forecastConfidence: forecast.confidence,
    }

    return true
  }

  getLatest() {
    return this.latestPartial
  }

  shouldPrewarm(text: string, now = Date.now()) {
    const clean = this.normalize(text)

    if (!clean || clean.length < 12) return false
    if (clean === this.lastStableText) return false
    if (clean === this.lastPrewarmText && now - this.lastPrewarmAt < this.prewarmCooldownMs) return false

    const likelyQuestion =
      /\?$/.test(text.trim()) ||
      /do you|can you|why did|where are|what happened|explain/i.test(clean)

    if (!likelyQuestion) return false

    this.lastPrewarmText = clean
    this.lastPrewarmAt = now

    return true
  }

  markStable(text: string) {
    this.lastStableText = this.normalize(text)
  }

  isPredictionFresh(now = Date.now()) {
    if (!this.latestPartial) return false

    return now - this.latestPartial.receivedAt < this.predictionWindowMs
  }

  clear() {
    this.latestPartial = null
    this.lastPrewarmText = ''
    this.lastPrewarmAt = 0
  }
}

export const partialTranscriptRuntime = new PartialTranscriptRuntime()
