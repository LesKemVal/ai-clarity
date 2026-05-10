import { georgeConversationWindow } from './conversation-window'
import { georgeDeliveryLatencyEstimator } from './delivery-latency-estimator'
import { georgeProviderHealth } from './provider-health'
import { georgeLiveRuntimeMemory } from './runtime-memory'

export type LiveAdaptiveDeliveryProfile =
  | 'balanced'
  | 'aggressive'
  | 'cautious'
  | 'silent'

export type LiveAdaptiveDeliverySnapshot = {
  profile: LiveAdaptiveDeliveryProfile
  interruptTolerance: number
  silenceBias: number
  queueTolerance: number
  escalationCaution: number
  reason: string
  checkedAt: number
}

class GeorgeAdaptiveDeliveryPolicy {
  private snapshot: LiveAdaptiveDeliverySnapshot = {
    profile: 'balanced',
    interruptTolerance: 0.5,
    silenceBias: 0.5,
    queueTolerance: 0.5,
    escalationCaution: 0.5,
    reason: 'Adaptive delivery policy has not been evaluated yet.',
    checkedAt: 0,
  }

  evaluate() {
    const provider = georgeProviderHealth.check()
    const latency = georgeDeliveryLatencyEstimator.getSnapshot()
    const window = georgeConversationWindow.evaluate()
    const memory = georgeLiveRuntimeMemory.getRecent(10)

    const interruptionEvents = memory.filter(
      (entry) =>
        entry.label.includes('interrupt') ||
        entry.reason.toLowerCase().includes('interrupt')
    ).length

    const silenceEvents = memory.filter(
      (entry) =>
        entry.label.includes('silence') ||
        entry.reason.toLowerCase().includes('silence')
    ).length

    const profile = this.resolveProfile({
      providerStatus: provider.status,
      queuePressure: latency.queuePressure,
      windowState: window.state,
      interruptionEvents,
      silenceEvents,
    })

    this.snapshot = {
      profile,
      interruptTolerance: this.resolveInterruptTolerance(profile),
      silenceBias: this.resolveSilenceBias(profile),
      queueTolerance: this.resolveQueueTolerance(profile),
      escalationCaution: this.resolveEscalationCaution(profile),
      reason: this.resolveReason(profile),
      checkedAt: Date.now(),
    }

    return this.snapshot
  }

  getSnapshot() {
    return this.snapshot
  }

  clear() {
    this.snapshot = {
      profile: 'balanced',
      interruptTolerance: 0.5,
      silenceBias: 0.5,
      queueTolerance: 0.5,
      escalationCaution: 0.5,
      reason: 'Adaptive delivery policy has been reset.',
      checkedAt: 0,
    }

    return this.snapshot
  }

  private resolveProfile(input: {
    providerStatus: string
    queuePressure: string
    windowState: string
    interruptionEvents: number
    silenceEvents: number
  }): LiveAdaptiveDeliveryProfile {
    if (input.providerStatus === 'error') return 'silent'
    if (input.windowState === 'closed') return 'silent'
    if (input.queuePressure === 'high') return 'cautious'
    if (input.interruptionEvents >= 4) return 'cautious'
    if (input.silenceEvents >= 5) return 'silent'
    if (
      input.windowState === 'open' &&
      input.queuePressure === 'low' &&
      input.interruptionEvents <= 1
    ) {
      return 'aggressive'
    }

    return 'balanced'
  }

  private resolveInterruptTolerance(profile: LiveAdaptiveDeliveryProfile) {
    if (profile === 'aggressive') return 0.82
    if (profile === 'cautious') return 0.42
    if (profile === 'silent') return 0.12
    return 0.58
  }

  private resolveSilenceBias(profile: LiveAdaptiveDeliveryProfile) {
    if (profile === 'aggressive') return 0.22
    if (profile === 'cautious') return 0.72
    if (profile === 'silent') return 0.94
    return 0.5
  }

  private resolveQueueTolerance(profile: LiveAdaptiveDeliveryProfile) {
    if (profile === 'aggressive') return 0.8
    if (profile === 'cautious') return 0.4
    if (profile === 'silent') return 0.1
    return 0.6
  }

  private resolveEscalationCaution(profile: LiveAdaptiveDeliveryProfile) {
    if (profile === 'aggressive') return 0.35
    if (profile === 'cautious') return 0.82
    if (profile === 'silent') return 0.95
    return 0.55
  }

  private resolveReason(profile: LiveAdaptiveDeliveryProfile) {
    if (profile === 'aggressive') {
      return 'Conversation window is favorable for proactive delivery.'
    }

    if (profile === 'cautious') {
      return 'Runtime pressure suggests controlled delivery.'
    }

    if (profile === 'silent') {
      return 'Runtime conditions favor silence and restraint.'
    }

    return 'Balanced conversational delivery profile active.'
  }
}

export const georgeAdaptiveDeliveryPolicy =
  new GeorgeAdaptiveDeliveryPolicy()
