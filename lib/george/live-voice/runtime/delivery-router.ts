import type { LiveHapticCue } from './haptic-intelligence'
import { georgeHapticIntelligence } from './haptic-intelligence'
import type { LiveWhisperDecision } from './whisper-priority'
import { georgeWhisperPriority } from './whisper-priority'

export type LiveDeliveryDirectiveType =
  | 'suppress_output'
  | 'haptic_only'
  | 'queue_whisper'
  | 'whisper_now'
  | 'interrupt_now'

export type LiveDeliveryDirective = {
  type: LiveDeliveryDirectiveType
  text: string
  haptic?: LiveHapticCue
  whisper?: LiveWhisperDecision
  reason: string
  timestamp: number
}

type LiveDeliveryDirectiveListener = (directive: LiveDeliveryDirective) => void

class GeorgeDeliveryRouter {
  private listeners = new Set<LiveDeliveryDirectiveListener>()
  private lastHaptic: LiveHapticCue | null = null
  private lastDirective: LiveDeliveryDirective = {
    type: 'suppress_output',
    text: '',
    reason: 'No delivery directive emitted yet.',
    timestamp: 0,
  }

  constructor() {
    georgeHapticIntelligence.subscribe((cue) => {
      this.lastHaptic = cue

      if (cue.type === 'hold' || cue.type === 'warning_pulse') {
        this.emit({
          type: 'haptic_only',
          text: '',
          haptic: cue,
          reason: cue.reason,
          timestamp: Date.now(),
        })
      }
    })

    georgeWhisperPriority.subscribe((decision) => {
      const directive = this.mapWhisperToDirective(decision)
      this.emit(directive)
    })
  }

  subscribe(listener: LiveDeliveryDirectiveListener) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  getLastDirective() {
    return this.lastDirective
  }

  clear() {
    this.listeners.clear()
  }

  private emit(directive: LiveDeliveryDirective) {
    this.lastDirective = directive
    this.listeners.forEach((listener) => listener(directive))
    return directive
  }

  private mapWhisperToDirective(
    decision: LiveWhisperDecision
  ): LiveDeliveryDirective {
    if (decision.priority === 'silent') {
      return {
        type: 'suppress_output',
        text: '',
        haptic: this.lastHaptic || undefined,
        whisper: decision,
        reason: decision.reason,
        timestamp: Date.now(),
      }
    }

    if (decision.priority === 'wait') {
      return {
        type: this.lastHaptic ? 'haptic_only' : 'queue_whisper',
        text: '',
        haptic: this.lastHaptic || undefined,
        whisper: decision,
        reason: decision.reason,
        timestamp: Date.now(),
      }
    }

    if (decision.priority === 'interrupt') {
      return {
        type: 'interrupt_now',
        text: decision.text,
        haptic: this.lastHaptic || undefined,
        whisper: decision,
        reason: decision.reason,
        timestamp: Date.now(),
      }
    }

    return {
      type: 'whisper_now',
      text: decision.text,
      haptic: this.lastHaptic || undefined,
      whisper: decision,
      reason: decision.reason,
      timestamp: Date.now(),
    }
  }
}

export const georgeDeliveryRouter = new GeorgeDeliveryRouter()
