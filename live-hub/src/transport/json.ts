import { WebSocket } from 'ws'
import type { ClientMessage, ServerMessage } from '../types/protocol.js'

const maxBufferedBytes = Math.max(
  65_536,
  Number(process.env.MAX_LIVE_HUB_BUFFERED_BYTES || 1_048_576)
)

export function sendJson(ws: WebSocket, message: ServerMessage) {
  if (ws.readyState !== WebSocket.OPEN) return false

  if (ws.bufferedAmount > maxBufferedBytes) {
    console.warn('[LIVE HUB][outbound_backpressure]', {
      event: 'outbound_backpressure',
      bufferedAmount: ws.bufferedAmount,
      maxBufferedBytes,
      messageType: message.type,
    })
    ws.close(1013, 'LIVE Hub outbound buffer exceeded')
    return false
  }

  ws.send(JSON.stringify(message))
  return true
}

export function parseClientMessage(raw: Buffer): ClientMessage | null {
  try {
    return JSON.parse(raw.toString()) as ClientMessage
  } catch {
    return null
  }
}
