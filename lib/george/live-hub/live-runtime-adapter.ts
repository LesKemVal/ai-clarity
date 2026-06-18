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
  sendTranscript: (text: string, isFinal?: boolean) => void
  subscribe: (listener: GeorgeLiveHubRuntimeListener) => () => void
}

export function createGeorgeLiveHubRuntimeAdapter(params?: {
  url?: string
}): GeorgeLiveHubRuntimeAdapter {
  const listeners = new Set<GeorgeLiveHubRuntimeListener>()
  let transport: GeorgeLiveHubTransport | null = null
  let connected = false
  const pendingTranscripts: Array<{ text: string; isFinal: boolean }> = []

  const flushPendingTranscripts = () => {
    if (!connected) return
    while (pendingTranscripts.length) {
      const next = pendingTranscripts.shift()
      if (!next) continue

      transport?.sendJson?.({
        type: 'TRANSCRIPT_INPUT',
        text: next.text,
        isFinal: next.isFinal,
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

            emit(event as GeorgeLiveHubRuntimeEvent)
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

    sendTranscript(text: string, isFinal = true) {
      const clean = String(text || '').trim()
      if (!clean) return

      if (!connected) {
        pendingTranscripts.push({ text: clean, isFinal })
        return
      }

      transport?.sendJson?.({
        type: 'TRANSCRIPT_INPUT',
        text: clean,
        isFinal,
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
