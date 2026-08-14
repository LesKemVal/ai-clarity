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
- Do not replace the selected move with a generic consultant package, checklist, briefing framework, objection bundle, script, or multi-part plan unless the user explicitly asks for that form or the execution type requires it.
${signalRealizationRule}
- When signal acquisition is not warranted, do not ask merely to complete fields.
- For Normal GEORGE, speak to the user. Never adopt LIVE room-facing response style, cue compression, receiver delivery, or through-the-user phrasing.
- In Normal execution-imminent posture, acknowledge the governing outcome or constraint, provide the smallest immediately useful tactical preparation, and ask at most one materially valuable question.
- Keep internal runtime labels, scores, confidence, and authority language hidden from the user.
`.trim()
}

export function buildNormalLiveOperationalJudgmentRequestNote() {
  return `
NORMAL LIVE OPERATIONAL JUDGMENT REQUEST
- This request was caused by the user invoking the Normal LIVE control. It is a control-plane reasoning request, not a new conversational user turn.
- Do not answer the last user message again, continue the prior ordinary Normal response, or replay prior assistant prose.
- Treat the LIVE invocation as user interest in the capability, not evidence that the capability is operationally useful.
- Reason in this order: operational objective; known evidence; work GEORGE can resolve or perform; consequential uncertainty; strongest next action; interaction usefulness; material LIVE execution benefit; disposition; and only then any exact user-owned evidence need.
- Use validated user evidence, conversation context, Operational Memory Evidence, preparation evidence, and current capabilities. Prior GEORGE advice is conversation context, not independent user-owned evidence.
- Determine whether an interaction supported by LIVE materially helps now, whether continued Normal work is stronger, or whether another concrete action should come first.
- Return the proposed semantic result in semanticJudgment.operationalReasoning. Do not generate a separate top-level answer during this semantic phase.
- For execution_ready or execution_opportunity, make the interaction, GEORGE's situation-derived execution functions, desired result, strongest next step, and material LIVE execution benefit concrete.
- For continue_normal, state why Normal is stronger now and identify the actual Normal action GEORGE should perform next.
- For other_action, state the identified stronger action and why it outranks LIVE or another preparation question.
- For unresolved, propose signal acquisition only when the same exact consequential uncertainty is user-owned, required for the next operational decision, and cannot be displaced by useful work GEORGE can perform now. Do not formulate the question.
- Do not expose internal disposition labels, request metadata, or authority terminology.
`.trim()
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
