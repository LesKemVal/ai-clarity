import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { checkRateLimit, getRequestIdentity } from '@/lib/security/rate-limit'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type SignalQuestionRequest = {
  role?: string
  broadGoal?: string
  desiredOutcome?: string
  acceptableOutcome?: string
  audience?: string
  room?: string
  knownContext?: string
  documentSummary?: string
  priorAnswers?: Record<string, string>
  priorInteractions?: Array<{
    key?: string
    question?: string
    answer?: string
    status?: 'answered' | 'skipped' | 'unknown'
  }>
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
      broadGoal: clean(body.broadGoal),
      desiredOutcome: clean(body.desiredOutcome),
      acceptableOutcome: clean(body.acceptableOutcome),
      audience: clean(body.audience),
      room: clean(body.room),
      knownContext: clean(body.knownContext),
      documentSummary: clean(body.documentSummary),
      priorAnswers: body.priorAnswers && typeof body.priorAnswers === 'object' ? body.priorAnswers : {},
      priorInteractions: Array.isArray(body.priorInteractions)
        ? body.priorInteractions
        : [],
      skippedQuestions: Array.isArray(body.skippedQuestions) ? body.skippedQuestions.map(String) : [],
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        status: 'sufficient',
        question: '',
        label: 'Signal sufficient',
        why: 'GEORGE will proceed from the available operational signal.',
        example: '',
        helper: 'GEORGE will proceed from the available operational signal.',
        key: 'signal_sufficient',
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
You are GEORGE's adaptive preparation reasoning authority.

The desired outcome establishes the briefing mission.

Outcome clarification is one of GEORGE's first reasoning responsibilities. GEORGE should normally clarify what successful achievement of the desired outcome looks like before optimizing execution.

GEORGE selects every question as though it is the final opportunity before LIVE to materially increase the user's likelihood of achieving the desired outcome.

Reason from the entire briefing conversation and all available operational signal, not only the most recent answer.

When another briefing interaction is appropriate, generate:

1. Question
2. Why this is important
3. Example of a useful answer

Never repeat a semantically answered question.
Never ask solely because information is missing.

Return JSON matching the existing schema.
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
    const why = clean(parsed?.why) || clean(parsed?.helper) || (status === 'sufficient' ? 'Additional signal is unlikely to materially improve context, timing, or support.' : 'This may improve GEORGE’s context, timing, and support.')
    const example = clean(parsed?.example) || 'Answer if useful, or skip.'
    const helper = clean(parsed?.helper) || why
    const key = clean(parsed?.key) || `signal_${Date.now()}`

    if (status === 'sufficient' || !question) {
      return NextResponse.json({
        status: 'sufficient',
        question: '',
        label,
        why,
        example,
        helper,
        key,
      })
    }

    return NextResponse.json({
      status: 'question',
      question,
      label,
      why,
      example,
      helper,
      key,
    })
  } catch {
    return NextResponse.json({
      status: 'sufficient',
      question: '',
      label: 'Signal sufficient',
      why: 'GEORGE will proceed from the available operational signal.',
      example: '',
      helper: 'GEORGE will proceed from the available operational signal.',
      key: 'signal_sufficient',
    })
  }
}
