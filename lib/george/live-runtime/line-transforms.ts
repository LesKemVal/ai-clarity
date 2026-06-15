export function compressLiveLine(line: string) {
  const clean = String(line || '').replace(/\s+/g, ' ').trim()
  if (!clean) return ''

  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (sentences.length > 1) {
    return sentences[0]
  }

  const words = clean.split(/\s+/)
  if (words.length <= 14) return clean

  return `${words.slice(0, 14).join(' ')}.`
}
