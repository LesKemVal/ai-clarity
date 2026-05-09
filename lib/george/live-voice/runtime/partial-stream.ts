type PartialSignal = {
  text: string
  receivedAt: number
  speaker: 'other_party' | 'user' | 'unclear'
}

class PartialTranscriptRuntime {
  private latestPartial: PartialSignal | null = null
  private lastStableText = ''
  private lastPrewarmText = ''
  private lastPrewarmAt = 0
  private predictionWindowMs = 900
  private prewarmCooldownMs = 900

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

    this.latestPartial = {
      ...signal,
      text: clean,
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
