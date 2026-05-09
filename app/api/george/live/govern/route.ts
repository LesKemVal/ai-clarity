import { NextResponse } from 'next/server'
import { governLiveVoice } from '@/lib/george/live-voice/governor'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const packet = governLiveVoice({
      transcript: String(body?.transcript || ''),
      mode: body?.mode === 'voice_live' ? 'voice_live' : 'text_test',
      audio: Boolean(body?.audio),
      contextHint: typeof body?.contextHint === 'string' ? body.contextHint : '',
      shadowMap: typeof body?.shadowMap === 'string' ? body.shadowMap : '',
      lastFiveSeconds: typeof body?.lastFiveSeconds === 'string' ? body.lastFiveSeconds : '',
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
