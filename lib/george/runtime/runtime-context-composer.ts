import type { PreparationTurnClassificationRequest } from '@/lib/george/runtime/operational-judgment'

export type GovernedRuntimeContextInput = {
  liveRuntimeContext?: string | null
  shelvedCampaignRuntimeNote?: string | null
  individualLiveContextNote?: string | null
  runtimeAdapterNote?: string | null
  earbudRuntimeNote?: string | null
  runtimeSignalArbitrationNote?: string | null
  arbitrationResponseShapeNote?: string | null
  adaptiveUserProfileNote?: string | null
  durableBehavioralMemoryNote?: string | null
  operationalMemoryEvidenceNote?: string | null
  preparationContextNote?: string | null
  runtimeOutcomeLearningNote?: string | null
  continuityRestorationNote?: string | null
  judgmentSurfaceNote?: string | null
  trajectoryNote?: string | null
  operationalJudgmentNote?: string | null
  outcomeEvolutionNote?: string | null
  conversationStrategyNote?: string | null
  conversationMoveDefinitionNote?: string | null
  executionPolicyNote?: string | null
  contextFramingNote?: string | null
  responseShapeNote?: string | null
  continuityGovernanceNote?: string | null
  outputGovernanceNote?: string | null
  presentationAuthorityNote?: string | null
}

export type ProviderExecutionAuthorityInput = {
  runtime: 'normal_george' | 'live_george'
  action: string
  strategyMove: string
  strategyPurpose: string
  executionType: string
  audience: string
  normalPosture?: string
  explanationDepth: string
  assumptionHandling: string
  repetitionPolicy: string
  signalShouldAcquire: boolean
  requestedSignal?: string
  signalReason: string
  signalAssessmentAuthority?: 'governing' | 'provisional'
  decisionAssessmentAuthority?: 'governing' | 'provisional'
  authoritySource?: 'runtime_heuristic' | 'canonical_operational_judgment'
  operationalDisposition?: string
  operationalObjective?: string | null
  knownEvidence?: readonly string[]
  consequentialUncertainty?: string | null
  georgeResolvableWork?: readonly string[]
  georgeCanAdvanceWithoutUserSignal?: boolean
  strongestNextStep?: string | null
  interaction?: string | null
  interactionUseful?: boolean
  purpose?: string | null
  desiredResult?: string | null
  liveMateriallyImprovesExecution?: boolean
  materialLiveBenefit?: string | null
  opportunityTitle?: string
  opportunityReadiness?: number
  opportunityThresholdMet?: boolean
}

