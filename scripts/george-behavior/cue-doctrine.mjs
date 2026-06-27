import fs from 'node:fs'

export function run() {
  const text = fs.readFileSync('lib/george/live-voice/live-reasoning.ts', 'utf8')

  if (!text.includes('smallest effective intervention')) {
    throw new Error('Cue doctrine missing smallest effective intervention.')
  }

  if (!text.includes('Brevity is preferred, but not the law')) {
    throw new Error('Cue doctrine still risks brevity-as-law drift.')
  }

  if (!text.includes('must not become Response')) {
    throw new Error('Cue boundary against Response missing.')
  }

  return true
}
