export type LatencySnapshot = {
  transcriptToGovernMs: number
  governMs: number
  ttsMs: number
  totalMs: number
  updatedAt: number
}

class GeorgeLatencyMetrics {
  private snapshot: LatencySnapshot = {
    transcriptToGovernMs: 0,
    governMs: 0,
    ttsMs: 0,
    totalMs: 0,
    updatedAt: 0,
  }

  update(next: Partial<LatencySnapshot>) {
    this.snapshot = {
      ...this.snapshot,
      ...next,
      updatedAt: Date.now(),
    }

    return this.snapshot
  }

  get() {
    return this.snapshot
  }

  clear() {
    this.snapshot = {
      transcriptToGovernMs: 0,
      governMs: 0,
      ttsMs: 0,
      totalMs: 0,
      updatedAt: 0,
    }
  }
}

export const georgeLatencyMetrics =
  new GeorgeLatencyMetrics()
