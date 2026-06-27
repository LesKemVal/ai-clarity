import { execSync } from 'node:child_process'

const commands = [
  ['Build', 'npm run build'],
  ['Production readiness', 'node scripts/george-production-readiness.mjs'],
  ['Operational validation', 'node scripts/george-operational-validation.mjs'],
]

let failed = 0

console.log('\nGEORGE Full Production Check\n')

for (const [label, command] of commands) {
  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`\n✓ ${label}`)
  } catch {
    console.log(`\n✗ ${label}`)
    failed++
    break
  }
}

if (failed) {
  console.error('\nGEORGE full production check failed')
  process.exit(1)
}

console.log('\nGEORGE full production check passed')
