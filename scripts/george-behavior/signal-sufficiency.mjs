import assert from 'node:assert/strict'
import { summarizeOutcomeProgression } from '../../lib/george/post-conversation/post-conversation-intelligence.ts'

export function run() {
  const enoughSignal = summarizeOutcomeProgression({
    desiredOutcome: 'Earn a second investor meeting.',
    transcript: [
      {
        speaker: 'other_party',
        text: 'The concept is interesting, but I need proof customers will actually use it.'
      },
      {
        speaker: 'user',
        text: 'We have pilot results from three customers and can send them today.'
      },
      {
        speaker: 'other_party',
        text: 'Send those over and let us schedule the next conversation.'
      }
    ],
  })

  assert.equal(enoughSignal.probability, 'increased')
  assert(
    enoughSignal.highestLeverageAction.length > 0,
    'GEORGE should identify a next action when signal is sufficient.'
  )

  const missingSignal = summarizeOutcomeProgression({
    desiredOutcome: 'Earn a second investor meeting.',
    transcript: [
      {
        speaker: 'other_party',
        text: 'I am not convinced there is demand.'
      },
      {
        speaker: 'user',
        text: 'We believe people will use it.'
      }
    ],
  })

  assert(
    missingSignal.remainingBarriers.length > 0,
    'GEORGE should preserve unresolved resistance when signal is insufficient.'
  )

  assert(
    /objection|evidence|requested|proof|barrier|resistance/i.test(
      [
        missingSignal.highestLeverageAction,
        ...missingSignal.remainingBarriers,
        ...missingSignal.missingEvidence,
      ].join(' ')
    ),
    'GEORGE should request or identify only signal that materially improves the next move.'
  )

  return true
}
