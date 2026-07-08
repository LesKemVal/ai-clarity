export type LiveSpokenMemoryState = {
  lastSpokenLine: string
  recentSpokenLines: string[]
}

export function rememberLiveSpokenLine(params: {
  line: string
  previousRecentLines?: string[]
  limit?: number
}): LiveSpokenMemoryState {
  const line = String(params.line || '').trim()
  const previous = Array.isArray(params.previousRecentLines)
    ? params.previousRecentLines
    : []
  const limit = Math.max(1, params.limit || 8)

  if (!line) {
    return {
      lastSpokenLine: '',
      recentSpokenLines: previous.slice(-limit),
    }
  }

  return {
    lastSpokenLine: line,
    recentSpokenLines: [...previous, line].slice(-limit),
  }
}


export function currentLiveSpokenSentence(params: {
  lastSpokenLine?: string
}) {
  const line = String(params.lastSpokenLine || '').replace(/\s+/g, ' ').trim()
  if (!line) return ''

  const sentences = line
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  return sentences.at(-1) || line
}
