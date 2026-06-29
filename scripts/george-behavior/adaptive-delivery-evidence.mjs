import assert from 'node:assert/strict'
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

  const adaptedLine = 'Prove adoption before valuation.'
  const originalMeaning = 'Validate demand before discussing valuation.'

  assert(
    /adoption|demand|valuation/i.test(`${adaptedLine} ${originalMeaning}`),
    'Adaptive delivery must preserve the same operational meaning.'
  )

  assert(
    !/new objective|different goal|abandon|ignore/i.test(adaptedLine),
    'Adaptive delivery must not invent a new objective.'
  )

  return true
}
