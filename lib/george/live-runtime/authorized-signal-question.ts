import OpenAI from 'openai'

export type AuthorizedSignalQuestionResult =
  | Readonly<{
      status: 'question'
      question: string
      label: string
      why: string
      example: string
      key: string
    }>
  | Readonly<{
      status: 'unavailable'
      reason:
        | 'question_formulation_unavailable'
        | 'duplicate_evidence_request'
        | 'unauthorized_evidence_request'
    }>

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export const DIRECT_LIVE_DESIRED_OUTCOME_QUESTION =
  'What do you want from this conversation?' as const

export const INFERENCE_CORRECTION_SUFFIX =
  ' — or something else?' as const

function inferenceCorrectionSuffixCount(value: string) {
  return value.split(INFERENCE_CORRECTION_SUFFIX).length - 1
}

function normalizeInferenceQuestionStem(value: unknown) {
  return clean(value)
    .replace(
      /\s*(?:—|–|-|,)?\s*or something else[?!.]*\s*$/i,
      ''
    )
    .replace(/[?!.]+\s*$/, '')
    .trim()
}

export function realizeInferenceQuestionStem(value: unknown) {
  const stem = normalizeInferenceQuestionStem(value)

  return stem ? `${stem}${INFERENCE_CORRECTION_SUFFIX}` : ''
}

