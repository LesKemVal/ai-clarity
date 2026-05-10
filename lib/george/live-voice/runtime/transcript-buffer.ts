import type { SpeakerRole } from './speaker-role'

export type TranscriptEvent = {
  id: string
  text: string
  speaker: 'other_party' | 'user' | 'unclear'
  role?: SpeakerRole
  roleConfidence?: number
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

  getDominantRole(window = 8) {
    const scores = new Map<SpeakerRole, number>()

    this.events.slice(0, window).forEach((event, index) => {
      if (!event.role || event.role === 'user' || event.role === 'unclear') return

      const recencyWeight = 1 / (index + 1)
      const confidence = event.roleConfidence ?? 0.5
      const current = scores.get(event.role) || 0

      scores.set(event.role, current + confidence * recencyWeight)
    })

    let dominantRole: SpeakerRole | null = null
    let dominantScore = 0

    scores.forEach((score, role) => {
      if (score > dominantScore) {
        dominantRole = role
        dominantScore = score
      }
    })

    return {
      role: dominantRole,
      score: Number(dominantScore.toFixed(2)),
    }
  }

  clear() {
    this.events = []
  }

  buildShadowMap() {
    const joined = this.events
      .slice(0, 20)
      .reverse()
      .map((e) => {
        const role = e.role ? `[${e.role}]` : ''
        return `[${e.speaker}]${role} ${e.text}`
      })
      .join('\n')

    return joined
  }
}

export const transcriptBuffer = new TranscriptBuffer()
