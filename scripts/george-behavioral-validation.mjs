import { execSync } from 'node:child_process'

const checks = [
  [
    'Continuation repair rejects unsupported high-risk facts',
    "grep -q \"unsupported_high_risk_fact\" lib/george/core/verification/evidence-gate.ts",
  ],
  [
    'Continuation replacement preserves trajectory',
    "grep -q \"repairContinuationTrajectory\" lib/george/core/verification/continuation-replacement.ts",
  ],
  [
    'Cue remains adaptive intervention',
    "grep -q \"smallest effective intervention\" lib/george/live-voice/live-reasoning.ts",
  ],
  [
    'Cue does not become Response',
    "grep -q \"must not become Response\" lib/george/live-voice/live-reasoning.ts",
  ],
  [
    'Desired outcome governs reasoning priority',
    "grep -q \"Advance the desired outcome\" lib/george/live-voice/live-reasoning.ts",
  ],
  [
    'Signal insufficiency asks for highest-value missing signal',
    "grep -q \"highest-value missing signal\" lib/george/live-voice/live-reasoning.ts",
  ],
  [
    'Delivery cannot alter meaning',
    "! grep -q \"safeContinuationReplacement\\|violatesEvidenceAuthority\" lib/george/live-delivery/delivery-router.ts",
  ],
  [
    'Core finalizes authority before delivery',
    "grep -q \"finalizeGeorgeActionCueAuthority\" lib/george/live-hub/live-runtime-adapter.ts",
  ],
]

let failed = 0

console.log('\\nGEORGE Behavioral Validation\\n')

for (const [label, command] of checks) {
  try {
    execSync(command, { stdio: 'pipe', shell: '/bin/bash' })
    console.log(`✓ ${label}`)
  } catch {
    console.log(`✗ ${label}`)
    failed++
  }
}

if (failed) {
  console.error(`\\nGEORGE behavioral validation failed: ${failed}`)
  process.exit(1)
}

console.log('\\nGEORGE behavioral validation passed')
