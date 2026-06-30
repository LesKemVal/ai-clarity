const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'for', 'from', 'help', 'i',
  'in', 'me', 'my', 'of', 'on', 'or', 'prepare', 'the', 'to', 'with',
])

function normalizeWords(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
}

function overlapScore(a = [], b = []) {
  if (!a.length || !b.length) return 0
  const left = new Set(a)
  const right = new Set(b)
  let overlap = 0

  for (const item of left) {
    if (right.has(item)) overlap += 1
  }

  return overlap / Math.max(left.size, right.size)
}

export function scoreConversationPackage(input, candidate) {
  const objectiveScore = overlapScore(
    normalizeWords(input?.desiredOutcome),
    normalizeWords(candidate?.desiredOutcome)
  )

  const contextScore = overlapScore(
    normalizeWords(input?.conversationContext),
    normalizeWords(candidate?.conversationContext)
  )

  const documentScore = overlapScore(
    normalizeWords((input?.relevantDocumentation || []).join(' ')),
    normalizeWords((candidate?.relevantDocumentation || []).join(' '))
  )

  const typeScore =
    input?.conversationType &&
    candidate?.conversationType &&
    String(input.conversationType).toLowerCase() === String(candidate.conversationType).toLowerCase()
      ? 0.2
      : 0

  return Math.min(
    1,
    Number((objectiveScore * 0.46 + contextScore * 0.24 + documentScore * 0.16 + typeScore).toFixed(3))
  )
}

export function identifyConversationPackage(input, candidates = []) {
  const scored = candidates
    .map((candidate) => ({
      candidate,
      score: scoreConversationPackage(input, candidate),
    }))
    .sort((a, b) => b.score - a.score)

  const best = scored[0] || null

  if (!best || best.score < 0.34) {
    return {
      decision: 'new_conversation_package',
      score: best?.score || 0,
      candidate: best?.candidate || null,
    }
  }

  if (best.score >= 0.55) {
    return {
      decision: 'continue_existing_conversation_package',
      score: best.score,
      candidate: best.candidate,
    }
  }

  return {
    decision: 'ask_user_to_confirm_related_conversation',
    score: best.score,
    candidate: best.candidate,
  }
}
