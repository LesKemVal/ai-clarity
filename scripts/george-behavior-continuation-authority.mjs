import { finalizeGeorgeActionCueAuthority } from '../lib/george/core/verification/action-cue-authority.ts'

const actionCue = {
  turnId: 'behavior-test-continuation-authority',
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

console.log('\nFinalized cue:')
console.log(finalized.cue)

const failed = []

if (finalized.cue.includes('acquisition')) {
  failed.push('Unsupported acquisition claim survived.')
}

if (!finalized.cue.startsWith('...')) {
  failed.push('Continuation trajectory was not preserved.')
}

if (!/timing|cost|issue|clearly|separate|address/i.test(finalized.cue)) {
  failed.push('Repair did not stay close to available evidence.')
}

if (failed.length) {
  console.error('\nFAILED')
  for (const item of failed) console.error(`- ${item}`)
  process.exit(1)
}

console.log('\nPASSED: unsupported continuation was repaired before Delivery.')
