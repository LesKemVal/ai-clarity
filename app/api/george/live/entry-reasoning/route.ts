import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { checkRateLimit, getRequestIdentity } from '@/lib/security/rate-limit'
import { fallbackLiveEntryReasoning } from '@/lib/george/live-runtime/live-entry-reasoning'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(req: Request) {
  try {
    const rate = checkRateLimit({
      key: `live-entry-reasoning:${getRequestIdentity(req)}`,
      limit: 50,
      windowMs: 60_000,
    })

    const body = await req.json().catch(() => ({}))
    const fallback = fallbackLiveEntryReasoning(body || {})

    if (!rate.ok || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(fallback)
    }

    const knownSignal = {
      objective: clean(body?.objective),
      position: clean(body?.position),
      audience: clean(body?.audience),
      roomSignal: clean(body?.roomSignal),
      secondaryPosition: clean(body?.secondaryPosition),
      userName: clean(body?.userName),
      proofTranscript: clean(body?.proofTranscript),
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_INTELLIGENT || process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: 0.25,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `
You are reasoning for GEORGE's LIVE Entry briefing.

GEORGE identity is fixed:
calm, competent, observant, adaptive, human.
Not theatrical. Not robotic. Not verbose. Not generic coaching.

Doctrine:
- Start with the user's desired outcome.
- Then adapt to reality.
- The interface presents facts.
- GEORGE speaks meaning, priority, and support.
- Do not merely read the screen.
- Outcome governs. Room, role, pressure, history, and tendencies inform support.
- Preserve user agency.

Return strict JSON only:
{
  "roomObservation": string,
  "supportSummary": string,
  "commitmentStatement": string
}

roomObservation:
- One concise sentence.
- Interpret the room in relation to the desired outcome.
- Do not repeat the objective, role, or audience as a list.

supportSummary:
- One concise sentence.
- Explain how GEORGE will adapt support.
- Should sound like method, not feature list.

commitmentStatement:
- One concise sentence responding to proofTranscript.
- If proofTranscript is a real question, answer only if the meaning is clear enough to be useful.
- If proofTranscript is ambiguous, do not pretend certainty. State the likely interpretation or what GEORGE will watch for.
- If proofTranscript adds concern/risk, convert it into a support commitment.
- If proofTranscript is unclear or empty, use a brief fallback.
- Do not say "I'll keep that in mind" unless there is no usable signal.
- Do not give legal, medical, or financial advice.
- Keep it suitable to be spoken after "Understood."
- Do not include "Understood" or "Let's go to work" in commitmentStatement.
- Do not end with a transition phrase. The interface button handles transition.
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

    return NextResponse.json({
      roomObservation: clean(parsed?.roomObservation) || fallback.roomObservation,
      supportSummary: clean(parsed?.supportSummary) || fallback.supportSummary,
      commitmentStatement: clean(parsed?.commitmentStatement) || fallback.commitmentStatement,
    })
  } catch {
    return NextResponse.json(
      fallbackLiveEntryReasoning({}),
      { status: 200 }
    )
  }
}
