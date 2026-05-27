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

function splitUsefulLines(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function asksForWords(text: string) {
  return /what do i say|what should i say|how do i respond|how should i respond|what's my response|whats my response/i.test(text)
}

function looksLikeDisconnectedLineSet(text: string) {
  const lines = splitUsefulLines(text)
  if (lines.length < 3) return false

  const shortOperationalLines = lines.filter((line) => line.length >= 18 && line.length <= 260)
  const hasMultipleQuotedOrPlaceholderLines = lines.filter((line) => /[“"].+[”"]|\[[^\]]+\]/.test(line)).length >= 2
  const hasFallbackCadence = /\b(if|when|then|otherwise|after that|from there)\b/i.test(lines.slice(1).join(' '))

  return shortOperationalLines.length >= 3 || hasMultipleQuotedOrPlaceholderLines || hasFallbackCadence
}

function extractFirstSpeakableLine(text: string) {
  const quoted = text.match(/[“"][^”"]{12,240}[”"]/)?.[0]
  if (quoted) return quoted

  const line = splitUsefulLines(text).find((item) => item.length >= 20 && item.length <= 260)
  return line || ''
}

function buildConversationalBridge(reply: string) {
  const firstLine = extractFirstSpeakableLine(reply)
  if (!firstLine) return reply

  const cleanLine = firstLine.replace(/^\s*[-•]\s*/, '').trim()

  return `Start by slowing the room down and identifying what they are challenging: source, timeframe, or assumption. You can say: ${cleanLine}

That keeps you from defending blindly. After that, compare the two numbers side by side and anchor the conversation to method, not ego. If you catch an error, own it cleanly and state whether it changes the decision.`
}

export function renderOperationalExcellenceOutput(input: Input) {
  if (input.presentationMode !== 'conversational') {
    return normalizeWhitespace(input.reply)
  }

  const clean = stripLiveScaffolding(input.reply)
  const shouldBridge = asksForWords(input.latestUserText.toLowerCase()) && looksLikeDisconnectedLineSet(clean)

  if (shouldBridge) {
    return normalizeWhitespace(buildConversationalBridge(clean))
  }

  return normalizeWhitespace(clean)
}


// Backward-compatible alias until all callers are migrated.
export const renderEliteGeorgeOutput = renderOperationalExcellenceOutput
