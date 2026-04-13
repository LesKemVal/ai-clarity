import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    let body: { url?: string; query?: string } = {}

    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const rawUrl = String(body?.url || '').trim()
    const userQuery = String(body?.query || '').trim()

    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
    }

    if (!userQuery) {
      return NextResponse.json({ error: 'Missing search query' }, { status: 400 })
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

Search this website's content for the user's requested topic.

Return:
- 1 short sentence: does this site contain what the user is looking for
- up to 3 short bullets: most relevant findings
- 1 short line: how this could help the user move forward (only if meaningful)

Guidance:
- do not force connections
- if there is no real advantage, say so briefly

Keep it brief, direct, and useful.
Do not exceed 120 words.
          `.trim(),
        },
        {
          role: 'user',
          content: `Site content:\n${text}\n\nWhat I want to find on this site:\n${userQuery}`,
        },
      ],
    })

    const reply = completion.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      return NextResponse.json({ error: 'No site search result generated' }, { status: 502 })
    }

    return NextResponse.json({ result: reply })
  } catch (err) {
    console.error('site-search error:', err)
    return NextResponse.json({ error: 'Failed to search site' }, { status: 500 })
  }
}
