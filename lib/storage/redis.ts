import { createClient } from 'redis'

let client: ReturnType<typeof createClient> | null = null

export function getRedis() {
  if (client) return client

  const url = process.env.REDIS_URL

  if (!url) {
    throw new Error('Missing REDIS_URL')
  }

  client = createClient({ url })

  client.on('error', (err) => {
    console.error('[GEORGE][redis]', err)
  })

  client.connect().catch((err) => {
    console.error('[GEORGE][redis-connect]', err)
  })

  return client
}
