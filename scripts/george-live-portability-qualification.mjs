import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

function stripNonCode(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1 ')
    .replace(/`(?:\\.|[^`\\])*`/g, ' ')
    .replace(/'(?:\\.|[^'\\])*'/g, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, ' ')
}

const portableOwners = [
  'lib/george/live-runtime',
  'lib/george/live-delivery',
]

const forbiddenImports = [
  '@/app/',
  '@/components/',
  '@/lib/george/live-host/',
  '/app/george/',
  '/components/george/',
  '/live-host/',
]

const forbiddenBrowserGlobals = [
  /\bwindow\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bnavigator\b/,
  /\bMediaRecorder\b/,
  /\bAudioContext\b/,
  /\bHTMLAudioElement\b/,
]

for (const owner of portableOwners) {
  const directory = join(root, owner)
  const files = walk(directory).filter((path) => /\.(ts|tsx|js|mjs)$/.test(path))

  assert(files.length > 0, `Portable owner must contain source files: ${owner}`)

  for (const path of files) {
    const source = readFileSync(path, 'utf8')
    const executableSource = stripNonCode(source)
    const displayPath = relative(root, path)

    for (const forbiddenImport of forbiddenImports) {
      assert(
        !source.includes(forbiddenImport),
        `Portable runtime owner must not import host or UI authority: ${displayPath} -> ${forbiddenImport}`
      )
    }

    for (const forbiddenGlobal of forbiddenBrowserGlobals) {
      assert(
        !forbiddenGlobal.test(executableSource),
        `Portable runtime owner must not depend on browser execution globals: ${displayPath} -> ${forbiddenGlobal}`
      )
    }
  }
}

const hostBoundary = readFileSync(
  join(root, 'lib/george/live-host/live-application-host.ts'),
  'utf8'
)

assert(
  hostBoundary.includes("from './audio-playback'") &&
    hostBoundary.includes("from './session-controller'") &&
    hostBoundary.includes("from './live-support-preferences'"),
  'Application host boundary must continue composing browser and session integration outside portable runtime owners'
)

console.log('GEORGE LIVE portability qualification passed')
