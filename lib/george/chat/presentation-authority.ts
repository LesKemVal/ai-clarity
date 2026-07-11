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

  return `
CONTEXT FRAMING
- Begin the response with the heading: ${framing.title}
- Under that heading, render exactly these items in this order: ${framing.items.map((item) => item.label).join(', ')}.
${framing.items.map((item) => `- ${item.label}: ${item.focus}`).join('\n')}
- Keep each item to one concise sentence grounded in the user's actual situation.
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
- Do not expose tactical scaffolding.
- Do not use labels like Say, Backup, Cue, Need, Method, If wrong, Then, Use now, or Say this.
- Do not use bracketed delivery marks like [PAUSE].
- Do not use bullet-script formatting for normal GEORGE pressure questions.
- If the user asks “what do I say?” in normal GEORGE, answer naturally: explain the move and include one speakable sentence only if useful.
- Preserve pressure awareness internally, but render it as calm normal guidance.
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
