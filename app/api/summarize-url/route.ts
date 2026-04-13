import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    let body: { url?: string } = {}

    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const rawUrl = String(body?.url || '').trim()

    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
    }

    const normalizedUrl = /^https?:\/\//i.test(rawUrl)
      ? rawUrl
      : `https://${rawUrl}`

    let parsedUrl: URL

    try {
      parsedUrl = new URL(normalizedUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const res = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(12000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Website fetch failed (${res.status})` },
        { status: 502 }
      )
    }

    const html = await res.text()

    const text = html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 8000)

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5',
      messages: [
        {
          role: 'system',
          content: `
You are GEORGE.

Summarize this website briefly.

Return:
- 1 short sentence: what this is
- 3 short bullets max: what matters most
- 1 short bullet max: what may be weak or overlooked

Keep it short.
Do not exceed 120 words total.
Be direct and useful.
          `.trim(),
        },
        {
          role: 'user',
          content: text,
        },
      ],
    })

    const reply = completion.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      return NextResponse.json({ error: 'No summary generated' }, { status: 502 })
    }

    return NextResponse.json({ summary: reply })
  } catch (err) {
    console.error('summarize-url error:', err)
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 })
  }
}
