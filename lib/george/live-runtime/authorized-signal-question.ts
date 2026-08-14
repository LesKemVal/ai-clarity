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

export async function formulateAuthorizedSignalQuestion(input: {
  client: OpenAI
  model: string
  authorizedEvidenceNeed: string
  authorizationReason?: string | null
  knownSignal?: unknown
}): Promise<AuthorizedSignalQuestionResult> {
  const authorizedEvidenceNeed = clean(input.authorizedEvidenceNeed)

  if (!authorizedEvidenceNeed) {
    return {
      status: 'unavailable',
      reason: 'question_formulation_unavailable',
    }
  }

  const formulationCompletion =
    await input.client.chat.completions.create({
      model: input.model,
      ...(input.model.startsWith('gpt-5')
        ? {}
        : { temperature: 0.25 }),
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `
You are GEORGE's authorized signal-question formulation owner.

Canonical Operational Judgment has already determined that one user interruption is warranted and has authorized exactly one evidence need.

Your authority is limited to formulating the strongest concise question that acquires that exact evidence need from the user.

Rules:
- Do not decide whether another question should be asked; that decision has already been made.
- Do not select, substitute, broaden, narrow, or reopen another evidence gap.
- Do not ask for role, audience, interaction, background, or any other field unless it is the authorized evidence need.
- Use the accumulated evidence and history to phrase the question naturally and avoid repetition.
- Ask for the underlying user-owned fact, not professional reasoning GEORGE should perform.
- Do not formulate a domain questionnaire or a future sequence.
- If the exact evidence need is already answered semantically or cannot responsibly be acquired from the user, return unavailable instead of choosing another need.
- The example must be one concise plausible answer, not an instruction or checklist.

Return JSON only:
{
  "status": "question" | "unavailable",
  "question": "one question that acquires exactly the authorized evidence",
  "label": "short presentation label",
  "why": "why the authorized evidence matters to the operational decision",
  "example": "one concise plausible user answer",
  "key": "stable semantic key"
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
            knownSignal: input.knownSignal ?? null,
          }),
        },
      ],
    })

  const formulationParsed = JSON.parse(
    formulationCompletion.choices?.[0]?.message?.content || '{}'
  )

  const formulatedQuestion = clean(formulationParsed?.question)

  console.info('[GEORGE][AUTHORIZED_SIGNAL_QUESTION][FORMULATION]', {
    model: input.model,
    authorizedEvidenceNeed,
    rawContent:
      formulationCompletion.choices?.[0]?.message?.content || null,
    parsedStatus: clean(formulationParsed?.status),
    formulatedQuestion: formulatedQuestion || null,
  })

  if (
    formulationParsed?.status !== 'question' ||
    !formulatedQuestion
  ) {
    return {
      status: 'unavailable',
      reason: 'question_formulation_unavailable',
    }
  }

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
You validate the authority boundary for one GEORGE signal question.

Determine whether the proposed question semantically acquires exactly the authorized evidence need.

Return aligned only when the question:
- asks for that evidence need and no materially different or broader information;
- asks for a user-owned fact rather than professional reasoning;
- does not reopen another evidence field.

You may not replace the question or propose another evidence need.

Return JSON only:
{
  "verdict": "aligned" | "misaligned" | "duplicate"
}
          `.trim(),
        },
        {
          role: 'user',
          content: JSON.stringify({
            authorizedEvidenceNeed,
            proposedQuestion: formulatedQuestion,
            knownSignal: input.knownSignal ?? null,
          }),
        },
      ],
    })

  const alignmentParsed = JSON.parse(
    alignmentCompletion.choices?.[0]?.message?.content || '{}'
  )

  const verdict = clean(alignmentParsed?.verdict)

  console.info('[GEORGE][AUTHORIZED_SIGNAL_QUESTION][ALIGNMENT]', {
    model: input.model,
    authorizedEvidenceNeed,
    proposedQuestion: formulatedQuestion,
    rawContent:
      alignmentCompletion.choices?.[0]?.message?.content || null,
    verdict: verdict || null,
  })

  if (verdict !== 'aligned') {
    return {
      status: 'unavailable',
      reason:
        verdict === 'duplicate'
          ? 'duplicate_evidence_request'
          : 'unauthorized_evidence_request',
    }
  }

  return {
    status: 'question',
    question: formulatedQuestion,
    label: clean(formulationParsed?.label) || 'Additional signal',
    why:
      clean(formulationParsed?.why) ||
      clean(input.authorizationReason) ||
      'This signal materially improves the strongest next action.',
    example: clean(formulationParsed?.example),
    key:
      clean(formulationParsed?.key) ||
      `signal_${Date.now()}`,
  }
}
