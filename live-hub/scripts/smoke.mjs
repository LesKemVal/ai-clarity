import { WebSocket } from 'ws'

const url = process.env.LIVE_HUB_URL || 'ws://localhost:8080'

const ws = new WebSocket(url)

const timeout = setTimeout(() => {
  console.error('LIVE hub smoke timed out')
  process.exit(1)
}, 5000)

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'SYNC_CONTEXT',
    context: {
      room: 'test room',
      chair: 'founder',
      objective: 'close interest',
      knownContext: 'local smoke test',
    },
  }))

  ws.send(JSON.stringify({ type: 'PING', at: Date.now() }))
})

ws.on('message', (data) => {
  const message = JSON.parse(String(data))
  console.log('[LIVE HUB SMOKE]', message)

  if (message.type === 'PONG') {
    clearTimeout(timeout)
    ws.close()
    process.exit(0)
  }
})

ws.on('error', (error) => {
  clearTimeout(timeout)
  console.error(error)
  process.exit(1)
})
