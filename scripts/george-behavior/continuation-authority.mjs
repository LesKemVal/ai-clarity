import { finalizeGeorgeActionCueAuthority } from '../../lib/george/core/verification/action-cue-authority.ts'

export function run() {
  const actionCue = {
    turnId: 'behavior-continuation-authority',
    cue: '...whether this becomes an acquisition discussion.',
    reason: 'test unsupported continuation',
    source: 'groq',
    localCue: '',
    category: 'test',
    confidence: 0.9,
    priority: 1,
    at: Date.now(),
    evidence: {
      transcript: 'I understand your concern about timing, but I want to separate timeline from cost before I answer.',
      objective: 'close interest',
      deliveryStyle: 'continue',
    },
  }

  const finalized = finalizeGeorgeActionCueAuthority({
    actionCue,
    context: {
      objective: 'close interest',
      deliveryStyle: 'continue',
      knownContext: 'Customer asked about timing and cost.',
    },
  })

  if (finalized.cue.includes('acquisition')) {
    throw new Error('Unsupported acquisition claim survived.')
  }

  if (!finalized.cue.startsWith('...')) {
    throw new Error('Continuation trajectory was not preserved.')
  }

  return true
}
