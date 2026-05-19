import { NextRequest, NextResponse } from 'next/server'
import { governLiveVoice } from '@/lib/george/live-voice/governor'
import { verifyLiveAccessFromRequest } from '@/lib/subscriptions/live-access'
import { checkRateLimit, getRequestIdentity } from '@/lib/security/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit({
      key: `live-govern:${getRequestIdentity(req)}`,
      limit: 120,
      windowMs: 60_000,
    })

    if (!rate.ok) {
      return NextResponse.json({
        speaker: 'system',
        shouldSpeak: false,
        volley: '',
        cue: '',
        status: 'LIVE governor temporarily rate limited.',
        confidence: 0,
      }, { status: 429 })
    }

    const body = await req.json()
    const access = verifyLiveAccessFromRequest(req, body?.email)

    if (!access.ok) {
      console.warn('[LIVE][govern][auth-failed]', {
        status: access.status,
        reason: access.error,
      })

      return NextResponse.json({
        speaker: 'system',
        shouldSpeak: false,
        volley: '',
        cue: '',
        status: access.error,
        confidence: 0,
      }, { status: access.status })
    }

    const packet = governLiveVoice({
      transcript: String(body?.transcript || ''),
      mode: body?.mode === 'voice_live' ? 'voice_live' : 'text_test',
      audio: Boolean(body?.audio),
      contextHint: typeof body?.contextHint === 'string' ? body.contextHint : '',
      shadowMap: typeof body?.shadowMap === 'string' ? body.shadowMap : '',
      lastFiveSeconds: typeof body?.lastFiveSeconds === 'string' ? body.lastFiveSeconds : '',
      liveAssistMode: body?.liveAssistMode === 'lines' ? 'lines' : 'cues',
      runtimeMemory:
        body?.runtimeMemory && typeof body.runtimeMemory === 'object'
          ? body.runtimeMemory
          : undefined,
    })

    return NextResponse.json(packet)
  } catch {
    return NextResponse.json(
      {
        speaker: 'unclear',
        shouldSpeak: false,
        volley: '',
        cue: '',
        status: 'Governor failed safely.',
        confidence: 0,
      },
      { status: 200 }
    )
  }
}
