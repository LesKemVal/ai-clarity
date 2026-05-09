export type TranscriptEvent = {
  id: string
  text: string
  speaker: 'other_party' | 'user' | 'unclear'
  createdAt: number
}

class TranscriptBuffer {
  private events: TranscriptEvent[] = []
  private maxEvents = 40

  add(event: TranscriptEvent) {
    this.events.unshift(event)

    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }
  }

  recent(count = 8) {
    return this.events.slice(0, count)
  }

  latest() {
    return this.events[0] || null
  }

  clear() {
    this.events = []
  }

  buildShadowMap() {
    const joined = this.events
      .slice(0, 20)
      .reverse()
      .map((e) => `[${e.speaker}] ${e.text}`)
      .join('\n')

    return joined
  }
}

export const transcriptBuffer = new TranscriptBuffer()
