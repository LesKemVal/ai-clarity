import type { GeorgeLiveHubContext, GeorgeLiveHubEvent } from './types'
import type {
  GeorgeLiveHubTransport,
  GeorgeLiveHubTransportHandlers,
} from './transport'

export function createGeorgeLiveHubWebSocketTransport(params: {
  url: string
  handlers: GeorgeLiveHubTransportHandlers
}): GeorgeLiveHubTransport {
  let ws: WebSocket | null = null

  return {
    connect(context?: GeorgeLiveHubContext) {
      ws = new WebSocket(params.url)
      ws.binaryType = 'arraybuffer'

      ws.onopen = () => {
        params.handlers.onOpen?.()
        ws?.send(JSON.stringify({
          type: 'SYNC_CONTEXT',
          context: context || {},
        }))
      }

      ws.onmessage = (message) => {
        try {
          params.handlers.onEvent?.(JSON.parse(String(message.data)) as GeorgeLiveHubEvent)
        } catch {
          params.handlers.onEvent?.({
            type: 'ERROR',
            error: 'Unable to parse LIVE hub event.',
            at: Date.now(),
          })
        }
      }

      ws.onerror = () => {
        params.handlers.onError?.('LIVE hub connection failed.')
      }

      ws.onclose = () => {
        params.handlers.onClose?.()
      }
    },

    sendAudio(audio: ArrayBuffer) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      ws.send(audio)
    },

    sendJson(message: Record<string, unknown>) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      ws.send(JSON.stringify(message))
    },

    syncContext(context?: GeorgeLiveHubContext) {
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      ws.send(JSON.stringify({
        type: 'SYNC_CONTEXT',
        context: context || {},
      }))
    },

    close() {
      ws?.close()
      ws = null
    },
  }
}
