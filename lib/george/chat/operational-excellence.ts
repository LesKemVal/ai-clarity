import type { GeorgePresentationMode } from '@/lib/george/chat/presentation-authority'

type Input = {
  reply: string
  presentationMode: GeorgePresentationMode
  latestUserText: string
}

function normalizeWhitespace(text: string) {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function stripLiveScaffolding(text: string) {
  return text
    .replace(/\s*\[(PAUSE|CALM|PEER|SINCERE|LOWER VOLUME|INQUISITIVE|SOFTEN|LISTEN|HOLD)\]\s*/gi, ' ')
    .replace(/^\s*(Say|Backup|Cue|Need|Method|Then|Use now|Use this|Say this|If wrong|If you’re wrong|If you're wrong|If you’re right|If you're right)\s*:?\s*/gim, '')
    .replace(/^\s*[-•]\s+/gm, '')
}

function needsBridgeLanguage(text: string) {
  const lines = text
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean)

  if (lines.length < 2) return false

  return lines.every(
    (line) =>
      line.length < 220 &&
      !/[.!?]/.test(line.slice(0, Math.min(line.length, 50)))
  )
}

function buildBridge(reply: string) {
  const quoted =
    reply.match(/[“"][^”"]{12,240}[”"]/)?.[0]

  if (!quoted) return reply

  return `Start by slowing the room down and locating the disagreement. ${quoted}

That keeps the conversation grounded instead of defensive. Compare source, timeframe, and assumptions before arguing conclusions.`
}

export function renderEliteGeorgeOutput(input: Input) {
  if (input.presentationMode !== 'conversational') {
    return normalizeWhitespace(input.reply)
  }

  const asksForWords =
    /what do i say|what should i say|how do i respond|how should i respond|what's my response|whats my response/i.test(
      input.latestUserText.toLowerCase()
    )

  let clean = stripLiveScaffolding(input.reply)

  if (asksForWords && needsBridgeLanguage(clean)) {
    clean = buildBridge(clean)
  }

  return normalizeWhitespace(clean)
}
