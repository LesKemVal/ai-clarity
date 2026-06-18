import type { LiveHubContext } from '../types/protocol.js'
import type { GeorgeLocalCue } from './cue-types.js'
import { matchCuePattern } from './cue-patterns.js'

export function resolveLocalCue(input: {
  transcript: string
  context: LiveHubContext
}): GeorgeLocalCue | null {
  const text = input.transcript.trim()
  if (text.length < 8) return null

  const cue = matchCuePattern(text)
  if (!cue) return null

  const objective = String(input.context.objective || '').toLowerCase()

  if (cue.category === 'pricing' && objective.includes('close')) {
    return {
      ...cue,
      cue: 'Anchor value first.',
      confidence: Math.max(cue.confidence, 0.9),
    }
  }

  return cue
}
