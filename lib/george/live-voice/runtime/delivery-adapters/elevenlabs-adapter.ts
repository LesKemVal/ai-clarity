import type {
  LiveAudioAdapter,
  LiveAudioAdapterResult,
  LiveAudioAdapterState,
} from './audio-adapter-interface'
import type { LiveDeliveryDirective } from '../delivery-router'
import { georgeDeliveryRouter } from '../delivery-router'

class GeorgeElevenLabsAdapter implements LiveAudioAdapter {
  name = 'elevenlabs'
  private state: LiveAudioAdapterState = 'idle'
  private queue: LiveDeliveryDirective[] = []

  constructor() {
    georgeDeliveryRouter.subscribe((directive) => {
      void this.deliver(directive)
    })
  }

  getState(): LiveAudioAdapterState {
    return this.state
  }

  async connect(): Promise<LiveAudioAdapterResult> {
    this.state = 'connected'

    return this.result(true, 'ElevenLabs adapter connected in stub mode.')
  }

  async disconnect(): Promise<LiveAudioAdapterResult> {
    this.queue = []
    this.state = 'idle'

    return this.result(true, 'ElevenLabs adapter disconnected.')
  }

  async deliver(
    directive: LiveDeliveryDirective
  ): Promise<LiveAudioAdapterResult> {
    if (directive.type === 'suppress_output' || directive.type === 'haptic_only') {
      this.state = 'muted'
      return this.result(true, 'Directive suppressed audio output.')
    }

    if (directive.type === 'queue_whisper') {
      this.queue.push(directive)
      this.state = 'queued'
      return this.result(true, 'Directive queued for whisper delivery.')
    }

    if (directive.type === 'interrupt_now') {
      this.queue = []
      this.state = 'interrupted'
      return this.result(true, 'Directive marked for immediate interruption delivery.')
    }

    this.state = 'speaking'
    return this.result(true, 'Directive accepted for whisper delivery.')
  }

  async interrupt(reason = 'Interrupted by GEORGE runtime.'): Promise<LiveAudioAdapterResult> {
    this.queue = []
    this.state = 'interrupted'

    return this.result(true, reason)
  }

  getQueue() {
    return [...this.queue]
  }

  clearQueue() {
    this.queue = []
  }

  private result(ok: boolean, reason: string): LiveAudioAdapterResult {
    return {
      ok,
      state: this.state,
      reason,
      timestamp: Date.now(),
    }
  }
}

export const georgeElevenLabsAdapter = new GeorgeElevenLabsAdapter()
