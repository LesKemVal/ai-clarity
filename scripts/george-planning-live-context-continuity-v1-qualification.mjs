import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const liveContext = read('lib/george/live-runtime/live-runtime-context.ts')
const preparationOwner = read(
  'lib/george/live-runtime/live-preparation-controller.ts',
)
const liveEntry = read('app/george/live-entry/LiveEntryClient.tsx')
const livePage = read('app/george/page.tsx')
const route = read('app/api/chat/route.ts')
const pipeline = read('lib/george/runtime/runtime-pipeline.ts')
const judgment = read('lib/george/runtime/operational-judgment.ts')
const audioBridge = read('components/george/live/LiveHubDeliveryBridge.tsx')

assert(
  preparationOwner.includes('projectPreparationSessionForLiveRuntime') &&
    liveEntry.includes('projectPreparationSessionForLiveRuntime(') &&
    livePage.includes('buildLiveRuntimeContext({') &&
    route.includes('createGovernedInvocationContractV1({') &&
    pipeline.includes('resolveOperationalJudgment('),
  'The canonical preparation-to-LIVE-to-Operational-Judgment chain is incomplete.',
)
assert(
  liveContext.includes('formatBoundedPreparationEvidence(') &&
    liveContext.includes('PreparationSession remains the memory owner') &&
    !liveContext.includes('fetch(') &&
    !liveContext.includes('openai') &&
    !liveContext.includes('groq'),
  'LIVE context continuity created another memory owner or provider/model call.',
)
assert(
  (judgment.match(/export function resolveOperationalJudgment\s*\(/g) || [])
    .length === 1 &&
    !liveContext.includes('resolveOperationalJudgment('),
  'Operational Judgment is no longer the sole operational decision owner.',
)
assert(
  liveContext.includes('setup?.formulaSelection') &&
    !liveContext.includes('recommendFormula') &&
    !liveContext.includes('selectFormula'),
  'The LIVE context boundary acquired Formula recommendation authority.',
)
assert(
  audioBridge.includes("repeatableSpeechUptake: 'unconfirmed'"),
  'Planning continuity manufactured repeatable-speech uptake evidence.',
)

const directory = mkdtempSync(join(tmpdir(), 'george-planning-live-v1-'))
const qualification = join(directory, 'qualification.ts')

writeFileSync(
  qualification,
  `
import {
  createPreparationSession,
  projectPreparationSessionForLiveRuntime,
} from '${root}/lib/george/live-runtime/live-preparation-controller'
import { buildLiveRuntimeContext } from '${root}/lib/george/live-runtime/live-runtime-context'
import { normalizeGeorgeLiveSpeakerEvidence } from '${root}/lib/george/core/live-execution'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const answered = Array.from({ length: 8 }, (_, index) => ({
  key: index === 7 ? 'desired_outcome' : \`context_\${index}\`,
  question: index === 7 ? 'What outcome do you want?' : \`Context question \${index}\`,
  example: index === 7 ? 'For example: secure approval.' : \`Example \${index}\`,
  answer:
    index === 0
      ? 'OLD_RAW_HISTORY_SENTINEL'
      : index === 7
        ? 'Secure approval for the pilot today.'
        : \`Established answer \${index}\`,
  status: 'answered' as const,
  evidenceNeed: index === 7 ? 'desired outcome' : \`context evidence \${index}\`,
}))

const session = createPreparationSession({
  preparationSessionId: 'prep-live-continuity-v1',
  provenance: {
    entrySource: 'normal',
    restoredFrom: { kind: 'normal_session', id: 'normal-continuity-v1' },
  },
  createdAt: 100,
  updatedAt: 200,
  knowledge: {
    objective: 'Secure approval for the pilot today.',
    baselineAssumptions: ['The budget owner may still be undecided.'],
    role: 'proposal owner',
    participants: ['budget owner'],
    audience: 'budget owner',
    perspectives: [],
    conversation: { id: 'normal-continuity-v1', title: 'Pilot approval' },
    knownContext: 'The technical review is complete.',
    additionalSignals: {
      priorInteraction: 'The budget owner requested a shorter rollout plan.',
      proposedOutcome: 'Approval may happen today.',
    },
    documents: [
      {
        id: 'pilot-evidence',
        name: 'Pilot evidence',
        kind: 'document',
        summary: 'The pilot met the agreed success criteria.',
      },
    ],
  },
  briefing: {
    priorInteractions: [
      ...answered,
      {
        key: 'prior_conversation_count',
        question: 'Have you spoken before?',
        answer: '',
        status: 'unknown',
        evidenceNeed: 'whether a prior conversation occurred',
      },
    ],
    currentQuestion: {
      key: 'approval_authority',
      label: 'Approval authority',
      question: 'Who has final approval authority?',
      why: 'Authority may change the next move.',
      example: 'For example: the budget owner may need legal approval.',
      evidenceNeed: 'final approval authority',
      clarificationRequired: true,
    },
  },
  assets: {
    formula: { id: 'formula-existing-owner', version: 2, source: 'george' },
    script: { id: 'script-existing-owner', version: 3 },
  },
  workflow: {
    current: { surface: 'ready_room', phase: 'readiness' },
    history: [{ surface: 'briefing', phase: 'questions' }],
  },
  relations: { normalSessionId: 'normal-continuity-v1' },
})

const projection = projectPreparationSessionForLiveRuntime(session)
assert(projection !== null, 'Canonical preparation projection was not created.')

const context = buildLiveRuntimeContext({
  liveMode: true,
  runtimeSupport: { preparationEvidence: projection },
  setup: {
    objective: session.knowledge.objective,
    formulaSelection: {
      formulaId: session.assets.formula!.id,
      formulaVersion: session.assets.formula!.version,
      source: session.assets.formula!.source,
    },
  },
  steeringLabels: [],
})

assert(
  context.includes('Preparation session: prep-live-continuity-v1') &&
    context.includes('The technical review is complete.') &&
    context.includes('The pilot met the agreed success criteria.'),
  'Useful established preparation context did not survive into LIVE context.',
)
assert(
  context.includes('Answer: Secure approval for the pilot today.') &&
    context.includes('source=confirmed_preparation_answer; authority=user_owned; rank=2') &&
    context.includes('Objective: Secure approval for the pilot today. [source=persisted_preparation; authority=provisional'),
  'User-authoritative outcome evidence became indistinguishable from provisional preparation context.',
)
assert(
  context.includes('Baseline assumption 1: The budget owner may still be undecided. [source=inference; authority=provisional') &&
    context.includes('Additional signal proposedOutcome: Approval may happen today. [source=inference; authority=provisional'),
  'Inferred preparation context was promoted to authoritative fact.',
)
assert(
  context.includes('Current preparation question (not an answer): Who has final approval authority?') &&
    context.includes('unresolved=whether a prior conversation occurred') &&
    !context.includes('Answer: Who has final approval authority?'),
  'Missing or unresolved preparation information became known when LIVE started.',
)
assert(
  JSON.stringify(session).includes('OLD_RAW_HISTORY_SENTINEL') &&
    !context.includes('OLD_RAW_HISTORY_SENTINEL') &&
    context.includes('older confirmed answer(s) remain in PreparationSession memory outside this per-turn attention view') &&
    !context.includes('Preparation readiness and workflow:'),
  'The per-turn LIVE context replayed the full preparation history or displaced canonical memory.',
)
assert(
  context.includes('Selected Formula: formula-existing-owner (v2, george)'),
  'Context continuity lost the existing selected Formula reference.',
)
assert(
  !context.includes('script-existing-owner'),
  'Context continuity injected an unselected Script.',
)
assert(
  normalizeGeorgeLiveSpeakerEvidence(undefined).speaker === 'unclear',
  'Absent LIVE speaker evidence no longer fails closed to unclear.',
)

console.log(JSON.stringify({
  preparationSessionId: projection?.preparationSessionId,
  retainedMemoryInteractions: session.briefing.priorInteractions.length,
  boundedContextContainsOldestAnswer: context.includes('OLD_RAW_HISTORY_SENTINEL'),
  objectiveAuthorities: ['user_owned', 'provisional'],
  absentSpeaker: normalizeGeorgeLiveSpeakerEvidence(undefined).speaker,
}))
`,
)

try {
  execFileSync(join(root, 'node_modules', '.bin', 'tsx'), [qualification], {
    cwd: root,
    stdio: 'inherit',
  })
} finally {
  rmSync(directory, { recursive: true, force: true })
}

console.log('GEORGE Planning to LIVE Relevant Context Continuity V1 qualification passed')
