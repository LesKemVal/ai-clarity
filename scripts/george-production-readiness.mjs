import fs from 'node:fs'
import { execSync } from 'node:child_process'

const checks = [
  ['Tracker exists', 'docs/george/PRODUCTION_TRACKER.md', 'Architecture Freeze Milestone'],
  ['Outcome gate documented', 'docs/george/PRODUCTION_TRACKER.md', "materially improve GEORGE's ability to help the user reach their desired outcome"],
  ['Single GEORGE doctrine documented', 'docs/george/PRODUCTION_TRACKER.md', 'single operational GEORGE'],
  ['Delivery meaning rule documented', 'docs/george/PRODUCTION_TRACKER.md', 'Delivery may not alter operational meaning'],
  ['Core finalizes ACTION_CUE authority', 'lib/george/core/verification/action-cue-authority.ts', 'finalizeGeorgeActionCueAuthority'],
  ['Delivery has no evidence authority import', 'lib/george/live-delivery/delivery-router.ts', 'violatesEvidenceAuthority', false],
  ['Delivery has no continuation replacement import', 'lib/george/live-delivery/delivery-router.ts', 'safeContinuationReplacement', false],
  ['Delivery revision tracking exists', 'components/george/live/LiveHubDeliveryBridge.tsx', 'delivery_revision'],
  ['Delivery duplicate suppression exists', 'components/george/live/LiveHubDeliveryBridge.tsx', 'delivery_duplicate_suppressed'],
  ['Governed LIVE cue memory extracted', 'lib/george/live-runtime/governed-live-cue.ts', 'applyGovernedLiveCueRuntimeMemory'],
  ['LIVE response form classifier extracted', 'lib/george/live-voice/runtime/response-form.ts', 'classifyLiveResponseForm'],
  ['Cue doctrine aligned', 'lib/george/live-voice/live-reasoning.ts', 'smallest effective intervention'],
  ['Briefing pipeline references briefingKnowledge', 'lib/george/live-voice/live-reasoning.ts', 'briefingKnowledge'],
  ['Support style normalization exists', 'lib/george/live-runtime/support-style.ts', 'normalizeLiveSupportStyle'],
  ['Production architecture check exists', 'scripts/george-live-production-check.mjs', 'GEORGE production architecture check passed'],
]

let failed = 0

function checkFile(label, file, needle, shouldExist = true) {
  const exists = fs.existsSync(file)
  const content = exists ? fs.readFileSync(file, 'utf8') : ''
  const pass = exists && (content.includes(needle) === shouldExist)
  console.log(`${pass ? '✓' : '✗'} ${label}`)
  if (!pass) failed++
}

console.log('\nGEORGE Production Readiness Gate\n')

for (const [label, file, needle, shouldExist = true] of checks) {
  checkFile(label, file, needle, shouldExist)
}

const commands = [
  ['Core smoke', 'npm run george:core:smoke'],
  ['LIVE Entry smoke', 'npm run george:live-entry:smoke'],
  ['Architecture check', 'node scripts/george-live-production-check.mjs'],
]

for (const [label, command] of commands) {
  try {
    execSync(command, { stdio: 'pipe' })
    console.log(`✓ ${label}`)
  } catch (error) {
    console.log(`✗ ${label}`)
    failed++
  }
}

if (failed) {
  console.error(`\nGEORGE production readiness failed: ${failed}`)
  process.exit(1)
}

console.log('\nGEORGE production readiness gate passed')
