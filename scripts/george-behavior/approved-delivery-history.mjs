import assert from 'node:assert/strict'
import {
  clearGeorgeApprovedLiveDelivery,
  commitGeorgeApprovedLiveDelivery,
  getLastGeorgeApprovedLiveDelivery,
  replayLastGeorgeApprovedLiveDelivery,
  subscribeGeorgeApprovedDeliveryReplay,
} from '../../lib/george/live-runtime/approved-delivery-history.ts'

clearGeorgeApprovedLiveDelivery()

assert.equal(
  replayLastGeorgeApprovedLiveDelivery(),
  null,
  'Repeat should return null before approved support is committed.'
)

const replayed = []
const unsubscribe = subscribeGeorgeApprovedDeliveryReplay((event) => {
  replayed.push(event)
})

commitGeorgeApprovedLiveDelivery({
  mode: 'visual',
  text: 'Anchor value before discussing price.',
  reason: 'Approved delivery history test.',
  source: 'groq',
  category: 'operational_guidance',
  confidence: 0.91,
  priority: 82,
  at: Date.now(),
  turnId: 'approved-delivery-test',
})

assert.equal(
  getLastGeorgeApprovedLiveDelivery()?.text,
  'Anchor value before discussing price.',
  'Committed delivery should become the canonical repeat source.'
)

const repeated = replayLastGeorgeApprovedLiveDelivery('repeat')

assert.equal(
  repeated?.text,
  'Anchor value before discussing price.',
  'Repeat should preserve the exact committed delivery.'
)

assert.equal(replayed.length, 1)
assert.equal(replayed[0].reason, 'repeat')
assert.equal(replayed[0].delivery.turnId, 'approved-delivery-test')

unsubscribe()
clearGeorgeApprovedLiveDelivery()

console.log('GEORGE approved delivery history passed')
