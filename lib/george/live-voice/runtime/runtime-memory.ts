import { georgeDeliveryArbitrator } from './delivery-arbitrator'
import { georgeDeliveryRouter } from './delivery-router'
import type { LiveRuntimeEvent } from './runtime-events'
import { georgeLiveRuntimeEvents } from './runtime-events'

export type LiveRuntimeMemoryEntry = {
  type:
    | 'event'
    | 'delivery_directive'
    | 'arbitration'
  label: string
  reason: string
  timestamp: number
}

class GeorgeLiveRuntimeMemory {
  private entries: LiveRuntimeMemoryEntry[] = []
  private maxEntries = 40

  constructor() {
    georgeLiveRuntimeEvents.subscribe((event) => {
      this.rememberEvent(event)
    })

    georgeDeliveryRouter.subscribe((directive) => {
      this.remember({
        type: 'delivery_directive',
        label: directive.type,
        reason: directive.reason,
        timestamp: Date.now(),
      })

      const arbitration = georgeDeliveryArbitrator.getSnapshot()
      this.remember({
        type: 'arbitration',
        label: arbitration.verdict,
        reason: arbitration.reason,
        timestamp: arbitration.checkedAt || Date.now(),
      })
    })
  }

  getRecent(limit = 12) {
    return this.entries.slice(0, limit)
  }

  getAll() {
    return [...this.entries]
  }

  clear() {
    this.entries = []
  }

  private rememberEvent(event: LiveRuntimeEvent) {
    this.remember({
      type: 'event',
      label: event.type,
      reason: event.payload?.reason || event.payload?.cue || 'Runtime event observed.',
      timestamp: event.timestamp,
    })
  }

  private remember(entry: LiveRuntimeMemoryEntry) {
    this.entries.unshift(entry)
    this.entries = this.entries.slice(0, this.maxEntries)
  }
}

export const georgeLiveRuntimeMemory =
  new GeorgeLiveRuntimeMemory()
