import { NextResponse } from 'next/server'
import {
  buildPrepRoomResourceSummary,
  inferPrepRoomResources,
  type PrepRoomResourceProfile,
} from '@/lib/george/prep-room/resources'

type RequestBody = {
  contextText?: string | null
  userOverride?: Partial<PrepRoomResourceProfile> | null
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody
    const profile = inferPrepRoomResources({
      contextText: body?.contextText,
      userOverride: body?.userOverride,
    })

    return NextResponse.json({
      profile,
      summary: buildPrepRoomResourceSummary(profile),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to infer Prep Room resources.'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
