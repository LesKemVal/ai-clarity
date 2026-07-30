import assert from 'node:assert/strict'
import { composeGeorgeSupportBehavior } from '../../lib/george/live-runtime/support-behavior-composer.ts'
import { getLiveSpokenTail, currentLiveSpokenSentence } from '../../lib/george/live-runtime/spoken-memory.ts'

export function run() {
  const tail = composeGeorgeSupportBehavior({
    userAppearsToBeShadowing: true,
    userMissedEnding: true,
    hasHighConfidenceCompletion: true,
    hasSafeResponse: true,
  })

  assert.deepEqual(tail.operationalResource, 'repeat')
  assert.equal(tail.temporary, true)

  const sentenceRecovery = composeGeorgeSupportBehavior({
    userAppearsToBeShadowing: true,
    userLostPlace: true,
    hasCurrentSentence: true,
    hasSafeResponse: true,
  })

  assert.deepEqual(sentenceRecovery.operationalResource, 'recovery')
  assert.equal(sentenceRecovery.temporary, true)

  const takeover = composeGeorgeSupportBehavior({
    userTookOverNaturally: true,
    hasHighConfidenceCompletion: false,
    hasSafeResponse: true,
  })

  assert.deepEqual(takeover.operationalResource, 'silence')

  const noSafeResponse = composeGeorgeSupportBehavior({
    deliveryStyle: 'response',
    hasSafeResponse: false,
  })

  assert.deepEqual(noSafeResponse.operationalResource, 'cue')

  const response = composeGeorgeSupportBehavior({
    deliveryStyle: 'response',
    hasSafeResponse: true,
  })

  assert.deepEqual(response.operationalResource, 'response')

  console.log('GEORGE support behavior composer passed')


  assert.equal(
    currentLiveSpokenSentence({ lastSpokenLine: 'First sentence. The primary advantage is execution.' }),
    'The primary advantage is execution.'
  )

  assert.equal(
    getLiveSpokenTail({
      lastSpokenLine: 'The primary advantage is execution.',
      approximateUserLine: 'The primary advantage is',
    }),
    'execution.'
  )
}
