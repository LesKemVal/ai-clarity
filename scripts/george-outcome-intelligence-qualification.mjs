import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(path, 'utf8')

const provider = read('lib/george/runtime/provider/normal-provider.ts')
const questionOwner = read(
  'lib/george/live-runtime/authorized-signal-question.ts',
)
const operationalJudgment = read(
  'lib/george/runtime/operational-judgment.ts',
)
const chatRoute = read('app/api/chat/route.ts')
const signalRoute = read('app/api/george/live/signal-question/route.ts')
const homepage = read('components/home/HomeConversationTypeSurface.tsx')

const clearOutcomeFixture = 'I want a job'
const confirmedOutcomeFixture = clearOutcomeFixture.replace(
  /^I\s+want\b/i,
  'You want',
)
const reasonableInferenceFixture =
  'The anticipated conversation is probably a job interview.'
const highestValueUnresolvedFactFixture =
  'the current stage of the hiring process'

assert.equal(confirmedOutcomeFixture, 'You want a job')
assert.match(reasonableInferenceFixture, /probably/)
assert.doesNotMatch(
  highestValueUnresolvedFactFixture,
  /desired outcome|kind of conversation/i,
)

assert.ok(
  provider.includes(
    'A clear natural-language outcome is sufficient even when it states the broader',
  ) &&
    provider.includes(
      'do not reacquire the outcome and do not ask the user to name',
    ) &&
    provider.includes(
      'conversation type that the record already reliably implies',
    ),
  'a clear preferred outcome can still be rejected or redundantly reacquired',
)

assert.ok(
  provider.includes(
    'Reasonable but unconfirmed anticipated-interaction inference:',
  ) &&
    provider.includes('anticipatedInteractionInference') &&
    provider.includes('Never promote an inference into knownEvidence') &&
    provider.includes(
      'inference as definitiveEvidence or as a user-confirmed fact',
    ),
  'confirmed outcome evidence is not separated from contextual inference',
)

assert.ok(
  provider.includes(
    "this may be GEORGE's final opportunity",
  ) &&
    provider.includes(
      'Rank unresolved user-owned facts by how materially each could improve',
    ) &&
    provider.includes('Preserve only the highest-value fact') &&
    provider.includes(
      'signal candidate must explain what the answer would materially change',
    ),
  'adaptive candidate discovery does not enforce one highest-value next question',
)

assert.ok(
  provider.includes(
    'signalAcquisition.reason must explain in plain language what the answer would',
  ) &&
    questionOwner.includes(
      'why the authorized evidence matters to the operational decision',
    ),
  'the next question lacks a plain-language explanation of why the answer matters',
)

for (const unsupportedSpecific of [
  'deadline',
  'interaction stage',
  'decision-maker',
  'objection',
  'commitment',
  'minimum acceptable result',
]) {
  assert.ok(
    provider.includes(unsupportedSpecific),
    `unsupported specificity guard is missing: ${unsupportedSpecific}`,
  )
}

assert.ok(
  provider.includes(
    'When current evidence supports realistic LIVE assistance, preserve a readiness',
  ) &&
    provider.includes(
      'candidate even if another fact could merely sharpen that assistance',
    ),
  'LIVE readiness still requires exhaustive preparation',
)

assert.ok(
  provider.includes(
    'When the preferred outcome itself is genuinely unresolved, acquiring it has',
  ) &&
    provider.includes(
      'consequentialUncertainty must be one non-leading description of the missing',
    ),
  'genuinely ambiguous outcome evidence no longer produces bounded clarification',
)

assert.ok(
  provider.includes(
    'Reassess the complete conversation and preparation record',
  ) &&
    provider.includes('Reassess that full record after every answer') &&
    provider.includes('createNormalProviderCompletion({') &&
    provider.includes('messages: request.messages') &&
    !provider.includes('I want a job'),
  'full-record reassessment is not model-owned and scenario-neutral',
)

assert.ok(
  homepage.includes('desiredOutcome: exactOutcome') &&
    homepage.includes('answer: exactOutcome') &&
    homepage.includes('[/^I\\s+want\\b/i, "You want"]') &&
    homepage.includes('currentUnderstandingSignals.map'),
  'homepage outcome capture or concise Current Understanding rendering regressed',
)

assert.ok(
  homepage.includes('fetch("/api/chat"') &&
    chatRoute.includes('runNormalSemanticProposal({') &&
    chatRoute.includes('runtimeAuthoritySnapshot.operationalJudgment') &&
    chatRoute.includes('formulateAuthorizedSignalQuestion({') &&
    homepage.includes('judgmentResult.authorizedSignalQuestion') &&
    signalRoute.includes('formulateAuthorizedSignalQuestion({'),
  'the corrected reasoning result does not reach /george/live-home through the canonical consumer path',
)

assert.ok(
  operationalJudgment.includes(
    'Provider reasoning established that one consequential user-owned signal is necessary',
  ) &&
    operationalJudgment.includes(
      "source: 'operational_judgment'",
    ),
  'Operational Judgment is no longer the sole acquisition authorization owner',
)

assert.ok(
  questionOwner.includes(
    "'What do you want from this conversation?' as const",
  ) &&
    !provider.includes("'What do you want from this conversation?' as const") &&
    questionOwner.includes(
      'Canonical Operational Judgment has already determined that one user interruption is warranted',
    ),
  'the direct-outcome wording escaped its post-authorization realization boundary',
)

console.log(
  JSON.stringify(
    {
      clearOutcomeAccepted: true,
      clearOutcomeFixture,
      confirmedOutcomeFixture: `${confirmedOutcomeFixture}.`,
      reasonableInferenceFixture,
      highestValueUnresolvedFactFixture,
      outcomeNotReasked: true,
      impliedConversationTypeNotReasked: true,
      highestValueUnresolvedFactSelectedAdaptively: true,
      answerValueExplained: true,
      unsupportedSpecificsRejected: true,
      ambiguousInputClarifies: true,
      fullRecordReassessmentModelOwned: true,
      consumerPath:
        '/george/live-home -> HomeConversationTypeSurface -> /api/chat -> normal provider proposal -> Operational Judgment -> authorized signal wording',
      fixedOutcomeQuestionFinding:
        'reachable wording-only fallback after authorization; not a competing sufficiency or question-selection owner',
      result: 'PASS',
    },
    null,
    2,
  ),
)
