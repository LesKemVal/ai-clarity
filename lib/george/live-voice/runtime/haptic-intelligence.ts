import type { LiveRuntimeEvent } from './runtime-events'
import { georgeLiveRuntimeEvents } from './runtime-events'

export type LiveHapticCueType =
  | 'none'
  | 'nudge'
  | 'double_pulse'
  | 'warning_pulse'
  | 'hold'

export type LiveHapticCue = {
  type: LiveHapticCueType
  intensity: 'low' | 'medium' | 'high'
  reason: string
  sourceEvent: LiveRuntimeEvent['type']
  timestamp: number
}

type LiveHapticCueListener = (cue: LiveHapticCue) => void

class GeorgeHapticIntelligence {
  private listeners = new Set<LiveHapticCueListener>()
  private lastCue: LiveHapticCue = {
    type: 'none',
    intensity: 'low',
    reason: 'No haptic cue emitted yet.',
    sourceEvent: 'cue_ready',
    timestamp: 0,
  }

  constructor() {
    georgeLiveRuntimeEvents.subscribe((event) => {
      const cue = this.mapEventToCue(event)

      if (cue.type === 'none') return

      this.lastCue = cue
      this.listeners.forEach((listener) => listener(cue))
    })
  }

  subscribe(listener: LiveHapticCueListener) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  getLastCue() {
    return this.lastCue
  }

  clear() {
    this.listeners.clear()
  }

  private mapEventToCue(event: LiveRuntimeEvent): LiveHapticCue {
    if (event.type === 'cue_ready') {
      return {
        type: 'nudge',
        intensity: 'low',
        reason: 'GEORGE has a cue ready.',
        sourceEvent: event.type,
        timestamp: Date.now(),
      }
    }

    if (event.type === 'interruption_risk_high') {
      return {
        type: 'warning_pulse',
        intensity: 'high',
        reason: 'High interruption risk detected.',
        sourceEvent: event.type,
        timestamp: Date.now(),
      }
    }

    if (
      event.type === 'silence_required' ||
      event.type === 'hold_floor'
    ) {
      return {
        type: 'hold',
        intensity: 'medium',
        reason: 'GEORGE recommends holding silence.',
        sourceEvent: event.type,
        timestamp: Date.now(),
      }
    }

    if (
      event.payload?.escalationLikelihood !== undefined &&
      event.payload.escalationLikelihood > 0.7
    ) {
      return {
        type: 'double_pulse',
        intensity: 'high',
        reason: 'Power dynamic may be shifting.',
        sourceEvent: event.type,
        timestamp: Date.now(),
      }
    }

    return {
      type: 'none',
      intensity: 'low',
      reason: 'No haptic cue needed.',
      sourceEvent: event.type,
      timestamp: Date.now(),
    }
  }
}

export const georgeHapticIntelligence = new GeorgeHapticIntelligence()
