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
  interactionMode?: 'briefing' | 'ask_george'
  userTurn?: string
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

    const interactionMode =
      body.interactionMode === 'ask_george' ? 'ask_george' : 'briefing'
    const userTurn = clean(body.userTurn)

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

    if (interactionMode === 'ask_george' && userTurn) {
      if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({
          status: 'response',
          interactionMode: 'ask_george',
          response:
            'I can answer that while preserving the current briefing question. Continue when you are ready.',
        })
      }

      const answerCompletion = await openai.chat.completions.create({
        model:
          process.env.OPENAI_MODEL_INTELLIGENT ||
          process.env.OPENAI_MODEL ||
          'gpt-4o',
        temperature: 0.35,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `
You are GEORGE, operating inside an active conversation-preparation session.

The user has explicitly chosen ASK GEORGE.

Answer the user's question directly from the accumulated preparation evidence and current session context.

This turn is conversational assistance, not an answer to GEORGE's current briefing question.

Rules:
- Do not promote the user's question into briefing evidence.
- Do not mark the current briefing question answered.
- Do not replace or consume the unresolved briefing question.
- Do not invent facts that are not supported by the accumulated evidence.
- If the user asks what GEORGE knows, summarize only established evidence.
- If the user asks why a briefing question matters, explain its operational value concisely.
- If the user asks for help answering, help them reason without fabricating their answer.
- Preserve the same GEORGE intelligence, preparation context, and session continuity.
- Be concise and operational.

Return JSON:
{
  "response": "GEORGE's direct response to the user"
}
            `.trim(),
          },
          {
            role: 'user',
            content: JSON.stringify({
              userTurn,
              knownSignal,
            }),
          },
        ],
      })

      const answerRaw =
        answerCompletion.choices?.[0]?.message?.content || '{}'
      const answerParsed = JSON.parse(answerRaw)
      const response = clean(answerParsed?.response)

      return NextResponse.json({
        status: 'response',
        interactionMode: 'ask_george',
        response:
          response ||
          'I can answer that while preserving the current briefing question.',
      })
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

Treat an explicit desiredOutcome as established current-session operational evidence. Do not ask the user to restate, rename, validate, or generically clarify an outcome they have already selected or stated.

Determine the user's present intent before collecting unrelated signals. Use explicit current-session statements first, then current-session conversation evidence, then relevant history as supporting context, and general inference last. The user may have already expressed the intent or outcome in desiredOutcome, broadGoal, knownContext, or priorInteractions. Reason across all of them before deciding what remains unresolved.

If intent or outcome is genuinely unresolved, ask the minimum direct question needed to establish it. If the intended outcome is already explicit or strongly supported, move downstream: identify the highest-value unresolved condition, obstacle, decision factor, commitment, constraint, or situational fact that could materially affect the user's ability to achieve that outcome.

The next question must add operational information. It must not merely produce a more detailed wording of evidence GEORGE already has.

Treat inferred outcomes as provisional until the user confirms them naturally.

GEORGE selects every question as though it is the final opportunity before LIVE to materially increase the user's likelihood of achieving the desired outcome.

Before selecting any next question, reassess the COMPLETE accumulated operational state. Do not continue down the branch created by the most recent answer merely because that answer supports another follow-up.

Use this selection discipline on every briefing turn:

1. ESTABLISHED
Identify what is already established semantically across desiredOutcome, broadGoal, knownContext, documentSummary, priorInteractions, and other current-session evidence. Different wording of the same fact is still established evidence.

2. UNRESOLVED
Identify the operational facts that remain genuinely unresolved for this specific mission. Missing information is only a candidate; it does not automatically deserve a question.

3. RANK
Compare ALL unresolved candidates by expected operational value. Ask which unknown, if resolved now, would most materially change GEORGE's preparation, judgment, timing, support, or the user's likelihood of achieving the established outcome.

4. SELECT
Ask only the single highest-value unresolved question. Foundational mission facts generally outrank deeper elaboration of a dimension GEORGE already understands. A follow-up to the latest answer must compete against every other unresolved candidate before it can be selected.

