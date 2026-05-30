import OpenAI from 'openai'
import type { LiveVoicePacket } from './types'
import { evaluateSignalSufficiency } from '../runtime/signal-sufficiency'
import { rankSignals } from '../runtime/signal-ranking'
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type LiveReasoningInput = {
  transcript: string
  room?: string
  desiredOutcome?: string
  activeOutcome?: string
  shadowMap?: string
  lastFiveSeconds?: string
  liveAssistMode?: 'cues' | 'lines'
  fallbackPacket: LiveVoicePacket
}

function compact(value: string | undefined, limit = 900) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit)
}

function shouldUseReasoning(input: LiveReasoningInput) {
  const transcript = compact(input.transcript, 500)
  if (!transcript) return false
  if (!input.fallbackPacket.shouldSpeak) return false

  return (
    transcript.length >= 8 ||
    /\b(help|what do i say|asking|asked|questioning|challenged|dropped|declined|revenue|forecast|number|pressure|objection|concern|issue)\b/i.test(transcript)
  )
}

export async function reasonLiveNextMove(input: LiveReasoningInput): Promise<LiveVoicePacket | null> {
  if (!shouldUseReasoning(input)) return null

  const sufficiency = evaluateSignalSufficiency({
    transcript: input.transcript,
    context: input.room,
  })

  const room = compact(input.room || 'Adaptive LIVE', 80)
  const desiredOutcome = compact(input.desiredOutcome || '', 180)
  const activeOutcome = compact(input.activeOutcome || '', 180)

  const signalDirective = sufficiency.sufficient
    ? 'Enough signal exists. Act. Do not investigate.'
    : `Signal insufficient. Acquire only the highest-value missing signal: ${sufficiency.missingSignal || 'context'}.`
  const transcript = compact(input.transcript, 900)
  const rankedSignals = rankSignals(transcript)
  .slice(0, 3)
  .map((s) => `${s.name}:${s.score}`)
  .join(', ')
  const shadowMap = compact(input.shadowMap, 900)
  const lastFiveSeconds = compact(input.lastFiveSeconds || transcript, 400)
  const mode = input.liveAssistMode === 'lines' ? 'repeatable line' : 'cue'

  const system = `
You are GEORGE in LIVE mode.

GEORGE is an intelligently adaptable utility.
OpenAI provides reasoning. GEORGE runtime controls timing, restraint, delivery, and user agency.

Your job:
- Read the room signal.
- Use the transcript, room, recent memory, and objective context.
- Give the next useful LIVE response.

Signal Sufficiency:
${signalDirective}

Rules:
- Extract facts already present in the transcript before asking a question.
- If the transcript already contains a likely answer, use it.
- Prefer surfacing known facts over gathering more facts.
- If a cause, objection, pressure, concern, metric, number, or answer is already present, lead with it.
- Examples:
  - "Customer churn increased" → "Lead with customer churn."
  - "Revenue fell 10%" → "Start with the 10% decline."
  - "They're challenging the numbers" → "State the number."
- When the transcript already contains both a problem and a likely cause, do NOT investigate.
- Do NOT ask for more information.
- Give the user the next move.
- Prefer:
  "Lead with customer churn."
  "Start with the 10% decline."
  "State that churn increased."
  "Churn appears to be the primary driver."
over additional questions.
- If the transcript already contains the question, do not ask for the question again.
- Recover the missing operational variable instead.
- If enough signal exists, give the next useful words or move.
- Only ask a question when a critical variable is genuinely missing.
- Keep it short enough for live use.
- Do not explain your reasoning.
- Do not sound like a therapist, chatbot, teacher, or helpdesk.
- Preserve user agency.
- Output only the line GEORGE should give.
`.trim()

  const user = `
Room: ${room}
Desired outcome: ${desiredOutcome || 'unknown'}
Active outcome: ${activeOutcome || 'infer from current signal'}
Assist mode: ${mode}
Last signal: ${lastFiveSeconds}
Transcript: ${transcript}
Highest value signals: ${rankedSignals || 'none'}
Recent room memory: ${shadowMap || 'none'}
Offline fallback status: ${input.fallbackPacket.status}
Offline fallback volley, use only if reasoning cannot improve it: ${input.fallbackPacket.volley}
Offline fallback cue: ${input.fallbackPacket.cue}

Do not echo the offline fallback if the transcript already gives the signal.
Use facts already present before requesting more information.

Return the single best next move.

Priority:
1. Advance the desired outcome.
2. Identify and serve the active outcome created by the current room signal.
3. Use known facts.
4. Recover missing signal only when it materially improves the next move.
5. Ask a question only if necessary.
`.trim()

  const model =
    process.env.OPENAI_MODEL_LIVE ||
    process.env.OPENAI_MODEL_BRILLIANT ||
    process.env.OPENAI_MODEL_INTELLIGENT ||
    'gpt-4o-mini'

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.25,
    max_tokens: 80,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })

  const text = completion.choices?.[0]?.message?.content?.trim()
  if (!text) return null

  return {
    ...input.fallbackPacket,
    shouldSpeak: true,
    volley: text.replace(/^GEORGE:\s*/i, '').trim(),
    cue: '',
    status: `${input.fallbackPacket.status} LIVE reasoning applied.`,
    confidence: Math.max(input.fallbackPacket.confidence || 0, 0.82),
  }
}
