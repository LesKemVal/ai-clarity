type AudioJob = {
  id: string
  text: string
  priority: number
  createdAt: number
}

export class GeorgeAudioQueue {
  private queue: AudioJob[] = []
  private speaking = false

  enqueue(text: string, priority = 0) {
    if (!text.trim()) return

    this.queue.push({
      id: crypto.randomUUID(),
      text,
      priority,
      createdAt: Date.now(),
    })

    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      return a.createdAt - b.createdAt
    })
  }

  next() {
    return this.queue.shift() || null
  }

  clear() {
    this.queue = []
  }

  setSpeaking(value: boolean) {
    this.speaking = value
  }

  isSpeaking() {
    return this.speaking
  }

  size() {
    return this.queue.length
  }
}

export const georgeAudioQueue = new GeorgeAudioQueue()
