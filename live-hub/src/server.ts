import 'dotenv/config'
import { WebSocketServer } from 'ws'
import type { LiveHubContext } from './types/protocol.js'
import { parseClientMessage, sendJson } from './transport/json.js'
import { createDeepgramStream } from './stt/deepgram-stream.js'

const port = Number(process.env.PORT || 8080)
const deepgramApiKey = process.env.DEEPGRAM_API_KEY || ''

const wss = new WebSocketServer({ port })

wss.on('connection', (ws) => {
  console.log('[LIVE HUB][client] connected')
  let context: LiveHubContext = {}

  sendJson(ws, { type: 'READY', at: Date.now() })

  if (!deepgramApiKey) {
    sendJson(ws, {
      type: 'ERROR',
      error: 'Missing DEEPGRAM_API_KEY.',
      at: Date.now(),
    })
    return
  }

  const stt = createDeepgramStream({
    ws,
    apiKey: deepgramApiKey,
    getContext: () => context,
  })

  ws.on('message', (message, isBinary) => {
    if (isBinary) {
      stt.sendAudio(message as Buffer)
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
      stt.handleTranscriptInput(
        String(parsed.text || ''),
        typeof parsed.isFinal === 'boolean' ? parsed.isFinal : true
      )
      return
    }

    if (parsed.type === 'PING') {
      sendJson(ws, { type: 'PONG', at: Date.now() })
    }
  })

  ws.on('close', () => {
    console.log('[LIVE HUB][client] closed')
    stt.close()
  })
})

console.log(`[GEORGE LIVE HUB] listening on :${port}`)