export function buildProviderExecutionAuthority(
  input: ProviderExecutionAuthorityInput
) {
  const opportunity = input.opportunityTitle
    ? `${input.opportunityTitle} (${input.opportunityReadiness ?? 0}% ready${
        input.opportunityThresholdMet ? ', threshold met' : ''
      })`
    : 'none'
  const canonicalAuthority =
    input.authoritySource === 'canonical_operational_judgment'
  const signalAssessment =
    input.signalAssessmentAuthority === 'provisional'
      ? `- Heuristic signal assessment: ${input.signalShouldAcquire ? 'candidate acquisition' : 'no candidate acquisition'}
- Provisional candidate signal: ${input.requestedSignal || 'none'}
- Heuristic basis: ${input.signalReason}
- Authority boundary: This assessment is provisional evidence only. Independently determine whether any uncertainty is consequential, user-owned, and necessary to the strongest next action. Do not treat this assessment as authorization to ask.`
      : `${canonicalAuthority ? '- Canonical signal-acquisition authorization' : '- Signal acquisition warranted'}: ${input.signalShouldAcquire ? 'yes' : 'no'}
- Smallest useful signal: ${input.requestedSignal || 'none'}
- Signal judgment: ${input.signalReason}`
  const signalRealizationRule =
    input.signalAssessmentAuthority === 'provisional'
      ? '- During semantic proposal, decide signal acquisition only after determining the objective, GEORGE-resolvable work, strongest next action, interaction usefulness, and material LIVE benefit.'
      : canonicalAuthority
        ? '- Ask exactly one natural question only when canonical signal acquisition is authorized, and acquire only the accepted requested signal.'
        : '- When signal acquisition is warranted, ask one natural question that earns only the smallest useful signal. Do not add a preparation package around it.'
  const provisionalDecision =
    input.decisionAssessmentAuthority === 'provisional'
  const decisionAuthority = provisionalDecision
    ? '- Authority status: provisional heuristic evidence for canonical Operational Judgment. No action, move, execution policy, opportunity, or signal listed below is an accepted conclusion.'
    : canonicalAuthority
      ? '- Authority status: accepted canonical Operational Judgment. Execute this authority without reconsidering or replacing it.'
      : '- Authority status: governing runtime execution context.'
  const realizationAuthority = provisionalDecision
    ? '- This block is not final realization authority. Independently reason from objective and evidence, then return only the semantic proposal for canonical validation.'
    : canonicalAuthority
      ? '- This block is final execution authority. Perform the accepted action; do not produce another operational judgment.'
      : '- This block is the final realization authority at the provider boundary.'
  const canonicalDecision = canonicalAuthority
    ? `
CANONICAL OPERATIONAL DECISION
- Disposition: ${input.operationalDisposition || 'unresolved'}
- Operational objective: ${input.operationalObjective || 'not established'}
- Accepted known evidence: ${(input.knownEvidence || []).join(' | ') || 'none'}
- Consequential uncertainty: ${input.consequentialUncertainty || 'none'}
- GEORGE-resolvable work: ${(input.georgeResolvableWork || []).join(' | ') || 'none'}
- GEORGE can advance without user signal: ${input.georgeCanAdvanceWithoutUserSignal ? 'yes' : 'no'}
- Strongest next step: ${input.strongestNextStep || 'none'}
- Useful interaction: ${input.interaction || 'none'}
- Interaction useful: ${input.interactionUseful ? 'yes' : 'no'}
- Purpose: ${input.purpose || 'none'}
- Desired result: ${input.desiredResult || 'none'}
- LIVE materially improves execution: ${input.liveMateriallyImprovesExecution ? 'yes' : 'no'}
- Material LIVE benefit: ${input.materialLiveBenefit || 'none'}
`
    : ''

  return `
PROVIDER EXECUTION AUTHORITY
${decisionAuthority}
- Runtime: ${input.runtime}
- Audience: ${input.audience}
- ${provisionalDecision ? 'Heuristic action candidate' : 'Operational action'}: ${input.action}
- ${provisionalDecision ? 'Heuristic conversational-move candidate' : 'Selected conversational move'}: ${input.strategyMove}
- ${provisionalDecision ? 'Heuristic purpose candidate' : 'Purpose'}: ${input.strategyPurpose}
- ${provisionalDecision ? 'Heuristic execution-type candidate' : 'Execution type'}: ${input.executionType}
- Normal execution posture: ${input.normalPosture || 'not applicable'}
- Explanation depth: ${input.explanationDepth}
- Assumption handling: ${input.assumptionHandling}
- Repetition policy: ${input.repetitionPolicy}
${signalAssessment}
- Highest-value opportunity: ${opportunity}
${canonicalDecision}

GEORGE CAPABILITY AUTHORITY
- Respond as GEORGE, not as a generic assistant describing generic model limitations.
- GEORGE can plan, prepare, reason, write, structure, draft, revise, and produce user-requested work products within the active product surface, including pitch-deck content and other documents supported by the application.
- GEORGE LIVE is an operating mode of this same intelligence for real-time conversational support. Do not claim that LIVE support is unavailable merely because GEORGE cannot independently enter a conventional telephone or video connection.
- Infer capability requests and capability usefulness semantically from the user's words, the recent conversation, the active objective, and available product context. Do not require exact phrases, keyword matches, a separate intelligence, or registry thresholds to understand what the user is asking GEORGE to do or what may help.
- When the user is requesting an existing GEORGE capability, acknowledge the capability and advance or activate the appropriate product flow. Do not substitute a generic refusal or downgrade the request to advice-only assistance.
- When LIVE may materially help the user's current session, point that out briefly and naturally while still answering the user's current request.
- A LIVE suggestion is non-blocking. It must not replace, reset, summarize, or interrupt the conversation already in progress.
- The corresponding LIVE control may surface beside the message bar so the user can tap it to begin briefing or ignore it and continue the same conversation.
- Do not ask the user to choose between continuing the conversation and using LIVE. Continue the conversation by default.
- Do not begin briefing, switch runtime, or activate LIVE until the user taps or explicitly confirms the LIVE control.
- Distinguish direct capability requests from unsolicited recommendations. Recommendation restraint must never suppress a direct request to use GEORGE, LIVE, document production, preparation, or another available capability.
- Preserve genuine ambiguity. For an isolated term with multiple plausible meanings, briefly surface the ambiguity or ask for the smallest useful distinction instead of selecting an arbitrary domain.
- Use relevant session context when it materially favors one interpretation. Do not discard established context merely because the latest utterance is short, misspelled, or incomplete.

REALIZATION RULES
${realizationAuthority}
- Obey the current user utterance and this operational conclusion over broader or older prompt guidance when realization instructions compete.
- The selected conversational move defines the maximum allowable scope of this response, except that it must not erase or deny a direct capability request.
- Advancement means completing the smallest move that improves the operational state, not completing the entire likely project.
- Response length is subordinate to that selected move: provide all substance materially required to execute it well, but do not enlarge the move merely because additional information, analysis, or advice could also be useful.
- When the user's intended outcome is not sufficiently established to justify a broader move, infer responsibly where possible and otherwise resolve only the consequential ambiguity needed to choose the strongest next move.
- Do not replace the selected move with a generic consultant package, checklist, briefing framework, objection bundle, script, or multi-part plan unless the user explicitly asks for that form or the execution type requires it.
${signalRealizationRule}
- When signal acquisition is not warranted, do not ask merely to complete fields.
- For Normal GEORGE, speak to the user. Never adopt LIVE room-facing response style, cue compression, receiver delivery, or through-the-user phrasing.
- In Normal execution-imminent posture, acknowledge the governing outcome or constraint, provide the smallest immediately useful tactical preparation, and ask at most one materially valuable question.
- Keep internal runtime labels, scores, confidence, and authority language hidden from the user.
`.trim()
}

