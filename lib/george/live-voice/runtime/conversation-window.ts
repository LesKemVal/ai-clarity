import { georgeDeliveryLatencyEstimator } from './delivery-latency-estimator'
import { georgeLiveRuntimeState } from './live-runtime-state'

export type LiveConversationWindowState =
  | 'unknown'
  | 'open'
  | 'closing'
  | 'closed'
  | 'interrupt_sensitive'
  | 'escalation_sensitive'

export type LiveConversationWindowSnapshot = {
  state: LiveConversationWindowState
  shouldDeliverNow: boolean
  maxUsefulDelayMs: number
  reason: string
  checkedAt: number
}

class GeorgeConversationWindow {
  private snapshot: LiveConversationWindowSnapshot = {
    state: 'unknown',
    shouldDeliverNow: false,
    maxUsefulDelayMs: 0,
    reason: 'Conversation window has not been evaluated yet.',
    checkedAt: 0,
  }

  evaluate() {
    const runtime = georgeLiveRuntimeState.get()
    const latency = georgeDeliveryLatencyEstimator.getSnapshot()
    const interruptionRisk = Number(runtime.interruptionRisk || 0)
    const escalationLikelihood = Number(runtime.escalationLikelihood || 0)
    const forecastBias = runtime.forecastBias || 'none'
    const silence = runtime.silence || 'unknown'

    const state = this.resolveState({
      interruptionRisk,
      escalationLikelihood,
      forecastBias,
      silence,
      latencyMs: latency.estimatedLatencyMs,
      queuePressure: latency.queuePressure,
    })

    const maxUsefulDelayMs = this.resolveMaxUsefulDelay(state)
    const shouldDeliverNow =
      state === 'open' ||
      state === 'interrupt_sensitive' ||
      state === 'escalation_sensitive'

    this.snapshot = {
      state,
      shouldDeliverNow,
      maxUsefulDelayMs,
      reason: this.resolveReason(state),
      checkedAt: Date.now(),
    }

    return this.snapshot
  }

  getSnapshot() {
    return this.snapshot
  }

  clear() {
    this.snapshot = {
      state: 'unknown',
      shouldDeliverNow: false,
      maxUsefulDelayMs: 0,
      reason: 'Conversation window has been reset.',
      checkedAt: 0,
    }

    return this.snapshot
  }

  private resolveState(input: {
    interruptionRisk: number
    escalationLikelihood: number
    forecastBias: string
    silence: string
    latencyMs: number
    queuePressure: string
  }): LiveConversationWindowState {
    if (input.silence === 'hold') return 'closed'
    if (input.escalationLikelihood > 0.78) return 'escalation_sensitive'
    if (input.interruptionRisk > 0.78) return 'interrupt_sensitive'
    if (input.queuePressure === 'high') return 'closing'
    if (input.latencyMs > 1200) return 'closing'
    if (input.forecastBias === 'advance' || input.forecastBias === 'support') {
      return 'open'
    }
    if (input.forecastBias === 'hold') return 'closing'

    return 'unknown'
  }

  private resolveMaxUsefulDelay(state: LiveConversationWindowState) {
    if (state === 'escalation_sensitive') return 250
    if (state === 'interrupt_sensitive') return 350
    if (state === 'open') return 700
    if (state === 'closing') return 300
    return 0
  }

  private resolveReason(state: LiveConversationWindowState) {
    if (state === 'closed') return 'Conversation window is closed; silence is currently stronger.'
    if (state === 'escalation_sensitive') return 'Escalation-sensitive window requires immediate, careful delivery.'
    if (state === 'interrupt_sensitive') return 'Interruption-sensitive window requires tight timing.'
    if (state === 'open') return 'Conversation window is open for useful delivery.'
    if (state === 'closing') return 'Conversation window is closing; delayed cues may lose value.'
    return 'Conversation window is unclear.'
  }
}

export const georgeConversationWindow =
  new GeorgeConversationWindow()
