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
  archived?: boolean
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
const GEORGE_FRESH_NORMAL_ENTRY_KEY = 'GEORGE_FRESH_NORMAL_ENTRY_V1'
const GEORGE_BROWSER_INSTANCE_ID_KEY = 'GEORGE_BROWSER_INSTANCE_ID_V1'
const GEORGE_BROWSER_WINDOW_NAME_PREFIX = 'george_browser_instance:'
const GEORGE_DELETED_SESSION_IDS_KEY = 'GEORGE_DELETED_SESSION_IDS_V1'
let hydratedFromServer = false

function readDeletedSessionIds(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(GEORGE_DELETED_SESSION_IDS_KEY) || '[]'
    )

    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : []
  } catch {
    return []
  }
}

function writeDeletedSessionIds(ids: string[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(
    GEORGE_DELETED_SESSION_IDS_KEY,
    JSON.stringify([...new Set(ids)].slice(-100))
  )
}

function rememberDeletedSessionId(id: string) {
  writeDeletedSessionIds([...readDeletedSessionIds(), id])
}

function forgetDeletedSessionId(id: string) {
  writeDeletedSessionIds(
    readDeletedSessionIds().filter((deletedId) => deletedId !== id)
  )
}

async function fetchServerSessions(): Promise<GeorgeStoredSession[] | null> {
  try {
    const response = await fetch('/api/george/sessions', {
      cache: 'no-store',
    })

    if (!response.ok) return null

    const data = await response.json()

    return Array.isArray(data.sessions)
      ? data.sessions
      : []
  } catch {
    return null
  }
}

export async function hydrateSessionsFromServer() {
  if (typeof window === 'undefined') return

  if (hydratedFromServer) return

  hydratedFromServer = true

  const sessions = await fetchServerSessions()

  if (sessions === null) return

  const deletedIds = new Set(readDeletedSessionIds())
  const localSessions = safeReadSessions().filter(
    (session) => !deletedIds.has(session.id)
  )
  const serverSessions = sessions.filter(
    (session) => !deletedIds.has(session.id)
  )

  const mergedById = new Map<string, GeorgeStoredSession>()

  for (const session of [...serverSessions, ...localSessions]) {
    const existing = mergedById.get(session.id)

    if (!existing || session.updatedAt >= existing.updatedAt) {
      mergedById.set(session.id, session)
    }
  }

  safeWriteSessions(
    [...mergedById.values()].sort((a, b) => b.updatedAt - a.updatedAt)
  )

  const serverIds = new Set(sessions.map((session) => session.id))
  writeDeletedSessionIds(
    [...deletedIds].filter((id) => serverIds.has(id))
  )
}

function syncSessionToServer(session: GeorgeStoredSession) {
  try {
    fetch('/api/george/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session,
      }),
    }).catch(() => {})
  } catch {}
}

