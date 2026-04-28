import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

type TypeformAnswer = {
  type?: string
  text?: string
  choice?: { label?: string }
  choices?: { labels?: string[] }
  boolean?: boolean
  email?: string
  phone_number?: string
  number?: number
  field?: { id?: string; ref?: string; title?: string; type?: string }
}

function answerValue(answer: TypeformAnswer) {
  if (answer.text) return answer.text
  if (answer.email) return answer.email
  if (answer.phone_number) return answer.phone_number
  if (typeof answer.number === 'number') return String(answer.number)
  if (typeof answer.boolean === 'boolean') return answer.boolean ? 'Yes' : 'No'
  if (answer.choice?.label) return answer.choice.label
  if (answer.choices?.labels?.length) return answer.choices.labels.join(', ')
  return ''
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const formResponse = payload?.form_response
    const answers: TypeformAnswer[] = formResponse?.answers || []

    const mapped = answers.reduce<Record<string, string>>((acc, answer) => {
      const title = answer.field?.title || answer.field?.ref || answer.field?.id || 'unknown'
      acc[slugify(title)] = answerValue(answer)
      return acc
    }, {})

    const saved = {
      id: `typeform_${Date.now()}`,
      source: 'typeform',
      receivedAt: new Date().toISOString(),
      formId: formResponse?.form_id || null,
      token: formResponse?.token || null,
      mapped,
      raw: payload,
    }

    const filePath = path.join(process.cwd(), 'data', 'typeform-submissions.json')

    let existing: unknown[] = []
    try {
      existing = JSON.parse(await fs.readFile(filePath, 'utf8'))
      if (!Array.isArray(existing)) existing = []
    } catch {
      existing = []
    }

    existing.unshift(saved)
    await fs.writeFile(filePath, JSON.stringify(existing.slice(0, 100), null, 2))

    return NextResponse.json({ ok: true, saved: saved.id })
  } catch (error) {
    console.error('TYPEFORM_WEBHOOK_ERROR', error)
    return NextResponse.json({ ok: false, error: 'Unable to process Typeform submission' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: 'typeform webhook ready' })
}
