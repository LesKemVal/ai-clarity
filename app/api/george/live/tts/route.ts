import { normalizeTextForSpeech } from '@/lib/george/live-voice/spoken-text'
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

    const provider = process.env.LIVE_TTS_PROVIDER || 'elevenlabs'

    const body = await req.json()
    const access = await verifyLiveAccessFromRequest(req, body?.email)

    const localFounderBypass =
      process.env.NODE_ENV !== 'production' &&
      Boolean(process.env.FOUNDER_OVERRIDE_CODE || process.env.BRILLIANT_FOUNDER_CODE)

    if (!access.ok && !localFounderBypass) {
      console.warn('[LIVE][tts][auth-failed]', {
        status: access.status,
        reason: access.error,
      })

      return NextResponse.json({ error: access.error }, { status: access.status })
    }

    const text = normalizeTextForSpeech(String(body?.text || '').trim())

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    const res =
      provider === 'cartesia'
        ? await fetch('https://api.cartesia.ai/tts/bytes', {
            method: 'POST',
            headers: {
              'X-API-Key': process.env.CARTESIA_API_KEY || '',
              'Cartesia-Version': '2026-03-01',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model_id: process.env.CARTESIA_MODEL_ID || 'sonic-3.5',
              transcript: text,
              voice: {
                mode: 'id',
                id: process.env.CARTESIA_VOICE_ID,
              },
              output_format: {
                container: 'mp3',
                bit_rate: 128000,
                sample_rate: 44100,
              },
            }),
          })
        : await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
            method: 'POST',
            headers: {
              'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
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
      const body = await res.text()

      console.warn('[LIVE][tts][provider-failed]', {
        provider,
        status: res.status,
        body,
      })

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
