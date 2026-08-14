import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const read = (path) => readFileSync(join(root, path), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const signalRoute = read('app/api/george/live/signal-question/route.ts')
const authorizedSignalQuestionOwner = read(
  'lib/george/live-runtime/authorized-signal-question.ts',
)
const chatRoute = read('app/api/chat/route.ts')
const page = read('app/george/page.tsx')
const provider = read('lib/george/runtime/provider/normal-provider.ts')
const judgmentOwner = read('lib/george/runtime/operational-judgment.ts')
const runtimePipeline = read('lib/george/runtime/runtime-pipeline.ts')
const normalReasoningGovernor = read(
  'lib/george/runtime/normal-reasoning-governor.ts',
)
const runtimeContextComposer = read(
  'lib/george/runtime/runtime-context-composer.ts',
)
const operationalExcellence = read(
  'lib/george/chat/operational-excellence.ts',
)
const postResponseGovernance = read(
  'lib/george/runtime/post-response-governance.ts',
)
const preProviderResolver = read(
  'lib/george/runtime/pre-provider-send-resolution.ts',
)
const preProviderResolverImplementation = preProviderResolver.slice(
  preProviderResolver.indexOf('export function resolvePreProviderSend'),
)
const operationalMemoryOwner = read(
  'lib/george/operational-memory/operational-memory.ts',
)
const formulaLibraryOwner = read(
  'lib/george/operational-memory/formula-library.ts',
)
const preparationController = read(
  'lib/george/live-runtime/live-preparation-controller.ts',
)

assert(
  !signalRoute.includes('executionDecision') &&
    !signalRoute.includes('execution_ready') &&
    !signalRoute.includes('execution_opportunity') &&
    !signalRoute.includes('continue_normal'),
  'signal-question still owns a final operational disposition',
)
assert(
  signalRoute.includes("if (authorizedEvidenceNeed)") &&
    signalRoute.includes('formulateAuthorizedSignalQuestion') &&
    authorizedSignalQuestionOwner.includes(
      'export async function formulateAuthorizedSignalQuestion',
    ) &&
    authorizedSignalQuestionOwner.includes(
      'Do not decide whether another question should be asked',
    ) &&
    authorizedSignalQuestionOwner.includes(
      'You may not replace the question',
    ),
  'signal-question is not constrained to canonical shared evidence authorization',
)
assert(
  judgmentOwner.includes('resolveProviderOperationalJudgment') &&
    judgmentOwner.includes("source: 'operational_judgment'") &&
    chatRoute.includes('selectProviderResolvedGeorgeRuntimeAuthoritySnapshot'),
  'provider inference does not terminate at canonical Operational Judgment',
)
assert(
  chatRoute.includes(
    'operationalResourceMonitor:\n        runtimeAuthoritySnapshot.operationalResourceMonitor',
  ),
  'the chat response can return a provisional resource monitor instead of the accepted authority snapshot monitor',
)
assert(
  !page.includes('payload?.executionDecision') &&
    !page.includes('executionMessage') &&
    page.includes('preparationContext: preparationSession') &&
    page.includes('await handleSend(reasoningAnchor') &&
    page.indexOf('normalOperationalJudgmentRequestRef.current') <
      page.indexOf('fetch("/api/george/live/signal-question"'),
  'preparation still bypasses canonical provider/presentation with executionDecision system_override',
)
assert(
  page.includes('void requestNormalAdaptiveQuestion(nextPreparationSession)') &&
    page.includes('priorInteractions') &&
    page.includes('additionalSignals'),
  'adaptive answers are not available to the subsequent evidence and judgment pass',
)
assert(
  chatRoute.includes('preparationContext?.formula') &&
    chatRoute.includes('operationalMemory.retrieveSelected') &&
    operationalMemoryOwner.includes('resolveSelectedOperationalFormula') &&
    formulaLibraryOwner.includes(
      'formula.version !== formulaVersion',
    ) &&
    formulaLibraryOwner.includes('canAccessOperationalFormula') &&
    formulaLibraryOwner.includes(
      'reasons: ["selected_current_preparation"]',
    ),
  'selected Formula does not reach reasoning through the validated operational-memory boundary',
)
assert(
  provider.includes('Operational strategy and Formula evidence may inform this inference') &&
    !/hiring interview|capital raise|sales call|negotiation script/i.test(provider),
  'provider operational reasoning is domain-hardcoded or does not treat Formula as strategic evidence',
)
assert(
  page.includes(
    'requestPurpose: NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST',
  ) &&
    chatRoute.includes(
      'body?.requestPurpose === NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST',
    ) &&
    runtimePipeline.includes('prompt.operationalJudgmentRequest') &&
    runtimeContextComposer.includes(
      'It is a control-plane reasoning request, not a new conversational user turn.',
    ) &&
    provider.includes(
      'It must not answer the preceding user prompt as another ordinary Normal turn',
    ),
  'Normal LIVE judgment still enters the ordinary Normal conversational lane',
)
assert(
  chatRoute.includes('buildNormalLiveOperationalJudgmentResult') &&
    chatRoute.includes('operationalJudgmentResult,') &&
    page.includes('data?.operationalJudgmentResult') &&
    page.includes(
      'judgmentResult.operationalJudgmentResult.operationalJudgment',
    ),
  'structured canonical Operational Judgment does not survive the chat boundary or reach the page',
)
assert(
  page.includes(
    'options?.requestPurpose ===\n          NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST',
  ) &&
    page.indexOf(
      'options?.requestPurpose ===\n          NORMAL_LIVE_OPERATIONAL_JUDGMENT_REQUEST',
    ) < page.indexOf('let finalContent = String(data.message || "")') &&
    page.includes(
      'judgmentResult.operationalJudgmentResult.message || ""',
    ) &&
    !page.includes('deferSignalAcquisitionPresentation') &&
    !page.includes('includeHiddenTextInRequest'),
  'hidden Operational Judgment can still insert an ordinary or duplicate assistant response',
)
assert(
  runtimeContextComposer.includes(
    "For execution_ready or execution_opportunity, make the interaction, GEORGE's situation-derived execution functions",
  ) &&
    runtimeContextComposer.includes(
      'For continue_normal, state why Normal is stronger now and identify the actual Normal action',
    ) &&
    runtimeContextComposer.includes(
      'For other_action, state the identified stronger action',
    ),
  'Operational Judgment presentation lacks disposition-specific operational substance',
)
assert(
  provider.includes('"operationalObjective"') &&
    provider.includes('"consequentialUncertainty"') &&
    provider.includes('"georgeResolvableWork"') &&
    provider.includes('"interactionUseful"') &&
    provider.includes('"liveMateriallyImprovesExecution"') &&
    provider.includes('"evidenceIsUserOwned"') &&
    provider.includes('"consequentialToNextAction"'),
  'provider semantic evidence cannot express the complete operational decision',
)
assert(
  provider.includes('runNormalSemanticProposal') &&
    provider.includes('runNormalExecutionCompletion') &&
    provider.includes('This is the reasoning phase. Do not generate the final user-facing answer.') &&
    provider.includes('You are executing an already-decided operational action.') &&
    provider.includes('Do not return semantic reasoning, a revised judgment') &&
    chatRoute.indexOf('runNormalSemanticProposal({') <
      chatRoute.indexOf('selectProviderResolvedGeorgeRuntimeAuthoritySnapshot({') &&
    chatRoute.indexOf('selectProviderResolvedGeorgeRuntimeAuthoritySnapshot({') <
      chatRoute.indexOf('runNormalExecutionCompletion({') &&
    chatRoute.includes('preAcceptanceProviderTextUsed: false') &&
    chatRoute.includes('normalOperationalResult?.message || \'\''),
  'ordinary Normal does not enforce semantic proposal -> canonical judgment -> execution',
)
const acceptedJudgmentAlias =
  chatRoute.includes(
    'const acceptedJudgment =\n        runtimeAuthoritySnapshot.operationalJudgment',
  )
const acceptedJudgmentExecutionBindings =
  chatRoute.match(
    /acceptedJudgment,\s*\n\s*acceptedExecutionPolicy:/g,
  ) || []
const acceptedPolicyExecutionBindings =
  chatRoute.match(
    /acceptedExecutionPolicy:\s*\n\s*runtimeAuthoritySnapshot\.executionPolicy/g,
  ) || []
assert(
  normalReasoningGovernor.includes(
    'fallback: NormalGeorgeProviderTarget | null',
  ) &&
    normalReasoningGovernor.includes(
      "reason: 'Groq fast-lane realization unavailable'",
    ) &&
    chatRoute.includes(
      'const providerFallback = providerResolution.fallback',
    ) &&
    chatRoute.includes('provider: providerFallback.provider') &&
    chatRoute.includes('model: providerFallback.model') &&
    acceptedJudgmentAlias &&
    acceptedJudgmentExecutionBindings.length === 2 &&
    acceptedPolicyExecutionBindings.length === 2 &&
    !chatRoute.includes('openAIFallbackModel') &&
    !chatRoute.includes('OPENAI_MODEL_INTELLIGENT') &&
    !chatRoute.includes('GROQ_NORMAL_FAST_MODEL'),
  'the chat route can redefine provider/model fallback policy or execute fallback under different canonical authority',
)
assert(
  judgmentOwner.includes('executionGenerationRequired') &&
    judgmentOwner.includes('buildNormalOperationalResponseResult') &&
    runtimePipeline.includes('buildProviderResolvedNormalExecutionRequest') &&
    runtimeContextComposer.includes(
      'accepted canonical Operational Judgment. Execute this authority without reconsidering or replacing it.',
    ) &&
    runtimeContextComposer.includes(
      'This block is final execution authority. Perform the accepted action',
    ),
  'accepted Operational Judgment is not the sole ordinary Normal execution authority',
)
assert(
  !chatRoute.includes('semanticProposal?.text') &&
    !chatRoute.includes('semanticProposal.text') &&
    provider.includes('Do not include a top-level text field') &&
    provider.includes('Preserve rich execution substance proportionate to the request'),
  'pre-acceptance answer text can still escape or rich execution was collapsed',
)
assert(
  !page.includes('preProviderResolution.mode === "direct"') &&
    !preProviderResolverImplementation.includes("mode: 'direct'"),
  'a page-level pre-provider responder can still author operational Normal output',
)
assert(
  !chatRoute.includes(
      'if (hasImageInput && !operationalJudgmentRequest)',
    ) &&
    chatRoute.includes(
      "if (hasImageInput && currentRuntime === 'live_george')",
    ) &&
    chatRoute.includes(
      "const normalSemanticPhase = currentRuntime === 'normal_george'",
    ) &&
    provider.includes("type: 'image_url'"),
  'multimodal Normal can still expose a route-local pre-canonical provider response',
)
const providerExecutionAcceptanceIndex = chatRoute.indexOf(
  'executionText: executionResult?.text || null',
)
const presentationFormattingIndex = chatRoute.indexOf(
  'reply = enforcePresentationMode(reply, presentationMode)',
)
const finalExecutionAcceptanceIndex = chatRoute.indexOf(
  'executionText: reply',
  presentationFormattingIndex,
)
assert(
  provider.includes('parseNormalExecutionResult') &&
    provider.includes(
      'authority: buildNormalExecutionAuthorityAttestation(',
    ) &&
    !provider.includes('authorityMatches') &&
    judgmentOwner.includes(
      'executionTextConformsToOperationalJudgment',
    ) &&
    operationalExcellence.includes('input.canonicalExecution') &&
    postResponseGovernance.includes(
      'input.operationalJudgment?.signalAcquisition.shouldAcquire',
    ) &&
    providerExecutionAcceptanceIndex >= 0 &&
    providerExecutionAcceptanceIndex < presentationFormattingIndex &&
    presentationFormattingIndex < finalExecutionAcceptanceIndex,
  'ordinary Normal final text is not accepted before and after formatting under one canonical authority',
)
assert(
  runtimeContextComposer.includes(
    'provisional heuristic evidence for canonical Operational Judgment',
  ) &&
    runtimeContextComposer.includes(
      'not final realization authority',
    ) &&
    runtimePipeline.includes("? 'provisional'") &&
    !runtimeContextComposer.includes(
      'Interest in LIVE is evidence of material benefit',
    ),
  'Normal LIVE provider context still treats a heuristic or LIVE interest as an accepted conclusion',
)
assert(
  page.includes('reconcileNormalPreparationSession({') &&
    page.includes('session: options.preparationContext') &&
    !page.includes('function buildNormalPreparationUserEvidence') &&
    preparationController.includes('currentNormalUserEvidence') &&
    preparationController.includes("message.role === 'user'") &&
    !preparationController.includes("message.role === 'assistant'") &&
    runtimePipeline.includes('...prompt.recentMessages'),
  'prior assistant prose is duplicated as validated preparation evidence or lost as conversation context',
)
assert(
  preparationController.includes(
    'NORMAL_PREPARATION_EVIDENCE_PRECEDENCE',
  ) &&
    preparationController.includes('projectNormalPreparationEvidence') &&
    chatRoute.includes('projectNormalPreparationEvidence({') &&
    signalRoute.includes('projectNormalPreparationEvidence({') &&
    signalRoute.includes('preparationEvidenceNeedIsAlreadyKnown') &&
    !page.includes('NORMAL_PREPARATION_EVIDENCE_PRECEDENCE') &&
    !chatRoute.includes('NORMAL_PREPARATION_EVIDENCE_PRECEDENCE') &&
    !signalRoute.includes('NORMAL_PREPARATION_EVIDENCE_PRECEDENCE'),
  'page or API routes acquired preparation evidence-precedence ownership',
)
assert(
  page.includes('{ signalAcquisitionAllowed: false }') &&
    page.includes(
      'if (payload?.nextAction !== "ask_question") {\n        await returnToCanonicalJudgment();',
    ) &&
    chatRoute.includes("message: operationalJudgmentRequest") &&
    judgmentOwner.includes(
      'input.operationalJudgment.operationalDisposition.presentation',
    ),
  'formatter failure or API presentation can bypass the accepted canonical judgment',
)
assert(
  page.includes(
    'operationalJudgment.operationalDisposition.operationalObjective ||',
  ) &&
    page.includes('explicitObjective: canonicalObjective') &&
    !page.includes(
      'normalPreparationQuestionIsOptional && normalPreparationObjective',
    ),
  'canonical objective persistence still depends on a desiredOutcome question or acquisition can be bypassed',
)

const dir = mkdtempSync(join(tmpdir(), 'george-reasoning-ownership-'))
const file = join(dir, 'qualification.ts')

writeFileSync(file, `
import {
  buildNormalLiveOperationalJudgmentResult,
  buildNormalOperationalResponseResult,
  buildOperationalPreparationContextNote,
  normalizeOperationalPreparationContext,
  resolveOperationalJudgment,
  resolveProviderOperationalJudgment,
  type ProviderOperationalReasoning,
} from '${root}/lib/george/runtime/operational-judgment'
import {
  buildNormalExecutionAuthorityAttestation,
  buildNormalExecutionInstruction,
  parseNormalExecutionResult,
  parseNormalSemanticProposalResult,
} from '${root}/lib/george/runtime/provider/normal-provider'
import { buildNormalLiveOperationalJudgmentRequestNote } from '${root}/lib/george/runtime/runtime-context-composer'
import { resolveGeorgeExecutionPolicy } from '${root}/lib/george/runtime/execution-policy'
import { resolveOperationalResourceMonitor } from '${root}/lib/george/runtime/operational-resource-monitor'
import { enforcePresentationMode } from '${root}/lib/george/chat/presentation-authority'
import { renderOperationalExcellenceOutput } from '${root}/lib/george/chat/operational-excellence'
import { appendPostResponseNotices } from '${root}/lib/george/runtime/post-response-governance'
import {
  buildGeorgeProviderRequest,
  selectProviderResolvedGeorgeRuntimeAuthoritySnapshot,
} from '${root}/lib/george/runtime/runtime-pipeline'
import { resolvePreProviderSend } from '${root}/lib/george/runtime/pre-provider-send-resolution'
import { resolveNormalGeorgeReasoning } from '${root}/lib/george/runtime/normal-reasoning-governor'
import {
  createPreparationSession,
  preparationEvidenceNeedIsAlreadyKnown,
  projectNormalPreparationEvidence,
  reconcileNormalPreparationSession,
} from '${root}/lib/george/live-runtime/live-preparation-controller'

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message)
}

function reasoning(
  input: Partial<ProviderOperationalReasoning>,
): ProviderOperationalReasoning {
  const merged = {
    operationalObjective: null,
    knownEvidence: [],
    consequentialUncertainty: null,
    georgeResolvableWork: [],
    georgeCanAdvanceWithoutUserSignal: false,
    disposition: null,
    interaction: null,
    interactionUseful: false,
    purpose: null,
    desiredResult: null,
    liveMateriallyImprovesExecution: false,
    materialLiveBenefit: null,
    strongestNextStep: null,
    rationale: null,
    presentation: null,
    signalAcquisition: {
      shouldAcquire: false,
      requestedSignal: null,
      evidenceIsUserOwned: false,
      consequentialToNextAction: false,
      reason: null,
    },
    ...input,
  } satisfies ProviderOperationalReasoning

  const acquisitionRequested =
    merged.signalAcquisition?.shouldAcquire === true

  return {
    ...merged,
    decisionComparison:
      input.decisionComparison ||
      (
        acquisitionRequested
          ? {
              bestActionNow: null,
              candidateSignal:
                merged.signalAcquisition?.requestedSignal ||
                merged.consequentialUncertainty,
              actNowOutcomeImpact: 'low',
              acquireSignalOutcomeImpact: 'high',
              signalInteractionCost: 'low',
              preferredPath: 'acquire_signal',
              bestActionNowExecutableFromKnownEvidence: false,
              bestActionNowMissingDependency:
                merged.signalAcquisition?.requestedSignal ||
                merged.consequentialUncertainty,
              reason:
                'The consequential signal materially improves the strongest next action.',
            }
          : {
              bestActionNow: merged.strongestNextStep,
              candidateSignal: null,
              actNowOutcomeImpact: merged.strongestNextStep
                ? 'high'
                : 'none',
              acquireSignalOutcomeImpact: 'none',
              signalInteractionCost: 'none',
              preferredPath: 'act_now',
              bestActionNowExecutableFromKnownEvidence: Boolean(
                merged.strongestNextStep
              ),
              bestActionNowMissingDependency: null,
              reason:
                'Current evidence supports the strongest objective-advancing action now.',
            }
      ),
  }
}

const originalGroqApiKey = process.env.GROQ_API_KEY
const originalIntelligentModel = process.env.OPENAI_MODEL_INTELLIGENT
process.env.GROQ_API_KEY = 'provider-portability-fixture'
process.env.OPENAI_MODEL_INTELLIGENT = 'accepted-openai-fallback-model'
const portableFastLaneSelection = resolveNormalGeorgeReasoning({
  userText: 'Rewrite this sentence and make it clearer.',
  tier: 'smart',
  hasImageInput: false,
})
const portableStrategicSelection = resolveNormalGeorgeReasoning({
  userText: 'Analyze the supplied tradeoffs and recommend a strategy.',
  tier: 'smart',
  hasImageInput: false,
})
if (originalGroqApiKey === undefined) {
  delete process.env.GROQ_API_KEY
} else {
  process.env.GROQ_API_KEY = originalGroqApiKey
}
if (originalIntelligentModel === undefined) {
  delete process.env.OPENAI_MODEL_INTELLIGENT
} else {
  process.env.OPENAI_MODEL_INTELLIGENT = originalIntelligentModel
}

assert(
  portableFastLaneSelection.provider === 'groq' &&
    portableFastLaneSelection.fallback?.provider === 'openai' &&
    portableFastLaneSelection.fallback.model ===
      'accepted-openai-fallback-model' &&
    portableStrategicSelection.provider === 'openai' &&
    portableStrategicSelection.fallback === null,
  'provider substitution or fallback policy escaped the canonical Normal provider-selection decision',
)

const ordinaryPreProviderSend = resolvePreProviderSend({
  text: 'Compare the supplied options and recommend the strongest one.',
  activePromptContext: null,
  activeMemoryFolder: null,
  previousUserMessages: [],
})
const governedDomainSend = resolvePreProviderSend({
  text: 'My credit cards are maxed out and I was thinking about tradelines.',
  activePromptContext: null,
  activeMemoryFolder: null,
  previousUserMessages: [],
})
const governedTrainingIntake = resolvePreProviderSend({
  text: 'I need help preparing for my GED.',
  activePromptContext: 'training_ged',
  activeMemoryFolder: null,
  previousUserMessages: [],
})
const governedTrainingFollowThrough = resolvePreProviderSend({
  text: 'I can study math for 20 minutes tonight.',
  activePromptContext: 'training_ged',
  activeMemoryFolder: null,
  previousUserMessages: [],
})
const deterministicTrainingEvaluation = resolvePreProviderSend({
  text: 'GED answers: B, B, B.',
  activePromptContext: 'training_ged',
  activeMemoryFolder: null,
  previousUserMessages: [],
})

assert(
  ordinaryPreProviderSend.mode === 'provider' &&
    governedDomainSend.mode === 'provider_with_context' &&
    governedTrainingIntake.mode === 'provider_with_context' &&
    governedTrainingFollowThrough.mode === 'provider' &&
    !('response' in ordinaryPreProviderSend) &&
    !('response' in governedDomainSend) &&
    !('response' in governedTrainingIntake) &&
    !('response' in governedTrainingFollowThrough),
  'an ordinary, domain, or training operational request can bypass canonical Normal reasoning',
)
assert(
  deterministicTrainingEvaluation.mode === 'return' &&
    deterministicTrainingEvaluation.authority === 'training' &&
    deterministicTrainingEvaluation.response.startsWith('Score:'),
  'deterministic training evaluation was incorrectly converted into an operational reasoning authority',
)

const multimodalPrompt = {
  languageRule: '',
  modeBlock: 'NORMAL',
  baseSystemPrompt: 'GEORGE',
  messageSourceBlock: '',
  controlStateBlock: '',
  runtimeScoresBlock: '',
  scoreAwareSteeringBlock: '',
  conversationEngineRulesBlock: '',
  universalLiveOpeningBlock: '',
  liveDisciplineBlock: '',
  dynamicRuntimeBlocks: '',
  includeLiveDiscipline: false,
  operationalJudgmentRequest: false,
  recentMessages: [
    {
      role: 'user' as const,
      content: 'Use this image to advance my request.',
      imageDataUrls: ['data:image/png;base64,fixture'],
    },
  ],
}
const multimodalSemanticRequest = buildGeorgeProviderRequest({
  currentRuntime: 'normal_george',
  runtimeContextBlock: 'provisional runtime evidence',
  latestUserText: 'Use this image to advance my request.',
  canonicalExecution: false,
  prompt: multimodalPrompt,
})
const multimodalExecutionRequest = buildGeorgeProviderRequest({
  currentRuntime: 'normal_george',
  runtimeContextBlock: 'PROVIDER EXECUTION AUTHORITY\\naccepted authority',
  latestUserText: 'Use this image to advance my request.',
  canonicalExecution: true,
  prompt: multimodalPrompt,
})

assert(
  multimodalSemanticRequest.messages.length === 1 &&
    multimodalSemanticRequest.messages[0]?.imageDataUrls?.[0] ===
      'data:image/png;base64,fixture' &&
    multimodalExecutionRequest.messages.length === 1 &&
    multimodalExecutionRequest.messages[0]?.imageDataUrls?.[0] ===
      'data:image/png;base64,fixture',
  'multimodal evidence does not survive both semantic proposal and governed execution request assembly',
)

const plainTextSemanticCandidate =
  parseNormalSemanticProposalResult(
    'This pre-canonical candidate prose must never become visible.',
  )
const textOnlySemanticCandidate =
  parseNormalSemanticProposalResult(
    JSON.stringify({
      text: 'This discarded semantic candidate must never become visible.',
    }),
  )

assert(
  plainTextSemanticCandidate === null &&
    textOnlySemanticCandidate === null,
  'semantic-provider failure or candidate prose can escape the structured proposal boundary',
)

const stalePreparationSession = createPreparationSession({
  preparationSessionId: 'prep-current',
  provenance: {
    entrySource: 'normal',
    restoredFrom: { kind: 'normal_session', id: 'normal-current' },
  },
  createdAt: 100,
  updatedAt: 200,
  knowledge: {
    objective: 'negotiate a lower purchase price',
    baselineAssumptions: ['The purchase probably still matters.'],
    role: 'buyer',
    participants: ['original seller'],
    audience: 'original seller',
    perspectives: [],
    conversation: {
      id: 'normal-current',
      title: 'purchase negotiation',
    },
    knownContext:
      'A detailed but stale preparation record about negotiating terms.',
    additionalSignals: {
      conversationContext: 'The seller previously offered a small discount.',
    },
    documents: [
      {
        id: 'terms-current',
        name: 'Current terms',
        kind: 'document',
        summary: 'The written terms list a cancellation window.',
      },
    ],
  },
  briefing: {
    priorInteractions: [
      {
        key: 'decision_constraint',
        question: 'What constraint changes the decision?',
        answer: 'The deadline is Friday.',
        status: 'answered',
        evidenceNeed: 'decision deadline',
      },
      {
        key: 'approval_owner',
        question: 'Who must approve the change?',
        answer: '',
        status: 'skipped',
        evidenceNeed: 'approval owner',
      },
    ],
  },
  assets: {
    formula: { id: 'formula-current', version: 3, source: 'george' },
  },
  relations: { normalSessionId: 'normal-current' },
})

const projectedPreparation = projectNormalPreparationEvidence({
  session: stalePreparationSession,
  activeNormalSessionId: 'normal-current',
  linkedPreparationSessionId: 'prep-current',
  currentConversation: [
    {
      role: 'user',
      content: 'I no longer want to negotiate. Cancel the purchase.',
    },
    {
      role: 'assistant',
      content: 'Continue negotiating and request a smaller discount.',
    },
    {
      role: 'user',
      content: 'The new audience is the cancellation team, not the seller.',
    },
    {
      role: 'user',
      content: 'My role is now cancellation requester, not negotiating buyer.',
    },
  ],
  evidenceSufficiency: 'unresolved',
})

assert(projectedPreparation !== null, 'identity-bound preparation was rejected')
assert(
  projectedPreparation!.currentUserEvidence.at(-3) ===
    'I no longer want to negotiate. Cancel the purchase.' &&
    projectedPreparation!.currentUserEvidence.at(-2) ===
      'The new audience is the cancellation team, not the seller.' &&
    projectedPreparation!.currentUserEvidence.at(-1) ===
      'My role is now cancellation requester, not negotiating buyer.' &&
    !JSON.stringify(projectedPreparation!.currentUserEvidence).includes(
      'Continue negotiating',
    ) &&
    projectedPreparation!.provisionalPreparationEvidence.some((item) =>
      item.includes('negotiate a lower purchase price'),
    ) &&
    projectedPreparation!.provisionalPreparationEvidence.some((item) =>
      item.includes('original seller'),
    ) &&
    projectedPreparation!.provisionalPreparationEvidence.some((item) =>
      item.includes('buyer'),
    ),
  'new explicit objective/audience/role does not outrank richer stale preparation or assistant prose became user evidence',
)
assert(
  projectedPreparation!.confirmedPreparationEvidence.some((item) =>
    item.includes('deadline is Friday'),
  ) &&
    projectedPreparation!.qualifiedDocumentEvidence.some((item) =>
      item.includes('cancellation window'),
    ),
  'uncontradicted confirmed preparation or qualified document evidence was dropped',
)
assert(
  projectedPreparation!.skippedEvidenceNeeds.includes('approval owner') &&
    !projectedPreparation!.knownEvidence.some((item) =>
      item.includes('approval owner'),
    ),
  'a skipped evidence need was flattened into known or negative evidence',
)
assert(
  projectedPreparation!.inferenceEvidence.includes(
    'The purchase probably still matters.',
  ) &&
    !projectedPreparation!.knownEvidence.includes(
      'The purchase probably still matters.',
    ),
  'preparation inference was silently promoted to confirmed user evidence',
)
assert(
  projectNormalPreparationEvidence({
    session: stalePreparationSession,
    activeNormalSessionId: 'normal-other',
    linkedPreparationSessionId: 'prep-current',
  }) === null &&
    projectNormalPreparationEvidence({
      session: stalePreparationSession,
      activeNormalSessionId: 'normal-current',
      linkedPreparationSessionId: 'prep-other',
    }) === null &&
    projectNormalPreparationEvidence({
      session: stalePreparationSession,
      activeNormalSessionId: null,
      linkedPreparationSessionId: null,
    }) === null,
  'wrong-session, unlinked, or deleted-parent preparation can enter canonical context',
)
assert(
  projectedPreparation!.formula?.id === 'formula-current' &&
    projectedPreparation!.formula?.version === 3 &&
    !('operationalDisposition' in projectedPreparation!),
  'Formula identity/version was lost or PreparationSession became a disposition owner',
)

const preparation = normalizeOperationalPreparationContext(
  projectedPreparation,
)
const preparationNote = buildOperationalPreparationContextNote(preparation!)

assert(preparation !== null, 'valid preparation context was rejected')
assert(
  preparation?.formula?.id === 'formula-current',
  'current Formula identity did not reach canonical reasoning context',
)
assert(
  preparationNote.includes('deadline is Friday'),
  'confirmed preparation evidence did not reach canonical reasoning context',
)
assert(
  preparationNote.indexOf('Cancel the purchase') >= 0 &&
    preparationNote.indexOf('negotiate a lower purchase price') >= 0 &&
    preparationNote.indexOf('Cancel the purchase') <
      preparationNote.indexOf('negotiate a lower purchase price'),
  'new explicit evidence was not ordered ahead of stale persisted evidence in canonical reasoning context',
)
assert(
  normalizeOperationalPreparationContext({
    ...projectedPreparation,
    normalSessionId: '',
  }) === null,
  'an identity-invalid preparation state was promoted to Operational Judgment',
)

const answeredAfterSkip = reconcileNormalPreparationSession({
  existingSession: stalePreparationSession,
  normalSessionId: 'normal-current',
  activeSessionMetadata: {},
  acceptedObjective: 'cancel the purchase',
  currentConversation: [
    { role: 'user', content: 'Cancel the purchase.' },
  ],
  briefing: {
    priorInteractions: [
      ...stalePreparationSession.briefing.priorInteractions,
      {
        key: 'approval_owner',
        question: 'Who must approve the change?',
        answer: 'The cancellation team lead.',
        status: 'answered',
        evidenceNeed: 'approval owner',
      },
    ],
  },
  checkpoint: { surface: 'briefing', phase: 'questions' },
  updatedAt: 300,
})
const answeredProjection = projectNormalPreparationEvidence({
  session: answeredAfterSkip,
  activeNormalSessionId: 'normal-current',
  linkedPreparationSessionId: 'prep-current',
  currentConversation: [
    { role: 'user', content: 'Cancel the purchase.' },
  ],
})

assert(
  answeredAfterSkip?.knowledge.objective === 'cancel the purchase' &&
    answeredProjection?.priorInteractions.find(
      (interaction) => interaction.key === 'approval_owner',
    )?.status === 'answered' &&
    !answeredProjection?.skippedEvidenceNeeds.includes('approval owner'),
  'new accepted objective or a later explicit answer did not supersede stale preparation/skip state',
)
assert(
  preparationEvidenceNeedIsAlreadyKnown(
    answeredProjection!,
    'approval owner',
  ),
  'adaptive acquisition can reacquire an already confirmed evidence need',
)

const base = resolveOperationalJudgment({
  currentRuntime: 'normal_george',
  latestUserText: 'The deadline is Friday.',
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
    shouldAcquireSignal: true,
    smallestSignal: 'an unvalidated preferred preparation field',
    signalSufficiency: 'insufficient',
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
    primaryOutcome: 'reach the strongest defensible outcome',
    immediateOutcome: 'choose the strongest execution path',
    phase: 'preparation',
    confidence: 0.8,
  },
} as any)

assert(
  base.operationalDisposition.disposition === 'unresolved',
  'deterministic pre-provider logic prematurely owned the semantic disposition',
)

const fixtureTrajectory = {
  confidence: 0.8,
  currentMove: 'advance',
  potentialFutureNeeds: [],
} as any

function buildRuntimeSnapshot(judgment = base) {
  const operationalResourceMonitor = resolveOperationalResourceMonitor({
    outcomeState: judgment.outcomeState,
    conversationStrategy: judgment.conversationStrategy,
    operationalJudgment: judgment,
    trajectory: fixtureTrajectory,
  })
  const executionPolicy = resolveGeorgeExecutionPolicy({
    runtime: 'normal_george',
    voiceMode: false,
    strategy: judgment.conversationStrategy,
    moveDefinition: judgment.conversationStrategy.definition,
    operationalJudgment: judgment,
    outcomeEvolution: {} as any,
    operationalResourceMonitor,
    latestUserText: 'Proceed from the current validated evidence.',
  })

  return {
    operationalJudgment: judgment,
    conversationStrategy: judgment.conversationStrategy,
    conversationMoveDefinition: judgment.conversationStrategy.definition,
    executionPolicy,
    operationalResourceMonitor,
    trajectoryAssessment: fixtureTrajectory,
    outcomeEvolution: {} as any,
    source: 'runtime_pipeline' as const,
  } as any
}

function resolveFixtureAuthority(input: {
  providerReasoning: ProviderOperationalReasoning
  providerCapability: 'normal' | 'live' | null
  capabilityRecommendationMaterial?: boolean
  signalAcquisitionAllowed?: boolean
}) {
  return selectProviderResolvedGeorgeRuntimeAuthoritySnapshot({
    snapshot: buildRuntimeSnapshot(),
    currentRuntime: 'normal_george',
    latestUserText: 'Proceed from the current validated evidence.',
    voiceMode: false,
    executionImminent: false,
    operationalSignals: [],
    judgmentSurface: {
      decisionSurface: 'advance',
      shouldAcquireSignal: true,
      smallestSignal: 'an unvalidated preferred preparation field',
      signalSufficiency: 'insufficient',
    },
    providerReasoning: input.providerReasoning,
    providerCapability: input.providerCapability,
    capabilityExplicitlyRequested: input.providerCapability === 'live',
    capabilityRecommendationMaterial:
      input.capabilityRecommendationMaterial === true,
    canonicalSignalAcquisition: true,
    signalAcquisitionAllowed: input.signalAcquisitionAllowed !== false,
    operationalJudgmentRequest: false,
    ordinaryNormalRequest: true,
  })
}

function assertAuthorityCoherent(
  authority: ReturnType<typeof resolveFixtureAuthority>,
  expected: {
    disposition: string
    action: string
    move: string
    posture: string
    missingSignal?: string
  },
) {
  const judgment = authority.operationalJudgment
  const strategyReminder = authority.operationalResourceMonitor.resources.find(
    (resource) => resource.type === 'strategy_reminder',
  )
  const missingSignal = authority.operationalResourceMonitor.resources.find(
    (resource) => resource.type === 'missing_signal',
  )

  assert(
    judgment.operationalDisposition.disposition === expected.disposition &&
      judgment.action === expected.action &&
      judgment.operationalPosture === expected.posture &&
      authority.conversationStrategy.move === expected.move &&
      judgment.conversationStrategy === authority.conversationStrategy &&
      authority.conversationMoveDefinition ===
        authority.conversationStrategy.definition &&
      authority.executionPolicy.strategyMove ===
        authority.conversationStrategy.move &&
      authority.executionPolicy.purpose ===
        authority.conversationStrategy.purpose &&
      authority.executionPolicy.normalPosture ===
        judgment.operationalPosture &&
      strategyReminder?.value === authority.conversationStrategy.purpose &&
      authority.operationalResourceMonitor.priority ===
        judgment.outcomeState.immediateOutcome,
    'provider-resolved authority members do not derive from one accepted judgment state',
  )
  assert(
    expected.missingSignal
      ? missingSignal?.value === expected.missingSignal &&
          judgment.signalAcquisition.requestedSignal === expected.missingSignal
      : !missingSignal && !judgment.signalAcquisition.shouldAcquire,
    'the accepted resource monitor contradicts canonical signal authority',
  )
}

const ready = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'reach the strongest defensible outcome',
    knownEvidence: ['A consequential interaction is established.'],
    georgeResolvableWork: [
      'prepare the user to test the governing evidence during the interaction',
    ],
    georgeCanAdvanceWithoutUserSignal: true,
    disposition: 'execution_ready',
    interaction: 'the established consequential conversation',
    interactionUseful: true,
    purpose: 'obtain the committed next step while protecting the objective',
    desiredResult: 'a committed and evidence-supported next step',
    liveMateriallyImprovesExecution: true,
    materialLiveBenefit:
      'real-time support can adapt the evidence test as the counterparty responds',
    strongestNextStep: 'enter LIVE when the user chooses',
    rationale: 'The interaction is established and LIVE materially improves execution.',
    presentation:
      'I can help you test the governing evidence as the counterparty responds and move toward a committed next step.',
  }),
  providerCapability: 'live',
  capabilityExplicitlyRequested: true,
  capabilityRecommendationMaterial: true,
  canonicalSignalAcquisition: true,
})

assert(
  ready.operationalDisposition.disposition === 'execution_ready' &&
    ready.operationalDisposition.source === 'operational_judgment' &&
    ready.liveSupport.posture === 'recommend',
  'canonical Operational Judgment did not own the provider-informed LIVE disposition',
)

const liveInterestOnly = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'advance the current objective',
    knownEvidence: ['The user tapped LIVE.'],
    disposition: 'execution_opportunity',
    interaction: 'a possible conversation',
    interactionUseful: true,
    purpose: 'discuss the objective',
    desiredResult: 'make progress',
    liveMateriallyImprovesExecution: false,
    materialLiveBenefit: null,
    strongestNextStep: 'use LIVE somehow',
    rationale: 'The user expressed interest in LIVE.',
    presentation: 'LIVE is ready because you tapped it.',
  }),
  providerCapability: 'live',
  capabilityExplicitlyRequested: true,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
})

assert(
  liveInterestOnly.operationalDisposition.disposition === 'unresolved' &&
    !liveInterestOnly.operationalDisposition.providerProposalAccepted &&
    liveInterestOnly.liveSupport.posture === 'none',
  'tapping LIVE alone was accepted as proof of material LIVE benefit',
)

const normal = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'resolve the decision from current evidence',
    knownEvidence: ['The governing evidence is already available.'],
    georgeResolvableWork: [
      'analyze the evidence and produce the decision analysis',
    ],
    georgeCanAdvanceWithoutUserSignal: true,
    disposition: 'continue_normal',
    interaction: null,
    purpose: 'resolve the decision through current evidence',
    desiredResult: 'a defensible decision',
    strongestNextStep: 'produce the decision analysis now',
    rationale: 'Normal reasoning is the strongest move.',
    presentation:
      'Normal is stronger now because I can analyze the governing evidence and produce the decision analysis without another interruption.',
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
})

assert(
  normal.operationalDisposition.disposition === 'continue_normal' &&
    normal.liveSupport.posture === 'none' &&
    !normal.signalAcquisition.shouldAcquire &&
    normal.action !== 'acquire_smallest_signal',
  'canonical Operational Judgment did not preserve a stronger Normal action before acquisition',
)

const incoherentZeroImpactActNow =
  resolveProviderOperationalJudgment({
    judgment: base,
    providerReasoning: reasoning({
      operationalObjective:
        'improve the user outcome through the strongest available action',
      knownEvidence: ['The objective is established.'],
      georgeResolvableWork: [
        'provide generic preparation that does not materially advance the outcome',
      ],
      georgeCanAdvanceWithoutUserSignal: true,
      disposition: 'continue_normal',
      strongestNextStep: 'provide generic preparation now',
      rationale:
        'The provider claims an act-now path despite rating its outcome impact as none.',
      decisionComparison: {
        bestActionNow: 'provide generic preparation now',
        candidateSignal: null,
        actNowOutcomeImpact: 'none',
        acquireSignalOutcomeImpact: 'none',
        signalInteractionCost: 'none',
        preferredPath: 'act_now',
        bestActionNowExecutableFromKnownEvidence: true,
        bestActionNowMissingDependency: null,
        reason:
          'The provider selected act-now despite assigning no outcome impact.',
      },
    }),
    providerCapability: 'normal',
    capabilityExplicitlyRequested: false,
    capabilityRecommendationMaterial: false,
    canonicalSignalAcquisition: true,
    signalAcquisitionAllowed: true,
    ordinaryNormalRequest: true,
    operationalJudgmentRequest: false,
  })

const incoherentMissingDependencyActNow =
  resolveProviderOperationalJudgment({
    judgment: base,
    providerReasoning: reasoning({
      operationalObjective:
        'improve the outcome through a supposedly executable action',
      knownEvidence: ['The desired outcome is established.'],
      consequentialUncertainty:
        'the user-owned fact required to execute the proposed action',
      georgeResolvableWork: [
        'perform work whose substance depends on the missing user-owned fact',
      ],
      georgeCanAdvanceWithoutUserSignal: true,
      disposition: 'continue_normal',
      strongestNextStep:
        'perform the evidence-dependent work now',
      rationale:
        'The provider claims it can act now despite identifying a missing dependency.',
      decisionComparison: {
        bestActionNow:
          'perform the evidence-dependent work now',
        candidateSignal:
          'the user-owned fact required to execute the proposed action',
        actNowOutcomeImpact: 'high',
        acquireSignalOutcomeImpact: 'medium',
        signalInteractionCost: 'low',
        preferredPath: 'act_now',
        bestActionNowExecutableFromKnownEvidence: false,
        bestActionNowMissingDependency:
          'the user-owned fact required to execute the proposed action',
        reason:
          'The proposed action has high potential impact but cannot actually be executed from known evidence.',
      },
    }),
    providerCapability: 'normal',
    capabilityExplicitlyRequested: false,
    capabilityRecommendationMaterial: false,
    canonicalSignalAcquisition: true,
    signalAcquisitionAllowed: true,
    ordinaryNormalRequest: true,
    operationalJudgmentRequest: false,
  })

const incoherentZeroImpactSignalFirst =
  resolveProviderOperationalJudgment({
    judgment: base,
    providerReasoning: reasoning({
      operationalObjective:
        'choose the strongest operational action',
      knownEvidence: ['Current evidence is incomplete.'],
      consequentialUncertainty:
        'the user-owned fact that changes the strongest action',
      georgeCanAdvanceWithoutUserSignal: false,
      disposition: null,
      strongestNextStep: null,
      rationale:
        'The provider claims signal-first while assigning no outcome impact.',
      signalAcquisition: {
        shouldAcquire: true,
        requestedSignal:
          'the user-owned fact that changes the strongest action',
        evidenceIsUserOwned: true,
        consequentialToNextAction: true,
        reason:
          'The provider claims this signal changes the next action.',
      },
      decisionComparison: {
        bestActionNow: null,
        candidateSignal:
          'the user-owned fact that changes the strongest action',
        actNowOutcomeImpact: 'none',
        acquireSignalOutcomeImpact: 'none',
        signalInteractionCost: 'low',
        preferredPath: 'acquire_signal',
        bestActionNowExecutableFromKnownEvidence: false,
        bestActionNowMissingDependency:
          'the user-owned fact that changes the strongest action',
        reason:
          'The provider selected signal-first despite assigning no outcome impact.',
      },
    }),
    providerCapability: 'normal',
    capabilityExplicitlyRequested: false,
    capabilityRecommendationMaterial: false,
    canonicalSignalAcquisition: true,
    signalAcquisitionAllowed: true,
    ordinaryNormalRequest: true,
    operationalJudgmentRequest: false,
  })

const ordinarySelfExecutable = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'select the lower-cost option from supplied facts',
    knownEvidence: [
      'Option A costs 80 units.',
      'Option B costs 100 units.',
      'The only priority is minimizing cost.',
    ],
    consequentialUncertainty: null,
    georgeResolvableWork: [
      'compare the supplied costs and calculate the difference',
      'recommend the option that satisfies the stated priority',
    ],
    georgeCanAdvanceWithoutUserSignal: true,
    disposition: 'continue_normal',
    purpose: 'resolve the comparison from the supplied evidence',
    desiredResult: 'an evidence-based option selection',
    strongestNextStep:
      'calculate the cost difference and recommend the lower-cost option',
    rationale: 'All facts needed for the comparison are available.',
    presentation:
      'I can compare the supplied facts and select the lower-cost option now.',
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
  signalAcquisitionAllowed: true,
  ordinaryNormalRequest: true,
  operationalJudgmentRequest: false,
})
const ordinarySelfExecution = buildNormalOperationalResponseResult({
  operationalJudgment: ordinarySelfExecutable,
  executionText:
    'Option A is 20 units cheaper than Option B. Because minimizing cost is the only stated priority, choose Option A.',
})
const ordinarySelfExecutionInstruction = buildNormalExecutionInstruction(
  ordinarySelfExecutable,
)

const ordinaryMissingSignal = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'select an option within the user-owned cost boundary',
    knownEvidence: ['The available options have different total costs.'],
    consequentialUncertainty: 'the maximum acceptable total cost',
    georgeResolvableWork: [],
    georgeCanAdvanceWithoutUserSignal: false,
    disposition: null,
    strongestNextStep: null,
    rationale:
      'The option changes depending on the user-owned maximum acceptable cost.',
    signalAcquisition: {
      shouldAcquire: true,
      requestedSignal: 'the maximum acceptable total cost',
      evidenceIsUserOwned: true,
      consequentialToNextAction: true,
      reason: 'The accepted option depends on this exact user-owned boundary.',
    },
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
  signalAcquisitionAllowed: true,
  ordinaryNormalRequest: true,
  operationalJudgmentRequest: false,
})
const ordinarySignalExecution = buildNormalOperationalResponseResult({
  operationalJudgment: ordinaryMissingSignal,
  executionText: 'What is the maximum acceptable total cost?',
})
const ordinarySignalExecutionInstruction = buildNormalExecutionInstruction(
  ordinaryMissingSignal,
)

const ordinaryUnresolvedWithoutSignal = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: null,
    knownEvidence: [],
    consequentialUncertainty: null,
    georgeResolvableWork: [],
    georgeCanAdvanceWithoutUserSignal: false,
    disposition: null,
    strongestNextStep: null,
    rationale:
      'The current evidence does not yet support an accepted action or a consequential user-owned evidence request.',
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
  signalAcquisitionAllowed: true,
  ordinaryNormalRequest: true,
  operationalJudgmentRequest: false,
})
const ordinaryUnresolvedInstruction = buildNormalExecutionInstruction(
  ordinaryUnresolvedWithoutSignal,
)

const rejectedProviderCandidate =
  'Start LIVE now and use a generic interaction checklist.'
const rejectedLivePurpose = 'conduct an external interaction'
const rejectedLiveDesiredResult = 'obtain external approval'
const rejectedLiveStrongestNextStep = 'start LIVE immediately'
const rejectedLiveInteraction = 'an unnecessary external approval meeting'
const rejectedLiveMaterialBenefit =
  'LIVE would supposedly improve an interaction that current evidence does not establish as useful'
const adversarialRejectedLiveReasoning = reasoning({
  operationalObjective: 'resolve the supplied comparison',
  knownEvidence: ['All comparison inputs are already available.'],
  georgeResolvableWork: [
    'perform the comparison directly from current validated evidence',
  ],
  georgeCanAdvanceWithoutUserSignal: true,
  disposition: 'execution_opportunity',
  interaction: rejectedLiveInteraction,
  interactionUseful: true,
  purpose: rejectedLivePurpose,
  desiredResult: rejectedLiveDesiredResult,
  liveMateriallyImprovesExecution: true,
  materialLiveBenefit: rejectedLiveMaterialBenefit,
  strongestNextStep: rejectedLiveStrongestNextStep,
  rationale:
    'The provider proposed LIVE even though canonical materiality evidence rejects it.',
  presentation: rejectedProviderCandidate,
})
const ordinaryCanonicalDisagreement = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: adversarialRejectedLiveReasoning,
  providerCapability: 'live',
  capabilityExplicitlyRequested: true,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
  signalAcquisitionAllowed: true,
  ordinaryNormalRequest: true,
  operationalJudgmentRequest: false,
})
const adversarialRejectedLiveAuthority = resolveFixtureAuthority({
  providerReasoning: adversarialRejectedLiveReasoning,
  providerCapability: 'live',
  capabilityRecommendationMaterial: false,
})
const adversarialRejectedLiveExecutionInstruction =
  buildNormalExecutionInstruction(
    adversarialRejectedLiveAuthority.operationalJudgment,
  )
const canonicalDisagreementExecution = buildNormalOperationalResponseResult({
  operationalJudgment: ordinaryCanonicalDisagreement,
  executionText:
    'The accepted evidence supports completing the comparison directly in Normal; no external interaction is needed.',
})

const acquisition = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'choose the strongest defensible path',
    knownEvidence: ['The deadline is Friday.'],
    consequentialUncertainty:
      'the user-owned boundary governing the decision',
    georgeResolvableWork: [],
    georgeCanAdvanceWithoutUserSignal: false,
    disposition: null,
    interaction: null,
    purpose: null,
    strongestNextStep: null,
    rationale: 'One user-owned fact is consequential to the operational choice.',
    signalAcquisition: {
      shouldAcquire: true,
      requestedSignal: 'the user-owned boundary governing the decision',
      evidenceIsUserOwned: true,
      consequentialToNextAction: true,
      reason: 'Materially different next actions depend on this boundary.',
    },
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
})

const jobAcquisition = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'secure a suitable job opportunity',
    knownEvidence: ['The user wants to get a job.'],
    consequentialUncertainty: 'the target role or opportunity',
    georgeCanAdvanceWithoutUserSignal: false,
    rationale:
      'The target changes the search strategy and which interaction, if any, would be useful.',
    signalAcquisition: {
      shouldAcquire: true,
      requestedSignal: 'the target role or opportunity',
      evidenceIsUserOwned: true,
      consequentialToNextAction: true,
      reason:
        'Different targets require materially different evidence, actions, and possible interactions.',
    },
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: true,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
})

const businessAcquisition = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'evaluate whether the business is financially viable',
    knownEvidence: ['The user wants a financial-viability determination.'],
    consequentialUncertainty: 'the business model being evaluated',
    georgeCanAdvanceWithoutUserSignal: false,
    rationale:
      'Revenue mechanics, costs, capital needs, and demand cannot be evaluated until the business itself is established.',
    signalAcquisition: {
      shouldAcquire: true,
      requestedSignal: 'the business model being evaluated',
      evidenceIsUserOwned: true,
      consequentialToNextAction: true,
      reason:
        'The business model changes every governing variable in the viability analysis.',
    },
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: true,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
})

const opportunity = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'obtain a defensible external validation decision',
    knownEvidence: [
      'A decision-maker holds evidence that cannot be established internally.',
    ],
    georgeResolvableWork: [
      'structure the validation sequence and adapt the evidence test',
    ],
    georgeCanAdvanceWithoutUserSignal: true,
    disposition: 'execution_opportunity',
    interaction: 'a focused decision-maker validation conversation',
    interactionUseful: true,
    purpose: 'test the objective against evidence held by the decision-maker',
    desiredResult: 'a concrete validation decision',
    liveMateriallyImprovesExecution: true,
    materialLiveBenefit:
      'real-time support can adapt the validation sequence to the decision-maker responses',
    strongestNextStep: 'secure a concrete validation decision and update the plan from it',
    rationale: 'The external decision-maker holds evidence that materially changes the path.',
    presentation:
      'My role is to help you obtain a defensible validation decision. I can structure the decision-maker conversation, adapt the evidence test as they respond, and move toward a concrete validation decision.',
  }),
  providerCapability: 'live',
  capabilityExplicitlyRequested: true,
  capabilityRecommendationMaterial: true,
  canonicalSignalAcquisition: true,
})
const other = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'resolve the controlling fact',
    knownEvidence: ['A signed record is available.'],
    georgeResolvableWork: ['identify the controlling provision in the record'],
    georgeCanAdvanceWithoutUserSignal: true,
    disposition: 'other_action',
    interaction: null,
    purpose: 'verify the governing record before involving another person',
    desiredResult: 'the controlling fact established from the signed record',
    strongestNextStep: 'inspect the signed record and resolve the controlling fact',
    rationale: 'The available record can resolve the decision more directly than LIVE.',
    presentation:
      'Inspecting the signed record is stronger than LIVE now because it can resolve the controlling fact directly.',
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: false,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
})
const staleAcquisitionRejected = resolveProviderOperationalJudgment({
  judgment: base,
  providerReasoning: reasoning({
    operationalObjective: 'choose the strongest defensible path',
    consequentialUncertainty:
      'the user-owned boundary governing the decision',
    georgeCanAdvanceWithoutUserSignal: false,
    signalAcquisition: {
      shouldAcquire: true,
      requestedSignal: 'the user-owned boundary governing the decision',
      evidenceIsUserOwned: true,
      consequentialToNextAction: true,
      reason: 'The formatter could not acquire the evidence.',
    },
  }),
  providerCapability: 'normal',
  capabilityExplicitlyRequested: true,
  capabilityRecommendationMaterial: false,
  canonicalSignalAcquisition: true,
  signalAcquisitionAllowed: false,
})

const coherentExecutionOpportunity = resolveFixtureAuthority({
  providerReasoning: reasoning({
    operationalObjective: 'reach an evidence-based external decision',
    knownEvidence: [
      'A decision-holder has consequential evidence that GEORGE cannot establish internally.',
    ],
    georgeResolvableWork: [
      'structure the evidence test and support adaptation as the decision-holder responds',
    ],
    georgeCanAdvanceWithoutUserSignal: true,
    disposition: 'execution_opportunity',
    interaction: 'a focused interaction with the decision-holder',
    interactionUseful: true,
    purpose: 'test the objective against consequential external evidence',
    desiredResult: 'an evidence-based external decision',
    liveMateriallyImprovesExecution: true,
    materialLiveBenefit:
      'real-time adaptation can respond to consequential evidence as it emerges',
    strongestNextStep:
      'prepare the evidence test and support the interaction when the user chooses',
    rationale:
      'The interaction is useful and real-time adaptation materially improves execution.',
    presentation:
      'The evidence-holder interaction can materially advance the objective, and real-time adaptation can improve its execution.',
  }),
  providerCapability: 'live',
  capabilityRecommendationMaterial: true,
})
const coherentSignalAcquisition = resolveFixtureAuthority({
  providerReasoning: reasoning({
    operationalObjective: 'choose between the available paths',
    knownEvidence: ['The paths depend on one user-owned limit.'],
    consequentialUncertainty: 'the maximum acceptable commitment',
    georgeResolvableWork: [],
    georgeCanAdvanceWithoutUserSignal: false,
    rationale:
      'The strongest path changes with the user-owned commitment limit.',
    signalAcquisition: {
      shouldAcquire: true,
      requestedSignal: 'the maximum acceptable commitment',
      evidenceIsUserOwned: true,
      consequentialToNextAction: true,
      reason: 'This exact limit changes the accepted next action.',
    },
  }),
  providerCapability: 'normal',
})
const coherentUnresolvedWithoutSignal = resolveFixtureAuthority({
  providerReasoning: reasoning({
    operationalObjective: null,
    knownEvidence: [],
    consequentialUncertainty: null,
    georgeResolvableWork: [],
    georgeCanAdvanceWithoutUserSignal: false,
    rationale:
      'Current evidence supports neither an action nor a consequential user-owned signal request.',
  }),
  providerCapability: 'normal',
})

function executionEnvelope(
  _judgment: typeof ordinarySelfExecutable,
  text: string,
) {
  return JSON.stringify({
    text,
  })
}

const rejectedLiveExecution = buildNormalOperationalResponseResult({
  operationalJudgment: ordinaryCanonicalDisagreement,
  executionText:
    'Start LIVE now and conduct the external approval interaction instead.',
})
const unauthorizedQuestionExecution = buildNormalOperationalResponseResult({
  operationalJudgment: ordinarySelfExecutable,
  executionText:
    'Before I perform the accepted comparison, what additional information can you provide?',
})
const authorizedQuestionText =
  'What is the maximum acceptable total cost?'
const authorizedQuestionExecution = buildNormalOperationalResponseResult({
  operationalJudgment: ordinaryMissingSignal,
  executionText: authorizedQuestionText,
  authorizedSignalQuestion: true,
})
const expandedQuestionExecution = buildNormalOperationalResponseResult({
  operationalJudgment: ordinaryMissingSignal,
  executionText:
    'What is the maximum acceptable total cost and who must approve it?',
})
const authorizedQuestionAfterNotices = appendPostResponseNotices({
  reply: authorizedQuestionText,
  messageCount: 14,
  latestUserText: 'As I said earlier, continue from before.',
  operationalJudgment: ordinaryMissingSignal,
})
const noSignalCapacityNotice = appendPostResponseNotices({
  reply:
    'Option A is 20 units cheaper than Option B, so Option A satisfies the accepted cost criterion.',
  messageCount: 14,
  latestUserText: 'As I said earlier, continue from before.',
  operationalJudgment: ordinarySelfExecutable,
})

const richWorkProduct = [
  'Comparison',
  'Option A costs 80 units.',
  'Option B costs 100 units.',
  'Option A is therefore 20 units cheaper.',
  'Because cost is the accepted criterion, select Option A.',
].join('\\n')
const parsedRichExecution = parseNormalExecutionResult(
  executionEnvelope(ordinarySelfExecutable, richWorkProduct),
  ordinarySelfExecutable,
)
const parsedPolicyBoundExecution = parseNormalExecutionResult(
  JSON.stringify({
    text: richWorkProduct,
  }),
  adversarialRejectedLiveAuthority.operationalJudgment,
  adversarialRejectedLiveAuthority.executionPolicy,
)
const primaryProviderRealization = parseNormalExecutionResult(
  JSON.stringify({
    text: richWorkProduct,
  }),
  adversarialRejectedLiveAuthority.operationalJudgment,
  adversarialRejectedLiveAuthority.executionPolicy,
)
const fallbackProviderRealization = parseNormalExecutionResult(
  JSON.stringify({
    text:
      'Option A costs 80 units and Option B costs 100 units. Option A is 20 units cheaper, so select Option A under the accepted cost criterion.',
  }),
  adversarialRejectedLiveAuthority.operationalJudgment,
  adversarialRejectedLiveAuthority.executionPolicy,
)
const forgedProviderAuthorityExecution = parseNormalExecutionResult(
  JSON.stringify({
    text: richWorkProduct,
    authority: {
      action: 'start_live',
      disposition: 'execution_opportunity',
      executionPolicy: {
        strategyMove: 'ask',
      },
    },
  }),
  adversarialRejectedLiveAuthority.operationalJudgment,
  adversarialRejectedLiveAuthority.executionPolicy,
)
const malformedExecution = parseNormalExecutionResult(
  'This plain-text pre-canonical candidate must not be accepted.',
  ordinarySelfExecutable,
)
const providerReturnedTextOnlyExecution = parseNormalExecutionResult(
  JSON.stringify({
    text: richWorkProduct,
  }),
  ordinarySelfExecutable,
)
const emptyExecution = parseNormalExecutionResult(
  JSON.stringify({
    text: '',
  }),
  ordinarySelfExecutable,
)
const acceptedRichExecution = buildNormalOperationalResponseResult({
  operationalJudgment: ordinarySelfExecutable,
  executionText: parsedRichExecution?.text || null,
})
const presentedRichExecution = renderOperationalExcellenceOutput({
  reply: enforcePresentationMode(
    acceptedRichExecution.message || '',
    'conversational',
  ),
  presentationMode: 'conversational',
  latestUserText: 'What should I say? Compare the supplied values.',
  canonicalExecution: true,
})
const governedRichExecution = appendPostResponseNotices({
  reply: presentedRichExecution,
  messageCount: 2,
  latestUserText: 'What should I say? Compare the supplied values.',
  operationalJudgment: ordinarySelfExecutable,
})
const finalVisibleRichExecution = buildNormalOperationalResponseResult({
  operationalJudgment: ordinarySelfExecutable,
  executionText: governedRichExecution,
})
const emptyExecutionResult = buildNormalOperationalResponseResult({
  operationalJudgment: ordinarySelfExecutable,
  executionText: emptyExecution?.text || null,
})
const opportunityResult = buildNormalLiveOperationalJudgmentResult({
  operationalJudgment: opportunity,
})
const rejectedLiveResult = buildNormalLiveOperationalJudgmentResult({
  operationalJudgment: liveInterestOnly,
})
const normalResult = buildNormalLiveOperationalJudgmentResult({
  operationalJudgment: normal,
})
const otherResult = buildNormalLiveOperationalJudgmentResult({
  operationalJudgment: other,
})
const acquisitionResult = buildNormalLiveOperationalJudgmentResult({
  operationalJudgment: acquisition,
})
const requestNote = buildNormalLiveOperationalJudgmentRequestNote()
const judgmentProviderRequest = buildGeorgeProviderRequest({
  currentRuntime: 'normal_george',
  runtimeContextBlock:
    requestNote + '\\n\\nPROVIDER EXECUTION AUTHORITY\\n- Operational action: clarify_direction',
  latestUserText: 'I want to reach the objective.',
  hasPreparationContext: true,
  prompt: {
    languageRule: '',
    modeBlock: '',
    baseSystemPrompt: 'Ordinary Normal conversation.',
    messageSourceBlock: '',
    controlStateBlock: '',
    runtimeScoresBlock: '',
    scoreAwareSteeringBlock: '',
    conversationEngineRulesBlock: '',
    universalLiveOpeningBlock: '',
    liveDisciplineBlock: '',
    dynamicRuntimeBlocks: '',
    includeLiveDiscipline: false,
    operationalJudgmentRequest: true,
    recentMessages: [
      { role: 'user', content: 'I want to reach the objective.' },
      {
        role: 'assistant',
        content: 'This ordinary response is already visible and must not be generated again.',
      },
    ],
  },
})

assert(
  incoherentZeroImpactActNow.operationalDisposition.disposition ===
    'unresolved' &&
    !incoherentZeroImpactActNow.signalAcquisition.shouldAcquire &&
    incoherentMissingDependencyActNow.operationalDisposition.disposition ===
      'unresolved' &&
    !incoherentMissingDependencyActNow.signalAcquisition.shouldAcquire &&
    incoherentZeroImpactSignalFirst.operationalDisposition.disposition ===
      'unresolved' &&
    !incoherentZeroImpactSignalFirst.signalAcquisition.shouldAcquire,
  'zero-impact or evidence-dependent act-now comparison escaped canonical Operational Judgment',
)

assert(
  ordinarySelfExecutable.operationalDisposition.disposition ===
    'continue_normal' &&
    ordinarySelfExecutable.action === 'advance_outcome' &&
    ordinarySelfExecutable.realization.executionGenerationRequired &&
    !ordinarySelfExecutable.signalAcquisition.shouldAcquire &&
    !ordinarySelfExecutable.operationalDisposition
      .liveMateriallyImprovesExecution,
  'self-executable ordinary Normal work did not become the accepted canonical action',
)
assert(
  ordinarySelfExecution.source === 'operational_judgment' &&
    ordinarySelfExecution.realization === 'provider_execution' &&
    ordinarySelfExecution.preAcceptanceProviderTextUsed === false &&
    ordinarySelfExecution.message?.includes('20 units cheaper') &&
    ordinarySelfExecution.message?.includes('choose Option A') &&
    ordinarySelfExecution.message !==
      ordinarySelfExecutable.operationalDisposition.presentation &&
    ordinarySelfExecutionInstruction.includes(
      'calculate the cost difference and recommend the lower-cost option',
    ) &&
    ordinarySelfExecutionInstruction.includes(
      'Do not reconsider, replace, broaden, or reinterpret',
    ),
  'ordinary Normal collapsed rich accepted execution into a judgment summary',
)
assert(
  ordinaryMissingSignal.operationalDisposition.disposition === 'unresolved' &&
    ordinaryMissingSignal.action === 'acquire_smallest_signal' &&
    ordinaryMissingSignal.signalAcquisition.requestedSignal ===
      'the maximum acceptable total cost' &&
    ordinaryMissingSignal.realization.executionGenerationRequired &&
    ordinarySignalExecution.message ===
      'What is the maximum acceptable total cost?' &&
    ordinarySignalExecutionInstruction.includes(
      '"requestedSignal": "the maximum acceptable total cost"',
    ) &&
    !ordinarySignalExecutionInstruction.includes(
      'role, audience, room',
    ),
  'ordinary Normal did not constrain acquisition to one canonical consequential fact',
)
assert(
  ordinaryUnresolvedWithoutSignal.operationalDisposition.disposition ===
    'unresolved' &&
    !ordinaryUnresolvedWithoutSignal.signalAcquisition.shouldAcquire &&
    ordinaryUnresolvedWithoutSignal.realization.executionGenerationRequired &&
    !ordinaryUnresolvedWithoutSignal.realization.directPresentationAllowed &&
    ordinaryUnresolvedInstruction.includes(
      'do not ask a question that Operational Judgment did not authorize',
    ),
  'ordinary Normal unresolved judgment bypassed governed execution or invented signal authority',
)
assert(
  ordinaryCanonicalDisagreement.operationalDisposition.disposition ===
    'continue_normal' &&
    !ordinaryCanonicalDisagreement.operationalDisposition
      .providerProposalAccepted &&
    ordinaryCanonicalDisagreement.action === 'advance_outcome' &&
    !ordinaryCanonicalDisagreement.operationalDisposition
      .liveMateriallyImprovesExecution &&
    canonicalDisagreementExecution.realization === 'provider_execution' &&
    canonicalDisagreementExecution.message !== rejectedProviderCandidate &&
    !buildNormalExecutionInstruction(
      ordinaryCanonicalDisagreement,
    ).includes(rejectedProviderCandidate),
  'a rejected provider proposal or no-material-LIVE candidate could reach ordinary Normal output',
)
assert(
  ordinaryCanonicalDisagreement.operationalDisposition.purpose !==
    rejectedLivePurpose &&
    ordinaryCanonicalDisagreement.operationalDisposition.desiredResult !==
      rejectedLiveDesiredResult &&
    ordinaryCanonicalDisagreement.operationalDisposition.strongestNextStep ===
      'perform the comparison directly from current validated evidence' &&
    ordinaryCanonicalDisagreement.operationalDisposition.interaction === null &&
    !ordinaryCanonicalDisagreement.operationalDisposition.interactionUseful &&
    ordinaryCanonicalDisagreement.operationalDisposition.materialLiveBenefit ===
      null &&
    !ordinaryCanonicalDisagreement.operationalDisposition
      .liveMateriallyImprovesExecution &&
    adversarialRejectedLiveAuthority.operationalJudgment
      .operationalDisposition.providerProposalAccepted === false &&
    adversarialRejectedLiveExecutionInstruction.includes(
      'perform the comparison directly from current validated evidence',
    ) &&
    ![
      rejectedProviderCandidate,
      rejectedLivePurpose,
      rejectedLiveDesiredResult,
      rejectedLiveStrongestNextStep,
      rejectedLiveInteraction,
      rejectedLiveMaterialBenefit,
    ].some((rejectedField) =>
      adversarialRejectedLiveExecutionInstruction.includes(rejectedField),
    ),
  'rejected LIVE action-bearing fields survived canonical rejection or entered execution authority',
)

const provisionalRuntimeSnapshot = buildRuntimeSnapshot()
assert(
  base.action === 'acquire_smallest_signal' &&
    base.operationalPosture === 'preparing' &&
    provisionalRuntimeSnapshot.operationalResourceMonitor.resources.some(
      (resource) => resource.type === 'missing_signal',
    ) &&
    adversarialRejectedLiveAuthority.operationalJudgment.action ===
      'advance_outcome' &&
    adversarialRejectedLiveAuthority.operationalJudgment.operationalPosture ===
      'planning' &&
    adversarialRejectedLiveAuthority.executionPolicy.normalPosture ===
      'planning' &&
    !adversarialRejectedLiveAuthority.operationalResourceMonitor.resources.some(
      (resource) => resource.type === 'missing_signal',
    ),
  'a provisional acquisition posture or resource escaped after canonical Normal advancement was accepted',
)

assertAuthorityCoherent(adversarialRejectedLiveAuthority, {
  disposition: 'continue_normal',
  action: 'advance_outcome',
  move: 'answer',
  posture: 'planning',
})
assertAuthorityCoherent(coherentExecutionOpportunity, {
  disposition: 'execution_opportunity',
  action: 'advance_outcome',
  move: 'answer',
  posture: 'planning',
})
assertAuthorityCoherent(coherentSignalAcquisition, {
  disposition: 'unresolved',
  action: 'acquire_smallest_signal',
  move: 'ask',
  posture: 'preparing',
  missingSignal: 'the maximum acceptable commitment',
})
assertAuthorityCoherent(coherentUnresolvedWithoutSignal, {
  disposition: 'unresolved',
  action: 'clarify_direction',
  move: 'explore',
  posture: 'preparing',
})
assert(
  coherentExecutionOpportunity.operationalJudgment.operationalDisposition
    .interaction === 'a focused interaction with the decision-holder' &&
    coherentExecutionOpportunity.operationalJudgment.operationalDisposition
      .liveMateriallyImprovesExecution &&
    coherentExecutionOpportunity.operationalJudgment.operationalDisposition
      .materialLiveBenefit?.includes('real-time adaptation'),
  'a valid execution opportunity lost its accepted interaction or material LIVE authority',
)
assert(
  rejectedLiveExecution.message === null &&
    !rejectedLiveExecution.executionAccepted &&
    unauthorizedQuestionExecution.message === null &&
    !unauthorizedQuestionExecution.executionAccepted,
  'execution text could override an accepted Normal disposition or invent signal acquisition',
)
assert(
  authorizedQuestionExecution.executionAccepted &&
    authorizedQuestionExecution.message === authorizedQuestionText &&
    expandedQuestionExecution.message === null &&
    !expandedQuestionExecution.executionAccepted &&
    authorizedQuestionAfterNotices === authorizedQuestionText,
  'the final response did not constrain acquisition to exactly the accepted requested signal',
)
assert(
  noSignalCapacityNotice.includes(
    'limited to the currently validated evidence',
  ) &&
    !noSignalCapacityNotice.includes('Give me the missing piece') &&
    !noSignalCapacityNotice.includes('?'),
  'post-response governance introduced unauthorized evidence acquisition',
)
assert(
  parsedRichExecution?.authority.disposition === 'continue_normal' &&
    parsedRichExecution.authority.strongestNextStep ===
      ordinarySelfExecutable.operationalDisposition.strongestNextStep &&
    parsedPolicyBoundExecution?.authority.executionPolicy?.strategyMove ===
      adversarialRejectedLiveAuthority.executionPolicy.strategyMove &&
    forgedProviderAuthorityExecution?.authority.action ===
      adversarialRejectedLiveAuthority.operationalJudgment.action &&
    forgedProviderAuthorityExecution?.authority.disposition ===
      adversarialRejectedLiveAuthority.operationalJudgment.operationalDisposition.disposition &&
    forgedProviderAuthorityExecution?.authority.executionPolicy?.strategyMove ===
      adversarialRejectedLiveAuthority.executionPolicy.strategyMove &&
    acceptedRichExecution.executionAccepted &&
    finalVisibleRichExecution.executionAccepted &&
    finalVisibleRichExecution.operationalJudgment === ordinarySelfExecutable &&
    finalVisibleRichExecution.message?.includes(
      'Option A is therefore 20 units cheaper.',
    ) &&
    finalVisibleRichExecution.message?.includes(
      'select Option A',
    ) &&
    !finalVisibleRichExecution.message?.includes(
      'Start with the clearest version',
    ) &&
    !finalVisibleRichExecution.message?.includes(
      'source, timeframe, or assumption',
    ),
  'canonical presentation replaced or collapsed the accepted rich work product',
)
assert(
  primaryProviderRealization?.authority.action ===
    adversarialRejectedLiveAuthority.operationalJudgment.action &&
    fallbackProviderRealization?.authority.action ===
      adversarialRejectedLiveAuthority.operationalJudgment.action &&
    JSON.stringify(primaryProviderRealization.authority) ===
      JSON.stringify(fallbackProviderRealization.authority) &&
    !primaryProviderRealization.text.includes(rejectedProviderCandidate) &&
    !fallbackProviderRealization.text.includes(rejectedProviderCandidate),
  'primary and fallback realization did not preserve one accepted Operational Judgment and execution policy',
)
assert(
  malformedExecution === null &&
    providerReturnedTextOnlyExecution?.text === richWorkProduct &&
    providerReturnedTextOnlyExecution?.authority.action ===
      ordinarySelfExecutable.action &&
    providerReturnedTextOnlyExecution?.authority.disposition ===
      ordinarySelfExecutable.operationalDisposition.disposition &&
    emptyExecution === null &&
    emptyExecutionResult.message === null &&
    !emptyExecutionResult.executionAccepted &&
    !emptyExecutionResult.message?.includes(
      'This plain-text pre-canonical candidate must not be accepted.',
    ),
  'empty or malformed execution escaped, or provider execution incorrectly depended on model-authored authority attestation',
)

assert(
  acquisition.operationalDisposition.disposition === 'unresolved' &&
    acquisition.signalAcquisition.shouldAcquire &&
    acquisition.smallestSignal ===
      'the user-owned boundary governing the decision',
  'canonical Operational Judgment could not authorize one consequential signal',
)
assert(
  jobAcquisition.signalAcquisition.shouldAcquire &&
    jobAcquisition.signalAcquisition.requestedSignal ===
      'the target role or opportunity' &&
    jobAcquisition.operationalDisposition.consequentialUncertainty ===
      jobAcquisition.signalAcquisition.requestedSignal &&
    businessAcquisition.signalAcquisition.shouldAcquire &&
    businessAcquisition.signalAcquisition.requestedSignal ===
      'the business model being evaluated' &&
    businessAcquisition.operationalDisposition.consequentialUncertainty ===
      businessAcquisition.signalAcquisition.requestedSignal &&
    !base.operationalDisposition.operationalObjective,
  'consequential acquisition was inferred from schema state instead of canonical semantic evidence',
)
assert(
  !staleAcquisitionRejected.signalAcquisition.shouldAcquire &&
    staleAcquisitionRejected.operationalDisposition.disposition ===
      'unresolved' &&
    staleAcquisitionRejected.signalAcquisition.reason.includes(
      'no stale acquisition authority',
    ),
  'failed question formulation preserved stale acquisition authority',
)
assert(
  opportunityResult.source === 'operational_judgment' &&
    opportunityResult.operationalJudgment.operationalDisposition.disposition ===
      'execution_opportunity' &&
    opportunityResult.operationalJudgment.operationalDisposition.interaction ===
      'a focused decision-maker validation conversation' &&
    normalResult.operationalJudgment.operationalDisposition.strongestNextStep ===
      'produce the decision analysis now' &&
    normalResult.message ===
      normal.operationalDisposition.presentation &&
    otherResult.operationalJudgment.operationalDisposition.strongestNextStep ===
      'inspect the signed record and resolve the controlling fact' &&
    otherResult.message === other.operationalDisposition.presentation &&
    opportunityResult.message ===
      opportunity.operationalDisposition.presentation &&
    rejectedLiveResult.message ===
      liveInterestOnly.operationalDisposition.presentation &&
    rejectedLiveResult.message !== 'LIVE is ready because you tapped it.' &&
    acquisitionResult.message === null,
  'visible presentation was not bound to the accepted canonical disposition',
)
assert(
  requestNote.includes('not a new conversational user turn') &&
    requestNote.includes('Do not answer the last user message again') &&
    requestNote.includes('Reason in this order') &&
    requestNote.includes('actual Normal action') &&
    requestNote.includes('identified stronger action'),
  'provider request semantics permit an ordinary repeated Normal answer',
)
assert(
  judgmentProviderRequest.systemContent.includes(
    'NORMAL LIVE OPERATIONAL JUDGMENT REQUEST',
  ) &&
    judgmentProviderRequest.messages.length === 3 &&
    judgmentProviderRequest.messages[1]?.role === 'assistant' &&
    judgmentProviderRequest.messages[1]?.content.includes(
      'already visible',
    ) &&
    judgmentProviderRequest.messages[2]?.content.includes(
      'Apply the Normal LIVE Operational Judgment request',
    ),
  'Operational Judgment request assembly truncated to and reissued the original Normal user turn',
)

console.log(JSON.stringify({
  evidenceQuestionOwner: 'signal-question',
  acquisitionAuthorizationOwner: acquisition.operationalDisposition.source,
  judgmentOwner: ready.operationalDisposition.source,
  preparationEvidence: preparation?.priorInteractions[0]?.answer,
  selectedFormulaReference: preparation?.formula,
  dispositions: {
    ready: ready.operationalDisposition.disposition,
    liveInterestOnly: liveInterestOnly.operationalDisposition.disposition,
    normal: normal.operationalDisposition.disposition,
    opportunity:
      opportunityResult.operationalJudgment.operationalDisposition.disposition,
    other: otherResult.operationalJudgment.operationalDisposition.disposition,
  },
  structuredBoundary: opportunityResult.source,
  consequentialAcquisition: {
    job: jobAcquisition.signalAcquisition.requestedSignal,
    business: businessAcquisition.signalAcquisition.requestedSignal,
  },
  ordinaryNormal: {
    authorityFlow: 'semantic_proposal -> operational_judgment -> provider_execution',
    selfExecutableDisposition:
      ordinarySelfExecutable.operationalDisposition.disposition,
    richExecution: ordinarySelfExecution.realization,
    consequentialSignal:
      ordinaryMissingSignal.signalAcquisition.requestedSignal,
    unresolvedWithoutSignal:
      ordinaryUnresolvedWithoutSignal.realization.executionGenerationRequired,
    rejectedProposalDisposition:
      ordinaryCanonicalDisagreement.operationalDisposition.disposition,
    preAcceptanceProviderTextUsed:
      ordinarySelfExecution.preAcceptanceProviderTextUsed,
  },
  duplicateVisibleResponsePrevented: true,
  result: 'PASS',
}, null, 2))
`)

try {
  execFileSync('npx', ['tsx', file], {
    cwd: root,
    stdio: 'inherit',
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}
