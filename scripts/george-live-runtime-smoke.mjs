import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'george-live-runtime-smoke-'))
const file = join(dir, 'smoke.ts')

writeFileSync(file, `
import { readFileSync } from 'node:fs'
import { buildLiveOutcomeObservation } from '${process.cwd()}/lib/george/live-runtime/live-outcome-review'
import {
  createConversationPackage,
  updateAfterLive,
} from '${process.cwd()}/lib/george/conversation-packages/index.mjs'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const panelSource = readFileSync('${process.cwd()}/components/george/live/LiveRoomStatusPanel.tsx', 'utf8')

assert(panelSource.includes('onRoomToggle'), 'LIVE runtime console should expose room on/off control')
assert(panelSource.includes('onVoiceToggle'), 'LIVE runtime console should expose audio on/off control')
assert(panelSource.includes('onSupportPressed'), 'LIVE runtime console should expose Guidance support control')
assert(panelSource.includes('onCommunicationPressed'), 'LIVE runtime console should expose Communication control')
assert(panelSource.includes('onConversationPressed'), 'LIVE runtime console should expose Conversation control')
assert(panelSource.includes('After LIVE'), 'Conversation control should remain post-LIVE only')
assert(!panelSource.includes('{safeObjectiveLabel}'), 'LIVE primary console should not render outcome/objective mirror')
assert(!panelSource.includes('MUTE'), 'LIVE footer audio duplicate should not return to runtime console')

const outcomeReview = buildLiveOutcomeObservation({
  desiredOutcome: 'secure investor follow-up',
  transcript: 'That sounds interesting. Send me the deck and implementation materials before the next meeting.',
  supportSummary: 'GEORGE preserved the follow-up path.',
  outcomeGovernor: {
    movementState: 'advancing',
    move: 'direct_response',
    confidence: 0.82,
    reason: 'Investor requested materials.',
  } as any,
})

assert(outcomeReview.observedProgress === 'improving', 'Outcome Review should detect improving LIVE progress')
assert(outcomeReview.currentState.includes('Advancing'), 'Outcome Review should preserve runtime movement state')
assert(outcomeReview.bestAvailablePath.includes('Respond directly'), 'Outcome Review should carry best available path')
assert(outcomeReview.assistanceOptions.includes('Prepare follow-up.'), 'Outcome Review should produce post-LIVE assistance options')

const pkg = createConversationPackage({
  desiredOutcome: 'secure investor follow-up',
  conversationType: 'investor meeting',
}, { timestamp: '2026-07-02T01:00:00.000Z' })

const updated = updateAfterLive(pkg, {
  summary: {
    id: 'runtime-summary-1',
    type: 'live_summary',
    suggestedNextAction: 'Send the implementation materials and schedule the next meeting.',
  },
  outcomeReview,
}, { timestamp: '2026-07-02T01:05:00.000Z' })

assert(updated.liveSummaries.length === 1, 'LIVE runtime should hand summary into Conversation Package')
assert(updated.outcomeProgression.length === 1, 'LIVE runtime should hand Outcome Review into package progression')
assert(updated.learning.length === 1, 'LIVE runtime should hand Outcome Review into package learning')
assert(updated.futureActions.length === 1, 'LIVE runtime should hand summary next action into package future action')

console.log('GEORGE LIVE runtime smoke passed')
`)

try {
  execFileSync('npx', ['tsx', file], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}
