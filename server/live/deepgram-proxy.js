const http = require('http')
const WebSocket = require('ws')

const PORT = Number(process.env.LIVE_PROXY_PORT || 8787)
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY

if (!DEEPGRAM_API_KEY) {
  console.error('Missing DEEPGRAM_API_KEY')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, service: 'george-live-proxy' }))
    return
  }

  res.writeHead(404)
  res.end()
})

const wss = new WebSocket.Server({ server, path: '/live' })

wss.on('connection', (client) => {
  console.log('Client connected to GEORGE LIVE proxy')

  const deepgram = new WebSocket(
    'wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true&endpointing=250',
    {
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
      },
    }
  )

  deepgram.on('open', () => {
    client.send(JSON.stringify({ type: 'proxy_open' }))
  })

  deepgram.on('message', (data) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data.toString())
    }
  })

  deepgram.on('error', (error) => {
    console.error('Deepgram proxy error:', error.message)
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'proxy_error', error: error.message }))
    }
  })

  deepgram.on('close', (code, reason) => {
    const message = reason?.toString?.() || ''
    console.log('Deepgram closed:', code, message)

    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'proxy_close', code, reason: message }))
      client.close()
    }
  })

  client.on('message', (data) => {
    if (deepgram.readyState === WebSocket.OPEN) {
      deepgram.send(data)
    }
  })

  client.on('close', () => {
    if (
      deepgram.readyState === WebSocket.OPEN ||
      deepgram.readyState === WebSocket.CONNECTING
    ) {
      deepgram.close()
    }
  })

  client.on('error', (error) => {
    console.error('Client proxy error:', error.message)
  })
})

server.listen(PORT, () => {
  console.log(`GEORGE LIVE proxy running on ws://localhost:${PORT}/live`)
})
