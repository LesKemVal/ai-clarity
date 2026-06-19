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
  if (!groq) {
    console.warn('[LIVE HUB][groq] missing GROQ_API_KEY')
    return null
  }

  const model = process.env.GROQ_FAST_MODEL || 'llama-3.1-8b-instant'

  console.log('[LIVE HUB][groq] request', {
    model,
    signal: packet.signal,
    cue: packet.cue,
  })

  const deliveryStyle = packet.deliveryStyle || 'cue'

  const systemPrompt =
    deliveryStyle === 'continue'
      ? 'You are GEORGE LIVE. Continue the user sentence naturally. Return one concise continuation only. No explanation.'
      : deliveryStyle === 'line'
        ? 'You are GEORGE LIVE. Return one sentence the user can say aloud. No explanation.'
        : deliveryStyle === 'advice'
          ? 'You are GEORGE LIVE. Return one concise tactical instruction. No explanation.'
          : deliveryStyle === 'silent'
            ? 'You are GEORGE LIVE. Return exactly SILENT.'
            : 'You are GEORGE LIVE. Return exactly 2 to 4 words. No punctuation unless necessary. Give a tactical cue, not an explanation.'

  const response = await groq.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: deliveryStyle === 'cue' ? 12 : 32,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
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
          deliveryStyle,
        }),
      },
    ],
  })

  const cue = response.choices[0]?.message?.content?.trim()
  console.log('[LIVE HUB][groq] response', { cue })

  if (!cue) return null

  return {
    cue,
    source: 'groq',
    model,
  }
}
