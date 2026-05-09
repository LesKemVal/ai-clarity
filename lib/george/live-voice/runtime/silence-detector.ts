class GeorgeSilenceDetector {
  private lastSpeechAt = 0
  private silenceThresholdMs = 850

  markSpeech() {
    this.lastSpeechAt = Date.now()
  }

  msSinceSpeech(now = Date.now()) {
    return now - this.lastSpeechAt
  }

  isSilenceWindow(now = Date.now()) {
    return this.msSinceSpeech(now) >= this.silenceThresholdMs
  }
}

export const georgeSilenceDetector =
  new GeorgeSilenceDetector()
