import { detectConversationSignals } from './conversation-signals'

type InterruptionSignal = {
  text: string
  speaker: 'other_party' | 'user' | 'unclear'
  timestamp: number
}

class GeorgeInterruptionEngine {
  private lastInterruptionAt = 0
  private interruptionWindowMs = 1800
  private overlapThreshold = 2

  detect(signal: InterruptionSignal) {
    const text = signal.text.toLowerCase()
    const signals = detectConversationSignals(text)

    const interruption =
      signals.has('interruption_attempt')

    if (interruption) {
      this.lastInterruptionAt = signal.timestamp
      return true
    }

    return false
  }

  isHot(now = Date.now()) {
    return now - this.lastInterruptionAt < this.interruptionWindowMs
  }

  getPriorityBoost() {
    return this.isHot() ? 14 : 0
  }
}

export const georgeInterruptionEngine =
  new GeorgeInterruptionEngine()
