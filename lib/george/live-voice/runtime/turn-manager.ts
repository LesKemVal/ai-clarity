export type RoomState =
  | 'idle'
  | 'other_party_speaking'
  | 'user_speaking'
  | 'george_speaking'
  | 'transition'

export type ControlOwner =
  | 'other_party'
  | 'user'
  | 'balanced'
  | 'unclear'

type RoomSignal = {
  transcript: string
  isFinal: boolean
  speaker: 'other_party' | 'user' | 'unclear'
  timestamp: number
}

export type ControlSnapshot = {
  owner: ControlOwner
  otherPartyScore: number
  userScore: number
  reason: string
}

class GeorgeTurnManager {
  private roomState: RoomState = 'idle'
  private lastSignalAt = 0
  private silenceWindowMs = 900
  private interruptionWindowMs = 1400
  private otherPartyControlScore = 0
  private userControlScore = 0
  private lastControlReason = 'No room control established yet.'

  getState() {
    return this.roomState
  }

  getControlSnapshot(): ControlSnapshot {
    const owner = this.getControlOwner()

    return {
      owner,
      otherPartyScore: Number(this.otherPartyControlScore.toFixed(2)),
      userScore: Number(this.userControlScore.toFixed(2)),
      reason: this.lastControlReason,
    }
  }

  private decayControl() {
    this.otherPartyControlScore *= 0.82
    this.userControlScore *= 0.82
  }

  private getControlOwner(): ControlOwner {
    const delta = this.otherPartyControlScore - this.userControlScore

    if (Math.abs(delta) < 0.28) return 'balanced'
    if (delta > 0) return 'other_party'
    if (delta < 0) return 'user'

    return 'unclear'
  }

  private updateControl(signal: RoomSignal) {
    const text = signal.transcript.toLowerCase()

    this.decayControl()

    if (signal.speaker === 'other_party') {
      this.otherPartyControlScore += signal.isFinal ? 0.42 : 0.22
      this.lastControlReason = 'Other party is actively holding the floor.'
    }

    if (signal.speaker === 'user') {
      this.userControlScore += signal.isFinal ? 0.32 : 0.18
      this.lastControlReason = 'User is actively holding the floor.'
    }

    if (/wait|hold on|stop|listen|let me finish|no,|answer me directly/i.test(text)) {
      this.otherPartyControlScore += 0.55
      this.lastControlReason = 'Other party asserted conversational control.'
    }

    if (/george|help me|what should i say|how do i respond|tell me what to say/i.test(text)) {
      this.userControlScore += 0.7
      this.lastControlReason = 'User directly requested GEORGE assistance.'
    }
  }

  update(signal: RoomSignal) {
    this.lastSignalAt = signal.timestamp
    this.updateControl(signal)

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

  clear() {
    this.roomState = 'idle'
    this.lastSignalAt = 0
    this.otherPartyControlScore = 0
    this.userControlScore = 0
    this.lastControlReason = 'No room control established yet.'
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
