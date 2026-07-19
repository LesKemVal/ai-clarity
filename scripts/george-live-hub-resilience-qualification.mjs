import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'
import WebSocket from 'ws'

const root = process.cwd()
const port = 18080 + Math.floor(Math.random() * 1000)
const baseUrl = `http://127.0.0.1:${port}`
const socketUrl = `ws://127.0.0.1:${port}`

const build = spawnSync('npm', ['run', 'build', '--prefix', 'live-hub'], {
  cwd: root,
  encoding: 'utf8',
  stdio: 'pipe',
})

assert.equal(
  build.status,
  0,
  `LIVE Hub build must pass before resilience qualification\n${build.stdout}\n${build.stderr}`
)

const server = spawn('node', ['live-hub/dist/server.js'], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(port),
    DEEPGRAM_API_KEY: '',
    MAX_LIVE_HUB_CONNECTIONS: '1',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
})

let stdout = ''
let stderr = ''
let socket
let serverExited = false

server.stdout.setEncoding('utf8')
server.stderr.setEncoding('utf8')
server.stdout.on('data', (chunk) => {
  stdout += chunk
})
server.stderr.on('data', (chunk) => {
  stderr += chunk
})
server.once('exit', () => {
  serverExited = true
})

async function waitForResponse(path, expectedStatus, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs
  let lastError

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}${path}`)
      if (response.status === expectedStatus) {
        return {
          response,
          body: await response.json(),
        }
      }

      lastError = new Error(
        `${path} returned ${response.status}; expected ${expectedStatus}`
      )
    } catch (error) {
      lastError = error
    }

    await delay(50)
  }

  throw new Error(
    `Timed out waiting for ${path} to return ${expectedStatus}: ${lastError?.message || 'unknown error'}`
  )
}

function waitForSocketMessage(ws, predicate, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('Timed out waiting for LIVE Hub WebSocket message'))
    }, timeoutMs)

    const onMessage = (data) => {
      let parsed

      try {
        parsed = JSON.parse(data.toString())
      } catch {
        return
      }

      if (!predicate(parsed)) return
      cleanup()
      resolve(parsed)
    }

    const onError = (error) => {
      cleanup()
      reject(error)
    }

    const cleanup = () => {
      clearTimeout(timeout)
      ws.off('message', onMessage)
      ws.off('error', onError)
    }

    ws.on('message', onMessage)
    ws.on('error', onError)
  })
}

async function waitForServerExit(timeoutMs = 5000) {
  if (server.exitCode !== null) {
    return [server.exitCode, server.signalCode]
  }

  return Promise.race([
    once(server, 'exit'),
    delay(timeoutMs).then(() => {
      throw new Error('LIVE Hub did not exit within the resilience timeout')
    }),
  ])
}

try {
  const health = await waitForResponse('/healthz', 200)
  assert.equal(health.body.ok, true, 'Health endpoint must report ok')
  assert.equal(
    health.body.service,
    'george-live-hub',
    'Health endpoint must identify the LIVE Hub service'
  )
  assert.equal(
    health.body.shuttingDown,
    false,
    'Fresh LIVE Hub process must not report shutdown in progress'
  )

  const ready = await waitForResponse('/readyz', 200)
  assert.equal(ready.body.ready, true, 'LIVE Hub must become ready after startup')

  socket = new WebSocket(socketUrl)
  const readyMessagePromise = waitForSocketMessage(
    socket,
    (message) => message.type === 'READY'
  )
  await once(socket, 'open')
  await readyMessagePromise

  socket.send(JSON.stringify({ type: 'PING' }))
  const pong = await waitForSocketMessage(
    socket,
    (message) => message.type === 'PONG'
  )
  assert.equal(pong.type, 'PONG', 'Connected LIVE Hub client must receive PONG')

  const capacity = await waitForResponse('/readyz', 503)
  assert.equal(
    capacity.body.ready,
    false,
    'LIVE Hub must report not ready when connection capacity is reached'
  )
  assert.equal(
    capacity.body.atCapacity,
    true,
    'Readiness response must identify connection capacity degradation'
  )

  const closePromise = once(socket, 'close')
  server.kill('SIGTERM')

  const [closeCode, closeReason] = await Promise.race([
    closePromise,
    delay(5000).then(() => {
      throw new Error('LIVE Hub client did not close during graceful shutdown')
    }),
  ])

  assert.equal(
    closeCode,
    1012,
    'Graceful restart must close connected clients with WebSocket code 1012'
  )
  assert.equal(
    closeReason.toString(),
    'LIVE Hub is restarting',
    'Graceful restart must explain the restart to connected clients'
  )

  const [exitCode, exitSignal] = await waitForServerExit()
  assert.equal(exitCode, 0, `LIVE Hub must exit cleanly; signal=${exitSignal}`)
  assert.match(
    stdout,
    /shutdown requested/,
    'LIVE Hub must log the graceful shutdown request'
  )
  assert.match(
    stdout,
    /shutdown complete/,
    'LIVE Hub must log graceful shutdown completion'
  )
  assert.doesNotMatch(
    stderr,
    /forced shutdown/,
    'LIVE Hub must not require forced shutdown during qualification'
  )

  console.log('GEORGE LIVE Hub resilience qualification passed')
} finally {
  if (socket && socket.readyState < WebSocket.CLOSING) {
    socket.terminate()
  }

  if (!serverExited && server.exitCode === null) {
    server.kill('SIGKILL')
    await once(server, 'exit').catch(() => {})
  }
}
