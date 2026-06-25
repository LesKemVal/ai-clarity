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
    outcomeImpact: packet.outcomeImpact,
    supportStrategy: packet.supportStrategy,
    cue: packet.cue,
    deliveryStyle: packet.deliveryStyle,
  })

  const deliveryStyle = packet.deliveryStyle || 'cue'

  const operationalContextPrompt =
    packet.obstacle || packet.outcomeImpact || packet.supportStrategy
      ? ' Operational context may guide relevance, but do not invent facts. Support the desired outcome while preserving user agency.'
      : ''

  const modeContract =
    deliveryStyle === 'continue'
      ? 'CONTINUATION CONTRACT: Continue only the unfinished thought in the transcript. Start with "...". Do not answer, advise, explain, or introduce new facts, numbers, valuation, ownership, terms, promises, markets, returns, or claims. If a specific value is missing, use "__".'
      : deliveryStyle === 'expandedLine'
        ? 'PRESENTATION CONTRACT: Return a structured spoken presentation. Use exactly 4 short lines. Each line should advance the users point. Do not describe the room, role, or metadata. Do not invent facts, numbers, valuation, ownership, returns, terms, market claims, or commitments. Use only transcript and known context. If a needed fact is missing, use "__".'
        : deliveryStyle === 'response'
          ? 'RESPONSE CONTRACT: Return a complete answer the user can say aloud. Use 2 to 4 concise sentences. Directly answer the question in the transcript. Do not describe the room, role, or metadata. Do not give meta-advice like "start by" or "ask them". Do not invent facts, numbers, valuation, ownership, returns, terms, market claims, or commitments. If a needed fact is missing, use "__" or say what is known.'
          : deliveryStyle === 'line'
            ? 'LINE CONTRACT: Return one sentence the user can say aloud. No coaching language.'
            : deliveryStyle === 'advice'
              ? 'CUE CONTRACT: Return one concise tactical instruction only. 3 to 8 words. No explanation.'
              : deliveryStyle === 'silent'
                ? 'SILENT CONTRACT: Return exactly SILENT.'
                : 'CUE CONTRACT: Return one concise tactical cue only. 3 to 8 words. No explanation.'

  const contextContract = 'The transcript is the primary source. Use room, chair, objective, knownContext, secondaryOutcome, secondaryObjective, intangibleObjective, and userPosition only to interpret what the user is trying to say or answer. Do not repeat room metadata such as "I am the CEO" or "we are in a live setting" unless the transcript itself asks for that. Do not default to generic business, startup, investor, sales, or consulting language. If context is thin, stay neutral and specific to the transcript.'

  const systemPrompt = `You are GEORGE LIVE. ${contextContract} ${modeContract}${operationalContextPrompt}`

  const response = await groq.chat.completions.create({
    model,
    temperature: deliveryStyle === 'continue' ? 0.05 : 0.18,
    max_tokens:
      deliveryStyle === 'cue' || deliveryStyle === 'advice'
        ? 16
        : deliveryStyle === 'continue'
          ? 64
          : deliveryStyle === 'response'
            ? 140
            : deliveryStyle === 'expandedLine'
              ? 220
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
          outcomeImpact: packet.outcomeImpact,
          supportStrategy: packet.supportStrategy,
          pressure: packet.pressure,
          objective: packet.objective,
          room: packet.room,
          chair: packet.chair,
          knownContext: packet.knownContext,
          secondaryOutcome: packet.secondaryOutcome,
          secondaryObjective: packet.secondaryObjective,
          intangibleObjective: packet.intangibleObjective,
          userPosition: packet.userPosition,
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
