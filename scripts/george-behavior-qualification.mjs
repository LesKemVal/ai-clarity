import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { GEORGE_BEHAVIOR_FIXTURES } from './george-behavior-fixtures.mjs'

const dir = mkdtempSync(join(tmpdir(), 'george-behavior-qualification-'))
const fixtureFile = join(dir, 'fixtures.json')
const qualificationFile = join(dir, 'qualification.ts')

writeFileSync(
  fixtureFile,
  JSON.stringify(GEORGE_BEHAVIOR_FIXTURES),
  'utf8'
)

writeFileSync(
  qualificationFile,
  `
import { readFileSync } from 'node:fs'
import { buildJudgmentSurfaceState } from '${process.cwd()}/lib/george/runtime/judgment-surface'
import { resolveOperationalJudgment } from '${process.cwd()}/lib/george/runtime/operational-judgment'

type Fixture = {
  id: string
  prompt: string
  objectiveKnown: boolean
  expectedAction: string
  expectedMove: string
  expectedSignal?: string
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const fixtures = JSON.parse(
  readFileSync(${JSON.stringify(fixtureFile)}, 'utf8')
) as Fixture[]

const results = []

for (const fixture of fixtures) {
  const judgmentSurface = buildJudgmentSurfaceState({
    latestUserText: fixture.prompt,
    objectiveKnown: fixture.objectiveKnown,
    livePressure: false,
    pressureHigh: false,
  })

  const baseInput = {
    latestUserText: fixture.prompt,
    judgmentSurface,
    intentState: {
      objectiveState: fixture.objectiveKnown ? 'clear' : 'unknown',
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
      hasConversationOutcome: fixture.objectiveKnown,
      trajectorySignal: true,
    },
    outcomeState: {
      primaryOutcome: fixture.objectiveKnown
        ? 'advance the user toward the desired outcome'
        : '',
      immediateOutcome: 'determine the next highest-value move',
      phase: 'preparation',
      confidence: fixture.objectiveKnown ? 0.72 : 0.48,
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
    fixture.id + ': shared action diverged: Normal=' +
      normal.action + ', LIVE=' + live.action
  )

  assert(
    normal.decisionSurface === live.decisionSurface,
    fixture.id + ': decision surface diverged'
  )

  assert(
    normal.signalAcquisition.shouldAcquire ===
      live.signalAcquisition.shouldAcquire,
    fixture.id + ': signal acquisition judgment diverged'
  )

  assert(
    normal.signalAcquisition.requestedSignal ===
      live.signalAcquisition.requestedSignal,
    fixture.id + ': highest-value missing signal diverged'
  )

  assert(
    normal.conversationStrategy.move ===
      live.conversationStrategy.move,
    fixture.id + ': conversation strategy diverged'
  )

  assert(
    normal.action === fixture.expectedAction,
    fixture.id + ': expected action ' + fixture.expectedAction +
      ', received ' + normal.action
  )

  assert(
    normal.conversationStrategy.move === fixture.expectedMove,
    fixture.id + ': expected move ' + fixture.expectedMove +
      ', received ' + normal.conversationStrategy.move
  )

  const requestedSignal = String(
    normal.signalAcquisition.requestedSignal || ''
  ).trim()

  assert(
    requestedSignal.length > 0,
    fixture.id + ': no missing signal was selected'
  )

  if (fixture.expectedSignal) {
    assert(
      requestedSignal === fixture.expectedSignal,
      fixture.id + ': expected signal "' + fixture.expectedSignal +
        '", received "' + requestedSignal + '"'
    )
  }

  results.push({
    id: fixture.id,
    prompt: fixture.prompt,
    action: normal.action,
    decisionSurface: normal.decisionSurface,
    requestedSignal,
    conversationMove: normal.conversationStrategy.move,
    sharedReasoningMatch: true,
  })
}

console.log(JSON.stringify({
  doctrine: 'Execution may compress. Judgment may not.',
  fixtureCount: fixtures.length,
  result: 'PASS',
  fixtures: results,
}, null, 2))
`,
  'utf8'
)

try {
  execFileSync('npx', ['tsx', qualificationFile], {
    cwd: process.cwd(),
    stdio: 'inherit',
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}
