import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const bridge = readFileSync(
  'components/george/live/LiveHubShadowBridge.tsx',
  'utf8'
)

for (const expected of [
  'const clearFinalTranscriptTimer = () => {',
  'const resetPendingFinalTranscript = () => {',
  'return resetPendingFinalTranscript',
  'deliveryStyleRef.current',
  'clearFinalTranscriptTimer()',
  'if (!finalText || !finalTurnId) return',
  '}, [active, transcript, transcriptFinal])',
]) {
  assert(
    bridge.includes(expected),
    `LIVE timer owner must include: ${expected}`
  )
}

assert.equal(
  (bridge.match(/setTimeout\(/g) || []).length,
  1,
  'Shadow bridge must have exactly one final-transcript timer creation site'
)

assert.equal(
  (bridge.match(/clearTimeout\(/g) || []).length,
  1,
  'Shadow bridge must clear its timer through one canonical helper'
)

assert(
  !bridge.includes('}, [active, transcript, transcriptFinal, context.deliveryStyle])'),
  'Delivery-style changes must not replay or extend the pending final transcript'
)

assert(
  !bridge.includes('return () => {\n      if (finalTranscriptTimerRef.current)'),
  'Per-transcript effect cleanup must not compete with the canonical timer owner'
)

console.log('GEORGE LIVE timer ownership qualification passed')
