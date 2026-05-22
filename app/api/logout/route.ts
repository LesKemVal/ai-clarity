import { NextResponse } from 'next/server'
import { clearGeorgeSessionCookie } from '@/lib/security/george-session'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  return clearGeorgeSessionCookie(response)
}
