import assert from 'node:assert/strict'
import { evaluateContinuationCandidate } from '../../lib/george/live-voice/runtime/continuation-intelligence.ts'
import { generateContinuation } from '../../lib/george/live-voice/runtime/continuation-generator.ts'

export function run() {
  const desiredOutcome = 'Earn a second investor meeting.'

  const candidate = evaluateContinuationCandidate({
    transcript: 'What matters now is',
    desiredOutcome,
    activeOutcome: 'Reduce investor uncertainty without abandoning the second meeting objective.',
    speakerIntent: 'assisted_continuation',
    supportStyle: 'cue',
    confidence: 0.78,
  })

  assert.equal(
    candidate.shouldContinue,
    true,
    'GEORGE should recognize a genuine interrupted-thought recovery opportunity.'
  )

  const continuation = generateContinuation({
    transcript: 'What matters now is',
    room: 'investor meeting',
    objective: desiredOutcome,
    activeObjective: 'Reduce investor uncertainty without abandoning the second meeting objective.',
  })

  assert(
    continuation.text.length > 0,
    'GEORGE should provide a usable recovery continuation.'
  )

  assert(
    /second meeting|uncertainty|proof|investor|next conversation|objective|outcome/i.test(
      continuation.text
    ),
    'Recovery should preserve trajectory toward the desired outcome.'
  )

  assert(
    !/presentation|response mode|switch mode|new mode/i.test(continuation.text),
    'Recovery must not drift support style.'
  )

  return true
}
