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

function isResponseStyle(packet: GeorgeRuntimePacket) {
  return (packet.deliveryStyle || 'cue') === 'response'
}

function violatesResponseOutcomeContract(cue: string) {
  const clean = cue.toLowerCase()

  return (
    /\b(i am|i'm)\s+(george|george live|an ai|a conversational ai)\b/i.test(cue) ||
    /\b(ai assistant|conversational ai|virtual assistant)\b/i.test(clean) ||
    /\b(as an ai|i can help|i am here to)\b/i.test(clean)
  )
}

function repairResponseCandidate(packet: GeorgeRuntimePacket, cue: string) {
  if (!isResponseStyle(packet)) return cue
  if (!violatesResponseOutcomeContract(cue)) return cue

  const transcript = String(packet.transcript || '').toLowerCase()
  const knownContext = [
    packet.knownContext,
    packet.briefingKnowledge,
    packet.objective,
    packet.userPosition,
    packet.room,
  ].join(' ').toLowerCase()

  if (/\bwhat is george\b|\bmore than another ai assistant\b|\bai assistant\b/.test(transcript)) {
    if (/investor|venture|capital|founder|lead investment|category/i.test(knownContext)) {
      return 'GEORGE is operational intelligence: it helps people prepare for, perform in, and learn from high-stakes conversations where timing, judgment, and communication affect the outcome. It is more than another AI assistant because the value is not just generating answers; it is the runtime loop of preparation, live support, outcome review, and reusable learning that improves execution over time.'
    }

    return 'GEORGE is operational intelligence. It helps people prepare, communicate, decide, and execute better in important moments, then uses what happened to improve future preparation.'
  }

  return ''
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

  const deliveryStyle = packet.deliveryStyle || 'cue'

  const operationalContextPrompt =
    packet.obstacle || packet.outcomeImpact || packet.supportStrategy
      ? ' Operational context may guide relevance, but do not invent facts. Support the desired outcome while preserving user agency.'
      : ''

  const personaContract = 'Never speak as an AI assistant. Never say "I am here to", "as an AI", "I can help", or explain your capabilities. Output only words the user could say or use immediately in the room.'

  const intentContract = `Runtime intent: ${packet.runtimeIntent}. Obey this intent over generic language habits. If runtimeIntent is OBJECTION_RESPONSE or ANSWER_QUESTION, directly answer the spoken question. If runtimeIntent is PRESENTATION_CONTINUATION, continue the presentation. If runtimeIntent is CONTINUE_THOUGHT, only continue the unfinished thought.`

  const hierarchyContract = 'The transcript is the newest operational signal. Treat it as direct evidence of what was just said, but reason from the full available signal set: transcript, recentTranscript, room, chair, objective, knownContext, briefingKnowledge, userPosition, operationalSignal, obstacle, outcomeImpact, supportStrategy, and secondary/intangible objectives. If the transcript is the only reliable signal available, reason from it alone.'

  const modeContract =
    deliveryStyle === 'continue'
      ? 'CONTINUATION CONTRACT: Continue only the unfinished thought in the transcript. Start with "...". Do not answer, advise, explain, ask a question, restart the sentence, or introduce new facts. BAD: "Ask what changed." GOOD: "...whether this becomes an investment conversation or a strategic partnership conversation."'
      : deliveryStyle === 'expandedLine'
        ? 'PRESENTATION CONTRACT: Treat the transcript as the start of a spoken presentation and continue it. Return exactly 4 short spoken lines. Do not say "Here is", "Let us break it down", "structured presentation", or use numbered lists. Do not describe room, role, metadata, or system context.'
        : deliveryStyle === 'response'
          ? 'RESPONSE CONTRACT: Directly answer the question in the transcript. Use 2 to 4 concise sentences the user can say aloud. Do not ask another question unless the transcript explicitly asks for clarification. Do not coach. Do not say "start by", "ask them", "I am here to", or describe metadata. BAD: "I am here to provide information." GOOD: "They should believe us because we can show the problem clearly, explain why our approach is different, and support each claim with evidence."'
          : deliveryStyle === 'line'
            ? 'LINE CONTRACT: Return one sentence the user can say aloud. No coaching language, no metadata.'
            : deliveryStyle === 'advice'
              ? 'CUE CONTRACT: Return one concise tactical instruction only. 3 to 8 words. No explanation, no question, no complete answer.'
              : deliveryStyle === 'silent'
                ? 'SILENT CONTRACT: Return exactly SILENT.'
                : 'CUE CONTRACT: Return one concise tactical cue only. 3 to 8 words. No explanation.'

  const contextContract = 'The transcript is the primary source. Use room, chair, objective, knownContext, secondaryOutcome, secondaryObjective, intangibleObjective, and userPosition only to interpret what the user is trying to say or answer. Do not repeat room metadata such as "I am the CEO" or "we are in a live setting" unless the transcript itself asks for that. Do not default to generic business, startup, investor, sales, or consulting language. If context is thin, stay neutral and specific to the transcript.'

  const systemPrompt = `You are GEORGE LIVE. ${personaContract} ${intentContract} ${hierarchyContract} ${contextContract} ${modeContract}${operationalContextPrompt}`

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
  const cue = rawCue ? repairResponseCandidate(packet, rawCue) : ''

  console.log('[LIVE HUB][groq] response', {
    deliveryStyle,
    cue,
    rawCue,
    repaired: Boolean(rawCue && cue && cue !== rawCue),
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
