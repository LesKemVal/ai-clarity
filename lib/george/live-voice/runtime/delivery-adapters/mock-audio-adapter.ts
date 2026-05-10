import type { LiveDeliveryDirective } from '../delivery-router'
import { georgeDeliveryRouter } from '../delivery-router'

export type MockAudioPlaybackState =
  | 'idle'
  | 'suppressed'
  | 'queued'
  | 'whispering'
  | 'interrupted'

export type MockAudioTraceEntry = {
  state: MockAudioPlaybackState
  text: string
  reason: string
  directiveType: LiveDeliveryDirective['type']
  receivedAt: number
}

class GeorgeMockAudioAdapter {
  private state: MockAudioPlaybackState = 'idle'
  private trace: MockAudioTraceEntry[] = []
  private maxTrace = 50

  constructor() {
    georgeDeliveryRouter.subscribe((directive) => {
      this.applyDirective(directive)
    })
  }

  getState() {
    return this.state
  }

  getTrace() {
    return [...this.trace]
  }

  clear() {
    this.state = 'idle'
    this.trace = []
  }

  private applyDirective(directive: LiveDeliveryDirective) {
    if (directive.type === 'suppress_output') {
      this.record('suppressed', directive)
      return
    }

    if (directive.type === 'haptic_only') {
      this.record('suppressed', directive)
      return
    }

    if (directive.type === 'queue_whisper') {
      this.record('queued', directive)
      return
    }

    if (directive.type === 'interrupt_now') {
      this.record('interrupted', directive)
      return
    }

    this.record('whispering', directive)
  }

  private record(
    state: MockAudioPlaybackState,
    directive: LiveDeliveryDirective
  ) {
    this.state = state

    this.trace.unshift({
      state,
      text: directive.text,
      reason: directive.reason,
      directiveType: directive.type,
      receivedAt: Date.now(),
    })

    this.trace = this.trace.slice(0, this.maxTrace)
  }
}

export const georgeMockAudioAdapter = new GeorgeMockAudioAdapter()
