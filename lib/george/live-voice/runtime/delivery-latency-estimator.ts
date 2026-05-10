import type { LiveDeliveryDirective } from './delivery-router'
import { georgeDeliveryRouter } from './delivery-router'
import { georgeDeliverySessionManager } from './delivery-session-manager'

export type LiveDeliveryLatencySnapshot = {
  lastDirectiveAt: number
  lastDeliveredAt: number
  estimatedLatencyMs: number
  queuePressure: 'none' | 'low' | 'moderate' | 'high'
  interruptLagMs: number
  reason: string
}

class GeorgeDeliveryLatencyEstimator {
  private lastDirectiveAt = 0
  private lastDeliveredAt = 0
  private lastInterruptAt = 0
  private snapshot: LiveDeliveryLatencySnapshot = {
    lastDirectiveAt: 0,
    lastDeliveredAt: 0,
    estimatedLatencyMs: 0,
    queuePressure: 'none',
    interruptLagMs: 0,
    reason: 'No delivery latency observed yet.',
  }

  constructor() {
    georgeDeliveryRouter.subscribe((directive) => {
      this.observeDirective(directive)
    })
  }

  observeDirective(directive: LiveDeliveryDirective) {
    const now = Date.now()
    this.lastDirectiveAt = now

    const session = georgeDeliverySessionManager.getState()

    if (
      directive.type === 'whisper_now' ||
      directive.type === 'interrupt_now'
    ) {
      this.lastDeliveredAt = now
    }

    if (directive.type === 'interrupt_now') {
      this.lastInterruptAt = now
    }

    const estimatedLatencyMs = this.lastDeliveredAt
      ? Math.max(0, this.lastDeliveredAt - this.lastDirectiveAt)
      : 0

    const queuePressure = this.resolveQueuePressure(session.adapterState)
    const interruptLagMs = this.lastInterruptAt
      ? Math.max(0, now - this.lastInterruptAt)
      : 0

    this.snapshot = {
      lastDirectiveAt: this.lastDirectiveAt,
      lastDeliveredAt: this.lastDeliveredAt,
      estimatedLatencyMs,
      queuePressure,
      interruptLagMs,
      reason: this.resolveReason(queuePressure, directive),
    }

    return this.snapshot
  }

  getSnapshot() {
    return this.snapshot
  }

  clear() {
    this.lastDirectiveAt = 0
    this.lastDeliveredAt = 0
    this.lastInterruptAt = 0
    this.snapshot = {
      lastDirectiveAt: 0,
      lastDeliveredAt: 0,
      estimatedLatencyMs: 0,
      queuePressure: 'none',
      interruptLagMs: 0,
      reason: 'Delivery latency estimator has been reset.',
    }

    return this.snapshot
  }

  private resolveQueuePressure(
    adapterState: string
  ): LiveDeliveryLatencySnapshot['queuePressure'] {
    if (adapterState === 'queued') return 'moderate'
    if (adapterState === 'speaking') return 'low'
    if (adapterState === 'interrupted') return 'high'
    return 'none'
  }

  private resolveReason(
    queuePressure: LiveDeliveryLatencySnapshot['queuePressure'],
    directive: LiveDeliveryDirective
  ) {
    if (directive.type === 'suppress_output') return 'Output suppressed; no delivery latency needed.'
    if (directive.type === 'haptic_only') return 'Haptic-only directive; audio latency ignored.'
    if (directive.type === 'interrupt_now') return 'Interrupt directive observed.'
    if (queuePressure === 'high') return 'Delivery pressure is high after interruption.'
    if (queuePressure === 'moderate') return 'Delivery is queued; latency may rise.'
    if (queuePressure === 'low') return 'Adapter is actively delivering.'
    return 'Delivery path is clear.'
  }
}

export const georgeDeliveryLatencyEstimator =
  new GeorgeDeliveryLatencyEstimator()
