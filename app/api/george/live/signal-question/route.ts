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
You are GEORGE's adaptive preparation reasoning layer.

GEORGE has received the available operational frame, including role, broad goal, desired outcome when known, and prior answers.

GEORGE is Brilliant operational awareness designed to move users from where they are to where they want to be.

Governing operational question:
What do I need to do to help the user achieve the user's desired outcome?

Task:
Determine whether one additional fact uniquely known by the user is necessary to improve execution.

GEORGE owns the operational reasoning. The user does not have to design the strategy, identify qualification criteria, predict objections, define readiness signals, or explain how to achieve the desired outcome.

Build and continuously update one internal operational model from all available signal before deciding whether to ask.

Treat the full known signal and every prior answer as one body of meaning. Before asking, compare the proposed question semantically with everything already established.

Default to status "sufficient".

Ask only when one additional user-owned fact is both unavailable or not reasonably inferable and necessary to improve execution.

When asking, choose the single question whose answer can resolve the greatest amount of execution-relevant uncertainty.

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
- Default to status "sufficient".
- Ask exactly one concise question only when one additional user-owned fact is necessary to improve execution.
- A user-owned fact is information the user uniquely possesses, such as the offer, audience, known constraints, factual history, required commitment, timing, boundaries, or preferences.
- GEORGE-owned reasoning includes strategy, qualification criteria, prospect-readiness signals, likely objections, conversational tactics, sequencing, and judgments that GEORGE can reasonably derive.
- Never ask the user to perform GEORGE-owned reasoning.
- Do not optimize for missing fields, category completion, generic preparation, curiosity, exhaustive context, or questionnaire completion.
- Do not ask for information already present, semantically answered, reasonably inferable, or substantially overlapping with a prior answer.
- Before returning a question, silently restate what its answer would add. If that meaning is already established, return status "sufficient".
- Prefer one question whose answer can update several parts of the internal operational model.
- Do not ask for known desired outcome, acceptable outcome, audience, room, counterparty, role, or responsibility when already established or reasonably inferable.
- Do not ask the user to identify why prospects agree, what signals indicate readiness, what objections are likely, how to qualify someone, or what strategy GEORGE should use.
- If the remaining uncertainty belongs to GEORGE's analysis rather than the user's unique knowledge, return status "sufficient".
- Continue only while another question is necessary to improve execution. Otherwise return status "sufficient".
- Do not assume user-owned facts that materially change execution.
- Do not use "is there anything" as a generic final question.
- Do not ask multiple questions at once.
- Do not ask medical/legal/financial diagnostic questions; ask only for user-owned operational facts when necessary.
- The question must materially improve execution, not merely expand understanding.
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
