import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const authorityPaths = [
  'docs/george/PRODUCTION_TRACKER.md',
  'docs/george/RUNTIME_ARCHITECTURE.md',
  'docs/george/OPERATIONAL_PROFILE.md',
  'docs/george/NEXT_THREAD_HANDOFF.md',
]
const syncMarker =
  'GEORGE_DOCUMENTATION_SYNC: 2026-08-05-preparation-session-routing'
const implementationAuthority =
  'IMPLEMENTATION_AUTHORITY: Implementation is authoritative; these documents are authoritative only while synchronized with the validated local implementation.'
const readOrder =
  'GEORGE_AUTHORITY_READ_ORDER: PRODUCTION_TRACKER.md -> RUNTIME_ARCHITECTURE.md -> OPERATIONAL_PROFILE.md -> NEXT_THREAD_HANDOFF.md'

for (const path of authorityPaths) {
  assert(existsSync(resolve(root, path)), `Missing documentation authority: ${path}`)
}

const docs = Object.fromEntries(
  authorityPaths.map((path) => [path, readFileSync(resolve(root, path), 'utf8')])
)
const tracker = docs['docs/george/PRODUCTION_TRACKER.md']
const architecture = docs['docs/george/RUNTIME_ARCHITECTURE.md']
const profile = docs['docs/george/OPERATIONAL_PROFILE.md']
const handoff = docs['docs/george/NEXT_THREAD_HANDOFF.md']
const combined = authorityPaths.map((path) => docs[path]).join('\n')

for (const [path, source] of Object.entries(docs)) {
  assert(source.includes(syncMarker), `${path} is missing the shared sync marker`)
  assert(
    source.includes(implementationAuthority),
    `${path} does not declare synchronized implementation authority`
  )
  assert(source.includes(readOrder), `${path} has a different authority read order`)
  assert(
    source.includes('Documentation Synchronization Rule') &&
      source.includes('implementation-ahead documentation debt') &&
      source.includes('Documentation debt must not survive a production checkpoint'),
    `${path} is missing the documentation anti-regression rule`
  )
}

for (const staleBranch of ['homepage-fresh-briefing-owner', 'live-hub-runtime']) {
  const staleCurrentBranch = new RegExp(
    `^(?:Current branch|Current validated branch|Latest validated branch|Branch)\\s*:\\s*(?:\\x60)?${staleBranch}(?:\\x60)?`,
    'im'
  )
  assert(
    !staleCurrentBranch.test(combined),
    `Stale branch is still presented as current: ${staleBranch}`
  )
}

assert(
  /Current branch:\s*`conversation-summary-runtime`/.test(handoff),
  'NEXT_THREAD_HANDOFF must identify conversation-summary-runtime as current'
)

const requiredTermsByDocument = {
  'docs/george/PRODUCTION_TRACKER.md': [
    'Preparation Runtime',
    'Preparation Session',
    'priorInteractions',
    'ContextFraming',
    'visual-presentation-policy.ts',
    'LiveHubVisualCueBridge.tsx',
    'evidence-first',
    'progressive Ready Room',
  ],
  'docs/george/RUNTIME_ARCHITECTURE.md': [
    'Preparation Runtime',
    'Preparation Session',
    'priorInteractions',
    'ContextFraming',
    'visual-presentation-policy.ts',
    'LiveHubVisualCueBridge.tsx',
    'evidence-first',
    'progressive Ready Room',
  ],
  'docs/george/OPERATIONAL_PROFILE.md': [
    'Preparation Runtime',
    'Preparation Session',
    'priorInteractions',
    'ContextFraming',
    'evidence-first',
    'Ready Room progressively',
  ],
}

for (const [path, terms] of Object.entries(requiredTermsByDocument)) {
  for (const term of terms) {
    assert(docs[path].includes(term), `${path} is missing current term: ${term}`)
  }
}

