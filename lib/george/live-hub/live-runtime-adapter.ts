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
  subscribe: (listener: GeorgeLiveHubRuntimeListener) => () => void
}

export function createGeorgeLiveHubRuntimeAdapter(params?: {
  url?: string
}): GeorgeLiveHubRuntimeAdapter {
  const listeners = new Set<GeorgeLiveHubRuntimeListener>()
  let transport: GeorgeLiveHubTransport | null = null

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

      transport?.close()

      transport = createGeorgeLiveHubWebSocketTransport({
        url,
        handlers: {
          onOpen: () => {
            emit({ type: 'STATUS', status: 'connected', at: Date.now() })
          },
          onClose: () => {
            emit({ type: 'STATUS', status: 'idle', at: Date.now() })
          },
          onError: (error) => {
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
      transport?.close()
      transport = null
      emit({ type: 'STATUS', status: 'idle', at: Date.now() })
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
