import { georgeConversationWindow } from './conversation-window'
import { georgeDeliveryLatencyEstimator } from './delivery-latency-estimator'
import type { LiveDeliveryDirective } from './delivery-router'
import { georgeDeliveryRouter } from './delivery-router'
import { georgeProviderHealth } from './provider-health'

export type LiveDeliveryArbitrationVerdict =
  | 'deliver'
  | 'suppress'
  | 'delay'
  | 'interrupt'

export type LiveDeliveryArbitrationSnapshot = {
  verdict: LiveDeliveryArbitrationVerdict
  directiveType: LiveDeliveryDirective['type']
  reason: string
  checkedAt: number
}

class GeorgeDeliveryArbitrator {
  private snapshot: LiveDeliveryArbitrationSnapshot = {
    verdict: 'suppress',
    directiveType: 'suppress_output',
    reason: 'No delivery arbitration has occurred yet.',
    checkedAt: 0,
  }

  constructor() {
    georgeDeliveryRouter.subscribe((directive) => {
      this.arbitrate(directive)
    })
  }

  arbitrate(directive: LiveDeliveryDirective) {
    const window = georgeConversationWindow.evaluate()
    const latency = georgeDeliveryLatencyEstimator.getSnapshot()
    const providerHealth = georgeProviderHealth.check()

    const verdict = this.resolveVerdict({
      directive,
      windowState: window.state,
      shouldDeliverNow: window.shouldDeliverNow,
      latencyMs: latency.estimatedLatencyMs,
      providerStatus: providerHealth.status,
    })

    this.snapshot = {
      verdict,
      directiveType: directive.type,
      reason: this.resolveReason(verdict, directive, window.reason),
      checkedAt: Date.now(),
    }

    return this.snapshot
  }

  getSnapshot() {
    return this.snapshot
  }

  clear() {
    this.snapshot = {
      verdict: 'suppress',
      directiveType: 'suppress_output',
      reason: 'Delivery arbitration has been reset.',
      checkedAt: 0,
    }

    return this.snapshot
  }

  private resolveVerdict(input: {
    directive: LiveDeliveryDirective
    windowState: string
    shouldDeliverNow: boolean
    latencyMs: number
    providerStatus: string
  }): LiveDeliveryArbitrationVerdict {
    if (input.directive.type === 'suppress_output') return 'suppress'
    if (input.directive.type === 'haptic_only') return 'suppress'
    if (input.providerStatus === 'muted') return 'suppress'
    if (input.providerStatus === 'error') return 'suppress'
    if (input.directive.type === 'interrupt_now') return 'interrupt'
    if (input.windowState === 'closed') return 'suppress'
    if (input.windowState === 'closing' && input.latencyMs > 300) return 'delay'
    if (!input.shouldDeliverNow && input.directive.type === 'queue_whisper') return 'delay'

    return 'deliver'
  }

  private resolveReason(
    verdict: LiveDeliveryArbitrationVerdict,
    directive: LiveDeliveryDirective,
    windowReason: string
  ) {
    if (verdict === 'suppress') return `Suppressed ${directive.type}. ${windowReason}`
    if (verdict === 'delay') return `Delayed ${directive.type}. ${windowReason}`
    if (verdict === 'interrupt') return `Interrupt approved. ${directive.reason}`
    return `Delivery approved for ${directive.type}. ${windowReason}`
  }
}

export const georgeDeliveryArbitrator = new GeorgeDeliveryArbitrator()
