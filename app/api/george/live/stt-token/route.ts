import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing DEEPGRAM_API_KEY' },
        { status: 500 }
      )
    }

    const res = await fetch('https://api.deepgram.com/v1/auth/grant', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scopes: ['listen'],
        ttl: 60,
      }),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to create temporary Deepgram token' },
        { status: 500 }
      )
    }

    const data = await res.json()

    return NextResponse.json({
      token: data?.access_token || '',
    })
  } catch {
    return NextResponse.json(
      { error: 'Temporary token generation failed' },
      { status: 500 }
    )
  }
}
