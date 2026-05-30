import OpenAI from 'openai'
import type { LiveVoicePacket } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type LiveReasoningInput = {
  transcript: string
  room?: string
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

  const room = compact(input.room || 'Adaptive LIVE', 80)
  const transcript = compact(input.transcript, 900)
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

Rules:
- If enough signal exists, give the user the next useful words or move.
- If one critical signal is missing, ask for the smallest missing signal.
- Do not use canned room questions when the signal already answers them.
- Keep it short enough for live use.
- Do not explain your reasoning.
- Do not sound like a therapist, chatbot, teacher, or helpdesk.
- Preserve user agency.
- Output only the line GEORGE should give.
`.trim()

  const user = `
Room: ${room}
Assist mode: ${mode}
Last signal: ${lastFiveSeconds}
Transcript: ${transcript}
Recent room memory: ${shadowMap || 'none'}
Fallback status: ${input.fallbackPacket.status}
Fallback volley: ${input.fallbackPacket.volley}
Fallback cue: ${input.fallbackPacket.cue}

Return the best next LIVE response now.
`.trim()

  const model =
    process.env.OPENAI_MODEL_LIVE ||
    process.env.OPENAI_MODEL_BRILLIANT ||
    process.env.OPENAI_MODEL_INTELLIGENT ||
    'gpt-4o-mini'

  const completion = await openai.chat.completions.create({
    model,
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
