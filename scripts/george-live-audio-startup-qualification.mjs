import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = process.cwd()
const audioSource = readFileSync(
  `${root}/lib/george/live-host/audio-playback.ts`,
  'utf8'
)
const pageSource = readFileSync(`${root}/app/george/page.tsx`, 'utf8')

for (const expected of [
  'const DEFAULT_AUDIO_START_DELAY_MS = 0',
  'const DEFAULT_AUDIO_FALLBACK_START_MS = 180',
  'clearPlaybackTimers',
  'detachPlaybackListeners',
  'resolvePlayback',
  'if (delayMs === 0)',
]) {
  assert(
    audioSource.includes(expected),
    `Audio startup owner should include ${expected}`
  )
}

assert(
  !audioSource.includes('options.delayMs ?? 80'),
  'LIVE audio playback must not retain the artificial 80 ms start delay'
)

assert(
  !audioSource.includes('options.fallbackStartMs ?? 450'),
  'LIVE audio playback must not retain the 450 ms fallback start'
)

assert(
  pageSource.includes(
    'useRef<ReturnType<typeof createAudioPlayback> | null>(null)'
  ),
  'The page should retain the host playback handle, not the raw audio element'
)

assert(
  pageSource.includes('audioRef.current.stop()'),
  'Speech stop must settle and clean up the canonical playback handle'
)

assert(
  pageSource.includes('audioRef.current = playback'),
  'The active playback handle must remain available for interruption'
)

console.log('GEORGE LIVE audio startup qualification passed')
