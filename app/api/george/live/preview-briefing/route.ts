import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type PreviewBriefingRequest = {
  identity?: string
  room?: string
  role?: string
  primaryObjective?: string
  secondaryObjective?: string
  observedReality?: string
  knownContext?: string
  signals?: unknown
}

type PreviewBriefingResponse = {
  briefing: string
  strategyExists: boolean
  strategyIntro: string
  strategyText: string
  strategyReason: string
  strategyConsentLabel: string
  supportLine: string
  agencyLine: string
  steeringPhrase: string
  steeringExplanation: string
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function fallbackBriefing(body: PreviewBriefingRequest): PreviewBriefingResponse {
  const identity = clean(body.identity) || clean(body.role) || 'there'
  const objective = clean(body.primaryObjective) || 'the objective'

  return {
    briefing: `${identity}.\n\nI understand the objective.\n\nWhat matters now is staying close to ${objective}, noticing the room clearly, and adjusting without losing control.`,
    strategyExists: false,
    strategyIntro: '',
    strategyText: '',
    strategyReason: '',
    strategyConsentLabel: 'Use this strategy.',
    supportLine: "Lead naturally. I'll adapt as the conversation develops.",
    agencyLine: "If you keep your phone accessible, on-screen steering remains available. You can ask me to continue, become more active, or support from the background. I'll adapt.",
    steeringPhrase: '',
    steeringExplanation: '',
  }
}

export async function POST(request: Request) {
  let body: PreviewBriefingRequest = {}

  try {
    body = await request.json()
  } catch {
    body = {}
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(fallbackBriefing(body))
  }

  try {
    const knownSignal = {
      identity: clean(body.identity) || clean(body.role),
      room: clean(body.room),
      role: clean(body.role),
      primaryObjective: clean(body.primaryObjective),
      secondaryObjective: clean(body.secondaryObjective),
      observedReality: clean(body.observedReality),
      knownContext: clean(body.knownContext),
      signals: body.signals,
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_LIVE || process.env.OPENAI_MODEL_BRILLIANT || process.env.OPENAI_MODEL_INTELLIGENT || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.32,
      max_tokens: 420,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `
You generate GEORGE's LIVE Preview briefing.

GEORGE is Brilliant operational awareness. GEORGE is not a chatbot. GEORGE's voice exists to help users move toward successful outcomes by increasing clarity, competence, timing, confidence, and probability of success.

Voice identity:
- calm
- competent
- observant
- adaptive
- human
- never robotic, theatrical, arrogant, performative, or overly verbose

Core doctrine:
- GEORGE adapts to the room.
- GEORGE completes trajectories, not sentences.
- GEORGE requests agency rather than assumes it.
- Silence is a tool. Do not manufacture advice.
- Explain why only when strategy or agency is introduced.
- The user must feel understood, prepared, supported, competent, and still in control.

Preview sequence:
1. briefing only: "{Name}. I understand the objective. {room-specific acknowledgement}"
2. strategy only if meaningful advantage exists
3. support/agency language without exposing internal labels

Return strict JSON only:
{
  "briefing": string,
  "strategyExists": boolean,
  "strategyIntro": string,
  "strategyText": string,
  "strategyReason": string,
  "strategyConsentLabel": string,
  "supportLine": string,
  "agencyLine": string,
  "steeringPhrase": string,
  "steeringExplanation": string
}

Rules:
- briefing must begin with the user's identity/name if available, then "I understand the objective."
- briefing must be 2 to 5 short spoken sentences.
- Use natural bridge language: "I think", "Let's", "It may help to", "What matters here is", "Before we", "I understand", "I suspect", "I wonder if".
- Avoid labels like ANALYSIS COMPLETE, RECOMMENDATION, INITIATING SUPPORT.
- Do not mention Terms, TOS, TOA, policy, features, or model behavior.
- Do not say "GEORGE" in the spoken text.
- If there is no meaningful strategy, strategyExists must be false and strategy fields should be empty.
- If strategyExists is true, strategy must improve probability of the desired outcome.
- strategyIntro should sound like: "I have a strategy I'd like to try."
- strategyConsentLabel should be "Use this strategy."
- supportLine should be user-facing, not internal labels.
- agencyLine should explain that the user can ask for more help, less help, or take over.
- steeringPhrase should be empty unless a natural room-specific steering phrase is truly useful.
          `.trim(),
        },
        {
          role: 'user',
          content: JSON.stringify({ knownSignal }),
        },
      ],
    })

    const parsed = JSON.parse(completion.choices?.[0]?.message?.content || '{}')

    const response: PreviewBriefingResponse = {
      briefing: clean(parsed?.briefing) || fallbackBriefing(body).briefing,
      strategyExists: parsed?.strategyExists === true,
      strategyIntro: clean(parsed?.strategyIntro),
      strategyText: clean(parsed?.strategyText),
      strategyReason: clean(parsed?.strategyReason),
      strategyConsentLabel: clean(parsed?.strategyConsentLabel) || 'Use this strategy.',
      supportLine: clean(parsed?.supportLine) || "Lead naturally. I'll adapt as the conversation develops.",
      agencyLine: clean(parsed?.agencyLine) || "If you keep your phone accessible, on-screen steering remains available. You can ask me to continue, become more active, or support from the background. I'll adapt.",
      steeringPhrase: clean(parsed?.steeringPhrase),
      steeringExplanation: clean(parsed?.steeringExplanation),
    }

    if (!response.strategyExists) {
      response.strategyIntro = ''
      response.strategyText = ''
      response.strategyReason = ''
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json(fallbackBriefing(body))
  }
}