function deleteSessionFromServer(id: string) {
  try {
    fetch(`/api/george/sessions?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => {})
  } catch {}
}

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
    return window.sessionStorage.getItem(GEORGE_ACTIVE_LIVE_SESSION_ID_KEY)
  }

  if (mode === 'campaign') {
    return window.sessionStorage.getItem(GEORGE_ACTIVE_CAMPAIGN_SESSION_ID_KEY)
  }

  return window.sessionStorage.getItem(GEORGE_ACTIVE_NORMAL_SESSION_ID_KEY)
}

export function setActiveSessionIdForMode(mode: GeorgeSessionMode, id: string) {
  if (typeof window === 'undefined') return

  if (mode === 'live') {
    window.sessionStorage.setItem(GEORGE_ACTIVE_LIVE_SESSION_ID_KEY, id)
  } else if (mode === 'campaign') {
    window.sessionStorage.setItem(GEORGE_ACTIVE_CAMPAIGN_SESSION_ID_KEY, id)
  } else {
    window.sessionStorage.setItem(GEORGE_ACTIVE_NORMAL_SESSION_ID_KEY, id)
  }

  window.sessionStorage.setItem(GEORGE_ACTIVE_SESSION_ID_KEY, id)
}

export function getActiveSessionId() {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem(GEORGE_ACTIVE_SESSION_ID_KEY)
}

export function setActiveSessionId(id: string) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(GEORGE_ACTIVE_SESSION_ID_KEY, id)
}

export function getActiveMode(): GeorgeSessionMode {
  if (typeof window === 'undefined') return 'normal'
  const mode = window.sessionStorage.getItem(GEORGE_ACTIVE_MODE_KEY)
  return mode === 'live' || mode === 'campaign' ? mode : 'normal'
}

export function setActiveMode(mode: GeorgeSessionMode) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(GEORGE_ACTIVE_MODE_KEY, mode)
}

export function clearActiveMode() {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(GEORGE_ACTIVE_MODE_KEY, 'normal')
}

function createGeorgeBrowserInstanceId() {
  try {
    return crypto.randomUUID()
  } catch {
    return `browser_${Date.now()}_${Math.random().toString(36).slice(2)}`
  }
}

function clearBrowserScopedNormalWorkspace() {
  window.sessionStorage.removeItem(GEORGE_ACTIVE_SESSION_ID_KEY)
  window.sessionStorage.removeItem(GEORGE_ACTIVE_NORMAL_SESSION_ID_KEY)
  window.sessionStorage.removeItem('george_last_normal_draft')
  window.sessionStorage.removeItem('GEORGE_LAST_NORMAL_DRAFT')
  window.sessionStorage.setItem(GEORGE_ACTIVE_MODE_KEY, 'normal')
}

export function ensureGeorgeBrowserInstanceScope() {
  if (typeof window === 'undefined') return false

  const storedInstanceId =
    window.sessionStorage.getItem(GEORGE_BROWSER_INSTANCE_ID_KEY)

  const windowInstanceId = window.name.startsWith(
    GEORGE_BROWSER_WINDOW_NAME_PREFIX
  )
    ? window.name.slice(GEORGE_BROWSER_WINDOW_NAME_PREFIX.length)
    : ''

  if (windowInstanceId && storedInstanceId === windowInstanceId) {
    return false
  }

  const nextInstanceId = createGeorgeBrowserInstanceId()

  window.name = `${GEORGE_BROWSER_WINDOW_NAME_PREFIX}${nextInstanceId}`
  window.sessionStorage.setItem(
    GEORGE_BROWSER_INSTANCE_ID_KEY,
    nextInstanceId
  )

  clearBrowserScopedNormalWorkspace()
  return true
}

export function requestFreshNormalBrowserSession() {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(GEORGE_FRESH_NORMAL_ENTRY_KEY, '1')
}

export function consumeFreshNormalBrowserSessionRequest() {
  if (typeof window === 'undefined') return false

  const requested =
    window.sessionStorage.getItem(GEORGE_FRESH_NORMAL_ENTRY_KEY) === '1'

  if (!requested) return false

  window.sessionStorage.removeItem(GEORGE_FRESH_NORMAL_ENTRY_KEY)
  window.sessionStorage.removeItem(GEORGE_ACTIVE_SESSION_ID_KEY)
  window.sessionStorage.removeItem(GEORGE_ACTIVE_NORMAL_SESSION_ID_KEY)
  window.sessionStorage.removeItem('george_last_normal_draft')
  window.sessionStorage.removeItem('GEORGE_LAST_NORMAL_DRAFT')
  window.sessionStorage.setItem(GEORGE_ACTIVE_MODE_KEY, 'normal')

  return true
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
  syncSessionToServer(safeSession)
}

export function deleteSession(sessionId: string) {
  if (typeof window === 'undefined') return

  rememberDeletedSessionId(sessionId)

  const sessions = safeReadSessions().filter((session) => session.id !== sessionId)
  safeWriteSessions(sessions)

  if (window.sessionStorage.getItem(GEORGE_ACTIVE_SESSION_ID_KEY) === sessionId) {
    window.sessionStorage.removeItem(GEORGE_ACTIVE_SESSION_ID_KEY)
  }

  if (window.sessionStorage.getItem(GEORGE_ACTIVE_NORMAL_SESSION_ID_KEY) === sessionId) {
    window.sessionStorage.removeItem(GEORGE_ACTIVE_NORMAL_SESSION_ID_KEY)
  }

  if (window.sessionStorage.getItem(GEORGE_ACTIVE_LIVE_SESSION_ID_KEY) === sessionId) {
    window.sessionStorage.removeItem(GEORGE_ACTIVE_LIVE_SESSION_ID_KEY)
  }

  if (window.sessionStorage.getItem(GEORGE_ACTIVE_CAMPAIGN_SESSION_ID_KEY) === sessionId) {
    window.sessionStorage.removeItem(GEORGE_ACTIVE_CAMPAIGN_SESSION_ID_KEY)
  }

  window.sessionStorage.removeItem('george_last_normal_draft')
  window.sessionStorage.removeItem('GEORGE_LAST_NORMAL_DRAFT')

  deleteSessionFromServer(sessionId)
}

export function renameSession(sessionId: string, title: string) {
  if (typeof window === 'undefined') return

  const cleanTitle = title.trim().slice(0, 80)
  if (!cleanTitle) return

  const sessions = safeReadSessions().map((session) =>
    session.id === sessionId
      ? {
          ...session,
          title: cleanTitle,
          updatedAt: Date.now(),
        }
      : session
  )

  safeWriteSessions(sessions)
}

export function archiveSession(sessionId: string, archived = true) {
  if (typeof window === 'undefined') return

  const sessions = safeReadSessions().map((session) =>
    session.id === sessionId
      ? {
          ...session,
          archived,
          updatedAt: Date.now(),
        }
      : session
  )

  safeWriteSessions(sessions)

  if (archived && window.sessionStorage.getItem(GEORGE_ACTIVE_SESSION_ID_KEY) === sessionId) {
    window.sessionStorage.removeItem(GEORGE_ACTIVE_SESSION_ID_KEY)
  }

  if (archived && window.sessionStorage.getItem(GEORGE_ACTIVE_NORMAL_SESSION_ID_KEY) === sessionId) {
    window.sessionStorage.removeItem(GEORGE_ACTIVE_NORMAL_SESSION_ID_KEY)
  }

  if (archived && window.sessionStorage.getItem(GEORGE_ACTIVE_LIVE_SESSION_ID_KEY) === sessionId) {
    window.sessionStorage.removeItem(GEORGE_ACTIVE_LIVE_SESSION_ID_KEY)
  }

  if (archived && window.sessionStorage.getItem(GEORGE_ACTIVE_CAMPAIGN_SESSION_ID_KEY) === sessionId) {
    window.sessionStorage.removeItem(GEORGE_ACTIVE_CAMPAIGN_SESSION_ID_KEY)
  }
}


export function getSessionsForMode(mode: GeorgeSessionMode, options: { archived?: boolean } = {}) {
  const archived = options.archived ?? false
  return safeReadSessions().filter((session) => session.mode === mode && Boolean(session.archived) === archived)
}

export function getCampaignSessions() {
  return safeReadSessions()
    .filter((session) => session.mode === 'campaign')
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function updateCampaignSessionMetadata(
  campaignId: string | null,
  updater: (metadata: GeorgeStoredSessionMetadata) => GeorgeStoredSessionMetadata
) {
  if (!campaignId) return

  const sessions = safeReadSessions()

  const updated = sessions.map((session) => {
    if (session.mode !== 'campaign') return session
    if (session.id !== campaignId && session.metadata?.activeCampaignId !== campaignId) return session

    return {
      ...session,
      updatedAt: Date.now(),
      metadata: updater(session.metadata || {}),
    }
  })

  safeWriteSessions(updated)
}

export function hasMeaningfulUserMessage(session: any) {
  try {
    const messages = Array.isArray(session?.messages) ? session.messages : []
    return messages.some((message: any) => {
      if (message?.role !== 'user') return false
      const content = typeof message?.content === 'string' ? message.content.trim() : ''
      if (!content) return false
      const lower = content.toLowerCase()
      if (lower === 'start conversation') return false
      if (lower === 'start live') return false
      if (lower === 'resume conversation') return false
      return true
    })
  } catch {
    return false
  }
}

export function updateActiveSessionMessages(
  messages: GeorgeStoredMessage[],
  mode: GeorgeSessionMode = getActiveMode(),
  metadataUpdates: GeorgeStoredSessionMetadata = {}
) {
  // Session messages can update operational state, but they must not silently become goals.
  // Goals require explicit user classification elsewhere in the product flow.
  let lastKnownState = undefined

  try {
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')

    if (lastAssistant?.content) {
      lastKnownState = lastAssistant.content.slice(0, 120)
    }
  } catch {}

  const activeId = getActiveSessionIdForMode(mode) || getActiveSessionId()
  if (!activeId) return

  const sessions = safeReadSessions()
  const updated = sessions.map((session) =>
    session.id === activeId && session.mode === mode
      ? {
          ...session,
          messages,
          updatedAt: Date.now(),
          lastKnownState: lastKnownState || session.lastKnownState,
          title: generateSessionTitle(session.userGoal, lastKnownState || session.lastKnownState),
          metadata: {
            ...(session.metadata || {}),
            ...metadataUpdates,
          },
        }
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


export function getLatestSubscriberSession(
  subscriberEmail: string,
  mode?: GeorgeSessionMode
) {
  const clean = subscriberEmail.trim().toLowerCase()

  if (!clean) {
    return null
  }

  return safeReadSessions()
    .filter((session) => {
      const sessionEmail =
        typeof session.metadata?.subscriberEmail === 'string'
          ? session.metadata.subscriberEmail.trim().toLowerCase()
          : ''

      if (!sessionEmail) {
        return false
      }

      if (sessionEmail !== clean) {
        return false
      }

      if (mode && session.mode !== mode) {
        return false
      }

      return true
    })
    .sort((a, b) => b.updatedAt - a.updatedAt)[0] || null
}

export function createSession(
  mode: GeorgeSessionMode,
  messages: GeorgeStoredMessage[],
  title = 'New Session',
  metadata: GeorgeStoredSessionMetadata = {}
) {
  const now = Date.now()

  const session: GeorgeStoredSession = {
    id: `session_${now}`,
    type: 'session',
    mode,
    title,
    createdAt: now,
    updatedAt: now,
    messages,
    metadata,
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
