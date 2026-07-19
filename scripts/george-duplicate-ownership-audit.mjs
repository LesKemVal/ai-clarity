import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')
const fail = (message) => {
  console.error(`GEORGE duplicate ownership audit failed: ${message}`)
  process.exit(1)
}
const requireMatch = (text, pattern, message) => {
  if (!pattern.test(text)) fail(message)
}
const forbidMatch = (text, pattern, message) => {
  if (pattern.test(text)) fail(message)
}

const page = read('app/george/page.tsx')
const composer = read('lib/george/live-runtime/support-behavior-composer.ts')
const receiverPolicy = read('lib/george/live-delivery/receiver-policy.ts')
const deliveryRouter = read('lib/george/live-delivery/delivery-router.ts')
const runtimeAdapter = read('lib/george/live-hub/live-runtime-adapter.ts')
const deliveryBridge = read('components/george/live/LiveHubDeliveryBridge.tsx')
const visualBridge = read('components/george/live/LiveHubVisualCueBridge.tsx')
const shadowBridge = read('components/george/live/LiveHubShadowBridge.tsx')

// The application page may compose runtime surfaces, but it may not import or
// invoke the canonical behavior, receiver-policy, delivery-routing, or adapter
// constructors directly.
forbidMatch(
  page,
  /from ['"]@\/lib\/george\/live-runtime\/support-behavior-composer['"]|\bcomposeGeorgeSupportBehavior\s*\(/,
  'app/george/page.tsx owns or directly invokes support behavior composition.'
)
forbidMatch(
  page,
  /from ['"]@\/lib\/george\/live-delivery\/(?:receiver-policy|delivery-router)['"]|\b(?:resolveGeorgeReceiverDeliveryPolicy|routeGeorgeDeliveryCues?|routeGeorgeDeliveryCue)\s*\(/,
  'app/george/page.tsx owns or directly invokes receiver or delivery policy.'
)
forbidMatch(
  page,
  /\bcreateGeorgeLiveHubRuntimeAdapter\s*\(/,
  'app/george/page.tsx constructs the LIVE Hub runtime adapter.'
)

// The canonical owners and their expected public decisions must remain present.
requireMatch(
  composer,
  /export function composeGeorgeSupportBehavior\s*\(/,
  'canonical support behavior composer export is missing.'
)
requireMatch(
  receiverPolicy,
  /export function resolveGeorgeReceiverDeliveryPolicy\s*\(/,
  'canonical receiver policy export is missing.'
)
requireMatch(
  deliveryRouter,
  /resolveGeorgeReceiverDeliveryPolicy/,
  'delivery router no longer delegates receiver realization to receiver-policy.ts.'
)
requireMatch(
  deliveryRouter,
  /export function routeGeorgeDeliveryCues\s*\(/,
  'canonical multi-cue delivery router export is missing.'
)
requireMatch(
  runtimeAdapter,
  /export type GeorgeLiveHubRuntimeAdapter\s*=\s*\{[\s\S]*?connect[\s\S]*?syncContext[\s\S]*?disconnect[\s\S]*?sendTranscript[\s\S]*?subscribe/s,
  'LIVE Hub adapter public surface no longer contains the frozen transport methods.'
)

// Bridges may translate and dispatch approved output. Rendering may consume the
// delivery bridge, but neither bridge may become a support behavior owner.
requireMatch(
  deliveryBridge,
  /routeGeorgeDeliveryCues/,
  'delivery bridge no longer delegates cue routing to the canonical delivery router.'
)
forbidMatch(
  deliveryBridge,
  /composeGeorgeSupportBehavior|from ['"]@\/lib\/george\/live-runtime\/support-behavior-composer['"]/,
  'delivery bridge has taken ownership of support behavior composition.'
)
requireMatch(
  visualBridge,
  /<LiveHubDeliveryBridge\b/,
  'visual bridge no longer consumes the canonical delivery bridge.'
)
forbidMatch(
  visualBridge,
  /resolveGeorgeReceiverDeliveryPolicy|routeGeorgeDeliveryCues?|composeGeorgeSupportBehavior/,
  'visual renderer has taken ownership of behavior or receiver policy.'
)
forbidMatch(
  shadowBridge,
  /routeGeorgeDeliveryCues?|resolveGeorgeReceiverDeliveryPolicy|composeGeorgeSupportBehavior/,
  'shadow bridge has taken ownership of behavior or delivery routing.'
)

// Guard against additional copies of canonical decision function declarations.
const roots = ['app/george', 'components/george', 'lib/george', 'live-hub/src']
const declarations = [
  ['composeGeorgeSupportBehavior', 'lib/george/live-runtime/support-behavior-composer.ts'],
  ['resolveGeorgeReceiverDeliveryPolicy', 'lib/george/live-delivery/receiver-policy.ts'],
  ['routeGeorgeDeliveryCues', 'lib/george/live-delivery/delivery-router.ts'],
]

const walk = (directory) => {
  const results = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) results.push(...walk(absolute))
    else if (/\.(?:ts|tsx|js|mjs)$/.test(entry.name)) results.push(absolute)
  }
  return results
}

const sourceFiles = roots.flatMap((relativeRoot) => {
  const absolute = path.join(root, relativeRoot)
  return fs.existsSync(absolute) ? walk(absolute) : []
})

for (const [name, owner] of declarations) {
  const declarationPattern = new RegExp(`(?:export\\s+)?function\\s+${name}\\s*\\(`)
  const matches = sourceFiles
    .filter((file) => declarationPattern.test(fs.readFileSync(file, 'utf8')))
    .map((file) => path.relative(root, file))

  if (matches.length !== 1 || matches[0] !== owner) {
    fail(`${name} must be declared only by ${owner}; found: ${matches.join(', ') || 'none'}.`)
  }
}

console.log('GEORGE duplicate ownership audit passed')
