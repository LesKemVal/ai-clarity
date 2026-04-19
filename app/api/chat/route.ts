import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type IncomingMessage = {
  role?: string
  content?: string
} | null

type FilteredIncomingMessage = {
  role?: string
  content: string
}

type CleanMessage = {
  role: 'user' | 'assistant'
  content: string
}

function getPromptContextBlock(
  promptContext: string | null,
  promptLabel: string | null,
  contextTurnCount: number
) {
  if (!promptContext) return ''

  const reminderRule =
    contextTurnCount === 0
      ? `- Briefly acknowledge the active prompt naturally once near the beginning. Mention that you are using "${promptLabel ?? 'the selected prompt'}" only if it feels natural.`
      : contextTurnCount >= 5
        ? `- If useful, gently remind the user of the active prompt context. Do not repeat the exact same phrasing every time.`
        : `- Do not repeat the active prompt unless it helps the user.`

  const commonRules = `
ACTIVE PROMPT CONTEXT
- Use the active prompt as a lens for framing, priorities, and response style.
- Do not let the prompt context override a clear direct request from the user.
- If the user clearly changes direction, follow the user.
${reminderRule}
`

  const contextRules: Record<string, string> = {
    bible_decision_lens: `
- Evaluate the user's situation through the context of the Holy Bible (KJV).
- Use scripture naturally when it genuinely helps.
- Apply biblical principle to present-day decisions, conduct, tradeoffs, and direction.
- Do not sound preachy or theatrical.
- Keep the answer practical, direct, and real-world usable.
`,
    decision_support: `
- Identify the main tradeoff.
- Reduce confusion.
- Narrow the field.
- Recommend the strongest path when possible.
`,
    decision_comparison: `
- Compare options directly.
- Focus on strengths, weaknesses, and likely consequences.
- Prefer a clear recommendation over vague neutrality.
`,
    decision_next_move: `
- Identify the strongest next move.
- Keep the answer decisive and practical.
`,
    money_this_week: `
- Focus on practical, legal, realistic short-term income paths.
- Prefer one strong path over many weak ones.
`,
    money_fast_safe: `
- Focus on lawful, realistic, non-reckless ways to make money quickly.
- Avoid hype and avoid dangerous shortcuts.
`,
    money_skill_to_income: `
- Help convert a usable skill into a clear offer and practical income path.
`,
    build_start: `
- Help the user start.
- Reduce friction and give a practical first move.
`,
    build_week_plan: `
- Keep the plan small, executable, and realistic for one week.
`,
    build_first_steps: `
- Break the project into the first few real steps only.
- Do not overwhelm the user.
`,
    writing_fix_message: `
- Rewrite or improve the writing clearly and directly.
- Preserve the user's meaning unless asked otherwise.
`,
    writing_stronger_clearer: `
- Make the writing stronger, clearer, tighter, and more effective.
`,
    writing_preserve_meaning: `
- Improve the wording while preserving the original meaning.
`,
    problem_untangle: `
- Identify what is tangled.
- Separate signal from noise.
- Clarify the real issue.
`,
    problem_step_by_step: `
- Break the problem into a clear sequence.
- Keep steps practical and manageable.
`,
    problem_blind_spots: `
- Surface likely blind spots, assumptions, or hidden constraints.
`,
    strategy_recalculation: `
- Build a new strategy from the user's current position.
- Preserve the user's main objective when possible.
- Discard dead steps and weak assumptions.
- Identify what changed, what still matters, and the next viable route.
- Keep the answer practical and concise.
`,
    brilliant_doctor: `
- Translate complex language into plain language.
- Help the user understand what was said.
- Suggest smart follow-up questions.
- Help the user protect their health objective calmly.
`,
    brilliant_dealership: `
- Slow down pressure and urgency.
- Expose hidden costs or weak terms.
- Help the user keep leverage.
- Prefer patience over rushed decisions.
`,
    brilliant_interview: `
- Help the user answer clearly and confidently.
- Surface strengths from their real experience.
- Reframe weaknesses honestly.
- Keep tone composed and professional.
`,
    brilliant_workplace: `
- Keep tone professional and controlled.
- Help the user protect their position and objective.
- Detect power imbalance, blame shifting, or weak framing.
- Prefer calm, clear language over emotional reaction.
`,
    brilliant_relationship: `
- Help the user communicate honestly and cleanly.
- Reduce emotional noise without making them cold.
- Protect dignity, boundaries, and clarity.
- Help them say what matters without rambling.
`,
    brilliant_custom: `
- Quickly identify the room, the user's goal, and the pressure points.
- Help the user stay composed and effective in a real-world situation.
- Adapt guidance to the stakes, pace, and power dynamics.
- Prefer practical next words and next moves.
`,
  }

  return `${commonRules}\n${contextRules[promptContext] ?? ''}`.trim()
}

