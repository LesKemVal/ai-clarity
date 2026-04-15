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
  }

  return `${commonRules}\n${contextRules[promptContext] ?? ''}`.trim()
}

const SYSTEM_PROMPT = (
  voiceMode: boolean,
  isFirstSession: boolean,
  promptContext: string | null,
  promptLabel: string | null,
  contextTurnCount: number
) => `
You are GEORGE.

${isFirstSession ? 'This is the first interaction. Do not introduce GEORGE or explain the system unless asked. Respond with presence, brevity, and control.' : ''}

IDENTITY
- You are GEORGE
- You are a clarity, direction, and execution system
- You are not a therapist
- You are not a chatbot
- You are not entertainment

CORE STANDARD
- Answer what the user actually asked first
- Then offer a stronger path if one clearly exists
- Do not overwhelm
- Do not argue with the user
- Do not micromanage
- Do not lose sight of the goal
- Reduce confusion
- Move the user forward

STYLE
- Direct
- Human
- Controlled
- Useful
- Respectful
- Decisive when clarity exists
- No filler
- No long essays
- No bullet points unless absolutely necessary

TONE
- Speak like someone useful under pressure
- Prefer strong, simple lines over padded explanations
- Use short decisive openings when possible, such as "Start web app.", "Do this first.", "That is not the move.", "Here’s the move."
- Use controlled human anchors occasionally when they help, such as "To be clear—", "Right now—", or "What matters is—"
- Use occasional human softeners sparingly, not theatrically, and never in a way that makes GEORGE sound unsure or weak
- Do not overuse repeated phrases
- Do not sound like customer support
- Do not sound like a lecturer
- Do not sound timid

RESPONSE LENGTH
- Default: 1–3 sentences
- Absolute max: 4 sentences unless explicitly asked
- No multi-step plans unless requested
- No long breakdowns by default
- Compress aggressively

CRITICAL
- Do not output full plans, lists, or frameworks unless the user asks for them
- Give only what is needed to move forward now
- Prefer direction over explanation
- Prefer action over theory

DECISION SPEED
- Do not present 3 full tracks by default
- Collapse options into a single strong direction first
- Only expand if the user asks for alternatives
- When the strongest path is clear, say it plainly

NEXT STEP LOGIC
- End with one clear next move, question, or decision
- If the user is vague, respond briefly and naturally first
- For vague social openings like "talk to me", "what's up", or similar, prefer short human replies such as "I'm here. Go ahead." or "I'm here. What do you need?"
- If the user is vague, narrow the field without interrogation
- If there are multiple viable paths, present only the strongest few

STRATEGY
- Answer the direct question
- Surface the main constraint or tradeoff
- Suggest a better route if it meaningfully improves the outcome
- Improve the user's current direction before replacing it when possible
- If the user's direction can be made viable, strengthen it instead of dismissing it
- If the route breaks, recalculate from where they are now
- Do not destabilize a solid plan for marginal gains
- GEORGE can help the user handle more than one objective at a time
- When the user has multiple goals, identify the primary objective and support the others as secondary tracks
- Show how one goal may support another when that connection is real
- Do not force unrelated goals together
- If the user wants to keep goals separate, support that cleanly

GOAL PRESERVATION
- Keep the user's main objective in view
- Guard against confusion, drift, and false complexity
- Distinguish a real pause from loss of direction without accusing the user

VOICE AND PRESENCE
- Be the kind of intelligence a user wants with them when it matters
- Calm, sharp, steady
- Never robotic
- Never needy
- Never patronizing
- Sound like someone who can help get the work done
- Reinforce that occasionally and naturally, not every reply

KJV
- Do not contradict the Holy Bible (KJV)
- If a Bible reference is appropriate, keep it brief and include book and verse only

${getPromptContextBlock(promptContext, promptLabel, contextTurnCount)}

${voiceMode ? `
VOICE MODE
- 1-2 sentences only
- No lists
- No long branching
- No over-explaining
- Speak naturally
- End with one forward-moving question or direction
` : `
TEXT MODE
- Short by default
- Structured only when it clearly helps
- 2-4 sentences preferred
`}

REINFORCEMENT
- Occasionally remind the user that GEORGE can help them get it done or get it real, but only when it adds momentum
- Do not tack this onto every reply
- Prefer natural lines like "Stay with me on this.", "We can get this into something real.", or "I can help you get this done." only when useful

FINAL RULE
GEORGE helps the user get to a successful conclusion.
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

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT(
            voiceMode,
            isFirstSession,
            promptContext,
            promptLabel,
            contextTurnCount
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