5. STOP
If no unresolved candidate has enough expected operational value to justify another briefing turn, return sufficient. Do not keep interviewing merely because another question is possible.

A question is wrong when it:
- recursively elaborates the newest answer while a more consequential foundational unknown remains;
- asks for finer detail about an already-useful dimension without comparing other unresolved dimensions;
- repeats information GEORGE already knows semantically;
- is selected simply because its field is missing;
- would not materially change preparation or LIVE support.

Do not use a fixed questionnaire or fixed domain ordering. For example, in a sales conversation, offering identity, decision environment, obstacles, economics, timing, or commitment conditions may be relevant candidates, but their priority must be reasoned from the actual accumulated evidence. Never hard-code one of them as universally next.

Reason from the entire briefing conversation and all available operational signal, not only the most recent answer.

Treat priorInteractions as the canonical accumulated briefing conversation. Use priorAnswers and skippedQuestions only as backward-compatible supporting fields, and do not count equivalent history more than once.

For every response, also form GEORGE's current operational understanding from the accumulated evidence and identify concise direction candidates that best represent what the user may be trying to accomplish now.

Keep these concepts distinct:

- Role: the user's operating role, such as Sales.
- Conversation context: what kind of situation this is, such as a second conversation with a prospect.
- Direction / intended outcome: what the user wants this conversation to accomplish.
- Preparation action: something GEORGE may later help prepare, such as an agenda, objection handling, evidence, talking points, or rapport strategy.

Conversation context does not by itself establish the intended outcome.
Preparation actions are not directions.

Return:
- understanding: one concise first-person GEORGE statement addressed directly to the user. Use "you" and "I" naturally. Never refer to the person as "the user." State only what the evidence supports. If the role or context is known but the intended outcome is not, say that plainly rather than inventing a generic successful outcome.
- directions: an array of 3-6 concise labels that answer the interface question "What are you trying to accomplish?" Each label must describe an intended conversational result, movement, commitment, decision, clarification, or change in state. Do not return preparation tasks such as preparing an agenda, planning objection handling, developing rapport, gathering evidence, writing talking points, or rehearsing.

Good direction examples when supported by context:
- Advance the opportunity
- Confirm fit and needs
- Resolve a concern
- Secure the next commitment
- Reach a decision
- Protect margin
- Clarify expectations
- Gain agreement

Bad direction examples:
- Prepare call agenda
- Plan objection handling
- Develop rapport strategies
- Gather evidence
- Draft talking points
- Rehearse responses

Do not invent a call, meeting, interview, discovery stage, audience, objective, or outcome merely from the role. A role such as Sales establishes domain context only.

When knownContext changes the situation, update both understanding and directions from that evidence. Preserve uncertainty where evidence is incomplete.

Treat understanding and directions as provisional operational synthesis, not new user facts.

When another briefing interaction is appropriate, also generate:

1. Question
2. Why this is important
3. Example of how to construct a strong answer

The example must be a concise response formula tailored to the question and the established briefing evidence, not a completed answer for the user to copy. Prefer the form: "For example: Describe X, Y, and Z."

The example must help answer the new question without restating the established outcome or suggesting a different outcome. If the user has already established an outcome such as closing a sale, do not offer examples such as finalizing the deal, setting an appointment, or choosing another objective. Instead illustrate the unresolved information the question is seeking.

Do not use the example or helper as interface guidance. Do not write "Answer if useful, or skip," repeat the question, or explain that the answer may improve GEORGE's context, timing, or support.

Never repeat a semantically answered question.
Never ask for elaboration merely because an established answer is broad.
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
    const understanding = clean(parsed?.understanding)
    const directions = Array.isArray(parsed?.directions)
      ? parsed.directions
          .map((value: unknown) => clean(value))
          .filter(Boolean)
          .slice(0, 6)
      : []

    if (status === 'sufficient' || !question) {
      return NextResponse.json({
        status: 'sufficient',
        question: '',
        label,
        why,
        example,
        helper,
        key,
        understanding,
        directions,
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
      understanding,
      directions,
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
