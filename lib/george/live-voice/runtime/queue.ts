type AudioJob = {
  id: string
  text: string
  priority: number
  createdAt: number
  expiresAt: number
}

export class GeorgeAudioQueue {
  private queue: AudioJob[] = []
  private speaking = false

  enqueue(text: string, priority = 0, ttlMs = 2200) {
    if (!text.trim()) return

    const now = Date.now()

    this.queue.push({
      id: crypto.randomUUID(),
      text,
      priority,
      createdAt: now,
      expiresAt: now + ttlMs,
    })

    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      return a.createdAt - b.createdAt
    })
  }

  next() {
    const now = Date.now()

    this.queue = this.queue.filter((job) => job.expiresAt > now)

    return this.queue.shift() || null
  }

  clear() {
    this.queue = []
  }

  invalidate(predicate: (job: AudioJob) => boolean) {
    this.queue = this.queue.filter((job) => !predicate(job))
  }

  setSpeaking(value: boolean) {
    this.speaking = value
  }

  isSpeaking() {
    return this.speaking
  }

  size() {
    const now = Date.now()
    this.queue = this.queue.filter((job) => job.expiresAt > now)
    return this.queue.length
  }
}

export const georgeAudioQueue = new GeorgeAudioQueue()
