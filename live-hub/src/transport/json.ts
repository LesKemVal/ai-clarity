import type { WebSocket } from 'ws'
import type { ClientMessage, ServerMessage } from '../types/protocol.js'

export function sendJson(ws: WebSocket, message: ServerMessage) {
  if (ws.readyState !== ws.OPEN) return
  ws.send(JSON.stringify(message))
}

export function parseClientMessage(raw: Buffer): ClientMessage | null {
  try {
    return JSON.parse(raw.toString()) as ClientMessage
  } catch {
    return null
  }
}
