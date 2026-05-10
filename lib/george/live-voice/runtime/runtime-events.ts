export type LiveRuntimeEventType =
  | 'cue_ready'
  | 'hold_floor'
  | 'silence_required'
  | 'proof_mode'
  | 'escalation_warning'
  | 'opening_detected'
  | 'interruption_risk_high'
  | 'speak_now'

export type LiveRuntimeEvent = {
  type: LiveRuntimeEventType
  timestamp: number
  payload?: {
    reason?: string
    cue?: string
    nextMove?: string
    responseMode?: string
    deliveryStyle?: string
    intervention?: string
    confidence?: number
    interruptionRisk?: number
    escalationLikelihood?: number
    silence?: string
  }
}

type LiveRuntimeEventListener = (event: LiveRuntimeEvent) => void

class GeorgeLiveRuntimeEvents {
  private listeners = new Set<LiveRuntimeEventListener>()

  emit(type: LiveRuntimeEventType, payload?: LiveRuntimeEvent['payload']) {
    const event: LiveRuntimeEvent = {
      type,
      timestamp: Date.now(),
      payload,
    }

    this.listeners.forEach((listener) => listener(event))
    return event
  }

  subscribe(listener: LiveRuntimeEventListener) {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  clear() {
    this.listeners.clear()
  }
}

export const georgeLiveRuntimeEvents = new GeorgeLiveRuntimeEvents()
