import {
  GEORGE_LIVE_DELIVERY_USEFULNESS_DEADLINES_MS,
  resolveGeorgeLiveDeliveryDeadline,
} from '../lib/george/live-metrics/latency-budgets.mjs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const records = [{ event: 'transcript_input', at: 1000 }]

const current = resolveGeorgeLiveDeliveryDeadline({
  records,
  generatedAt: 1100,
  now: 1500,
  modes: ['visual', 'voice'],
})
assert(current.action === 'deliver', 'Current audio-visual delivery should deliver')
assert(
  current.deliverModes.includes('visual') &&
    current.deliverModes.includes('voice'),
  'Current audio-visual delivery should preserve both receivers'
)

const compressed = resolveGeorgeLiveDeliveryDeadline({
  records,
  generatedAt: 1100,
  now:
    1000 +
    GEORGE_LIVE_DELIVERY_USEFULNESS_DEADLINES_MS.visualPreferred +
    1,
  modes: ['visual', 'voice'],
})
assert(
  compressed.action === 'compress',
  'Late audio-visual delivery should compress rather than speak stale support'
)
assert(
  compressed.deliverModes.length === 1 &&
    compressed.deliverModes[0] === 'visual',
  'Compressed audio-visual delivery should retain only visual delivery'
)
assert(
  compressed.suppressedModes.includes('voice'),
  'Compressed audio-visual delivery should suppress voice'
)

const expiredVisual = resolveGeorgeLiveDeliveryDeadline({
  records,
  generatedAt: 1100,
  now:
    1000 +
    GEORGE_LIVE_DELIVERY_USEFULNESS_DEADLINES_MS.visualExpires +
    1,
  modes: ['visual'],
})
assert(
  expiredVisual.action === 'suppress',
  'Expired visual support should be suppressed'
)

const validAudioOnly = resolveGeorgeLiveDeliveryDeadline({
  records,
  generatedAt: 1100,
  now:
    1000 +
    GEORGE_LIVE_DELIVERY_USEFULNESS_DEADLINES_MS.visualExpires +
    1,
  modes: ['voice'],
})
assert(
  validAudioOnly.action === 'deliver',
  'Audio-only support should retain its receiver-specific usefulness window'
)

const expiredAudioOnly = resolveGeorgeLiveDeliveryDeadline({
  records,
  generatedAt: 1100,
  now:
    1000 +
    GEORGE_LIVE_DELIVERY_USEFULNESS_DEADLINES_MS.audioOnlyExpires +
    1,
  modes: ['voice'],
})
assert(
  expiredAudioOnly.action === 'suppress',
  'Expired audio-only support should be suppressed'
)

console.log('GEORGE LIVE delivery deadline qualification passed')
