import assert from 'node:assert/strict'
import fs from 'node:fs'

const streamPath = 'live-hub/src/stt/deepgram-stream.ts'
const source = fs.readFileSync(streamPath, 'utf8')

function assertContains(fragment, message) {
  assert.ok(source.includes(fragment), `${message}: missing ${fragment}`)
}

function assertOrder(first, second, message) {
  const firstIndex = source.indexOf(first)
  const secondIndex = source.indexOf(second)

  assert.ok(firstIndex >= 0, `${message}: missing first fragment`)
  assert.ok(secondIndex >= 0, `${message}: missing second fragment`)
  assert.ok(firstIndex < secondIndex, message)
}

assertContains(
  'let latestFastCueRequestId = 0',
  'The canonical stream must own one monotonic fast-cue request generation'
)
assertContains(
  'const fastCueRequestId = ++latestFastCueRequestId',
  'Every final provider request must claim the latest generation'
)
assertContains(
  'if (fastCueRequestId !== latestFastCueRequestId)',
  'Resolved provider work must be checked before delivery'
)
assertContains(
  "'[LIVE HUB][groq] stale result discarded'",
  'Discarded stale work must remain observable'
)
assertContains(
  'latestFastCueRequestId += 1',
  'Stream shutdown must invalidate unresolved provider work'
)
assertContains(
  'interimReasoning.clear()',
  'Stream shutdown must clear prepared interim reasoning'
)

assertOrder(
  'const fastCueRequestId = ++latestFastCueRequestId',
  'void fastCueRequest',
  'Request generation must be captured before asynchronous provider work is observed'
)
assertOrder(
  'if (fastCueRequestId !== latestFastCueRequestId)',
  "type: 'FAST_CUE'",
  'Stale-result rejection must precede FAST_CUE delivery'
)
assertOrder(
  'if (fastCueRequestId !== latestFastCueRequestId)',
  'const actionCue = arbitrateCue({',
  'Stale-result rejection must precede provider-enriched arbitration'
)

console.log('GEORGE stale reasoning qualification passed')
