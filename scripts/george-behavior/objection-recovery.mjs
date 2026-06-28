import assert from 'node:assert/strict'
import { selectLiveResponse } from '../../lib/george/live-voice/runtime/response-policy.ts'

export function run() {

  const result = selectLiveResponse({

    desiredOutcome: 'Earn a second investor meeting.',

    activeOutcome:
      'Reduce investor uncertainty while preserving momentum toward a second meeting.',

    supportStyle: 'cue',

    transcript: [
      {
        speaker: 'other_party',
        text: 'I still do not believe customers will pay for this.'
      }
    ]

  })

  assert(
    result,
    'GEORGE should produce an operational intervention.'
  )

  const combined = JSON.stringify(result).toLowerCase()

  assert(
    /proof|evidence|pilot|customer|validate|demonstrate/.test(combined),
    'GEORGE should address the objection rather than ignore it.'
  )

  assert(
    /second meeting|investor|uncertainty|momentum|outcome/.test(combined),
    'GEORGE must preserve the higher-priority desired outcome.'
  )

  assert(
    !/change objective|new objective|presentation mode|response mode/.test(combined),
    'GEORGE must recover without changing support style or objective.'
  )

  return true
}
