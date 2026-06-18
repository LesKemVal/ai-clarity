import type { LiveHubContext } from '../types/protocol.js'

export function resolveLocalCue(input: {
  transcript: string
  context: LiveHubContext
}): { cue: string; reason: string } | null {
  const text = input.transcript.trim()
  if (text.length < 8) return null

  const lower = text.toLowerCase()
  const objective = String(input.context.objective || '').toLowerCase()

  if (/\b(price|cost|budget|expensive|fee|valuation|money)\b/.test(lower)) {
    return {
      cue: objective.includes('close') ? 'Anchor value first.' : 'Ask for the number.',
      reason: 'Money pressure detected.',
    }
  }

  if (/\b(why|how|what do you mean|explain|clarify)\b/.test(lower)) {
    return {
      cue: 'Clarify before answering.',
      reason: 'Question pressure detected.',
    }
  }

  if (/\b(wait|hold on|not sure|i disagree|concern|problem)\b/.test(lower)) {
    return {
      cue: 'Slow the room.',
      reason: 'Friction detected.',
    }
  }

  return null
}
