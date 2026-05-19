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
