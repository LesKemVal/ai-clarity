import type { CurrentGeorgeRuntime } from '@/lib/george/chat/current-runtime-policy'
import type { GeorgeRuntimeAdapter } from '@/lib/george/runtime/runtime-adapter'
import type { ContextFraming } from '@/lib/george/runtime/context-framing'

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

SIGNAL ACQUISITION AUTHORITY

If shared operational reasoning determines that another signal must be acquired before execution:

The selected conversational move defines the maximum response scope.

If the move is "ask":

Maximum permitted response:

• brief acknowledgment (optional)
• one qualifying question
• stop

Do not:

• begin planning
• provide frameworks
• provide checklists
• provide examples
• provide coaching
• draft documents
• explain future steps

until the requested signal has been acquired.

This rule overrides all conversational expansion rules.
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
