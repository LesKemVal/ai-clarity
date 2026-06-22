import OpenAI from 'openai'
import type { GeorgeRuntimePacket } from '../george/runtime-packet.js'

function createGroqClient() {
  const groqApiKey = process.env.GROQ_API_KEY || ''

  return groqApiKey
    ? new OpenAI({
        apiKey: groqApiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      })
    : null
}

export async function resolveGroqFastCue(packet: GeorgeRuntimePacket): Promise<{
  cue: string
  source: 'groq'
  model: string
} | null> {
  const groq = createGroqClient()

  if (!groq) {
    console.warn('[LIVE HUB][groq] missing GROQ_API_KEY')
    return null
  }

  const model = process.env.GROQ_FAST_MODEL || 'llama-3.1-8b-instant'

  console.log('[LIVE HUB][groq] request', {
    model,
    signal: packet.signal,
    obstacle: packet.obstacle,
    supportStrategy: packet.supportStrategy,
    cue: packet.cue,
    deliveryStyle: packet.deliveryStyle,
  })

  const deliveryStyle = packet.deliveryStyle || 'cue'

  const systemPrompt =
    deliveryStyle === 'continue'
      ? 'You are GEORGE LIVE. Continue the user sentence naturally. Return one concise continuation only. No explanation.'
      : deliveryStyle === 'expandedLine'
        ? 'You are GEORGE LIVE. Return a strong 2 to 4 sentence response the user can say aloud. Make it practical, calm, and outcome-oriented. No preface.'
        : deliveryStyle === 'response'
          ? 'You are GEORGE LIVE. Return 2 to 4 concise sentences the user can say aloud. Make it useful in the room. No preface.'
          : deliveryStyle === 'line'
            ? 'You are GEORGE LIVE. Return one sentence the user can say aloud. No explanation.'
            : deliveryStyle === 'advice'
              ? 'You are GEORGE LIVE. Return one concise tactical instruction. No explanation.'
              : deliveryStyle === 'silent'
                ? 'You are GEORGE LIVE. Return exactly SILENT.'
                : 'You are GEORGE LIVE. Return exactly 3 to 8 words. No punctuation unless necessary. Give a tactical cue, not an explanation.'

  const response = await groq.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens:
      deliveryStyle === 'cue'
        ? 16
        : deliveryStyle === 'response'
          ? 96
          : deliveryStyle === 'expandedLine'
            ? 160
            : 40,
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
          operationalSignal: packet.operationalSignal,
          obstacle: packet.obstacle,
          supportStrategy: packet.supportStrategy,
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
  console.log('[LIVE HUB][groq] response', {
    deliveryStyle,
    cue,
    length: cue?.length || 0,
  })

  if (!cue) return null

  return {
    cue,
    source: 'groq',
    model,
  }
}
