import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const source = readFileSync(resolve(process.cwd(), 'app/george/page.tsx'), 'utf8')

assert.match(
  source,
  /const speechPlaybackGenerationRef = useRef\(0\)/,
  'Voice playback must have one generation owner'
)

assert.match(
  source,
  /async function stopSpeech\(\) \{\s*speechPlaybackGenerationRef\.current \+= 1/s,
  'Stopping speech must invalidate pending TTS and playback work'
)

assert.match(
  source,
  /async function playQueue\(liveTurnId\?: string, playbackGeneration = speechPlaybackGenerationRef\.current\)/,
  'Queue playback must capture its generation'
)

assert.match(
  source,
  /const url = await fetchSpeech\(chunk, turnId\)[\s\S]*?if \(playbackGeneration !== speechPlaybackGenerationRef\.current\) \{\s*URL\.revokeObjectURL\(url\)/,
  'Stale TTS responses must be discarded before audio ownership'
)

assert.match(
  source,
  /onPlaybackStart: \(\) => \{\s*if \(playbackGeneration !== speechPlaybackGenerationRef\.current\) \{\s*playback\.stop\(\)/s,
  'Playback start must reject superseded voice work'
)

assert.match(
  source,
  /await stopSpeech\(\)\s*const playbackGeneration = speechPlaybackGenerationRef\.current/s,
  'Each speech request must capture ownership after invalidating prior work'
)

assert.match(
  source,
  /await playQueue\(options\?\.turnId, playbackGeneration\)/,
  'Speech requests must carry generation ownership into playback'
)

console.log('GEORGE voice playback ownership qualification passed')
