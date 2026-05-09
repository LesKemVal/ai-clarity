import { NextResponse } from 'next/server'

export async function GET() {
  if (!process.env.DEEPGRAM_API_KEY) {
    return NextResponse.json(
      { error: 'Missing DEEPGRAM_API_KEY' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    provider: 'deepgram',
    ready: true,
    note: 'Server key exists. WebSocket streaming client comes next.',
  })
}
