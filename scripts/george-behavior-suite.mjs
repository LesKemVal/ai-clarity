import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const scenarios = [
  ['Continuation authority repair', './george-behavior/continuation-authority.mjs'],
  ['Cue doctrine boundary', './george-behavior/cue-doctrine.mjs'],
  ['Cue mode runtime behavior', './george-behavior/cue-mode-runtime.mjs'],
  ['Cue depth adapts within Cue', './george-behavior/cue-depth-runtime.mjs'],
  ['Response mode runtime behavior', './george-behavior/response-mode-runtime.mjs'],
  ['Desired outcome preservation', './george-behavior/outcome-preservation-runtime.mjs'],
  ['Outcome change detection', './george-behavior/outcome-change-detection.mjs'],
  ['Operational investor outcome flow', './george-behavior/operational-flow-runtime.mjs'],
  ['Delivery cannot alter meaning', './george-behavior/delivery-meaning.mjs'],
  ['Briefing propagation', './george-behavior/briefing-propagation.mjs'],
  ['Long-session stability', './george-behavior/long-session-stability.mjs'],
  ['Intervention timing', './george-behavior/intervention-timing.mjs'],
]

let failed = 0

console.log('\nGEORGE Behavioral Suite\n')

for (const [name, path] of scenarios) {
  const dir = mkdtempSync(join(tmpdir(), 'george-behavior-'))
  const file = join(dir, 'scenario.ts')

  writeFileSync(file, `
    import { run } from '${process.cwd()}/scripts/${path.replace('./', '')}'

    const result = run()
    if (result && typeof result.then === 'function') {
      result.then(() => {}).catch((error) => {
        console.error(error?.message || error)
        process.exit(1)
      })
    }
  `)

  try {
    execFileSync('npx', ['tsx', file], {
      stdio: 'pipe',
      cwd: process.cwd(),
    })
    console.log(`✓ ${name}`)
  } catch (error) {
    failed++
    console.log(`✗ ${name}`)
    const stderr = error?.stderr?.toString?.().trim()
    const stdout = error?.stdout?.toString?.().trim()
    console.error(`  ${stderr || stdout || error?.message || error}`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

if (failed) {
  console.error(`\nGEORGE behavioral suite failed: ${failed}`)
  process.exit(1)
}

console.log(`\nGEORGE behavioral suite passed: ${scenarios.length}/${scenarios.length}`)
