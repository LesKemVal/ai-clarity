type PartialSignal = {
  text: string
  receivedAt: number
  speaker: 'other_party' | 'user' | 'unclear'
}

class PartialTranscriptRuntime {
  private latestPartial: PartialSignal | null = null
  private lastStableText = ''
  private predictionWindowMs = 900

  update(signal: PartialSignal) {
    this.latestPartial = signal
  }

  getLatest() {
    return this.latestPartial
  }

  shouldPrewarm(text: string) {
    const clean = text.trim().toLowerCase()

    if (!clean || clean.length < 12) return false

    if (clean === this.lastStableText) return false

    return (
      /\?$/.test(clean) ||
      /do you|can you|why did|where are|what happened|explain/i.test(clean)
    )
  }

  markStable(text: string) {
    this.lastStableText = text.trim().toLowerCase()
  }

  isPredictionFresh(now = Date.now()) {
    if (!this.latestPartial) return false

    return now - this.latestPartial.receivedAt < this.predictionWindowMs
  }

  clear() {
    this.latestPartial = null
  }
}

export const partialTranscriptRuntime = new PartialTranscriptRuntime()
