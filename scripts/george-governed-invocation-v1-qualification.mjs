import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const composer = read('lib/george/runtime/runtime-context-composer.ts')
const pipeline = read('lib/george/runtime/runtime-pipeline.ts')
const route = read('app/api/chat/route.ts')
const judgment = read('lib/george/runtime/operational-judgment.ts')

assert(
  composer.includes('GOVERNED_INVOCATION_CONTRACT_VERSION = 1 as const') &&
    composer.includes('export type GovernedInvocationContractV1'),
  'Governed Invocation Contract V1 is not explicitly versioned.',
)
assert(
  route.includes('createGovernedInvocationContractV1({') &&
    route.indexOf('createGovernedInvocationContractV1({') <
      route.indexOf('resolveGeorgeRuntimePipeline(governedInvocation)'),
  'The website route does not enter the runtime through the canonical V1 contract.',
)
assert(
  pipeline.includes(
    'const invocation = normalizeGovernedInvocationContractV1(invocationValue)',
  ) && pipeline.includes('const input = invocation.input'),
  'The runtime pipeline does not consume the normalized V1 contract.',
)
assert(
  !route.includes('runtimeAuthoritySnapshot: {\n        ...runtimeAuthoritySnapshot') &&
    !route.includes('providerSemanticJudgment,\n      },'),
  'Raw provider semantic proposals remain embedded in canonical runtime authority output.',
)

const acceptanceOwners = [composer, pipeline, route, judgment].filter((source) =>
  source.includes('export function resolveProviderOperationalJudgment'),
)
assert(
  acceptanceOwners.length === 1 && acceptanceOwners[0] === judgment,
  'Operational Judgment is no longer the sole provider-proposal judgment owner.',
)

for (const field of [
  'organizationId',
  'membershipId',
  'organizationRole',
  'organizationPermissions',
  'sharedBriefingId',
  'organizationalPolicy',
  'organizationalAuthority',
]) {
  assert(
    !new RegExp(`\\b${field}\\??\\s*:`).test(composer),
    `The V1 contract introduced unsupported organizational authority: ${field}.`,
  )
}

const normalizationOwners = [composer, pipeline, route].filter((source) =>
  source.includes('export function normalizeGovernedInvocationContractV1'),
)
assert(
  normalizationOwners.length === 1 && normalizationOwners[0] === composer,
  'A duplicate governed-invocation normalization owner was introduced.',
)

const directory = mkdtempSync(join(tmpdir(), 'george-invocation-v1-'))
const qualification = join(directory, 'qualification.ts')

writeFileSync(
  qualification,
  `
import {
  GOVERNED_INVOCATION_CONTRACT_VERSION,
  createGovernedInvocationContractV1,
  normalizeGovernedInvocationContractV1,
} from '${root}/lib/george/runtime/runtime-context-composer'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const valid = {
  version: GOVERNED_INVOCATION_CONTRACT_VERSION,
  source: 'website_adapter',
  provenance: {
    adapter: 'app_api_chat',
    userInput: 'current_conversation',
    sessionAuthority: 'authenticated_session',
    preparationEvidence: 'validated_preparation_projection',
    operationalMemoryEvidence: 'authenticated_user_scope',
    runtimeInference: 'bounded_runtime_evidence',
    providerProposal: 'excluded_from_invocation_authority',
  },
  input: {
    currentRuntime: 'normal_george',
    latestUserText: 'Help me prepare for the current conversation.',
    previousUserText: 'The desired outcome is a concrete next step.',
    voiceMode: false,
    objectiveKnown: true,
    signalUsable: true,
    executionImminent: false,
    tier: 'brilliant',
    hasImageInput: false,
    intentState: {},
    runtimeArbitration: {},
    judgmentSurface: {},
    continuityRestoration: {},
    outcomeSignals: {},
    adaptiveProfile: {},
    liveRecommendationEvidence: {},
    operationalSignals: [],
    providerPrompt: {
      languageRule: '',
      modeBlock: '',
      baseSystemPrompt: '',
      messageSourceBlock: '',
      controlStateBlock: '',
      runtimeScoresBlock: '',
      scoreAwareSteeringBlock: '',
      conversationEngineRulesBlock: '',
      universalLiveOpeningBlock: '',
      liveDisciplineBlock: '',
      dynamicRuntimeBlocks: '',
      includeLiveDiscipline: false,
      recentMessages: [
        { role: 'user', content: 'Help me prepare for the current conversation.' },
      ],
    },
    governedContextNotes: {
      adaptiveUserProfileNote: 'Current-session evidence only.',
    },
  },
} as const

const normalized = normalizeGovernedInvocationContractV1(valid)
assert(normalized?.version === 1, 'Valid current input did not normalize as V1.')
assert(normalized?.input.latestUserText === valid.input.latestUserText, 'Current input changed during normalization.')
assert(normalized?.provenance.userInput === 'current_conversation', 'User evidence provenance was not preserved.')
assert(normalized?.provenance.preparationEvidence === 'validated_preparation_projection', 'Preparation provenance was not preserved.')
assert(normalized?.provenance.runtimeInference === 'bounded_runtime_evidence', 'Runtime inference provenance was not preserved.')
assert(normalized?.provenance.providerProposal === 'excluded_from_invocation_authority', 'Provider proposal exclusion was not preserved.')
assert(Object.isFrozen(normalized) && Object.isFrozen(normalized?.input), 'Normalized invocation is mutable.')

const created = createGovernedInvocationContractV1(valid)
assert(created.version === 1, 'The canonical V1 constructor rejected valid current input.')

assert(
  normalizeGovernedInvocationContractV1({ ...valid, version: 2 }) === null,
  'An unsupported invocation version did not fail closed.',
)
assert(
  normalizeGovernedInvocationContractV1({ ...valid, version: '1' }) === null,
  'A malformed invocation version did not fail closed.',
)
assert(
  normalizeGovernedInvocationContractV1({
    ...valid,
    input: { ...valid.input, organizationId: 'untrusted-org' },
  }) === null,
  'Unproven organization identity entered the V1 contract.',
)
assert(
  normalizeGovernedInvocationContractV1({
    ...valid,
    input: { ...valid.input, organizationalAuthority: ['negotiate-pricing'] },
  }) === null,
  'Unproven organizational authority entered the V1 contract.',
)
assert(
  normalizeGovernedInvocationContractV1({
    ...valid,
    input: {
      ...valid.input,
      providerSemanticJudgment: { speechComposition: { accepted: true } },
    },
  }) === null,
  'A raw provider proposal entered invocation authority.',
)

let malformedCreateFailed = false
try {
  createGovernedInvocationContractV1({ ...valid, version: 2 } as never)
} catch {
  malformedCreateFailed = true
}
assert(malformedCreateFailed, 'The canonical constructor did not fail safely.')
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

console.log('GEORGE Governed Invocation Contract V1 qualification passed')
