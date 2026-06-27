const scenarios = [
  ['Continuation authority repair', './george-behavior/continuation-authority.mjs'],
  ['Cue doctrine boundary', './george-behavior/cue-doctrine.mjs'],
  ['Delivery cannot alter meaning', './george-behavior/delivery-meaning.mjs'],
  ['Briefing propagation', './george-behavior/briefing-propagation.mjs'],
]

let failed = 0

console.log('\nGEORGE Behavioral Suite\n')

for (const [name, path] of scenarios) {
  try {
    const mod = await import(path)
    await mod.run()
    console.log(`✓ ${name}`)
  } catch (error) {
    failed++
    console.log(`✗ ${name}`)
    console.error(`  ${error?.message || error}`)
  }
}

if (failed) {
  console.error(`\nGEORGE behavioral suite failed: ${failed}`)
  process.exit(1)
}

console.log(`\nGEORGE behavioral suite passed: ${scenarios.length}/${scenarios.length}`)