export async function formulateAuthorizedSignalQuestion(input: {
  client: OpenAI
  model: string
  authorizedEvidenceNeed: string
  authorizationReason?: string | null
  authorizationPurpose?: 'live_scope_grounding' | 'qualification' | null
  knownSignal?: unknown
}): Promise<AuthorizedSignalQuestionResult> {
  const authorizedEvidenceNeed = clean(input.authorizedEvidenceNeed)

  if (!authorizedEvidenceNeed) {
    return {
      status: 'unavailable',
      reason: 'question_formulation_unavailable',
    }
  }

  const dutyCompletion = await input.client.chat.completions.create({
    model: input.model,
    ...(input.model.startsWith('gpt-5')
      ? {}
      : { temperature: 0 }),
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `
You classify the realization duty for one already-authorized GEORGE evidence question.

Do not formulate a question or select another evidence need.

Classify from the authorized evidence need and accumulated evidence:
- direct_desired_outcome: either the result, response, decision, action, evaluation, or other operational move the user wants GEORGE to provide now remains unknown, or the execution-grade result the user wants to accomplish in or through the anticipated LIVE interaction remains unknown; in either case it must be asked directly;
- inference_testing: the authorized evidence need deliberately tests an unconfirmed interpretation or hypothesis;
- direct_fact: the authorized need asks for another user-owned fact without testing an interpretation and is not a missing desired outcome or operational move.

A topic, broad reason, likely outcome, assistant proposal, or provisional value does not make an unknown desired outcome definitive. direct_desired_outcome applies only when the evidence need directly asks what result or operational move the user wants from GEORGE now, or for the concrete result the user wants from an already identified anticipated interaction.

An evidence need that asks what the anticipated interaction is about, how it relates to carried context, or whether a supported scope interpretation is correct is not direct desired-outcome acquisition. It is inference_testing when it exposes a possible interpretation and allows a different answer, even if it mentions an interaction objective or the underlying fact could otherwise be asked directly.

Classify the evidence need adversarially before selecting the duty:
- evidenceObject is anticipated_live_interaction only when the evidence need names the other conversation that will occur while GEORGE operates LIVE; current_george_exchange when it asks what the user wants GEORGE to do, provide, answer, or help with now; otherwise other_user_fact. Classify the grammatical evidence object in the authorized need itself. Do not infer a LIVE object from the surrounding subject or accumulated evidence;
- asksForDesiredLiveResult is true only when a direct answer necessarily states the concrete result the user wants the anticipated interaction to accomplish;
- belongsToAnticipatedLiveInteraction is true only when the evidence need is about the other conversation that will occur while GEORGE is operating LIVE, not a request for help from GEORGE in the current Normal exchange;
- groundsAnticipatedLiveScope is true only when a direct answer establishes what the other anticipated LIVE interaction concerns or how that interaction relates to carried Normal context. A question about what help the user wants from GEORGE in the current Normal exchange is not anticipated-LIVE scope grounding;
- testsUnconfirmedInterpretation is true when the need presents a possible interpretation that the user may confirm, refine, or disconfirm;
- asksForDirectFact is true when the need asks for another user-owned fact without an inference.

When evidenceObject is anticipated_live_interaction and the evidence need directly asks for its desired result, also return one context-aware illustrative example. The example must state a concrete desired result with useful contextual specificity, not merely repeat or confirm the conversation topic. It is presentation guidance only and must never be treated as user-owned evidence. Return null for contextualExample for every other classification.

current_george_exchange always requires direct_desired_outcome because that evidence object is the result or operational move the user wants from GEORGE now. It is direct acquisition, not inference testing. For anticipated_live_interaction, direct_desired_outcome has priority when the evidence need directly asks for the desired result, even if answering it would incidentally reveal or ground scope. Use inference_testing only when the evidence need itself tests an interpretation or grounds topic/scope instead of directly asking for the desired result. Use direct_fact for another established user-owned fact. For other_user_fact, use inference_testing only when the need tests an interpretation; otherwise use direct_fact.

Return JSON only:
{
  "realizationDuty": "direct_desired_outcome" | "inference_testing" | "direct_fact",
  "evidenceObject": "anticipated_live_interaction" | "current_george_exchange" | "other_user_fact",
  "asksForDesiredLiveResult": false,
  "belongsToAnticipatedLiveInteraction": false,
  "groundsAnticipatedLiveScope": true,
  "testsUnconfirmedInterpretation": true,
  "asksForDirectFact": false,
  "contextualExample": "one concise illustrative desired-result answer or null",
  "reason": "concise semantic reason"
}
        `.trim(),
      },
      {
        role: 'user',
        content: JSON.stringify({
          authorizedEvidenceNeed,
          authorizationReason:
            clean(input.authorizationReason) ||
            'Canonical Operational Judgment authorized this evidence need.',
          authorizationPurpose: input.authorizationPurpose || null,
          knownSignal: input.knownSignal ?? null,
        }),
      },
    ],
  })

  const dutyParsed = JSON.parse(
    dutyCompletion.choices?.[0]?.message?.content || '{}'
  )
  const evidenceObject = clean(dutyParsed?.evidenceObject)
  const derivedRealizationDuty =
    evidenceObject === 'current_george_exchange'
      ? 'direct_desired_outcome'
      : evidenceObject === 'anticipated_live_interaction'
        ? dutyParsed?.asksForDesiredLiveResult === true &&
          dutyParsed?.belongsToAnticipatedLiveInteraction === true
          ? 'direct_desired_outcome'
          : input.authorizationPurpose === 'live_scope_grounding' ||
              dutyParsed?.testsUnconfirmedInterpretation === true
            ? 'inference_testing'
            : input.authorizationPurpose === 'qualification' ||
                dutyParsed?.asksForDirectFact === true
              ? 'direct_fact'
              : dutyParsed?.groundsAnticipatedLiveScope === true
                ? 'inference_testing'
              : null
        : evidenceObject === 'other_user_fact'
          ? dutyParsed?.testsUnconfirmedInterpretation === true
            ? 'inference_testing'
            : 'direct_fact'
          : null
  const realizationDuty =
    evidenceObject === 'current_george_exchange' ||
    (
      evidenceObject === 'anticipated_live_interaction' &&
      (
        derivedRealizationDuty === 'direct_desired_outcome' ||
        (
          input.authorizationPurpose === 'live_scope_grounding' &&
          derivedRealizationDuty === 'inference_testing'
        ) ||
        (
          input.authorizationPurpose === 'qualification' &&
          derivedRealizationDuty === 'direct_fact'
        )
      )
    )
      ? derivedRealizationDuty
      : clean(dutyParsed?.realizationDuty) === derivedRealizationDuty
        ? derivedRealizationDuty
        : null

  if (
    realizationDuty !== 'direct_desired_outcome' &&
    realizationDuty !== 'inference_testing' &&
    realizationDuty !== 'direct_fact'
  ) {
    return {
      status: 'unavailable',
      reason: 'question_formulation_unavailable',
    }
  }

  const directLiveDesiredOutcome = Boolean(
    realizationDuty === 'direct_desired_outcome' &&
      evidenceObject === 'anticipated_live_interaction'
  )

  if (directLiveDesiredOutcome) {
    const contextualExample = clean(dutyParsed?.contextualExample)

    if (!contextualExample) {
      return {
        status: 'unavailable',
        reason: 'question_formulation_unavailable',
      }
    }

    return {
      status: 'question',
      question: DIRECT_LIVE_DESIRED_OUTCOME_QUESTION,
      label: 'Desired outcome',
      why:
        clean(input.authorizationReason) ||
        'The desired result directs preparation for the anticipated LIVE interaction.',
      example: contextualExample,
      key: 'desiredOutcome',
    }
  }

  const formulationInstruction = `
You are GEORGE's authorized signal-question formulation owner.

Canonical Operational Judgment has already determined that one user interruption is warranted and has authorized exactly one evidence need.

Your authority is limited to formulating the strongest concise question that acquires that exact evidence need from the user.

Required realization duty: ${realizationDuty}
Evidence object: ${evidenceObject}

Rules:
- Do not decide whether another question should be asked; that decision has already been made.
- Do not select, substitute, broaden, narrow, or reopen another evidence gap.
- Do not ask for role, audience, interaction, background, or any other field unless resolving uncertainty about it is necessary to correctly acquire the authorized evidence need.
- Compare the authorized evidence need with the accumulated evidence before writing the question.
- Determine what GEORGE already knows, what is merely inferred, and what remains uncertain about the authorized evidence.
- Clarify the consequential uncertainty on which the authorized evidence and any later preparation would depend.
- First distinguish direct desired-outcome acquisition from a question that tests an unconfirmed inference.
- When the authorized evidence need is the still-unknown result or operational move the user wants from GEORGE now, ask for that result directly. Do not infer, suggest, enumerate, contrast, or offer likely outcomes for the user to confirm. Do not add "or something else?" or any equivalent correction-path alternative to this direct outcome question.
- When the evidence object is anticipated_live_interaction and the duty is direct_desired_outcome, the canonical realization layer already owns the exact question: "${DIRECT_LIVE_DESIRED_OUTCOME_QUESTION}" Do not rewrite, bridge, paraphrase, contextualize, or otherwise generate that question. Return null for question and questionStem. Generate only its context-aware illustrative answer and supporting presentation metadata.
- A direct desired-outcome question must be concise, conversational, context-aware, non-leading, and grammatically natural. A brief adaptive bridge may precede it only when the accumulated conversation makes the transition materially more natural; do not use a canned bridge.
- For an authorized non-outcome evidence need that deliberately tests an unconfirmed interpretation, generate a grammatical pre-suffix question stem. The stem must expose the interpretation as a possibility, contain no correction path, and end without terminal punctuation. Canonical realization will append exactly "${INFERENCE_CORRECTION_SUFFIX}" once.
- Make the inference stem grammatically natural when that exact suffix is appended. Do not include "or something else", another correction alternative, trailing explanation, or terminal punctuation in the stem.
- For a direct non-inference fact that is not the desired outcome, ask directly without manufacturing an interpretation or correction path.
- Use the user's established subject and language. Do not mechanically turn internal labels such as "desired outcome", "objective", "evidence need", "context", or "interaction" into the wording of the question.
- Ask the question as though it may be GEORGE's last opportunity before acting to acquire the user-owned fact that most improves the authorized operational decision.
- Use the accumulated evidence and history to avoid repetition, especially an unanswered question already visible in the conversation.
- Ask for the underlying user-owned fact, not professional reasoning GEORGE should perform.
- Do not formulate a domain questionnaire, a checklist, or a future sequence. Later questions must depend on the user's answer and a fresh reassessment.
- Keep the user-facing question sufficiently brief: normally one concise question, optionally preceded by one brief adaptive bridge. Do not append explanation, justification, summary, or "this will help" language unless it is necessary for the user to understand what is being asked.
- If the exact evidence need is already answered semantically or cannot responsibly be acquired from the user, return unavailable instead of choosing another need.
- The example must be one concise plausible answer, not an instruction or checklist.
- For direct acquisition of the anticipated LIVE interaction's desired outcome, OpenAI must reason over the accumulated conversation evidence and generate a contextual illustrative example. It must demonstrate a desired result plus useful contextual specificity, not merely repeat or confirm the broad topic. Unsupported but contextually plausible roles or counterparties may appear only as illustration. The example is presentation guidance, never user-owned evidence.
- For inference_testing, question must be null and questionStem must contain only the grammatical pre-suffix stem. For other duties, questionStem must be null and question contains the complete question, except that the canonical anticipated-LIVE desired-outcome question is not provider-generated and both fields must be null.

Return JSON only:
{
  "status": "question" | "unavailable",
  "question": "complete question or null under the duty rules",
  "questionStem": "inference-testing pre-suffix stem or null",
  "label": "short presentation label",
  "why": "why the authorized evidence matters to the operational decision",
  "example": "one concise plausible user answer",
  "key": "stable semantic key"
}
  `.trim()

  const requestFormulation = async (repairContext?: string | null) => {
    const completion = await input.client.chat.completions.create({
      model: input.model,
      ...(input.model.startsWith('gpt-5')
        ? {}
        : { temperature: 0.25 }),
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [formulationInstruction, repairContext || '']
            .filter(Boolean)
            .join('\n\n'),
        },
        {
          role: 'user',
          content: JSON.stringify({
            authorizedEvidenceNeed,
            authorizationReason:
              clean(input.authorizationReason) ||
              'Canonical Operational Judgment authorized this evidence need.',
            authorizationPurpose: input.authorizationPurpose || null,
            knownSignal: input.knownSignal ?? null,
          }),
        },
      ],
    })

    const parsed = JSON.parse(
      completion.choices?.[0]?.message?.content || '{}'
    )

    return {
      parsed,
      rawContent: completion.choices?.[0]?.message?.content || null,
      providerQuestion: clean(parsed?.question),
      questionStem: clean(parsed?.questionStem),
      question: directLiveDesiredOutcome
        ? DIRECT_LIVE_DESIRED_OUTCOME_QUESTION
        : realizationDuty === 'inference_testing'
          ? realizeInferenceQuestionStem(parsed?.questionStem)
          : clean(parsed?.question),
      example: clean(parsed?.example),
    }
  }

  const validateFormulation = async (formulation: {
    parsed: any
    providerQuestion: string
    questionStem: string
    question: string
    example: string
  }) => {
    const alignmentCompletion =
      await input.client.chat.completions.create({
        model: input.model,
        ...(input.model.startsWith('gpt-5')
          ? {}
          : { temperature: 0 }),
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `
You validate the authority and realization boundary for one GEORGE signal question.

Required realization duty: ${realizationDuty}
Evidence object: ${evidenceObject}

The semantic classifier has already fixed this duty. Do not reclassify it.
Echo required realizationDuty exactly. If the proposed question violates that
duty, return misaligned while preserving the required duty value.

Determine whether the proposed question semantically acquires exactly the authorized evidence need.

Return aligned only when the question:
- asks for that evidence need and no materially different or broader information;
- asks for a user-owned fact rather than professional reasoning;
- does not reopen another evidence field;
- for direct_desired_outcome, asks openly and non-leadingly without proposing outcomes, choices, confirmation language, or any correction-path alternative;
- for inference_testing, states the inference as a possibility and ends with the exact canonical suffix "${INFERENCE_CORRECTION_SUFFIX}";
- for direct_fact, does not manufacture an inference or correction-path alternative;
- remains concise and conversational, allowing at most one brief context-supported bridge before the question.

Judge the complete grammar. An inference-bearing question is misaligned when a correction phrase has merely been appended to grammar that does not support it naturally, or when anything follows the correction path.

When the evidence object is anticipated_live_interaction and the duty is direct_desired_outcome, proposedQuestion must be exactly "${DIRECT_LIVE_DESIRED_OUTCOME_QUESTION}" The example must be explicitly illustrative presentation guidance, must show a desired result plus useful contextual specificity, and must not merely restate or confirm the broad topic. Plausible illustrative details must not be treated as established evidence.

You may not replace the question or propose another evidence need.

Return JSON only:
{
  "verdict": "aligned" | "misaligned" | "duplicate",
  "realizationDuty": "direct_desired_outcome" | "inference_testing" | "direct_fact",
  "inferencePresentedAsPossibility": true,
  "suggestedOutcomePresent": false,
  "correctionPathAtEnd": true,
  "grammarNatural": true,
  "canonicalQuestionPreserved": true,
  "exampleIllustrative": true,
  "exampleShowsDesiredResult": true,
  "exampleAddsContextualSpecificity": true,
  "exampleMerelyRestatesTopic": false,
  "examplePromotedToEvidence": false,
  "reason": "concise validation reason"
}
            `.trim(),
          },
          {
            role: 'user',
            content: JSON.stringify({
              authorizedEvidenceNeed,
              proposedQuestion: formulation.question,
              proposedQuestionStem:
                formulation.questionStem || null,
              proposedExample: formulation.example || null,
              knownSignal: input.knownSignal ?? null,
            }),
          },
        ],
      })

    const parsed = JSON.parse(
      alignmentCompletion.choices?.[0]?.message?.content || '{}'
    )
    const verdict = clean(parsed?.verdict)
    const alignmentDuty = clean(parsed?.realizationDuty)
    const correctionSuffixCount = inferenceCorrectionSuffixCount(
      formulation.question
    )
    const canonicalInferenceRealization = Boolean(
      formulation.questionStem &&
        formulation.questionStem ===
          normalizeInferenceQuestionStem(formulation.questionStem) &&
        formulation.question ===
          realizeInferenceQuestionStem(formulation.questionStem) &&
        formulation.question.endsWith(INFERENCE_CORRECTION_SUFFIX) &&
        correctionSuffixCount === 1
    )
    const noInferenceSuffix = correctionSuffixCount === 0
    const directLiveQuestionAligned = Boolean(
      !directLiveDesiredOutcome ||
        (
          formulation.question ===
            DIRECT_LIVE_DESIRED_OUTCOME_QUESTION &&
          !formulation.providerQuestion &&
          !formulation.questionStem &&
          parsed?.canonicalQuestionPreserved === true
        )
    )
    const directLiveExampleAligned = Boolean(
      !directLiveDesiredOutcome ||
        (
          formulation.example &&
          parsed?.exampleIllustrative === true &&
          parsed?.exampleShowsDesiredResult === true &&
          parsed?.exampleAddsContextualSpecificity === true &&
          parsed?.exampleMerelyRestatesTopic === false &&
          parsed?.examplePromotedToEvidence === false
        )
    )
    const alignedForDuty =
      realizationDuty === 'direct_desired_outcome'
        ? parsed?.suggestedOutcomePresent === false &&
          noInferenceSuffix &&
          directLiveQuestionAligned &&
          directLiveExampleAligned
        : realizationDuty === 'inference_testing'
          ? parsed?.inferencePresentedAsPossibility === true &&
            parsed?.correctionPathAtEnd === true &&
            !formulation.providerQuestion &&
            canonicalInferenceRealization
          : noInferenceSuffix && !formulation.questionStem

    return {
      aligned: Boolean(
        verdict === 'aligned' &&
          alignmentDuty === realizationDuty &&
          parsed?.grammarNatural === true &&
          alignedForDuty
      ),
      duplicate: verdict === 'duplicate',
      reason: clean(parsed?.reason),
      rawContent:
        alignmentCompletion.choices?.[0]?.message?.content || null,
      verdict,
      correctionSuffixCount,
    }
  }

  let finalFormulation: Awaited<ReturnType<typeof requestFormulation>> | null =
    null
  let finalValidation: Awaited<ReturnType<typeof validateFormulation>> | null =
    null
  let repairContext = ''

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const formulation = await requestFormulation(repairContext)
    finalFormulation = formulation

    console.info('[GEORGE][AUTHORIZED_SIGNAL_QUESTION][FORMULATION]', {
      model: input.model,
      authorizedEvidenceNeed,
      realizationDuty,
      attempt: attempt + 1,
      rawContent: formulation.rawContent,
      parsedStatus: clean(formulation.parsed?.status),
      formulatedQuestion: formulation.question || null,
      providerQuestion: formulation.providerQuestion || null,
      questionStem: formulation.questionStem || null,
      example: formulation.example || null,
    })

    if (
      formulation.parsed?.status !== 'question' ||
      !formulation.question ||
      (directLiveDesiredOutcome && !formulation.example)
    ) {
      repairContext = `
GEORGE AUTHORIZED QUESTION REPAIR

The previous formulation did not return a usable question. Preserve the exact
authorized evidence need and required realization duty. Return one valid
question under the required JSON contract.
      `.trim()
      continue
    }

    const validation = await validateFormulation(formulation)
    finalValidation = validation

    console.info('[GEORGE][AUTHORIZED_SIGNAL_QUESTION][ALIGNMENT]', {
      model: input.model,
      authorizedEvidenceNeed,
      realizationDuty,
      attempt: attempt + 1,
      proposedQuestion: formulation.question,
      rawContent: validation.rawContent,
      verdict: validation.verdict || null,
      aligned: validation.aligned,
      correctionSuffixCount: validation.correctionSuffixCount,
    })

    if (validation.aligned) {
      return {
        status: 'question',
        question: formulation.question,
        label: directLiveDesiredOutcome
          ? 'Desired outcome'
          : clean(formulation.parsed?.label) || 'Additional signal',
        why:
          clean(formulation.parsed?.why) ||
          clean(input.authorizationReason) ||
          'This signal materially improves the strongest next action.',
        example: formulation.example,
        key: directLiveDesiredOutcome
          ? 'desiredOutcome'
          : clean(formulation.parsed?.key) ||
            `signal_${Date.now()}`,
      }
    }

    const repairDutyInstruction =
      directLiveDesiredOutcome
        ? `The canonical question is already fixed as ${JSON.stringify(DIRECT_LIVE_DESIRED_OUTCOME_QUESTION)}. Return null for question and questionStem. Regenerate a contextual illustrative example that shows a desired result plus useful specificity without treating its plausible details as evidence or merely confirming the broad topic.`
        : realizationDuty === 'direct_desired_outcome'
        ? 'Ask directly and non-leadingly. Remove every proposed outcome, option, confirmation frame, and correction-path alternative.'
        : realizationDuty === 'inference_testing'
          ? `Return only a grammatical pre-suffix questionStem that exposes the inference as a possibility. Do not include terminal punctuation or a correction path; canonical realization appends ${JSON.stringify(INFERENCE_CORRECTION_SUFFIX)} exactly once.`
          : 'Ask the direct fact without manufacturing an inference or correction path.'

    repairContext = `
GEORGE AUTHORIZED QUESTION REPAIR

The previous proposed question failed the required realization contract.

Previous question: ${JSON.stringify(formulation.question)}
Validation reason: ${JSON.stringify(validation.reason || 'The question did not satisfy the required realization duty.')}

Repair the formulation. Preserve the exact authorized evidence need.
${repairDutyInstruction}
    `.trim()
  }

  return {
    status: 'unavailable',
    reason:
      finalValidation?.duplicate
        ? 'duplicate_evidence_request'
        : finalFormulation
          ? 'unauthorized_evidence_request'
          : 'question_formulation_unavailable',
  }
}
