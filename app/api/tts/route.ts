import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function getInstructions() {
  return `
Speak like GEORGE.

- calm
- direct
- grounded
- masculine presence
- natural cadence
- conversational, not performative
- slightly faster pace
- very short pauses
- do NOT sound like you are reading
- do NOT sound overly polished
- do NOT over-enunciate
- avoid announcer tone
- avoid exaggerated emotion
- speak like a real person in a live conversation

You are speaking with someone, not presenting to them.
`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const input = typeof body?.input === 'string' ? body.input.trim() : ''
    const speed = typeof body?.speed === 'number' ? body.speed : 1
    const tier = typeof body?.tier === 'string' ? body.tier : 'smart'
    const voice = typeof body?.voice === 'string' ? body.voice : 'onyx'

    if (!input) {
      return NextResponse.json({ error: 'Missing input' }, { status: 400 })
    }

    if (tier === 'smart') {
      return NextResponse.json({ error: 'Voice not available in Smart mode' }, { status: 403 })
    }

    const response = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice,
      input,
      instructions: getInstructions(),
      response_format: 'mp3',
      speed,
    })

    const audioBuffer = Buffer.from(await response.arrayBuffer())

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('TTS error:', err)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}
