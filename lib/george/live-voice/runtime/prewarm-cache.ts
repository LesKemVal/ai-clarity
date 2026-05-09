type PrewarmPacket = {
  key: string
  volley: string
  cue: string
  createdAt: number
  expiresAt: number
}

class GeorgePrewarmCache {
  private packets: PrewarmPacket[] = []

  set(
    key: string,
    volley: string,
    cue: string,
    ttlMs = 2200
  ) {
    const now = Date.now()

    this.packets.unshift({
      key,
      volley,
      cue,
      createdAt: now,
      expiresAt: now + ttlMs,
    })

    this.cleanup()
  }

  get(key: string) {
    this.cleanup()

    return this.packets.find((packet) => packet.key === key) || null
  }

  cleanup() {
    const now = Date.now()
    this.packets = this.packets.filter(
      (packet) => packet.expiresAt > now
    )
  }

  clear() {
    this.packets = []
  }
}

export const georgePrewarmCache = new GeorgePrewarmCache()
