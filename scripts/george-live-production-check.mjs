const checks = [
  ['Architecture freeze recorded', 'docs/george/PRODUCTION_TRACKER.md', 'Architecture Freeze Milestone'],
  ['Core owns ACTION_CUE authority', 'lib/george/core/verification/action-cue-authority.ts', 'finalizeGeorgeActionCueAuthority'],
  ['Delivery does not own authority repair', 'lib/george/live-delivery/delivery-router.ts', 'violatesEvidenceAuthority', false],
  ['Delivery tracks cue revisions', 'components/george/live/LiveHubDeliveryBridge.tsx', 'delivery_revision'],
  ['Duplicate delivery suppression exists', 'components/george/live/LiveHubDeliveryBridge.tsx', 'delivery_duplicate_suppressed'],
  ['Governed cue memory extracted', 'lib/george/live-runtime/governed-live-cue.ts', 'applyGovernedLiveCueRuntimeMemory'],
  ['Response form classifier extracted', 'lib/george/live-voice/runtime/response-form.ts', 'classifyLiveResponseForm'],
  ['Cue doctrine aligned', 'lib/george/live-voice/live-reasoning.ts', 'smallest effective intervention'],
]

const fs = await import('node:fs')

let failed = 0

for (const [label, file, needle, shouldExist = true] of checks) {
  const exists = fs.existsSync(file)
  const content = exists ? fs.readFileSync(file, 'utf8') : ''
  const pass = exists && (content.includes(needle) === shouldExist)

  console.log(`${pass ? '✓' : '✗'} ${label}`)
  if (!pass) failed++
}

if (failed) {
  console.error(`\nGEORGE production check failed: ${failed}`)
  process.exit(1)
}

console.log('\nGEORGE production architecture check passed')
