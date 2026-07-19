import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()

function read(relativePath) {
  const absolutePath = path.join(root, relativePath)

  assert.ok(
    fs.existsSync(absolutePath),
    `Required file is missing: ${relativePath}`
  )

  return fs.readFileSync(absolutePath, 'utf8')
}

function requireMatch(source, pattern, description) {
  assert.match(
    source,
    pattern,
    `LIVE input latency qualification failed: ${description}`
  )
}

function rejectMatch(source, pattern, description) {
  assert.doesNotMatch(
    source,
    pattern,
    `LIVE input latency qualification failed: ${description}`
  )
}

const browserDeepgramPath =
  'lib/george/live-voice/stt/deepgram-live-client.ts'

const hubDeepgramPath =
  'live-hub/src/stt/deepgram-stream.ts'

const releasePolicyPath =
  'lib/george/live-runtime/final-transcript-release-policy.ts'

const packagePath = 'package.json'
const trackerPath = 'docs/george/PRODUCTION_TRACKER.md'
const architecturePath = 'docs/george/RUNTIME_ARCHITECTURE.md'

const browserDeepgram = read(browserDeepgramPath)
const hubDeepgram = read(hubDeepgramPath)
const releasePolicy = read(releasePolicyPath)
const packageJson = JSON.parse(read(packagePath))
const tracker = read(trackerPath)
const architecture = read(architecturePath)

/*
 * Browser microphone transport
 */

requireMatch(
  browserDeepgram,
  /endpointing=250/,
  `${browserDeepgramPath} must use 250 ms Deepgram endpointing`
)

requireMatch(
  browserDeepgram,
  /recorder\.start\(\s*100\s*\)/,
  `${browserDeepgramPath} must send microphone chunks every 100 ms`
)

rejectMatch(
  browserDeepgram,
  /endpointing=350/,
  `${browserDeepgramPath} still contains the former 350 ms endpointing value`
)

rejectMatch(
  browserDeepgram,
  /recorder\.start\(\s*250\s*\)/,
  `${browserDeepgramPath} still contains the former 250 ms recorder cadence`
)

/*
 * LIVE Hub provider transport
 */

requireMatch(
  hubDeepgram,
  /endpointing\s*:\s*250/,
  `${hubDeepgramPath} must use 250 ms Deepgram endpointing`
)

rejectMatch(
  hubDeepgram,
  /endpointing\s*:\s*350/,
  `${hubDeepgramPath} still contains the former 350 ms endpointing value`
)

/*
 * Final-transcript assembly safeguards
 */

requireMatch(
  releasePolicy,
  /terminal\s*:\s*90/,
  `${releasePolicyPath} must preserve the 90 ms terminal release delay`
)

requireMatch(
  releasePolicy,
  /standard\s*:\s*140/,
  `${releasePolicyPath} must preserve the 140 ms standard release delay`
)

requireMatch(
  releasePolicy,
  /fragment\s*:\s*210/,
  `${releasePolicyPath} must preserve the 210 ms fragment release delay`
)

requireMatch(
  releasePolicy,
  /LIVE_FINAL_TRANSCRIPT_RELEASE_DELAYS_MS\.terminal/,
  `${releasePolicyPath} must continue using the canonical terminal delay`
)

requireMatch(
  releasePolicy,
  /LIVE_FINAL_TRANSCRIPT_RELEASE_DELAYS_MS\.fragment/,
  `${releasePolicyPath} must continue using the canonical fragment delay`
)

requireMatch(
  releasePolicy,
  /LIVE_FINAL_TRANSCRIPT_RELEASE_DELAYS_MS\.standard/,
  `${releasePolicyPath} must continue using the canonical standard delay`
)

/*
 * Build integration
 */

assert.equal(
  packageJson.scripts?.['george:live-input-latency:qualify'],
  'node scripts/george-live-input-latency-qualification.mjs',
  'package.json must register the LIVE input latency qualification command'
)

assert.ok(
  packageJson.scripts?.build?.includes(
    'npm run george:live-input-latency:qualify'
  ),
  'The production build must run the LIVE input latency qualification'
)

/*
 * Documentation synchronization
 */

requireMatch(
  tracker,
  /GEORGE_LIVE_INPUT_LATENCY_OPTIMIZATION_START/,
  `${trackerPath} must contain the LIVE input latency production update`
)

requireMatch(
  tracker,
  /browser microphone audio chunks are sent every 100 ms/i,
  `${trackerPath} must document the 100 ms browser capture cadence`
)

requireMatch(
  tracker,
  /Deepgram endpointing is reduced from 350 ms to 250 ms/i,
  `${trackerPath} must document the provider endpointing reduction`
)

requireMatch(
  architecture,
  /GEORGE_LIVE_INPUT_LATENCY_BOUNDARY_START/,
  `${architecturePath} must define the LIVE input latency ownership boundary`
)

requireMatch(
  architecture,
  /STT latency tuning remains transport configuration, not behavioral authority/i,
  `${architecturePath} must preserve the STT transport ownership boundary`
)

console.log('GEORGE LIVE input latency qualification passed')
