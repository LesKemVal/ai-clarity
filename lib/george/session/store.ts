export type GeorgeSessionMode = 'normal' | 'live' | 'campaign'

export type GeorgeStoredMessage = {
  role: 'assistant' | 'user' | 'system'
  content: string
  constrained?: boolean
  imageDataUrl?: string | null
}

export type GeorgeStoredSessionMetadata = {
  source?: 'normal' | 'live_conversation' | 'pro_live_campaign'
  activeCampaignId?: string | null
  productOrService?: string
  targetAudience?: string
  desiredOutcome?: string
  campaignName?: string
  dataToCapture?: string[]
  reportingDestination?: string
  [key: string]: unknown
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
  metadata?: GeorgeStoredSessionMetadata
}

export const GEORGE_SESSIONS_KEY = 'GEORGE_SESSIONS_V2'
export const GEORGE_ACTIVE_SESSION_ID_KEY = 'GEORGE_ACTIVE_SESSION_ID'
export const GEORGE_ACTIVE_NORMAL_SESSION_ID_KEY = 'GEORGE_ACTIVE_NORMAL_SESSION_ID'
export const GEORGE_ACTIVE_LIVE_SESSION_ID_KEY = 'GEORGE_ACTIVE_LIVE_SESSION_ID'
export const GEORGE_ACTIVE_CAMPAIGN_SESSION_ID_KEY = 'GEORGE_ACTIVE_CAMPAIGN_SESSION_ID'
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


export function getActiveSessionIdForMode(mode: GeorgeSessionMode) {
  if (typeof window === 'undefined') return null

  if (mode === 'live') {
    return window.localStorage.getItem(GEORGE_ACTIVE_LIVE_SESSION_ID_KEY)
  }

  if (mode === 'campaign') {
    return window.localStorage.getItem(GEORGE_ACTIVE_CAMPAIGN_SESSION_ID_KEY)
  }

  return window.localStorage.getItem(GEORGE_ACTIVE_NORMAL_SESSION_ID_KEY)
}

export function setActiveSessionIdForMode(mode: GeorgeSessionMode, id: string) {
  if (typeof window === 'undefined') return

  if (mode === 'live') {
    window.localStorage.setItem(GEORGE_ACTIVE_LIVE_SESSION_ID_KEY, id)
  } else if (mode === 'campaign') {
    window.localStorage.setItem(GEORGE_ACTIVE_CAMPAIGN_SESSION_ID_KEY, id)
  } else {
    window.localStorage.setItem(GEORGE_ACTIVE_NORMAL_SESSION_ID_KEY, id)
  }

  window.localStorage.setItem(GEORGE_ACTIVE_SESSION_ID_KEY, id)
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

export function normalizeSessionMode(mode: unknown): GeorgeSessionMode {
  return mode === 'live' || mode === 'campaign' ? mode : 'normal'
}

export function upsertSession(session: GeorgeStoredSession) {
  const safeSession = {
    ...session,
    mode: normalizeSessionMode(session.mode),
    type: 'session' as const,
  }

  const sessions = safeReadSessions()
  const existingIndex = sessions.findIndex((item) => item.id === safeSession.id)

  if (existingIndex >= 0) {
    sessions[existingIndex] = safeSession
  } else {
    sessions.unshift(safeSession)
  }

  safeWriteSessions(sessions)
}

export function getSessionsForMode(mode: GeorgeSessionMode) {
  return safeReadSessions().filter((session) => session.mode === mode)
}

export function updateActiveSessionMessages(messages: GeorgeStoredMessage[], mode: GeorgeSessionMode = getActiveMode()) {
  // --- session intelligence extraction ---
  let userGoal = undefined
  let lastKnownState = undefined

  try {
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')

    if (lastUser?.content) {
      userGoal = lastUser.content.slice(0, 120)
    }

    if (lastAssistant?.content) {
      lastKnownState = lastAssistant.content.slice(0, 120)
    }
  } catch {}

  const activeId = getActiveSessionIdForMode(mode) || getActiveSessionId()
  if (!activeId) return

  const sessions = safeReadSessions()
  const updated = sessions.map((session) =>
    session.id === activeId && session.mode === mode
      ? { ...session, messages, updatedAt: Date.now(), userGoal: userGoal || session.userGoal, lastKnownState: lastKnownState || session.lastKnownState, title: generateSessionTitle(userGoal || session.userGoal, lastKnownState || session.lastKnownState) }
      : session
  )

  safeWriteSessions(updated)
}

export function getActiveSession() {
  const activeMode = getActiveMode()
  const activeId = getActiveSessionIdForMode(activeMode) || getActiveSessionId()
  if (!activeId) return null

  return safeReadSessions().find((session) => session.id === activeId) || null
}

export function getActiveSessionForMode(mode: GeorgeSessionMode) {
  const activeId = getActiveSessionIdForMode(mode)
  if (!activeId) return null

  return safeReadSessions().find((session) => session.id === activeId && session.mode === mode) || null
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
  setActiveSessionIdForMode(mode, session.id)
  setActiveMode(mode)

  return session
}


function generateSessionTitle(goal?: string, state?: string) {
  const g = (goal || '').toLowerCase()
  const s = (state || '').toLowerCase()

  if (g.includes('close') || g.includes('deal')) return 'Closing a deal'
  if (g.includes('money') || g.includes('income')) return 'Making money'
  if (g.includes('build')) return 'Building something'
  if (g.includes('fix') || s.includes('error')) return 'Fixing an issue'
  if (g.includes('client')) return 'Client conversation'
  if (g.includes('plan')) return 'Planning next steps'

  if (goal && goal.length > 10) return goal.slice(0, 40)

  return 'Conversation'
}
