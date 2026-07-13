import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'george-shared-reasoning-'))
const file = join(dir, 'qualification.ts')

writeFileSync(file, `
import { buildJudgmentSurfaceState } from '${process.cwd()}/lib/george/runtime/judgment-surface'
import { resolveOperationalJudgment } from '${process.cwd()}/lib/george/runtime/operational-judgment'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const scenario = 'I need to prepare for an investor meeting.'

const judgmentSurface = buildJudgmentSurfaceState({
  latestUserText: scenario,
  objectiveKnown: true,
  livePressure: false,
  pressureHigh: false,
})

const baseInput = {
  latestUserText: scenario,
  judgmentSurface,
  intentState: {
    objectiveState: 'clear',
    continuityDependency: 0,
    operational: true,
    actionable: true,
  },
  runtimeArbitration: {
    winner: 'objective_advancement',
    delivery: 'normal',
    agency: 'user_led',
  },
  trajectory: {
    confidence: 0.72,
    currentMove: 'prepare',
  },
  continuityRestoration: {
    active: false,
    confidence: 0,
  },
  outcomeSignals: {
    overloadDetected: 0,
    executionLikelihood: 0.45,
  },
  adaptiveProfile: {
    conciseDeliveryPreference: 0.3,
  },
  liveRecommendationEvidence: {
    alreadyLive: false,
    signalUsable: true,
    executionImminent: false,
    conversationPressure: false,
    pressureHigh: false,
    hasConversationOutcome: true,
    trajectorySignal: true,
  },
  outcomeState: {
    primaryOutcome: 'prepare for a successful investor meeting',
    immediateOutcome: 'choose the best preparation path',
    phase: 'preparation',
    confidence: 0.72,
  },
} as any

const normal = resolveOperationalJudgment({
  ...baseInput,
  currentRuntime: 'normal_george',
})

const live = resolveOperationalJudgment({
  ...baseInput,
  currentRuntime: 'live_george',
})

assert(
  normal.action === live.action,
  \`shared action diverged: Normal=\${normal.action}, LIVE=\${live.action}\`
)

assert(
  normal.decisionSurface === live.decisionSurface,
  \`decision surface diverged: Normal=\${normal.decisionSurface}, LIVE=\${live.decisionSurface}\`
)

assert(
  normal.signalAcquisition.shouldAcquire === live.signalAcquisition.shouldAcquire,
  'signal acquisition judgment diverged between Normal and LIVE'
)

assert(
  normal.signalAcquisition.requestedSignal ===
    live.signalAcquisition.requestedSignal,
  'highest-value missing signal diverged between Normal and LIVE'
)

assert(
  normal.conversationStrategy.move === live.conversationStrategy.move,
  \`conversation strategy diverged: Normal=\${normal.conversationStrategy.move}, LIVE=\${live.conversationStrategy.move}\`
)

assert(
  normal.action === 'acquire_smallest_signal',
  \`expected qualification before commitment, received \${normal.action}\`
)

assert(
  normal.conversationStrategy.move === 'ask',
  \`expected an ask move before preparation commitment, received \${normal.conversationStrategy.move}\`
)

const requestedSignal = String(
  normal.signalAcquisition.requestedSignal || ''
).trim()

assert(
  requestedSignal.length > 0,
  'shared reasoning did not identify a missing signal'
)

assert(
  requestedSignal === 'the specific outcome this preparation needs to achieve',
  'expected the highest-value preparation signal, received: ' + requestedSignal
)

console.log(JSON.stringify({
  scenario,
  doctrine: 'Execution may compress. Judgment may not.',
  sharedJudgment: {
    action: normal.action,
    decisionSurface: normal.decisionSurface,
    shouldAcquireSignal: normal.signalAcquisition.shouldAcquire,
    requestedSignal,
    conversationMove: normal.conversationStrategy.move,
  },
  result: 'PASS',
}, null, 2))
`)

try {
  execFileSync('npx', ['tsx', file], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}