function buildOperationalPreparationJudgmentRequestNoteWithClassification(
  classificationRequest?: PreparationTurnClassificationRequest | null
) {
  const classificationDuty = !classificationRequest
    ? ''
    : classificationRequest.malformed
      ? `
PREPARATION TURN CLASSIFICATION REQUIRED
- The supplied explicit/inferred classification transport is malformed.
- Do not repair it, infer around it, or allow this turn into LIVE preparation. Operational Judgment will fail closed.`
      : classificationRequest.explicitSelection
        ? `
PREPARATION TURN CLASSIFICATION REQUIRED
- The user explicitly selected ${classificationRequest.explicitSelection} for this turn. That intended use is authoritative and must not be silently reversed.
- Return a structurally complete preparationTurnClassification proposal consistent with that explicit selection so Operational Judgment can assess pending-question disposition without becoming a second classification owner.`
        : `
PREPARATION TURN CLASSIFICATION REQUIRED
- Infer whether this user turn is live_briefing, preparation, or clarification_required from its full semantic meaning and the active preparation context. Do not use keyword matching.
- The current inferred classification is ${classificationRequest.currentClassification}. Your proposal must let Operational Judgment determine whether the inferred mode was retained, switched, or requires immediate clarification.
- A question may shape LIVE preparation, but it is not automatically accepted evidence or an answer to the pending question.
- Use clarification_required only when intended use cannot be determined responsibly.`

  return `
OPERATIONAL PREPARATION JUDGMENT REQUEST
- It is a control-plane reasoning request, not a new conversational user turn.
- It applies only to the validated Preparation Session and its retained entry provenance.
- Do not answer the last user message again, continue the prior ordinary Normal response, or replay prior assistant prose.
- Treat preparation entry as user interest in the capability, not evidence that the capability is operationally useful.
- If definitive user evidence does not establish the concrete desired result of the anticipated LIVE interaction, preserve that missing result as the governing consequential uncertainty. Its acquisition has priority over scope or topic confirmation, participant identity, role, mechanics, constraints, leverage, risks, and other preparation details.
- Do not infer, suggest, or promote a plausible LIVE outcome from assistant prose, provisional preparation, or an illustrative example. Certainty about the user's objective outranks a strategically attractive guess.
- Once the user establishes the LIVE desired outcome, freshly reassess the complete evidence and compare the strongest operational candidates. No scope, participant, role, constraint, or other field is automatically next.
- Do not acquire target market, product details, business-plan details, role, title, audience, objections, or other downstream preparation facts merely because they may eventually be useful. Ask only when uncertainty about that fact materially impairs the next LIVE judgment.
- Reason in this order: desired outcome of the anticipated conversation; known evidence; work GEORGE can resolve or perform; consequential uncertainty; strongest next action; interaction usefulness; material LIVE execution benefit; disposition; and only then any exact user-owned evidence need.
- Use validated user evidence, conversation context, Operational Memory Evidence, preparation evidence, and current capabilities. Prior GEORGE advice is conversation context, not independent user-owned evidence.
- Determine whether an interaction supported by LIVE materially helps now, whether continued work outside LIVE is stronger, or whether another concrete action should come first.
- Return the proposed semantic result in semanticJudgment.operationalReasoning. Do not generate a separate top-level answer during this semantic phase.
- For execution_ready or execution_opportunity, make the interaction, GEORGE's situation-derived execution functions, desired result, strongest next step, and material LIVE execution benefit concrete.
- For continue_normal, state why Normal is stronger now and identify the actual Normal action GEORGE should perform next.
- For other_action, state the identified stronger action and why it outranks LIVE or another preparation question.
- For unresolved, propose signal acquisition only when the same exact consequential uncertainty is user-owned, required for the next operational decision, and cannot be displaced by useful work GEORGE can perform now. Do not formulate the question.
- Do not expose internal disposition labels, request metadata, or authority terminology.
${classificationDuty}
`.trim()
}

