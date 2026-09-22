import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const provider = read('lib/george/runtime/provider/normal-provider.ts')
const route = read('app/api/chat/route.ts')
const pipeline = read('lib/george/runtime/runtime-pipeline.ts')
const judgment = read('lib/george/runtime/operational-judgment.ts')

const acceptanceOwners = [provider, route, pipeline, judgment].filter((source) =>
  source.includes('export function resolveSpeechCompositionJudgment'),
)

assert(
  acceptanceOwners.length === 1 &&
    judgment.includes('proposal: input.providerSpeechComposition || null'),
  'Operational Judgment is not the sole speech-composition acceptance owner.',
)
assert(
  provider.includes(
    'speechComposition: options.speechCompositionAllowed\n      ? parseSpeechCompositionProposal',
  ) &&
    route.includes(
      'providerSpeechComposition:\n          providerSemanticJudgment?.speechComposition || null',
    ) &&
    pipeline.includes(
      'providerSpeechComposition: input.providerSpeechComposition',
    ),
  'Provider -> route -> pipeline -> Operational Judgment transport is incomplete.',
)
assert(
  provider.includes('speechCompositionAllowed: false') &&
    provider.includes('speechCompositionAllowed: true') &&
    !/export type NormalProviderSemanticProposalResult\s*=\s*\{[^}]*\btext:/s.test(
      provider,
    ),
  'The semantic pass can be treated as governed final wording.',
)
assert(
  provider.includes('acceptedJudgment.speechComposition?.accepted === true') &&
    provider.includes(
      '!acceptedJudgment.speechComposition.clarificationRequired',
    ),
  'Unaccepted speech composition can enter governed realization authority.',
)
assert(
  judgment.includes('durablePersistenceAuthorized: false'),
  'Speech composition gained durable-persistence authority.',
)

const dir = mkdtempSync(join(tmpdir(), 'george-expression-m2-'))
const file = join(dir, 'qualification.ts')

