import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const adapterPath = resolve(root, 'lib/george/live-hub/live-runtime-adapter.ts')
const source = readFileSync(adapterPath, 'utf8')

assert.match(
  source,
  /pendingTranscripts\.push\(\{\s*text:\s*clean,\s*isFinal,\s*turnId,\s*deliveryStyle:\s*resolvedDeliveryStyle\s*\}\)/s,
  'Disconnected transcript packets must retain their resolved delivery style when queued'
)

assert.match(
  source,
  /sendTranscriptPacket\(next,\s*next\.deliveryStyle\)/,
  'Reconnect flush must send each queued transcript with the delivery style captured for that transcript'
)

assert.doesNotMatch(
  source,
  /sendTranscriptPacket\(next,\s*currentContext\.deliveryStyle\)/,
  'Reconnect flush must not rewrite queued transcript policy from later context'
)

const queueIndex = source.indexOf(
  'pendingTranscripts.push({ text: clean, isFinal, turnId, deliveryStyle: resolvedDeliveryStyle })'
)
const flushIndex = source.indexOf('sendTranscriptPacket(next, next.deliveryStyle)')

assert.ok(queueIndex >= 0, 'Queued transcript ownership marker must exist')
assert.ok(flushIndex >= 0, 'Reconnect flush ownership marker must exist')

console.log('GEORGE reconnect transcript ownership qualification passed')