const canonicalArchitectureOwners = [
  'lib/george/live-runtime/live-preparation-controller.ts',
  'lib/george/live-runtime/live-preparation-storage.ts',
  'lib/george/live-browser/live-preparation-browser-storage.ts',
  'components/home/HomeConversationTypeSurface.tsx',
  'app/api/george/live/signal-question/route.ts',
  'app/george/live-entry/LiveEntryClient.tsx',
  'app/george/page.tsx',
  'lib/george/runtime/context-framing.ts',
  'lib/george/chat/presentation-authority.ts',
  'lib/george/live-runtime/operational-assessment.ts',
  'lib/george/live-delivery/receiver-policy.ts',
  'lib/george/live-delivery/delivery-router.ts',
  'lib/george/live-delivery/visual-presentation-policy.ts',
  'components/george/live/LiveHubVisualCueBridge.tsx',
  'scripts/george-live-delivery-policy-smoke.mjs',
]

for (const ownerPath of canonicalArchitectureOwners) {
  assert(
    architecture.includes(ownerPath),
    `Runtime architecture is missing canonical owner path: ${ownerPath}`
  )
  assert(
    existsSync(resolve(root, ownerPath)),
    `Documented canonical owner does not exist: ${ownerPath}`
  )
}

const preparationStatusDocs = [tracker, architecture, profile, handoff].map(
  (source) => source.split('## Documentation Synchronization Rule')[0]
)

for (const [index, source] of preparationStatusDocs.entries()) {
  const path = authorityPaths[index]
  assert(
    source.includes('Preparation Runtime') && source.includes('Preparation Session'),
    `${path} is missing the canonical preparation terms`
  )
  assert(
    /Traditional[\s\S]{0,180}(?:Migrated|Complete|is migrated)/i.test(source),
    `${path} does not represent Traditional as migrated`
  )
  assert(
    /Quick LIVE[\s\S]{0,180}(?:Migrated|Complete|is migrated)/i.test(source),
    `${path} does not represent Quick LIVE as migrated`
  )
  assert(
    /Homepage[\s\S]{0,180}(?:Migrated|Complete|is migrated)/i.test(source),
    `${path} does not represent Homepage as migrated`
  )
  assert(
    /Normal GEORGE[\s\S]{0,180}(?:Pending|pending migration|remains on its legacy handoff)/i.test(
      source
    ),
    `${path} does not represent Normal GEORGE migration as pending`
  )
  assert(
    /Resume[\s\S]{0,180}(?:Pending|pending meaningful|must eventually restore meaningful)/i.test(
      source
    ),
    `${path} does not represent meaningful Resume restoration as pending`
  )
}

const contradictoryCurrentClaims = [
  /Continuation is a user-selectable support option/i,
  /Continuation remains a user-selectable support option/i,
  /selectable Continuation support option/i,
  /Popup 3 is the canonical traditional mechanics owner/i,
  /(?:visual and audio|audio and visual) (?:are|use) identical delivery/i,
  /LiveHubVisualCueBridge(?:\.tsx)? (?:is|owns|provides) (?:the )?(?:reasoning|evidence) authority/i,
  /^#+\s+Operational Preparation\b/im,
  /Operational Preparation (?:is|owns|serves as|becomes) (?:a|the) /i,
  /routes? own preparation(?: state)?/i,
  /all routes (?:use|have|share) (?:an? )?identical UI/i,
  /(?:derived )?readiness (?:is|remains) (?:persisted as )?canonical (?:Preparation Session|session) truth/i,
  /Continuation (?:is|remains) (?:a )?(?:Preparation Session|preparation) state/i,
  /runtime setup (?:is|remains) canonical preparation state/i,
  /Normal GEORGE\s*\|\s*(?:Migrated|Complete)/i,
]

for (const claim of contradictoryCurrentClaims) {
  assert(!claim.test(combined), `Contradictory current claim found: ${claim}`)
}

assert(
  handoff.includes('Production build status:'),
  'NEXT_THREAD_HANDOFF is missing current build status'
)
assert(
  handoff.includes('## Current Next Work'),
  'NEXT_THREAD_HANDOFF is missing current next work'
)
assert(
  handoff.includes('## No-Drift Discipline'),
  'NEXT_THREAD_HANDOFF is missing no-drift discipline'
)

console.log('GEORGE documentation qualification passed')
