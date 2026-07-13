import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import type { GeorgeRuntimeAdapter } from '@/lib/george/runtime/runtime-adapter'
import type { ContextFraming } from '@/lib/george/runtime/context-framing'
import type { LiveSupportJudgment } from '@/lib/george/runtime/operational-judgment'

export type GeorgePresentationMode =
  | 'conversational'
  | 'operational'
  | 'tactical'
  | 'live'
  | 'cue_based'
  | 'compressed'

type Input = {
  runtime: CurrentGeorgeRuntime
  explicitRequest?: string | null
  voiceMode?: boolean
  runtimeAdapter?: GeorgeRuntimeAdapter | null
}


export type LiveRecommendationPresentation = {
  show: boolean
  title: 'LIVE Available'
  contextLabel: string
  receiverLabel: 'audio glasses' | 'visual glasses' | 'audio device' | 'display device' | 'configured device'
  message: string
}

export function resolveLiveRecommendationPresentation(input: {
  liveSupport: LiveSupportJudgment
  latestUserText: string
  voiceMode?: boolean
}): LiveRecommendationPresentation {
  const latestUserText = String(input.latestUserText || '').toLowerCase()
  const receiverLabel = resolveReceiverLabel(latestUserText, Boolean(input.voiceMode))
  const contextLabel = resolveExecutionContextLabel(latestUserText)
  const show = input.liveSupport.posture === 'recommend'

  return {
    show,
    title: 'LIVE Available',
    contextLabel,
    receiverLabel,
    message: show
      ? `${contextLabel} is imminent. LIVE is available through your ${receiverLabel} for discreet real-time support. We can continue here if you prefer.`
      : '',
  }
}

function resolveReceiverLabel(
  latestUserText: string,
  voiceMode: boolean
): LiveRecommendationPresentation['receiverLabel'] {
  if (/audio glasses|audio smart glasses|smart glasses with audio/.test(latestUserText)) {
    return 'audio glasses'
  }

  if (/visual glasses|text(?:-capable)? glasses|display glasses|heads-up display/.test(latestUserText)) {
    return 'visual glasses'
  }

  if (/earbuds?|earpieces?|headphones?|headset|listening device/.test(latestUserText) || voiceMode) {
    return 'audio device'
  }

  if (/display device|visual device|screen/.test(latestUserText)) {
    return 'display device'
  }

  return 'configured device'
}

function resolveExecutionContextLabel(latestUserText: string) {
  if (/interview/.test(latestUserText)) return 'Your interview'
  if (/presentation|pitch/.test(latestUserText)) return 'Your presentation'
  if (/negotiation/.test(latestUserText)) return 'Your negotiation'
  if (/call/.test(latestUserText)) return 'Your call'
  if (/meeting/.test(latestUserText)) return 'Your meeting'
  return 'Real-time execution'

}

export function buildLiveRecommendationPresentationNote(
  presentation: LiveRecommendationPresentation
) {
  if (!presentation.show) return ''

  return `
LIVE RECOMMENDATION PRESENTATION
- After Context Framing and before preparation guidance, render the heading: ${presentation.title}
- Under that heading, render exactly: ${presentation.message}
- Preserve the current situation context and continue with useful preparation after the notice.
- Do not auto-route, upsell, or replace the user's requested help.
- Do not name a specific device unless the receiver label supplied here names it.
`.trim()
}

export function enforceLiveRecommendationPresentation(input: {
  reply: string
  presentation: LiveRecommendationPresentation
  contextFraming?: ContextFraming | null
}) {
  const reply = String(input.reply || '').trim()
  const presentation = input.presentation

  if (!presentation.show || !reply) return reply
  if (/LIVE Available/i.test(reply) || /LIVE is (?:ready|available)/i.test(reply)) {
    return reply
  }

  const notice = `${presentation.title}
${presentation.message}`
  const framing = input.contextFraming

  if (!framing?.show || framing.items.length === 0) {
    return `${notice}

${reply}`.trim()
  }

  const lines = reply.split('\n')
  const headingIndex = lines.findIndex(
    (line) => line.trim().toLowerCase() === framing.title.toLowerCase()
  )

  if (headingIndex === -1) {
    return `${notice}

${reply}`.trim()
  }

  const labels = new Set(framing.items.map((item) => item.label.toLowerCase()))
  let insertAfter = headingIndex

  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line) continue

    const label = line.split(':', 1)[0]?.trim().toLowerCase()
    if (!label || !labels.has(label)) break
    insertAfter = index
  }

  lines.splice(insertAfter + 1, 0, '', notice, '')
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()

}

