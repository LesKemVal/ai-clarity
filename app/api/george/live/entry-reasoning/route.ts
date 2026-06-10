import { NextResponse } from 'next/server'
import { fallbackLiveEntryReasoning } from '@/lib/george/live-runtime/live-entry-reasoning'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const reasoning = fallbackLiveEntryReasoning(body || {})

    return NextResponse.json(reasoning)
  } catch {
    return NextResponse.json(
      fallbackLiveEntryReasoning({}),
      { status: 200 }
    )
  }
}
