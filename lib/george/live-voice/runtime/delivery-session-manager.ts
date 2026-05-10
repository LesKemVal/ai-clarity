import type {
  LiveAudioAdapter,
  LiveAudioAdapterResult,
  LiveAudioAdapterState,
} from './delivery-adapters/audio-adapter-interface'
import type { LiveDeliveryDirective } from './delivery-router'
import { georgeDeliveryRouter } from './delivery-router'
import { georgeElevenLabsAdapter } from './delivery-adapters/elevenlabs-adapter'

export type LiveDeliverySessionState = {
  activeAdapter: string
  muted: boolean
  adapterState: LiveAudioAdapterState
  lastResult?: LiveAudioAdapterResult
}

class GeorgeDeliverySessionManager {
  private activeAdapter: LiveAudioAdapter = georgeElevenLabsAdapter
  private muted = false
  private lastResult: LiveAudioAdapterResult | undefined

  constructor() {
    georgeDeliveryRouter.subscribe((directive) => {
      void this.deliver(directive)
    })
  }

  getState(): LiveDeliverySessionState {
    return {
      activeAdapter: this.activeAdapter.name,
      muted: this.muted,
      adapterState: this.activeAdapter.getState(),
      lastResult: this.lastResult,
    }
  }

  setAdapter(adapter: LiveAudioAdapter) {
    this.activeAdapter = adapter
    return this.getState()
  }

  async connect() {
    this.lastResult = await this.activeAdapter.connect()
    return this.getState()
  }

  async disconnect() {
    this.lastResult = await this.activeAdapter.disconnect()
    return this.getState()
  }

  mute() {
    this.muted = true
    return this.getState()
  }

  unmute() {
    this.muted = false
    return this.getState()
  }

  async interrupt(reason = 'Interrupted by GEORGE delivery session manager.') {
    this.lastResult = await this.activeAdapter.interrupt(reason)
    return this.getState()
  }

  async deliver(directive: LiveDeliveryDirective) {
    if (this.muted) {
      this.lastResult = {
        ok: true,
        state: 'muted',
        reason: 'Delivery session is muted.',
        timestamp: Date.now(),
      }

      return this.getState()
    }

    this.lastResult = await this.activeAdapter.deliver(directive)
    return this.getState()
  }
}

export const georgeDeliverySessionManager =
  new GeorgeDeliverySessionManager()