export function buildOperationalPreparationJudgmentRequestNote() {
  return buildOperationalPreparationJudgmentRequestNoteWithClassification()
}

/**
 * Compatibility name retained for the frozen runtime-pipeline caller. The
 * returned contract is source-neutral and remains the single preparation
 * judgment request note.
 */
export function buildNormalLiveOperationalJudgmentRequestNote(
  classificationRequest?: PreparationTurnClassificationRequest | null
) {
  if (!classificationRequest) {
    return buildOperationalPreparationJudgmentRequestNote()
  }

  return buildOperationalPreparationJudgmentRequestNoteWithClassification(
    classificationRequest
  )
}

export function buildNormalProviderRuntimeContext(input: {
  providerExecutionAuthority: string
  operationalJudgmentRequestNote?: string | null
  adaptiveUserProfileNote?: string | null
  durableBehavioralMemoryNote?: string | null
  operationalMemoryEvidenceNote?: string | null
  preparationContextNote?: string | null
  runtimeOutcomeLearningNote?: string | null
  continuityRestorationNote?: string | null
  continuityGovernanceNote?: string | null
  presentationAuthorityNote?: string | null
}) {
  return composeRuntimeContext([
    input.operationalJudgmentRequestNote,
    input.adaptiveUserProfileNote,
    input.durableBehavioralMemoryNote,
    input.operationalMemoryEvidenceNote,
    input.preparationContextNote,
    input.runtimeOutcomeLearningNote,
    input.continuityRestorationNote,
    input.continuityGovernanceNote,
    input.presentationAuthorityNote,
    input.providerExecutionAuthority,
  ])
}

export function composeRuntimeContext(blocks: Array<string | null | undefined>) {
  return blocks
    .map((block) => String(block || '').trim())
    .filter(Boolean)
    .map((block) => `

${block}

`)
    .join('')
}

export function buildGovernedRuntimeContext(input: GovernedRuntimeContextInput) {
  return composeRuntimeContext([
    input.liveRuntimeContext,
    input.shelvedCampaignRuntimeNote,
    input.individualLiveContextNote,
    input.runtimeAdapterNote,
    input.earbudRuntimeNote,
    input.runtimeSignalArbitrationNote,
    input.arbitrationResponseShapeNote,
    input.adaptiveUserProfileNote,
    input.durableBehavioralMemoryNote,
    input.operationalMemoryEvidenceNote,
    input.preparationContextNote,
    input.runtimeOutcomeLearningNote,
    input.continuityRestorationNote,
    input.judgmentSurfaceNote,
    input.trajectoryNote,
    input.operationalJudgmentNote,
    input.outcomeEvolutionNote,
    input.conversationStrategyNote,
    input.conversationMoveDefinitionNote,
    input.executionPolicyNote,
    input.contextFramingNote,
    input.responseShapeNote,
    input.continuityGovernanceNote,
    input.outputGovernanceNote,
    input.presentationAuthorityNote,
  ])
}
