import dotenv from 'dotenv'

dotenv.config({ path: new URL('../../.env.local', import.meta.url).pathname })
dotenv.config()

import crypto from 'node:crypto'
import { createServer } from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'
import type { LiveHubContext } from './types/protocol.js'
import { parseClientMessage, sendJson } from './transport/json.js'
import { createDeepgramStream } from './stt/deepgram-stream.js'

const port = Number(process.env.PORT || 8080)
const deepgramApiKey = process.env.DEEPGRAM_API_KEY || ''

const maxConnections = Math.max(
  1,
  Number(process.env.MAX_LIVE_HUB_CONNECTIONS || 200)
)
const maxMessageBytes = Math.max(
  1024,
  Number(process.env.MAX_LIVE_HUB_MESSAGE_BYTES || 262_144)
)
const maxMessagesPerWindow = Math.max(
  10,
  Number(process.env.MAX_LIVE_HUB_MESSAGES_PER_WINDOW || 240)
)
const messageRateWindowMs = Math.max(
  1000,
  Number(process.env.LIVE_HUB_MESSAGE_RATE_WINDOW_MS || 10_000)
)

const startedAt = Date.now()
let acceptingConnections = true
let shuttingDown = false

const httpServer = createServer((request, response) => {
  const path = request.url?.split('?')[0] || '/'

  if (path === '/healthz') {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify({
      ok: true,
      service: 'george-live-hub',
      uptimeMs: Date.now() - startedAt,
      connections: wss.clients.size,
      shuttingDown,
    }))
    return
  }

  if (path === '/readyz') {
    const atCapacity = wss.clients.size >= maxConnections
    const ready = acceptingConnections && !shuttingDown && !atCapacity
    response.writeHead(ready ? 200 : 503, { 'content-type': 'application/json' })
    response.end(JSON.stringify({
      ready,
      service: 'george-live-hub',
      connections: wss.clients.size,
      maxConnections,
      atCapacity,
    }))
    return
  }

  response.writeHead(404, { 'content-type': 'application/json' })
  response.end(JSON.stringify({ error: 'not_found' }))
})

const wss = new WebSocketServer({
  server: httpServer,
  maxPayload: maxMessageBytes,
})

