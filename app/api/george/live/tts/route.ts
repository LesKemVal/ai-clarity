import { NextRequest, NextResponse } from 'next/server'
import { verifyLiveAccessFromRequest } from '@/lib/subscriptions/live-access'
import { checkRateLimit, getRequestIdentity } from '@/lib/security/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit({
      key: `live-tts:${getRequestIdentity(req)}`,
      limit: 60,
      windowMs: 60_000,
    })

    if (!rate.ok) {
      return NextResponse.json({ error: 'LIVE voice is temporarily rate limited.' }, { status: 429 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    const voiceId = process.env.ELEVENLABS_VOICE_ID

    if (!apiKey || !voiceId) {
      return NextResponse.json(
        { error: 'LIVE voice is not fully configured.' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const access = verifyLiveAccessFromRequest(req, body?.email)

    if (!access.ok) {
      console.warn('[LIVE][tts][auth-failed]', {
        status: access.status,
        reason: access.error,
      })

      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const text = String(body?.text || '').trim()

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
          style: 0.15,
          use_speaker_boost: true,
        },
      }),
    })

    if (!res.ok) {
      console.warn('[LIVE][tts][provider-failed]', { status: res.status })
      return NextResponse.json({ error: 'TTS request failed' }, { status: res.status })
    }

    const audio = await res.arrayBuffer()

    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return NextResponse.json({ error: 'TTS failed safely' }, { status: 500 })
  }
}