writeFileSync(
  file,
  `
import {
  buildNormalExecutionAuthorityAttestation,
  buildNormalExecutionInstruction,
  parseNormalSemanticProposalResult,
} from '${root}/lib/george/runtime/provider/normal-provider'
import {
  resolveOperationalJudgment,
  type ProviderSpeechCompositionProposal,
} from '${root}/lib/george/runtime/operational-judgment'
import { selectProviderResolvedGeorgeRuntimeAuthoritySnapshot } from '${root}/lib/george/runtime/runtime-pipeline'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

const dimensions = {
  perspective: 'M2_PERSPECTIVE_MARKER',
  nounSelection: 'M2_NOUN_MARKER',
  verbConstruction: 'M2_VERB_MARKER',
  modifierDensity: 'M2_MODIFIER_MARKER',
  syntax: 'M2_SYNTAX_MARKER',
  rhythm: 'M2_RHYTHM_MARKER',
  figurativeLanguage: 'M2_FIGURATIVE_MARKER',
  implication: 'M2_IMPLICATION_MARKER',
} as const

const proposal = (
  overrides: Partial<ProviderSpeechCompositionProposal> = {},
): ProviderSpeechCompositionProposal => ({
  dimensions,
  requestedScope: 'live_room',
  signalSource: 'runtime_inference',
  confidence: 0.84,
  evidence: [
    'The desired outcome requires a clear commitment.',
    'The counterpart responds better to concrete language.',
  ],
  decisionFactors: ['desired_outcome', 'counterpart_evidence'],
  protectedMeaning: {
    objective: true,
    facts: true,
    commitments: true,
    boundaries: true,
  },
  reason: 'Use bounded composition to serve the current outcome.',
  ...overrides,
})

const semanticEnvelope = (speechComposition: unknown, text?: string) =>
  JSON.stringify({
    ...(text ? { text } : {}),
    semanticIntent: 'answer',
    semanticJudgment: { speechComposition },
  })

const parsed = parseNormalSemanticProposalResult(
  semanticEnvelope(proposal(), 'PRE_AUTHORIZED_TEXT_MUST_NOT_SURVIVE'),
)!
assert(parsed && !('text' in parsed), 'Semantic-pass text survived as final wording.')
assert(
  parsed.semanticJudgment.speechComposition &&
    Object.entries(dimensions).every(
      ([dimension, value]) =>
        parsed.semanticJudgment.speechComposition?.dimensions[
          dimension as keyof typeof dimensions
        ] === value,
    ),
  'One or more P/N/V/M/S/R/F/I dimensions failed normalization transport.',
)

const malformed = {
  ...proposal(),
  dimensions: {
    ...dimensions,
    implication: 42,
  },
}
assert(
  parseNormalSemanticProposalResult(semanticEnvelope(null))?.semanticJudgment
    .speechComposition === null &&
    parseNormalSemanticProposalResult(semanticEnvelope(malformed))
      ?.semanticJudgment.speechComposition === null,
  'Null or malformed speech composition did not fail closed.',
)

const base = resolveOperationalJudgment({
  currentRuntime: 'normal_george',
  latestUserText: 'Help me prepare the response.',
  intentState: {
    objectiveState: 'clear',
    continuityDependency: 0,
    operational: true,
    actionable: true,
  },
  runtimeArbitration: {
    winner: 'objective_advancement',
    delivery: 'normal',
    agency: 'shared',
  },
  judgmentSurface: {
    decisionSurface: 'advance',
    shouldAcquireSignal: false,
    signalSufficiency: 'sufficient',
  },
  trajectory: { confidence: 0.8, currentMove: 'advance' },
  continuityRestoration: { active: false, confidence: 0 },
  outcomeSignals: { overloadDetected: 0, executionLikelihood: 0.8 },
  adaptiveProfile: { conciseDeliveryPreference: 0.4 },
  liveRecommendationEvidence: {
    alreadyLive: false,
    signalUsable: true,
    hasConversationOutcome: true,
  },
  operationalSignals: [],
  outcomeState: {
    primaryOutcome: 'prepare a response without changing its meaning',
    immediateOutcome: 'realize the accepted response',
    phase: 'preparation',
    confidence: 0.8,
  },
} as any)

const resolveThroughPipeline = (providerSpeechComposition: ProviderSpeechCompositionProposal | null) =>
  selectProviderResolvedGeorgeRuntimeAuthoritySnapshot({
    snapshot: {
      operationalJudgment: base,
      conversationStrategy: base.conversationStrategy,
      conversationMoveDefinition: base.conversationStrategy.definition,
      executionPolicy: {} as any,
      operationalResourceMonitor: {} as any,
      source: 'runtime_pipeline',
    } as any,
    currentRuntime: 'normal_george',
    latestUserText: 'Help me prepare the response.',
    voiceMode: false,
    executionImminent: false,
    judgmentSurface: {
      decisionSurface: 'advance',
      shouldAcquireSignal: false,
      signalSufficiency: 'sufficient',
    } as any,
    providerReasoning: null,
    providerSpeechComposition,
    providerCapability: null,
    capabilityExplicitlyRequested: false,
    capabilityRecommendationMaterial: false,
  })

const acceptedAuthority = resolveThroughPipeline(
  parsed.semanticJudgment.speechComposition,
)
const accepted = acceptedAuthority.operationalJudgment.speechComposition!
assert(
  accepted.accepted &&
    accepted.authority === 'operational_judgment' &&
    accepted.acceptedScope === 'turn' &&
    Object.entries(dimensions).every(
      ([dimension, value]) =>
        accepted.dimensions[dimension as keyof typeof dimensions] === value,
    ),
  'Valid composition did not reach sole authority intact or inferred scope was not bounded.',
)
assert(
  Object.values(accepted.protectedMeaning).every(Boolean),
  'Protected objective, facts, commitments, or boundaries changed in transport.',
)
assert(
  accepted.durablePersistenceAuthorized === false,
  'Accepted expression plan authorized durable persistence.',
)

const isolatedAuthority = resolveThroughPipeline(
  proposal({
    requestedScope: 'preparation_session',
    evidence: ['One isolated terse sentence.'],
    decisionFactors: ['current_moment'],
  }),
)
assert(
  isolatedAuthority.operationalJudgment.speechComposition?.accepted === false &&
    isolatedAuthority.operationalJudgment.speechComposition?.acceptedScope === 'turn',
  'An isolated inferred signal was accepted or retained broad scope.',
)

const unsafeAuthority = resolveThroughPipeline(
  proposal({
    signalSource: 'explicit_user_instruction',
    requestedScope: 'turn',
    protectedMeaning: {
      objective: true,
      facts: true,
      commitments: false,
      boundaries: true,
    },
  }),
)
assert(
  unsafeAuthority.operationalJudgment.speechComposition?.accepted === false &&
    unsafeAuthority.operationalJudgment.speechComposition
      ?.clarificationRequired === true,
  'A protected-meaning change did not fail into canonical clarification.',
)

const durableAuthority = resolveThroughPipeline(
  proposal({
    requestedScope: 'durable_candidate',
    signalSource: 'repeated_behavior',
    evidence: ['Qualified interaction one.', 'Qualified interaction two.'],
    decisionFactors: ['desired_outcome', 'demonstrated_user_fit'],
  }),
)
assert(
  durableAuthority.operationalJudgment.speechComposition?.accepted === true &&
    durableAuthority.operationalJudgment.speechComposition
      ?.durablePersistenceAuthorized === false,
  'A durable candidate became durable persistence authority.',
)

const acceptedInstruction = buildNormalExecutionInstruction(
  acceptedAuthority.operationalJudgment,
  acceptedAuthority.executionPolicy,
)
const isolatedInstruction = buildNormalExecutionInstruction(
  isolatedAuthority.operationalJudgment,
  isolatedAuthority.executionPolicy,
)
const unsafeInstruction = buildNormalExecutionInstruction(
  unsafeAuthority.operationalJudgment,
  unsafeAuthority.executionPolicy,
)
assert(
  acceptedInstruction.includes('M2_PERSPECTIVE_MARKER') &&
    !isolatedInstruction.includes('M2_PERSPECTIVE_MARKER') &&
    !unsafeInstruction.includes('M2_PERSPECTIVE_MARKER'),
  'Rejected or clarification-required composition entered realization.',
)

const acceptedAttestation = buildNormalExecutionAuthorityAttestation(
  acceptedAuthority.operationalJudgment,
  acceptedAuthority.executionPolicy,
)
const unsafeAttestation = buildNormalExecutionAuthorityAttestation(
  unsafeAuthority.operationalJudgment,
  unsafeAuthority.executionPolicy,
)
assert(
  acceptedAttestation.speechComposition?.authority ===
    'operational_judgment' &&
    unsafeAttestation.speechComposition === null,
  'Execution attestation exposed semantic proposal or unaccepted judgment.',
)

console.log(JSON.stringify({
  providerRoutePipelineJudgmentTransport: true,
  acceptanceOwner: accepted.authority,
  dimensionsTransported: Object.keys(accepted.dimensions),
  validAcceptedScope: accepted.acceptedScope,
  malformedFailedClosed: true,
  protectedMeaningPreserved: true,
  isolatedInferenceAccepted: isolatedAuthority.operationalJudgment.speechComposition?.accepted,
  rejectedEnteredRealization: false,
  clarificationEnteredRealization: false,
  semanticTextBecameFinalWording: false,
  durablePersistenceAuthorized: accepted.durablePersistenceAuthorized,
  result: 'PASS',
}, null, 2))
`,
)

try {
  execFileSync('npx', ['tsx', file], {
    cwd: root,
    stdio: 'inherit',
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}

console.log('GEORGE Expression Milestone 2 qualification: PASS')
