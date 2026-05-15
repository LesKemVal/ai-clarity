import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type ImageRequestBody = {
  prompt?: string
  size?: '1024x1024' | '1024x1536' | '1536x1024' | 'auto'
  quality?: 'low' | 'medium' | 'high' | 'auto'
}

export async function POST(req: Request) {
  try {
    let body: ImageRequestBody = {}

    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const prompt = String(body?.prompt || '').trim()

    if (!prompt) {
      return NextResponse.json({ error: 'Describe the image you want GEORGE to create.' }, { status: 400 })
    }

    if (prompt.length > 1200) {
      return NextResponse.json({ error: 'Prompt is too long. Keep the image request under 1,200 characters.' }, { status: 400 })
    }

    const size = body?.size || '1024x1024'
    const quality = body?.quality || 'medium'

    const image = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      prompt,
      size,
      quality,
      n: 1,
    })

    const first = image.data?.[0]
    const imageBase64 = first && 'b64_json' in first ? first.b64_json : null
    const imageUrl = first && 'url' in first ? first.url : null

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json({ error: 'No image was generated.' }, { status: 502 })
    }

    return NextResponse.json({
      image: imageBase64 ? `data:image/png;base64,${imageBase64}` : imageUrl,
      prompt,
    })
  } catch (err) {
    console.error('image generation error:', err)
    return NextResponse.json({ error: 'Failed to create image.' }, { status: 500 })
  }
}
