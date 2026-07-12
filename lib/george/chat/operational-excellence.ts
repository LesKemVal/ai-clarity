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
    .replace(/^\s*(Current Situation|LIVE Available)\s*$/gim, '')
    .replace(/^\s*(Objective|Pressure|Priority|Unknown|Avoid|Strong path|Meeting flow|Quick signal|Leverage question)\s*:\s*/gim, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
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

function buildConversationalBridge(reply: string, latestUserText: string) {
  const firstLine = extractFirstSpeakableLine(reply)
  if (!firstLine) return reply

  const cleanLine = firstLine.replace(/^\s*[-•]\s*/, '').trim()
  const context = latestUserText.toLowerCase()

  if (/number|metric|forecast|revenue|calculation|data|assumption|figure/.test(context)) {
    return `Start by clarifying what is actually being challenged: the source, timeframe, or assumption. You can say: ${cleanLine}

That keeps the exchange grounded in method rather than defensiveness. Compare the underlying facts, correct anything that is wrong, and state clearly whether it changes the decision.`
  }

  if (/apolog|conflict|hurt|upset|angry|relationship|difficult conversation/.test(context)) {
    return `Start by acknowledging the human reality without surrendering your point. You can say: ${cleanLine}

Then pause long enough for the other person to respond. Keep the next move focused on understanding, repair, or a clear boundary rather than trying to win the entire conversation at once.`
  }

  if (/interview|investor|negotiat|meeting|call|presentation|pitch|objection/.test(context)) {
    return `Start with the point that most directly advances the outcome. You can say: ${cleanLine}

Then listen for what they are actually testing before adding more. Respond to that signal with evidence, a concise explanation, or one clear next step.`
  }

  return `Start with the clearest version of the point. You can say: ${cleanLine}

Then let the response tell you what matters next. Keep the conversation natural, answer what is actually being asked, and avoid adding more than the moment needs.`
}

export function renderOperationalExcellenceOutput(input: Input) {
  if (input.presentationMode !== 'conversational') {
    return normalizeWhitespace(input.reply)
  }

  const clean = stripLiveScaffolding(input.reply)
  const shouldBridge = asksForWords(input.latestUserText.toLowerCase()) && looksLikeDisconnectedLineSet(clean)

  if (shouldBridge) {
    return normalizeWhitespace(buildConversationalBridge(clean, input.latestUserText))
  }

  return normalizeWhitespace(clean)
}


// Backward-compatible alias until all callers are migrated.
export const renderEliteGeorgeOutput = renderOperationalExcellenceOutput
