import assert from 'node:assert/strict'
import { summarizeOutcomeProgression } from '../../lib/george/post-conversation/post-conversation-intelligence.ts'

export function run(){

  const report=summarizeOutcomeProgression({

    desiredOutcome:'Earn a second investor meeting.',

    transcript:[

      {
        speaker:'other_party',
        text:'Send me the pilot results.'
      },

      {
        speaker:'other_party',
        text:"Let's schedule another meeting."
      }

    ]

  })

  assert.equal(report.probability,'increased')

  assert(report.reasons.length>0)

  assert(report.missingEvidence.length===1)

  assert(
    /evidence/i.test(
      report.highestLeverageAction
    )
  )

  return true

}