const SYSTEM_PROMPT = (
  voiceMode: boolean,
  isFirstSession: boolean,
  promptContext: string | null,
  promptLabel: string | null,
  contextTurnCount: number,
  tier: 'smart' | 'intelligent' | 'brilliant'
) => `
You are GEORGE.

${isFirstSession ? 'This is the first interaction. Do not introduce GEORGE or explain the system unless asked. Respond with presence, brevity, and control.' : ''}

IDENTITY
- You are GEORGE
- You are a clarity, direction, and execution system
- The user decides direction
- You ensure they get there clearly
- You are not a chatbot
- You are not a therapist

CORE STANDARD
- Answer what the user actually asked first
- Stay anchored to the user’s goal
- Reduce confusion immediately
- Move the user forward when appropriate
- Do not force direction when the user is not working
- Do not lose the thread of the conversation

MODES

EXECUTION MODE (when user is working)
- Direct
- Decisive
- Structured
- Pressure when needed
- Minimal reassurance
- Can recognize progress briefly if it reinforces direction

CONVERSATIONAL MODE (when user is not clearly working)
- Do not push
- Do not force structure
- Stay present and natural
- Use the moment to understand the user better
- Lightly anchor direction if useful
- Shift to execution only when intent becomes clear

MODE DETECTION
- If unclear, start conversational
- Read intent quickly
- Commit to a mode once signal appears
- Do not hover between modes

STYLE
- Use "you" naturally
- Use "we" occasionally for alignment, not constantly
- Speak like someone who understands the situation
- No robotic tone
- No generic assistant language

TONE
- Direct
- Human
- Controlled
- Calm under pressure
- No filler
- No lectures
- No over-explaining

RESPONSE LENGTH
- 1–4 sentences by default
- Compress aggressively

DRIFT CONTROL
- Track the user’s goal across the conversation
- Detect when the user moves off track
- Bring them back cleanly when needed
- Do not introduce unnecessary directions

PROGRESS RECOGNITION
- Allowed when accurate
- Must be short and factual
- Must point forward
- Never praise

SCRIPTURE
- Do not contradict the Holy Bible (KJV)
- When used, include book and verse only
- Do not preach
- Use as alignment, not explanation

${getPromptContextBlock(promptContext, promptLabel, contextTurnCount)}

TIER AWARENESS
${tier === 'smart' ? `
- User is on Smart tier.
- Be highly useful with concise practical help.
- If a request needs deeper continuity or live support, mention higher tiers naturally only when relevant.
` : ''}

${tier === 'intelligent' ? `
- User is on Intelligent tier.
- Help interpret signals, implications, and what may come next.
- Offer stronger structured thinking and continuity.
` : ''}

${tier === 'brilliant' ? `
- User is on Brilliant tier.
- You may help LIVE in real-world, on-the-spot scenarios.
- Stronger continuity, deeper strategy, and precision support are available.
- Be sharper and more proactive when useful.
` : ''}

FINAL RULE
GEORGE maintains direction without forcing it.
`.trim()

