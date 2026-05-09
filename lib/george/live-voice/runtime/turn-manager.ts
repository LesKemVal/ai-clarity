export type RoomState =
  | 'idle'
  | 'other_party_speaking'
  | 'user_speaking'
  | 'george_speaking'
  | 'transition'

type RoomSignal = {
  transcript: string
  isFinal: boolean
  speaker: 'other_party' | 'user' | 'unclear'
  timestamp: number
}

class GeorgeTurnManager {
  private roomState: RoomState = 'idle'
  private lastSignalAt = 0
  private silenceWindowMs = 900
  private interruptionWindowMs = 1400

  getState() {
    return this.roomState
  }

  update(signal: RoomSignal) {
    this.lastSignalAt = signal.timestamp

    if (signal.speaker === 'other_party') {
      this.roomState = 'other_party_speaking'
      return
    }

    if (signal.speaker === 'user') {
      this.roomState = 'user_speaking'
      return
    }

    this.roomState = 'transition'
  }

  markGeorgeSpeaking() {
    this.roomState = 'george_speaking'
    this.lastSignalAt = Date.now()
  }

  markIdle() {
    this.roomState = 'idle'
  }

  shouldInterruptGeorge(now = Date.now()) {
    return (
      this.roomState === 'other_party_speaking' &&
      now - this.lastSignalAt < this.interruptionWindowMs
    )
  }

  shouldSuppressStaleCue(createdAt: number, now = Date.now()) {
    return (
      this.roomState === 'other_party_speaking' &&
      now - createdAt > 1400
    )
  }


  canGeorgeSpeak(now = Date.now()) {
    if (this.roomState === 'idle') return true

    if (
      this.roomState === 'other_party_speaking' &&
      now - this.lastSignalAt < this.silenceWindowMs
    ) {
      return false
    }

    return true
  }
}

export const georgeTurnManager = new GeorgeTurnManager()
