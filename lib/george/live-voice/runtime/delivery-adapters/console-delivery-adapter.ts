import type { LiveDeliveryDirective } from '../delivery-router'
import { georgeDeliveryRouter } from '../delivery-router'

export type LiveDeliveryTraceEntry = {
  directive: LiveDeliveryDirective
  receivedAt: number
}

class GeorgeConsoleDeliveryAdapter {
  private trace: LiveDeliveryTraceEntry[] = []
  private maxTrace = 50

  constructor() {
    georgeDeliveryRouter.subscribe((directive) => {
      this.trace.unshift({
        directive,
        receivedAt: Date.now(),
      })

      this.trace = this.trace.slice(0, this.maxTrace)
    })
  }

  getTrace() {
    return [...this.trace]
  }

  clear() {
    this.trace = []
  }
}

export const georgeConsoleDeliveryAdapter = new GeorgeConsoleDeliveryAdapter()
