import { NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'
import mammoth from 'mammoth'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
    }

    const maxBytes = 8 * 1024 * 1024
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File is too large. Keep uploads under 8MB for now.' }, { status: 413 })
    }

    const name = file.name || 'uploaded file'
    const lowerName = name.toLowerCase()
    const type = file.type || ''
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ''
    let clippedLabel = 'File text clipped for length.'

    if (type.includes('pdf') || lowerName.endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer })
      const parsed = await parser.getText()
      text = String(parsed.text || '').trim()
      clippedLabel = 'PDF text clipped for length.'
    } else if (
      type.includes('officedocument.wordprocessingml.document') ||
      lowerName.endsWith('.docx')
    ) {
      const parsed = await mammoth.extractRawText({ buffer })
      text = String(parsed.value || '').trim()
      clippedLabel = 'DOCX text clipped for length.'
    } else {
      return NextResponse.json({ error: 'Only PDF and DOCX extraction is supported here.' }, { status: 400 })
    }

    if (!text) {
      return NextResponse.json({ error: 'No readable text found in this file.' }, { status: 422 })
    }

    return NextResponse.json({
      name,
      text: text.length > 16000 ? `${text.slice(0, 16000)}\n\n[${clippedLabel}]` : text,
    })
  } catch (err) {
    console.error('File extraction failed:', err)
    return NextResponse.json({ error: 'Unable to extract this file right now.' }, { status: 500 })
  }
}
