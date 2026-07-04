import OpenAI from 'openai'
import type { GeorgeRuntimePacket } from '../george/runtime-packet.js'
import { buildGroqLivePromptContract } from './live-prompt-contract.js'

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
    runtimeIntent: packet.runtimeIntent,
  })

  const { deliveryStyle, systemPrompt } = buildGroqLivePromptContract(packet)

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
          briefingKnowledge: packet.briefingKnowledge,
          secondaryOutcome: packet.secondaryOutcome,
          secondaryObjective: packet.secondaryObjective,
          intangibleObjective: packet.intangibleObjective,
          userPosition: packet.userPosition,
          localCue: packet.cue,
          reason: packet.reason,
          deliveryStyle,
          runtimeIntent: packet.runtimeIntent,
        }),
      },
    ],
  })

  const rawCue = response.choices[0]?.message?.content?.trim()
  const cue = rawCue || ''

  console.log('[LIVE HUB][groq] response', {
    deliveryStyle,
    cue,
    rawCue,
    suppressed: Boolean(rawCue && !cue),
    length: cue?.length || 0,
  })

  if (!cue) return null

  return {
    cue,
    source: 'groq',
    model,
  }
}
