import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { checkRateLimit, getRequestIdentity } from '@/lib/security/rate-limit'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type SignalQuestionRequest = {
  role?: string
  desiredOutcome?: string
  acceptableOutcome?: string
  audience?: string
  room?: string
  knownContext?: string
  documentSummary?: string
  priorAnswers?: Record<string, string>
  skippedQuestions?: string[]
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(req: Request) {
  try {
    const rate = checkRateLimit({
      key: `live-signal-question:${getRequestIdentity(req)}`,
      limit: 40,
      windowMs: 60_000,
    })

    if (!rate.ok) {
      return NextResponse.json(
        {
          status: 'sufficient',
          question: '',
          label: 'Signal sufficient',
          helper: 'GEORGE has enough signal for LIVE support.',
          key: 'signal_sufficient',
        },
        { status: 429 }
      )
    }

    const body = (await req.json()) as SignalQuestionRequest

    const knownSignal = {
      role: clean(body.role),
      desiredOutcome: clean(body.desiredOutcome),
      acceptableOutcome: clean(body.acceptableOutcome),
      audience: clean(body.audience),
      room: clean(body.room),
      knownContext: clean(body.knownContext),
      documentSummary: clean(body.documentSummary),
      priorAnswers: body.priorAnswers && typeof body.priorAnswers === 'object' ? body.priorAnswers : {},
      skippedQuestions: Array.isArray(body.skippedQuestions) ? body.skippedQuestions.map(String) : [],
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        status: 'question',
        question: 'What should GEORGE be especially ready for in this room?',
        label: 'Additional signal',
        helper: 'Answer if useful, or skip.',
        key: `fallback_${Date.now()}`,
      })
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_INTELLIGENT || process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `
You generate the next best optional LIVE preparation question for GEORGE.

GEORGE is Brilliant operational awareness designed to move users from where they are to where they want to be.

Task:
Given known signal, determine whether another question would materially improve LIVE support.

Return strict JSON only:
{
  "status": "question" | "sufficient",
  "question": string,
  "label": string,
  "helper": string,
  "key": string
}

Rules:
- Ask exactly one concise question if status is "question".
- If enough signal exists or another question would be low value, return status "sufficient".
- Do not ask for known role, desired outcome, acceptable outcome, audience, room, or counterparty if already provided.
- You may ask about those areas only to clarify missing leverage, risk, stakes, pressure, constraints, decision authority, likely objection, boundary, timing, proof, or success conditions.
- Do not assume the user's facts.
- Do not use "is there anything" unless no sharper question exists.
- Do not ask multiple questions at once.
- Do not ask medical/legal/financial diagnostic questions; ask operational preparation questions.
- The question should increase probable success in the room.
- label must be short, 1 to 3 words.
- helper must be short and practical.
- key must be snake_case and should not duplicate prior answer keys.
          `.trim(),
        },
        {
          role: 'user',
          content: JSON.stringify({ knownSignal }),
        },
      ],
    })

    const raw = completion.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw)

    const status = parsed?.status === 'sufficient' ? 'sufficient' : 'question'
    const question = clean(parsed?.question)
    const label = clean(parsed?.label) || (status === 'sufficient' ? 'Signal sufficient' : 'Additional signal')
    const helper = clean(parsed?.helper) || (status === 'sufficient' ? 'GEORGE has enough signal for LIVE support.' : 'Answer if useful, or skip.')
    const key = clean(parsed?.key) || `signal_${Date.now()}`

    if (status === 'sufficient' || !question) {
      return NextResponse.json({
        status: 'sufficient',
        question: '',
        label,
        helper,
        key,
      })
    }

    return NextResponse.json({
      status: 'question',
      question,
      label,
      helper,
      key,
    })
  } catch {
    return NextResponse.json({
      status: 'question',
      question: 'What should GEORGE be especially ready for in this room?',
      label: 'Additional signal',
      helper: 'Answer if useful, or skip.',
      key: `fallback_${Date.now()}`,
    })
  }
}
