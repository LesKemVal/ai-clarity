export type GeorgeSessionMode = 'normal' | 'live' | 'campaign'

export type GeorgeStoredMessage = {
  role: 'assistant' | 'user' | 'system'
  content: string
  constrained?: boolean
  imageDataUrl?: string | null
}

export type GeorgeStoredSession = {
  id: string
  type: 'session'
  mode: GeorgeSessionMode
  title: string
  createdAt: number
  updatedAt: number
  messages: GeorgeStoredMessage[]
  summary?: string
  userGoal?: string
  lastKnownState?: string
  suggestedRestart?: string
}

export const GEORGE_SESSIONS_KEY = 'GEORGE_SESSIONS_V2'
export const GEORGE_ACTIVE_SESSION_ID_KEY = 'GEORGE_ACTIVE_SESSION_ID'
export const GEORGE_ACTIVE_MODE_KEY = 'GEORGE_ACTIVE_MODE'

export function safeReadSessions(): GeorgeStoredSession[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(GEORGE_SESSIONS_KEY)
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function safeWriteSessions(sessions: GeorgeStoredSession[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(GEORGE_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)))
}

export function getActiveSessionId() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(GEORGE_ACTIVE_SESSION_ID_KEY)
}

export function setActiveSessionId(id: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(GEORGE_ACTIVE_SESSION_ID_KEY, id)
}

export function getActiveMode(): GeorgeSessionMode {
  if (typeof window === 'undefined') return 'normal'
  const mode = window.localStorage.getItem(GEORGE_ACTIVE_MODE_KEY)
  return mode === 'live' || mode === 'campaign' ? mode : 'normal'
}

export function setActiveMode(mode: GeorgeSessionMode) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(GEORGE_ACTIVE_MODE_KEY, mode)
}

export function clearActiveMode() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(GEORGE_ACTIVE_MODE_KEY, 'normal')
}

export function upsertSession(session: GeorgeStoredSession) {
  const sessions = safeReadSessions()
  const existingIndex = sessions.findIndex((item) => item.id === session.id)

  if (existingIndex >= 0) {
    sessions[existingIndex] = session
  } else {
    sessions.unshift(session)
  }

  safeWriteSessions(sessions)
}

export function updateActiveSessionMessages(messages: GeorgeStoredMessage[]) {
  const activeId = getActiveSessionId()
  if (!activeId) return

  const sessions = safeReadSessions()
  const updated = sessions.map((session) =>
    session.id === activeId
      ? { ...session, messages, updatedAt: Date.now() }
      : session
  )

  safeWriteSessions(updated)
}

export function getActiveSession() {
  const activeId = getActiveSessionId()
  if (!activeId) return null

  return safeReadSessions().find((session) => session.id === activeId) || null
}

export function createSession(mode: GeorgeSessionMode, messages: GeorgeStoredMessage[], title = 'New Session') {
  const now = Date.now()

  const session: GeorgeStoredSession = {
    id: `session_${now}`,
    type: 'session',
    mode,
    title,
    createdAt: now,
    updatedAt: now,
    messages,
  }

  upsertSession(session)
  setActiveSessionId(session.id)
  setActiveMode(mode)

  return session
}
