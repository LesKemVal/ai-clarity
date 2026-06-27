import fs from 'node:fs'

export function run() {
  const reasoning = fs.readFileSync('lib/george/live-voice/live-reasoning.ts', 'utf8')
  const page = fs.readFileSync('app/george/page.tsx', 'utf8')
  const hubTypes = fs.readFileSync('lib/george/live-hub/types.ts', 'utf8')

  for (const token of ['briefingKnowledge', 'knownContext', 'userPosition']) {
    if (!reasoning.includes(token)) throw new Error(`${token} missing from reasoning.`)
    if (!page.includes(token)) throw new Error(`${token} missing from LIVE page context.`)
    if (!hubTypes.includes(token)) throw new Error(`${token} missing from LIVE Hub types.`)
  }

  return true
}
