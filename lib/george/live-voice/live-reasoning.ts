import OpenAI from 'openai'
import type { LiveVoicePacket } from './types'
import type { LiveSupportStyle } from '../live-runtime/support-style'
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
  supportStyle?: LiveSupportStyle
  runtimeIntent?: string
  liveAssistMode?: 'cues' | 'lines'
  deliveryStyle?: string
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
    /\b(help|what do i say|asking|asked|questioning|challenged|dropped|declined|revenue|forecast|number|pressure|objection|concern|issue|take it|take this|you answer|answer for me|carry this)\b/i.test(transcript)
  )
}

function classifyResponseForm(text: string, fallback?: LiveVoicePacket['responseForm']): LiveVoicePacket['responseForm'] {
  const clean = text.trim()

  if (!clean) return fallback || 'silence'
  if (/\?$/.test(clean)) return 'question'
  if (/^(say|tell them|respond|answer):/i.test(clean)) return 'line'
  if (/\b(use|lead with|start with|keep|pause|wait|hold|ask|state|frame|focus)\b/i.test(clean)) return 'direction'
  if (clean.split(/\s+/).length <= 8) return 'cue'

  return fallback || 'direction'
}

function looksLikeRepeatedSignal(input: LiveReasoningInput) {
  const transcript = compact(input.transcript, 240)
  const clean = transcript.toLowerCase()
  const words = clean.split(/\s+/).filter(Boolean)

  if (!clean) return false

  const shortSignal =
    words.length <= 7 &&
    /leadership|experience|forecast|assumption|numbers|offer|price|terms|objection|concern|travel|winter|salary|compensation|timeline|budget|risk|methodology|deadline/.test(clean)

  const repeatedQuestion =
    /\?$/.test(transcript) ||
    /^(so )?(you'?re asking|they asked|the question is|about|regarding)\b/i.test(clean)

  const signalRepairPrompted =
    /Signal acquisition move|repeat .*question|repeat .*signal|repeat .*concern|I'm listening|im listening/i.test(
      [
        input.fallbackPacket.status,
        input.fallbackPacket.cue,
        input.fallbackPacket.volley,
        input.shadowMap,
      ].join(' ')
    )

  return signalRepairPrompted && (shortSignal || repeatedQuestion)
}

function shouldCarryTurn(input: LiveReasoningInput) {
  const combined = [
    input.transcript,
    input.lastFiveSeconds,
  ].join(' ').toLowerCase()

  return (
    /\b(george[,\s]+take it|take it george|take this|you answer|answer for me|carry this|speak for me|give them the answer|handle this)\b/i.test(combined) ||
    looksLikeRepeatedSignal(input)
  )
}

function isContinuationReasoning(input: LiveReasoningInput) {
  const transcript = compact(input.transcript, 500)
  const fallback = input.fallbackPacket

  return (
    fallback.speakerIntent === 'assisted_continuation' ||
    /(?:\.{3}|…)+$/.test(transcript)
  )
}


function violatesContinuationAuthority(volley: string) {
  const clean = String(volley || '').trim()
  if (!clean) return true

  const strategicOverreach =
    /\b(plan|mitigate|execution risk|scale effectively|demonstrate|prove|projected opportunity|strategy|structure|valuation|shares?|equity|ownership|percent|percentage|terms?|commitment)\b/i.test(clean)

  const unsupportedNumber =
    /\b\d+(?:\.\d+)?\s*(?:%|percent|shares?|months?|years?|dollars?|\$)\b/i.test(clean)

  return strategicOverreach || unsupportedNumber
}

