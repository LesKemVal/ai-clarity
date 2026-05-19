import { NextRequest } from 'next/server'
import { readGeorgeSession } from '@/lib/security/george-session'
import { getSubscriberByEmail, type SubscriberTier } from './subscriber-store'

export type LiveAccessResult =
  | { ok: true; email: string; tier: Exclude<SubscriberTier, 'smart'> }
  | { ok: false; status: number; error: string }

export function verifyLiveAccess(emailInput: unknown): LiveAccessResult {
  const email = String(emailInput || '').trim().toLowerCase()

  if (!email) {
    return { ok: false, status: 401, error: 'Verified continuity email required.' }
  }

  const subscriber = getSubscriberByEmail(email)

  if (!subscriber) {
    return { ok: false, status: 403, error: 'Subscriber continuity was not found.' }
  }

  if (subscriber.currentTier !== 'intelligent' && subscriber.currentTier !== 'brilliant') {
    return { ok: false, status: 403, error: 'LIVE requires Intelligent or Brilliant access.' }
  }

  return {
    ok: true,
    email: subscriber.email,
    tier: subscriber.currentTier,
  }
}

export function verifyLiveAccessFromRequest(
  req: NextRequest,
  fallbackEmailInput?: unknown
): LiveAccessResult {
  const session = readGeorgeSession(req)

  if (session) {
    return {
      ok: true,
      email: session.email,
      tier: session.tier,
    }
  }

  // Temporary migration fallback for the internal LIVE lab until the UI fully
  // moves from localStorage/email hints to HTTP-only session authority.
  return verifyLiveAccess(fallbackEmailInput)
}
