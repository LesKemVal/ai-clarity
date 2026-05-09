class FinalTranscriptRuntime {
  private lastFinalText = ''
  private lastFinalAt = 0
  private duplicateWindowMs = 1800

  normalize(text: string) {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[.,!?]+$/g, '')
  }

  shouldAccept(text: string, now = Date.now()) {
    const clean = this.normalize(text)

    if (!clean) return false

    if (
      clean === this.lastFinalText &&
      now - this.lastFinalAt < this.duplicateWindowMs
    ) {
      return false
    }

    this.lastFinalText = clean
    this.lastFinalAt = now

    return true
  }

  clear() {
    this.lastFinalText = ''
    this.lastFinalAt = 0
  }
}

export const finalTranscriptRuntime = new FinalTranscriptRuntime()
