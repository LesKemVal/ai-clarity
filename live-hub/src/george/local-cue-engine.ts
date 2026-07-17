import type { LiveHubContext } from '../types/protocol.js'
import type { GeorgeLocalCue } from './cue-types.js'
import { matchCuePattern } from './cue-patterns.js'

function buildExecutionSafeCue(input: {
  matchedCue: GeorgeLocalCue
  deliveryStyle?: LiveHubContext['deliveryStyle']
  isFinal?: boolean
}): GeorgeLocalCue | null {
  if (input.matchedCue.category === 'stall') {
    return {
      ...input.matchedCue,
      cue: 'Pause.',
      reason: 'Execution-safe pacing support while canonical judgment is unavailable.',
      confidence: Math.max(input.matchedCue.confidence, 0.84),
      priority: Math.max(input.matchedCue.priority, 75),
    }
  }

  if (input.matchedCue.category === 'pressure') {
    return {
      ...input.matchedCue,
      cue: 'Slow down.',
      reason: 'Execution-safe pressure support while canonical judgment is unavailable.',
      confidence: Math.max(input.matchedCue.confidence, 0.8),
      priority: Math.max(input.matchedCue.priority, 85),
    }
  }

  if (
    input.isFinal &&
    input.deliveryStyle === 'continue'
  ) {