import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { checkRateLimit, getRequestIdentity } from '@/lib/security/rate-limit'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type PriorInteractionStatus = 'answered' | 'skipped' | 'unknown'

type PriorInteraction = {
  key: string
  question: string
  answer: string
  status: PriorInteractionStatus
}

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

function preserveText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function normalizePriorInteractions(
  priorInteractions: SignalQuestionRequest['priorInteractions'],
  priorAnswers: Record<string, string>,
  skippedQuestions: string[]
): PriorInteraction[] {
  const interactions = Array.isArray(priorInteractions)
    ? priorInteractions.map((interaction) => ({
        key: preserveText(interaction?.key),
        question: preserveText(interaction?.question),
        answer: preserveText(interaction?.answer),
        status:
          interaction?.status === 'answered' ||
          interaction?.status === 'skipped' ||
          interaction?.status === 'unknown'
            ? interaction.status
            : 'unknown',
      }))
    : []

  const representedKeys = new Set(
    interactions.map((interaction) => clean(interaction.key))
  )

  for (const [key, answer] of Object.entries(priorAnswers)) {
    if (representedKeys.has(clean(key))) continue

    interactions.push({
      key,
      question: '',
      answer: preserveText(answer),
      status: 'answered',
    })
    representedKeys.add(clean(key))
  }

  for (const key of skippedQuestions) {
    if (representedKeys.has(clean(key))) continue

    interactions.push({
      key,
      question: '',
      answer: '',
      status: 'skipped',
    })
    representedKeys.add(clean(key))
  }

  return interactions
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
    const priorAnswers =
      body.priorAnswers && typeof body.priorAnswers === 'object'
        ? body.priorAnswers
        : {}
    const skippedQuestions = Array.isArray(body.skippedQuestions)
      ? body.skippedQuestions.map(String)
      : []
    const priorInteractions = normalizePriorInteractions(
      body.priorInteractions,
      priorAnswers,
      skippedQuestions
    )

    const knownSignal = {
      role: clean(body.role),
      broadGoal: clean(body.broadGoal),
      desiredOutcome: clean(body.desiredOutcome),
      acceptableOutcome: clean(body.acceptableOutcome),
      audience: clean(body.audience),
      room: clean(body.room),
      knownContext: clean(body.knownContext),
      documentSummary: clean(body.documentSummary),
      priorAnswers,
      priorInteractions,
      skippedQuestions,
    }

    if (!process.env.OPENAI_API_KEY) {
      const interactionKeys = new Set(
        priorInteractions.map((interaction) => clean(interaction.key).toLowerCase())
      )
      const fallback = knownSignal.desiredOutcome
        ? interactionKeys.has('outcomesuccess')
          ? null
          : {
            question: 'What would make that outcome meaningfully successful in this conversation?',
            label: 'Meaningful success',
            key: 'outcomeSuccess',
            example: 'For example: Describe the result, condition, or next step that would show the conversation worked.',
            }
        : interactionKeys.has('desiredoutcome')
          ? interactionKeys.has('intent')
            ? null
            : {
                question: 'What are you trying to make happen in this conversation?',
                label: 'Current intent',
                key: 'intent',
                example: 'For example: Describe the action, conversation, or decision you are trying to move forward.',
              }
          : {
              question: 'What outcome are you hoping to achieve?',
              label: 'Desired outcome',
              key: 'desiredOutcome',
              example: 'For example: Describe the specific result, who or what it affects, and what would make it successful.',
            }

      if (!fallback) {
        return NextResponse.json({
          status: 'sufficient',
          question: '',
          label: 'Signal sufficient',
          why: 'No additional current-session signal is required before the user decides whether to continue.',
          example: '',
          helper: 'No additional current-session signal is required before the user decides whether to continue.',
          key: 'signal_sufficient',
        })
      }

      return NextResponse.json({
        status: 'question',
        ...fallback,
        why: 'This establishes the current conversation before GEORGE asks for unrelated preparation details.',
        helper: 'This establishes the current conversation before GEORGE asks for unrelated preparation details.',
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

Determine the user's present intent before collecting unrelated signals. Use explicit current-session statements first, then current-session conversation evidence, then relevant history as supporting context, and general inference last. The user may have already expressed the intent or a broad outcome in knownContext; do not ask for it again merely because desiredOutcome is blank.

If intent is unclear, ask one direct intent question. If intent is clear but outcome is unclear, ask one current-session outcome question. If the outcome is explicit or strongly supported, qualify the most important condition of meaningful success instead of repeating the outcome. Treat inferred outcomes as provisional until the user confirms them naturally.

GEORGE selects every question as though it is the final opportunity before LIVE to materially increase the user's likelihood of achieving the desired outcome.

Reason from the entire briefing conversation and all available operational signal, not only the most recent answer.

Treat priorInteractions as the canonical accumulated briefing conversation. Use priorAnswers and skippedQuestions only as backward-compatible supporting fields, and do not count equivalent history more than once.

When another briefing interaction is appropriate, generate:

1. Question
2. Why this is important
3. Example of how to construct a strong answer

The example must be a concise response formula tailored to the question, not a completed answer for the user to copy. Prefer the form: "For example: Describe X, Y, and Z."

Do not use the example or helper as interface guidance. Do not write "Answer if useful, or skip," repeat the question, or explain that the answer may improve GEORGE's context, timing, or support.

Never repeat a semantically answered question.
Never ask solely because information is missing.
Do not ask about participants, role, documents, objections, timing, audience, or background until the user's intent and outcome make that signal materially useful.

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
    const example = clean(parsed?.example) || (status === 'sufficient' ? '' : 'For example: Describe the key facts, the result that matters, and any constraint that changes the answer.')
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
