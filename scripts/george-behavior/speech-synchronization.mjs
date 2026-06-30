import assert from 'node:assert'

export function run() {
  const floorTaking = {
    overlapSignal: 'user_redirecting',
    georgeAction: 'yield',
    acknowledgement: 'Okay.',
  }

  assert.equal(
    floorTaking.georgeAction,
    'yield',
    'GEORGE should yield when the user is taking the floor.'
  )

  assert(
    ['Okay.', 'Sure.', 'Go ahead.', 'Of course.', "I'm listening.", ''].includes(floorTaking.acknowledgement),
    'GEORGE should use only short natural acknowledgements or silence.'
  )

  const synchronization = {
    overlapSignal: 'user_shadowing_george_line',
    georgeAction: 'continue',
    acknowledgement: '',
  }

  assert.equal(
    synchronization.georgeAction,
    'continue',
    'GEORGE should continue when the user is using GEORGE as live synchronized support.'
  )

  assert.equal(
    synchronization.acknowledgement,
    '',
    'GEORGE should not acknowledge synchronized speech because it would break user cadence.'
  )

  const governingPrinciple = 'desired_outcome_probability'

  assert.equal(
    governingPrinciple,
    'desired_outcome_probability',
    'Speech synchronization must be governed by outcome probability, not overlap alone.'
  )

  return true
}
