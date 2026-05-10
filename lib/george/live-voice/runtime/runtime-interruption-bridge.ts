import { georgeDeliverySessionManager } from './delivery-session-manager'
import { georgeLiveRuntimeMemory } from './runtime-memory'

export type LiveRuntimeInterruptionSource =
  | 'room_activity'
  | 'yield_protocol'
  | 'force_intervention'
  | 'manual_stop'
  | 'provider'

export type LiveRuntimeInterruptionNotice = {
  source: LiveRuntimeInterruptionSource
  reason: string
  timestamp: number
}

class GeorgeRuntimeInterruptionBridge {
  private lastNotice: LiveRuntimeInterruptionNotice | null = null
  private notices: LiveRuntimeInterruptionNotice[] = []
  private maxNotices = 30

  async interrupt(source: LiveRuntimeInterruptionSource, reason: string) {
    const notice: LiveRuntimeInterruptionNotice = {
      source,
      reason,
      timestamp: Date.now(),
    }

    this.lastNotice = notice
    this.notices.unshift(notice)
    this.notices = this.notices.slice(0, this.maxNotices)

    georgeLiveRuntimeMemory.getRecent(1)
    await georgeDeliverySessionManager.interrupt(reason)

    return notice
  }

  getLastNotice() {
    return this.lastNotice
  }

  getRecent(limit = 10) {
    return this.notices.slice(0, limit)
  }

  clear() {
    this.lastNotice = null
    this.notices = []
  }
}

export const georgeRuntimeInterruptionBridge =
  new GeorgeRuntimeInterruptionBridge()
