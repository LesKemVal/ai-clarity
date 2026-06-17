import {
  getActiveSessionForMode,
  getActiveSessionIdForMode,
  getLatestSubscriberSession,
  setActiveMode,
  setActiveSessionIdForMode,
  upsertSession,
  type GeorgeSessionMode,
} from '@/lib/george/session/store'
import { readCachedGeorgeSessionAuthority } from '@/lib/george/session-authority'

type GeorgeSessionMessage = {
  role: string
  content: string
  [key: string]: unknown
}

export function saveGeorgeSession(params: {
  id?: string
  mode: GeorgeSessionMode
  title: string
  messages: GeorgeSessionMessage[]
  summary?: string
  userGoal?: string
  lastKnownState?: string
  suggestedRestart?: string
  metadata?: Record<string, unknown>
}) {
  const subscriberEmail =
    typeof window !== 'undefined'
      ? readCachedGeorgeSessionAuthority().email
      : ''

  const now = Date.now()
  const activeSessionId =
    params.id ||
    getActiveSessionIdForMode(params.mode)

  const sessionId = activeSessionId || `session_${now}`

  upsertSession({
    id: sessionId,
    type: 'session',
    mode: params.mode,
    title: params.title,
    createdAt: now,
    updatedAt: now,
    messages: params.messages as any,
    summary: params.summary,
    userGoal: params.userGoal,
    lastKnownState: params.lastKnownState,
    suggestedRestart: params.suggestedRestart,
    metadata: {
      source:
        params.mode === 'live'
          ? 'live_conversation'
          : 'normal',
      ...(subscriberEmail ? { subscriberEmail } : { localOnly: true }),
      ...params.metadata,
    },
  })

  setActiveSessionIdForMode(params.mode, sessionId)
  setActiveMode(params.mode)

  return sessionId
}

export function findGeorgeSessionToRestore(params: {
  mode: GeorgeSessionMode
  subscriberEmail?: string | null
}) {
  const activeSession = getActiveSessionForMode(params.mode)

  if (activeSession) {
    return activeSession
  }

  const subscriberEmail = String(params.subscriberEmail || '').trim()

  if (!subscriberEmail) {
    return null
  }

  return getLatestSubscriberSession(subscriberEmail, params.mode)
}

export function buildGeorgeSessionRestoreState(session: unknown) {
  const candidate = session as {
    mode?: GeorgeSessionMode
    messages?: unknown[]
  } | null

  if (
    !candidate ||
    candidate.mode !== 'normal' ||
    !Array.isArray(candidate.messages) ||
    candidate.messages.length === 0
  ) {
    return {
      restored: false as const,
      messages: [] as unknown[],
    }
  }

  return {
    restored: true as const,
    messages: candidate.messages,
  }
}