wss.on('connection', (ws, request) => {
  const connectionId = crypto.randomUUID()
  const remoteAddress = request.socket.remoteAddress || 'unknown'

  if (!acceptingConnections || shuttingDown) {
    console.warn('[LIVE HUB][connection_rejected]', {
      event: 'connection_rejected',
      connectionId,
      reason: 'restarting',
      remoteAddress,
      connections: wss.clients.size,
      maxConnections,
    })
    ws.close(1012, 'LIVE Hub is restarting')
    return
  }

  if (wss.clients.size > maxConnections) {
    console.warn('[LIVE HUB][connection_rejected]', {
      event: 'connection_rejected',
      connectionId,
      reason: 'capacity',
      remoteAddress,
      connections: wss.clients.size,
      maxConnections,
    })
    ws.close(1013, 'LIVE Hub is at capacity')
    return
  }

  console.log('[LIVE HUB][client_connected]', {
    event: 'client_connected',
    connectionId,
    remoteAddress,
    connections: wss.clients.size,
    maxConnections,
  })
  let context: LiveHubContext = {}
  let messageWindowStartedAt = Date.now()
  let messagesInWindow = 0

  sendJson(ws, { type: 'READY', at: Date.now() })

  const stt = deepgramApiKey
    ? createDeepgramStream({
        ws,
        apiKey: deepgramApiKey,
        getContext: () => context,
      })
    : null

  if (!deepgramApiKey) {
    sendJson(ws, {
      type: 'ERROR',
      error: 'Missing DEEPGRAM_API_KEY. Manual transcript input remains available.',
      at: Date.now(),
    })
  }

  ws.on('message', (message, isBinary) => {
    const now = Date.now()

    if (now - messageWindowStartedAt >= messageRateWindowMs) {
      messageWindowStartedAt = now
      messagesInWindow = 0
    }

    messagesInWindow += 1

    if (messagesInWindow > maxMessagesPerWindow) {
      console.warn('[LIVE HUB][rate_limited]', {
        event: 'rate_limited',
        connectionId,
        remoteAddress,
        messagesInWindow,
        maxMessagesPerWindow,
        messageRateWindowMs,
      })
      ws.close(1013, 'LIVE Hub message rate exceeded')
      return
    }

    const messageBytes =
      typeof message === 'string'
        ? Buffer.byteLength(message)
        : Buffer.isBuffer(message)
          ? message.length
          : Array.isArray(message)
            ? message.reduce((total, chunk) => total + chunk.length, 0)
            : message.byteLength

    if (messageBytes > maxMessageBytes) {
      console.warn('[LIVE HUB][payload_rejected]', {
        event: 'payload_rejected',
        connectionId,
        remoteAddress,
        messageBytes,
        maxMessageBytes,
      })
      ws.close(1009, 'LIVE Hub payload too large')
      return
    }

    if (isBinary) {
      stt?.sendAudio(message as Buffer)
      return
    }

    const parsed = parseClientMessage(message as Buffer)
    if (!parsed) return

    if (parsed.type === 'SYNC_CONTEXT') {
      context = parsed.context || {}
      console.log('[LIVE HUB][context]', context)
      return
    }

    if (parsed.type === 'TRANSCRIPT_INPUT') {
      const text = String(parsed.text || '')
      const isFinal = typeof parsed.isFinal === 'boolean' ? parsed.isFinal : true
      const turnId = typeof parsed.turnId === 'string' ? parsed.turnId : undefined
      const deliveryStyle = typeof parsed.deliveryStyle === 'string' ? parsed.deliveryStyle : undefined

      console.log('[LIVE HUB][TRANSCRIPT_INPUT]', {
        text,
        isFinal,
        turnId,
        deliveryStyle,
        length: text.length,
        hasStt: Boolean(stt),
        hasDeepgramApiKey: Boolean(deepgramApiKey),
      })

      if (!stt) {
        console.warn('[LIVE HUB][TRANSCRIPT_INPUT] no transcript processor available')
        return
      }

      stt.handleTranscriptInput(text, isFinal, turnId, deliveryStyle)
      return
    }

    if (parsed.type === 'PING') {
      sendJson(ws, { type: 'PONG', at: Date.now() })
    }
  })

  ws.on('error', (error) => {
    console.warn('[LIVE HUB][client_error]', {
      event: 'client_error',
      connectionId,
      remoteAddress,
      message: error instanceof Error ? error.message : String(error),
    })
  })

  ws.on('close', (code, reason) => {
    console.log('[LIVE HUB][client_closed]', {
      event: 'client_closed',
      connectionId,
      remoteAddress,
      code,
      reason: reason.toString(),
      connections: Math.max(0, wss.clients.size - 1),
    })
    stt?.close()
  })
})

const shutdown = (signal: 'SIGTERM' | 'SIGINT') => {
  if (shuttingDown) return

  shuttingDown = true
  acceptingConnections = false

  console.log('[GEORGE LIVE HUB] shutdown requested', {
    signal,
    connections: wss.clients.size,
  })

  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1012, 'LIVE Hub is restarting')
    }
  }

  const forceExitTimer = setTimeout(() => {
    console.error('[GEORGE LIVE HUB] forced shutdown', {
      signal,
      connections: wss.clients.size,
    })
    process.exit(1)
  }, 10_000)

  forceExitTimer.unref()

  wss.close(() => {
    httpServer.close(() => {
      clearTimeout(forceExitTimer)
      console.log('[GEORGE LIVE HUB] shutdown complete', { signal })
      process.exit(0)
    })
  })
}

process.once('SIGTERM', () => shutdown('SIGTERM'))
process.once('SIGINT', () => shutdown('SIGINT'))

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`[GEORGE LIVE HUB] listening on :${port}`)
})
