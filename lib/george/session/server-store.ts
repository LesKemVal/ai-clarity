import { getRedis } from '@/lib/storage/redis'
import type { GeorgeStoredSession, GeorgeSessionMode } from './store'

const MAX_SESSIONS = 50

function sessionsKey(email: string) {
  return `george:sessions:${email.trim().toLowerCase()}`
}

function activeKey(email: string, mode: GeorgeSessionMode) {
  return `george:sessions:${email.trim().toLowerCase()}:active:${mode}`
}

function parseSessions(raw: string | null): GeorgeStoredSession[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function readServerSessions(email: string) {
  const redis = getRedis()
  return parseSessions(await redis.get(sessionsKey(email)))
}

export async function writeServerSessions(email: string, sessions: GeorgeStoredSession[]) {
  const redis = getRedis()
  await redis.set(sessionsKey(email), JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
}

export async function upsertServerSession(email: string, session: GeorgeStoredSession) {
  const sessions = await readServerSessions(email)
  const existingIndex = sessions.findIndex((item) => item.id === session.id)

  const next = {
    ...session,
    type: 'session' as const,
    updatedAt: Date.now(),
  }

  if (existingIndex >= 0) {
    sessions[existingIndex] = next
  } else {
    sessions.unshift(next)
  }

  await writeServerSessions(email, sessions)
  await setServerActiveSession(email, session.mode, session.id)

  return next
}

export async function deleteServerSession(email: string, sessionId: string) {
  const sessions = await readServerSessions(email)
  const next = sessions.filter((session) => session.id !== sessionId)

  await writeServerSessions(email, next)

  const redis = getRedis()
  for (const mode of ['normal', 'live', 'campaign'] as GeorgeSessionMode[]) {
    const key = activeKey(email, mode)
    const activeId = await redis.get(key)
    if (activeId === sessionId) {
      await redis.del(key)
    }
  }

  return next
}

export async function clearServerSessions(email: string) {
  const redis = getRedis()

  await redis.del(sessionsKey(email))
  await redis.del(activeKey(email, 'normal'))
  await redis.del(activeKey(email, 'live'))
  await redis.del(activeKey(email, 'campaign'))
}

export async function getServerActiveSession(email: string, mode: GeorgeSessionMode) {
  const redis = getRedis()
  const id = await redis.get(activeKey(email, mode))
  if (!id) return null

  const sessions = await readServerSessions(email)
  return sessions.find((session) => session.id === id && session.mode === mode) || null
}

export async function setServerActiveSession(email: string, mode: GeorgeSessionMode, id: string) {
  const redis = getRedis()
  await redis.set(activeKey(email, mode), id)
}
