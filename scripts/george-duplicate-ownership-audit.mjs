import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const sourceRoots = ['app/george', 'components/george', 'lib/george', 'live-hub/src']
const extensions = /\.(?:ts|tsx|js|mjs)$/

const fail = (message) => {
  console.error(`GEORGE ownership audit failed: ${message}`)
  process.exit(1)
}

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')
const normalize = (value) => value.split(path.sep).join('/')

const walk = (directory) => {
  const results = []
  if (!fs.existsSync(directory)) return results
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) results.push(...walk(absolute))
    else if (extensions.test(entry.name)) results.push(absolute)
  }
  return results
}

const files = sourceRoots
  .flatMap((relativeRoot) => walk(path.join(root, relativeRoot)))
  .map((absolute) => ({
    absolute,
    relative: normalize(path.relative(root, absolute)),
    text: fs.readFileSync(absolute, 'utf8'),
  }))

const resolveImport = (fromFile, specifier) => {
  let base
  if (specifier.startsWith('@/')) base = path.join(root, specifier.slice(2))
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(fromFile), specifier)
  else return null

  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.mjs`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
    path.join(base, 'index.mjs'),
  ]
  const match = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
  return match ? normalize(path.relative(root, match)) : null
}

const exportPatterns = [
  { kind: 'function', regex: /\bexport\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g },
  { kind: 'class', regex: /\bexport\s+class\s+([A-Za-z_$][\w$]*)\b/g },
  { kind: 'interface', regex: /\bexport\s+interface\s+([A-Za-z_$][\w$]*)\b/g },
  { kind: 'type', regex: /\bexport\s+type\s+([A-Za-z_$][\w$]*)\b/g },
  { kind: 'const', regex: /\bexport\s+const\s+([A-Za-z_$][\w$]*)\b/g },
]

const owners = new Map()
for (const file of files) {
  for (const { kind, regex } of exportPatterns) {
    regex.lastIndex = 0
    for (const match of file.text.matchAll(regex)) {
      const symbol = match[1]
      const entries = owners.get(symbol) ?? []
      entries.push({ file: file.relative, kind })
      owners.set(symbol, entries)
    }
  }
}

const consumers = new Map()
const edges = new Map()
const importRegex = /\bimport\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+['"]([^'"]+)['"]/g
for (const file of files) {
  importRegex.lastIndex = 0
  for (const match of file.text.matchAll(importRegex)) {
    const target = resolveImport(file.absolute, match[2])
    if (!target) continue
    const imported = match[1]
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim())
      .filter(Boolean)

    const edgeTargets = edges.get(file.relative) ?? new Set()
    edgeTargets.add(target)
    edges.set(file.relative, edgeTargets)

    for (const symbol of imported) {
      const entries = consumers.get(symbol) ?? []
      entries.push({ file: file.relative, from: target })
      consumers.set(symbol, entries)
    }
  }
}

const canonical = [
  {
    symbol: 'composeGeorgeSupportBehavior',
    owner: 'lib/george/live-runtime/support-behavior-composer.ts',
  },
  {
    symbol: 'resolveGeorgeOperationalAssessment',
    owner: 'lib/george/live-runtime/operational-assessment.ts',
  },
  {
    symbol: 'composeGeorgeOperationalCueText',
    owner: 'lib/george/live-delivery/receiver-policy.ts',
  },
  {
    symbol: 'resolveGeorgeDeliveryBehavior',
    owner: 'lib/george/live-delivery/delivery-behavior-resolver.ts',
  },
  {
    symbol: 'resolveGeorgeReceiverDeliveryPolicy',
    owner: 'lib/george/live-delivery/receiver-policy.ts',
  },
  {
    symbol: 'routeGeorgeDeliveryCues',
    owner: 'lib/george/live-delivery/delivery-router.ts',
  },
  {
    symbol: 'routeGeorgeDeliveryCue',
    owner: 'lib/george/live-delivery/delivery-router.ts',
  },
]

for (const { symbol, owner } of canonical) {
  const definitions = owners.get(symbol) ?? []
  if (definitions.length !== 1 || definitions[0].file !== owner) {
    fail(`${symbol} must be exported only by ${owner}; found: ${definitions.map((entry) => entry.file).join(', ') || 'none'}.`)
  }

  for (const consumer of consumers.get(symbol) ?? []) {
    if (consumer.from !== owner) {
      fail(`${consumer.file} imports ${symbol} from ${consumer.from}; canonical owner is ${owner}.`)
    }
  }
}

const page = read('app/george/page.tsx')
const deliveryBridge = read('components/george/live/LiveHubDeliveryBridge.tsx')
const visualBridge = read('components/george/live/LiveHubVisualCueBridge.tsx')
const shadowBridge = read('components/george/live/LiveHubShadowBridge.tsx')
const runtimeAdapter = read('lib/george/live-hub/live-runtime-adapter.ts')

const forbid = (text, pattern, message) => {
  if (pattern.test(text)) fail(message)
}
const requireMatch = (text, pattern, message) => {
  if (!pattern.test(text)) fail(message)
}

forbid(
  page,
  /from ['"]@\/lib\/george\/live-runtime\/support-behavior-composer['"]|\bcomposeGeorgeSupportBehavior\s*\(/,
  'app/george/page.tsx owns or directly invokes support behavior composition.'
)
forbid(
  page,
  /from ['"]@\/lib\/george\/live-delivery\/(?:receiver-policy|delivery-router)['"]|\b(?:resolveGeorgeReceiverDeliveryPolicy|routeGeorgeDeliveryCues?|routeGeorgeDeliveryCue)\s*\(/,
  'app/george/page.tsx owns or directly invokes receiver or delivery policy.'
)
forbid(page, /\bcreateGeorgeLiveHubRuntimeAdapter\s*\(/, 'app/george/page.tsx constructs the LIVE Hub runtime adapter.')

requireMatch(deliveryBridge, /routeGeorgeDeliveryCues/, 'delivery bridge no longer delegates routing to delivery-router.ts.')
requireMatch(deliveryBridge, /resolveGeorgeDeliveryBehavior/, 'delivery bridge no longer delegates behavior resolution to delivery-behavior-resolver.ts.')
forbid(deliveryBridge, /composeGeorgeSupportBehavior/, 'delivery bridge has taken ownership of support behavior composition.')
requireMatch(visualBridge, /<LiveHubDeliveryBridge\b/, 'visual bridge no longer consumes the canonical delivery bridge.')
forbid(visualBridge, /resolveGeorgeReceiverDeliveryPolicy|routeGeorgeDeliveryCues?|composeGeorgeSupportBehavior/, 'visual renderer has taken ownership of behavior or routing.')
forbid(shadowBridge, /routeGeorgeDeliveryCues?|resolveGeorgeReceiverDeliveryPolicy|composeGeorgeSupportBehavior/, 'shadow bridge has taken ownership of behavior or routing.')
requireMatch(
  runtimeAdapter,
  /export type GeorgeLiveHubRuntimeAdapter\s*=\s*\{[\s\S]*?connect[\s\S]*?syncContext[\s\S]*?disconnect[\s\S]*?sendTranscript[\s\S]*?subscribe/s,
  'LIVE Hub adapter public surface no longer contains the frozen transport methods.'
)

const forbiddenLayerImports = [
  {
    matchFile: (file) => file.startsWith('lib/george/live-runtime/'),
    forbidden: (target) => target.startsWith('components/') || target.startsWith('app/'),
    message: 'LIVE runtime may not import UI or application surfaces',
  },
  {
    matchFile: (file) => file.startsWith('lib/george/live-delivery/'),
    forbidden: (target) => target.startsWith('components/') || target.startsWith('app/'),
    message: 'LIVE delivery policy may not import UI or application surfaces',
  },
]

for (const [from, targets] of edges) {
  for (const target of targets) {
    for (const rule of forbiddenLayerImports) {
      if (rule.matchFile(from) && rule.forbidden(target)) fail(`${rule.message}: ${from} -> ${target}.`)
    }
  }
}

const cycleState = new Map()
const stack = []
const cycles = []
const visit = (file) => {
  const state = cycleState.get(file)
  if (state === 'done') return
  if (state === 'visiting') {
    const start = stack.indexOf(file)
    const cycle = [...stack.slice(start), file]
    cycles.push(cycle.join(' -> '))
    return
  }
  cycleState.set(file, 'visiting')
  stack.push(file)
  for (const target of edges.get(file) ?? []) {
    if (edges.has(target)) visit(target)
  }
  stack.pop()
  cycleState.set(file, 'done')
}
for (const file of edges.keys()) visit(file)

console.log('======================================')
console.log('GEORGE OWNERSHIP AUDIT')
console.log('======================================')
for (const { symbol, owner } of canonical) {
  const importedBy = [...new Set((consumers.get(symbol) ?? []).map((entry) => entry.file))].sort()
  console.log(`\n${symbol}`)
  console.log(`  owner: ${owner}`)
  console.log(`  consumers: ${importedBy.length ? importedBy.join(', ') : 'none'}`)
}
console.log(`\nIndexed source files: ${files.length}`)
console.log(`Indexed exported symbols: ${owners.size}`)
console.log('Duplicate canonical owners: 0')
console.log('Non-canonical imports: 0')
console.log('Layer violations: 0')
console.log(`Circular dependencies observed: ${new Set(cycles).size}`)
for (const cycle of [...new Set(cycles)].sort()) console.log(`  warning: ${cycle}`)
console.log('\nGEORGE ownership audit passed')
