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

  const candidateText = JSON.stringify(candidate).toLowerCase()

  assert(
    /continue|continuation|assist|recover|trajectory|objective|sentence/.test(candidateText),
    'GEORGE should recognize a genuine interrupted-thought recovery opportunity.'
  )

  const continuation = generateContinuation({
    transcript: 'What matters now is',
    room: 'investor meeting',
    objective: desiredOutcome,
    activeObjective: 'Reduce investor uncertainty without abandoning the second meeting objective.',
  })

  assert(continuation.continuation.length > 0)

  assert(
    /point stays connected to the outcome|objective|outcome|next step|clear|proof|decision/i.test(continuation.continuation),
    'Recovery should preserve trajectory toward the desired outcome.'
  )

  assert(
    !/presentation|response mode|switch mode|new mode/i.test(continuation.continuation),
    'Recovery must not drift support style.'
  )

  return true
}
