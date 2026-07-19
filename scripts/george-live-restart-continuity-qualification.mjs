import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = process.cwd()

function read(relativePath) {
  return readFileSync(`${root}/${relativePath}`, 'utf8')
}

function assertIncludes(source, fragment, message) {
  assert.ok(source.includes(fragment), message)
}

function assertOrder(source, first, second, message) {
  const firstIndex = source.indexOf(first)
  const secondIndex = source.indexOf(second)
  assert.notEqual(firstIndex, -1, `${message}: missing first contract fragment`)
  assert.notEqual(secondIndex, -1, `${message}: missing second contract fragment`)
  assert.ok(firstIndex < secondIndex, message)
}

const adapterSource = read('lib/george/live-hub/live-runtime-adapter.ts')
const transportSource = read('lib/george/live-hub/websocket-transport.ts')
const shadowBridgeSource = read('components/george/live/LiveHubShadowBridge.tsx')
const deliveryBridgeSource = read('components/george/live/LiveHubDeliveryBridge.tsx')
const liveEntrySource = read('app/george/live-entry/LiveEntryClient.tsx')
const livePageSource = read('app/george/live/page.tsx')

/*
 * Runtime adapter restart continuity
 */
assertIncludes(
  adapterSource,
  'let intentionalDisconnect = false',
  'Adapter must distinguish an intentional shutdown from an unexpected Hub interruption'
)
assertIncludes(
  adapterSource,
  'const scheduleReconnect = () =>',
  'Unexpected Hub interruption must schedule reconnection in the canonical adapter'
)
assertIncludes(
  adapterSource,
  'Math.min(1000 * (2 ** reconnectAttempt), 8000)',
  'Reconnect attempts must use bounded exponential backoff'
)
assertIncludes(
  adapterSource,
  'transport.connect(currentContext)',
  'Reconnect must restore the latest canonical runtime context'
)
assertIncludes(
  adapterSource,
  'flushPendingTranscripts()',
  'Queued transcripts must resume after the Hub reconnects'
)
assertIncludes(
  adapterSource,
  'if (generation !== transportGeneration)',
  'Stale socket callbacks must not mutate the current runtime connection'
)
assertIncludes(
  adapterSource,
  'clearReconnectTimer()',
  'Reconnect timers must have explicit lifecycle ownership'
)
const disconnectBlock = adapterSource.slice(adapterSource.indexOf('    disconnect() {'))
assertOrder(
  disconnectBlock,
  'intentionalDisconnect = true',
  'transport?.close()',
  'Intentional disconnect must be marked before closing the transport'
)
assertOrder(
  disconnectBlock,
  'clearReconnectTimer()',
  'pendingTranscripts.length = 0',
  'Intentional shutdown must cancel restart work before clearing transient packets'
)

/*
 * Transport context replay
 */
assertOrder(
  transportSource,
  'params.handlers.onOpen?.()',
  "type: 'SYNC_CONTEXT'",
  'A reopened socket must announce readiness before replaying runtime context'
)
assertIncludes(
  transportSource,
  'context: context || {}',
  'Transport connection must preserve the supplied runtime context'
)
assertIncludes(
  transportSource,
  'if (!ws || ws.readyState !== WebSocket.OPEN) return',
  'Unavailable sockets must reject writes without throwing'
)

/*
 * Ownership and duplicate prevention
 */
assertIncludes(
  shadowBridgeSource,
  'const unsubscribe = adapter.subscribe',
  'Shadow bridge subscriptions must remain explicitly releasable'
)
assertIncludes(
  shadowBridgeSource,
  'adapter.disconnect()',
  'Shadow bridge must release runtime connection ownership on unmount'
)
assertIncludes(
  deliveryBridgeSource,
  'deliveredCueByTurnRef',
  'Delivery continuity must retain turn-scoped duplicate protection'
)
assertIncludes(
  deliveryBridgeSource,
  "deliveryDecision.action === 'suppress_duplicate'",
  'Replayed or delayed cues must not produce duplicate delivery'
)

/*
 * Durable LIVE context sources
 */
for (const key of [
  'GEORGE_LIVE_SETUP',
  'george_live_setup_active',
  'george_live_runtime_support_active',
  'george_live_runtime_support',
]) {
  assertIncludes(
    livePageSource,
    key,
    `LIVE entry handoff must preserve ${key} across page or process restart`
  )
}

for (const key of [
  'GEORGE_LIVE_SUPPORT_STYLE',
  'GEORGE_LIVE_DELIVERY_STYLE',
  'GEORGE_LIVE_RECEIVER_PROFILE',
]) {
  assertIncludes(
    liveEntrySource,
    key,
    `LIVE mechanics must preserve ${key} as a durable preference`
  )
}

console.log('GEORGE LIVE restart continuity qualification passed')
