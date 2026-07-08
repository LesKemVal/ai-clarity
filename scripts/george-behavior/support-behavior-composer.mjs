import assert from 'node:assert/strict'
import { composeGeorgeSupportBehavior } from '../../lib/george/live-runtime/support-behavior-composer.ts'

const tail = composeGeorgeSupportBehavior({
  userAppearsToBeShadowing: true,
  userMissedEnding: true,
  hasHighConfidenceCompletion: true,
  hasSafeResponse: true,
})

assert.deepEqual(tail.behaviors, ['repeat_tail'])
assert.equal(tail.temporary, true)

const takeover = composeGeorgeSupportBehavior({
  userTookOverNaturally: true,
  hasHighConfidenceCompletion: false,
  hasSafeResponse: true,
})

assert.deepEqual(takeover.behaviors, ['silence'])

const noSafeResponse = composeGeorgeSupportBehavior({
  deliveryStyle: 'response',
  hasSafeResponse: false,
})

assert.deepEqual(noSafeResponse.behaviors, ['bridge', 'cue'])

const response = composeGeorgeSupportBehavior({
  deliveryStyle: 'response',
  hasSafeResponse: true,
})

assert.deepEqual(response.behaviors, ['full_response'])

console.log('GEORGE support behavior composer passed')