export async function reasonLiveNextMove(input: LiveReasoningInput): Promise<LiveVoicePacket | null> {
  if (!shouldUseReasoning(input)) return null

  const carryTurn = shouldCarryTurn(input)
  const continuationReasoning = isContinuationReasoning(input)

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
  const deliveryStyle = input.deliveryStyle || input.fallbackPacket.deliveryStyle || ''
  const mode = continuationReasoning
    ? 'continuation'
    : deliveryStyle === 'response'
      ? 'response'
      : deliveryStyle === 'expandedLine'
        ? 'presentation'
        : input.liveAssistMode === 'lines'
          ? 'repeatable line'
          : 'cue'
  const perspective = carryTurn ? 'carry_turn_as_user' : 'assist_user'

  const system = `
You are GEORGE in LIVE mode.

GEORGE is an intelligently adaptable utility.
OpenAI provides reasoning. GEORGE runtime controls timing, restraint, delivery, and user agency.

Your job:
- Read the room signal.
- Use the transcript, room, recent memory, and objective context.
- Give the next useful LIVE response.
- Say what is most likely to help the user accomplish the preferred or requested outcome.
- Optimize for short, usable sentences when brevity best serves the chosen support mode.

Intervention Type:
${continuationReasoning
  ? '- CONTINUATION. The user intentionally requested help completing an unfinished thought. Complete the user\'s sentence fragment. Preserve natural grammar, immediate trajectory, and user agency. In continuation mode, objective and room context may shape tone but are not evidence by themselves. Do not create facts, numbers, percentages, valuations, ownership terms, commitments, or claims not already supported by the transcript, recent room memory, known context, or user fragment. If a missing specific is required to preserve the thought, use a natural user-fillable placeholder such as "__". Do not turn the sentence into a template. Do not coach. Do not redirect. Do not explain. Return only the continuation fragment, starting with "...".'
  : mode === 'response'
    ? '- RESPONSE. The user selected Response mode. Provide a complete usable answer to the question, objection, pressure, or unfamiliar topic. Complete means sufficient for the moment, not unnecessarily long. Do not reduce it to a cue unless the room requires restraint.'
    : mode === 'presentation'
      ? '- PRESENTATION. The user selected Presentation mode. Help the user deliver the point with structure, sequence, flow, proof, pacing, or recovery. This may be concise if concise structure is strongest. Do not merely make Response longer; organize the delivery.'
      : '- CUE. The user selected Cue mode. Provide the most useful short intervention for the situation. This may be a cue, brief advice, steering signal, risk signal, or recovery cue.'}

Signal Sufficiency:
${signalDirective}

Speaker Perspective:
${carryTurn
  ? '- The user has delegated the next conversational turn to GEORGE. Answer as the user in first person. Do not say "say", "ask", "question", or explain the move. Recognize whether the other party asked a question, made a statement, raised a concern, or challenged the user, then respond as the user would for this turn.'
  : '- GEORGE is assisting the user. Provide a cue, direction, or repeatable line as appropriate. Do not pretend to be the user unless transfer is requested.'}

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
- Do NOT ask for more information unless a critical variable materially improves the next move.
- Give the user the next move.
- If the transcript already contains the question, do not ask for the question again.
- Recover the missing operational variable instead.
- If enough signal exists, give the next useful words or move.
- Keep it short enough for live use unless the selected mode requires more structure.
- Do not explain your reasoning.
- Do not sound like a therapist, chatbot, teacher, or helpdesk.
- Preserve user agency.
- Output only the line GEORGE should give.
${continuationReasoning
  ? '- Continuation completion test: user fragment + GEORGE fragment must form one complete, natural sentence.'
  : ''}
`.trim()

  const user = `
Room: ${room}
Desired outcome: ${desiredOutcome || 'unknown'}
Active outcome: ${activeOutcome || 'infer from current signal'}
Support style: ${mode}
Runtime intent: ${input.runtimeIntent || input.fallbackPacket.runtimeIntent || 'unknown'}
Intervention type: ${continuationReasoning ? 'continuation' : mode}
Speaker perspective: ${perspective}
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

${continuationReasoning
  ? 'Continuation requirement: complete the user fragment grammatically. Start with "...". Use supported specifics only. Objective and room context are not enough to invent details. When a missing value is necessary, leave a simple "__" placeholder while preserving conversational flow. Do not give advice, labels, strategy, or coaching language.'
  : ''}

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
    max_tokens: carryTurn ? 120 : 80,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })

  const text = completion.choices?.[0]?.message?.content?.trim()
  if (!text) return null

  let volley = text.replace(/^GEORGE:\s*/i, '').trim()

  if (
    continuationReasoning &&
    violatesContinuationAuthority(volley) &&
    input.fallbackPacket.volley
  ) {
    volley = input.fallbackPacket.volley
  }

  const responseForm = continuationReasoning
    ? 'line'
    : carryTurn
      ? 'line'
      : classifyResponseForm(volley, input.fallbackPacket.responseForm)
  const transferReady =
    !carryTurn &&
    sufficiency.sufficient &&
    (responseForm === 'line' || responseForm === 'direction')

  return {
    ...input.fallbackPacket,
    shouldSpeak: true,
    volley,
    cue: '',
    responseForm,
    responsePerspective: perspective,
    transferReady,
    status: `${input.fallbackPacket.status} LIVE reasoning applied.${carryTurn ? ' Carry-turn perspective active.' : ''}${continuationReasoning ? ' Continuation reasoning active.' : ''}`,
    confidence: Math.max(input.fallbackPacket.confidence || 0, carryTurn ? 0.86 : 0.82),
  }
}
