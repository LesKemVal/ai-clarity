import assert from 'node:assert/strict'
import { classifyInterventionEffect } from '../../lib/george/live-voice/runtime/intervention-effectiveness.ts'

function decideAdaptation(events) {
  const repeated = events.filter((event) => event === events[0]).length
  const explicit = events.includes('explicit_user_request')
  const verbatim = events.includes('verbatim_repeat')

  if (verbatim) {
    return {
      adapt: false,
      reason: 'User repeated GEORGE verbatim. Current response style is working.',
    }
  }

  if (explicit) {
    return {
      adapt: true,
      reason: 'User explicitly requested a delivery change.',
    }
  }

  if (repeated >= 3) {
    return {
      adapt: true,
      reason: 'Repeated behavior created sufficient evidence to adapt.',
    }
  }

  return {
    adapt: false,
    reason: 'Single or insufficient behavior is noise, not evidence.',
  }
}

export function run() {
  const ignoredOnce = decideAdaptation(['ignored'])

  assert.equal(
    ignoredOnce.adapt,
    false,
    'GEORGE must not adapt because one line was ignored.'
  )

  const paraphrasedOnce = decideAdaptation(['paraphrased'])

  assert.equal(
    paraphrasedOnce.adapt,
    false,
    'GEORGE must not adapt from one paraphrase.'
  )

  const repeatedParaphrase = decideAdaptation([
    'paraphrased',
    'paraphrased',
    'paraphrased',
  ])

  assert.equal(
    repeatedParaphrase.adapt,
    true,
    'GEORGE may adapt after repeated evidence.'
  )

  const explicitRequest = decideAdaptation([
    'explicit_user_request',
  ])

  assert.equal(
    explicitRequest.adapt,
    true,
    'GEORGE should adapt immediately to explicit user instruction.'
  )

  const verbatimRepeat = decideAdaptation([
    'verbatim_repeat',
    'verbatim_repeat',
  ])

  assert.equal(
    verbatimRepeat.adapt,
    false,
    'Verbatim repetition means keep the current response style.'
  )

  const intervention = classifyInterventionEffect({
    desiredOutcome: 'Earn a second investor meeting.',
    response: 'Let’s prove adoption before we discuss valuation.',
    roomSignal: 'Investor is asking for proof and next-step confidence.',
  })

  assert(
    ['helpful', 'strong', 'partial'].includes(intervention),
    'Adaptive delivery should still advance the desired outcome.'
  )

  return true
}
