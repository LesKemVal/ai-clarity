import type { LiveAudioAdapterState } from './delivery-adapters/audio-adapter-interface'
import type { LiveDeliverySessionState } from './delivery-session-manager'
import { georgeDeliverySessionManager } from './delivery-session-manager'

export type LiveProviderHealthStatus =
  | 'unknown'
  | 'healthy'
  | 'degraded'
  | 'muted'
  | 'interrupted'
  | 'error'

export type LiveProviderHealthSnapshot = {
  status: LiveProviderHealthStatus
  activeAdapter: string
  adapterState: LiveAudioAdapterState
  muted: boolean
  lastCheckedAt: number
  lastDeliveryAt: number
  interruptionCount: number
  muteStartedAt?: number
  reason: string
}

class GeorgeProviderHealth {
  private interruptionCount = 0
  private lastDeliveryAt = 0
  private muteStartedAt: number | undefined
  private snapshot: LiveProviderHealthSnapshot = {
    status: 'unknown',
    activeAdapter: 'unknown',
    adapterState: 'idle',
    muted: false,
    lastCheckedAt: 0,
    lastDeliveryAt: 0,
    interruptionCount: 0,
    reason: 'Provider health has not been checked yet.',
  }

  check(sessionState: LiveDeliverySessionState = georgeDeliverySessionManager.getState()) {
    const now = Date.now()

    if (sessionState.adapterState === 'interrupted') {
      this.interruptionCount += 1
    }

    if (sessionState.adapterState === 'speaking' || sessionState.adapterState === 'queued') {
      this.lastDeliveryAt = now
    }

    if (sessionState.muted && !this.muteStartedAt) {
      this.muteStartedAt = now
    }

    if (!sessionState.muted) {
      this.muteStartedAt = undefined
    }

    const status = this.resolveStatus(sessionState)
    const reason = this.resolveReason(status, sessionState)

    this.snapshot = {
      status,
      activeAdapter: sessionState.activeAdapter,
      adapterState: sessionState.adapterState,
      muted: sessionState.muted,
      lastCheckedAt: now,
      lastDeliveryAt: this.lastDeliveryAt,
      interruptionCount: this.interruptionCount,
      muteStartedAt: this.muteStartedAt,
      reason,
    }

    return this.snapshot
  }

  getSnapshot() {
    return this.snapshot
  }

  clear() {
    this.interruptionCount = 0
    this.lastDeliveryAt = 0
    this.muteStartedAt = undefined
    this.snapshot = {
      status: 'unknown',
      activeAdapter: 'unknown',
      adapterState: 'idle',
      muted: false,
      lastCheckedAt: 0,
      lastDeliveryAt: 0,
      interruptionCount: 0,
      reason: 'Provider health has been reset.',
    }

    return this.snapshot
  }

  private resolveStatus(
    sessionState: LiveDeliverySessionState
  ): LiveProviderHealthStatus {
    if (sessionState.muted) return 'muted'
    if (sessionState.adapterState === 'error') return 'error'
    if (sessionState.adapterState === 'interrupted') return 'interrupted'
    if (sessionState.adapterState === 'queued') return 'degraded'
    if (sessionState.adapterState === 'connected' || sessionState.adapterState === 'speaking') {
      return 'healthy'
    }

    return 'unknown'
  }

  private resolveReason(
    status: LiveProviderHealthStatus,
    sessionState: LiveDeliverySessionState
  ) {
    if (status === 'muted') return 'Delivery session is muted.'
    if (status === 'error') return sessionState.lastResult?.reason || 'Adapter reported an error.'
    if (status === 'interrupted') return 'Adapter was interrupted by runtime delivery control.'
    if (status === 'degraded') return 'Adapter has queued delivery pending.'
    if (status === 'healthy') return 'Adapter is connected or actively delivering.'
    return 'Adapter has not entered an active delivery state.'
  }
}

export const georgeProviderHealth = new GeorgeProviderHealth()
