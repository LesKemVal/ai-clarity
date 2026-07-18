import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = process.cwd()
const adapter = readFileSync(
  `${root}/lib/george/live-hub/live-runtime-adapter.ts`,
  'utf8'
)

for (const expected of [
  'const sendTranscriptPacket = (',
  "type: 'TRANSCRIPT_INPUT'",
  'sendTranscriptPacket(next, currentContext.deliveryStyle)',
  'resolvedDeliveryStyle',
  'pendingTranscripts.push({ text: clean, isFinal, turnId, deliveryStyle: resolvedDeliveryStyle })',
]) {
  assert(
    adapter.includes(expected),
    `LIVE transcript adapter should include ${expected}`
  )
}

assert.equal(
  (adapter.match(/type:\s*'TRANSCRIPT_INPUT'/g) || []).length,
  1,
  'TRANSCRIPT_INPUT must be constructed in exactly one adapter helper'
)

assert.equal(
  (adapter.match(/transport\?\.sendJson\?\.\(\{/g) || []).length,
  1,
  'The adapter must have exactly one raw transport packet construction site'
)

assert(
  adapter.includes('sendTranscriptPacket(next, currentContext.deliveryStyle)'),
  'Queued flush must preserve existing mutable-context delivery-style semantics in this commit'
)

assert(
  adapter.includes('resolvedDeliveryStyle\n      )') ||
    adapter.includes('resolvedDeliveryStyle\r\n      )'),
  'Immediate dispatch must preserve its existing resolved delivery style'
)

console.log('GEORGE LIVE transcript packet qualification passed')
