import type { LiveRuntimeEvent } from './runtime-events'
import { georgeLiveRuntimeEvents } from './runtime-events'

export type LiveWhisperPriority =
  | 'silent'
  | 'wait'
  | 'whisper'
  | 'interrupt'

export type LiveWhisperDecision = {
  priority: LiveWhisperPriority
  reason: string
  text: string
  sourceEvent: LiveRuntimeEvent['type']
  timestamp: number
}

type LiveWhisperDecisionListener = (decision: LiveWhisperDecision) => void

class GeorgeWhisperPriority {
  private listeners = new Set<LiveWhisperDecisionListener>()
  private lastDecision: LiveWhisperDecision = {
    priority: 'silent',
    reason: 'No whisper decision emitted yet.',
    text: '',
    sourceEvent: 'silence_required',
    timestamp: 0,
  }

  constructor() {
    georgeLiveRuntimeEvents.subscribe((event) => {
      const decision = this.mapEventToDecision(event)

      this.lastDecision = decision
      this.listeners.forEach((listener) => listener(decision))
    })
  }

  subscribe(listener: LiveWhisperDecisionListener) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  getLastDecision() {
    return this.lastDecision
  }

  clear() {
    this.listeners.clear()
  }

  private mapEventToDecision(event: LiveRuntimeEvent): LiveWhisperDecision {
    if (
      event.type === 'silence_required' ||
      event.payload?.intervention === 'hold' ||
      event.payload?.deliveryStyle === 'silence'
    ) {
      return {
        priority: 'silent',
        reason: 'Silence is strategically stronger.',
        text: '',
        sourceEvent: event.type,
        timestamp: Date.now(),
      }
    }

    if (event.type === 'interruption_risk_high') {
      return {
        priority: 'wait',
        reason: 'High interruption risk. Do not talk over the room.',
        text: '',
        sourceEvent: event.type,
        timestamp: Date.now(),
      }
    }

    if (
      event.type === 'proof_mode' ||
      event.payload?.responseMode === 'proof'
    ) {
      return {
        priority: 'whisper',
        reason: 'Proof challenge requires a controlled cue.',
        text: event.payload?.nextMove || event.payload?.cue || '',
        sourceEvent: event.type,
        timestamp: Date.now(),
      }
    }

    if (
      event.payload?.escalationLikelihood !== undefined &&
      event.payload.escalationLikelihood > 0.82
    ) {
      return {
        priority: 'interrupt',
        reason: 'Escalation risk is high enough to justify immediate guidance.',
        text: event.payload?.nextMove || event.payload?.cue || '',
        sourceEvent: event.type,
        timestamp: Date.now(),
      }
    }

    if (event.type === 'cue_ready') {
      return {
        priority: 'whisper',
        reason: 'Cue is ready and safe to deliver.',
        text: event.payload?.nextMove || event.payload?.cue || '',
        sourceEvent: event.type,
        timestamp: Date.now(),
      }
    }

    if (event.type === 'opening_detected') {
      return {
        priority: 'whisper',
        reason: 'Opening detected. Give the user the next line.',
        text: event.payload?.nextMove || event.payload?.cue || '',
        sourceEvent: event.type,
        timestamp: Date.now(),
      }
    }

    return {
      priority: 'wait',
      reason: 'No immediate whisper needed.',
      text: '',
      sourceEvent: event.type,
      timestamp: Date.now(),
    }
  }
}

export const georgeWhisperPriority = new GeorgeWhisperPriority()
