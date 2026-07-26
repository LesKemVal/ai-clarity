import { NextRequest, NextResponse } from 'next/server'

import { persistOperationalLearning } from '@/lib/george/operational-memory/persist-operational-learning'
import { readGeorgeSession } from '@/lib/security/george-session'

export const runtime = 'nodejs'

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: 'Unauthorized' },
    { status: 401 }
  )
}

function invalidRequest(message: string) {
  return NextResponse.json(
    { ok: false, error: message },
    { status: 400 }
  )
}

export async function POST(req: NextRequest) {
  const session = await readGeorgeSession(req)
  const userId = String(session?.email || '').trim().toLowerCase()

  if (!session || !userId) {
    return unauthorized()
  }

  let body: unknown

  try {
    body = await req.json()
  } catch {
    return invalidRequest('Invalid JSON body')
  }

  if (!body || typeof body !== 'object') {
    return invalidRequest('Request body is required')
  }

  const input = body as {
    conversationRecord?: unknown
    organizationId?: unknown
    startedAt?: unknown
    endedAt?: unknown
  }

  if (
    !input.conversationRecord ||
    typeof input.conversationRecord !== 'object'
  ) {
    return invalidRequest('Conversation record is required')
  }

  try {
    const result = await persistOperationalLearning({
      userId,
      organizationId:
        typeof input.organizationId === 'string'
          ? input.organizationId
          : undefined,
      record: input.conversationRecord,
      startedAt:
        typeof input.startedAt === 'number'
          ? input.startedAt
          : undefined,
      endedAt:
        typeof input.endedAt === 'number'
          ? input.endedAt
          : undefined,
    })

    return NextResponse.json({
      ok: true,
      learning: {
        conversationId: result.conversationId,
        extractedCount: result.extractedCount,
        savedCount: result.savedCount,
        skippedCount: result.skippedCount,
      },
    })
  } catch (error) {
    console.error('[GEORGE][OPERATIONAL_MEMORY][LEARN_FAILED]', error)

    return NextResponse.json(
      { ok: false, error: 'Operational learning failed' },
      { status: 500 }
    )
  }
}