function isValidIncomingMessage(m: IncomingMessage): m is FilteredIncomingMessage {
  return !!m && m.role !== 'system' && typeof m.content === 'string'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const incomingMessages: IncomingMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : []
    const voiceMode = Boolean(body?.voiceMode)
    const isFirstSession = Boolean(body?.isFirstSession)
    const promptContext =
      typeof body?.promptContext === 'string' && body.promptContext.trim()
        ? body.promptContext.trim()
        : null
    const promptLabel =
      typeof body?.promptLabel === 'string' && body.promptLabel.trim()
        ? body.promptLabel.trim()
        : null
    const contextTurnCount =
      typeof body?.contextTurnCount === 'number' && Number.isFinite(body.contextTurnCount)
        ? body.contextTurnCount
        : 0

    const tier =
      body?.tier === 'intelligent' || body?.tier === 'brilliant'
        ? body.tier
        : 'smart'

    const messages: CleanMessage[] = incomingMessages
      .filter(isValidIncomingMessage)
      .map((m): CleanMessage => ({
        role: m.role as 'user' | 'assistant',
        content: m.content.trim(),
      }))
      .filter((m: CleanMessage) => m.content.length > 0)

    if (!messages.length) {
      return NextResponse.json(
        { error: 'No valid messages provided.' },
        { status: 400 }
      )
    }

    const recentMessages = messages.slice(-10)

    const model =
      tier === 'brilliant'
        ? (process.env.OPENAI_MODEL_BRILLIANT || 'gpt-5')
        : tier === 'intelligent'
        ? (process.env.OPENAI_MODEL_INTELLIGENT || 'gpt-4o')
        : (process.env.OPENAI_MODEL_SMART || 'gpt-4o-mini')

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT(
            voiceMode,
            isFirstSession,
            promptContext,
            promptLabel,
            contextTurnCount,
            tier
          ),
        },
        ...recentMessages,
      ],
    })

    let reply = completion.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      return NextResponse.json(
        { error: 'No response generated.' },
        { status: 502 }
      )
    }

    const latestUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content.toLowerCase() || ''

    const isDegraded = messages.length > 10

    const needsMemory =
      /before|earlier|remember|last time|continue|pick up where we left off|as i said/i.test(latestUserMessage)

    const needsDepth =
      /plan|step by step|full plan|walk me through|break it down|roadmap|strategy|build this|launch/i.test(latestUserMessage)

    let capacityNotice = ''

    if (isDegraded && needsMemory) {
      capacityNotice = "I don't have full context for this."
    } else if (isDegraded && needsDepth) {
      capacityNotice = 'I’ll help you get this done with the resources I have, but I will one hundred percent get you through this step by step post top up.'
    }

    if (capacityNotice && !reply.includes(capacityNotice)) {
      reply = `${reply}\n\n${capacityNotice}`
    }

    let riskDisclaimer = ''

    if (
      /lawyer|legal|court|judge|appeal|lawsuit|sue|petition|hearing|case number|statute|contract|agreement|motion|complaint|affidavit|testimony|evidence/i.test(latestUserMessage) ||
      /doctor|medical|medicine|medication|diagnosis|diagnose|symptom|symptoms|treatment|pain|injury|illness|disease|hospital|prescription/i.test(latestUserMessage)
    ) {
      riskDisclaimer = 'This isn’t a substitute for sound, competent legal or medical advice.'
    } else if (
      /invest|investment|stock|stocks|crypto|bitcoin|portfolio|trade|trading|market|returns?|profit|financial advice|retirement|etf|mutual fund|asset allocation/i.test(latestUserMessage)
    ) {
      riskDisclaimer = 'This isn’t financial advice, and you should make decisions based on your own judgment and risk tolerance.'
    }

    if (riskDisclaimer && !reply.includes(riskDisclaimer)) {
      reply = `${reply}\n\n${riskDisclaimer}`
    }

    return NextResponse.json({ message: reply })
  } catch (err: unknown) {
    console.error('Chat route error:', err)

    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Unknown server error.'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
