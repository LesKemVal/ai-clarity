import type { LiveDeliveryDirective } from '../delivery-router'

export type LiveAudioAdapterState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'speaking'
  | 'queued'
  | 'interrupted'
  | 'muted'
  | 'error'

export type LiveAudioAdapterResult = {
  ok: boolean
  state: LiveAudioAdapterState
  reason: string
  timestamp: number
}

export type LiveAudioAdapter = {
  name: string
  getState(): LiveAudioAdapterState
  connect(): Promise<LiveAudioAdapterResult>
  disconnect(): Promise<LiveAudioAdapterResult>
  deliver(directive: LiveDeliveryDirective): Promise<LiveAudioAdapterResult>
  interrupt(reason?: string): Promise<LiveAudioAdapterResult>
}
