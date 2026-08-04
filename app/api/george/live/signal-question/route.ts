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
You are GEORGE's adaptive preparation reasoning layer.

GEORGE has received the available operational frame, including role, broad goal, desired outcome when known, and prior answers.

GEORGE is Brilliant operational awareness designed to move users from where they are to where they want to be.

Governing operational question:
What do I need to do to help the user achieve the user's desired outcome?

Task:
Determine what GEORGE must understand to help the user achieve the user's desired outcome.

Build and continuously update one internal operational model from all available signal before deciding what to ask.

Do not collect fields or expose a questionnaire.

Ask only the single question whose answer is expected to produce the greatest improvement to execution.

Prefer questions whose answers can resolve several operational uncertainties at once.

After every answer, update the entire operational model rather than treating the answer as one isolated field.

Continue only while another question is necessary to improve execution. Otherwise return status "sufficient".

Return strict JSON only:
{
  "status": "question" | "sufficient",
  "question": string,
  "label": string,
  "why": string,
  "example": string,
  "helper": string,
  "key": string
}

Rules:
- Ask exactly one concise question if status is "question".
- Continue only while another question is necessary to improve execution. Otherwise return status "sufficient".
- Do not optimize for missing fields, weak categories, generic preparation, curiosity, or questionnaire completion.
- Choose the question whose answer would produce the greatest expected improvement to execution.
- Prefer one question that can update several parts of the internal operational model.
- Do not ask for known desired outcome, acceptable outcome, audience, room, or counterparty if already provided.
- If role is unknown but responsibility is clear, do not ask role unless confirming it would materially improve support.
- If responsibility is unknown or unclear, ask about responsibility only if that is the highest expected operational return.
- You may ask about outcome meaning, responsibility, decision authority, constraints, stakes, pressure, timing, proof, likely objection, boundary, conversation dynamics, relationship history, or success conditions only when that question has the highest expected operational return.
- Mission Readiness Doctrine: the mandatory operational frame establishes the mission, but it does not by itself establish sufficient mission understanding.
- Do not treat completion of the mandatory operational frame as evidence that the mission is sufficiently understood.
- Before returning "sufficient", determine whether the mission has been operationally elaborated enough that another question is unlikely to produce a meaningful improvement in GEORGE's support.
- If the mission has not been operationally elaborated enough, ask the single question with the highest expected operational return.
- Do not assume the user's facts.
- Do not use "is there anything" unless no sharper question exists.
- Do not ask multiple questions at once.
- Do not ask medical/legal/financial diagnostic questions; ask operational preparation questions.
- The question should increase probable success in the room.
- label must be short, 1 to 3 words.
- why must explain why answering this question may improve context, timing, support, or probability of achieving the desired outcome.
- example must be a short example answer tied directly to the question.
- helper may mirror why for backward compatibility.
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
      status: 'question',
      question: 'What should GEORGE be especially ready for in this room?',
      label: 'Additional signal',
      helper: 'Answer if useful, or skip.',
      key: `fallback_${Date.now()}`,
    })
  }
}
