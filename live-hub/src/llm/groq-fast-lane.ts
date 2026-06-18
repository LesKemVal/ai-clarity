import OpenAI from 'openai'
import type { GeorgeRuntimePacket } from '../george/runtime-packet.js'

const groqApiKey = process.env.GROQ_API_KEY || ''

const groq = groqApiKey
  ? new OpenAI({
      apiKey: groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  : null

export async function resolveGroqFastCue(packet: GeorgeRuntimePacket): Promise<{
  cue: string
  source: 'groq'
  model: string
} | null> {
  if (!groq) return null

  const model = process.env.GROQ_FAST_MODEL || 'llama-3.1-8b-instant'

  const response = await groq.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 12,
    messages: [
      {
        role: 'system',
        content:
          'You are GEORGE LIVE. Return exactly 2 to 4 words. No punctuation unless necessary. Give a tactical cue, not an explanation.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          transcript: packet.transcript,
          signal: packet.signal,
          pressure: packet.pressure,
          objective: packet.objective,
          localCue: packet.cue,
          reason: packet.reason,
        }),
      },
    ],
  })

  const cue = response.choices[0]?.message?.content?.trim()
  if (!cue) return null

  return {
    cue,
    source: 'groq',
    model,
  }
}
