import dotenv from 'dotenv'

dotenv.config({ path: new URL('../../.env.local', import.meta.url).pathname })
dotenv.config()

import { WebSocketServer } from 'ws'
import type { LiveHubContext } from './types/protocol.js'
import { parseClientMessage, sendJson } from './transport/json.js'
import { createDeepgramStream } from './stt/deepgram-stream.js'

const port = Number(process.env.PORT || 8080)
const deepgramApiKey = process.env.DEEPGRAM_API_KEY || ''

const wss = new WebSocketServer({ host: '0.0.0.0', port })

wss.on('connection', (ws) => {
  console.log('[LIVE HUB][client] connected')
  let context: LiveHubContext = {}

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

      console.log('[LIVE HUB][TRANSCRIPT_INPUT]', {
        text,
        isFinal,
        turnId,
        length: text.length,
        hasStt: Boolean(stt),
        hasDeepgramApiKey: Boolean(deepgramApiKey),
      })

      if (!stt) {
        console.warn('[LIVE HUB][TRANSCRIPT_INPUT] no transcript processor available')
        return
      }

      stt.handleTranscriptInput(text, isFinal, turnId)
      return
    }

    if (parsed.type === 'PING') {
      sendJson(ws, { type: 'PONG', at: Date.now() })
    }
  })

  ws.on('close', () => {
    console.log('[LIVE HUB][client] closed')
    stt?.close()
  })
})

console.log(`[GEORGE LIVE HUB] listening on :${port}`)
