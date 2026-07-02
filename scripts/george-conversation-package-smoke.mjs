import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'george-conversation-package-smoke-'))
const file = join(dir, 'smoke.mjs')

writeFileSync(file, `
import {
  createConversationPackage,
  updateAfterLive,
  buildConversationRecord,
} from '${process.cwd()}/lib/george/conversation-packages/index.mjs'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const pkg = createConversationPackage({
  desiredOutcome: 'secure investor follow-up',
  conversationType: 'investor meeting',
  conversationContext: 'Seed investor review',
}, { timestamp: '2026-07-02T00:00:00.000Z' })

const updated = updateAfterLive(pkg, {
  summary: {
    id: 'summary-1',
    type: 'live_summary',
    summary: 'Investor asked for implementation material and a next call.',
    suggestedNextAction: 'Send implementation material before the next investor meeting.',
  },
  outcomeReview: {
    desiredOutcome: 'secure investor follow-up',
    observedProgress: 'improving',
    confidence: 82,
    currentState: 'Advancing toward the desired outcome.',
    observedChange: 'Investor requested implementation material.',
    availablePaths: [
      'Prepare implementation material.',
      'Schedule follow-up conversation.',
    ],
    bestAvailablePath: 'Prepare implementation material before the next meeting.',
    possibleSecondaryOutcome: 'Strategic partner introduction may be available.',
    assistanceOptions: [
      'Prepare follow-up.',
      'Prepare requested materials.',
    ],
    internalNotes: 'Implementation planning became the recurring decision blocker.',
  },
}, { timestamp: '2026-07-02T00:05:00.000Z' })

assert(updated.liveSummaries.length === 1, 'post-LIVE update should attach live summary')
assert(updated.outcomeProgression.length === 1, 'outcome review should create outcome progression evidence')
assert(updated.learning.length === 1, 'outcome review should create learning evidence')
assert(updated.futureActions.length === 1, 'summary next action should become package future action')
assert(
  updated.futureActions[0].includes('implementation material'),
  'future action should preserve summary next action'
)

const progression = updated.outcomeProgression[0]
assert(progression.source === 'outcome_review', 'outcome progression should identify Outcome Review source')
assert(progression.observedProgress === 'improving', 'outcome progression should preserve observed progress')
assert(progression.bestAvailablePath.includes('implementation material'), 'outcome progression should preserve best path')

const learning = updated.learning[0]
assert(learning.source === 'outcome_review', 'learning should identify Outcome Review source')
assert(learning.learning.startsWith('We can '), 'learning should use GEORGE memory doctrine wording')
assert(learning.futureConversations.includes('Prepare follow-up.'), 'learning should preserve future preparation options')

const record = buildConversationRecord(updated, { timestamp: '2026-07-02T00:10:00.000Z' })
assert(record.source === 'conversation-package-runtime', 'conversation record should project from package runtime')
assert(record.packageId === updated.id, 'conversation record should keep package identity')
assert(record.summary.includes('Investor asked'), 'conversation record should expose latest operational summary')
assert(record.latestOutcome.observedProgress === 'improving', 'conversation record should expose latest outcome')
assert(record.latestLearning.learning.startsWith('We can '), 'conversation record should expose operational learning')
assert(record.futureActions[0].includes('implementation material'), 'conversation record should expose future actions')
assert(record.transcriptEvidenceAvailable === false, 'conversation record should not pretend transcript evidence exists')

assert(
  updated.events.some((event) => event.type === 'live_summary_attached'),
  'events should record summary attachment'
)
assert(
  updated.events.some((event) => event.type === 'outcome_progress_recorded'),
  'events should record outcome progression'
)
assert(
  updated.events.some((event) => event.type === 'learning_attached'),
  'events should record learning attachment'
)
assert(
  updated.events.some((event) => event.type === 'conversation_package_updated' && event.fields.includes('futureActions')),
  'events should record future action update'
)

console.log('GEORGE conversation package smoke passed')
`)

try {
  execFileSync('node', [file], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}
