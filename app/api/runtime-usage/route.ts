import { NextRequest, NextResponse } from 'next/server'
import { readGeorgeSession } from '@/lib/security/george-session'
import { appendRuntimeUsageRecord, getRuntimeUsageRecords } from '@/lib/runtime/runtime-store'

export async function GET(req: NextRequest) {
  const session = await readGeorgeSession(req)
  const email = session?.email

  if (!session || !email) {
    return NextResponse.json({ records: [], authenticated: false })
  }

  const records = await getRuntimeUsageRecords(email)

  return NextResponse.json({
    records,
    authenticated: true,
    email,
    tier: session.tier,
  })
}

export async function POST(req: NextRequest) {
  const session = await readGeorgeSession(req)
  const email = session?.email

  if (!session || !email) {
    return NextResponse.json({ error: 'Continuity session required.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const record = body?.record

    if (!record?.id || !record?.createdAt) {
      return NextResponse.json({ error: 'Runtime record is required.' }, { status: 400 })
    }

    await appendRuntimeUsageRecord(email, record)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unable to save runtime record.' }, { status: 500 })
  }
}