export function buildContextFramingPresentationNote(framing: ContextFraming) {
  if (!framing.show || framing.items.length === 0) return ''

  const resolvedContext = framing.items
    .map((item) => `- ${item.label}: ${item.value}`)
    .join('\n')

  if (framing.title === 'Current Situation') {
    return `
CONTEXT FRAMING — INTERNAL
${resolvedContext}
- Use this context to improve the answer, sequencing, and judgment.
- Do not render the heading or item labels to the user.
- Do not reproduce this as a briefing block or cue sheet.
- Respond naturally to the user's actual request.
- Preserve the resolved objective and constraints without exposing internal reasoning.
`.trim()
  }

  return `
CONTEXT FRAMING
- Begin the response with the heading: ${framing.title}
- Under that heading, render exactly these items in this order: ${framing.items.map((item) => item.label).join(', ')}.
${resolvedContext}
- Reproduce each item as the resolved situational statement provided.
- This framing presents the governing judgment; it must not add a competing recommendation.
- Do not expose internal reasoning, confidence calculations, evidence lists, or chain-of-thought.
- After the framing, continue with the useful guidance.
`.trim()
}

export function determinePresentationMode(input: Input): GeorgePresentationMode {
  const text = String(input.explicitRequest || '').toLowerCase()

  const explicitlyTactical =
    /exact wording|exact words|verbatim|cue me|feed me lines|give me a line|script|what should i say exactly|give me the exact line/.test(text)

  if (input.runtime === 'live_george') {
    if (input.voiceMode) return 'compressed'
    return explicitlyTactical ? 'cue_based' : 'live'
  }

  if (explicitlyTactical) {
    return 'tactical'
  }

  return 'conversational'
}

export function buildPresentationAuthorityNote(mode: GeorgePresentationMode) {
  if (mode === 'conversational') {
    return `
PRESENTATION AUTHORITY
- Presentation mode: conversational.
- This is normal GEORGE, not LIVE.
- Reason through what is happening and what matters before recommending action.
- Answer the user's actual question in natural prose before offering structure, steps, terms, or examples.
- Operational knowledge supports the reasoning; it must not appear as a retrieved playbook, consultant package, or prebuilt response.
- Do not default to headings or labels such as Target, Deliverables, Guardrails, Non-negotiables, Quick Moves, Meeting Flow, Immediate Focus, or Speakable Core.
- Do not default to checklists, numbered action plans, term sheets, option menus, or dense tactical packages unless the user explicitly asks for structured planning, a checklist, a document, terms, or exact execution steps.
- When structure is genuinely useful but was not explicitly requested, keep it light and subordinate to the explanation rather than making it the response.
- Do not expose tactical scaffolding.
- Do not use labels like Say, Backup, Cue, Need, Method, If wrong, Then, Use now, or Say this.
- Do not use bracketed delivery marks like [PAUSE].
- Do not use bullet-script formatting for normal GEORGE pressure questions.
- If the user asks “what do I say?” in normal GEORGE, answer naturally: explain the move and include one speakable sentence only if useful.
- Preserve pressure awareness internally, but render it as calm normal guidance.
- Do not apologize for missing context when the current request can be answered from available evidence. Ask for missing information only when it materially changes the answer.
`.trim()
  }

  if (mode === 'tactical') {
    return `
PRESENTATION AUTHORITY
- Presentation mode: tactical.
- The user explicitly asked for wording, script, or cue-like help.
- Exact lines are allowed.
- Keep it concise, but do not assume LIVE mode unless current runtime is LIVE.
`.trim()
  }

  return `
PRESENTATION AUTHORITY
- Presentation mode: ${mode}.
- LIVE-style tactical rendering is allowed only because the active mode or explicit request permits it.
`.trim()
}

export function enforcePresentationMode(reply: string, mode: GeorgePresentationMode) {
  if (mode !== 'conversational') return reply

  let clean = String(reply || '')

  clean = clean
    .replace(/\s*\[(PAUSE|CALM|PEER|SINCERE|LOWER VOLUME|INQUISITIVE|SOFTEN|LISTEN|HOLD)\]\s*/gi, ' ')
    .replace(/^\s*(Say|Backup|Cue|Need|Method|Then|Use now|Use this|Say this|If wrong|If you’re wrong|If you're wrong|If you’re right|If you're right)\s*:?\s*/gim, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const tacticalStructureStillVisible =
    /(^|\n)\s*(Say|Backup|Cue|Need|Method|Use now|Say this|If wrong)\s*:/i.test(clean) ||
    /\[(PAUSE|CALM|PEER|SINCERE|LOWER VOLUME|INQUISITIVE|SOFTEN|LISTEN|HOLD)\]/i.test(clean)

  if (tacticalStructureStillVisible) {
    clean = clean
      .replace(/(^|\n)\s*(Say|Backup|Cue|Need|Method|Use now|Say this|If wrong)\s*:/gi, '$1')
      .replace(/\[(PAUSE|CALM|PEER|SINCERE|LOWER VOLUME|INQUISITIVE|SOFTEN|LISTEN|HOLD)\]/gi, '')
      .trim()
  }

  return clean
}
