import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const page = readFileSync(`${root}/app/george/page.tsx`, 'utf8')
const facade = readFileSync(
  `${root}/lib/george/live-host/live-application-host.ts`,
  'utf8'
)

assert(
  page.includes(
    "from '@/lib/george/live-host/live-application-host'"
  ),
  'GEORGE page must consume the canonical application host boundary'
)

const directHostImports = [
  ...page.matchAll(
    /from ['"]@\/lib\/george\/live-host\/([^'"]+)['"]/g
  ),
].map((match) => match[1])

assert.deepEqual(
  directHostImports,
  ['live-application-host'],
  `GEORGE page should have one host-facing dependency; found ${directHostImports.join(', ')}`
)

for (const owner of [
  './audio-playback',
  './session-controller',
  './live-outcome-observation',
  './draft-restoration',
  './live-prep-storage',
  './live-runtime-usage',
  './live-support-preferences',
]) {
  assert(
    facade.includes(`from '${owner}'`),
    `Application host boundary should compose ${owner}`
  )
}

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const runtimeFiles = walk(`${root}/lib/george/live-runtime`).filter(
  (path) => /\.(ts|tsx|js|mjs)$/.test(path)
)

for (const path of runtimeFiles) {
  const source = readFileSync(path, 'utf8')
  assert(
    !source.includes('/live-host/') &&
      !source.includes("from '../live-host") &&
      !source.includes("from './live-application-host"),
    `Portable runtime must not depend on browser host: ${path}`
  )
}

console.log('GEORGE LIVE host boundary qualification passed')
