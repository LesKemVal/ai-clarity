import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(resolve(root, path), 'utf8')

const adapter = read('lib/george/live-hub/live-runtime-adapter.ts')
const hubTypes = read('lib/george/live-hub/types.ts')
const deliveryTypes = read('lib/george/live-delivery/types.ts')
const behavior = read('lib/george/live-runtime/support-behavior-composer.ts')
const receiverPolicy = read('lib/george/live-delivery/receiver-policy.ts')
const deliveryRouter = read('lib/george/live-delivery/delivery-router.ts')
const deliveryBridge = read('components/george/live/LiveHubDeliveryBridge.tsx')
const visualBridge = read('components/george/live/LiveHubVisualCueBridge.tsx')
const metrics = read('lib/george/live-metrics/runtime-metrics.ts')

const requireMatch = (source, pattern, message) => {
  assert.match(source, pattern, message)
}

const forbidMatch = (source, pattern, message) => {
  assert.doesNotMatch(source, pattern, message)
}

// Portable adapter boundary: transport lifecycle and transcript submission only.
requireMatch(adapter, /export type GeorgeLiveHubRuntimeAdapter\s*=\s*\{[\s\S]*?connect:[\s\S]*?syncContext:[\s\S]*?disconnect:[\s\S]*?sendTranscript:[\s\S]*?subscribe:/, 'LIVE Hub adapter contract changed')
forbidMatch(adapter, /GeorgeLiveHubRuntimeAdapter\s*=\s*\{[\s\S]*?(render|speak|playAudio|composeBehavior|routeDelivery)\s*:/, 'Adapter absorbed behavior, routing, or rendering authority')

// Hub protocol remains a carrier for canonical context and approved events.
requireMatch(hubTypes, /export type GeorgeLiveHubContext\s*=\s*\{/, 'Hub context contract missing')
requireMatch(hubTypes, /runtimeSnapshot\?: GeorgeRuntimeAuthoritySnapshot/, 'Canonical runtime snapshot carrier missing')
requireMatch(hubTypes, /export type GeorgeLiveHubEvent\s*=\s*[\s\S]*?'ACTION_CUE'[\s\S]*?'READY'[\s\S]*?'ERROR'/, 'Hub event contract changed')

// Delivery contracts remain receiver-facing and do not own reasoning.
requireMatch(deliveryTypes, /export type GeorgeLiveReceiverProfile\s*=\s*[\s\S]*?'visual_only'[\s\S]*?'audio_only'[\s\S]*?'audio_visual'/, 'Receiver profile contract changed')
requireMatch(deliveryTypes, /export type GeorgeDeliveryCue\s*=\s*\{/, 'Delivery cue contract missing')
requireMatch(deliveryTypes, /export type GeorgeDeliveryContext\s*=\s*\{/, 'Delivery context contract missing')
forbidMatch(deliveryTypes, /desiredOutcome|userLostPlace|hasSafeResponse|hasHighConfidenceCompletion/, 'Delivery types absorbed behavior-composer inputs')

// Canonical ownership must remain singular.
requireMatch(behavior, /export function composeGeorgeSupportBehavior\(/, 'Behavior Composer owner missing')
requireMatch(receiverPolicy, /export function [A-Za-z0-9_]*Receiver[A-Za-z0-9_]*\(/, 'Receiver Policy owner missing')
requireMatch(deliveryRouter, /export function [A-Za-z0-9_]*Delivery[A-Za-z0-9_]*\(/, 'Delivery Router owner missing')
forbidMatch(visualBridge, /composeGeorgeSupportBehavior|resolveGeorge.*Receiver|routeGeorge.*Delivery/, 'Visual renderer acquired policy ownership')
forbidMatch(deliveryBridge, /composeGeorgeSupportBehavior/, 'Delivery Bridge acquired behavior ownership')

// Telemetry remains observational rather than authoritative.
requireMatch(metrics, /export type GeorgeRuntimeMetricEvent\s*=/, 'Runtime metric event contract missing')
requireMatch(metrics, /export function markRuntimeEvent\(/, 'Runtime metric recorder missing')
forbidMatch(metrics, /composeGeorgeSupportBehavior|resolveGeorge.*Receiver|routeGeorge.*Delivery/, 'Telemetry acquired runtime decision authority')

console.log('GEORGE runtime interface freeze qualification passed')
