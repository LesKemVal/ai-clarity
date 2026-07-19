import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const preparerPath = path.join(
  root,
  'live-hub/src/george/interim-reasoning-preparer.ts'
)
const streamPath = path.join(root, 'live-hub/src/stt/deepgram-stream.ts')

assert.ok(fs.existsSync(preparerPath), 'interim reasoning preparer must exist')

const preparer = fs.readFileSync(preparerPath, 'utf8')
const stream = fs.readFileSync(streamPath, 'utf8')

assert.match(
  preparer,
  /minimumCharacters.*24/s,
  'preparation must reject unstable short interim transcripts'
)
assert.match(
  preparer,
  /maximumAgeMs.*5_000/s,
  'prepared reasoning must expire'
)
assert.match(
  preparer,
  /startsWith\(`\$\{prepared\} `\)/,
  'final transcript compatibility must accept stable interim prefixes'
)
assert.match(
  preparer,
  /matchingPrefixWords \/ preparedWords\.length >= 0\.8/,
  'final transcript compatibility must tolerate small transcription corrections'
)
assert.match(
  stream,
  /if \(!isFinal\) \{[\s\S]*interimReasoning\.prepare/,
  'interim transcripts must prepare reasoning without delivery'
)
assert.match(
  stream,
  /const preparedReasoning = interimReasoning\.consume\(transcript\)/,
  'final transcripts must validate prepared reasoning'
)
assert.match(
  stream,
  /preparedReasoning\?\.result \|\| resolveGroqFastCue\(packet\)/,
  'final processing must reuse valid preparation or fall back to canonical reasoning'
)
assert.match(
  stream,
  /if \(!isFinal\)[\s\S]*return[\s\S]*const preparedReasoning/,
  'interim preparation must not pass into final ACTION_CUE delivery'
)

console.log('GEORGE early reasoning preparation qualification passed.')
