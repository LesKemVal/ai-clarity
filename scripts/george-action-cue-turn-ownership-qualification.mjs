import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = readFileSync(
  resolve(process.cwd(), 'lib/george/live-hub/live-runtime-adapter.ts'),
  'utf8'
)

assert.match(
  source,
  /const eventTurnId = String\(event\?\.turnId \|\| ''\)\.trim\(\)/,
  'ACTION_CUE must resolve identity from the event itself'
)

assert.match(
  source,
  /if \(!eventTurnId\) \{[\s\S]*?action-cue-dropped-missing-turn-id[\s\S]*?return\s*\}/,
  'ACTION_CUE without turn identity must be rejected'
)

assert.doesNotMatch(
  source,
  /event\.turnId \|\| lastTurnIdRef/,
  'ACTION_CUE must never inherit the latest transcript identity'
)

assert.match(
  source,
  /actionCue: \{[\s\S]*?turnId: eventTurnId,/,
  'Authority finalization must receive the original ACTION_CUE turn identity'
)

assert.match(
  source,
  /turnId: finalizedEvent\.turnId \|\| eventTurnId,/,
  'Resolved delivery must preserve the original ACTION_CUE turn identity'
)

console.log('GEORGE ACTION_CUE turn ownership qualification passed')
