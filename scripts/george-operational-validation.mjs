import { execSync } from 'node:child_process'

const scenarios = [
  {
    name: 'Cue doctrine present',
    command: "grep -q \"smallest effective intervention\" lib/george/live-voice/live-reasoning.ts",
  },
  {
    name: 'Continuation authority exists',
    command: "grep -q \"violatesEvidenceAuthority\" lib/george/live-voice/live-reasoning.ts",
  },
  {
    name: 'Continuation repair exists',
    command: "grep -q \"safeContinuationReplacement\" lib/george/live-voice/live-reasoning.ts",
  },
  {
    name: 'Core owns ACTION_CUE authority',
    command: "grep -q \"finalizeGeorgeActionCueAuthority\" lib/george/core/verification/action-cue-authority.ts",
  },
  {
    name: 'Delivery does not alter semantic authority',
    command: "! grep -q \"violatesEvidenceAuthority\\|safeContinuationReplacement\" lib/george/live-delivery/delivery-router.ts",
  },
  {
    name: 'Support style normalization exists',
    command: "grep -q \"normalizeLiveSupportStyle\" lib/george/live-runtime/support-style.ts",
  },
  {
    name: 'Delivery revision tracking exists',
    command: "grep -q \"delivery_revision\" components/george/live/LiveHubDeliveryBridge.tsx",
  },
  {
    name: 'Duplicate delivery suppression exists',
    command: "grep -q \"delivery_duplicate_suppressed\" components/george/live/LiveHubDeliveryBridge.tsx",
  },
  {
    name: 'Briefing reaches LIVE reasoning',
    command: "grep -q \"briefingKnowledge\" lib/george/live-voice/live-reasoning.ts",
  },
  {
    name: 'Production readiness gate passes',
    command: "node scripts/george-production-readiness.mjs",
  },
]

let failed = 0

console.log('\nGEORGE Operational Validation\n')

for (const scenario of scenarios) {
  try {
    execSync(scenario.command, { stdio: 'pipe', shell: '/bin/bash' })
    console.log(`✓ ${scenario.name}`)
  } catch {
    console.log(`✗ ${scenario.name}`)
    failed++
  }
}

if (failed) {
  console.error(`\nGEORGE operational validation failed: ${failed}`)
  process.exit(1)
}

console.log('\nGEORGE operational validation passed')
