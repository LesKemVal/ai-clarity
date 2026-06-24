import type { GeorgeActionCue, GeorgeLiveHubContext } from './types'
import { createGeorgeLiveHubWebSocketTransport } from './websocket-transport'
import type { GeorgeLiveHubTransport } from './transport'

export type GeorgeLiveHubRuntimeEvent =
  | ({ type: 'ACTION_CUE' } & GeorgeActionCue)
  | { type: 'STATUS'; status: 'idle' | 'connecting' | 'connected' | 'error'; at: number }
  | { type: 'ERROR'; error: string; at: number }

export type GeorgeLiveHubRuntimeListener = (event: GeorgeLiveHubRuntimeEvent) => void

export type GeorgeLiveHubRuntimeAdapter = {
  connect: (context?: GeorgeLiveHubContext) => void
  disconnect: () => void
  sendTranscript: (text: string, isFinal?: boolean, turnId?: string) => void
  subscribe: (listener: GeorgeLiveHubRuntimeListener) => () => void
}

export function createGeorgeLiveHubRuntimeAdapter(params?: {
  url?: string
}): GeorgeLiveHubRuntimeAdapter {
  const listeners = new Set<GeorgeLiveHubRuntimeListener>()
  let transport: GeorgeLiveHubTransport | null = null
  let connected = false
  const pendingTranscripts: Array<{ text: string; isFinal: boolean; turnId?: string }> = []

  const flushPendingTranscripts = () => {
    if (!connected) return
    while (pendingTranscripts.length) {
      const next = pendingTranscripts.shift()
      if (!next) continue

      console.info('[LIVE][hub][adapter] flush transcript', {
        text: next.text,
        isFinal: next.isFinal,
      })

      transport?.sendJson?.({
        type: 'TRANSCRIPT_INPUT',
        text: next.text,
        isFinal: next.isFinal,
        turnId: next.turnId,
        deliveryStyle: (() => {
          try {
            return window.localStorage.getItem('GEORGE_LIVE_DELIVERY_STYLE') || undefined
          } catch {
            return undefined
          }
        })(),
      })
    }
  }

  const emit = (event: GeorgeLiveHubRuntimeEvent) => {
    listeners.forEach((listener) => listener(event))
  }

  return {
    connect(context?: GeorgeLiveHubContext) {
      const url =
        params?.url ||
        process.env.NEXT_PUBLIC_LIVE_HUB_URL ||
        'ws://localhost:8080'

      emit({ type: 'STATUS', status: 'connecting', at: Date.now() })

      connected = false
      transport?.close()

      transport = createGeorgeLiveHubWebSocketTransport({
        url,
        handlers: {
          onOpen: () => {
            connected = true
            emit({ type: 'STATUS', status: 'connected', at: Date.now() })
            flushPendingTranscripts()
          },
          onClose: () => {
            connected = false
            emit({ type: 'STATUS', status: 'idle', at: Date.now() })
          },
          onError: (error) => {
            connected = false
            emit({ type: 'ERROR', error, at: Date.now() })
            emit({ type: 'STATUS', status: 'error', at: Date.now() })
          },
          onEvent: (event) => {
            if (event?.type !== 'ACTION_CUE') return

            const cleanCue = String(event?.cue || '').trim()
            if (!cleanCue) {
              console.info('[LIVE][hub][adapter] dropped empty ACTION_CUE', event)
              return
            }

            emit({
              ...event,
              cue: cleanCue,
            } as GeorgeLiveHubRuntimeEvent)
          },
        },
      })

      transport.connect(context)
    },

    disconnect() {
      connected = false
      pendingTranscripts.length = 0
      transport?.close()
      transport = null
      emit({ type: 'STATUS', status: 'idle', at: Date.now() })
    },

    sendTranscript(text: string, isFinal = true, turnId?: string) {
      const clean = String(text || '').trim()
      if (!clean) return

      if (!connected) {
        console.info('[LIVE][hub][adapter] queue transcript', { text: clean, isFinal })
        pendingTranscripts.push({ text: clean, isFinal, turnId })
        return
      }

      console.info('[LIVE][hub][adapter] send transcript', { text: clean, isFinal })

      transport?.sendJson?.({
        type: 'TRANSCRIPT_INPUT',
        text: clean,
        isFinal,
        turnId,
        deliveryStyle: (() => {
          try {
            return window.localStorage.getItem('GEORGE_LIVE_DELIVERY_STYLE') || undefined
          } catch {
            return undefined
          }
        })(),
      })
    },

    subscribe(listener: GeorgeLiveHubRuntimeListener) {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}


let singletonAdapter: GeorgeLiveHubRuntimeAdapter | null = null

export function getGeorgeLiveHubRuntimeAdapter() {
  if (!singletonAdapter) {
    singletonAdapter = createGeorgeLiveHubRuntimeAdapter()
  }

  return singletonAdapter
}
